#!/usr/bin/env node

'use strict';
/* eslint-disable no-process-exit */

const spawn = require('cross-spawn');

// require it here to handle --help before checking prerequisites
require('../utils/cliHandler');

const [, , ...restArgs] = process.argv;
const scriptPath = require.resolve('../scripts');
const scriptArgs = [scriptPath, ...restArgs];

const result = spawn.sync('node', scriptArgs, { stdio: 'inherit', cwd: process.cwd() });
process.exit(result.status);
