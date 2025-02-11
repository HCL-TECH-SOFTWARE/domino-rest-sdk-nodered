/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoAccess } from '@hcl-software/domino-rest-sdk-node';

export default function (RED) {
  function DominoAccessNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.name = config.name;
    node.baseUrl = config.baseUrl;
    node.scope = node.credentials.scope.replace(',', ' ');
    node.authtype = config.authtype;
    node.creds = {
      baseUrl: config.baseUrl,
      credentials: {
        type: node.authtype
      }
    };

    if (config.authtype === 'basic') {
      node.creds.credentials.scope = node.credentials.scope.replace(',', ' ');
      node.creds.credentials.username = node.credentials.username;
      node.creds.credentials.password = node.credentials.password;
    } else if (config.authtype === 'oauth') {
      node.creds.credentials.scope = node.credentials.scope.replace(',', ' ');
      node.creds.credentials.appId = node.credentials.appId;
      node.creds.credentials.appSecret = node.credentials.appSecret;
      node.creds.credentials.refreshToken = node.credentials.refreshToken;
    } else if (config.authtype === 'token') {
      node.creds.credentials.token = node.credentials.token;
    } else {
      console.log(`Authentication type: ${config.authtype} is not supported`);
    }

    try {
      node.dominoAccess = new DominoAccess(node.creds);
    } catch (e) {
      console.log(e);
    }
  }

  RED.nodes.registerType('domino-access', DominoAccessNode, {
    credentials: {
      // basic, oauth
      scope: { type: 'text' },
      // basic
      username: { type: 'text' },
      // basic
      password: { type: 'password' },
      // oauth
      appId: { type: 'text' },
      // oauth
      appSecret: { type: 'password' },
      // oauth
      refreshToken: { type: 'password' },
      // token
      token: { type: 'password' }
    }
  });
}
