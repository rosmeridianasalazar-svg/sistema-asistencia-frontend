<script setup>
import { ref } from 'vue'
import perfilService from '../services/perfilService'

const emit = defineEmits(['notificar'])

const passwordActual = ref('')
const passwordNueva = ref('')
const passwordConfirmar = ref('')
const verClaves = ref(false)
const guardando = ref(false)

async function actualizarPassword() {
  if (!passwordActual.value || !passwordNueva.value || !passwordConfirmar.value) {
    emit('notificar', 'Completa todos los campos de contraseña.', 'error')
    return
  }
  if (passwordNueva.value.length < 6) {
    emit('notificar', 'La nueva contraseña debe tener al menos 6 caracteres.', 'error')
    return
  }
  if (passwordNueva.value !== passwordConfirmar.value) {
    emit('notificar', 'Las contraseñas nuevas no coinciden.', 'error')
    return
  }

  guardando.value = true
  try {
    const { data } = await perfilService.cambiarPassword({
      password_actual: passwordActual.value,
      password_nueva: passwordNueva.value,
    })
    passwordActual.value = ''
    passwordNueva.value = ''
    passwordConfirmar.value = ''
    emit('notificar', data.detail || 'Contraseña actualizada correctamente.', 'success')
  } catch (error) {
    emit('notificar', error.response?.data?.detail || 'No se pudo cambiar la contraseña.', 'error')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <v-card rounded="lg" elevation="0" border class="bg-white pa-5">
    <div class="d-flex align-center justify-space-between mb-1">
      <div class="d-flex align-center ga-2">
        <v-icon icon="mdi-lock-reset" color="#F2690D" />
        <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
          Cambiar contraseña
        </span>
      </div>

      <v-btn
        variant="text"
        size="small"
        color="grey-darken-1"
        class="text-none"
        :prepend-icon="verClaves ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        @click="verClaves = !verClaves"
      >
        {{ verClaves ? 'Ocultar' : 'Mostrar' }}
      </v-btn>
    </div>

    <p class="text-caption text-grey-darken-1 mb-4">
      Ingresa tu contraseña actual y define una nueva clave de al menos 6 caracteres.
    </p>

    <v-row density="compact">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="passwordActual"
          label="Contraseña actual"
          :type="verClaves ? 'text' : 'password'"
          variant="outlined"
          density="compact"
          color="orange-darken-2"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="passwordNueva"
          label="Nueva contraseña"
          :type="verClaves ? 'text' : 'password'"
          variant="outlined"
          density="compact"
          color="orange-darken-2"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="passwordConfirmar"
          label="Confirmar nueva"
          :type="verClaves ? 'text' : 'password'"
          variant="outlined"
          density="compact"
          color="orange-darken-2"
        />
      </v-col>
    </v-row>

    <div class="d-flex justify-end mt-2">
      <v-btn
        color="#111111"
        variant="flat"
        rounded="lg"
        class="text-white font-weight-bold text-none"
        :loading="guardando"
        @click="actualizarPassword"
      >
        Actualizar contraseña
      </v-btn>
    </div>
  </v-card>
</template>