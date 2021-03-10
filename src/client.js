import Vue from 'vue'
import Client from './Client.vue'
import '@/components/UseableComponents' //全局注册自定义组件，要在根vue实例化之前
import '@/styles/reset.css'

Vue.config.productionTip = false

new Vue({
  render: h => h(Client)
}).$mount('#app')

//工程保存模板
