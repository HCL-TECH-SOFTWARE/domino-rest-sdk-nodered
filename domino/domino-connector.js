/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

const keepAPI = require('@hcl-software/domino-rest-sdk-node');

const loadServerAPI = async (node) => {
  try {
    node.server = await keepAPI.DominoServer.getServer(node.baseUrl);
    node.apiConnector = await node.server.getDominoConnector(node.api);
  } catch (err) {
    node.error(err);
  }
};

module.exports = function (RED) {
  function DominoConnectorNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.baseUrl = config.baseUrl;
    node.api = config.api;
    loadServerAPI(node);
  }
  RED.nodes.registerType('domino-connector', DominoConnectorNode);
};
