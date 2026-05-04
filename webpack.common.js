/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const BG_IMAGES_DIRNAME = 'bgimages';

/** Trailing slash required for webpack publicPath. GitHub project pages: `/repo-name/`. */
const ASSET_PATH_RAW = process.env.ASSET_PATH || '/';
const publicPath = ASSET_PATH_RAW.endsWith('/') ? ASSET_PATH_RAW : `${ASSET_PATH_RAW}/`;
/** React Router basename: no trailing slash; empty when served from domain root. */
const routerBasename = publicPath === '/' ? '' : publicPath.replace(/\/$/, '');
/** React Router uses dynamic `import()` for lazy route modules; webpack flags it as non-static (expected). */
function ignoreReactRouterCriticalDependencyWarning(warning) {
  const msg = warning?.message;
  if (typeof msg !== 'string' || !msg.includes('request of a dependency is an expression')) {
    return false;
  }
  const resource = String(warning.module?.resource ?? warning.module?.userRequest ?? '').replace(/\\/g, '/');
  return resource.includes('node_modules/react-router/');
}

module.exports = (env) => {
  return {
    ignoreWarnings: [ignoreReactRouterCriticalDependencyWarning],
    experiments: {
      topLevelAwait: true,
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx)?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true,
              },
            },
          ],
        },
        {
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          type: 'asset/resource',
          // only process modules with this loader
          // if they live under a 'fonts' or 'pficon' directory
          include: [
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/pficon'),
          ],
        },
        {
          test: /\.svg$/,
          type: 'asset/inline',
          include: (input) => input.includes('background-filter.svg'),
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader if they live under a 'bgimages' directory
          // this is primarily useful when applying a CSS background using an SVG
          include: (input) => input.indexOf(BG_IMAGES_DIRNAME) > -1,
          type: 'asset/inline',
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader when they don't live under a 'bgimages',
          // 'fonts', or 'pficon' directory, those are handled with other loaders
          include: (input) =>
            input.indexOf(BG_IMAGES_DIRNAME) === -1 &&
            input.indexOf('fonts') === -1 &&
            input.indexOf('background-filter') === -1 &&
            input.indexOf('pficon') === -1,
          use: {
            loader: 'raw-loader',
            options: {},
          },
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/i,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/images'),
            path.resolve(
              __dirname,
              'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'
            ),
          ],
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 5000,
            },
          },
        },
      ],
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
        templateParameters: {
          baseHref: publicPath,
        },
      }),
      new webpack.DefinePlugin({
        __ROUTER_BASENAME__: JSON.stringify(routerBasename),
      }),
      new Dotenv({
        systemvars: true,
        silent: true,
      }),
      new CopyPlugin({
        patterns: [{ from: './src/favicon.png', to: 'images' }],
      }),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      alias: {
        // rh-icon resolves icons via `import(\`@rhds/icons/${set}/${icon}.js\`)`; alias the bare package
        // to the filesystem root so webpack's dynamic context matches icon modules (see package exports).
        '@rhds/icons': path.resolve(__dirname, 'node_modules/@rhds/icons'),
        // Use production builds: dev ESM pulls optional `cookie` and breaks webpack without extra setup.
        'react-router$': path.resolve(__dirname, 'node_modules/react-router/dist/production/index.js'),
        'react-router/dom$': path.resolve(__dirname, 'node_modules/react-router/dist/production/dom-export.js'),
        'react-router-dom$': path.resolve(__dirname, 'node_modules/react-router-dom/dist/index.js'),
      },
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, './tsconfig.json'),
        }),
      ],
      symlinks: false,
      cacheWithContext: false,
    },
  };
};
