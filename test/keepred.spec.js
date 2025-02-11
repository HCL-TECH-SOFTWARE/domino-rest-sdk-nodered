/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/**
 * Tests if the three nodes can be loaded successfully
 */
'use strict';

import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import basisOpenApi from './openapi.basis.json';
import keepRed from '../domino/keepred';

describe('Testing the meta info like scopes, apis and Operations', () => {
  let stub; // sinon wrapper around fetch

  beforeEach(() => {
    stub = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    stub.mockRestore();
  });

  it('should reply with a list of APIs', async () => {
    let fetchReturn = {
      basis: {
        fileName: '/schema/openapi.basis.json',
        name: 'basis',
        title: 'HCL Domino REST API basis',
        version: '1.2.1',
        mountPath: '/api/v1'
      }
    };
    stub.mockResolvedValue(new Response(JSON.stringify(fetchReturn)));
    const result = await keepRed.getKeepApiListServer('http://localhost:8880');
    expect(result).toHaveProperty('type', 'keepapi');
  });

  it('should get a list of scopes', async () => {
    let fetchReturn = {
      scopes_supported: ['$DATA', 'demo', 'MAIL']
    };
    stub.mockResolvedValue(new Response(JSON.stringify(fetchReturn)));
    const result = await keepRed.getKeepScopesServer('http://localhost:8880');
    expect(result).toHaveProperty('type', 'keepscope');
    expect(result).toHaveProperty('types');
    expect(result.types[0]).toHaveProperty('options');
    expect(result.types[0].options.length).toBe(3);
  });

  it('should get a list of operations', async () => {
    let fetchReturn = {
      basis: {
        fileName: '/schema/openapi.basis.json',
        name: 'basis',
        title: 'HCL Domino REST API basis',
        version: '1.2.1',
        mountPath: '/api/v1'
      }
    };
    stub.mockResolvedValueOnce(new Response(JSON.stringify(fetchReturn)));
    stub.mockResolvedValueOnce(new Response(JSON.stringify(basisOpenApi)));
    const result = await keepRed.getKeepOperationIdsServer('https://frascati.projectkeep.io', 'basis');
    expect(result).toHaveProperty('type', 'keepoperation');
    expect(result).toHaveProperty('types');
    expect(result.types[0]).toHaveProperty('options');
    expect(result.types[0].options.length).toBe(65);
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
            resolve(new Response(JSON.stringify(Object.assign(session.result, { operationId, options }))));
          } else {
            reject(new Error('Testing Error'));
          }
        })
    };
  });

  it('should call getDocument', async () => {
    session.result = { Form: 'Demo' };

    const payload = { body: 42, params: { x: 'red', y: 10 } };
    const msg = { _msgid: '1234', payload: payload };
    await keepRed.runRequest(session, 'getDocument', 'demo', msg, send);
    expect(hasBeenCalled).toBe(true);
  });

  it('should fail without result', async () => {
    const msg = { _msgid: '1234', payload: {} };
    try {
      await keepRed.runRequest(session, 'getDocument', 'demo', msg, send);
    } catch (err) {
      expect(hasBeenCalled).toBe(false);
    }
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
    expect(res).toHaveProperty('code', 400);
    expect(res.msg).toHaveProperty('message', 'no hostname or action: keepapis, keepscopes, keepoperationids');
  });

  it('should insist on allowed action', () => {
    let req2 = {
      url: '/somewhere?hostname=https://frascati.projectkeep.io&action=blah&api=demo'
    };
    keepRed.lookupForAdminUI(req2, res);
    expect(res).toHaveProperty('code', 400);
    expect(res.msg).toHaveProperty('message', 'actions: keepapis, keepscopes, keepoperationids');
  });
});
