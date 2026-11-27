<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificacionStore } from '@/modules/notificaciones/store/notificacionStore'
import NuevaNotificacion from '@/modules/notificaciones/components/NuevaNotificacion.vue'
import Cards from '@/modules/notificaciones/components/Cards.vue'
import NotificacionDetalle from '@/modules/notificaciones/components/NotificacionDetalle.vue'
import { parsearNotificacion } from '@/modules/notificaciones/utils/formatoMensaje'

const notificacionStore = useNotificacionStore()
const busqueda = ref('')
const bandeja = ref('RECIBIDOS')
const filtroEstado = ref('TODAS')
const modalAbierto = ref(false)
const datosRespuesta = ref(null)
const modalLectura = ref(false)
const modalConfirmarEliminar = ref(false)
const modalVaciarTodo = ref(false)
const notificacionActiva = ref(null)
const itemAEliminar = ref(null)
const eliminando = ref(false)
const vaciandoTodo = ref(false)
const snackbar = ref(false)
const snackbarTexto = ref('')

onMounted(() => notificacionStore.cargarNotificaciones())

const totalEnBandejaActual = computed(() =>
  bandeja.value === 'ENVIADOS'
    ? notificacionStore.enviadas.length
    : notificacionStore.recibidas.length
)

const notificacionesFiltradas = computed(() => {
  let lista =
    bandeja.value === 'ENVIADOS'
      ? notificacionStore.enviadas
      : notificacionStore.recibidas

  if (bandeja.value === 'RECIBIDOS' && filtroEstado.value !== 'TODAS') {
    lista = lista.filter((n) => n.estado_notificacion === filtroEstado.value)
  }

  const q = (busqueda.value || '').trim().toLowerCase()
  if (!q) return lista

  return lista.filter((n) => {
    const info = parsearNotificacion(n.mensaje)
    return (
      info.nombrePersona.toLowerCase().includes(q) ||
      info.cuerpo.toLowerCase().includes(q)
    )
  })
})

function mostrarConfirmacion(texto) {
  snackbarTexto.value = texto
  snackbar.value = true
}

function abrirNuevaNotificacion() {
  datosRespuesta.value = null
  modalAbierto.value = true
}

function iniciarRespuesta(payload) {
  modalLectura.value = false
  datosRespuesta.value = payload
  modalAbierto.value = true
}

async function abrirDetalle(item) {
  notificacionActiva.value = item
  modalLectura.value = true
  if (item.estado_notificacion === 'P') {
    await notificacionStore.marcarComoLeida(item.id_notificacion)
  }
}

function pedirConfirmacionEliminar(item) {
  itemAEliminar.value = item
  modalConfirmarEliminar.value = true
}

async function confirmarEliminar() {
  if (!itemAEliminar.value) return
  eliminando.value = true
  const ok = await notificacionStore.eliminarNotificacion(itemAEliminar.value.id_notificacion)
  eliminando.value = false
  modalConfirmarEliminar.value = false

  if (ok) {
    if (notificacionActiva.value?.id_notificacion === itemAEliminar.value.id_notificacion) {
      modalLectura.value = false
    }
    itemAEliminar.value = null
    mostrarConfirmacion('Notificación eliminada.')
  }
}

