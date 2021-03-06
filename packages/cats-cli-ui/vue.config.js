module.exports = {
  pluginOptions: {
    apollo: {
      enableMocks: false,
      enableEngine: false,
      lintGQL: false
    }
  },

  configureWebpack: {
    resolve: {
      symlinks: false
    }
  },

  css: {
    loaderOptions: {
      stylus: {
        stylusOptions: {
          import: ['~@/style/imports']
        }
      }
    }
  },
  parallel: !process.env.CIRCLECI,

  chainWebpack: config => {
      config.module
          .rule('gql')
          .test(/\.(gql|graphql)$/)
          .use('gql-loader')
          .loader(require.resolve('graphql-tag/loader'))
          .end()
  }
}
