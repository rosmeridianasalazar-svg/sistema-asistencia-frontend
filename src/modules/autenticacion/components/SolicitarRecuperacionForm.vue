<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const emit = defineEmits(['volver'])
const authStore = useAuthStore()

const correo = ref('')
const cargando = ref(false)
const error = ref('')
const enviado = ref(false)
const mensajeExito = ref('')

async function enviarCorreo() {
  error.value = ''
  if (!correo.value.trim()) {
    error.value = 'Ingresa tu correo electrónico.'
    return
  }

  cargando.value = true
  const resultado = await authStore.solicitarRecuperacion(correo.value.trim().toLowerCase())
  cargando.value = false

  if (resultado.success) {
    enviado.value = true
    mensajeExito.value = resultado.mensaje
  } else {
    error.value = resultado.mensaje
  }
}
</script>

<template>
  <div>
    <div class="mb-3 mb-md-6">
      <div class="hello-text">¿Olvidaste tu clave?</div>
      <div class="morning-title">Recuperar acceso</div>
      <div class="login-subtitle">
        Ingresa tu correo personal y te enviaremos un enlace de confirmación
      </div>
    </div>

    <template v-if="!enviado">
      <v-form @submit.prevent="enviarCorreo" class="d-flex flex-column">
        <v-text-field
          v-model="correo"
          label="Correo electrónico"
          type="email"
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
          Enviar enlace
        </v-btn>

        <div class="text-center mt-3 mt-md-4">
          <span class="create-account-text" @click="emit('volver')">
            Volver al inicio de sesión
          </span>
        </div>
      </v-form>
    </template>

    <template v-else>
      <v-alert type="success" variant="tonal" density="compact" class="mb-4 custom-alert">
        {{ mensajeExito }}
      </v-alert>

      <div class="login-subtitle mb-6">
        Revisa tu bandeja de entrada o spam y haz clic en el enlace que te enviamos.
      </div>

      <v-btn
        color="#0c0c0c"
        block
        height="40"
        class="text-white submit-btn"
        @click="emit('volver')"
      >
        Volver al inicio de sesión
      </v-btn>
    </template>
  </div>
</template>

<style>
@import '@/modules/autenticacion/styles/auth.css';
</style>