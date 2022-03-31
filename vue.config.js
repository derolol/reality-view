const path = require('path')
const { defineConfig } = require('@vue/cli-service')

const resolve = dir => path.resolve(__dirname, dir);

module.exports = defineConfig({
  transpileDependencies: true,
  // cdn资源引入配置
  configureWebpack: {
    // cdn资源引入配置
    externals: {
      'vue': 'Vue',
      'element-ui': 'ELEMENT',
      'vue-konva': 'VueKonva',
    },
  },
  // scss全局配置
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "~@/assets/scss/mixin.scss";@import "~@/assets/scss/theme.scss";`
      },
    }
  },
  chainWebpack: config => {
    // 已有配置排除掉svg
    config
      .module.rule("svg")
      .exclude.add(resolve('src/assets/svg'))
      .add(resolve('src/assets/svg/palette'))
      .add(resolve('src/assets/svg/object'));
    //配置svg
    config
      .module.rule('icons').test(/\.svg$/)
      .include.add(resolve('src/assets/svg'))
      .add(resolve('src/assets/svg/palette'))
      .add(resolve('src/assets/svg/object')).end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({ symbolId: 'icon-[name]' })
  }
});