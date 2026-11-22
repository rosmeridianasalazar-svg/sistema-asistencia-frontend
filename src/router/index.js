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
    path: '/restablecer-password',
    name: 'restablecer-password',
    component: () => import('@/modules/autenticacion/views/RestablecerPasswordView.vue'),
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
        path: 'perfil',
        name: 'perfil',
        component: () => import('@/modules/perfil/views/PerfilView.vue'),
      },

      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('@/modules/usuarios/views/UsuariosView.vue'),
        meta: { requiresAuth: true, roles: ['Administrador'] },
      },
      {
        path: '/huellas',
        name: 'huellas',
        component: () => import('@/modules/huellas/views/HuellasView.vue'),
        meta: {
          requiresAuth: true,
          roles: ['Administrador'],
        },
      },
      {
        path: 'asistencias',
        name: 'asistencias',
        component: () => import(
          '@/modules/asistencias/views/AsistenciasView.vue'
        ),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'asistencias/:usuarioId',
        name: 'asistencias-usuario',
        component: () => import(
          '@/modules/asistencias/views/AsistenciasUsuarioView.vue'
        ),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'horarios',
        name: 'horarios',
        component: () => import('@/modules/horarios/views/HorariosView.vue'),
      },

      {
        path: 'notificaciones',
        name: 'notificaciones',
        component: () => import('@/modules/notificaciones/views/NotificacionesView.vue'),
      },
      {
        path: 'cumpleanios',
        name: 'cumpleanios',
        component: () => import('@/modules/cumpleanios/views/CumpleaniosView.vue'),
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

  const requiereAutenticacion = to.matched.some(
    (record) => record.meta.requiresAuth,
  )

  // Proteger rutas privadas.
  if (requiereAutenticacion && !authStore.estaAutenticado) {
    return { name: 'login' }
  }

  // Evitar que un usuario autenticado vuelva al login.
  if (to.meta.guestOnly && authStore.estaAutenticado) {
    return { name: 'dashboard' }
  }

  // Comprobar permisos por rol.
  const rolesPermitidos = to.meta.roles

  if (rolesPermitidos?.length) {
    const usuario = authStore.usuario

    const rolUsuario =
      usuario?.id_rol?.nombre ||
      usuario?.rol ||
      usuario?.nombre_rol ||
      ''

    if (!rolesPermitidos.includes(rolUsuario)) {
      return { name: 'dashboard' }
    }
  }

  return true
})

export default router