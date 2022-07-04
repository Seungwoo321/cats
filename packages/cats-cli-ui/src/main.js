import './plugins'
import './registerServiceWorker'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { apolloProvider } from './vue-apollo-v2'
import gql from 'graphql-tag'

window.gql = gql

Vue.config.productionTip = false
Vue.config.devtools = true

new Vue({
  router,
  apolloProvider,
  store,
  render: h => h(App)
}).$mount('#app')
