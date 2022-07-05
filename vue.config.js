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
    // GraphQL Loader
    config.module
      .rule('graphql')
      .test(/\.graphql$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end()
      // Add another loader
      .use('other-loader')
      .loader('other-loader')
      .end()
  }
}
