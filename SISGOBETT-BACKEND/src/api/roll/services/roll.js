'use strict';

/**
 * roll service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::roll.roll');
