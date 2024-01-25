'use strict';

/**
 * conversation-message service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::conversation-message.conversation-message');
