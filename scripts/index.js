'use strict';

process.env.NODE_ENV = 'development'; // eslint-disable-line no-process-env

const importCwd = require('import-cwd');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const merge = require('webpack-merge');

const {
  flags: { buildPath, publicPath, reactScriptsVersion, verbose },
} = require('../utils/cliHandler');
const { getReactScriptsVersion, isEjected } = require('../utils');

const { major, minor, patch } = getReactScriptsVersion(reactScriptsVersion);

const paths = isEjected ? importCwd('./config/paths') : importCwd('react-scripts/config/paths');
const webpack = importCwd('webpack');
const WebpackDevServer = importCwd('webpack-dev-server');

const common =
  major >= 2 && minor >= 1 && patch >= 2
    ? (isEjected
        ? importCwd('./config/webpack.config')
        : importCwd('react-scripts/config/webpack.config'))('development')
    : isEjected
      ? importCwd('./config/webpack.config.dev')
      : importCwd('react-scripts/config/webpack.config.dev');

const contentScript = process.cwd() + "/src/extension/contentscript.ts";
const backgroundScript = process.cwd() + "/src/extension/backgroundscript.ts";

/**
 * We need to update the webpack dev config in order to remove the use of webpack devserver
 */
common.entry = common.entry.filter(fileName => !fileName.match(/webpackHotDevClient/));
const config = merge(common, {
  entry: {
    main: [...common.entry, 'webpack-dev-server/client?http://localhost:8080', 'webpack/hot/dev-server'],
    contentScript,
    backgroundScript,
  }
});

const HtmlWebpackPlugin = importCwd('html-webpack-plugin');
const InterpolateHtmlPlugin = importCwd('react-dev-utils/InterpolateHtmlPlugin');
const getClientEnvironment = isEjected
  ? importCwd('./config/env')
  : importCwd('react-scripts/config/env');

const spinner = ora('Update webpack configuration').start();

// we need to set the public_url ourselves because in dev mode
// it is supposed to always be an empty string as they are using
// the in-memory development server to serve the content
const env = getClientEnvironment(process.env.PUBLIC_URL || ''); // eslint-disable-line no-process-env


console.log(config.entry);
/**
 * We also need to update the path where the different files get generated.
 */
const resolvedBuildPath = buildPath ? handleBuildPath(buildPath) : paths.appBuild; // resolve the build path

// update the paths in config
config.output.path = resolvedBuildPath;
config.output.publicPath = publicPath || '';
config.output.filename = `js/[name].js`;
config.output.chunkFilename = `js/[name].chunk.js`;

// config.output.filename = "static/js/[name].js";

config.optimization.splitChunks = {
  cacheGroups: {
      default: false,
  },
};

config.optimization.runtimeChunk = false;


// update media path destination
if (major >= 2) {
  // 2.0.0 => 2
  // 2.0.1 => 3
  // 2.0.2 => 3
  // 2.0.3 => 3
  // 2.0.4 => 2
  // 2.1.0 => 2
  // 2.1.1 => 2
  // 2.1.2 => 2
  // 2.1.3 => 2
  const oneOfIndex = minor === 0 && patch < 4 && patch >= 1 ? 3 : 2;
  config.module.rules[oneOfIndex].oneOf[0].options.name = `media/[name].[hash:8].[ext]`;
  config.module.rules[oneOfIndex].oneOf[7].options.name = `media/[name].[hash:8].[ext]`;
} else {
  config.module.rules[1].oneOf[0].options.name = `media/[name].[hash:8].[ext]`;
  config.module.rules[1].oneOf[3].options.name = `media/[name].[hash:8].[ext]`;
}

let htmlPluginIndex = 1;
let interpolateHtmlPluginIndex = 0;
if (major >= 2) {
  htmlPluginIndex = 0;
  interpolateHtmlPluginIndex = 1;
}

// we need to override the InterpolateHtmlPlugin because in dev mod
// they don't provide it the PUBLIC_URL env
config.plugins[interpolateHtmlPluginIndex] = new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw);
config.plugins[htmlPluginIndex] = new HtmlWebpackPlugin({
  inject: true,
  template: paths.appHtml,
  filename: 'index.html',
});

spinner.succeed();
spinner.start('Clear destination folder');

let inProgress = false;

fs
  .emptyDir(paths.appBuild)
  .then(() => {
    spinner.succeed();

    return new Promise((resolve, reject) => {
      const options = {
        writeToDisk: true,
        hot: true,
        disableHostCheck: true,
      };

      const server = new WebpackDevServer(webpack(config), options);
      const port = 8080;
      server.listen(port, 'localhost', function(err) {
        if (err) {
          reject(err);
        }
        resolve('WebpackDevServer listening at localhost:' + port);
      });
    });
  })
  .then(() => copyPublicFolder());

function copyPublicFolder() {
  return fs.copy(paths.appPublic, resolvedBuildPath, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

function handleBuildPath(userBuildPath) {
  if (path.isAbsolute(userBuildPath)) {
    return userBuildPath;
  }

  return path.join(process.cwd(), userBuildPath);
}
