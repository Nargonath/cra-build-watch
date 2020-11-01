'use strict';

process.env.NODE_ENV = 'development'; // eslint-disable-line no-process-env
process.env.FAST_REFRESH = false;

const importCwd = require('import-cwd');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const assert = require('assert');
const exec = require('child_process').exec;

const {
  flags: {
    buildPath,
    publicPath,
    reactScriptsVersion,
    verbose,
    disableChunks,
    outputFilename,
    chunkFilename,
    afterInitialBuildHook,
    afterRebuildHook,
  },
} = require('../utils/cliHandler');
const { getReactScriptsVersion, isEjected } = require('../utils');

const { major, concatenatedVersion } = getReactScriptsVersion(reactScriptsVersion);

const paths = isEjected ? importCwd('./config/paths') : importCwd('react-scripts/config/paths');
const webpack = importCwd('webpack');

const config =
  concatenatedVersion >= 212
    ? (isEjected
        ? importCwd('./config/webpack.config')
        : importCwd('react-scripts/config/webpack.config'))('development')
    : isEjected
    ? importCwd('./config/webpack.config.dev')
    : importCwd('react-scripts/config/webpack.config.dev');

const HtmlWebpackPlugin = importCwd('html-webpack-plugin');
const InterpolateHtmlPlugin = importCwd('react-dev-utils/InterpolateHtmlPlugin');
const getClientEnvironment = isEjected
  ? importCwd('./config/env')
  : importCwd('react-scripts/config/env');

console.log();
const spinner = ora('Update webpack configuration').start();

// we need to set the public_url ourselves because in dev mode
// it is supposed to always be an empty string as they are using
// the in-memory development server to serve the content
const env = getClientEnvironment(process.env.PUBLIC_URL || ''); // eslint-disable-line no-process-env

/**
 * We need to update the webpack dev config in order to remove the use of webpack devserver
 */
if (major < 4) {
  config.entry = config.entry.filter(fileName => !fileName.match(/webpackHotDevClient/));
}
config.plugins = config.plugins.filter(
  plugin => !(plugin instanceof webpack.HotModuleReplacementPlugin)
);

/**
 * We also need to update the path where the different files get generated.
 */
const resolvedBuildPath = buildPath ? handleBuildPath(buildPath) : paths.appBuild; // resolve the build path

// update the paths in config
config.output.path = resolvedBuildPath;
config.output.publicPath = publicPath || '';

// Grab output names from cli args, otherwise use some default naming.
const fileNameToUse = outputFilename || `js/bundle.js`;
const chunkNameToUse = chunkFilename || `js/[name].chunk.js`;
// If cli user adds .js, respect that, otherwise we add it ourself
config.output.filename = fileNameToUse.slice(-3) !== '.js' ? `${fileNameToUse}.js` : fileNameToUse;
config.output.chunkFilename =
  chunkNameToUse.slice(-3) !== '.js' ? `${chunkNameToUse}.js` : chunkNameToUse;

if (disableChunks) {
  assert(major >= 2, 'Split chunks optimization is only available in react-scripts >= 2.0.0');
  // disable code-splitting/chunks
  config.optimization.runtimeChunk = false;

  config.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };
}

// update media path destination
if (major >= 4) {
  const oneOfIndex = 1;
  config.module.rules[oneOfIndex].oneOf[0].options.name = `media/[name].[hash:8].[ext]`;
  config.module.rules[oneOfIndex].oneOf[1].options.name = `media/[name].[hash:8].[ext]`;
  config.module.rules[oneOfIndex].oneOf[8].options.name = `media/[name].[hash:8].[ext]`;
} else if (major >= 2) {
  // 2.0.0 => 2
  // 2.0.1 => 3
  // 2.0.2 => 3
  // 2.0.3 => 3
  // 2.0.4 to 3.0.0 => 2
  const oneOfIndex = concatenatedVersion === 200 || concatenatedVersion >= 204 ? 2 : 3;
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

fs.emptyDir(paths.appBuild)
  .then(() => {
    spinner.succeed();

    return new Promise((resolve, reject) => {
      const webpackCompiler = webpack(config);
      new webpack.ProgressPlugin(() => {
        if (!inProgress) {
          spinner.start('Start webpack watch');
          inProgress = true;
        }
      }).apply(webpackCompiler);

      webpackCompiler.watch({}, (err, stats) => {
        if (err) {
          return reject(err);
        }

        spinner.succeed();

        runHook('after rebuild hook', spinner, afterRebuildHook);

        inProgress = false;

        if (verbose) {
          console.log();
          console.log(
            stats.toString({
              chunks: false,
              colors: true,
            })
          );
          console.log();
        }

        return resolve();
      });
    });
  })
  .then(() => copyPublicFolder())
  .then(() => runHook('after initial build hook', spinner, afterInitialBuildHook));

function copyPublicFolder() {
  return fs.copy(paths.appPublic, resolvedBuildPath, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

function runHook(label, spinner, hook) {
  if (!hook || typeof hook !== 'string') {
    return;
  }

  spinner.start(label);

  exec(hook, (error, stdout, stderr) => {
    if (error) {
      spinner.fail(`${label}: exec error: ${error}`);
    } else if (stderr) {
      spinner.warn(`${label}: ${stderr}`);
    } else {
      spinner.succeed(`${label}: ${stdout}`);
    }
  });
}

function handleBuildPath(userBuildPath) {
  if (path.isAbsolute(userBuildPath)) {
    return userBuildPath;
  }

  return path.join(process.cwd(), userBuildPath);
}
