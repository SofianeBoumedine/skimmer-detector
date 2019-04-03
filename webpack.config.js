// Dependencies
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

// constants
const BUILD_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');
const CONTENT_SCRIPTS_DIR = path.resolve(__dirname, 'app/content-scripts');

// webpack plugins

const buildPlugins = [
  new CleanWebpackPlugin(),
];

// configs
module.exports = {
  entry: {
    background: [`${SRC_DIR}/background.js`],
    content: [`${CONTENT_SCRIPTS_DIR}/content.js`],
    content_before: [`${CONTENT_SCRIPTS_DIR}/content_before.js`],
  },
  devtool: 'source-map',
  performance: { hints: false },
  output: {
    filename: '[name].js',
    path: BUILD_DIR,
  },
  resolve: {
    symlinks: false,
    extensions: ['.js'],
  },
  plugins: buildPlugins,
};
