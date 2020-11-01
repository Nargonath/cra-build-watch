'use strict';

const meow = require('meow');

module.exports = meow(
  `
    Usage
      $ cra-build-watch [options]

    Options
      -b, --build-path Path to the build folder. Absolute or relative path, if relative will be prefixed with project root folder path.

      --chunk-filename Set the naming you want to use for non-entry chunk files. Accepts webpack placeholders such as [id], [name], [hash]. Directories can be supplied.

      --disable-chunks Disable code-splitting / chunks so that only a single bundle.js file is generated. Only available in react-scripts >= 2.0.0.

      -o, --output-filename Set the name to be used for the output bundle. Accepts webpack placeholders such as [id], [name], [hash]. Directories can be supplied.

      -p, --public-path Public URL.

      --after-rebuild-hook Run a command after each build/rebuild (e.g. 'node ./afterbuild.js')

      --after-initial-build-hook Run a command after each the initial build only (e.g. 'node ./afterbuild.js')

      --react-scripts-version Version of the react-scripts package used in your project i.e 2.0.3. If not given it will be implied from your package.json and if it cannot be implied the major version 2 will be the default.

      -v, --verbose

    Examples
      $ cra-build-watch -b dist/ -p /assets
      $ cra-build-watch --chunk-filename './js/[chunkhash].[name]' -o './js/myapp'
      $ cra-build-watch -b dist/ -p /assets --chunk-filename './js/[name]/[hash].js' -v
`,
  {
    flags: {
      'build-path': {
        type: 'string',
        alias: 'b',
      },
      'chunk-filename': {
        type: 'string',
      },
      'disable-chunks': {
        type: 'boolean',
      },
      'output-filename': {
        type: 'string',
        alias: 'o',
      },
      'public-path': {
        type: 'string',
        alias: 'p',
      },
      'react-scripts-version': {
        type: 'string',
      },
      verbose: {
        type: 'boolean',
        alias: 'v',
      },
      'after-initial-build-hook': {
        type: 'string',
      },
      'after-rebuild-hook': {
        type: 'string',
      }
    },
  }
);
