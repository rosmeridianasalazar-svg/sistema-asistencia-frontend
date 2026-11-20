<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import api from '@/services/api'
import endpoints from '@/services/endpoints'
import CumpleanosHoyBanner from '../components/CumpleanosHoyBanner.vue'
import CumpleanosMesCard from '../components/CumpleanosMesCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const usuarios = ref([])
const cargando = ref(false)

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

async function cargarCumpleanos() {
  cargando.value = true
  try {
    const { data } = await api.get(endpoints.usuarios.cumpleanos)
    usuarios.value = Array.isArray(data) ? data : []
  } catch (error) {
    usuarios.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(() => cargarCumpleanos())

const proximosCumpleanos = computed(() => {
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const anioActual = hoy.getFullYear()

  return usuarios.value
    .filter((u) => u.fecha_nacimiento)
    .map((u) => {
      const partes = String(u.fecha_nacimiento).split('-')
      const mes = Number(partes[1]) - 1
      const dia = Number(partes[2])

      const fechaCumple = new Date(anioActual, mes, dia)
      const diffMs = fechaCumple.getTime() - hoy.getTime()
      const diasFaltantes = Math.round(diffMs / (1000 * 60 * 60 * 24))

      let etiquetaDias = `En ${diasFaltantes} días`
      if (diasFaltantes === 0) etiquetaDias = '¡Hoy!'
      else if (diasFaltantes === 1) etiquetaDias = 'Mañana'

      return {
        id_usuario: u.id_usuario,
        nombre_completo: [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' '),
        primer_nombre: u.nombre || 'Compañero',
        nombre_rol: u.nombre_rol || 'Colaborador',
        mesIndex: mes,
        mesNombre: MESES[mes],
        diaFormateado: `${String(dia).padStart(2, '0')} ${MESES_CORTOS[mes]}`,
        diasFaltantes,
        esHoy: diasFaltantes === 0,
        etiquetaDias,
      }
    })
    .filter((item) => item.diasFaltantes >= 0)
    .sort((a, b) => a.diasFaltantes - b.diasFaltantes)
})

const esMiCumple = computed(() => {
  const miId = Number(authStore.usuario?.id_usuario)
  return proximosCumpleanos.value.some((c) => Number(c.id_usuario) === miId && c.esHoy)
})

const miNombre = computed(() => authStore.usuario?.nombre || 'Compañero')

const cumpleanerosHoyCompaneros = computed(() => {
  const miId = Number(authStore.usuario?.id_usuario)
  return proximosCumpleanos.value.filter((c) => c.esHoy && Number(c.id_usuario) !== miId)
})

const gruposPorMes = computed(() => {
  const mapa = new Map()
  for (const persona of proximosCumpleanos.value) {
    if (!mapa.has(persona.mesIndex)) {
      mapa.set(persona.mesIndex, {
        mesIndex: persona.mesIndex,
        mesNombre: persona.mesNombre,
        lista: [],
      })
    }
    mapa.get(persona.mesIndex).lista.push(persona)
  }
  return Array.from(mapa.values())
})

function irAFelicitar() {
  router.push({ name: 'notificaciones' })
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold text-grey-darken-4">Cumpleaños del equipo</h1>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          Próximas celebraciones pendientes en lo que resta del año
        </p>
      </div>

      <v-chip color="#F2690D" variant="tonal" class="font-weight-bold">
        <v-icon start icon="mdi-cake-variant-outline" size="18" />
        {{ proximosCumpleanos.length }} próximos
      </v-chip>
    </div>

    <div v-if="cargando" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate color="#F2690D" />
    </div>

    <template v-else>
      <CumpleanosHoyBanner
        :es-mi-cumple="esMiCumple"
        :mi-nombre="miNombre"
        :cumpleaneros-hoy="cumpleanerosHoyCompaneros"
        @felicitar="irAFelicitar"
      />

      <v-card
        v-if="gruposPorMes.length === 0"
        rounded="lg"
        elevation="0"
        border
        class="pa-8 text-center bg-white"
      >
        <v-icon icon="mdi-calendar-check-outline" size="48" color="grey-lighten-1" class="mb-2" />
        <div class="text-subtitle-1 font-weight-medium text-grey-darken-2">
          No quedan cumpleaños pendientes por celebrar este año
        </div>
        <div class="text-caption text-grey">
          Todos los colaboradores registrados ya celebraron su cumpleaños este año.
        </div>
      </v-card>

      <v-row v-else>
        <v-col
          v-for="grupo in gruposPorMes"
          :key="grupo.mesIndex"
          cols="12"
          md="6"
        >
          <CumpleanosMesCard
            :mes-nombre="grupo.mesNombre"
            :cumpleaneros="grupo.lista"
          />
        </v-col>
      </v-row>
    </template>
  </div>
</template>