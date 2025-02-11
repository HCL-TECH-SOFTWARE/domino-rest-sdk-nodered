/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/**
 * Tests if the three nodes can be loaded successfully
 */
'use strict';

let expect;

const nodeRedNodeTestHelper = require('node-red-node-test-helper');
const sessionNode = require('../domino/domino-user-session.js');
const acccessNode = require('../domino/domino-access.js');
const connectorNode = require('../domino/domino-connector.js');

nodeRedNodeTestHelper.init(require.resolve('node-red'));

describe('Nodes load test', () => {
  before(async () => {
    expect = (await import ('chai')).expect;
    const use = (await import('chai')).use;
    const chaiAsPromised = (await import('chai-as-promised')).default;
    use(chaiAsPromised);
  });

  beforeEach((done) => nodeRedNodeTestHelper.startServer(done));

  afterEach((done) => {
    nodeRedNodeTestHelper.unload();
    nodeRedNodeTestHelper.stopServer(done);
  });

  it('should be loaded', (done) => {
    const flow = [
      {
        id: 'a1',
        type: 'domino-access',
        name: 'domino access',
        baseUrl: 'https://frascati.projectkeep.io',
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
        password: 'password',
        scope: '$DATA'
      }
    };

    nodeRedNodeTestHelper.load([sessionNode, acccessNode, connectorNode], flow, credentials)
      .then(() => {
        try {
          const s1 = nodeRedNodeTestHelper.getNode('s1');
          expect(s1).to.have.property('name', 'domino session');
          const a1 = nodeRedNodeTestHelper.getNode('a1');
          expect(a1).to.have.property('name', 'domino access');
          const c1 = nodeRedNodeTestHelper.getNode('c1');
          expect(c1).to.have.property('api', 'basis');
          done();
        } catch (err) {
          done(err);
        }
      });
  });
});
