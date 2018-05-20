'use strict';

process.env.NODE_ENV = 'development'; // eslint-disable-line no-process-env

const importCwd = require('import-cwd');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const {
    flags: {buildPath, publicPath, verbose},
} = require('../utils/cliHandler');
const paths = importCwd('react-scripts/config/paths');
const webpack = importCwd('webpack');
const config = importCwd('react-scripts/config/webpack.config.dev.js');
const HtmlWebpackPlugin = importCwd('html-webpack-plugin');

console.log();
const spinner = ora('Update webpack configuration').start();

/**
 * We need to update the webpack dev config in order to remove the use of webpack devserver
 */
config.entry = config.entry.filter(fileName => !fileName.match(/webpackHotDevClient/));
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
config.output.filename = `js/bundle.js`;
config.output.chunkFilename = `js/[name].chunk.js`;

// update media path destination
config.module.rules[1].oneOf[0].options.name = `media/[name].[hash:8].[ext]`;
config.module.rules[1].oneOf[3].options.name = `media/[name].[hash:8].[ext]`;
config.plugins[1] = new HtmlWebpackPlugin({
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
            const webpackCompiler = webpack(config);
            webpackCompiler.apply(
                new webpack.ProgressPlugin(() => {
                    if (!inProgress) {
                        spinner.start('Start webpack watch');
                        inProgress = true;
                    }
                })
            );

            webpackCompiler.watch({}, (err, stats) => {
                if (err) {
                    return reject(err);
                }

                spinner.succeed();
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
