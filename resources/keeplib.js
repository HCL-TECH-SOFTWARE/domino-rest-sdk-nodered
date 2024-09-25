/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */
'use strict';

const getKeepApiList = (hostname) => {
  if (!hostname) {
    return Promise.reject(new Error('Hostname is empty'));
  }
  return $.getJSON(prepRedURL(hostname, 'keepapis'));
};
const getScopes = (hostname) => {
  if (!hostname) {
    return Promise.reject(new Error('Hostname is empty'));
  }
  return $.getJSON(prepRedURL(hostname, 'keepscopes'));
};
const getOperationIds = (hostname, api) => {
  if (!hostname) {
    return Promise.reject(new Error('Hostname is empty'));
  }
  let target = prepRedURL(hostname, 'keepoperationids');
  target.searchParams.set('api', api);
  return $.getJSON(target);
};

const prepRedURL = (hostname, action) => {
  const currentURL = new URL(window.location);
  currentURL.pathname = '/hcl-domino-rest-api-config';
  currentURL.search = '';
  currentURL.searchParams.set('action', action);
  currentURL.searchParams.set('hostname', hostname);
  return currentURL;
};

const getAuthMethods = () =>
  new Promise((resolve, reject) => {
    try {
      resolve({
        types: [
          {
            value: 'authtype',
            options: [
              { value: 'basic', label: 'Basic' },
              { value: 'oauth', label: 'OAuth' },
              { value: 'token', label: 'Token' }
            ]
          }
        ]
      });
    } catch (e) {
      reject(e);
    }
  });

// Export the function to be accessible in other files
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    getKeepApiList,
    getAuthMethods,
    getScopes,
    getOperationIds
  };
}
