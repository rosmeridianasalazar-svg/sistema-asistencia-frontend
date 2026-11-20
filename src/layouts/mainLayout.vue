<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import DialogoCerrarSesion from '@/components/dialogoCerrarSesion.vue'
import CampanaNoti from '@/modules/notificaciones/components/CampanaNoti.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const { mdAndUp } = useDisplay()

const drawer = ref(false)
// Controla si el menú lateral está colapsado (solo íconos)
const rail = ref(false)
// Controla la apertura de la ventana de confirmación
const dialogoCerrarSesion = ref(false)

watch(
  mdAndUp,
  (esDesktop) => {
    drawer.value = esDesktop
    if (!esDesktop) rail.value = false
  },
  { immediate: true },
)

const drawerPermanente = computed(() => mdAndUp.value)
const esModoMini = computed(() => mdAndUp.value && rail.value)

const usuario = computed(() => authStore.usuario)
const nombreCompleto = computed(() =>
  `${usuario.value?.nombre || ''} ${usuario.value?.apellido_paterno || ''}`.trim(),
)

// 1. Define qué roles pueden ver cada opción (igual que roles_permitidos en tu backend)
const menuItems = [
  { title: 'Inicio', icon: 'mdi-view-dashboard-outline', route: 'dashboard', roles: [] }, // [] = Todos los roles
  {
    title: 'Página NEXOS',
    icon: 'mdi-web',
    url: 'https://nexostiendas.experiencia.vip/',
    roles: [],
  },
  {
    title: 'Usuarios',
    icon: 'mdi-account-group-outline',
    route: 'usuarios',
    roles: ['Administrador'],
  },
  { title: 'Roles', icon: 'mdi-shield-account-outline', route: 'roles', roles: ['Administrador'] },
  {
    title: 'Horarios',
    icon: 'mdi-calendar-clock-outline',
    route: 'horarios',
    roles: ['Administrador', 'Empleado'],
  },
  { title: 'Asistencias', icon: 'mdi-calendar-check-outline', route: 'asistencias', roles: [] },
  { title: 'Notificaciones', icon: 'mdi-bell-outline', route: 'notificaciones', roles: [] },
  { title: 'Cumpleaños', icon: 'mdi-cake-variant-outline', route: 'cumpleanios', roles: [] },
  { title: 'Sustentación', icon: 'mdi-file-document-outline', route: 'reportes', roles: [] },
  {
    title: 'Configuración',
    icon: 'mdi-cog-outline',
    route: 'configuracion',
    roles: ['Administrador'],
  },
]

// 2. Filtra el menú según el rol del usuario
const menuFiltrado = computed(() => {
  const user = authStore.usuario
  // Extrae el nombre del rol sin importar si el serializer lo envía como objeto o texto
  const rolUsuario = user?.id_rol?.nombre || user?.rol || user?.nombre_rol || ''

  return menuItems.filter((item) => {
    // Si roles está vacío, cualquier usuario logueado (Practicante, Empleado, Admin) lo ve
    if (!item.roles || item.roles.length === 0) return true

    // Si tiene roles definidos, verifica si el rol del usuario está en la lista
    return item.roles.includes(rolUsuario)
  })
})

function navegar(item) {
  if (item.url) {
    window.open(item.url, '_blank', 'noopener,noreferrer')
  } else {
    router.push({ name: item.route })
  }

  if (!mdAndUp.value) {
    drawer.value = false
  }
}

function salir() {
  authStore.cerrarSesion()
  router.push({ name: 'login' })
}
</script>

<template>
  <!-- Altura dinámica: 80px en laptop para un logo grande, 74px en celular -->
  <v-app-bar color="#111111" elevation="1" :height="mdAndUp ? 80 : 74">
    <v-app-bar-nav-icon color="white" @click="mdAndUp ? (rail = !rail) : (drawer = !drawer)" />
    <img
      src="https://i.postimg.cc/NGkbyD4C/nexos2-0.png"
      alt="Logo NEXOS"
      :style="{
        height: mdAndUp ? '88px' : '70px',
        width: mdAndUp ? '125px' : '140px',
        objectFit: 'contain',
        objectPosition: 'left center',
        marginLeft: mdAndUp ? '10px' : '6px',
      }"
    />

    <v-spacer />
    <CampanaNoti />

    <v-menu location="bottom end" transition="scale-transition" :offset="8">
      <template #activator="{ props }">
        <div
          v-bind="props"
          class="d-flex align-center ga-1 ga-sm-2 mr-2 mr-sm-4 pa-1 px-sm-2 rounded-lg cursor-pointer perfil-hover"
        >
          <v-avatar color="white" :size="mdAndUp ? 42 : 28">
            <v-icon icon="mdi-account" color="#F2690D" :size="mdAndUp ? 24 : 18" />
          </v-avatar>

          <div class="text-white">
            <div class="text-caption text-sm-body-2 font-weight-bold d-flex align-center">
              <v-icon icon="mdi-chevron-down" size="18" class="ml-1" />
            </div>
          </div>
        </div>
      </template>

      <!-- Tarjeta desplegable al hacer clic en el perfil -->
      <v-card min-width="220" rounded="lg" elevation="4">
        <div class="pa-3 bg-grey-lighten-4">
          <div class="text-subtitle-2 font-weight-bold text-grey-darken-4">
            {{ nombreCompleto || 'Usuario' }}
          </div>
          <div class="text-caption text-grey-darken-1 text-truncate">
            {{ usuario?.correo }}
          </div>
        </div>

        <v-divider />

        <v-list density="compact" class="pa-1">
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar sesión"
            base-color="error"
            rounded="md"
            @click="dialogoCerrarSesion = true"
          />
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    :permanent="drawerPermanente"
    :temporary="!drawerPermanente"
    :rail="esModoMini"
    rail-width="72"
    color="#111111"
    width="200"
  >
    <!-- Lista de navegación -->
    <v-list nav density="default" class="pa-3 mt-1">
      <v-list-item
        v-for="item in menuFiltrado"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="Boolean(item.route && route.name === item.route)"
        color="#F2690D"
        base-color="white"
        rounded="lg"
        class="mb-1"
        @click="navegar(item)"
      >
        <template v-if="item.url && !esModoMini" #append>
          <v-icon icon="mdi-open-in-new" size="14" style="opacity: 0.65" />
        </template>

        <v-tooltip v-if="esModoMini" activator="parent" location="end">
          {{ item.title }}
        </v-tooltip>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-main class="bg-grey-lighten-4">
    <v-container fluid class="pa-3 pa-sm-5 pa-md-6">
      <router-view />
    </v-container>
  </v-main>

  <!-- Ventana modal de confirmación -->
  <DialogoCerrarSesion v-model="dialogoCerrarSesion" @confirmar="salir" />
</template>

<style scoped>
.perfil-hover {
  transition: background-color 0.2s ease;
}
.perfil-hover:hover {
  background-color: rgba(255, 255, 255, 0.12);
}
</style>