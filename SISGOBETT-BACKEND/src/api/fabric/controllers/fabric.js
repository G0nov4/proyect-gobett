'use strict';

/**
 * fabric controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::fabric.fabric', ({ strapi }) => ({
  async create(ctx) {
    try {
      const data = ctx.request.body.data;
      
      if (!data) {
        return ctx.badRequest('No se proporcionaron datos.');
      }

      const {
        name,
        code,
        description,
        arrive_date,
        height,
        weight,
        cost,
        retail_price,
        wholesale_price,
        wholesale_price_assorted,
        price_per_roll,
        price_per_roll_assorted,
        colors,
        categories,
        supplier,
        fabric_images
      } = data;

      // Validar datos requeridos de la tela
      if (!name || !code || !cost) {
        return ctx.badRequest('Los campos nombre, código y costo son obligatorios.');
      }

      let tela;
      try {
        // Crea la tela
        tela = await strapi.entityService.create('api::fabric.fabric', {
          data: {
            name,
            code,
            description,
            arrive_date,
            height,
            weight,
            cost,
            retail_price,
            wholesale_price,
            wholesale_price_assorted,
            price_per_roll,
            price_per_roll_assorted,
            categories,
            supplier,
            fabric_images,
            publishedAt: new Date(),
            availability_status: true,
          }
        });
      } catch (error) {
        console.error('Error al crear la tela:', error);
        return ctx.badRequest('No se pudo crear la tela. Por favor, verifique los datos.');
      }

      // Solo proceder con colores si la tela se creó exitosamente
      if (tela && tela.id && colors && Array.isArray(colors)) {
        for (const color of colors) {
          // Validar datos requeridos del color
          if (!color.name || !color.code) {
            continue;
          }

          let newColor;
          try {
            newColor = await strapi.entityService.create('api::color.color', {
              data: {
                name: color.name,
                code: color.code,
                color: color.color,
                fabric: tela.id,
                publishedAt: new Date(),
              }
            });

            // Buscar los rollos correspondientes a este color
            const colorRolls = rolls.filter(roll => 
              roll.color === color.color && roll.color_name === color.name
            );

            // Crear los rollos para este color
            if (newColor && newColor.id && colorRolls.length > 0) {
              for (let i = 0; i < colorRolls.length; i++) {
                const rollo = colorRolls[i];
                
                if (!rollo.roll_footage || !rollo.unit || !rollo.warehouse) {
                  console.error('Datos faltantes para el rollo:', rollo);
                  continue;
                }

                try {
                  // Validar que el warehouse existe
                  const warehouseExists = await strapi.db.query('api::warehouse.warehouse').findOne({
                    where: { id: rollo.warehouse }
                  });

                  if (!warehouseExists) {
                    console.error(`Warehouse con ID ${rollo.warehouse} no existe`);
                    continue;
                  }

                  await strapi.entityService.create('api::roll.roll', {
                    data: {
                      roll_footage: rollo.roll_footage,
                      status: rollo.status || "DISPONIBLE",
                      unit: rollo.unit,
                      color: newColor.id,
                      fabric: tela.id,
                      warehouse: rollo.warehouse,
                      code: `${tela.code}-${color.code}-${i + 1}`,
                      publishedAt: new Date(),
                    }
                  });
                } catch (error) {
                  console.error(`Error al crear el rollo para el color ${newColor.name}:`, error);
                  continue
                }
              }
            }
          } catch (error) {
            console.error(`Error al crear el color ${color.name}:`, error);
            continue;
          }
        }
      }

      // Obtener la tela actualizada con todas sus relaciones
      const telaCompleta = await strapi.entityService.findOne('api::fabric.fabric', tela.id, {
        populate: ['colors', 'rolls']
      });

      return { data: telaCompleta };
    } catch (error) {
      console.error('Error general en la creación:', error);
      return ctx.badRequest('Ocurrió un error durante el proceso de creación.');
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const { rolls, colors, ...fabricData } = data;

      // Paso 1: Actualizar la tela principal
      let updatedFabric;
      try {
        updatedFabric = await strapi.entityService.update('api::fabric.fabric', id, {
          data: fabricData
        });
        if (!updatedFabric) throw new Error('No se pudo actualizar la tela');
      } catch (error) {
        console.error('Error al actualizar la tela:', error);
        return ctx.badRequest('Error al actualizar la información principal de la tela');
      }

      // Paso 2: Procesar colores
      let processedColors = [];
      if (colors && Array.isArray(colors)) {
        try {
          processedColors = await Promise.all(
            colors.map(async color => {
              if (color.id) {
                return await strapi.db.query('api::color.color').update({
                  where: { id: color.id },
                  data: {
                    name: color.name,
                    code: color.code,
                    color: color.color,
                    fabric: id
                  }
                });
              } else {
                return await strapi.entityService.create('api::color.color', {
                  data: {
                    name: color.name,
                    code: color.code,
                    color: color.color,
                    fabric: id,
                    publishedAt: new Date()
                  }
                });
              }
            })
          );
          if (!processedColors.length) throw new Error('No se procesaron los colores');
        } catch (error) {
          console.error('Error al procesar los colores:', error);
          return ctx.badRequest('Error al actualizar/crear los colores');
        }
      }

      // Paso 3: Procesar rollos
      if (rolls && Array.isArray(rolls)) {
        try {
          // Obtener el último número de secuencia para cada color
          const lastRollNumbers = {};
          const existingRolls = await strapi.db.query('api::roll.roll').findMany({
            where: { fabric: id },
            orderBy: { code: 'desc' }
          });

          // Inicializar contadores para cada color
          colors.forEach(color => {
            const colorRolls = existingRolls.filter(roll => 
              roll.code.startsWith(`${updatedFabric.code}-${color.code}-`)
            );
            if (colorRolls.length > 0) {
              const lastNumber = parseInt(colorRolls[0].code.split('-').pop());
              lastRollNumbers[color.code] = lastNumber;
            } else {
              lastRollNumbers[color.code] = 0;
            }
          });

          await Promise.all(
            rolls.map(async (roll) => {
              const colorCode = colors.find(c => c.id === roll.color.id)?.code;
              if (!colorCode) {
                throw new Error('Código de color no encontrado');
              }


              // Incrementar el contador para este color
              lastRollNumbers[colorCode] = (lastRollNumbers[colorCode] || 0) + 1;
              const newRollCode = `${updatedFabric.code}-${colorCode}-${lastRollNumbers[colorCode]}`;

              if (roll.id) {
                // Actualizar rollo existente
                return strapi.db.query('api::roll.roll').update({
                  where: { id: roll.id },
                  data: {
                    roll_footage: roll.roll_footage,
                    status: roll.status,
                    unit: roll.unit,
                    color: roll.color.id,
                    fabric: id,
                  }
                });
              } else {
                // Crear nuevo rollo
                return strapi.entityService.create('api::roll.roll', {
                  data: {
                    roll_footage: roll.roll_footage,
                    status: roll.status || "DISPONIBLE",
                    unit: roll.unit,
                    code: newRollCode,
                    color: roll.color.id,
                    fabric: id,
                    publishedAt: new Date()
                  }
                });
              }
            })
          );
        } catch (error) {
          console.error('Error al procesar los rollos:', error);
          return ctx.badRequest(`Error al actualizar/crear los rollos: ${error.message}`);
        }
      }

      // Obtenemos la tela actualizada con todas sus relaciones
      const updatedTela = await strapi.entityService.findOne('api::fabric.fabric', id, {
        populate: ['colors', 'rolls', 'fabric_images', 'categories', 'supplier']
      });

      return { data: updatedTela };
    } catch (error) {
      console.error('Error al actualizar la tela:', error);
      return ctx.badRequest('No se pudo actualizar la tela y sus relaciones.');
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      // Verificar si la tela existe
      const fabric = await strapi.entityService.findOne('api::fabric.fabric', id, {
        populate: ['colors', 'rolls', 'fabric_images']
      });

      if (!fabric) {
        return ctx.notFound('Tela no encontrada');
      }

      // 1. Eliminar todos los rollos asociados
      if (fabric.rolls && fabric.rolls.length > 0) {
        const rollIds = fabric.rolls.map(roll => roll.id);
        await strapi.db.query('api::roll.roll').delete({
          where: {
            id: {
              $in: rollIds
            }
          }
        });
      }

      // 2. Eliminar todos los colores asociados
      if (fabric.colors && fabric.colors.length > 0) {
        const colorIds = fabric.colors.map(color => color.id);
        await strapi.db.query('api::color.color').delete({
          where: {
            id: {
              $in: colorIds
            }
          }
        });
      }

      // 3. Eliminar la relación con las imágenes
      if (fabric.fabric_images && fabric.fabric_images.length > 0) {
        await strapi.entityService.update('api::fabric.fabric', id, {
          data: {
            fabric_images: []
          }
        });
      }

      // 4. Finalmente eliminar la tela
      const deletedFabric = await strapi.entityService.delete('api::fabric.fabric', id);

      return {
        data: deletedFabric
      };

    } catch (error) {
      console.error('Error al eliminar la tela y sus relaciones:', error);
      return ctx.badRequest('No se pudo eliminar la tela y sus relaciones.');
    }
  }
}));
