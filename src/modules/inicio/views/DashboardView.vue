<script setup>
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const authStore = useAuthStore()
</script>

<template>
  <v-container fluid class="pa-0">
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold">Bienvenido al sistema de control de asistencia</h1>

      <!-- <p class="text-medium-emphasis"></p> -->
    </div>

    <v-card rounded="lg" elevation="1" class="pa-5">
      <div class="d-flex align-center ga-3">
        <v-avatar color="white" size="88">
          <v-icon icon="mdi-account" color="#F2690D" />
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

      <div class="text-body-2">
        <p>
          Rol:
          <strong>{{ authStore.usuario?.rol }}</strong>
        </p>

        <p class="mt-2">
          ID de usuario:
          <strong>{{ authStore.usuario?.id_usuario }}</strong>
        </p>
      </div>
    </v-card>
  </v-container>
</template>
