<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  item: { type: Object, default: null },
  confirmarEliminar: Boolean,
  eliminando: Boolean,
})

const emit = defineEmits(['update:modelValue', 'update:confirmarEliminar', 'pedirEliminar', 'confirmarBorrado'])

const contenido = computed(() => {
  const texto = props.item?.mensaje || ''
  const match = texto.match(/^\[(De|Para):\s*(.+?)\]\n?([\s\S]*)$/)
  return match
    ? { cabecera: `${match[1]}: ${match[2]}`, cuerpo: match[3] }
    : { cabecera: null, cuerpo: texto }
})
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="$emit('update:modelValue', $event)">
    <v-card v-if="item" rounded="lg" class="pa-5">
      <div class="d-flex justify-space-between align-center mb-3">
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

          <v-chip
            v-if="item.estado_notificacion !== 'E'"
            size="x-small"
            color="success"
            variant="flat"
            class="font-weight-bold"
          >
            Revisado
          </v-chip>
        </div>

        <v-btn icon variant="text" size="small" @click="$emit('update:modelValue', false)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>

      <div
        v-if="contenido.cabecera"
        class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-3 d-flex align-center ga-1"
      >
        <v-icon icon="mdi-account-circle-outline" size="18" color="#f37f0c" />
        <span>{{ contenido.cabecera }}</span>
      </div>

      <v-sheet
        border
        rounded="md"
        class="pa-4 bg-grey-lighten-5 text-body-2 text-grey-darken-4"
        style="white-space: pre-line; line-height: 1.6; max-height: 360px; overflow-y: auto"
      >
        {{ contenido.cuerpo }}
      </v-sheet>

      <div class="d-flex justify-space-between align-center mt-4">
        <v-btn
          variant="text"
          color="error"
          size="small"
          prepend-icon="mdi-trash-can-outline"
          class="text-none"
          @click="$emit('pedirEliminar', item)"
        >
          Eliminar
        </v-btn>

        <v-btn
          color="#f37f0c"
          class="text-white font-weight-bold px-5 text-none"
          @click="$emit('update:modelValue', false)"
        >
          Cerrar
        </v-btn>
      </div>
    </v-card>
  </v-dialog>

  <v-dialog
    :model-value="confirmarEliminar"
    max-width="380"
    :persistent="eliminando"
    @update:model-value="$emit('update:confirmarEliminar', $event)"
  >
    <v-card rounded="lg" class="pa-5">
      <div class="d-flex align-center ga-2 mb-2">
        <v-icon icon="mdi-alert-circle-outline" color="error" size="24" />
        <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
          ¿Eliminar notificación?
        </span>
      </div>

      <p class="text-body-2 text-grey-darken-1 mb-5">
        Esta acción quitará el mensaje de tu bandeja de forma permanente. ¿Deseas continuar?
      </p>

      <div class="d-flex justify-end ga-2">
        <v-btn
          variant="text"
          color="grey-darken-1"
          class="text-none"
          :disabled="eliminando"
          @click="$emit('update:confirmarEliminar', false)"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          class="text-white font-weight-bold text-none px-4"
          :loading="eliminando"
          @click="$emit('confirmarBorrado')"
        >
          Sí, eliminar
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>