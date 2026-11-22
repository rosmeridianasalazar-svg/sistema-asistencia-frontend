<script setup>
import { reactive, watch } from 'vue'

// const props = defineProps({
//   loading: Boolean,
// })
defineProps({
  loading: Boolean,
})

// function buscar() {
//   if (props.loading) return // Aquí ya estás usando la variable 'props'
//   emit('buscar', { ...filtros })
// }

const emit = defineEmits(['buscar', 'limpiar'])

const filtros = reactive({
  fecha: '',
  fecha_inicio: '',
  fecha_fin: '',
  tipo_evento: '',
  estado: '',
})

const tipos = [
  { title: 'Todos', value: '' },
  { title: 'Entrada', value: 'ENTRADA' },
  { title: 'Salida', value: 'SALIDA' },
]

const estados = [
  { title: 'Todos', value: '' },
  { title: 'Registrada', value: 'REGISTRADA' },
  { title: 'Puntual', value: 'PUNTUAL' },
  { title: 'Tardanza', value: 'TARDANZA' },
  { title: 'Justificado', value: 'JUSTIFICADO' },
  { title: 'Falta', value: 'FALTA' },
]

const fechaRangoDeshabilitada = () => Boolean(filtros.fecha)
const fechaUnicaDeshabilitada = () => Boolean(filtros.fecha_inicio || filtros.fecha_fin)

watch(
  () => filtros.fecha,
  (valor) => {
    if (valor) {
      filtros.fecha_inicio = ''
      filtros.fecha_fin = ''
    }
  },
)

watch(
  () => [filtros.fecha_inicio, filtros.fecha_fin],
  ([inicio, fin]) => {
    if (inicio || fin) filtros.fecha = ''
  },
)

function buscar() {
  emit('buscar', { ...filtros })
}

function limpiar() {
  Object.assign(filtros, {
    fecha: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo_evento: '',
    estado: '',
  })

  emit('limpiar')
}
</script>

<template>
  <v-card rounded="lg" class="mb-4">
    <v-card-text>
      <div class="text-subtitle-1 font-weight-medium mb-3">Filtrar asistencias</div>

      <v-row dense>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filtros.fecha"
            type="date"
            label="Fecha específica"
            variant="outlined"
            density="comfortable"
            :disabled="fechaUnicaDeshabilitada() || loading"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filtros.fecha_inicio"
            type="date"
            label="Desde"
            variant="outlined"
            density="comfortable"
            :disabled="fechaRangoDeshabilitada() || loading"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filtros.fecha_fin"
            type="date"
            label="Hasta"
            variant="outlined"
            density="comfortable"
            :disabled="fechaRangoDeshabilitada() || loading"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filtros.tipo_evento"
            :items="tipos"
            label="Tipo de evento"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="filtros.estado"
            :items="estados"
            label="Estado"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="8" class="d-flex align-center ga-2">
          <v-btn color="primary" prepend-icon="mdi-filter" :loading="loading" @click="buscar">
            Aplicar
          </v-btn>

          <v-btn
            variant="outlined"
            prepend-icon="mdi-filter-remove"
            :disabled="loading"
            @click="limpiar"
          >
            Limpiar
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
