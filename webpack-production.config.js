const webpack = require('webpack');
const path = require('path');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const common = require('./common-webpack');

module.exports = {
  context: __dirname,

  entry: [path.join(__dirname, '/src/app/app.js')],

  // Render source-map file for final build
  //devtool: 'source-map',

  output: {
    path: common.buildPath, // Path of output file
    filename: 'app.js' // Name of output file
  },

  plugins: [

    // Define production build to allow React to strip out unnecessary checks
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    // Minify the bundle
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        // suppresses warnings, usually from module minification
        warnings: false
      }
    }),

    // Allows error warnings but does not stop compiling.
    new webpack.NoErrorsPlugin(),

    // Transfer files
    new TransferWebpackPlugin([
      {from: 'www'}
    ], path.resolve(__dirname, 'src'))
  ],

  resolve: {
    modules: [common.srcPath, common.nodeModulesPath]
  },

  module: common.module
};
