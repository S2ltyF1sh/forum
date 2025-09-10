import { createRouter, createWebHistory } from 'vue-router'
import login from '@/login/indexLogin.vue'
import view from '@/main/indexMain.vue'
import post from '@/components/mainPost.vue'
import aside from '@/components/leftAside.vue'
const routes = [
  {
    path: '/login',
    name: 'login',
    component: login
  },
  {
    path: '/',
    name: 'view',
    component: view
  },
  {
    path: '/post',
    name: 'post',
    component: post
  },
  {
    path: '/aside',
    name: 'aside',
    component: aside
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
export default router
