import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../api'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/models', name: 'models', component: () => import('../views/ModelsView.vue') },
    { path: '/studio', name: 'studio', component: () => import('../views/StudioView.vue') },
    { path: '/docs', name: 'docs', component: () => import('../views/DocsView.vue') },
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/AuthView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/AuthView.vue') },
    {
      path: '/console',
      component: () => import('../components/ConsoleLayout.vue'),
      meta: { auth: true },
      children: [
        { path: '', name: 'overview', component: () => import('../views/console/OverviewView.vue') },
        { path: 'keys', name: 'keys', component: () => import('../views/console/KeysView.vue') },
        { path: 'billing', name: 'billing', component: () => import('../views/console/BillingView.vue') },
        { path: 'usage', name: 'usage', component: () => import('../views/console/UsageView.vue') },
        { path: 'playground', name: 'playground', component: () => import('../views/console/PlaygroundView.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.auth && !getToken()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
