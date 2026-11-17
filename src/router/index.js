// import { createRouter, createWebHistory } from 'vue-router'
// import { useAuthStore } from '@/modules/autenticacion/store/authStore'

// const routes = [
//   {
//     path: '/',
//     redirect: '/login',
//   },
//   {
//     path: '/login',
//     name: 'login',
//     component: () => import('@/modules/autenticacion/views/LoginView.vue'),
//     meta: {
//       guestOnly: true,
//     },
//   },
//   {
//     path: '/dashboard',
//     name: 'dashboard',
//     component: () => import('@/modules/inicio/views/DashboardView.vue'),
//     meta: {
//       requiresAuth: true,
//     },
//   },

//   {
//     path: '/usuarios',
//     name: 'usuarios',
//     component: () => import('@/modules/usuarios/views/UsuariosView.vue'),
//     meta: { requiresAuth: true },
//   },
// ]

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// })

// router.beforeEach((to) => {
//   const authStore = useAuthStore()

//   if (to.meta.requiresAuth && !authStore.estaAutenticado) {
//     return { name: 'login' }
//   }

//   if (to.meta.guestOnly && authStore.estaAutenticado) {
//     return { name: 'dashboard' }
//   }
// })

// export default router



import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/autenticacion/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/mainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/modules/inicio/views/DashboardView.vue'),
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('@/modules/usuarios/views/UsuariosView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.matched.some(record => record.meta.requiresAuth) && !authStore.estaAutenticado) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && authStore.estaAutenticado) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
