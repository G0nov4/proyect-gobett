module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/users/operators',
      handler: 'user.getOperators',
      config: {
        middlewares: [],
        policies: [],
        auth: false
      }
    },
    {
      method: 'PUT',
      path: '/users/operators/:id',
      handler: 'user.updateOperator',
      config: {
        middlewares: [],
        policies: [],
        auth: false
      }
    },
    {
      method: 'DELETE',
      path: '/users/operators/:id',
      handler: 'user.blockOperator',
      config: {
        middlewares: [],
        policies: [],
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/users/operators',
      handler: 'user.createOperator',
      config: {
        middlewares: [],
        policies: [],
        auth: false
      }
    }
  ]
}; 