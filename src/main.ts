import { createApp } from 'vue'
import 'element-plus/theme-chalk/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import App from './App.vue';
import router from './router';
import installElementPlus from './plugins/element'
import * as echarts from 'echarts';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import MathJax from '@/scripts/MathJax.js' 
import { Vue } from 'vue-class-component';
import pinia from '@/storages'
Object.assign(Vue.prototype, {MathJax})
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
installElementPlus(app)
app.use(pinia).use(router).mount('#app')