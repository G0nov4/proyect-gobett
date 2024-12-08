'use strict';

/**
 * Controlador de ventas personalizado
 */

const { createCoreController } = require('@strapi/strapi').factories;

// Importar correctamente las utilidades y validadores
const validators = require('../utils/saleValidators');
const {
  validateSaleData,
  calculateTotals,
  processDetails
} = validators;

// Servicios
const {
  createSaleRecord,
  updateInventory,
  revertInventoryChanges,
  validateDeletion,
  createPaymentRecord
} = require('../services/saleService');

module.exports = createCoreController('api::sale.sale', ({ strapi }) => ({
  
  /**
   * Crear nueva venta
   * @param {Object} ctx - Contexto de Koa
   */
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      console.log('📦 Datos recibidos:', { data });

      // Validar datos de entrada
      const validationResult = await validateSaleData(data);
      if (!validationResult.isValid) {
        return ctx.badRequest('Datos de venta inválidos', validationResult.errors);
      }

      // Validar datos del pago
      const paymentValidation = await validators.validatePaymentData(data.payment);
      if (!paymentValidation.isValid) {
        return ctx.badRequest('Datos de pago inválidos', paymentValidation.errors);
      }

      // Procesar detalles y calcular totales
      const processedDetails = await processDetails(data.detail);

      // Crear registro de venta
      const saleData = {
        delivery: data.delivery,
        status: data.status,
        client: data.client_id,
        sales_box: data.sales_box,
        detail: processedDetails,
        promo: data.promo || null,
        sales_type: data.sales_type,
        address: data.address,
        delivery_date: data.delivery_date,
        branch: data.branch,
        publishedAt: new Date()
      };

      const sale = await createSaleRecord(strapi, saleData);
      console.log('✅ Venta creada:', sale.id);

      // Crear registro de pago
      const paymentRecord = await createPaymentRecord(strapi, {
        ...data.payment,
        sale: sale.id
      });
      console.log('💰 Pago registrado:', paymentRecord.id);

      // Actualizar inventario pasando el tipo de venta
      await updateInventory(strapi, processedDetails, data.sales_type);
      
      return { success: true, data: sale };

    } catch (error) {
      console.error('❌ Error al crear venta:', error);
      return ctx.badRequest('Error al procesar la venta', error);
    }
  },

  /**
   * Actualizar venta existente
   * @param {Object} ctx - Contexto de Koa
   */
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { body } = ctx.request;
      console.log('📝 Actualizando venta:', id, body);

      // Obtener venta existente
      const existingSale = await strapi.entityService.findOne('api::sale.sale', id);
      if (!existingSale) {
        return ctx.notFound('Venta no encontrada');
      }

      // Validar datos de actualización
      const validationResult = await validateSaleData(body);
      if (!validationResult.isValid) {
        return ctx.badRequest('Datos de actualización inválidos', validationResult.errors);
      }

      // Procesar detalles y calcular nuevos totales
      const processedDetails = await processDetails(body.detail);
      const totals = calculateTotals(processedDetails);

      // Verificar total
      if (totals.total !== body.total_sale) {
        return ctx.badRequest('El total calculado no coincide con el total enviado');
      }

      // Revertir cambios de inventario anteriores
      await revertInventoryChanges(strapi, existingSale.detail);
      console.log('↩️ Cambios de inventario revertidos');

      // Actualizar venta
      const updatedSale = await strapi.entityService.update('api::sale.sale', id, {
        data: {
          ...body,
          detail: processedDetails,
          updated_by: ctx.state.user.id,
          updated_at: new Date(),
          publishedAt: new Date()
        }
      });
      console.log('✅ Venta actualizada:', id);

      // Actualizar nuevo inventario
      await updateInventory(strapi, processedDetails);

      return { success: true, data: updatedSale };

    } catch (error) {
      console.error('❌ Error al actualizar venta:', error);
      return ctx.badRequest('Error al actualizar la venta', error);
    }
  },

  /**
   * Eliminar venta
   * @param {Object} ctx - Contexto de Koa
   */
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      console.log('🗑️ Eliminando venta:', id);

      // Obtener venta
      const sale = await strapi.entityService.findOne('api::sale.sale', id);
      if (!sale) {
        return ctx.notFound('Venta no encontrada');
      }

      // Verificar si la venta puede ser eliminada (ejemplo: ventas recientes)
      const canDelete = await validateDeletion(sale);
      if (!canDelete.allowed) {
        return ctx.badRequest('No se puede eliminar la venta', canDelete.reason);
      }

      // Revertir cambios de inventario
      await revertInventoryChanges(strapi, sale.detail);
      console.log('↩️ Inventario restaurado');

      // Eliminar venta
      await strapi.entityService.delete('api::sale.sale', id);
      console.log('✅ Venta eliminada:', id);

      return { success: true, message: 'Venta eliminada correctamente' };

    } catch (error) {
      console.error('❌ Error al eliminar venta:', error);
      return ctx.badRequest('Error al eliminar la venta', error);
    }
  },

  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body.data;

      console.log('📝 Actualizando estado de venta:', id, status);
      
      // Validar que el estado sea uno de los permitidos
      const validStates = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];
      if (!validStates.includes(status)) {
        return ctx.badRequest('El estado debe ser PENDIENTE, COMPLETADO o CANCELADO');
      }

      // Obtener la venta con sus pagos y detalles
      const sale = await strapi.entityService.findOne('api::sale.sale', id, {
        populate: ['payments', 'detail']
      });

      if (!sale) {
        return ctx.notFound('Venta no encontrada');
      }

      // Calcular el total de la venta
      const saleTotal = sale.detail.reduce((sum, item) => 
        sum + (Number(item.unit_price) * Number(item.quantity_meterage)), 0);

      // Calcular total de pagos
      const totalPaid = sale.payments?.reduce((sum, payment) => 
        sum + Number(payment.amount), 0) || 0;

      // Solo permitir marcar como completada si está totalmente pagada
      if (status === 'COMPLETADO' && totalPaid < saleTotal) {
        return ctx.badRequest('No se puede marcar como completada. La venta tiene pagos pendientes.');
      }

      // Actualizar el estado
      const updatedSale = await strapi.entityService.update('api::sale.sale', id, {
        data: {
          status,
          publishedAt: new Date()
        }
      });

      return {
        data: updatedSale,
        meta: {
          totalVenta: saleTotal,
          totalPagado: totalPaid,
          saldoPendiente: saleTotal - totalPaid
        }
      };

    } catch (error) {
      console.error('Error al actualizar estado de venta:', error);
      return ctx.badRequest('Error al actualizar el estado de la venta');
    }
  }

}));
