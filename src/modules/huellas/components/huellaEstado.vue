<script setup>
defineProps({
  error: {
    type: String,
    default: '',
  },
  mensaje: {
    type: String,
    default: '',
  },
})

defineEmits(['cerrarError', 'cerrarMensaje'])
</script>

<template>
  <div class="mb-4">
    <v-alert v-if="error" type="error" variant="tonal" closable @click:close="$emit('cerrarError')">
      {{ error }}
    </v-alert>

    <v-alert
      v-if="mensaje"
      type="success"
      variant="tonal"
      closable
      class="mt-2"
      @click:close="$emit('cerrarMensaje')"
    >
      {{ mensaje }}
    </v-alert>
  </div>
</template>
