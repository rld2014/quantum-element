import { createRouter, createWebHashHistory } from 'vue-router'

let routes = []
const contexts = require.context('@/pages', true, /\.vue$/)
contexts.keys().forEach(value => {
  const path = value.substr(value.indexOf('/'), value.lastIndexOf('.') - 1)
  const componentLocation = value.substr(value.indexOf('.') + 1, value.lastIndexOf('.') - 1)
  const componentName = componentLocation.substr(componentLocation.lastIndexOf('/') + 1)
  const route = {
    path: path,
    name: componentName,
    component: () => import(`@/pages${componentLocation}`)
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
