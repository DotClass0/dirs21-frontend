const path = require('path')
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: '/frontend',
  transpileDependencies: true,
  outputDir: path.resolve(__dirname, '../api/dist'),
})
