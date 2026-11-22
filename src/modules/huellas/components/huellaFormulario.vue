<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  usuario: {
    type: Object,
    default: null,
  },
  huella: {
    type: Object,
    default: null,
  },
  loading: Boolean,
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const mano = ref('DERECHA')
const dedo = ref('INDICE')

const manos = [
  { title: 'Derecha', value: 'DERECHA' },
  { title: 'Izquierda', value: 'IZQUIERDA' },
]

const dedos = [
  { title: 'Pulgar', value: 'PULGAR' },
  { title: 'Índice', value: 'INDICE' },
  { title: 'Medio', value: 'MEDIO' },
  { title: 'Anular', value: 'ANULAR' },
  { title: 'Meñique', value: 'MENIQUE' },
]

const esEdicion = computed(() => Boolean(props.huella))

const hayCambios = computed(() => {
  if (!props.huella) return true

  return mano.value !== props.huella.mano || dedo.value !== props.huella.dedo
})

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      mano.value = props.huella?.mano || 'DERECHA'
      dedo.value = props.huella?.dedo || 'INDICE'
    }
  },
)

const cerrar = () => {
  if (!props.loading) emit('update:modelValue', false)
}

const guardar = () => {
  if (props.loading || (esEdicion.value && !hayCambios.value)) return

  emit('guardar', {
    mano: mano.value,
    dedo: dedo.value,
  })
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    persistent
    @update:model-value="!loading && emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="pa-4">
        {{ esEdicion ? 'Editar huella' : 'Nueva huella' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <div class="text-body-2 text-medium-emphasis mb-4">
          {{
            esEdicion
              ? 'Modifica los datos que deseas reemplazar en el dispositivo.'
              : 'Selecciona la mano y el dedo que se registrarán.'
          }}
        </div>

        <v-text-field
          :model-value="
            usuario?.nombre_completo ||
            [usuario?.nombre, usuario?.apellido_paterno, usuario?.apellido_materno]
              .filter(Boolean)
              .join(' ')
          "
          label="Usuario"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          readonly
          disabled
        />

        <v-text-field
          :model-value="usuario?.dni"
          label="DNI"
          prepend-inner-icon="mdi-card-account-details"
          variant="outlined"
          readonly
          disabled
        />

        <v-text-field
          :model-value="huella?.huella_id_sensor ?? 'Asignación automática'"
          label="ID del sensor"
          prepend-inner-icon="mdi-fingerprint"
          variant="outlined"
          readonly
          disabled
        />

        <v-select
          v-model="mano"
          label="Mano"
          :items="manos"
          item-title="title"
          item-value="value"
          prepend-inner-icon="mdi-hand-back-left"
          variant="outlined"
          :disabled="loading"
          hide-details="auto"
        />

        <v-select
          v-model="dedo"
          label="Dedo"
          :items="dedos"
          item-title="title"
          item-value="value"
          prepend-inner-icon="mdi-fingerprint"
          variant="outlined"
          class="mt-4"
          :disabled="loading"
          hide-details="auto"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn variant="text" :disabled="loading" @click="cerrar"> Cancelar </v-btn>

        <v-btn
          color="primary"
          :loading="loading"
          :disabled="loading || (esEdicion && !hayCambios)"
          @click="guardar"
        >
          {{ esEdicion ? 'Guardar cambios' : 'Crear huella' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
