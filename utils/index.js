'use strict';

const importCwd = require('import-cwd');
const semver = require('semver');
const fs = require('fs-extra');
const path = require('path');

const DEFAULT_VERSION = {
  major: 2,
  minor: 0,
  patch: 4,
};

exports.isEjected = fs.pathExistsSync(path.join(process.cwd(), 'config/paths.js'))

exports.getReactScriptsVersion = function getReactScriptsVersion(cliVersion) {
  if (cliVersion) {
    const versions = {
      major: Number(semver.major(cliVersion)),
      minor: Number(semver.minor(cliVersion)),
      patch: Number(semver.patch(cliVersion)),
    };
    return versions;
  }

  const packageJson = importCwd.silent('./package.json');
  if (!packageJson || !packageJson.dependencies['react-scripts']) {
    return DEFAULT_VERSION;
  }

  const { dependencies } = packageJson;
  const reactScriptsVersionString = /^[~^]?([.0-9]+)$/.exec(dependencies['react-scripts'])[1];
  const versions = {
    major: Number(semver.major(reactScriptsVersionString)),
    minor: Number(semver.minor(reactScriptsVersionString)),
    patch: Number(semver.patch(reactScriptsVersionString)),
  };
  return versions;
};
