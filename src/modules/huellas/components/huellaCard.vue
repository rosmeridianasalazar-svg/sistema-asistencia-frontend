<script setup>
defineProps({
  huella: {
    type: Object,
    required: true,
  },
  loading: Boolean,
})

defineEmits(['editar', 'desactivar'])

const dedos = {
  PULGAR: 'Pulgar',
  INDICE: 'Índice',
  MEDIO: 'Medio',
  ANULAR: 'Anular',
  MENIQUE: 'Meñique',
}
</script>

<template>
  <v-card border rounded="lg" elevation="0" class="h-100">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <v-avatar color="#F2690D" variant="tonal" size="42">
          <v-icon icon="mdi-fingerprint" size="25" />
        </v-avatar>

        <v-chip size="small" :color="huella.estado_huella ? 'success' : 'grey'" variant="tonal">
          {{ huella.estado_huella ? 'Activa' : 'Inactiva' }}
        </v-chip>
      </div>

      <div class="text-subtitle-1 font-weight-bold">
        {{ dedos[huella.dedo] || huella.dedo }}
      </div>

      <div class="text-body-2 text-medium-emphasis">Mano {{ huella.mano?.toLowerCase() }}</div>

      <v-divider class="my-3" />

      <div class="d-flex justify-space-between text-body-2">
        <span class="text-medium-emphasis">ID del sensor</span>
        <strong>{{ huella.huella_id_sensor }}</strong>
      </div>

      <div class="d-flex justify-space-between text-body-2 mt-2">
        <span class="text-medium-emphasis">Registro</span>
        <span>
          {{ huella.fecha_registro ? new Date(huella.fecha_registro).toLocaleDateString() : '—' }}
        </span>
      </div>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-3">
      <v-btn
        v-if="huella.estado_huella"
        size="small"
        variant="tonal"
        color="primary"
        prepend-icon="mdi-pencil"
        :disabled="loading"
        @click="$emit('editar', huella)"
      >
        Editar
      </v-btn>

      <v-spacer />

      <v-btn
        v-if="huella.estado_huella"
        size="small"
        variant="tonal"
        color="error"
        prepend-icon="mdi-delete-outline"
        :disabled="loading"
        @click="$emit('desactivar', huella)"
      >
        Desactivar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
