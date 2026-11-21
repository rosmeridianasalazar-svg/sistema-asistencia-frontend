<script setup>
import { ref, watch } from 'vue'
import horarioService from '../services/horarioService'

const props = defineProps({
  modelValue: Boolean,
  usuarios: { type: Array, default: () => [] },
  turnos: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'guardado'])

const usuarioId = ref(null)
const bloques = ref([{ horario_id_horario: null, dias: [] }])
const fechaInicio = ref(new Date().toISOString().slice(0, 10))
const fechaFin = ref('')
const guardando = ref(false)
const error = ref('')

const DIAS = [
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mié' },
  { id: 4, label: 'Jue' },
  { id: 5, label: 'Vie' },
  { id: 6, label: 'Sáb' },
  { id: 7, label: 'Dom' },
]

watch(() => props.modelValue, (abierto) => {
  if (abierto) {
    usuarioId.value = null
    bloques.value = [{ horario_id_horario: null, dias: [] }]
    fechaInicio.value = new Date().toISOString().slice(0, 10)
    fechaFin.value = ''
    error.value = ''
  }
})

function agregarBloque() {
  bloques.value.push({ horario_id_horario: null, dias: [] })
}

function quitarBloque(index) {
  if (bloques.value.length > 1) {
    bloques.value.splice(index, 1)
  }
}

// Evita marcar el mismo día en dos bloques distintos del mismo formulario
function diaOcupadoEnOtroBloque(diaId, indiceActual) {
  return bloques.value.some((b, idx) => idx !== indiceActual && b.dias.includes(diaId))
}

function cerrar() {
  emit('update:modelValue', false)
}

async function guardar() {
  error.value = ''
  if (!usuarioId.value) {
    error.value = 'Selecciona un colaborador.'
    return
  }

  for (let i = 0; i < bloques.value.length; i++) {
    const b = bloques.value[i]
    if (!b.horario_id_horario || b.dias.length === 0) {
      error.value = `Completa el turno y selecciona al menos un día en el Horario #${i + 1}.`
      return
    }
  }

  guardando.value = true
  try {
    await horarioService.crearAsignacion({
      usuarios_id_usuario: usuarioId.value,
      bloques: bloques.value,
      fecha_inicio: fechaInicio.value,
      fecha_fin: fechaFin.value || null,
    })
    emit('guardado')
    cerrar()
  } catch (err) {
    error.value = err.response?.data?.detail || 'No se pudo asignar el horario.'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="cerrar" max-width="560" persistent scrollable>
    <v-card rounded="lg" class="pa-5">
      <div class="d-flex justify-space-between align-center mb-2">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-calendar-plus" color="#F2690D" />
          <span class="text-h6 font-weight-bold text-grey-darken-4">Asignar horario</span>
        </div>
        <v-btn icon="mdi-close" variant="text" density="compact" @click="cerrar" />
      </div>

      <p class="text-caption text-grey-darken-1 mb-4">
        Puedes agregar múltiples bloques horarios si el colaborador entra a distintas horas según el día de la semana.
      </p>

      <v-card-text class="pa-0" style="max-height: 65vh">
        <!-- Selección de colaborador -->
        <v-select
          v-model="usuarioId"
          label="Colaborador"
          :items="usuarios"
          item-title="nombre_completo"
          item-value="id_usuario"
          variant="outlined"
          density="compact"
          color="orange-darken-2"
          class="mb-4"
        />

        <!-- Lista dinámica de bloques horarios -->
        <div
          v-for="(bloque, index) in bloques"
          :key="index"
          class="pa-3 mb-3 rounded-lg border bloque-box"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-caption font-weight-bold" style="color: #F2690D; letter-spacing: 0.3px">
              Horario #{{ index + 1 }}
            </span>

            <v-btn
              v-if="bloques.length > 1"
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              density="compact"
              title="Eliminar este bloque"
              @click="quitarBloque(index)"
            />
          </div>

          <v-select
            v-model="bloque.horario_id_horario"
            label="Turno / Bloque horario"
            :items="turnos.filter((t) => t.estado_horario)"
            :item-title="(t) => `${t.nombre} (${t.hora_entrada?.slice(0, 5)} - ${t.hora_salida?.slice(0, 5)})`"
            item-value="id_horario"
            variant="outlined"
            density="compact"
            bg-color="white"
            color="orange-darken-2"
            hide-details
            class="mb-3"
          />

          <div class="text-caption text-grey-darken-2 mb-1">Días que aplica este turno:</div>
          <v-chip-group
            v-model="bloque.dias"
            multiple
            column
            selected-class="bg-orange-darken-2 text-white"
          >
            <v-chip
              v-for="dia in DIAS"
              :key="dia.id"
              :value="dia.id"
              :disabled="diaOcupadoEnOtroBloque(dia.id, index)"
              filter
              variant="outlined"
              size="small"
            >
              {{ dia.label }}
            </v-chip>
          </v-chip-group>
        </div>

        <!-- Botón para añadir más horarios al mismo usuario -->
        <v-btn
          variant="tonal"
          color="#F2690D"
          size="small"
          prepend-icon="mdi-plus"
          class="text-none font-weight-bold mb-4"
          @click="agregarBloque"
        >
          Agregar otro horario para este colaborador
        </v-btn>

        <!-- Vigencia -->
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="fechaInicio"
              label="Vigente desde"
              type="date"
              variant="outlined"
              density="compact"
              color="orange-darken-2"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="fechaFin"
              label="Hasta (opcional)"
              type="date"
              variant="outlined"
              density="compact"
              color="orange-darken-2"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-3 text-caption">
        {{ error }}
      </v-alert>

      <div class="d-flex justify-end ga-2 mt-4 pt-2 border-t">
        <v-btn variant="text" color="grey-darken-1" class="text-none" @click="cerrar">Cancelar</v-btn>
        <v-btn
          color="#F2690D"
          variant="flat"
          class="text-white font-weight-bold text-none"
          :loading="guardando"
          @click="guardar"
        >
          Guardar {{ bloques.length > 1 ? `(${bloques.length} horarios)` : 'asignación' }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.bloque-box {
  background-color: #fafafa;
  border-color: #e0e0e0 !important;
}
</style>