<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  esEnviado: { type: Boolean, default: false },
})

defineEmits(['abrir', 'eliminar'])

const contenido = computed(() => {
  const texto = props.item.mensaje || ''
  const match = texto.match(/^\[(De|Para):\s*(.+?)\]\n?([\s\S]*)$/)
  return match
    ? { cabecera: `${match[1]}: ${match[2]}`, cuerpo: match[3] }
    : { cabecera: null, cuerpo: texto }
})
</script>

<template>
  <v-card
    rounded="lg"
    elevation="1"
    class="h-100 d-flex flex-column justify-space-between cursor-pointer"
    :class="item.estado_notificacion === 'P' ? 'card-no-leida bg-white' : 'bg-grey-lighten-5'"
    @click="$emit('abrir', item)"
  >
    <div class="pa-4">
      <div class="d-flex justify-space-between align-center ga-2 mb-2">
        <v-chip
          size="small"
          :color="item.tipo === 'ANUNCIO' ? 'orange-darken-2' : 'blue-darken-2'"
          variant="tonal"
          :prepend-icon="item.tipo === 'ANUNCIO' ? 'mdi-bullhorn-outline' : 'mdi-message-text-outline'"
          class="font-weight-bold"
        >
          {{ item.tipo === 'ANUNCIO' ? 'Anuncio general' : 'Mensaje directo' }}
        </v-chip>

        <div class="d-flex align-center ga-1">
          <v-chip
            v-if="!esEnviado"
            size="x-small"
            :color="item.estado_notificacion === 'P' ? 'error' : 'success'"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.estado_notificacion === 'P' ? 'Sin leer' : 'Revisado' }}
          </v-chip>

          <v-chip v-else size="x-small" color="grey-darken-1" variant="tonal" class="font-weight-bold">
            Enviado
          </v-chip>

          <v-btn
            icon
            size="x-small"
            variant="text"
            color="grey-darken-1"
            title="Eliminar"
            @click.stop="$emit('eliminar', item)"
          >
            <v-icon icon="mdi-trash-can-outline" size="18" />
          </v-btn>
        </div>
      </div>

      <div
        v-if="contenido.cabecera"
        class="text-caption text-grey-darken-2 font-weight-bold mb-1 d-flex align-center ga-1"
      >
        <v-icon icon="mdi-account-circle-outline" size="15" color="#f37f0c" />
        <span>{{ contenido.cabecera }}</span>
      </div>

      <p
        class="text-body-2 mb-0 texto-resumen"
        :class="item.estado_notificacion === 'P' ? 'font-weight-medium text-grey-darken-4' : 'text-grey-darken-1'"
      >
        {{ contenido.cuerpo }}
      </p>
    </div>

    <div class="px-4 pb-3 pt-1 text-right">
      <span class="text-caption font-weight-bold" style="color: #f37f0c">
        Clic para leer completo →
      </span>
    </div>
  </v-card>
</template>

<style scoped>
.card-no-leida {
  border-left: 4px solid #f37f0c !important;
}
.texto-resumen {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
}
</style>