<script setup>
import HuellaCard from './huellaCard.vue'

defineProps({
  usuario: {
    type: Object,
    required: true,
  },
  huellas: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
  guardando: Boolean,
})

defineEmits(['regresar', 'crear', 'editar', 'desactivar'])
</script>

<template>
  <div>
    <div class="d-flex align-center flex-wrap ga-3 mb-5">
      <v-btn
        icon="mdi-arrow-left"
        color="#F2690D"
        variant="tonal"
        aria-label="Regresar"
        @click="$emit('regresar')"
      />

      <div class="flex-grow-1">
        <div class="text-h6 font-weight-bold">
          {{ usuario.nombre }}
          {{ usuario.apellido_paterno }}
        </div>

        <div class="text-body-2 text-medium-emphasis">
          DNI: {{ usuario.dni }} · {{ usuario.rol }}
        </div>
      </div>

      <v-btn color="#F2690D" prepend-icon="mdi-fingerprint" @click="$emit('crear')">
        Nueva huella
      </v-btn>
    </div>

    <v-divider class="mb-5" />

    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <div class="text-subtitle-1 font-weight-bold">Huellas del usuario</div>

        <div class="text-body-2 text-medium-emphasis">
          {{ huellas.length }} registros encontrados
        </div>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="#F2690D" class="mb-4" />

    <v-row v-if="huellas.length">
      <v-col v-for="huella in huellas" :key="huella.id_huella" cols="12" sm="6" lg="4">
        <HuellaCard
          :huella="huella"
          :loading="guardando"
          @editar="$emit('editar', $event)"
          @desactivar="$emit('desactivar', $event)"
        />
      </v-col>
    </v-row>

    <v-card v-else-if="!loading" border rounded="lg" elevation="0" class="pa-7 text-center">
      <v-icon icon="mdi-fingerprint-off" size="52" color="grey" />

      <div class="text-h6 mt-3">Sin huellas registradas</div>

      <div class="text-body-2 text-medium-emphasis mt-1 mb-4">
        Este usuario todavía no tiene huellas digitales.
      </div>

      <v-btn color="#F2690D" prepend-icon="mdi-plus" @click="$emit('crear')">
        Crear nueva huella
      </v-btn>
    </v-card>
  </div>
</template>
