#!/usr/bin/env node

'use strict';
/* eslint-disable no-process-exit */

const spawn = require('cross-spawn');
const chalk = require('chalk');
const resolveCwd = require('resolve-cwd');

// require it here to handle --help before checking prerequisites
require('../utils/cliHandler');

// quick way of checking that react-scripts is installed in the current project
if (!resolveCwd.silent('react-scripts/bin/react-scripts')) {
  console.log();
  console.log(chalk`[{redBright.bold ERROR}] react-scripts must be installed in your project`);
  process.exit(1);
}

const [, , ...restArgs] = process.argv;
const scriptPath = require.resolve('../scripts');
const scriptArgs = [scriptPath, ...restArgs];

const result = spawn.sync('node', scriptArgs, { stdio: 'inherit', cwd: process.cwd() });
process.exit(result.status);
