'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async getOperators(ctx) {
    try {


      // Primero, obtener el rol de operador de venta
      const operadorRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { 
          name: 'operador de venta' // Asegúrate que este sea el nombre exacto del rol
        }
      });

      if (!operadorRole) {
        return ctx.notFound('Rol de operador de venta no encontrado');
      }

      // Buscar usuarios con rol de operador de venta
      const operators = await strapi.query('plugin::users-permissions.user').findMany({
        where: {
          role: operadorRole.id,
          blocked: false
        },
        select: [
          'id', 
          'username', 
          'email', 
          'complete_name', 
          'phone',
          'ci'
        ],
        populate: ['role']
      });

      return {
        data: operators,
        meta: {
          total: operators.length
        }
      };

    } catch (error) {
      console.error('Error al obtener operadores:', error);
      return ctx.badRequest('Error al obtener la lista de operadores');
    }
  },

  async updateOperator(ctx) {
    try {
      const { id } = ctx.params;
      const { username, email, complete_name, phone, ci, password } = ctx.request.body.data;

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id },
        populate: ['role']
      });

      if (!user) {
        return ctx.notFound('Usuario no encontrado');
      }

      if (user.role.name !== 'operador de venta') {
        return ctx.forbidden('Solo se pueden actualizar usuarios operadores');
      }

      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          $and: [
            { id: { $ne: id } },
            { $or: [{ email }, { username }, { ci }] }
          ]
        }
      });

      if (existingUser) {
        return ctx.badRequest('El username, email o CI ya está en uso por otro usuario');
      }

      const updateData = {
        username: username || user.username,
        email: email || user.email,
        complete_name: complete_name || user.complete_name,
        phone: phone || user.phone,
        ci: ci || user.ci
      };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id },
        data: updateData
      });

      return {
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          complete_name: updatedUser.complete_name,
          phone: updatedUser.phone,
          ci: updatedUser.ci
        }
      };
    } catch (error) {
      console.error('Error al actualizar operador:', error);
      return ctx.badRequest('Error al actualizar el operador: ' + error.message);
    }
  },

  async blockOperator(ctx) {
    try {
      const { id } = ctx.params;

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id },
        populate: ['role']
      });

      if (!user) {
        return ctx.notFound('Usuario no encontrado');
      }

      if (user.role.name !== 'operador de venta') {
        return ctx.forbidden('Solo se pueden bloquear usuarios operadores');
      }

      const blockedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id },
        data: { blocked: true }
      });

      return {
        data: {
          id: blockedUser.id,
          username: blockedUser.username,
          message: 'Usuario bloqueado exitosamente'
        }
      };
    } catch (error) {
      console.error('Error al bloquear operador:', error);
      return ctx.badRequest('Error al bloquear el operador: ' + error.message);
    }
  },

  async createOperator(ctx) {
    try {
      const { username, email, password, complete_name, phone, ci } = ctx.request.body.data;

      if (!username || !email || !password || !complete_name || !ci) {
        return ctx.badRequest('Todos los campos son requeridos');
      }

      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { 
          $or: [{ email }, { username }, { ci }]
        }
      });

      if (existingUser) {
        return ctx.badRequest('El username, email o CI ya existe');
      }

      const operadorRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { name: 'operador de venta' }
      });

      if (!operadorRole) {
        return ctx.badRequest('Rol de operador de venta no encontrado');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await strapi.query('plugin::users-permissions.user').create({
        data: {
          username,
          email,
          password: hashedPassword,
          complete_name,
          phone,
          ci,
          role: operadorRole.id,
          confirmed: true,
          blocked: false,
          provider: 'local'
        }
      });

      return {
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          complete_name: newUser.complete_name,
          phone: newUser.phone,
          ci: newUser.ci
        },
        meta: {
          message: 'Usuario operador creado exitosamente'
        }
      };
    } catch (error) {
      console.error('Error al crear operador:', error);
      return ctx.badRequest('Error al crear el usuario operador: ' + error.message);
    }
  }
}; 