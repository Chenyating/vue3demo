import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'

const pinia = createPinia()
pinia.use(piniaPersist)

Vue.use(pinia)
Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  pinia,
  router,
  render: (h) => h(App),
}).$mount('#app')
