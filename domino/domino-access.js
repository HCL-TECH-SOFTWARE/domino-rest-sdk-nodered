/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

const keepAPI = require('@hcl-software/domino-rest-sdk-node');

module.exports = function (RED) {
  function DominoAccessNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.name = config.name;
    node.baseUrl = config.baseUrl;
    node.scope = config.scope.replace(',', ' ');
    node.authtype = config.authtype;
    node.username = node.credentials.username;
    node.password = node.credentials.password;
    node.creds = {
      baseUrl: config.baseUrl,
      credentials: {
        type: config.authtype,
        scope: config.scope,
        username: node.credentials.username,
        password: node.credentials.password
      }
    };
    try {
      node.dominoAccess = new keepAPI.DominoAccess(node.creds);
    } catch (e) {
      console.log(e);
    }
  }

  RED.nodes.registerType('domino-access', DominoAccessNode, {
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' }
    }
  });
};
