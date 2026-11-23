<script setup>
defineProps({
  jornadas: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
  administrador: Boolean,
})

const emit = defineEmits(['editar', 'eliminar'])

function fechaTexto(fecha) {
  if (!fecha) return '-'

  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-PE')
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
  <v-card rounded="lg">
    <v-table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Entrada</th>
          <th>Estado</th>
          <th>Salida</th>
          <th>Estado</th>
          <th>Duración</th>
          <th v-if="administrador" class="text-end">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="jornada in jornadas" :key="jornada.fecha">
          <td class="font-weight-medium">
            {{ fechaTexto(jornada.fecha) }}
          </td>

          <td>
            {{ horaTexto(jornada.entrada?.fecha_hora_evento) }}
          </td>

          <td>
            <v-chip
              v-if="jornada.entrada"
              size="small"
              :color="colorEstado(jornada.entrada.estado_asistencia)"
              variant="tonal"
            >
              {{ jornada.entrada.estado_asistencia }}
            </v-chip>
            <span v-else class="text-medium-emphasis">-</span>
          </td>

          <td>
            {{ horaTexto(jornada.salida?.fecha_hora_evento) }}
          </td>

          <td>
            <v-chip
              v-if="jornada.salida"
              size="small"
              :color="colorEstado(jornada.salida.estado_asistencia)"
              variant="tonal"
            >
              {{ jornada.salida.estado_asistencia }}
            </v-chip>
            <span v-else class="text-medium-emphasis">-</span>
          </td>

          <td class="font-weight-medium">
            {{ jornada.duracion || 'No contabilizada' }}
          </td>

          <td v-if="administrador" class="text-end">
            <v-tooltip text="Editar jornada">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="emit('editar', jornada)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Eliminar jornada">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  @click="emit('eliminar', jornada)"
                />
              </template>
            </v-tooltip>
          </td>
        </tr>

        <tr v-if="!loading && !jornadas.length">
          <td :colspan="administrador ? 7 : 6" class="text-center py-8">
            No se encontraron asistencias.
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-progress-linear v-if="loading" indeterminate color="#F2690D" />
  </v-card>
</template>
