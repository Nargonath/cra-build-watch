'use strict';

process.env.NODE_ENV = 'development'; // eslint-disable-line no-process-env

const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');

const rootCraPath = path.join(process.cwd(), 'node_modules', 'react-scripts');
const configPath = path.join(rootCraPath, 'config');
const configSource = path.join(configPath, 'webpackDevServer.config.js');
const destSource = path.join(configPath, 'webpackDevServer.config.ori.js');

const spinner = ora('💾 Create webpackDevServer.config.js backup').start();
fs.moveSync(configSource, destSource);
spinner.succeed();

spinner.start('🔧 Add webpackDevServer.config.js wrapper');
fs.copySync(path.join(__dirname, '../utils/configWrapper.js'), configSource);
spinner.succeed();

console.log();
console.log(`You're all done. 🧰 Enjoy!`);
