const config = require('./webpack.config.js')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const dev = {
  ...config,
  devtool: 'inline-source-map',
  mode: 'development'
}
for (let i = 0; i < dev.plugins.length; i++) {
  if (dev.plugins[i] instanceof CleanWebpackPlugin) {
    dev.plugins.splice(i, 1)
    break
  }
}
// increase hot-reload performance
dev.module.rules.map((obj) => {
  if (obj.test.test('.css') || obj.test.test('.vcss') || obj.test.test('.scss')) {
    obj.use = [
      'style-loader',
      'css-loader',
      'sass-loader'
    ]
  }
})
dev.resolve.alias.vue = 'vue/dist/vue.js'
module.exports = dev
