const webpack = require('webpack');
const path = require('path');

const server = require('./common-server');
const common = require('./common-webpack');

module.exports = {
  context: __dirname,

  // Entry points to the project
  entry: [
    //'webpack/hot/dev-server',
    //'webpack/hot/only-dev-server',
    path.join(__dirname, '/src/app/app.js')
  ],

  output: {
    path: common.buildPath, // Path of output file
    filename: 'app.js'
  },

  //devtool: 'inline-source-map',
  devtool: 'source-map',

  // Server Configuration options.
  // Docs: https://webpack.js.org/configuration/dev-server/
  devServer: {
    contentBase: path.join(__dirname, 'src/www'),

    host: 'localhost', // Change to '0.0.0.0' for external facing server
    port: 3000,

    setup: server.setup
  },

  resolve: {
    modules: [common.srcPath, common.nodeModulesPath]
  },

  module: common.module
};
