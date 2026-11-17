<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  usuario: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'confirmar'])

const nombreUsuario = computed(() => {
  if (!props.usuario) return ''

  return [props.usuario.nombre, props.usuario.apellido_paterno, props.usuario.apellido_materno]
    .filter(Boolean)
    .join(' ')
})

function cerrar() {
  if (props.loading) return

  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    width="calc(100% - 24px)"
    max-width="450"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-text class="pa-5 pa-sm-6 text-center">
        <v-avatar color="error" variant="tonal" size="64" class="mb-4">
          <v-icon icon="mdi-account-remove-outline" size="32" />
        </v-avatar>

        <div class="text-h6 font-weight-bold mb-2">¿Eliminar usuario?</div>

        <p class="text-body-2 text-medium-emphasis mb-3">
          Estás a punto de eliminar a
          <strong class="text-grey-darken-3"> {{ nombreUsuario }} </strong>.
        </p>

        <p class="text-body-2 text-medium-emphasis">
          Esta acción puede afectar los registros relacionados con el usuario, como huellas,
          asistencias y asignaciones de horarios, según las reglas de eliminación configuradas en el
          backend.
        </p>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="comfortable"
          class="mt-4 text-start"
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 justify-end flex-wrap">
        <v-btn variant="text" :disabled="loading" @click="cerrar"> Cancelar </v-btn>

        <v-btn color="error" variant="flat" :loading="loading" @click="emit('confirmar')">
          <v-icon start icon="mdi-delete-outline" />
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
