<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import perfilService from '../services/perfilService'

const props = defineProps({
  correo: { type: String, default: '' },
  telefono: { type: String, default: '' },
})

const emit = defineEmits(['actualizado', 'notificar'])
const authStore = useAuthStore()

const correoEdit = ref(props.correo)
const telefonoEdit = ref(props.telefono)
const guardando = ref(false)

watch(
  () => [props.correo, props.telefono],
  ([nuevoCorreo, nuevoTelefono]) => {
    correoEdit.value = nuevoCorreo || ''
    telefonoEdit.value = nuevoTelefono || ''
  }
)

async function guardar() {
  if (!correoEdit.value.trim()) {
    emit('notificar', 'El correo electrónico no puede estar vacío.', 'error')
    return
  }

  guardando.value = true
  try {
    const { data } = await perfilService.actualizarPerfil({
      correo: correoEdit.value.trim().toLowerCase(),
      telefono: telefonoEdit.value.trim(),
    })

    if (authStore.usuario) {
      authStore.usuario = { ...authStore.usuario, ...data.usuario }
      sessionStorage.setItem('usuario', JSON.stringify(authStore.usuario))
    }

    emit('actualizado', data.usuario)
    emit('notificar', data.detail || 'Datos actualizados correctamente.', 'success')
  } catch (error) {
    emit('notificar', error.response?.data?.detail || 'No se pudieron actualizar los datos.', 'error')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <v-card rounded="lg" elevation="0" border class="bg-white pa-5">
    <div class="d-flex align-center ga-2 mb-1">
      <v-icon icon="mdi-card-account-details-outline" color="#F2690D" />
      <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
        Datos de contacto
      </span>
    </div>
    <p class="text-caption text-grey-darken-1 mb-4">
      Mantén tu correo y número de celular actualizados para recibir notificaciones del sistema.
    </p>

    <v-row density="compact">
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="correoEdit"
          label="Correo electrónico"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          density="compact"
          color="orange-darken-2"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="telefonoEdit"
          label="Teléfono / Celular"
          prepend-inner-icon="mdi-phone-outline"
          variant="outlined"
          density="compact"
          color="orange-darken-2"
        />
      </v-col>
    </v-row>

    <div class="d-flex justify-end mt-2">
      <v-btn
        color="#F2690D"
        variant="flat"
        rounded="lg"
        class="text-white font-weight-bold text-none"
        :loading="guardando"
        @click="guardar"
      >
        Guardar cambios
      </v-btn>
    </div>
  </v-card>
</template>