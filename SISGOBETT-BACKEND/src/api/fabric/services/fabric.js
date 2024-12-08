'use strict';

/**
 * fabric service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::fabric.fabric');
