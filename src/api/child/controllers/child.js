'use strict';

/**
 * child controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::child.child');
