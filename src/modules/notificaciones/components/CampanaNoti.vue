<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import { useNotificacionStore } from '@/modules/notificaciones/store/notificacionStore'
import { parsearNotificacion } from '@/modules/notificaciones/utils/formatoMensaje'

const router = useRouter()
const authStore = useAuthStore()
const notificacionStore = useNotificacionStore()

const alertaVivo = ref(false)
const mensajeVivo = ref('')

const ultimasCinco = computed(() => notificacionStore.recibidas.slice(0, 5))

function formatearTextoCampana(texto, limite = 50) {
  if (!texto) return ''
  const info = parsearNotificacion(texto)
  const prefijo = info.nombrePersona ? `${info.nombrePersona}: ` : ''
  const limpio = `${prefijo}${info.cuerpo.replace(/\s+/g, ' ').trim()}`

  return limpio.length > limite ? `${limpio.slice(0, limite)}...` : limpio
}

onMounted(async () => {
  const idUsuario = authStore.usuario?.id_usuario
  if (idUsuario) {
    await notificacionStore.cargarNotificaciones()
    notificacionStore.iniciarTiempoReal(idUsuario)
  }
})

onUnmounted(() => {
  notificacionStore.detenerTiempoReal()
})

watch(
  () => notificacionStore.ultimaNotificacionEnVivo,
  (nueva) => {
    if (nueva) {
      const prefijo = nueva.tipo === 'ANUNCIO' ? '📢 ' : '✉️ '
      mensajeVivo.value = prefijo + formatearTextoCampana(nueva.mensaje)
      alertaVivo.value = true
    }
  }
)

async function abrirNotificacion(item) {
  if (item.estado_notificacion === 'P') {
    await notificacionStore.marcarComoLeida(item.id_notificacion)
  }
  router.push({ name: 'notificaciones' })
}
</script>

<template>
  <v-menu location="bottom end" transition="scale-transition" :offset="10">
    <template #activator="{ props }">
      <v-btn icon variant="text" color="white" class="mr-1" v-bind="props">
        <v-badge
          :content="notificacionStore.noLeidasCount"
          :model-value="notificacionStore.noLeidasCount > 0"
          color="#F2690D"
          max="99"
        >
          <v-icon icon="mdi-bell-outline" size="24" />
        </v-badge>
      </v-btn>
    </template>

    <v-card width="340" rounded="lg" elevation="6">
      <div class="pa-3 bg-grey-lighten-4 d-flex justify-space-between align-center">
        <span class="text-subtitle-2 font-weight-bold text-grey-darken-4">
          Notificaciones
        </span>
        <v-chip
          v-if="notificacionStore.noLeidasCount > 0"
          size="x-small"
          color="#F2690D"
          class="text-white font-weight-bold"
        >
          {{ notificacionStore.noLeidasCount }} nuevas
        </v-chip>
      </div>

      <v-divider />

      <div v-if="ultimasCinco.length === 0" class="pa-5 text-center text-caption text-grey">
        No tienes notificaciones aún.
      </div>

      <v-list v-else density="compact" class="py-0" max-height="300">
        <template v-for="(item, index) in ultimasCinco" :key="item.id_notificacion">
          <v-list-item
            :class="item.estado_notificacion === 'P' ? 'bg-orange-lighten-5' : ''"
            class="py-2"
            @click="abrirNotificacion(item)"
          >
            <template #prepend>
              <v-icon
                :icon="item.tipo === 'ANUNCIO' ? 'mdi-bullhorn-outline' : 'mdi-message-text-outline'"
                :color="item.tipo === 'ANUNCIO' ? 'orange-darken-2' : 'blue-darken-2'"
                size="20"
              />
            </template>

            <v-list-item-title class="text-caption font-weight-bold">
              {{ item.tipo === 'ANUNCIO' ? 'Anuncio general' : 'Mensaje directo' }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-caption text-truncate">
              {{ formatearTextoCampana(item.mensaje) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-divider v-if="index < ultimasCinco.length - 1" />
        </template>
      </v-list>

      <v-divider />

      <div class="pa-2 text-center">
        <v-btn
          variant="text"
          color="#F2690D"
          size="small"
          block
          class="font-weight-bold text-none"
          @click="router.push({ name: 'notificaciones' })"
        >
          Ver todas las notificaciones
        </v-btn>
      </div>
    </v-card>
  </v-menu>

  <v-snackbar
    v-model="alertaVivo"
    color="#111111"
    timeout="5000"
    location="top right"
  >
    <div class="d-flex align-center ga-2">
      <v-icon icon="mdi-bell-ring" color="#F2690D" />
      <span class="text-caption text-white">{{ mensajeVivo }}</span>
    </div>
    <template #actions>
      <v-btn
        size="x-small"
        color="#F2690D"
        variant="text"
        @click="alertaVivo = false; router.push({ name: 'notificaciones' })"
      >
        Ver
      </v-btn>
    </template>
  </v-snackbar>
</template>