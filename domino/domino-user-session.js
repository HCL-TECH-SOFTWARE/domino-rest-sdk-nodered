/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

const keepred = require('./keepred');
const keepAPI = require('@hcl-software/domino-rest-sdk-node');

/**
 * Main NodeRED node <code>domino-user-session</code> depending on two configurstion
 * nodes to function
 *
 * @param {NodeRED} RED  NodeRED runtime
 */
module.exports = function (RED) {
  function DominoUserSessionNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.name = config.name;
    node.operationId = config.operationId;
    node.scope = config.scope;
    node.singleReturn = config.singleReturn;

    node.access = RED.nodes.getNode(config.access);
    node.connector = RED.nodes.getNode(config.connector);
    node.session = null;

    // Call to backend function
    node.on('input', (msg, send, done) =>
      keepred.executeDominoRequest(node, msg, send, done)
    );
  }

  RED.nodes.registerType('domino-user-session', DominoUserSessionNode);

  /**
   * Helper function to configure the [multi]select lists in the Node configuration
   */
  RED.httpAdmin.get(
    '/hcl-domino-rest-api-config',
    RED.auth.needsPermission('flows.read'),
    keepred.lookupForAdminUI
  );
};
