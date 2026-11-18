<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmarPassword = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')
const exito = ref(false)

async function guardarPassword() {
  error.value = ''

  if (!route.query.token) {
    error.value = 'El enlace no contiene un código de verificación válido.'
    return
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  if (password.value !== confirmarPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  cargando.value = true
  const resultado = await authStore.confirmarRecuperacion({
    token: route.query.token,
    password: password.value,
  })
  cargando.value = false

  if (resultado.success) {
    exito.value = true
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2500)
  } else {
    error.value = resultado.mensaje
  }
}
</script>

<template>
  <div class="login-wrapper">
    <v-card class="shadow-card overflow-hidden" max-width="720" width="100%">
      <v-row no-gutters class="login-row">
        
        <!-- Panel Izquierdo idéntico al Login -->
        <v-col
          cols="12"
          md="5"
          class="nexos-panel d-flex flex-column align-center text-center text-white position-relative py-4 px-5 pa-md-6"
        >
          <div class="z-1 my-auto d-flex flex-column align-center">
            <img
              src="https://i.postimg.cc/NGkbyD4C/nexos2-0.png"
              alt="Logo Nexos"
              class="nexos-logo mb-2 mb-md-5"
            />
            <div class="welcome-title">Seguridad</div>
            <div class="accent-divider my-1 my-md-2"></div>
            <div class="welcome-subtitle">Sistema de asistencia biométrica</div>
          </div>
        </v-col>

        <!-- Panel Derecho: Formulario para la nueva clave -->
        <v-col
          cols="12"
          md="7"
          class="form-panel pa-5 pa-sm-7 pa-md-9 bg-white d-flex flex-column justify-center"
        >
          <div class="mb-3 mb-md-6">
            <div class="hello-text">Restablecimiento</div>
            <div class="morning-title">Nueva contraseña</div>
            <div class="login-subtitle">Crea una clave segura para ingresar a tu cuenta</div>
          </div>

          <template v-if="!exito">
            <v-form @submit.prevent="guardarPassword" class="d-flex flex-column">
              <v-text-field
                v-model="password"
                label="Nueva contraseña"
                :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="mostrarPassword ? 'text' : 'password'"
                variant="underlined"
                color="orange-darken-2"
                hide-details="auto"
                :disabled="cargando"
                class="mb-2 mb-md-4 custom-input"
                @click:append-inner="mostrarPassword = !mostrarPassword"
              />

              <v-text-field
                v-model="confirmarPassword"
                label="Confirmar contraseña"
                :type="mostrarPassword ? 'text' : 'password'"
                variant="underlined"
                color="orange-darken-2"
                hide-details="auto"
                :disabled="cargando"
                class="mb-2 custom-input"
              />

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-3 mb-1 custom-alert"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                color="#f37f0c"
                block
                height="40"
                class="mt-5 mt-md-8 text-white submit-btn"
                :loading="cargando"
              >
                Guardar contraseña
              </v-btn>
            </v-form>
          </template>

          <template v-else>
            <v-alert type="success" variant="tonal" density="compact" class="mb-4 custom-alert">
              ¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...
            </v-alert>
          </template>
        </v-col>

      </v-row>
    </v-card>
  </div>
</template>
<style>
@import '@/modules/autenticacion/styles/auth.css';
</style>