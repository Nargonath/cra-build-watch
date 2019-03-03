'use strict';

const meow = require('meow');

module.exports = meow(
  `
    Usage
      $ cra-build-watch [options]

    Options
      -b, --build-path Path to the build folder. Absolute or relative path, if relative will be prefixed with project root folder path.

      -p, --public-path Public URL.

      -cs, --content-script relative URL of your content script: src/extension/contentscript.ts

      -bs, --background-script relative URL of your backgrounc script: src/extension/bacgkroundscript.ts

      --react-scripts-version Version of the react-scripts package used in your project i.e 2.0.3. If not given it will be implied from your package.json and if it cannot be implied the major version 2 will be the default.

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
      'content-script': {
        type: 'string',
        alias: 'cs',
      },
      'background-script': {
        type: 'string',
        alias: 'bs',
      },
      'react-scripts-version': {
        type: 'string',
      },
    },
  }
);
