module.exports = {
  chainWebpack: config => {
    config.plugins.delete('prefetch')
    //config.resolve.alias.set('vue-i18n', 'vue-i18n/dist/vue-i18n.cjs.js')
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
  outputDir: '../../publish/vue3'
}