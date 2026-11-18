<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import SolicitarRecuperacionForm from '@/modules/autenticacion/components/SolicitarRecuperacionForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const vistaActual = ref('login') // 'login' | 'recuperar'
const correo = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')

const saludoPorHora = computed(() => {
  const hora = new Date().getHours()
  if (hora >= 5 && hora < 12) return 'Buenos días'
  if (hora >= 12 && hora < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const nombreExtraido = computed(() => {
  const texto = correo.value.trim()
  if (!texto) return ''
  const antesDelArroba = texto.split('@')[0]
  const primerNombre = antesDelArroba.split(/[._-]/)[0]

  if (!primerNombre) return ''
  return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase()
})

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
  <div class="login-wrapper">
    
    <v-card 
      class="shadow-card overflow-hidden" 
      max-width="720" 
      width="100%"
    >
      <v-row no-gutters class="login-row">
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

            <div class="welcome-title">¡Bienvenido!</div>
            <div class="accent-divider my-1 my-md-2"></div>
            <div class="welcome-subtitle">Sistema de asistencia biométrica</div>
          </div>
        </v-col>

        <v-col 
          cols="12" 
          md="7" 
          class="form-panel pa-5 pa-sm-7 pa-md-9 bg-white d-flex flex-column justify-center"
        >
          
          <div v-if="vistaActual === 'login'">
            <div class="mb-3 mb-md-6">
              <div class="hello-text">¡Hola!</div>
              <div class="morning-title">
                {{ saludoPorHora }}<span v-if="nombreExtraido">, {{ nombreExtraido }}</span>
              </div>
              <div class="login-subtitle">Inicia sesión en tu cuenta</div>
            </div>

            <v-form @submit.prevent="ingresar" class="d-flex flex-column">
              
              <v-text-field
                v-model="correo"
                label="Correo electrónico"
                type="email"
                variant="underlined"
                color="orange-darken-2"
                hide-details="auto"
                autocomplete="username"
                :disabled="cargando"
                class="mb-2 mb-md-4 custom-input"
              />

              <v-text-field
                v-model="password"
                label="Contraseña"
                :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="mostrarPassword ? 'text' : 'password'"
                variant="underlined"
                color="orange-darken-2"
                hide-details="auto"
                autocomplete="current-password"
                :disabled="cargando"
                class="mb-2 custom-input"
                @click:append-inner="mostrarPassword = !mostrarPassword"
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
                class="mt-5 mt-md-10 text-white submit-btn"
                :loading="cargando"
              >
                Ingresar
              </v-btn>
              
              <div class="text-center mt-3 mt-md-4">
                <span class="create-account-text" @click="vistaActual = 'recuperar'">
                  Restablecer contraseña
                </span>
              </div>
            </v-form>
          </div>
          <SolicitarRecuperacionForm 
            v-else 
            @volver="vistaActual = 'login'" 
          />

        </v-col>

      </v-row>
    </v-card>

  </div>
</template>
<style>
@import '@/modules/autenticacion/styles/auth.css';
</style>
