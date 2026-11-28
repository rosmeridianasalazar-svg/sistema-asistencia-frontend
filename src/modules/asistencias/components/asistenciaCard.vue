<script setup>
defineProps({
  jornadas: {
    type: Array,
    default: () => [],
  },
  administrador: Boolean,
})

const emit = defineEmits(['editar', 'eliminar'])

function fechaTexto(fecha) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function horaTexto(valor) {
  if (!valor) return 'Sin registro'

  return new Date(valor).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function colorEstado(estado) {
  return (
    {
      PUNTUAL: 'success',
      TARDANZA: 'warning',
      JUSTIFICADO: 'info',
      FALTA: 'error',
      REGISTRADA: 'secondary',
    }[estado] || 'secondary'
  )
}
</script>

<template>
  <v-card v-for="jornada in jornadas" :key="jornada.fecha" rounded="lg" class="mb-3">
    <v-card-text>
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="font-weight-medium">
          {{ fechaTexto(jornada.fecha) }}
        </div>

        <v-chip size="small" :color="jornada.duracion ? 'success' : 'secondary'" variant="tonal">
          {{ jornada.duracion || 'Incompleta' }}
        </v-chip>
      </div>

      <v-row density="compact">
        <v-col cols="6">
          <div class="text-caption text-medium-emphasis">
            <v-icon size="small">mdi-login</v-icon>
            Entrada
          </div>
          <div class="text-h6">
            {{ horaTexto(jornada.entrada?.fecha_hora_evento) }}
          </div>
          <!-- <div class="text-caption">
            {{ jornada.entrada?.estado_asistencia || '-' }}
          </div> -->
          <div>
            <v-chip
              v-if="jornada.entrada?.estado_asistencia"
              size="x-small"
              :color="colorEstado(jornada.entrada.estado_asistencia)"
              variant="tonal"
            >
              {{ jornada.entrada.estado_asistencia }}
            </v-chip>
            <span v-else class="text-caption text-medium-emphasis">-</span>
          </div>
        </v-col>

        <v-col cols="6">
          <div class="text-caption text-medium-emphasis">
            <v-icon size="small">mdi-logout</v-icon>
            Salida
          </div>
          <div class="text-h6">
            {{ horaTexto(jornada.salida?.fecha_hora_evento) }}
          </div>
          <div class="text-caption">
            {{ jornada.salida?.estado_asistencia || '-' }}
          </div>
        </v-col>
      </v-row>

      <div v-if="administrador" class="d-flex justify-end ga-2 mt-3">
        <v-btn
          size="small"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-pencil"
          @click="emit('editar', jornada)"
        >
          Editar
        </v-btn>

        <v-btn
          size="small"
          color="error"
          variant="tonal"
          prepend-icon="mdi-delete"
          @click="emit('eliminar', jornada)"
        >
          Eliminar
        </v-btn>
      </div>
    </v-card-text>
  </v-card>

  <div v-if="!jornadas.length" class="text-center text-medium-emphasis py-8">
    No se encontraron asistencias.
  </div>
</template>
