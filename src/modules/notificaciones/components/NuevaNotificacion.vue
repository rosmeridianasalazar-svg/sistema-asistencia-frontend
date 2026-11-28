<script setup>
import { ref, watch } from 'vue'
import { useNotificacionStore } from '@/modules/notificaciones/store/notificacionStore'

const props = defineProps({
  modelValue: Boolean,
  datosRespuesta: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'enviado'])

const notificacionStore = useNotificacionStore()

const tipoEnvio = ref('TODOS')
const destinatarioId = ref(null)
const mensaje = ref('')
const enviando = ref(false)
const error = ref('')

watch(
  () => props.modelValue,
  async (abierto) => {
    if (!abierto) return
    destinatarioId.value = null
    mensaje.value = ''
    error.value = ''

    if (!notificacionStore.destinatarios.length) {
      await notificacionStore.cargarDestinatarios()
    }

    if (props.datosRespuesta?.nombrePersona) {
      tipoEnvio.value = 'INDIVIDUAL'
      const buscado = props.datosRespuesta.nombrePersona.trim().toLowerCase()
      const encontrado = notificacionStore.destinatarios.find(
        (u) => (u.nombre_completo || '').trim().toLowerCase() === buscado
      )
      if (encontrado) destinatarioId.value = encontrado.id_usuario
    } else {
      tipoEnvio.value = 'TODOS'
    }
  }
)

function cerrar() {
  if (!enviando.value) emit('update:modelValue', false)
}

async function enviar() {
  error.value = ''

  if (tipoEnvio.value === 'INDIVIDUAL' && !destinatarioId.value) {
    error.value = 'Selecciona un destinatario de la lista.'
    return
  }

  if (!mensaje.value.trim()) {
    error.value = 'Escribe el mensaje de la notificación.'
    return
  }

  let cuerpo = mensaje.value.trim()
  if (props.datosRespuesta?.textoOriginal) {
    const limpio = props.datosRespuesta.textoOriginal.replace(/\s+/g, ' ').trim()
    const resumen = limpio.length > 110 ? `${limpio.slice(0, 110)}...` : limpio
    cuerpo = `[En respuesta a: "${resumen}"]\n${cuerpo}`
  }

  enviando.value = true
  const resultado = await notificacionStore.enviarNotificacion({
    destinatario: tipoEnvio.value === 'TODOS' ? 'TODOS' : String(destinatarioId.value),
    mensaje: `[TS:${new Date().toISOString()}]\n${cuerpo}`,
  })
  enviando.value = false

  if (resultado.success) {
    emit('enviado', resultado.mensaje)
    emit('update:modelValue', false)
  } else {
    error.value = resultado.mensaje
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="480" @update:model-value="cerrar">
    <v-card rounded="lg" class="bg-white pa-5">
      <!-- Cabecera limpia sobre fondo blanco -->
      <div class="d-flex justify-space-between align-center pb-3 mb-4 border-b">
        <div class="d-flex align-center ga-2">
          <v-icon :icon="datosRespuesta ? 'mdi-reply' : 'mdi-bell-plus-outline'" color="#f37f0c" />
          <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
            {{ datosRespuesta ? 'Responder mensaje' : 'Nueva notificación' }}
          </span>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="grey-darken-2"
          :disabled="enviando"
          @click="cerrar"
        />
      </div>

      <v-form @submit.prevent="enviar">
        <!-- Cita del mensaje al que se responde -->
        <div
          v-if="datosRespuesta?.textoOriginal"
          class="bg-orange-lighten-5 border-s-lg border-orange-darken-2 pa-3 mb-4 rounded-e"
        >
          <div class="text-caption font-weight-bold text-grey-darken-3 mb-1">
            Respondiendo a {{ datosRespuesta.nombrePersona }}:
          </div>
          <div class="text-caption text-grey-darken-2 font-italic text-truncate">
            "{{ datosRespuesta.textoOriginal }}"
          </div>
        </div>

        <!-- Selector de alcance -->
        <template v-if="!datosRespuesta">
          <div class="text-caption font-weight-bold text-grey-darken-3 mb-1">
            ¿A quién va dirigido?
          </div>
          <v-btn-toggle
            v-model="tipoEnvio"
            mandatory
            divided
            variant="outlined"
            density="comfortable"
            class="w-100 mb-4 border"
          >
            <v-btn
              value="TODOS"
              class="w-50 text-none font-weight-bold"
              :color="tipoEnvio === 'TODOS' ? '#f37f0c' : 'grey-darken-2'"
              :variant="tipoEnvio === 'TODOS' ? 'flat' : 'text'"
            >
              <v-icon start icon="mdi-bullhorn-outline" />
              A todos (Anuncio)
            </v-btn>
            <v-btn
              value="INDIVIDUAL"
              class="w-50 text-none font-weight-bold"
              :color="tipoEnvio === 'INDIVIDUAL' ? '#f37f0c' : 'grey-darken-2'"
              :variant="tipoEnvio === 'INDIVIDUAL' ? 'flat' : 'text'"
            >
              <v-icon start icon="mdi-account-outline" />
              Un usuario
            </v-btn>
          </v-btn-toggle>
        </template>

        <!-- Selector inteligente con buscador integrado -->
        <div v-if="tipoEnvio === 'INDIVIDUAL'" class="mb-4">
          <div class="text-caption font-weight-bold text-grey-darken-3 mb-1">
            Destinatario
          </div>
          <v-autocomplete
            v-model="destinatarioId"
            :items="notificacionStore.destinatarios"
            item-title="nombre_completo"
            item-value="id_usuario"
            placeholder="Escribe o selecciona un usuario..."
            prepend-inner-icon="mdi-account-search-outline"
            variant="outlined"
            density="comfortable"
            color="orange-darken-2"
            no-data-text="No se encontraron usuarios"
            hide-details="auto"
            :readonly="Boolean(datosRespuesta)"
            :disabled="enviando"
          />
        </div>

        <!-- Mensaje con altura fija y scroll interno al escribir textos largos -->
        <div class="text-caption font-weight-bold text-grey-darken-3 mb-1">
          {{ datosRespuesta ? 'Tu respuesta' : 'Mensaje' }}
        </div>
        <v-textarea
          v-model="mensaje"
          :placeholder="
            datosRespuesta
              ? 'Escribe tu respuesta aquí...'
              : tipoEnvio === 'TODOS'
                ? 'Escribe el anuncio para todo el equipo...'
                : 'Escribe tu mensaje directo...'
          "
          variant="outlined"
          color="orange-darken-2"
          rows="4"
          no-resize
          hide-details="auto"
          :disabled="enviando"
        />

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3 text-caption"
        >
          {{ error }}
        </v-alert>

        <div class="d-flex justify-end ga-2 mt-5">
          <v-btn
            type="button"
            variant="outlined"
            color="grey-darken-2"
            class="text-none font-weight-medium"
            :disabled="enviando"
            @click="cerrar"
          >
            Cancelar
          </v-btn>
          <v-btn
            type="submit"
            color="#f37f0c"
            variant="flat"
            class="text-white font-weight-bold text-none px-5"
            prepend-icon="mdi-send"
            :loading="enviando"
          >
            {{ datosRespuesta ? 'Enviar respuesta' : 'Enviar' }}
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>