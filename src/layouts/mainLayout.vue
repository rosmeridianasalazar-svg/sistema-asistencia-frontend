<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const { mdAndUp } = useDisplay()

const drawer = ref(false)

watch(
  mdAndUp,
  (esDesktop) => {
    drawer.value = esDesktop
  },
  { immediate: true },
)

const drawerPermanente = computed(() => mdAndUp.value)

const usuario = computed(() => authStore.usuario)

const nombreCompleto = computed(() =>
  `${usuario.value?.nombre || ''} ${usuario.value?.apellido_paterno || ''}`.trim(),
)

const menuItems = [
  { title: 'Inicio', icon: 'mdi-view-dashboard-outline', route: 'dashboard' },
  { title: 'Usuarios', icon: 'mdi-account-group-outline', route: 'usuarios' },
  { title: 'Roles', icon: 'mdi-shield-account-outline', route: 'roles' },
  { title: 'Horarios', icon: 'mdi-calendar-clock-outline', route: 'horarios' },
  { title: 'Asistencias', icon: 'mdi-calendar-check-outline', route: 'asistencias' },
]

const paginaActual = computed(
  () => menuItems.find((item) => item.route === route.name)?.title || 'Sistema',
)

function navegar(nombreRuta) {
  router.push({ name: nombreRuta })

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
  <v-navigation-drawer
    v-model="drawer"
    :permanent="drawerPermanente"
    :temporary="!drawerPermanente"
    color="#172337"
    width="260"
  >
    <div class="pa-5">
      <div class="d-flex align-center ga-3">
        <v-avatar color="primary" rounded="lg" size="42">
          <v-icon icon="mdi-fingerprint" color="white" size="26" />
        </v-avatar>

        <div>
          <div class="text-white font-weight-bold">Control de asistencia</div>
          <div class="text-grey-lighten-1 text-caption">Sistema de gestión</div>
        </div>
      </div>
    </div>

    <v-divider color="white" opacity="0.12" />

    <v-list nav density="comfortable" class="pa-3">
      <v-list-item
        v-for="item in menuItems"
        :key="item.route"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="route.name === item.route"
        color="white"
        base-color="grey-lighten-1"
        rounded="lg"
        class="mb-1"
        @click="navegar(item.route)"
      />
    </v-list>

    <template #append>
      <v-divider color="white" opacity="0.12" />

      <v-list class="pa-3">
        <v-list-item
          prepend-icon="mdi-logout"
          title="Cerrar sesión"
          rounded="lg"
          class="text-white"
          @click="salir"
        />
      </v-list>
    </template>
  </v-navigation-drawer>

  <v-main class="bg-grey-lighten-4">
    <v-app-bar color="white" elevation="0" border="b">
      <v-app-bar-nav-icon v-if="!mdAndUp" @click="drawer = !drawer" />

      <v-app-bar-title class="font-weight-bold text-grey-darken-3">
        {{ paginaActual }}
      </v-app-bar-title>

      <v-spacer />

      <div class="d-flex align-center ga-2 mr-4">
        <v-avatar color="primary" size="36">
          <v-icon icon="mdi-account" color="white" />
        </v-avatar>

        <div class="d-none d-sm-block">
          <div class="text-body-2 font-weight-medium">
            {{ nombreCompleto || 'Usuario' }}
          </div>
          <div class="text-caption text-grey">
            {{ usuario?.correo }}
          </div>
        </div>
      </div>
    </v-app-bar>

    <v-container fluid class="pa-3 pa-sm-5 pa-md-6">
      <router-view />
    </v-container>
  </v-main>
</template>
