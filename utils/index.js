const importCwd = require('import-cwd');
const semver = require('semver');

const DEFAULT_VERSION = {
  major: 2,
  minor: 0,
  patch: 4
}

exports.getReactScriptsVersion = function(cliVersion) {
  if (cliVersion) {
    const versions = {
      major: Number(semver.major(cliVersion)),
      minor: Number(semver.minor(cliVersion)),
      patch: Number(semver.patch(cliVersion))
    }
    return versions;
  }

  const packageJson = importCwd.silent('./package.json');
  if (!packageJson) {
    return DEFAULT_VERSION;
  }

  const { dependencies } = packageJson;
  const versions = {
    major: Number(semver.major(dependencies['react-scripts'])),
    minor: Number(semver.minor(dependencies['react-scripts'])),
    patch: Number(semver.patch(dependencies['react-scripts']))
  }
  return versions;
};