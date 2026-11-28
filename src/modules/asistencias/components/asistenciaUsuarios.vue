<script setup>
import { computed, ref } from 'vue'
import '../styles/asistencia.css'
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

function obtenerIniciales(nombre) {
  if (!nombre) return '?'
  const partes = nombre.trim().split(/\s+/)
  return partes.length > 1
    ? `${partes[0][0]}${partes[1][0]}`.toUpperCase()
    : nombre.slice(0, 2).toUpperCase()
}

function colorPorRol(rol) {
  const r = (rol || '').toLowerCase()
  if (r.includes('administrador')) return 'purple'
  if (r.includes('practicante')) return 'teal'
  if (r.includes('empleado')) return 'indigo'
  return 'blue-grey'
}
function redondearHoras(horas) {
  const valor = Number(horas)
  return isNaN(valor) ? 0 : Math.round(valor)
}
</script>

<template>
  <v-card rounded="xl" border elevation="0">
    <!-- Encabezado -->
    <v-card-item class="pa-5">
      <template #prepend>
        <v-avatar color="#F2690D" variant="tonal" rounded="lg" size="44">
          <v-icon icon="mdi-account-clock-outline" size="24" />
        </v-avatar>
      </template>

      <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
        Trabajadores con asistencias
        <v-chip
          v-if="!loading"
          size="x-small"
          color="#F2690D"
          variant="flat"
          class="font-weight-bold"
        >
          {{ usuariosFiltrados.length }}
        </v-chip>
      </v-card-title>

      <v-card-subtitle class="mt-0.5">
        Selecciona un trabajador para consultar su historial detallado.
      </v-card-subtitle>

      <template #append>
        <div class="d-none d-sm-block" style="width: 280px">
          <v-text-field
            v-model="busqueda"
            placeholder="Buscar por nombre, DNI o rol..."
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="solo-filled"
            flat
            rounded="lg"
            hide-details
            clearable
          />
        </div>
      </template>
    </v-card-item>

    <!-- Buscador en pantallas muy pequeñas -->
    <div class="d-sm-none px-4 pb-4">
      <v-text-field
        v-model="busqueda"
        placeholder="Buscar por nombre, DNI o rol..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="solo-filled"
        flat
        rounded="lg"
        hide-details
        clearable
      />
    </div>

    <v-divider />

    <!-- Estado de carga (Skeletons) -->
    <div v-if="loading" class="pa-4">
      <v-skeleton-loader type="table-row@5" />
    </div>

    <!-- Contenido con datos -->
    <template v-else-if="usuariosFiltrados.length">
      <!-- Vista Escritorio -->
      <div class="d-none d-md-block">
        <v-table hover class="tabla-trabajadores">
          <thead>
            <tr class="bg-grey-lighten-5 text-caption font-weight-bold text-medium-emphasis">
              <th class="py-3">Trabajador</th>
              <th class="py-3">Rol</th>
              <th class="py-3 text-center">Días completados</th>
              <th class="py-3 text-center">Total acumulado</th>
              <th class="py-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="usuario in usuariosFiltrados"
              :key="usuario.id_usuario"
              class="cursor-pointer fila-hover"
              @click="seleccionar(usuario)"
            >
              <!-- Avatar + Nombre + DNI agrupados -->
              <td class="py-3">
                <div class="d-flex align-center ga-3">
                  <v-avatar
                    color="#F2690D"
                    variant="tonal"
                    size="38"
                    class="font-weight-bold text-body-2"
                  >
                    {{ obtenerIniciales(usuario.nombre) }}
                  </v-avatar>
                  <div>
                    <div class="font-weight-semibold text-body-2 text-high-emphasis">
                      {{ usuario.nombre }}
                    </div>
                    <div class="text-caption text-medium-emphasis d-flex align-center ga-1">
                      <v-icon icon="mdi-card-account-details-outline" size="13" />
                      DNI: {{ usuario.dni }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Chip de Rol -->
              <td>
                <v-chip
                  size="small"
                  :color="colorPorRol(usuario.rol)"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  {{ usuario.rol }}
                </v-chip>
              </td>

              <!-- Días -->
              <td class="text-center">
                <span class="text-body-2 font-weight-medium">
                  {{ usuario.dias_registrados }}
                </span>
                <span class="text-caption text-medium-emphasis ml-1">días</span>
              </td>

              <!-- Horas -->
              <td class="text-center">
                <v-chip
                  size="small"
                  color="success"
                  variant="tonal"
                  prepend-icon="mdi-clock-check-outline"
                  class="font-weight-bold"
                >
                  {{ redondearHoras(usuario.total_horas) }} horas
                </v-chip>
              </td>

              <!-- Botón -->
              <td class="text-end">
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  rounded="lg"
                  append-icon="mdi-chevron-right"
                  class="text-none font-weight-semibold"
                  @click.stop="seleccionar(usuario)"
                >
                  Historial
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Vista Móvil -->
      <div class="d-md-none pa-4 d-flex flex-column ga-3">
        <v-card
          v-for="usuario in usuariosFiltrados"
          :key="usuario.id_usuario"
          border
          elevation="0"
          color:="grey-lighten-5"
          rounded="lg"
          @click="seleccionar(usuario)"
        >
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-start ga-2">
              <div class="d-flex align-center ga-3">
                <v-avatar color="#F2690D" variant="tonal" size="40" class="font-weight-bold">
                  {{ obtenerIniciales(usuario.nombre) }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-1 leading-tight">
                    {{ usuario.nombre }}
                  </div>
                  <div class="text-caption text-medium-emphasis mt-0.5">DNI: {{ usuario.dni }}</div>
                </div>
              </div>
              <v-icon color="medium-emphasis" size="20">mdi-chevron-right</v-icon>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex align-center justify-space-between flex-wrap ga-2">
              <v-chip size="x-small" :color="colorPorRol(usuario.rol)" variant="tonal">
                {{ usuario.rol }}
              </v-chip>

              <div class="d-flex align-center ga-3 text-caption">
                <span class="text-medium-emphasis">
                  <strong class="text-high-emphasis">{{ usuario.dias_registrados }}</strong> días
                </span>
                <v-chip size="x-small" color="success" variant="tonal" class="font-weight-bold">
                  {{ redondearHoras(usuario.total_horas) }} hrs
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </template>

    <!-- Estado vacío (Diferenciado entre sin datos y búsqueda sin resultados) -->
    <v-card-text v-else class="text-center py-12 px-4">
      <v-avatar color="grey-lighten-3" size="64" class="mb-3">
        <v-icon size="32" color="grey-darken-1">
          {{ busqueda ? 'mdi-magnify-remove-outline' : 'mdi-account-off-outline' }}
        </v-icon>
      </v-avatar>

      <div class="text-subtitle-1 font-weight-bold text-high-emphasis">
        {{ busqueda ? 'Sin coincidencias' : 'No hay trabajadores registrados' }}
      </div>

      <div class="text-body-2 text-medium-emphasis mt-1 mx-auto" style="max-width: 360px">
        {{
          busqueda
            ? `No encontramos ningún trabajador que coincida con "${busqueda}".`
            : 'Aún no existen trabajadores con asistencias registradas en el sistema.'
        }}
      </div>

      <v-btn
        v-if="busqueda"
        variant="tonal"
        color="primary"
        size="small"
        rounded="lg"
        class="mt-4 text-none"
        @click="busqueda = ''"
      >
        Limpiar búsqueda
      </v-btn>
    </v-card-text>
  </v-card>
</template>
