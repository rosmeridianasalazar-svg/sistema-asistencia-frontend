<script setup>
const props = defineProps({
  usuarios: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
  mobile: { type: Boolean, default: false },
})

const emit = defineEmits(['editar', 'eliminar'])

const encabezados = [
  { title: 'Usuario', key: 'nombre_completo', minWidth: '230px' },
  { title: 'DNI', key: 'dni', width: '110px' },
  { title: 'Teléfono', key: 'telefono', width: '125px' },
  { title: 'Correo electrónico', key: 'correo', minWidth: '210px' },
  { title: 'Rol', key: 'nombre_rol', width: '145px' },
  { title: 'Estado', key: 'estado', width: '115px' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'end', width: '110px' },
]

function obtenerIniciales(nombreCompleto) {
  if (!nombreCompleto) return 'U'
  const partes = nombreCompleto.trim().split(/\s+/)
  return partes
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
}

function colorRol(nombreRol) {
  const rol = (nombreRol || '').toLowerCase()
  if (rol.includes('admin')) return 'orange-darken-3'
  if (rol.includes('empleado')) return 'blue-darken-2'
  return 'teal-darken-2'
}
</script>

<template>
  <div class="usuarios-tabla-contenedor">
    <!-- ESCRITORIO Y TABLET -->
    <v-data-table
      v-if="!props.mobile"
      :headers="encabezados"
      :items="props.usuarios"
      :loading="props.cargando"
      item-value="id_usuario"
      :items-per-page="10"
      loading-text="Cargando usuarios..."
      no-data-text="No hay usuarios registrados."
      no-results-text="No se encontraron usuarios."
      class="usuarios-table"
    >
      <!-- Avatar con iniciales + Nombre -->
      <template #[`item.nombre_completo`]="{ item }">
        <div class="d-flex align-center ga-3 py-2">
          <v-avatar color="#FFF3E0" size="36" class="font-weight-bold text-caption" style="color: #F2690D">
            {{ obtenerIniciales(item.nombre_completo) }}
          </v-avatar>
          <span class="font-weight-medium text-grey-darken-4">
            {{ item.nombre_completo }}
          </span>
        </div>
      </template>

      <!-- DNI con estilo monoespaciado limpio -->
      <template #[`item.dni`]="{ item }">
        <span class="text-body-2 text-grey-darken-2 font-weight-medium">
          {{ item.dni || '—' }}
        </span>
      </template>

      <!-- Teléfono -->
      <template #[`item.telefono`]="{ item }">
        <span class="text-body-2 text-grey-darken-2">
          {{ item.telefono || '—' }}
        </span>
      </template>

      <!-- Correo -->
      <template #[`item.correo`]="{ item }">
        <span class="text-body-2 text-grey-darken-1">
          {{ item.correo }}
        </span>
      </template>

      <!-- Rol con chip distintivo -->
      <template #[`item.nombre_rol`]="{ item }">
        <v-chip :color="colorRol(item.nombre_rol)" size="small" variant="tonal" class="font-weight-bold">
          {{ item.nombre_rol }}
        </v-chip>
      </template>

      <!-- Estado con punto indicador -->
      <template #[`item.estado`]="{ item }">
        <v-chip
          :color="item.estado ? 'success' : 'grey'"
          size="small"
          variant="tonal"
          class="font-weight-bold"
        >
          <v-icon start icon="mdi-circle" size="8" />
          {{ item.estado ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>

      <!-- Acciones con tooltips -->
      <template #[`item.acciones`]="{ item }">
        <div class="d-flex align-center justify-end ga-1">
          <v-btn
            icon
            size="small"
            variant="text"
            color="#F2690D"
            title="Editar usuario"
            @click="emit('editar', item)"
          >
            <v-icon icon="mdi-pencil-outline" size="20" />
          </v-btn>

          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            title="Eliminar usuario"
            @click="emit('eliminar', item)"
          >
            <v-icon icon="mdi-trash-can-outline" size="20" />
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- CELULAR: TARJETAS -->
    <div v-else class="usuarios-cards pa-3">
      <div v-if="props.cargando" class="text-center pa-6">
        <v-progress-circular indeterminate color="#F2690D" />
        <div class="text-caption text-medium-emphasis mt-2">Cargando usuarios...</div>
      </div>

      <v-alert v-else-if="!props.usuarios.length" type="info" variant="tonal" density="comfortable">
        No se encontraron usuarios.
      </v-alert>

      <v-card
        v-for="usuario in props.usuarios"
        :key="usuario.id_usuario"
        rounded="lg"
        elevation="0"
        class="usuario-card mb-3 border"
      >
        <v-card-text class="pa-3">
          <div class="d-flex align-center justify-space-between ga-2 mb-3">
            <div class="d-flex align-center ga-3 min-width-0">
              <v-avatar color="#FFF3E0" size="40" class="font-weight-bold text-body-2" style="color: #F2690D">
                {{ obtenerIniciales(usuario.nombre_completo) }}
              </v-avatar>
              <div class="min-width-0">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-4 text-truncate">
                  {{ usuario.nombre_completo }}
                </div>
                <div class="text-caption text-medium-emphasis">DNI: {{ usuario.dni }}</div>
              </div>
            </div>

            <v-chip :color="usuario.estado ? 'success' : 'grey'" size="x-small" variant="tonal" class="font-weight-bold">
              {{ usuario.estado ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </div>

          <v-divider class="mb-3" />

          <div class="d-flex flex-column ga-2 text-body-2">
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-shield-account-outline" size="small" color="#F2690D" />
              <span class="font-weight-medium">{{ usuario.nombre_rol }}</span>
            </div>

            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-phone-outline" size="small" color="grey" />
              <span>{{ usuario.telefono || 'Sin teléfono' }}</span>
            </div>

            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-email-outline" size="small" color="grey" />
              <span class="usuario-texto-correo text-grey-darken-1">{{ usuario.correo }}</span>
            </div>
          </div>

          <v-divider class="my-3" />

          <div class="d-flex justify-end ga-2">
            <v-btn
              color="#F2690D"
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil-outline"
              class="text-none"
              @click="emit('editar', usuario)"
            >
              Editar
            </v-btn>

            <v-btn
              color="error"
              variant="tonal"
              size="small"
              prepend-icon="mdi-delete-outline"
              class="text-none"
              @click="emit('eliminar', usuario)"
            >
              Eliminar
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
:deep(.usuarios-table thead th) {
  background-color: #f8f9fa !important;
  color: #424242 !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

:deep(.usuarios-table tbody tr:hover) {
  background-color: #fffaf5 !important;
}
</style>