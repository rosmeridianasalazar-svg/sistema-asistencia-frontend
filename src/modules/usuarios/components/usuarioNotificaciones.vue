<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mensaje: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'success',
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <v-snackbar
    :model-value="modelValue"
    :color="color"
    timeout="3500"
    location="bottom end"
    @update:model-value="emit('update:modelValue', $event)"
  >
    {{ mensaje }}

    <template #actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        aria-label="Cerrar notificación"
        @click="emit('update:modelValue', false)"
      />
    </template>
  </v-snackbar>
</template>
