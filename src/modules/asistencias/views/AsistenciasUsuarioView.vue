<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import { useAsistencias } from '../composables/useAsistencias'

import AsistenciaResumen from '../components/asistenciaResumen.vue'
import AsistenciaFiltros from '../components/asistenciaFiltros.vue'
import AsistenciaTabla from '../components/asistenciaTabla.vue'
import AsistenciaCard from '../components/asistenciaCard.vue'
import AsistenciaFormulario from '../components/asistenciaFormulario.vue'
import AsistenciaEliminar from '../components/asistenciaEliminar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const {
  jornadas,
  resumen,
  cargando,
  guardando,
  eliminando,
  error,
  mensaje,
  filtros,
  paginacion,
  cargarHistorial,
  buscar,
  limpiarFiltros,
  cambiarPagina,
  registrarJornada,
  actualizarJornada,
  eliminarJornada,
  limpiarMensajes,
} = useAsistencias()

const dialogFormulario = ref(false)
const dialogEliminar = ref(false)

const jornadaSeleccionada = ref(null)

const rol = computed(
  () =>
    authStore.usuario?.id_rol?.nombre ||
    authStore.usuario?.rol ||
    authStore.usuario?.nombre_rol ||
    '',
)

const esAdministrador = computed(() => rol.value === 'Administrador')

const usuarioId = computed(() => {
  if (esAdministrador.value) {
    return Number(route.params.usuarioId)
  }

  return Number(authStore.usuario?.id_usuario)
})

const trabajador = computed(() => {
  const datos = jornadas.value.find((jornada) => jornada.trabajador)?.trabajador

  if (datos) return datos

  return {
    id_usuario: usuarioId.value,
    nombre: route.query.nombre || 'Historial de asistencias',
    dni: route.query.dni || '',
    rol: route.query.rol || '',
  }
})

const numeroPaginas = computed(() => Math.max(1, Math.ceil(paginacion.count / paginacion.pageSize)))

onMounted(() => {
  cargarHistorial(usuarioId.value)
})

watch(usuarioId, (nuevoId) => {
  if (nuevoId) {
    jornadaSeleccionada.value = null
    cargarHistorial(nuevoId)
  }
})

function volver() {
  router.push({ name: 'asistencias' })
}

function abrirCrear() {
  limpiarMensajes()
  jornadaSeleccionada.value = null
  dialogFormulario.value = true
}

function abrirEditar(jornada) {
  limpiarMensajes()
  jornadaSeleccionada.value = jornada
  dialogFormulario.value = true
}

function abrirEliminar(jornada) {
  limpiarMensajes()
  jornadaSeleccionada.value = jornada
  dialogEliminar.value = true
}

async function guardarJornada(datos) {
  let resultado

  if (jornadaSeleccionada.value) {
    resultado = await actualizarJornada(usuarioId.value, jornadaSeleccionada.value.fecha, datos)
  } else {
    resultado = await registrarJornada(
      {
        usuario_id: usuarioId.value,
        ...datos,
      },
      usuarioId.value,
    )
  }

  if (resultado) {
    dialogFormulario.value = false
    jornadaSeleccionada.value = null
  }
}

async function confirmarEliminar() {
  if (!jornadaSeleccionada.value) return

  const resultado = await eliminarJornada(usuarioId.value, jornadaSeleccionada.value.fecha)

  if (resultado) {
    dialogEliminar.value = false
    jornadaSeleccionada.value = null
  }
}

function aplicarFiltros(datos) {
  Object.assign(filtros, datos)
  buscar(usuarioId.value)
}

function reiniciarFiltros() {
  limpiarFiltros(usuarioId.value)
}

function irPagina(pagina) {
  cambiarPagina(usuarioId.value, pagina)
}
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div v-if="esAdministrador" class="d-flex flex-wrap align-center ga-3 mb-5">
      <v-btn color="#F2690D" prepend-icon="mdi-arrow-left" @click="volver"> Regresar </v-btn>
      <!-- <div class="flex-grow-1">
        <div class="text-h5 font-weight-bold">
          {{ esAdministrador ? 'Historial de asistencias' : '' }}
        </div>

        <div class="text-body-2 text-medium-emphasis">
          {{ esAdministrador ? 'Consulta las jornadas y el total de horas registradas' : ' ' }}
        </div>
      </div> -->
      <div class="flex-grow-1">
        <div class="text-h5 font-weight-bold">Historial de asistencias</div>

        <div class="text-body-2 text-medium-emphasis">
          Consulta las jornadas y el total de horas registradas
        </div>
      </div>

      <v-btn color="#F2690D" variant="outlined" prepend-icon="mdi-plus" @click="abrirCrear">
        Nueva jornada
      </v-btn>
    </div>

    <!-- <v-alert v-if="error" type="error" variant="tonal" closable class="mb-4">
      {{ error }}
    </v-alert> -->
    <v-alert
      v-if="error && !dialogFormulario"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="limpiarMensajes"
    >
      {{ error }}
    </v-alert>

    <v-alert v-if="mensaje" type="success" variant="tonal" closable class="mb-4">
      {{ mensaje }}
    </v-alert>

    <AsistenciaResumen :resumen="resumen" :trabajador="esAdministrador ? trabajador : null" />

    <AsistenciaFiltros :loading="cargando" @buscar="aplicarFiltros" @limpiar="reiniciarFiltros" />

    <div class="d-none d-md-block">
      <AsistenciaTabla
        :jornadas="jornadas"
        :loading="cargando"
        :administrador="esAdministrador"
        @editar="abrirEditar"
        @eliminar="abrirEliminar"
      />
    </div>

    <div class="d-md-none">
      <v-progress-linear v-if="cargando" indeterminate color="#F2690D" class="mb-3" />

      <AsistenciaCard
        :jornadas="jornadas"
        :administrador="esAdministrador"
        @editar="abrirEditar"
        @eliminar="abrirEliminar"
      />
    </div>

    <div
      v-if="paginacion.count"
      class="d-flex flex-wrap justify-space-between align-center mt-4 ga-3"
    >
      <div class="text-caption text-medium-emphasis">
        {{ paginacion.count }} jornadas encontradas
      </div>

      <v-pagination
        :model-value="paginacion.page"
        :length="numeroPaginas"
        :total-visible="5"
        density="comfortable"
        @update:model-value="irPagina"
      />
    </div>

    <AsistenciaFormulario
      v-model="dialogFormulario"
      :jornada="jornadaSeleccionada"
      :usuario-id="usuarioId"
      :loading="guardando"
      :error="error"
      @guardar="guardarJornada"
      @update:model-value="
        (val) => {
          if (!val) limpiarMensajes()
        }
      "
    />

    <AsistenciaEliminar
      v-model="dialogEliminar"
      :jornada="jornadaSeleccionada"
      :loading="eliminando"
      @confirmar="confirmarEliminar"
    />
  </v-container>
</template>
