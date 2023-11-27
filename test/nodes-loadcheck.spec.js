/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/**
 * Tests if the three nodes can be loaded successfully
 */
'use strict';
const chai = require('chai');
const expect = chai.expect;
const helper = require('node-red-node-test-helper');

const sessionNode = require('../domino/domino-user-session');
const acccessNode = require('../domino/domino-access');
const connectorNode = require('../domino/domino-connector');

helper.init(require.resolve('node-red'));

describe('Nodes load test', () => {
  beforeEach((done) => helper.startServer(done));

  afterEach((done) => {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', (done) => {
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

    helper
      .load([sessionNode, acccessNode, connectorNode], flow, credentials)
      .then(() => {
        try {
          const s1 = helper.getNode('s1');
          expect(s1).to.have.property('name', 'domino session');
          const a1 = helper.getNode('a1');
          expect(a1).to.have.property('name', 'domino access');
          const c1 = helper.getNode('c1');
          expect(c1).to.have.property('api', 'basis');
          done();
        } catch (err) {
          done(err);
        }
      });
  });
});
