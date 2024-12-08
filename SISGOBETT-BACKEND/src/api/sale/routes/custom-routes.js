module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/sales/:id/status',
      handler: 'sale.updateStatus',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['api::sale.sale.update']
        }
      }
    }
  ]
}; 