'use strict';

/**
 * case service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::case.case');
