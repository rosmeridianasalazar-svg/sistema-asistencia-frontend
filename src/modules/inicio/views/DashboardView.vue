<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

function salir() {
  authStore.cerrarSesion()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-container fluid class="pa-6">
    <v-row align="center" class="mb-6">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Panel principal</h1>

        <p class="text-medium-emphasis">Bienvenido al sistema de control de asistencia.</p>
      </v-col>

      <v-col cols="auto">
        <v-btn color="error" variant="outlined" prepend-icon="mdi-logout" @click="salir">
          Cerrar sesión
        </v-btn>
      </v-col>
    </v-row>

    <v-card rounded="lg" class="pa-5">
      <div class="d-flex align-center ga-3">
        <v-avatar color="primary">
          <v-icon icon="mdi-account" />
        </v-avatar>

        <div>
          <div class="font-weight-bold">
            {{ authStore.usuario?.nombre }}
            {{ authStore.usuario?.apellido_paterno }}
          </div>

          <div class="text-caption text-medium-emphasis">
            {{ authStore.usuario?.correo }}
          </div>
        </div>
      </div>

      <v-divider class="my-4" />

      <p>
        Rol:
        <strong>{{ authStore.usuario?.rol }}</strong>
      </p>

      <p class="mt-2">
        ID de usuario:
        <strong>{{ authStore.usuario?.id_usuario }}</strong>
      </p>
    </v-card>
  </v-container>
</template>
