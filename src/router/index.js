import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import OnboardingView from '../views/OnboardingView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'

import { getCurrentFirebaseUser, getUserData } from '../services/userService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      component: RegisterView,
      meta: { guestOnly: true },
    },
    {
      path: '/forgot-password',
      component: ForgotPasswordView,
      meta: { guestOnly: true },
    },
    {
      path: '/onboarding',
      component: OnboardingView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/leaderboard',
      component: LeaderboardView,
      meta: { requiresAuth: true, requiresProfile: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const firebaseUser = await getCurrentFirebaseUser()

  if (to.meta.requiresAuth && !firebaseUser) {
    return '/login'
  }

  if (to.meta.guestOnly && firebaseUser) {
    const userData = await getUserData(firebaseUser.uid)

    return userData?.profileCompleted ? '/dashboard' : '/onboarding'
  }

  if (to.meta.requiresProfile && firebaseUser) {
    const userData = await getUserData(firebaseUser.uid)

    if (!userData?.profileCompleted) {
      return '/onboarding'
    }
  }

  return true
})

export default router
