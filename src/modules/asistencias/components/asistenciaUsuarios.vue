<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  usuarios: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
})

const emit = defineEmits(['seleccionar'])

const busqueda = ref('')

const usuariosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  if (!texto) return props.usuarios

  return props.usuarios.filter((usuario) =>
    `${usuario.nombre} ${usuario.dni} ${usuario.rol}`.toLowerCase().includes(texto),
  )
})

function seleccionar(usuario) {
  emit('seleccionar', usuario)
}
</script>

<template>
  <v-card rounded="lg">
    <v-card-title class="d-flex flex-wrap align-center ga-3 pa-4">
      <div>
        <div class="text-h6">Trabajadores con asistencias</div>
        <div class="text-caption text-medium-emphasis">
          Selecciona un trabajador para consultar su historial.
        </div>
      </div>

      <v-spacer />

      <v-text-field
        v-model="busqueda"
        label="Buscar trabajador"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        max-width="300"
      />
    </v-card-title>

    <v-divider />

    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <template v-if="!loading && usuariosFiltrados.length">
      <div class="d-none d-md-block">
        <v-table>
          <thead>
            <tr>
              <th>Trabajador</th>
              <th>DNI</th>
              <th>Rol</th>
              <th class="text-center">Días completados</th>
              <th class="text-center">Total de horas</th>
              <th class="text-end">Acción</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="usuario in usuariosFiltrados" :key="usuario.id_usuario">
              <td class="font-weight-medium">{{ usuario.nombre }}</td>
              <td>{{ usuario.dni }}</td>
              <td>
                <v-chip size="small" variant="tonal">
                  {{ usuario.rol }}
                </v-chip>
              </td>
              <td class="text-center">
                {{ usuario.dias_registrados }}
              </td>
              <td class="text-center font-weight-medium">
                {{ usuario.total_formateado }}
              </td>
              <td class="text-end">
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  append-icon="mdi-arrow-right"
                  @click="seleccionar(usuario)"
                >
                  Ver historial
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div class="d-md-none pa-3">
        <v-card
          v-for="usuario in usuariosFiltrados"
          :key="usuario.id_usuario"
          variant="outlined"
          class="mb-3"
          rounded="lg"
          @click="seleccionar(usuario)"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div class="font-weight-medium">
                {{ usuario.nombre }}
              </div>
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </div>

            <div class="text-caption text-medium-emphasis mt-1">DNI: {{ usuario.dni }}</div>

            <div class="d-flex flex-wrap ga-2 mt-3">
              <v-chip size="small" variant="tonal">
                {{ usuario.rol }}
              </v-chip>
              <v-chip size="small" color="success" variant="tonal">
                {{ usuario.total_formateado }} horas
              </v-chip>
            </div>

            <div class="text-caption text-medium-emphasis mt-2">
              {{ usuario.dias_registrados }} días completados
            </div>
          </v-card-text>
        </v-card>
      </div>
    </template>

    <v-card-text v-else-if="!loading" class="text-center text-medium-emphasis py-10">
      <v-icon size="42" class="mb-2">mdi-account-search-outline</v-icon>
      <div>No hay trabajadores con asistencias registradas.</div>
    </v-card-text>
  </v-card>
</template>
