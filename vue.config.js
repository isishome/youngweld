module.exports = {
  chainWebpack: config => {
    config.plugins.delete('prefetch')
    config.plugins.delete('prefetch-index')
    config.resolve.alias.set('vue-i18n', `vue-i18n/dist/vue-i18n.cjs${process.env.NODE_ENV === 'development' ? '' : '.prod'}.js`)
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
  devServer: {
    client: {
      overlay: false
    }
  }
}
