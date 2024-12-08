'use strict';

/**
 * Validadores y utilidades para el módulo de ventas
 */

// Asegúrate de que las funciones sean exportadas correctamente
module.exports = {
  validateSaleData: async (data) => {
    const errors = [];
    
    // Validaciones básicas
    if (!data.detail || !Array.isArray(data.detail)) {
      errors.push('El detalle de la venta es requerido');
    }

    if (!['EN TIENDA', 'EN DOMICILIO', 'LUGAR ESPECIFICO'].includes(data.delivery)) {
      errors.push('Tipo de entrega inválido');
    }

    if (!['PEDIDO', 'VENTA'].includes(data.sales_type)) {
      errors.push('Tipo de venta inválido');
    }
    
    // Validar caja de ventas
    if (!data.sales_box) {
      errors.push('La caja de ventas es requerida');
    }

    // Validar detalles
    if (data.detail) {
      data.detail.forEach((item, index) => {
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors.push(`Cantidad inválida en ítem ${index + 1}`);
        }
        if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) {
          errors.push(`Precio unitario inválido en ítem ${index + 1}`);
        }
        if (!['POR METRO', 'POR ROLLO'].includes(item.saleType)) {
          errors.push(`Tipo de venta inválido en ítem ${index + 1}`);
        }
        if (!item.colorId) {
          errors.push(`Color no especificado en ítem ${index + 1}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  calculateTotals: (details) => {
    return details.reduce((acc, item) => ({
      total: acc.total + (parseFloat(item.quantity) * parseFloat(item.unitPrice)),
      items: acc.items + 1
    }), { total: 0, items: 0 });
  },

  processDetails: async (details) => {
    return details.map(item => ({
      ...item,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      totalPrice: parseFloat(item.quantity) * parseFloat(item.unitPrice)
    }));
  },

  validatePaymentData: async (payment) => {
    const errors = [];

    if (!payment) {
      errors.push('Los datos de pago son requeridos');
      return { isValid: false, errors };
    }

    if (typeof payment.amount !== 'number' || payment.amount <= 0) {
      errors.push('El monto del pago debe ser un número positivo');
    }
    if (!payment.payment_date) {
      errors.push('La fecha de pago es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}; 