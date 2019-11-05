'use strict';

const meow = require('meow');

module.exports = meow(
  `
    Usage
      $ cra-build-watch [options]

    Options
      -b, --build-path Path to the build folder. Absolute or relative path, if relative will be prefixed with project root folder path.

      --disable-chunks Disable code-splitting / chunks so that only a single bundle.js file is generated. Only available in react-scripts >= 2.0.0.

      -p, --public-path Public URL.

      --react-scripts-version Version of the react-scripts package used in your project i.e 2.0.3. If not given it will be implied from your package.json and if it cannot be implied the major version 2 will be the default.

      -v, --verbose

      -o, --output-folder Output folder for bundled build files under build path.  Defaults to 'js' folder.
      
    Examples
      $ cra-build-watch -b dist/ -p /assets
`,
  {
    flags: {
      'build-path': {
        type: 'string',
        alias: 'b',
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
      'disable-chunks': {
        type: 'boolean',
      },
      'output-folder': {
        type: 'string',
        alias: 'o'
      }
    },
  }
);
