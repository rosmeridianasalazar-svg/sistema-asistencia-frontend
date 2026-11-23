<script setup>
defineProps({
  usuario: {
    type: Object,
    required: true,
  },
})

defineEmits(['seleccionar'])
</script>

<template>
  <v-card border rounded="lg" elevation="0" class="h-100">
    <v-card-text class="pa-4">
      <div class="d-flex align-center ga-3 mb-4">
        <v-avatar color="#F2690D" variant="tonal" size="48">
          <v-icon icon="mdi-account" size="26" />
        </v-avatar>

        <div class="min-w-0">
          <div class="font-weight-bold text-body-1 text-truncate">
            {{ usuario.nombre }}
            {{ usuario.apellido_paterno }}
          </div>

          <div class="text-caption text-medium-emphasis">DNI: {{ usuario.dni }}</div>
        </div>
      </div>

      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-body-2 text-medium-emphasis">
          {{ usuario.rol || 'Sin rol' }}
        </div>

        <!-- <v-chip color="green" variant="tonal" size="small">
          <v-icon start icon="mdi-fingerprint" />
          {{ usuario.total_huellas || 0 }} huellas
        </v-chip> -->
        <v-chip
          :color="(usuario.total_huellas || 0) === 0 ? 'red' : 'green'"
          variant="tonal"
          size="small"
        >
          <v-icon start icon="mdi-fingerprint" />
          {{ usuario.total_huellas || 0 }} huellas
        </v-chip>
      </div>

      <v-btn
        block
        color="#F2690D"
        variant="tonal"
        append-icon="mdi-chevron-right"
        @click="$emit('seleccionar', usuario)"
      >
        Gestionar huellas
      </v-btn>
    </v-card-text>
  </v-card>
</template>
