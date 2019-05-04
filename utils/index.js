'use strict';

const importCwd = require('import-cwd');
const semver = require('semver');
const fs = require('fs-extra');
const path = require('path');

const DEFAULT_VERSION = {
  major: 2,
  minor: 1,
  patch: 2,
  concatenatedVersion: 212,
};

exports.isEjected = fs.pathExistsSync(path.join(process.cwd(), 'config/paths.js'));

exports.getReactScriptsVersion = function getReactScriptsVersion(cliVersion) {
  if (cliVersion) {
    const versions = {
      major: Number(semver.major(cliVersion)),
      minor: Number(semver.minor(cliVersion)),
      patch: Number(semver.patch(cliVersion)),
      concatenatedVersion: Number(
        `${semver.major(cliVersion)}${semver.minor(cliVersion)}${semver.patch(cliVersion)}`
      ),
    };
    return versions;
  }

  const reactScriptsPkg = importCwd.silent('react-scripts/package.json');
  if (!reactScriptsPkg || !reactScriptsPkg.version) {
    return DEFAULT_VERSION;
  }

  const { version } = reactScriptsPkg;
  const versions = {
    major: Number(semver.major(version)),
    minor: Number(semver.minor(version)),
    patch: Number(semver.patch(version)),
    concatenatedVersion: Number(
      `${semver.major(version)}${semver.minor(version)}${semver.patch(version)}`
    ),
  };
  return versions;
};
