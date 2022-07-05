import './plugins'
import './registerServiceWorker'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { apolloProvider } from './vue-apollo-v3'

Vue.config.productionTip = false
Vue.config.devtools = true

new Vue({
  router,
  apolloProvider,
  store,
  render: h => h(App)
}).$mount('#app')
