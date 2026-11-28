<script setup>
import { ref, watch } from 'vue'
import { useAsistenciaForm } from '../composables/useAsistenciasForm'

const props = defineProps({
  modelValue: Boolean,
  jornada: {
    type: Object,
    default: null,
  },
  usuarioId: {
    type: Number,
    default: null,
  },
  loading: Boolean,
  error: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const { formulario, esEdicion, tieneCambios, cargar } = useAsistenciaForm()

const formRef = ref(null)

const estadosEntrada = [
  { title: 'Registrada', value: 'REGISTRADA' },
  { title: 'Puntual', value: 'PUNTUAL' },
  { title: 'Tardanza', value: 'TARDANZA' },
  { title: 'Justificado', value: 'JUSTIFICADO' },
]

const estadosSalida = [
  { title: 'Registrada', value: 'REGISTRADA' },
  { title: 'Justificado', value: 'JUSTIFICADO' },
]

const requerido = (value) => !!value || 'Este campo es obligatorio.'

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) cargar(props.jornada, props.usuarioId)
  },
)

function cerrar() {
  emit('update:modelValue', false)
}

async function guardar() {
  const resultado = await formRef.value?.validate()

  if (!resultado?.valid) return

  emit('guardar', obtenerDatos())
}

function obtenerDatos() {
  return {
    fecha_hora_entrada: new Date(`${formulario.fecha}T${formulario.hora_entrada}:00`).toISOString(),
    estado_entrada: formulario.estado_entrada,
    fecha_hora_salida: new Date(`${formulario.fecha}T${formulario.hora_salida}:00`).toISOString(),
    estado_salida: formulario.estado_salida,
  }
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="650"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="pa-4">
        {{ esEdicion ? 'Editar jornada' : 'Registrar jornada' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
          {{ error }}
        </v-alert>
        <v-form ref="formRef" @submit.prevent="guardar">
          <v-text-field
            v-model="formulario.fecha"
            label="Fecha"
            type="date"
            variant="outlined"
            :rules="[requerido]"
          />

          <div class="text-subtitle-2 font-weight-medium mb-2">Registro de entrada</div>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.hora_entrada"
                label="Hora de entrada"
                type="time"
                variant="outlined"
                :rules="[requerido]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="formulario.estado_entrada"
                :items="estadosEntrada"
                label="Estado de entrada"
                variant="outlined"
                :rules="[requerido]"
              />
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-medium mb-2">Registro de salida</div>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.hora_salida"
                label="Hora de salida"
                type="time"
                variant="outlined"
                :rules="[requerido]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="formulario.estado_salida"
                :items="estadosSalida"
                label="Estado de salida"
                variant="outlined"
                :rules="[requerido]"
              />
            </v-col>
          </v-row>

          <v-alert type="info" variant="tonal" color="#F2690D" density="compact">
            La salida debe ser posterior a la entrada por al menos dos horas.
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn variant="text" :disabled="loading" @click="cerrar"> Cancelar </v-btn>

        <v-btn
          color="primary"
          :loading="loading"
          :disabled="esEdicion && !tieneCambios"
          @click="guardar"
        >
          {{ esEdicion ? 'Guardar cambios' : 'Registrar jornada' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
