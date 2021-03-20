'use strict';

const createDevServerConfig = require('./webpackDevServer.config.ori');

module.exports = function (...args) {
  const initialConfig = createDevServerConfig(...args);

  return {
    ...initialConfig,
    writeToDisk: true,
  };
};
