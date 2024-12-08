'use strict';

/**
 * Servicios para el módulo de ventas
 */

const createSaleRecord = async (strapi, saleData) => {
  console.log('📝 Creando registro de venta...', saleData);
  
  // Transformar el detalle al formato del componente
  const formattedDetail = saleData.detail.map(item => ({
    fabric: item.fabricId || null,
    unit_price: parseFloat(item.unitPrice),
    quantity_meterage: parseFloat(item.quantity),
    sales_unit: item.saleType,
    color: item.colorId,
    roll_code: item.rollCode || null,
    cuts: parseInt(item.cuts) || 1
  }));

  // Crear la venta con el formato correcto
  return await strapi.entityService.create('api::sale.sale', {
    data: {
      ...saleData,
      detail: formattedDetail
    }
  });
};

const updateInventory = async (strapi, details, sales_type) => {
  console.log('🔄 Actualizando inventario...');
  
  for (const item of details) {
    // Agregar el tipo de venta a cada item
    const itemWithSaleType = {
      ...item,
      sales_type
    };

    if (item.saleType === 'POR ROLLO') {
      await updateRollInventory(strapi, itemWithSaleType);
    } else {
      await updateMeterInventory(strapi, itemWithSaleType);
    }
  }
};

const updateRollInventory = async (strapi, item) => {
  console.log('🔄 Actualizando rollo:', item.rollId);
  
  // Buscar el rollo
  const roll = await strapi.entityService.findOne('api::roll.roll', item.rollId, {
    populate: ['status']
  });
  
  if (!roll) {
    throw new Error(`Rollo no encontrado: ${item.rollId}`);
  }

  // Determinar el nuevo estado según el tipo de venta
  let newStatus;
  if (item.sales_type === 'PEDIDO') {
    newStatus = 'RESERVADO';
    console.log(`📦 Rollo ${item.rollId} marcado como RESERVADO`);
  } else {
    newStatus = 'NO DISPONIBLE';
    console.log(`📦 Rollo ${item.rollId} marcado como NO_DISPONIBLE`);
  }

  // Actualizar el rollo
  await strapi.entityService.update('api::roll.roll', item.rollId, {
    data: {
      status: newStatus,
      quantity: item.quantity, // Actualizar cantidad si es necesario
      publishedAt: new Date()
    }
  });
};

const updateMeterInventory = async (strapi, item) => {
  console.log('📏 Actualizando inventario por metros:', item);
  
  // Aquí puedes implementar la lógica específica para ventas por metro
  // Por ejemplo, actualizar el stock disponible en metros de la tela
};

/**
 * Revierte los cambios en el inventario
 * @param {Object} strapi - Instancia de Strapi
 * @param {Array} details - Detalles de la venta a revertir
 */
const revertInventoryChanges = async (strapi, details) => {
  console.log('🔄 Revirtiendo cambios de inventario...');
  
  for (const item of details) {
    if (item.isRoll) {
      await revertRollInventory(strapi, item);
    } else {
      await revertMeterInventory(strapi, item);
    }
  }
};

const revertRollInventory = async (strapi, item) => {
  const roll = await strapi.entityService.findOne('api::roll.roll', item.rollId);
  
  if (!roll) {
    throw new Error(`Rollo no encontrado: ${item.rollId}`);
  }

  await strapi.entityService.update('api::roll.roll', item.rollId, {
    data: {
      stock: roll.stock + item.quantity
    }
  });
};

const revertMeterInventory = async (strapi, item) => {
  // Implementar lógica para revertir inventario por metros
};

/**
 * Valida si una venta puede ser eliminada
 * @param {Object} sale - Venta a validar
 */
const validateDeletion = async (sale) => {
  // Ejemplo de validación: solo permitir eliminar ventas del mismo día
  const saleDate = new Date(sale.created_at);
  const today = new Date();
  
  if (saleDate.toDateString() !== today.toDateString()) {
    return {
      allowed: false,
      reason: 'Solo se pueden eliminar ventas del día actual'
    };
  }

  // Agregar más validaciones según necesidades del negocio
  
  return {
    allowed: true
  };
};

const createPaymentRecord = async (strapi, paymentData) => {
  console.log('💰 Creando registro de pago...', paymentData);

  try {
    const payment = await strapi.entityService.create('api::payment.payment', {
      data: {
        amount: paymentData.amount,
        change: paymentData.change,
        payment_date: new Date(paymentData.payment_date),
        sale: paymentData.sale, // Relación con la venta
        publishedAt: new Date()
      }
    });

    return payment;
  } catch (error) {
    console.error('❌ Error al crear pago:', error);
    throw new Error('Error al registrar el pago: ' + error.message);
  }
};

module.exports = {
  createSaleRecord,
  updateInventory,
  revertInventoryChanges,
  validateDeletion,
  createPaymentRecord
}; 