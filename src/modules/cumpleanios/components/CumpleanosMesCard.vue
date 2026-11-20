<script setup>
defineProps({
  mesNombre: { type: String, required: true },
  cumpleaneros: { type: Array, default: () => [] },
})

function obtenerIniciales(nombre) {
  return (nombre || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
}
</script>

<template>
  <v-card rounded="lg" elevation="0" border class="h-100 bg-white overflow-hidden">
    <!-- Cabecera del mes -->
    <div class="px-4 py-3 d-flex align-center justify-space-between border-b" style="background-color: #fafafa">
      <div class="d-flex align-center ga-2">
        <v-icon icon="mdi-calendar-blank-outline" color="#F2690D" size="19" />
        <span class="text-subtitle-2 font-weight-bold text-grey-darken-4 text-uppercase" style="letter-spacing: 0.6px">
          {{ mesNombre }}
        </span>
      </div>

      <span class="text-caption font-weight-medium text-grey-darken-1">
        {{ cumpleaneros.length }} {{ cumpleaneros.length === 1 ? 'persona' : 'personas' }}
      </span>
    </div>


    <div>
      <div
        v-for="(persona, index) in cumpleaneros"
        :key="persona.id_usuario"
        class="px-3 px-sm-4 py-3 d-flex align-center justify-space-between ga-2 ga-sm-3 fila-cumple"
        :class="{
          'border-b': index < cumpleaneros.length - 1,
          'fila-hoy': persona.esHoy,
        }"
      >

        <div class="d-flex align-center ga-2 ga-sm-3 flex-grow-1 min-width-0">
          <v-avatar
            :color="persona.esHoy ? '#F2690D' : '#F5F5F5'"
            size="36"
            class="font-weight-medium text-caption flex-shrink-0"
            :style="{ color: persona.esHoy ? '#FFFFFF' : '#424242' }"
          >
            {{ obtenerIniciales(persona.nombre_completo) }}
          </v-avatar>

          <div class="min-width-0 flex-grow-1">
            <div class="text-body-2 font-weight-medium text-grey-darken-4 text-truncate">
              {{ persona.nombre_completo }}
            </div>
            <div class="text-caption text-grey-darken-1 text-truncate">
              {{ persona.nombre_rol }}
            </div>
          </div>
        </div>


        <div class="d-flex flex-column flex-sm-row align-end align-sm-center ga-1 ga-sm-3 flex-shrink-0">
          <span
            class="text-caption font-weight-medium order-2 order-sm-1"
            style="font-size: 11px !important; white-space: nowrap"
            :style="{ color: persona.esHoy ? '#F2690D' : '#757575' }"
          >
            {{ persona.etiquetaDias }}
          </span>

          <div
            class="fecha-badge text-center rounded-md px-2 py-1 order-1 order-sm-2"
            :class="persona.esHoy ? 'fecha-badge-hoy' : 'fecha-badge-normal'"
          >
            <div class="text-body-2 font-weight-bold" style="line-height: 1.1">
              {{ persona.diaFormateado.split(' ')[0] }}
            </div>
            <div class="text-uppercase" style="font-size: 10px; line-height: 1.1; opacity: 0.85">
              {{ persona.diaFormateado.split(' ')[1] }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.min-width-0 {
  min-width: 0;
}
.fila-cumple {
  transition: background-color 0.15s ease;
}
.fila-cumple:hover {
  background-color: #fafafa;
}
.fila-hoy {
  background-color: #fffaf5 !important;
}
.fecha-badge {
  min-width: 44px;
}
.fecha-badge-normal {
  background-color: #f5f5f5;
  color: #424242;
  border: 1px solid #e0e0e0;
}
.fecha-badge-hoy {
  background-color: #F2690D;
  color: #ffffff;
}
</style>