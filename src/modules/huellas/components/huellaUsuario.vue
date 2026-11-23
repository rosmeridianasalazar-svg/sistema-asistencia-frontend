<script setup>
import HuellaUsuarioCard from './huellaUsuarioCard.vue'

defineProps({
  usuarios: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
})

defineEmits(['seleccionar'])
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <!-- <div>
        <div class="text-h6 font-weight-bold">Usuarios</div>
        <div class="text-body-2 text-medium-emphasis">
          Selecciona un usuario para administrar sus huellas.
        </div>
      </div> -->

      <v-chip variant="tonal" color="#F2690D"> {{ usuarios.length }} usuarios </v-chip>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="#F2690D" class="mb-4" />

    <v-row v-if="usuarios.length">
      <v-col v-for="usuario in usuarios" :key="usuario.id_usuario" cols="12" sm="6" lg="4" xl="3">
        <HuellaUsuarioCard :usuario="usuario" @seleccionar="$emit('seleccionar', $event)" />
      </v-col>
    </v-row>

    <v-card v-else-if="!loading" border rounded="lg" elevation="0" class="pa-8 text-center">
      <v-icon icon="mdi-account-search-outline" size="48" color="grey" />

      <div class="text-body-1 mt-3">No hay usuarios disponibles.</div>
    </v-card>
  </div>
</template>
