<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const props = defineProps({
  asignaciones: { type: Array, default: () => [] },
  esAdmin: { type: Boolean, default: false },
})

defineEmits(['eliminar-asignacion'])

const authStore = useAuthStore()
const modoFiltro = ref('todos')
const busqueda = ref('')

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes', corto: 'Lun' },
  { id: 2, nombre: 'Martes', corto: 'Mar' },
  { id: 3, nombre: 'Miércoles', corto: 'Mié' },
  { id: 4, nombre: 'Jueves', corto: 'Jue' },
  { id: 5, nombre: 'Viernes', corto: 'Vie' },
  { id: 6, nombre: 'Sábado', corto: 'Sáb' },
  { id: 7, nombre: 'Domingo', corto: 'Dom' },
]

const diaHoy = computed(() => {
  const d = new Date().getDay()
  return d === 0 ? 7 : d
})

const miIdUsuario = computed(() => Number(authStore.usuario?.id_usuario))

function formatearHora(horaStr) {
  if (!horaStr) return ''
  const [h, m] = horaStr.split(':')
  const hora = Number(h)
  const sufijo = hora >= 12 ? 'PM' : 'AM'
  const hora12 = hora % 12 || 12
  return `${String(hora12).padStart(2, '0')}:${m} ${sufijo}`
}

function esTurnoManana(horaEntrada) {
  if (!horaEntrada) return true
  const hora = Number(horaEntrada.split(':')[0])
  return hora < 12
}

function esJornadaCompleta(entrada, salida) {
  if (!entrada || !salida) return false
  const [h1, m1] = entrada.split(':').map(Number)
  const [h2, m2] = salida.split(':').map(Number)
  const minutosTotales = (h2 * 60 + m2) - (h1 * 60 + m1)
  return minutosTotales >= 420 // 7 horas o más
}

const asignacionesFiltradas = computed(() => {
  const textoBusqueda = (busqueda.value || '').trim().toLowerCase()

  return props.asignaciones.filter((a) => {
    if (modoFiltro.value === 'mio' && Number(a.usuarios_id_usuario) !== miIdUsuario.value) {
      return false
    }
    if (textoBusqueda) {
      return (
        a.usuario_nombre?.toLowerCase().includes(textoBusqueda) ||
        a.horario_detalle?.nombre?.toLowerCase().includes(textoBusqueda)
      )
    }
    return true
  })
})

function bloquesPorDia(diaId) {
  return asignacionesFiltradas.value
    .filter((a) => Array.isArray(a.dias) && a.dias.includes(diaId))
    .map((a) => ({
      ...a,
      esMio: Number(a.usuarios_id_usuario) === miIdUsuario.value,
      esManana: esTurnoManana(a.horario_detalle?.hora_entrada),
      esCompleto: esJornadaCompleta(a.horario_detalle?.hora_entrada, a.horario_detalle?.hora_salida),
      rangoHora: `${formatearHora(a.horario_detalle?.hora_entrada)} - ${formatearHora(a.horario_detalle?.hora_salida)}`,
    }))
    .sort((a, b) => (a.horario_detalle?.hora_entrada || '').localeCompare(b.horario_detalle?.hora_entrada || ''))
}

function bloquesManana(diaId) {
  return bloquesPorDia(diaId).filter((b) => b.esManana)
}

function bloquesTarde(diaId) {
  return bloquesPorDia(diaId).filter((b) => !b.esManana)
}

const diasVisibles = computed(() => {
  const hayDomingo = asignacionesFiltradas.value.some((a) => a.dias?.includes(7))
  return hayDomingo ? DIAS_SEMANA : DIAS_SEMANA.filter((d) => d.id <= 6)
})

function claseTarjetaManana(bloque) {
  if (bloque.esMio) return 'bloque-mio'
  if (bloque.esCompleto) return 'bloque-completo'
  return 'bloque-manana'
}
</script>

