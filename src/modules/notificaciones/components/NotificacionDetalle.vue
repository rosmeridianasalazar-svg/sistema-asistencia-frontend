<script setup>
import { computed } from 'vue'
import { parsearNotificacion } from '../utils/formatoMensaje'

const props = defineProps({
  modelValue: Boolean,
  confirmarEliminar: Boolean,
  item: { type: Object, default: null },
  eliminando: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:modelValue',
  'update:confirmarEliminar',
  'pedir-eliminar',
  'confirmar-borrado',
  'responder',
])

const info = computed(() => parsearNotificacion(props.item?.mensaje || ''))

const esEnviado = computed(() =>
  (info.value.cabecera || '').toLowerCase().startsWith('para:')
)

const inicialesPersona = computed(() => {
  const partes = (info.value.nombrePersona || '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return 'NX'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
})

function responderMensaje() {
  if (!props.item) return
  emit('responder', {
    nombrePersona: info.value.nombrePersona,
    textoOriginal: info.value.cuerpo,
  })
}
</script>

<template>
  <!-- Modal de lectura con cabecera y botones fijos + scroll interno en mensajes largos -->
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="item" rounded="lg" class="bg-white overflow-hidden">
      <!-- Barra superior fija -->
      <div class="d-flex justify-space-between align-center px-5 py-3 bg-grey-lighten-5 border-b flex-shrink-0">
        <div class="d-flex align-center ga-2">
          <v-chip
            size="small"
            :color="item.tipo === 'ANUNCIO' ? 'orange-darken-2' : 'blue-darken-2'"
            variant="tonal"
            :prepend-icon="item.tipo === 'ANUNCIO' ? 'mdi-bullhorn-outline' : 'mdi-message-text-outline'"
            class="font-weight-bold"
          >
            {{ item.tipo === 'ANUNCIO' ? 'Anuncio general' : 'Mensaje directo' }}
          </v-chip>

          <span v-if="info.fechaCompleta" class="text-caption text-grey-darken-1">
            · {{ info.fechaCompleta }}
          </span>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="grey-darken-2"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <!-- Contenido desplazable -->
      <v-card-text class="pa-5" style="max-height: 60vh">
        <!-- Remitente / Destinatario con avatar naranja -->
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar
            size="42"
            color="#f37f0c"
            class="text-white font-weight-bold text-body-2"
          >
            <v-icon v-if="item.tipo === 'ANUNCIO' && !info.nombrePersona" icon="mdi-bullhorn" size="20" />
            <span v-else>{{ inicialesPersona }}</span>
          </v-avatar>

          <div class="min-w-0 flex-grow-1">
            <div class="text-subtitle-2 font-weight-bold text-grey-darken-4 text-truncate">
              {{ info.nombrePersona || 'Sistema NEXOS' }}
            </div>
            <div class="text-caption text-grey-darken-1">
              {{ esEnviado ? 'Enviado por ti' : 'Para ti' }}
            </div>
          </div>
        </div>

        <!-- Hilo citado (si es respuesta) -->
        <div
          v-if="info.citaOriginal"
          class="bg-grey-lighten-4 border-s-lg border-orange-darken-2 pa-3 mb-4 rounded-e"
        >
          <div class="d-flex align-center ga-1 text-caption font-weight-bold text-grey-darken-2 mb-1">
            <v-icon icon="mdi-reply" size="14" color="#f37f0c" />
            <span>Mensaje anterior</span>
          </div>
          <div class="text-caption text-grey-darken-2" style="line-height: 1.45">
            {{ info.citaOriginal }}
          </div>
        </div>

        <!-- Cuerpo del mensaje limpio -->
        <div
          class="text-body-1 text-grey-darken-4 py-1"
          style="white-space: pre-line; line-height: 1.6"
        >
          {{ info.cuerpo }}
        </div>
      </v-card-text>

      <!-- Pie de acciones fijo -->
      <div class="d-flex justify-space-between align-center px-5 py-3 bg-grey-lighten-5 border-t flex-shrink-0">
        <v-btn
          variant="text"
          color="error"
          size="small"
          prepend-icon="mdi-trash-can-outline"
          class="text-none font-weight-medium"
          @click="emit('pedir-eliminar', item)"
        >
          Eliminar
        </v-btn>

        <div class="d-flex align-center ga-2">
          <v-btn
            v-if="!esEnviado && info.nombrePersona && item.tipo !== 'ANUNCIO'"
            variant="outlined"
            color="#f37f0c"
            rounded="lg"
            class="text-none font-weight-bold"
            prepend-icon="mdi-reply"
            @click="responderMensaje"
          >
            Responder
          </v-btn>

          <v-btn
            color="#f37f0c"
            variant="flat"
            rounded="lg"
            class="text-white text-none font-weight-bold px-5"
            @click="emit('update:modelValue', false)"
          >
            Cerrar
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>

  <!-- Diálogo de confirmación de borrado individual -->
  <v-dialog
    :model-value="confirmarEliminar"
    max-width="380"
    :persistent="eliminando"
    @update:model-value="emit('update:confirmarEliminar', $event)"
  >
    <v-card rounded="lg" class="pa-5">
      <div class="d-flex align-center ga-2 mb-2">
        <v-icon icon="mdi-delete-outline" color="error" size="24" />
        <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
          ¿Eliminar notificación?
        </span>
      </div>

      <p class="text-body-2 text-grey-darken-1 mb-5">
        Esta notificación se eliminará de tu bandeja y no podrás recuperarla.
      </p>

      <div class="d-flex justify-end ga-2">
        <v-btn
          variant="text"
          color="grey-darken-1"
          class="text-none"
          :disabled="eliminando"
          @click="emit('update:confirmarEliminar', false)"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          class="text-white font-weight-bold text-none px-4"
          :loading="eliminando"
          @click="emit('confirmar-borrado')"
        >
          Sí, eliminar
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>