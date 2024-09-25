/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */
'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Serverside functions for HCL Domino NodeRED

const keepAPI = require('@hcl-software/domino-rest-sdk-node');

// Caches for "static" calls: apis, operationIds, scopes
const apiListCache = new Map();
const scopeListCache = new Map();
const opsListCache = new Map();

/**
 * List of APIs hosted on the server
 *
 * @param {string} hostname
 * @returns JSON for TypedInput as Promise
 */
const getKeepApiListServer = (hostname) => {
  console.log(`Retrieve API List for ${hostname}`);
  let hostURL = new URL(hostname);
  hostURL.pathname = '/api';

  if (apiListCache.has(hostURL.href)) {
    console.log(`Cache hit: API List for ${hostURL.href}`);
    return Promise.resolve(makeApiListForUI(apiListCache.get(hostURL.href)));
  }

  console.log(`Retrieving API List for ${hostURL.href}`);

  return fetch(hostURL.href)
    .then((result) => successJsonOrError(result))
    .then((json) => {
      apiListCache.set(hostURL.href, json);
      return makeApiListForUI(json);
    })
    .catch((e) => {
      throw e;
    });
};

/**
 * Checks if we have a 2xx reply, returns Payload as JSON
 * Throws an error if not
 * @param {Response} result
 * @returns json
 * @throws Error if result isn't 2xx
 */
const successJsonOrError = (result) => {
  if (result.ok) {
    return result.json();
  }

  throw new Error(`Return code ${result.status} : ${result.statusText}`);
};

/**
 *
 * @param {json} json from call to  '/api
 * @returns Json for typedInput
 */
const makeApiListForUI = (json) => {
  let apiList = {
    type: 'keepapi',
    types: []
  };
  let options = [];
  Object.values(json).forEach((o) =>
    options.push({ value: o.name, label: o.title + ':' + o.version })
  );
  options.sort((a, b) => lightSorter(a, b, 'name'));
  let api = { value: 'keepapi', options: options };
  apiList.types.push(api);

  return apiList;
};

/**
 * Sorts an object by one property
 *
 * @param {json} first
 * @param {json} second
 * @param {string} prop
 * @returns -1, 0, 1
 */
const lightSorter = (first, second, prop) => {
  let a = first[prop];
  let b = second[prop];
  try {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    }
  } catch (e) {
    // No action
  }
  return 0;
};

/**
 *  List of scopes retrieved from /.well-known/openid-configuration
 *
 * @param {string} hostname
 * @returns JSON for TypedInput as Promise
 */
const getKeepScopesServer = (hostname) => {
  let hostURL = new URL(hostname);
  hostURL.pathname = '/.well-known/openid-configuration';

  if (scopeListCache.has(hostURL.href)) {
    console.log(`Cache hit: scope List for ${hostname}`);
    return Promise.resolve(
      makeScopeListForUI(scopeListCache.get(hostURL.href))
    );
  }

  console.log(`Retrieve scope List for ${hostname}`);
  return fetch(hostURL.href)
    .then((result) => successJsonOrError(result))
    .then((json) => {
      scopeListCache.set(hostURL.href, json);
      return makeScopeListForUI(json);
    })
    .catch((e) => {
      throw e;
    });
};

/**
 *
 * @param {json} json from call to  '/.well-known/openid-configuration
 * @returns Json for typedInput
 */
const makeScopeListForUI = (json) => {
  let scopeList = {
    type: 'keepscope',
    types: []
  };
  let options = [];
  let allScopes = json.scopes_supported || [];
  allScopes.forEach((s) => options.push({ value: s, label: s }));
  options.sort((a, b) => lightSorter(a, b, 'value'));
  let api = { value: 'keepscope', options: options };
  scopeList.types.push(api);
  return scopeList;
};

/**
 *  List of operationIds and purpose
 *
 * @param {string} hostname
 * @param {string} api
 * @returns JSON for TypedInput as Promise
 */
const getKeepOperationIdsServer = (hostname, api) =>
  new Promise((resolve, reject) => {
    const key = `${hostname}::${api}`;

    if (opsListCache.has(key)) {
      console.log(`Cache hit: operation List for ${key}`);
      return resolve(makeOperationListForUI(opsListCache.get(key)));
    }

    console.log(`Retrieve operation List for ${key}`);

    keepAPI.DominoServer.getServer(hostname)
      .then((dominoServer) => dominoServer.getDominoConnector(api))
      .then((dominoConnector) => dominoConnector.getOperations())
      .then((operations) => {
        opsListCache.set(key, operations);
        resolve(makeOperationListForUI(operations));
      })
      .catch((err) => reject(err));
  });

/**
 * Formats the raw list of operations into the
 * format scopedInput in the NodeRED UI can understand
 *
 * @param {json} operations
 * @returns ScopedInput Object
 */
const makeOperationListForUI = (operations) => {
  const opsList = {
    type: 'keepoperation',
    types: []
  };
  let options = [];
  for (let [key, value] of operations) {
    options.push({
      value: key,
      label: key + ': ' + value.description
    });
  }
  options.sort((a, b) => lightSorter(a, b, 'value'));
  let ops = { value: 'keepoperation', options: options };
  opsList.types.push(ops);
  return opsList;
};

/**
 *  Execute an operation on the Domino backend
 *
 * @param {keepAPI.DominoUserSession} session
 * @param {string} operationId
 * @param {string} scope
 * @param {json} msg the whole message
 * @param {function} send
 * @returns Promise<Void>
 */
