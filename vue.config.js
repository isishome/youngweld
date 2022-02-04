module.exports = {
  chainWebpack: config => {
    config.plugins.delete('prefetch')
    config.plugins.delete('prefetch-index')
    if (process.env.NODE_ENV === 'development')
      config.resolve.alias.set('vue-i18n', 'vue-i18n/dist/vue-i18n.cjs.js')
    //config.resolve.alias.set('vue-i18n', 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js')
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
