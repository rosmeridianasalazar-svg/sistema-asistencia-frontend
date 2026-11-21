<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import api from '@/services/api'
import endpoints from '@/services/endpoints'
import horarioService from '../services/horarioService'
import CalendarioSemanal from '../components/CalendarioSemanal.vue'
import AsignarHorarioModal from '../components/AsignarHorarioModal.vue'
import CatalogoTurnosTab from '../components/CatalogoTurnosTab.vue'

const authStore = useAuthStore()

const tabActiva = ref('calendario')
const cargando = ref(false)
const asignaciones = ref([])
const turnos = ref([])
const usuarios = ref([])
const modalAsignar = ref(false)
const modalConfirmarEliminar = ref(false)
const bloqueAEliminar = ref(null)
const eliminando = ref(false)

const snackbar = ref({
  visible: false,
  texto: '',
  color: 'success',
})

function mostrarMensaje({ texto, color = 'success' }) {
  snackbar.value = { visible: true, texto, color }
}

const esAdmin = computed(() => {
  const user = authStore.usuario
  const rol = user?.id_rol?.nombre || user?.rol || user?.nombre_rol || ''
  return rol.trim().toLowerCase() === 'administrador'
})

async function cargarTodo() {
  cargando.value = true
  try {
    const promesas = [horarioService.listarAsignaciones()]

    if (esAdmin.value) {
      promesas.push(horarioService.listarTurnos())
      promesas.push(api.get(endpoints.usuarios.listar))
    }

    const resultados = await Promise.all(promesas)
    asignaciones.value = resultados[0].data || []

    if (esAdmin.value) {
      turnos.value = resultados[1].data || []
      const listaUsuarios = resultados[2].data || []
      usuarios.value = listaUsuarios
        .filter((u) => u.estado !== false)
        .map((u) => ({
          ...u,
          nombre_completo: [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' '),
        }))
    }
  } catch (error) {
    asignaciones.value = []
  } finally {
    cargando.value = false
  }
}

async function onHorarioAsignado() {
  mostrarMensaje({ texto: 'Horario asignado correctamente.', color: 'success' })
  await cargarTodo()
}


function abrirConfirmacionEliminar(bloque) {
  bloqueAEliminar.value = bloque
  modalConfirmarEliminar.value = true
}

async function confirmarQuitarAsignacion() {
  if (!bloqueAEliminar.value) return
  eliminando.value = true
  try {
    await horarioService.eliminarAsignacion(bloqueAEliminar.value.id_asignacion)
    modalConfirmarEliminar.value = false
    bloqueAEliminar.value = null
    mostrarMensaje({ texto: 'Asignación de horario eliminada.', color: 'success' })
    await cargarTodo()
  } catch (error) {
    mostrarMensaje({ texto: 'No se pudo eliminar la asignación.', color: 'error' })
  } finally {
    eliminando.value = false
  }
}

onMounted(() => cargarTodo())
</script>

<template>
  <div>

    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold text-grey-darken-4">Horarios del equipo</h1>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          Consulta los turnos asignados por día de la semana
        </p>
      </div>

      <v-btn
        v-if="esAdmin"
        color="#F2690D"
        variant="flat"
        prepend-icon="mdi-calendar-plus"
        rounded="lg"
        class="text-white font-weight-bold text-none"
        @click="modalAsignar = true"
      >
        Asignar horario
      </v-btn>
    </div>

    <!-- Pestañas visibles solo si es Administrador -->
    <v-tabs v-if="esAdmin" v-model="tabActiva" color="#F2690D" class="mb-5 border-b">
      <v-tab value="calendario" class="text-none font-weight-bold">
        <v-icon start icon="mdi-calendar-week" size="18" />
        Calendario Semanal
      </v-tab>
      <v-tab value="turnos" class="text-none font-weight-bold">
        <v-icon start icon="mdi-clock-edit-outline" size="18" />
        Catálogo de Turnos
      </v-tab>
    </v-tabs>

    <div v-if="cargando" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate color="#F2690D" />
    </div>

    <template v-else>
      <CalendarioSemanal
        v-if="tabActiva === 'calendario' || !esAdmin"
        :asignaciones="asignaciones"
        :es-admin="esAdmin"
        @eliminar-asignacion="abrirConfirmacionEliminar"
      />

      <CatalogoTurnosTab
        v-if="esAdmin && tabActiva === 'turnos'"
        :turnos="turnos"
        @actualizado="cargarTodo"
        @notificar="mostrarMensaje"
      />
    </template>


    <AsignarHorarioModal
      v-if="esAdmin"
      v-model="modalAsignar"
      :usuarios="usuarios"
      :turnos="turnos"
      @guardado="onHorarioAsignado"
    />


    <v-dialog v-model="modalConfirmarEliminar" max-width="400">
      <v-card rounded="lg" class="pa-5">
        <div class="d-flex align-center ga-3 mb-3">
          <v-avatar color="red-lighten-5" size="42">
            <v-icon icon="mdi-calendar-remove-outline" color="error" size="22" />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
              Quitar asignación
            </div>
            <div class="text-caption text-grey-darken-1">
              Esta acción eliminará el bloque en todos sus días asignados
            </div>
          </div>
        </div>

        <p class="text-body-2 text-grey-darken-3 mb-4">
          ¿Estás seguro de quitar este horario asignado a
          <strong>{{ bloqueAEliminar?.usuario_nombre }}</strong>?
        </p>

        <div class="d-flex justify-end ga-2">
          <v-btn
            variant="text"
            color="grey-darken-1"
            class="text-none"
            :disabled="eliminando"
            @click="modalConfirmarEliminar = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="text-white font-weight-bold text-none"
            :loading="eliminando"
            @click="confirmarQuitarAsignacion"
          >
            Sí, quitar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>


    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      location="bottom right"
      timeout="3500"
      rounded="lg"
    >
      {{ snackbar.texto }}

      <template #actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="white"
          @click="snackbar.visible = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>