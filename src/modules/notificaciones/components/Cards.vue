<script setup>
import { computed } from 'vue'
import { parsearNotificacion } from '../utils/formatoMensaje'

const props = defineProps({
  item: { type: Object, required: true },
  esEnviado: { type: Boolean, default: false },
})

defineEmits(['abrir', 'eliminar'])
const info = computed(() => parsearNotificacion(props.item.mensaje))
const esNoLeida = computed(() => !props.esEnviado && props.item.estado_notificacion === 'P')
</script>

<template>
  <div
    class="fila-correo d-flex align-start align-sm-center px-3 px-sm-4 py-3 cursor-pointer"
    :class="esNoLeida ? 'fila-no-leida bg-white' : 'bg-grey-lighten-5'"
    @click="$emit('abrir', item)"
  >
    <div class="mr-2 mr-sm-3 mt-1 mt-sm-0 d-flex align-center justify-center" style="width: 18px; flex-shrink: 0">
      <span v-if="esNoLeida" class="punto-no-leido" title="Sin leer" />
      <v-icon
        v-else-if="esEnviado"
        icon="mdi-check-all"
        size="16"
        color="grey-darken-1"
        title="Enviado"
      />
      <v-icon
        v-else
        icon="mdi-email-open-outline"
        size="16"
        color="grey"
        title="Leído"
      />
    </div>
    <div class="d-flex flex-column flex-sm-row align-sm-center flex-grow-1 min-w-0">
      <!-- Fila superior en móvil / Columna izquierda en escritorio -->
      <div class="d-flex align-center justify-space-between cab-remitente mr-sm-3 mb-1 mb-sm-0">
        <span
          class="text-body-2 text-truncate"
          :class="esNoLeida ? 'font-weight-bold text-grey-darken-4' : 'font-weight-medium text-grey-darken-2'"
        >
          {{ info.cabecera || (item.tipo === 'ANUNCIO' ? 'Anuncio del sistema' : 'Notificación') }}
        </span>

        <!-- Hora/fecha visible arriba a la derecha solo en móvil -->
        <div class="d-flex d-sm-none align-center ga-1 flex-shrink-0 ml-2">
          <span
            v-if="info.fechaEtiqueta"
            class="text-caption"
            :class="esNoLeida ? 'font-weight-bold text-orange-darken-3' : 'text-grey-darken-1'"
          >
            {{ info.fechaEtiqueta }}
          </span>
        </div>
      </div>

      <!-- Etiquetas + Vista previa -->
      <div class="d-flex align-center flex-grow-1 min-w-0 mr-sm-3">
        <v-chip
          size="x-small"
          :color="item.tipo === 'ANUNCIO' ? 'orange-darken-2' : 'blue-darken-2'"
          variant="tonal"
          class="font-weight-bold mr-2 flex-shrink-0"
        >
          {{ item.tipo === 'ANUNCIO' ? 'Anuncio' : 'Directo' }}
        </v-chip>

        <v-chip
          v-if="info.citaOriginal"
          size="x-small"
          color="grey-darken-2"
          variant="outlined"
          prepend-icon="mdi-reply"
          class="mr-2 flex-shrink-0"
        >
          Respuesta
        </v-chip>

        <span
          class="text-body-2 text-truncate"
          :class="esNoLeida ? 'font-weight-medium text-grey-darken-4' : 'text-grey-darken-1'"
        >
          {{ info.cuerpo }}
        </span>
      </div>
    </div>

    <div class="d-flex align-center ga-2 flex-shrink-0 ml-2">
      <v-chip
        v-if="esNoLeida"
        size="x-small"
        color="#f37f0c"
        variant="flat"
        class="text-white font-weight-bold d-none d-md-inline-flex"
      >
        Nuevo
      </v-chip>

      <span
        v-if="info.fechaEtiqueta"
        class="text-caption d-none d-sm-inline text-no-wrap"
        :class="esNoLeida ? 'font-weight-bold text-orange-darken-3' : 'text-grey-darken-1'"
        :title="info.fechaCompleta"
      >
        {{ info.fechaEtiqueta }}
      </span>

      <v-btn
        icon
        size="x-small"
        variant="text"
        color="grey-darken-1"
        title="Eliminar mensaje"
        @click.stop="$emit('eliminar', item)"
      >
        <v-icon icon="mdi-trash-can-outline" size="18" />
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.fila-correo {
  border-bottom: 1px solid #eeeeee;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}
.fila-correo:last-child {
  border-bottom: none;
}
.fila-correo:hover {
  background-color: #fff8f1 !important;
}
.fila-no-leida {
  border-left: 3px solid #f37f0c;
}
.punto-no-leido {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: #f37f0c;
  display: inline-block;
}
.cab-remitente {
  width: 100%;
  min-width: 0;
}
@media (min-width: 600px) {
  .cab-remitente {
    width: 185px;
    flex-shrink: 0;
  }
}
.min-w-0 {
  min-width: 0;
}
</style>