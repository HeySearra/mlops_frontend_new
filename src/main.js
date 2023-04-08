import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import './assets/iconfont'
import '@/assets/css/global.css'
import {http,http_wang} from './axios.js'
import VueClipboard from 'vue-clipboard2'
import './assets/icons/iconfont'
import * as echarts from 'echarts';
import JsonViewer from 'vue-json-viewer'

Vue.use(Element)
Vue.use(VueClipboard)
Vue.use(JsonViewer)
Vue.config.productionTip = false
Vue.prototype.$http = http
Vue.prototype.$http_wang = http_wang
Vue.prototype.$echarts = echarts
Vue.prototype.$bus = new Vue() // 总线

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

