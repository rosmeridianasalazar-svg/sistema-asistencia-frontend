<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const correo = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')
const saludoPorHora = computed(() => {
  const hora = new Date().getHours()
  if (hora >= 5 && hora < 12) return 'Buenos días'
  if (hora >= 12 && hora < 19) return 'Buenas tardes'
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
    <v-card class="shadow-card overflow-hidden" max-width="720" width="100%">
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
              <span class="create-account-text">Restablecer contraseña</span>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<style scoped>
.login-wrapper {
  background: linear-gradient(rgb(249, 247, 247) 0%, #0c0c0c 100%);
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.shadow-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
  border-radius: 10px !important;
}

.login-row {
  min-height: 450px;
}

@media (min-width: 960px) {
  .nexos-panel {
    flex: 0 0 46% !important;
    max-width: 46% !important;
  }
  .form-panel {
    flex: 0 0 54% !important;
    max-width: 54% !important;
  }
}

.nexos-panel {
  overflow: hidden;
  background-color: black !important;
}

.nexos-logo {
  max-width: 150px;
  height: auto;
  object-fit: contain;
  display: block;
}

.accent-divider {
  width: 36px;
  height: 3px;
  background-color: #f57c00;
  border-radius: 2px;
}

.welcome-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.welcome-subtitle {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 300;
}

.hello-text {
  font-size: 13px;
  color: #757575;
  font-weight: 500;
}

.morning-title {
  font-size: 20px;
  font-weight: 700;
  color: #f57c00;
  line-height: 1.25;
  margin-top: 2px;
  word-break: break-word;
}

.login-subtitle {
  font-size: 13px;
  color: #616161;
  margin-top: 6px;
}

:deep(.custom-input .v-field__input) {
  font-size: 14px !important;
  min-height: 38px !important;
  padding-top: 30px !important;
  padding-bottom: 4px !important;
}

:deep(.custom-input .v-field-label) {
  font-size: 13px !important;
}

:deep(.custom-input .v-icon) {
  font-size: 19px !important;
  opacity: 0.7;
}

.custom-alert {
  font-size: 12.5px !important;
  line-height: 1.4 !important;
  padding: 10px 12px !important;
  border-radius: 6px !important;
  min-height: 42px !important;
  height: auto !important;
  display: flex !important;
  align-items: center !important;
  overflow: visible !important;
}

:deep(.custom-alert .v-alert__prepend) {
  margin-inline-end: 10px !important;
  align-self: center !important;
  margin-top: 0 !important;
}

:deep(.custom-alert .v-alert__content) {
  align-self: center !important;
  overflow: visible !important;
}

.submit-btn {
  font-size: 13px !important;
  font-weight: 600 !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
  border-radius: 6px !important;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.25s ease !important;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(243, 127, 12, 0.45) !important;
  background-color: #ff8c1a !important;
}

.submit-btn:active {
  transform: translateY(0px) scale(0.98);
  box-shadow: 0 3px 10px rgba(243, 127, 12, 0.3) !important;
}

.submit-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
  transform: skewX(-20deg);
  transition: left 0.55s ease;
}

.submit-btn:hover::after {
  left: 130%;
}

.create-account-text {
  font-size: 12px;
  color: #757575;
  cursor: pointer;
  transition: color 0.2s;
}

.create-account-text:hover {
  color: #f57c00;
}

.z-1 {
  z-index: 1;
}

@media (max-width: 959px) {
  .login-wrapper {
    padding: 12px;
  }

  .shadow-card {
    max-width: 420px !important;
  }

  .login-row {
    min-height: auto;
  }

  .nexos-logo {
    max-width: 95px;
  }

  .welcome-title {
    font-size: 17px;
  }

  .welcome-subtitle {
    font-size: 11.5px;
  }

  .morning-title {
    font-size: 18px;
  }

  :deep(.custom-input .v-field__input) {
    padding-top: 22px !important;
    min-height: 34px !important;
  }

  .shape-1 {
    width: 130px;
    height: 130px;
    bottom: -75px;
    left: -30px;
  }

  .shape-2 {
    width: 160px;
    height: 160px;
    bottom: -95px;
    right: -45px;
  }
}
</style>
