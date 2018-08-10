const webpack = require('webpack');
const path = require('path')

module.exports = {
  entry: './main.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  }
};
