/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/**
 * Tests if the three nodes can be loaded successfully
 */
'use strict';

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import helper from 'node-red-node-test-helper';

import sessionNode from '../domino/domino-user-session';
import acccessNode from '../domino/domino-access';
import connectorNode from '../domino/domino-connector';

helper.init(require.resolve('node-red'));

describe('Nodes load test', async () => {
  beforeEach(async () => await helper.startServer());

  afterEach(async () => {
    await helper.unload();
    await helper.stopServer();
  });

  it('should be loaded', async () => {
    const flow = [
      {
        id: 'a1',
        type: 'domino-access',
        name: 'domino access',
        baseUrl: 'https://frascati.projectkeep.io',
        scope: '$DATA',
        authtype: 'basic'
      },
      {
        id: 'c1',
        type: 'domino-connector',
        api: 'basis',
        baseUrl: 'https://frascati.projectkeep.io'
      },
      {
        id: 's1',
        type: 'domino-user-session',
        name: 'domino session'
      }
    ];

    const credentials = {
      a1: {
        username: 'username',
        password: 'password'
      }
    };

    await helper.load([sessionNode, acccessNode, connectorNode], flow, credentials);

    try {
      const s1 = helper.getNode('s1');
      expect(s1).toHaveProperty('name', 'domino session');
      const a1 = helper.getNode('a1');
      expect(a1).toHaveProperty('name', 'domino access');
      const c1 = helper.getNode('c1');
      expect(c1).toHaveProperty('api', 'basis');
    } catch (err) {
      console.error(err);
    }
  });
});
