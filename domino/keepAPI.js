let keepAPI = null;

module.exports = async function () {
  if (keepAPI != null) {
    return keepAPI;
  }

  keepAPI = await import('@hcl-software/domino-rest-sdk-node');
  return keepAPI;
};
