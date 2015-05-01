var webpack = require('webpack');
var plugins = [new webpack.DefinePlugin({'define.amd': false, 'process.browser': true})]

var externals = [{
  "bluebird": {
    root: "Promise",
    commonjs2: "bluebird",
    commonjs: "bluebird",
    amd: "bluebird"
  },
  "lodash": {
    root: "_",
    commonjs2: "lodash",
    commonjs: "lodash",
    amd: "lodash"
  },
  "knex": {
    root: "Knex",
    commonjs2: "knex",
    commonjs: "knex",
    amd: "knex"
  },
  "inflection": "inflection"
}]

module.exports = {

  output: {
    library: 'Bookshelf',
    libraryTarget: 'umd'
  },

  externals: externals,

  plugins: plugins

};