const runRequest = (session, operationId, scope, msg, send, singleReply) =>
  new Promise((resolve, reject) => {
    const options = {
      dataSource: scope,
      params: new Map()
    };

    const payload = msg.payload ?? {};

    // Parameters from payload
    if (payload.params) {
      Object.keys(payload.params).forEach((k) =>
        options.params.set(k, payload.params[k])
      );
    }

    // Special attention for unid and uuid
    if (msg.unid) {
      options.params.set('unid', msg.unid);
    }

    if (msg.uuid) {
      options.params.set('uuid', msg.uuid);
    }

    // Body for POST PUT PATCH
    if (payload.body) {
      options.body = JSON.stringify(payload.body);
    }

    // Resset the header
    msg.headers = {};

    // The actual call here
    session
      .request(operationId, options)
      .then((result) => {
        msg.status = result.status;
        result.headers.forEach((value, key) => (msg.headers[key] = value));
        return result.dataStream;
      })
      .then((stream) => processResultStream(stream, msg, send, singleReply))
      .then(() => resolve())
      .catch((err) => {
        reject(err);
      });
  });

/**
 * Processes the data stream
 *
 * Here is the interesting part we have 4 potential scenarios:
 *  1. JSON not chunked
 *  2. JSON chunked
 *  3. Binary not chunked
 *  4. Binary chunked
 *
 * @param {ReadableStream} stream
 * @param {json} newMsg
 * @param {function} send
 * @returns void
 */
const processResultStream = (stream, returnMsg, send, singleReply) => {
  if (isChunked(returnMsg.headers, singleReply)) {
    // JSON Array sequence
    if (isJsonContent(returnMsg.headers)) {
      return stream
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(keepAPI.streamSplit())
        .pipeThrough(keepAPI.streamTransformToJson())
        .pipeTo(streamToSend(returnMsg, send));
    }
    // Anything else
    return stream.pipeTo(streamToSend(returnMsg, send));
  }

  // Single return, shortcutting stream processing
  let r = new Response(stream);

  // JSON response
  if (isJsonContent(returnMsg.headers)) {
    return r.json().then((json) => {
      returnMsg.payload = json;
      send(returnMsg);
    });
  }

  // Non-JSON content --> passing as blob
  return r.blob().then((blob) => {
    returnMsg.payload = blob;
    send(returnMsg);
  });
};

/**
 * Check for JSON
 *
 * @param {Headers} headers
 * @returns boolean
 */
const isJsonContent = (headers) => {
  let ct = headers['content-type'];
  return ct?.includes('application/json');
};

/**
 * Check for chunked encoding
 *
 * @param {Headers} headers
 * @param {boolean} SIngleReply: if true ignore chunked setting
 * @returns boolean
 */
const isChunked = (headers, singleReply) => {
  if (singleReply) {
    return false;
  }
  let te = headers['transfer-encoding'];
  return te?.includes('chunked');
};

const streamToSend = (returnMsg, send) => {
  let sequence = 0;
  return new WritableStream({
    write(data) {
      sequence++;
      send({ ...returnMsg, seq: sequence, payload: data });
    }
  });
};

/**
 * Helper function to lookup apis, scopes or operationIds
 *
 * @param {HttpServerRequest} req Request like ExpressJS
 * @param {HttpServerResponse} res Response like ExpressJS
 * @returns void
 */
const lookupForAdminUI = (req, res) => {
  //the baseURL isn't relevant, don't change it
  const url = new URL(req.url, 'http://void');
  const action = url.searchParams.get('action');
  const hostname = url.searchParams.get('hostname');
  const api = url.searchParams.get('api');

  if (!action || !hostname) {
    return res.status(400).json({
      message: 'no hostname or action: keepapis, keepscopes, keepoperationids'
    });
  }

  if ('keepapis' === action) {
    // list of available APIs
    getKeepApiListServer(hostname)
      .then((apis) => res.json(apis))
      .catch((e) => res.status(500).json({ error: e.message }));
    return;
  } else if ('keepscopes' === action) {
    // list of defined scopes
    getKeepScopesServer(hostname)
      .then((scopes) => res.json(scopes))
      .catch((e) => res.status(500).json({ error: e.message }));
    return;
  } else if ('keepoperationids' === action && api) {
    // List of opeerationIds available
    getKeepOperationIdsServer(hostname, api)
      .then((operationids) => res.json(operationids))
      .catch((e) => res.status(500).json({ error: e.message }));
    return;
  }

  return res
    .status(400)
    .json({ message: 'actions: keepapis, keepscopes, keepoperationids' });
};

/**
 *  Main function when Domino processsing needs to happen
 *
 * @param {domino-user-session} node The NodeRED Node processing incoming requests
 * @param {json} msg The NodeRED incoming message
 * @param {function} send  - call with new results 0:n times
 * @param {function} done  call when done, takes an error as param id needed
 */
const executeDominoRequest = (node, msg, send, done) => {
  if (!node.session) {
    node.session = new keepAPI.DominoUserSession(
      node.access.dominoAccess,
      node.connector.apiConnector
    );
  }

  node.status({
    fill: 'green',
    shape: 'dot',
    text: node.connector.apiConnector.baseUrl
  });

  runRequest(
    node.session,
    node.operationId,
    node.scope,
    msg,
    send,
    node.singleReturn
  )
    .then(() => {
      node.status({});
      done();
    })
    .catch((err) => {
      node.status({
        fill: 'red',
        shape: 'circle',
        text: err.message
      });
      done(err);
    });
};

module.exports = {
  getKeepApiListServer,
  getKeepScopesServer,
  getKeepOperationIdsServer,
  runRequest,
  lookupForAdminUI,
  executeDominoRequest
};