<template>
  <div>
    <!-- Barra de filtros + Leyenda visual -->
    <v-card rounded="lg" elevation="0" border class="bg-white pa-3 pa-sm-4 mb-5">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3">
        <v-btn-toggle
          v-model="modoFiltro"
          mandatory
          color="#F2690D"
          variant="outlined"
          density="compact"
          rounded="lg"
        >
          <v-btn value="todos" class="text-none font-weight-medium px-4">
            <v-icon start icon="mdi-account-group-outline" size="18" />
            Todos los horarios
          </v-btn>
          <v-btn value="mio" class="text-none font-weight-medium px-4">
            <v-icon start icon="mdi-account-clock-outline" size="18" />
            Mi horario
          </v-btn>
        </v-btn-toggle>

        <div v-if="modoFiltro === 'todos'" style="min-width: 240px; flex: 1; max-width: 340px">
          <v-text-field
            v-model="busqueda"
            placeholder="Filtrar por colaborador o turno..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            color="orange-darken-2"
            hide-details
            clearable
            @click:clear="busqueda = ''"
          />
        </div>
      </div>

      <!-- Mini-leyenda de colores para lectura instantánea -->
      <div class="d-flex flex-wrap align-center ga-4 mt-3 pt-2 border-t text-caption text-grey-darken-1">
        <div class="d-flex align-center ga-1">
          <span class="leyenda-dot" style="background-color: #2e7d32"></span>
          <span>Jornada completa (todo el día)</span>
        </div>
        <div class="d-flex align-center ga-1">
          <span class="leyenda-dot" style="background-color: #ffb300"></span>
          <span>Solo mañana</span>
        </div>
        <div class="d-flex align-center ga-1">
          <span class="leyenda-dot" style="background-color: #607d8b"></span>
          <span>Solo tarde</span>
        </div>
        <div class="d-flex align-center ga-1">
          <span class="leyenda-dot" style="background-color: #F2690D"></span>
          <span class="font-weight-medium text-grey-darken-3">Mi turno asignado</span>
        </div>
      </div>
    </v-card>

    <!-- Grilla Semanal -->
    <v-row density="compact">
      <v-col
        v-for="dia in diasVisibles"
        :key="dia.id"
        cols="12"
        sm="6"
        md="4"
        :lg="diasVisibles.length === 6 ? 2 : true"
      >
        <v-card
          rounded="lg"
          elevation="0"
          border
          class="h-100 bg-white d-flex flex-column"
          :class="{ 'columna-hoy': dia.id === diaHoy }"
        >
          <!-- Cabecera del Día -->
          <div
            class="px-3 py-2 d-flex align-center justify-space-between border-b"
            :style="{ backgroundColor: dia.id === diaHoy ? '#FFF3E0' : '#FAFAFA' }"
          >
            <span
              class="text-caption font-weight-bold text-uppercase"
              :style="{ color: dia.id === diaHoy ? '#F2690D' : '#424242', letterSpacing: '0.6px' }"
            >
              {{ dia.nombre }}
            </span>

            <v-chip
              v-if="dia.id === diaHoy"
              size="x-small"
              color="#F2690D"
              variant="flat"
              class="text-white font-weight-bold"
            >
              Hoy
            </v-chip>
            <span v-else class="text-caption text-grey">
              {{ bloquesPorDia(dia.id).length }}
            </span>
          </div>

          <!-- Contenido dividido en Mañana y Tarde -->
          <div class="pa-2 flex-grow-1 d-flex flex-column ga-3">
            <!-- SECCIÓN MAÑANA / INGRESO MAÑANA -->
            <div>
              <div class="d-flex align-center justify-space-between px-1 mb-1">
                <div class="d-flex align-center ga-1">
                  <v-icon icon="mdi-weather-sunny" size="13" color="amber-darken-3" />
                  <span class="font-weight-bold text-uppercase text-amber-darken-4" style="font-size: 10px; letter-spacing: 0.5px">
                    Mañana
                  </span>
                </div>
                <span class="text-grey" style="font-size: 10px">{{ bloquesManana(dia.id).length }}</span>
              </div>

              <div v-if="bloquesManana(dia.id).length === 0" class="turno-vacio text-center py-2 rounded-md">
                Sin turno mañana
              </div>

              <div v-else class="d-flex flex-column ga-2">
                <div
                  v-for="bloque in bloquesManana(dia.id)"
                  :key="`${dia.id}-m-${bloque.id_asignacion}`"
                  class="pa-2 rounded-md bloque-turno"
                  :class="claseTarjetaManana(bloque)"
                >
                  <div class="d-flex justify-space-between align-start ga-1">
                    <div class="text-caption font-weight-bold text-grey-darken-4 leading-tight">
                      {{ bloque.usuario_nombre }}
                    </div>

                    <v-btn
                      v-if="esAdmin"
                      icon="mdi-close"
                      size="x-small"
                      variant="text"
                      color="grey-darken-1"
                      density="compact"
                      title="Quitar asignación completa"
                      @click="$emit('eliminar-asignacion', bloque)"
                    />
                  </div>

                  <div class="text-caption text-grey-darken-1 mb-1" style="font-size: 11px !important">
                    {{ bloque.usuario_rol }}
                  </div>

                  <div class="d-flex align-center ga-1 mt-1">
                    <v-icon
                      icon="mdi-clock-outline"
                      size="13"
                      :color="bloque.esMio ? '#F2690D' : bloque.esCompleto ? 'green-darken-3' : 'amber-darken-4'"
                    />
                    <span
                      class="font-weight-medium"
                      style="font-size: 11px"
                      :style="{ color: bloque.esMio ? '#F2690D' : '#212121' }"
                    >
                      {{ bloque.rangoHora }}
                    </span>
                  </div>

                  <div v-if="bloque.esCompleto" class="mt-1">
                    <v-chip
                      size="x-small"
                      color="green-darken-3"
                      variant="tonal"
                      class="font-weight-bold px-2"
                      style="height: 18px; font-size: 10px"
                    >
                      Jornada completa
                    </v-chip>
                  </div>

                  <div class="text-truncate text-grey mt-1" style="font-size: 10.5px">
                    {{ bloque.horario_detalle?.nombre }}
                  </div>
                </div>
              </div>
            </div>

            <v-divider />

            <!-- SECCIÓN TARDE -->
            <div>
              <div class="d-flex align-center justify-space-between px-1 mb-1">
                <div class="d-flex align-center ga-1">
                  <v-icon icon="mdi-weather-sunset" size="13" color="blue-grey-darken-2" />
                  <span class="font-weight-bold text-uppercase text-blue-grey-darken-3" style="font-size: 10px; letter-spacing: 0.5px">
                    Tarde
                  </span>
                </div>
                <span class="text-grey" style="font-size: 10px">{{ bloquesTarde(dia.id).length }}</span>
              </div>

              <div v-if="bloquesTarde(dia.id).length === 0" class="turno-vacio text-center py-2 rounded-md">
                Sin turno tarde
              </div>

              <div v-else class="d-flex flex-column ga-2">
                <div
                  v-for="bloque in bloquesTarde(dia.id)"
                  :key="`${dia.id}-t-${bloque.id_asignacion}`"
                  class="pa-2 rounded-md bloque-turno"
                  :class="bloque.esMio ? 'bloque-mio' : 'bloque-tarde'"
                >
                  <div class="d-flex justify-space-between align-start ga-1">
                    <div class="text-caption font-weight-bold text-grey-darken-4 leading-tight">
                      {{ bloque.usuario_nombre }}
                    </div>

                    <v-btn
                      v-if="esAdmin"
                      icon="mdi-close"
                      size="x-small"
                      variant="text"
                      color="grey-darken-1"
                      density="compact"
                      title="Quitar asignación completa"
                      @click="$emit('eliminar-asignacion', bloque)"
                    />
                  </div>

                  <div class="text-caption text-grey-darken-1 mb-1" style="font-size: 11px !important">
                    {{ bloque.usuario_rol }}
                  </div>

                  <div class="d-flex align-center ga-1 mt-1">
                    <v-icon icon="mdi-clock-outline" size="13" :color="bloque.esMio ? '#F2690D' : 'blue-grey-darken-2'" />
                    <span
                      class="font-weight-medium"
                      style="font-size: 11px"
                      :style="{ color: bloque.esMio ? '#F2690D' : '#212121' }"
                    >
                      {{ bloque.rangoHora }}
                    </span>
                  </div>

                  <div class="text-truncate text-grey mt-1" style="font-size: 10.5px">
                    {{ bloque.horario_detalle?.nombre }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.leyenda-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}
.columna-hoy {
  border-color: #ffcc99 !important;
}
.turno-vacio {
  font-size: 11px;
  color: #bdbdbd;
  border: 1px dashed #e0e0e0;
  background-color: #fcfcfc;
}
.bloque-turno {
  border: 1px solid #eeeeee;
  transition: transform 0.15s ease;
}
.bloque-completo {
  background-color: #f6fbf7;
  border-color: #d7ecd9;
  border-left: 3px solid #2e7d32;
}
.bloque-manana {
  background-color: #fffdf7;
  border-left: 3px solid #ffb300;
}
.bloque-tarde {
  background-color: #f8fafc;
  border-left: 3px solid #607d8b;
}
.bloque-mio {
  background-color: #fffaf5;
  border-color: #ffd8b8;
  border-left: 3px solid #F2690D;
}
.leading-tight {
  line-height: 1.25;
}
</style>