<script setup>
defineProps({
  modelValue: Boolean,
  huella: {
    type: Object,
    default: null,
  },
})

defineEmits(['aceptar'])
</script>

<template>
  <v-dialog :model-value="modelValue" persistent max-width="420">
    <v-card rounded="lg" class="pa-5 text-center">
      <v-avatar color="success" size="68" variant="tonal" class="mb-4">
        <v-icon icon="mdi-check-circle" size="42" />
      </v-avatar>

      <div class="text-h6 font-weight-bold">¡Huella registrada!</div>

      <div class="text-body-2 text-medium-emphasis mt-2">
        El dispositivo confirmó el registro y los datos se guardaron correctamente.
      </div>

      <v-card v-if="huella?.huella_id_sensor" variant="tonal" color="success" class="mt-4 pa-3">
        <div class="text-caption">ID asignado en el sensor</div>

        <div class="text-h5 font-weight-bold">
          {{ huella.huella_id_sensor }}
        </div>
      </v-card>

      <v-btn block color="success" class="mt-5" @click="$emit('aceptar')"> Aceptar </v-btn>
    </v-card>
  </v-dialog>
</template>
