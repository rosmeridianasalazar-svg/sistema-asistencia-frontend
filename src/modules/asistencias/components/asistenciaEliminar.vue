<script setup>
defineProps({
  modelValue: Boolean,
  jornada: {
    type: Object,
    default: null,
  },
  loading: Boolean,
})

const emit = defineEmits(['update:modelValue', 'confirmar'])

function fechaTexto(fecha) {
  if (!fecha) return ''

  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-PE')
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="430"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="text-h6 pa-4"> Eliminar jornada </v-card-title>

      <v-card-text>
        <v-alert type="warning" variant="tonal" class="mb-3">
          Se eliminarán los registros de entrada y salida de esta jornada.
        </v-alert>

        <div v-if="jornada">
          ¿Deseas eliminar la jornada del
          <strong>{{ fechaTexto(jornada.fecha) }}</strong
          >?
        </div>

        <div class="text-caption text-medium-emphasis mt-2">Esta acción no se puede deshacer.</div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn variant="text" :disabled="loading" @click="emit('update:modelValue', false)">
          Cancelar
        </v-btn>

        <v-btn color="error" :loading="loading" @click="emit('confirmar')"> Eliminar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
