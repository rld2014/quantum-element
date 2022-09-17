import { createRouter, createWebHashHistory } from 'vue-router'

let routes = [
  // {
  //   path: '/',
  //   name: 'Welcome',
  //   component: () => import('@/pages/Welcome.vue')
  // },
  // {
  //   path: '/About',
  //   name: 'About',
  //   component: () => import( '@/pages/About.vue')
  // },
  // {
  //   path: '/ManualMode',
  //   name: 'ManualMode',
  //   component: () => import('@/pages/ManualMode.vue')
  // },
  // {
  //   path: '/testPage',
  //   name: 'testPage',
  //   component: () => import('@/pages/test.vue')
  // },
  // {
  //   path:'/SpectrumMeter',
  //   name:'SpectrumMeter',
  //   component:()=>import('@/pages/SpectrumMeter.vue')
  // },
  // {
  //   path:'/Settings',
  //   name:'Settings',
  //   component:()=>import('@/pages/Settings.vue')
  // }
]
const contexts = require.context('@/pages', true, /\.vue$/)
contexts.keys().forEach(value => {
  const path = value.substr(value.indexOf('/'), value.lastIndexOf('.') - 1)
  const componentLocation = value.substr(value.indexOf('.') + 1, value.lastIndexOf('.') - 1)
  const componentName = componentLocation.substr(componentLocation.lastIndexOf('/') + 1)
  const route = {
    path: path,
    name: componentName,
    component: () => import(/* webpackChunkName: "alarm" */ `@/pages${componentLocation}`)
  }
  //console.log(route)
  routes.push(route)
})

routes.push({
  path: '/',
  name: 'Main',
  redirect:'/Home'
})

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
