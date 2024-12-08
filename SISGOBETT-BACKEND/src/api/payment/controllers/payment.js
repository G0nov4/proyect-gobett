'use strict';

/**
 * payment controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::payment.payment', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { amount, payment_date, notes, sale } = ctx.request.body.data;

      // Validaciones básicas
      if (!amount || amount <= 0) {
        return ctx.badRequest('El monto debe ser mayor a 0');
      }

      if (!sale) {
        return ctx.badRequest('La venta es requerida');
      }

      // Obtener la venta primero para validar
      const saleEntity = await strapi.entityService.findOne('api::sale.sale', sale, {
        populate: ['payments', 'detail']
      });

      if (!saleEntity) {
        return ctx.badRequest('Venta no encontrada');
      }

      // Calcular el total de la venta
      const saleTotal = saleEntity.detail.reduce((sum, item) => 
        sum + (Number(item.unit_price) * Number(item.quantity_meterage)), 0);

      // Calcular total de pagos existentes
      const existingPayments = saleEntity.payments?.reduce((sum, payment) => 
        sum + Number(payment.amount), 0) || 0;

      // Calcular el saldo pendiente
      const remainingAmount = saleTotal - existingPayments;
      
      // Si el monto excede el saldo pendiente, ajustarlo al saldo restante
      const finalAmount = amount > remainingAmount ? remainingAmount : amount;

      // Crear el pago con el monto ajustado
      const payment = await strapi.entityService.create('api::payment.payment', {
        data: {
          amount: finalAmount,
          payment_date: payment_date || new Date(),
          notes: amount > remainingAmount 
            ? `${notes || ''} (Monto ajustado de ${amount} a ${finalAmount} por exceder saldo pendiente)`
            : notes,
          sale,
          publishedAt: new Date()
        }
      });

      // Actualizar estado de la venta si se completó el pago
      if (existingPayments + finalAmount >= saleTotal) {
        await strapi.entityService.update('api::sale.sale', sale, {
          data: {
            status: 'COMPLETADO',
            publishedAt: new Date()
          }
        });
      }

      return { 
        data: payment,
        meta: {
          originalAmount: amount,
          adjustedAmount: finalAmount,
          totalPaid: existingPayments + finalAmount,
          saleTotal,
          remainingAmount: saleTotal - (existingPayments + finalAmount),
          wasAdjusted: amount > remainingAmount
        }
      };

    } catch (error) {
      console.error('Error al crear el pago:', error);
      return ctx.badRequest(error.message);
    }
  }
}));
