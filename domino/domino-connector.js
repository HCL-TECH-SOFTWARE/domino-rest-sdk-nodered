/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

const getKeepAPI = require('./keepAPI');

module.exports = function (RED) {
  function DominoConnectorNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.baseUrl = config.baseUrl;
    node.api = config.api;
  }
  RED.nodes.registerType('domino-connector', DominoConnectorNode);
};
