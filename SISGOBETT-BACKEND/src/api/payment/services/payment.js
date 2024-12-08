'use strict';

/**
 * payment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::payment.payment', ({ strapi }) => ({
  async createPayment({ amount, date, order }) {
    // Obtener la orden para validar el monto
    const orderData = await strapi.entityService.findOne('api::order.order', order, {
      populate: ['payments']
    });

    if (!orderData) {
      throw new Error('Orden no encontrada');
    }

    // Calcular el total de pagos existentes
    const existingPaymentsTotal = orderData.payments?.reduce((sum, payment) => 
      sum + Number(payment.amount), 0) || 0;

    // Validar que el nuevo pago no exceda el subtotal
    const totalWithNewPayment = existingPaymentsTotal + Number(amount);
    if (totalWithNewPayment > Number(orderData.subtotal)) {
      throw new Error('El monto total de pagos excedería el subtotal de la orden');
    }

    // Crear el pago
    const payment = await strapi.entityService.create('api::payment.payment', {
      data: {
        amount,
        payment_date: date,
        order,
        publishedAt: new Date()
      }
    });

    return payment;
  }
}));
