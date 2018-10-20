const importCwd = require('import-cwd');
const semver = require('semver');

const DEFAULT_VERSION = 2;

exports.getReactScriptsMajorVersion = function(cliVersion) {
  if (cliVersion) {
    const major = semver.major(cliVersion);
    return Number(major);
  }

  const packageJson = importCwd.silent('./package.json');
  if (!packageJson) {
    return DEFAULT_VERSION;
  }

  const { dependencies } = packageJson;
  const major = semver.major(dependencies['react-scripts']);
  return Number(major);
};
