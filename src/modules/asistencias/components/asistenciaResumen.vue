<script setup>
defineProps({
  resumen: {
    type: Object,
    default: null,
  },
  trabajador: {
    type: Object,
    default: null,
  },
})

function obtenerIniciales(nombre) {
  if (!nombre) return '?'
  const partes = nombre.trim().split(/\s+/)
  return partes.length > 1
    ? `${partes[0][0]}${partes[1][0]}`.toUpperCase()
    : nombre.slice(0, 2).toUpperCase()
}
</script>

<template>
  <v-card rounded="lg" class="mb-4">
    <v-card-text>
      <div class="d-flex flex-wrap justify-space-between align-center ga-3">
        <div class="d-flex align-center ga-3">
          <v-avatar color="#F2690D" variant="tonal" size="38" class="font-weight-bold text-body-2">
            {{ obtenerIniciales(trabajador?.nombre) }}
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">
              {{ trabajador?.nombre || 'Mis asistencias' }}
            </div>
            <div v-if="trabajador" class="text-caption text-medium-emphasis">
              DNI: {{ trabajador.dni }} · {{ trabajador.rol }}
            </div>
          </div>
        </div>

        <v-chip color="success" variant="tonal">
          <v-icon start>mdi-clock-check-outline</v-icon>
          {{ resumen?.total_formateado || '00:00' }} horas
        </v-chip>
      </div>

      <v-divider class="my-4" />

      <v-row>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Total de horas</div>
          <div class="text-h5 font-weight-bold">
            {{ resumen?.total_horas ?? 0 }}
          </div>
        </v-col>

        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Días completados</div>
          <div class="text-h5 font-weight-bold">
            {{ resumen?.dias_registrados ?? 0 }}
          </div>
        </v-col>

        <v-col cols="12" sm="4">
          <div class="text-caption text-medium-emphasis">Jornadas contabilizadas</div>
          <div class="text-h5 font-weight-bold">
            {{ resumen?.dias?.length ?? 0 }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