async function confirmarVaciarTodo() {
  vaciandoTodo.value = true
  const resultado = await notificacionStore.eliminarTodasLasNotificaciones(bandeja.value)
  vaciandoTodo.value = false
  modalVaciarTodo.value = false

  if (resultado.success) {
    modalLectura.value = false
    mostrarConfirmacion(resultado.mensaje)
  }
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold text-grey-darken-4">Notificaciones y Anuncios</h1>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          Revisa los comunicados recibidos, tu historial de enviados y responde mensajes
        </p>
      </div>

      <div class="d-flex flex-wrap align-center ga-2">
        <v-btn
          v-if="totalEnBandejaActual > 1"
          variant="outlined"
          color="error"
          prepend-icon="mdi-delete-sweep-outline"
          height="42"
          rounded="lg"
          class="text-none font-weight-bold"
          @click="modalVaciarTodo = true"
        >
          Eliminar todo ({{ totalEnBandejaActual }})
        </v-btn>

        <v-btn
          color="#f37f0c"
          class="text-white font-weight-bold text-none"
          prepend-icon="mdi-plus"
          height="42"
          rounded="lg"
          @click="abrirNuevaNotificacion"
        >
          Nueva notificación
        </v-btn>
      </div>
    </div>

    <v-tabs v-model="bandeja" color="#f37f0c" class="mb-4 border-b">
      <v-tab value="RECIBIDOS" class="text-none font-weight-bold">
        <v-icon start icon="mdi-inbox-arrow-down-outline" />
        Recibidos ({{ notificacionStore.recibidas.length }})
      </v-tab>
      <v-tab value="ENVIADOS" class="text-none font-weight-bold">
        <v-icon start icon="mdi-send-check-outline" />
        Enviados ({{ notificacionStore.enviadas.length }})
      </v-tab>
    </v-tabs>

    <!-- Filtros por estado + Buscador por persona o mensaje -->
    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-4">
      <v-chip-group
        v-if="bandeja === 'RECIBIDOS'"
        v-model="filtroEstado"
        mandatory
        selected-class="text-orange-darken-3"
      >
        <v-chip value="TODAS" variant="outlined" filter>
          Todas ({{ notificacionStore.recibidas.length }})
        </v-chip>
        <v-chip value="P" variant="outlined" filter>
          Sin leer ({{ notificacionStore.noLeidasCount }})
        </v-chip>
        <v-chip value="L" variant="outlined" filter>
          Leídas ({{ notificacionStore.recibidas.length - notificacionStore.noLeidasCount }})
        </v-chip>
      </v-chip-group>

      <div v-else />

      <v-text-field
        v-model="busqueda"
        placeholder="Buscar por persona o mensaje..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        color="orange-darken-2"
        bg-color="white"
        hide-details
        clearable
        style="max-width: 310px; width: 100%"
        @click:clear="busqueda = ''"
      />
    </div>

    <div v-if="notificacionStore.cargando" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate color="#f37f0c" />
    </div>

    <v-card
      v-else-if="notificacionesFiltradas.length === 0"
      rounded="lg"
      elevation="0"
      border
      class="pa-8 text-center bg-white"
    >
      <v-icon icon="mdi-bell-sleep-outline" size="48" color="grey-lighten-1" class="mb-2" />
      <div class="text-subtitle-1 font-weight-medium text-grey-darken-2">
        {{
          busqueda.trim()
            ? `No se encontraron mensajes con "${busqueda}"`
            : bandeja === 'ENVIADOS'
              ? 'Aún no has enviado ninguna notificación'
              : 'No hay notificaciones en esta sección'
        }}
      </div>
    </v-card>

    <!-- Lista compacta estilo bandeja de correo -->
    <v-card v-else rounded="lg" elevation="0" border class="bg-white overflow-hidden">
      <Cards
        v-for="item in notificacionesFiltradas"
        :key="item.id_notificacion"
        :item="item"
        :es-enviado="bandeja === 'ENVIADOS'"
        @abrir="abrirDetalle"
        @eliminar="pedirConfirmacionEliminar"
      />
    </v-card>

    <NotificacionDetalle
      v-model="modalLectura"
      v-model:confirmar-eliminar="modalConfirmarEliminar"
      :item="notificacionActiva"
      :eliminando="eliminando"
      @pedir-eliminar="pedirConfirmacionEliminar"
      @confirmar-borrado="confirmarEliminar"
      @responder="iniciarRespuesta"
    />

    <v-dialog v-model="modalVaciarTodo" max-width="400" :persistent="vaciandoTodo">
      <v-card rounded="lg" class="pa-5">
        <div class="d-flex align-center ga-2 mb-2">
          <v-icon icon="mdi-delete-alert-outline" color="error" size="26" />
          <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
            ¿Eliminar todas las notificaciones?
          </span>
        </div>

        <p class="text-body-2 text-grey-darken-1 mb-5">
          Se eliminarán de forma permanente las <strong>{{ totalEnBandejaActual }}</strong> notificaciones de tu bandeja de
          <strong>{{ bandeja === 'ENVIADOS' ? 'Enviados' : 'Recibidos' }}</strong>. Esta acción no se puede deshacer.
        </p>

        <div class="d-flex justify-end ga-2">
          <v-btn
            variant="text"
            color="grey-darken-1"
            class="text-none"
            :disabled="vaciandoTodo"
            @click="modalVaciarTodo = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            class="text-white font-weight-bold text-none px-4"
            :loading="vaciandoTodo"
            @click="confirmarVaciarTodo"
          >
            Sí, eliminar todo
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <NuevaNotificacion
      v-model="modalAbierto"
      :datos-respuesta="datosRespuesta"
      @enviado="mostrarConfirmacion"
    />

    <v-snackbar v-model="snackbar" color="success" timeout="3000" location="bottom right">
      {{ snackbarTexto }}
    </v-snackbar>
  </div>
</template>