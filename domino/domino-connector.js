/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoServer } from '@hcl-software/domino-rest-sdk-node';

const loadServerAPI = async (node) => {
  try {
    node.server = await DominoServer.getServer(node.baseUrl);
    node.apiConnector = await node.server.getDominoConnector(node.api);
  } catch (err) {
    node.error(err);
  }
};

export default function (RED) {
  function DominoConnectorNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.baseUrl = config.baseUrl;
    node.api = config.api;
    loadServerAPI(node);
  }
  RED.nodes.registerType('domino-connector', DominoConnectorNode);
}
