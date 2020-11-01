<div align="center">
  <h1>cra-build-watch</h1>
  <strong>A script for create-react-app that writes development builds to the disk</strong>
</div>

<hr>

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Build Status](https://travis-ci.org/Nargonath/cra-build-watch.svg?branch=master)](https://travis-ci.org/Nargonath/twitter-auth-await)
[![npm version](https://badge.fury.io/js/cra-build-watch.svg)](https://badge.fury.io/js/cra-build-watch)
![dependabot](https://badgen.net/dependabot/dependabot/dependabot-core/?icon=dependabot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Disclaimer

**The builds resulting from this script are NOT for production environment.** They lack various optimizations.

This script is meant as a temporary workaround for `create-react-app` project based until this feature is built-in into `react-scripts`. See [create-react-app#1070](https://github.com/facebook/create-react-app/issues/1070).

This script is inspired by other work related such as: https://gist.github.com/jasonblanchard/ae0d2e304a647cd847c0b4493c2353d4.

## Ejection

You **do not** need to eject your project for you to use `cra-build-watch`.

This tool handles ejected projects but it assumes you did not modify your `webpack.config.js` file, `paths.js` and `env.js` utils. If you did I cannot guarantee that this tool will work.

# Why do I need this?

As of now (20/04/2018), `create-react-app` (more precisely `react-scripts`) does not allow development builds to be written to the disk because it uses `webpackDevServer` to serve your build files and folders ([for good reasons](https://github.com/facebook/create-react-app/issues/1070#issuecomment-261812303)). The problem is that in some cases you need to have these files written to the disk i.e:

- Developing browser extensions using React.
- Incorporating your React application into an existing application.
- Serving your React app with a dedicated backend.

# Prerequisites

Supports `react-scripts >= 1.0.x`, hence it supports the newest version `4.x.x`.

Supports `node >= 10`.

# Installation

Add it to your project using `npm`:

```
npm install -D cra-build-watch
```

or using `yarn`:

```
yarn add -D cra-build-watch
```

# Usage

Add a new script into your `package.json`:

```json
{
  "scripts": {
    "watch": "cra-build-watch"
  }
}
```

Run that script:

```
npm run watch
```

with Yarn:

```
yarn watch
```

# Configuration

By default the script will generate everything into `build/` at your project root and remove the public path from webpack's configuration.

If those defaults do not work for you, the script accepts some arguments:

- `--after-initial-build-hook`: accepts a string of shell code that will be run only once after the initial build in the same process as the `cra-build-watch`.
- `--after-rebuild-hook`: accepts a string of shell code that will be run every time webpack rebuilds your project after a filesystem change. It runs in the same process as `cra-build-watch`.
- `-b|--build-path`: expects either an absolute or relative path. If a relative path is given it will be prefixed by your project root path.
  - default: `yourProjectRoot/build`.
- `--chunk-filename`: Set the naming you want to use for non-entry chunk files. Accepts webpack placeholders such as `[id]`, `[name]`, `[hash]`. Directories can be supplied.
  - default: `js/bundle.js`.
- `--disable-chunks`: disable code-splitting / chunks so that only a single bundle.js file is generated. It only works with `react-scripts` >= `2.0.0`.
- `-o|--output-filename`: Set the name to be used for the output bundle. Accepts webpack placeholders such as `[id]`, `[name]`, `[hash]`. Directories can be supplied.
  - default: `js/[name].chunk.js`
- `--react-scripts-version`: expects the `react-scripts` version you are using in your project i.e `2.0.3`. If not given it will be implied from your `node_modules` and if it cannot be implied the version `2.1.2` will be the default. Consider setting it if you **ejected** and are not using the latest `react-scripts` version.
- `-p|--public-path`: expects a relative URL where `/` is the root. If you serve your files using an external webserver this argument is to match with your web server configuration. More information can be found in [webpack configuration guide](https://webpack.js.org/configuration/output/#output-publicpath).
  - default: "".
- `-v|--verbose`: display webpack build output.

# Contributions

All contributions are welcomed.
