/**
 * Created by siman on 15/03/17.
 */

const path = require('path');

const srcPath = path.join(__dirname, '/src/app');
const buildPath = path.resolve(__dirname, 'build');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const excludePaths = [ nodeModulesPath ];
const includePaths = [ srcPath ];

module.exports = {
  srcPath,
  buildPath,
  nodeModulesPath,
  excludePaths,
  includePaths,

  module: {
    rules: [
      {
        test: /(\.less|\.css)$/,
        //test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              //modules: true,
              //importLoaders: 1
            }
          },
          //'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              //modifyVars: antdCustomTheme
            }
          }
        ],
        exclude: excludePaths,
        include: includePaths
      },
      {
        test: /(\.js|\.jsx)$/,
        use: [
          'react-hot-loader',
          {
            loader: 'babel-loader',
            options: {
              'presets': ['es2015', 'stage-3', 'react'],
              'plugins': [
                'react-html-attrs', 'transform-class-properties', 'transform-object-rest-spread',
                //['import', [{ libraryName: "antd", style: 'css' }]] // to use CSS styles
                //['import', [{ libraryName: "antd", style: true }]] // to use Less styles
              ],
              cacheDirectory: true
            }
          }
        ],
        exclude: excludePaths,
        include: includePaths
      }
    ]
  }
};