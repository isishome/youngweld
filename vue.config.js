module.exports = {
  chainWebpack: config => {
    config.plugins.delete('prefetch')
    config.plugins.delete('prefetch-index')
    // config.module
    //   .rule('i18n')
    //   .test(/\.(json5?|ya?ml)$/)
    //   .type('javascript/auto')
    //   .use('i18n')
    //   .loader('@intlify/vue-i18n-loader')
    // config.resolve.alias.set('vue-i18n', process.env.NODE_ENV === 'development' ? 'vue-i18n/dist/vue-i18n.cjs.js' : 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js')
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Youngil Electric'
        return args
      })
  },
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },
  transpileDependencies: [
    'quasar'
  ],
  outputDir: '../../publish/youngweld'
}
