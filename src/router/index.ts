import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/albums',
      name: 'albums',
      component: () => import('../views/PlaylistsView.vue'),
    },
    {
      path: '/songs',
      name: 'songs',
      component: () => import('../views/SongsView.vue'),
    },
  ],
})

export default router
