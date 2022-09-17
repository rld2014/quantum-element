import { createApp } from 'vue'
import 'element-plus/theme-chalk/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import router from './router'
import installElementPlus from './plugins/element'
import * as echarts from 'echarts';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
installElementPlus(app)

app.use(router).mount('#app')