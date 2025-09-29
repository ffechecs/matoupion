import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import Dashboard from '../views/Dashboard.vue'
import Exercise from '../views/Exercise.vue'
import Puzzle from '../views/Puzzle.vue'
import Reset from '../views/Reset.vue'

import { useCookie } from '../utils/useCookie'

/* pour diminuer la taille des chunks, on importe les composants en dessous
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import VerificationEmail from '../views/VerificationEmail.vue'
import IndexExercices from '../views/IndexExercices.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
*/

const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const IndexExercices = () => import('../views/IndexExercices.vue')
const ForgotPassword = () => import('../views/ForgotPassword.vue')
const ResetPassword = () => import('../views/ResetPassword.vue')
const VerificationEmail = () => import('../views/VerificationEmail.vue')



const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/inscription',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path:'/logout',
      name:'logout',
      meta: { requiresAuth: true },
      redirect: to => {
        const authStore = useAuthStore();
        authStore.logout();
        return "/login";
      },
    },
    {
      path: '/verification-email',
      name: 'verification-email',
      component: VerificationEmail,
      meta: { requiresGuest: true }
    },
    {
      path: '/reinitialiser-mot-de-passe',
      name: 'reset-password',
      component: ResetPassword,
      meta: { requiresGuest: true }
    },
    {
      path: '/mot-de-passe-oublie',
      name: 'forgot-password',
      component: ForgotPassword,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/theme/:themeId/exercices/:exerciseNumber?',
      name: 'exercisesByTheme',
      component: Exercise,
      meta: { requiresAuth: true }
    },
    {
      path: '/exercices/:exerciseId?',
      name: 'exercisesById',
      component: Exercise,
      meta: { requiresAuth: true }
    },
    {
      path: '/exercices/verif/:exerciseId?',
      name: 'exercisesVerifById',
      component: Exercise,
      meta: { requiresAuth: true, verif: true }
    },
    {
      path: '/puzzles/:puzzleId?',
      name: 'puzzles',
      component: Puzzle,
      meta: { requiresAuth: true }
    },
    {
      path: '/reset',
      name: 'reset',
      component: Reset,
      meta: { requiresAuth: true }
    },
    {
      path: '/index-exercices',
      name: 'index-xercices',
      component: IndexExercices,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const tokenCookie = useCookie('accessToken')

  const { user } = authStore;

  // IF route is verif , reset or liste, check if user is admin
  if (to.meta.path == 'verif' || to.meta.path == 'reset' || to.meta.path == 'index-exercices') {
    if (!user.admin) {
      next('/')
      return
    }
  }


  if( false  ) {
    console.log(from)
  }

  // Si on a un token mais que le store n'est pas initialisé
  if (tokenCookie.value && !authStore.isAuthenticated) {
    await authStore.initializeFromCookies()
  }

  // Route nécessitant d'être authentifié
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
  }

  // Routes nécessitant d'être invité
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router