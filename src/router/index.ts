import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Game from '../views/Game.vue'
import Admin from '../views/Admin.vue'
import Wordlists from '../views/Wordlists.vue'
import Analytics from '../views/Analytics.vue'
import Gamification from '../views/Gamification.vue'
import SpacedRepetition from '../views/SpacedRepetition.vue'
import BibleTyping from '../views/BibleTyping.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
    meta: { requiresAuth: true }
  },
  {
    path: '/wordlists',
    name: 'Wordlists',
    component: Wordlists,
    meta: { requiresAuth: true, requiresRole: 'teacher' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true, requiresRole: 'teacher' }
  },
  {
    path: '/gamification',
    name: 'Gamification',
    component: Gamification,
    meta: { requiresAuth: true }
  },
  {
    path: '/spaced-repetition',
    name: 'SpacedRepetition',
    component: SpacedRepetition,
    meta: { requiresAuth: true, requiresRole: 'teacher' }
  },
  {
    path: '/bible-typing',
    name: 'BibleTyping',
    component: BibleTyping,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresRole) {
    const requiredRole = to.meta.requiresRole as string
    if (requiredRole === 'admin' && !authStore.isAdmin) {
      next('/dashboard')
    } else if (requiredRole === 'teacher' && !authStore.isTeacher) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router