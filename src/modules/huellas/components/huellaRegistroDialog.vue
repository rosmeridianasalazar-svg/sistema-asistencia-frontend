<script setup>
defineProps({
  modelValue: Boolean,
})
</script>

<template>
  <v-dialog :model-value="modelValue" persistent max-width="420">
    <v-card rounded="lg" class="pa-6 text-center">
      <v-progress-circular indeterminate color="#F2690D" size="58" width="5" class="mb-5" />

      <div class="text-h6 font-weight-bold">Esperando respuesta del dispositivo</div>

      <div class="text-body-2 text-medium-emphasis mt-3">
        El ESP32 está procesando el registro de la huella. Sigue las indicaciones del dispositivo y
        espera la confirmación.
      </div>

      <v-progress-linear indeterminate color="primary" rounded class="mt-5" />
    </v-card>
  </v-dialog>
</template>
