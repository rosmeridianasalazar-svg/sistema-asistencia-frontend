<script setup>
import { ref, computed, watch } from 'vue'
import { useNotificacionStore } from '@/modules/notificaciones/store/notificacionStore'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'enviado'])

const notificacionStore = useNotificacionStore()

const tipoEnvio = ref('TODOS') // 'TODOS' | 'INDIVIDUAL'
const busquedaUsuario = ref('')
const usuarioSeleccionado = ref(null)
const mensaje = ref('')
const enviando = ref(false)
const cargandoUsuarios = ref(false)
const error = ref('')

// Filtra en vivo por nombre, apellidos, DNI o correo
const usuariosFiltrados = computed(() => {
  const q = busquedaUsuario.value.trim().toLowerCase()
  if (!q) return notificacionStore.destinatarios

  return notificacionStore.destinatarios.filter((u) => {
    const nombre = (u.nombre_completo || '').toLowerCase()
    const dni = (u.dni || '').toLowerCase()
    const correo = (u.correo || '').toLowerCase()
    return nombre.includes(q) || dni.includes(q) || correo.includes(q)
  })
})

watch(
  () => props.modelValue,
  async (abierto) => {
    if (abierto) {
      tipoEnvio.value = 'TODOS'
      busquedaUsuario.value = ''
      usuarioSeleccionado.value = null
      mensaje.value = ''
      error.value = ''
      cargandoUsuarios.value = true
      await notificacionStore.cargarDestinatarios()
      cargandoUsuarios.value = false
    }
  }
)

function cerrar() {
  if (enviando.value) return
  emit('update:modelValue', false)
}

async function enviar() {
  error.value = ''

  if (tipoEnvio.value === 'INDIVIDUAL' && !usuarioSeleccionado.value) {
    error.value = 'Selecciona un usuario de la lista.'
    return
  }

  if (!mensaje.value.trim()) {
    error.value = 'Escribe el mensaje de la notificación.'
    return
  }

  const destinatarioFinal =
    tipoEnvio.value === 'TODOS'
      ? 'TODOS'
      : String(usuarioSeleccionado.value.id_usuario)

  enviando.value = true
  const resultado = await notificacionStore.enviarNotificacion({
    destinatario: destinatarioFinal,
    mensaje: mensaje.value.trim(),
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
  <v-dialog :model-value="modelValue" max-width="500" @update:model-value="cerrar">
    <v-card rounded="lg" class="pa-5">
      <!-- Cabecera -->
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-bell-plus-outline" color="#f57c00" />
          <span class="text-h6 font-weight-bold" style="color: #f57c00; font-size: 18px !important">
            Nueva notificación
          </span>
        </div>

        <v-btn
          icon
          variant="text"
          size="small"
          color="grey-darken-2"
          :disabled="enviando"
          @click="cerrar"
        >
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>

      <v-form @submit.prevent="enviar">
        <!-- Selector: Todos vs Individual -->
        <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">
          ¿A quién va dirigido?
        </div>
        <v-btn-toggle
          v-model="tipoEnvio"
          mandatory
          color="#f37f0c"
          variant="outlined"
          density="compact"
          class="w-100 mb-4"
        >
          <v-btn value="TODOS" class="w-50 text-none">
            <v-icon start icon="mdi-bullhorn-outline" />
            A todos (Anuncio)
          </v-btn>
          <v-btn value="INDIVIDUAL" class="w-50 text-none">
            <v-icon start icon="mdi-account-outline" />
            Un usuario
          </v-btn>
        </v-btn-toggle>

        <!-- Buscador + Lista de usuarios -->
        <div v-if="tipoEnvio === 'INDIVIDUAL'" class="mb-4">
          <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">
            Selecciona el destinatario
          </div>

          <!-- Chip cuando ya eligió un usuario -->
          <div v-if="usuarioSeleccionado" class="mb-2">
            <v-chip
              color="orange-darken-2"
              variant="tonal"
              closable
              @click:close="usuarioSeleccionado = null"
            >
              <v-icon start icon="mdi-account-check" />
              {{ usuarioSeleccionado.nombre_completo }}
              <span v-if="usuarioSeleccionado.dni" class="ml-1 text-caption">
                (DNI: {{ usuarioSeleccionado.dni }})
              </span>
            </v-chip>
          </div>

          <!-- Buscador y lista desplegable integrada -->
          <template v-else>
            <v-text-field
              v-model="busquedaUsuario"
              placeholder="Buscar por nombre, apellido o DNI..."
              variant="outlined"
              density="compact"
              color="orange-darken-2"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              :disabled="enviando"
              class="mb-2"
            />

            <v-sheet border rounded="md" max-height="160" class="overflow-y-auto">
              <div v-if="cargandoUsuarios" class="pa-3 text-center text-caption text-grey">
                Cargando usuarios...
              </div>

              <div
                v-else-if="usuariosFiltrados.length === 0"
                class="pa-3 text-center text-caption text-grey"
              >
                No se encontraron usuarios con "{{ busquedaUsuario }}"
              </div>

              <v-list v-else density="compact" class="py-0">
                <v-list-item
                  v-for="u in usuariosFiltrados"
                  :key="u.id_usuario"
                  @click="usuarioSeleccionado = u"
                >
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ u.nombre_completo }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    DNI: {{ u.dni || 'Sin DNI' }} · {{ u.correo }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-sheet>
          </template>
        </div>

        <!-- Mensaje -->
        <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">
          Mensaje
        </div>
        <v-textarea
          v-model="mensaje"
          :placeholder="
            tipoEnvio === 'TODOS'
              ? 'Escribe el anuncio para todo el equipo...'
              : 'Escribe tu mensaje directo...'
          "
          variant="outlined"
          color="orange-darken-2"
          rows="3"
          :disabled="enviando"
          hide-details="auto"
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
            variant="text"
            color="grey-darken-1"
            :disabled="enviando"
            @click="cerrar"
          >
            Cancelar
          </v-btn>
          <v-btn
            type="submit"
            color="#f37f0c"
            class="text-white font-weight-bold px-5"
            prepend-icon="mdi-send"
            :loading="enviando"
          >
            Enviar
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>