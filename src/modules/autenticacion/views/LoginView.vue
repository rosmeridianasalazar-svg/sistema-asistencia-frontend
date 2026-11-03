<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const correo = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')

async function ingresar() {
  error.value = ''

  if (!correo.value.trim() || !password.value) {
    error.value = 'Completa el correo y la contraseña.'
    return
  }

  cargando.value = true

  const resultado = await authStore.iniciarSesion(correo.value.trim().toLowerCase(), password.value)

  cargando.value = false

  if (resultado.success) {
    router.push({ name: 'dashboard' })
  } else {
    error.value = resultado.mensaje
  }
}
</script>

<template>
  <v-container fluid class="login-container fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="9" md="6" lg="4">
        <v-card class="pa-6 pa-sm-8" rounded="xl" elevation="4">
          <div class="text-center mb-7">
            <v-avatar color="primary" size="72" class="mb-4">
              <v-icon icon="mdi-fingerprint" size="42" />
            </v-avatar>

            <h1 class="text-h5 font-weight-bold">Control de Asistencia</h1>

            <p class="text-medium-emphasis mt-2">Ingresa con tus credenciales</p>
          </div>

          <v-form @submit.prevent="ingresar">
            <v-text-field
              v-model="correo"
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              prepend-inner-icon="mdi-email-outline"
              type="email"
              variant="outlined"
              autocomplete="username"
              :disabled="cargando"
              class="mb-2"
            />

            <v-text-field
              v-model="password"
              label="Contraseña"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :type="mostrarPassword ? 'text' : 'password'"
              variant="outlined"
              autocomplete="current-password"
              :disabled="cargando"
              @click:append-inner="mostrarPassword = !mostrarPassword"
            />

            <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-3 mb-4">
              {{ error }}
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              rounded="lg"
              :loading="cargando"
              class="mt-5"
            >
              Iniciar sesión
            </v-btn>
          </v-form>

          <div class="text-center mt-6">
            <span class="text-caption text-medium-emphasis">
              Sistema de Control de Asistencia
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-container {
  background: #f4f6fa;
}
</style>
