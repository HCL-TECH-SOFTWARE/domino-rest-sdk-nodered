/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/**
 * Tests if the three nodes can be loaded successfully
 */
'use strict';

let expect;

const { stub: _stub } = require('sinon');
const basisOpenApi = require('./openapi.basis.json');

// File under Test
const keepRed = require('../domino/keepred.js');
const { describe } = require('mocha');

describe('Test keepred', () => {
  before(async () => {
    expect = (await import ('chai')).expect;
    const use = (await import('chai')).use;
    const chaiAsPromised = (await import('chai-as-promised')).default;
    use(chaiAsPromised);
  });

  describe('Testing the meta info like scopes, apis and Operations', () => {
    let stub; // sinon wrapper around fetch

    beforeEach(() => {
      stub = _stub(global, 'fetch');
    });

    afterEach(() => {
      stub.restore();
    });

    it('should reply with a list of APIs', (done) => {
      let fetchReturn = {
        basis: {
          fileName: '/schema/openapi.basis.json',
          name: 'basis',
          title: 'HCL Domino REST API basis',
          version: '1.2.1',
          mountPath: '/api/v1'
        }
      };
      stub.returns(Promise.resolve(new Response(JSON.stringify(fetchReturn))));
      keepRed
        .getKeepApiListServer('http://localhost:8880')
        .then((result) => expect(result).to.have.property('type', 'keepapi'))
        .then(() => keepRed.getKeepApiListServer('http://localhost:8880'))
        .then((result) => {
          expect(result).to.have.property('type', 'keepapi');
          done();
        })
        .catch((err) => done(err));
    });

    it('should get a list of scopes', (done) => {
      let fetchReturn = {
        scopes_supported: ['$DATA', 'demo', 'MAIL']
      };
      stub.returns(Promise.resolve(new Response(JSON.stringify(fetchReturn))));
      keepRed
        .getKeepScopesServer('http://localhost:8880')
        .then((result) => {
          expect(result).to.have.property('type', 'keepscope');
          expect(result).to.have.property('types');
          expect(result.types[0]).to.have.property('options');
          expect(result.types[0].options.length).to.equal(3);
          done();
        })
        .catch((err) => done(err));
    });

    it('should get a list of operations', (done) => {
      let fetchReturn = {
        basis: {
          fileName: '/schema/openapi.basis.json',
          name: 'basis',
          title: 'HCL Domino REST API basis',
          version: '1.2.1',
          mountPath: '/api/v1'
        }
      };
      stub
        .onCall(0)
        .returns(Promise.resolve(new Response(JSON.stringify(fetchReturn))));
      stub
        .onCall(1)
        .returns(Promise.resolve(new Response(JSON.stringify(basisOpenApi))));
      keepRed
        .getKeepOperationIdsServer('https://frascati.projectkeep.io', 'basis')
        .then((result) => {
          expect(result).to.have.property('type', 'keepoperation');
          expect(result).to.have.property('types');
          expect(result.types[0]).to.have.property('options');
          expect(result.types[0].options.length).to.equal(65);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('Calling Run request', () => {
    let session; // sinon wrapper around DominoUserSession
    let hasBeenCalled;

    const send = (data) => {
      // log that it was called
      hasBeenCalled = true;
    };

    beforeEach(() => {
      hasBeenCalled = false;
      session = {
        result: undefined,
        request: (operationId, options) =>
          new Promise((resolve, reject) => {
            if (session.result) {
              resolve(
                new Response(
                  JSON.stringify(
                    Object.assign(session.result, { operationId, options })
                  )
                )
              );
            } else {
              reject(new Error('Testing Error'));
            }
          })
      };
    });

    it('should call getDocument', (done) => {
      session.result = { Form: 'Demo' };

      const payload = { body: 42, params: { x: 'red', y: 10 } };
      const msg = { _msgid: '1234', payload: payload };
      keepRed
        .runRequest(session, 'getDocument', 'demo', msg, send)
        .then(() => {
          expect(hasBeenCalled).to.be.true;
          done();
        })
        .catch((err) => done(err));
    });

    // failing test

    it('should fail without result', (done) => {
      const msg = { _msgid: '1234', payload: {} };
      keepRed
        .runRequest(session, 'getDocument', 'demo', msg, send)
        .then(() => {
          expect(hasBeenCalled).to.be.false;
          done();
        })
        .catch((err) => {
          expect(hasBeenCalled).to.be.false;
          done();
        });
    });
  });

  describe('Testing the UI helper methods', () => {
    let res;
    let req;

    beforeEach(() => {
      req = {
        url: '/somewhere?hostname=https://frascati.projectkeep.io&action=keepapis&api=demo'
      };
      res = {
        code: 0,
        msg: {},
        status: (c) => {
          res.code = c;
          return res;
        },
        json: (j) => {
          res.msg = j;
        }
      };
    });

    it('should insist on action', () => {
      let req2 = {
        url: 'http://nowhere'
      };
      keepRed.lookupForAdminUI(req2, res);
      expect(res).to.have.property('code', 400);
      expect(res.msg).to.have.property(
        'message',
        'no hostname or action: keepapis, keepscopes, keepoperationids'
      );
    });

    it('should insist on allowed action', () => {
      let req2 = {
        url: '/somewhere?hostname=https://frascati.projectkeep.io&action=blah&api=demo'
      };
      keepRed.lookupForAdminUI(req2, res);
      expect(res).to.have.property('code', 400);
      expect(res.msg).to.have.property(
        'message',
        'actions: keepapis, keepscopes, keepoperationids'
      );
    });
  });
})
