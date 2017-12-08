const webpack = require('webpack');
const path = require('path');
const minimize = process.argv.indexOf('--minimize') !== -1;
const failPlugin = require('webpack-fail-plugin');

// Fail plugin will allow the webpack ts-loader to fail correctly when the TS compilation fails
var plugins = [failPlugin];

if (minimize) {
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  resolve: {
    extensions: ['*', '.ts', '.js']
  },
  entry: {
    myApp: ['./src/Application.ts']
  },
  output: {
    path: path.resolve(__dirname, 'bin/js'),
    filename: minimize ? '[name].bundle.min.js' : '[name].bundle.js',
    library: '[name]'
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.js$/,
        loader: 'js-loader'
      }
    ]
  },
  plugins: plugins
};
