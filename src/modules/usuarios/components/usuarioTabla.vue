<script setup>
const props = defineProps({
  usuarios: {
    type: Array,
    default: () => [],
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['editar', 'eliminar'])

// Encabezados de la tabla
const encabezados = [
  { title: 'ID', key: 'id_usuario', width: '70px' },
  { title: 'DNI', key: 'dni', width: '100px' },
  { title: 'Nombre completo', key: 'nombre_completo', minWidth: '190px' },
  { title: 'Teléfono', key: 'telefono', width: '120px' },
  { title: 'Correo electrónico', key: 'correo', minWidth: '210px' },
  { title: 'Rol', key: 'nombre_rol', width: '130px' },
  { title: 'Estado', key: 'estado', width: '110px' },
  { title: 'Acciones', key: 'acciones', sortable: false, width: '110px' },
]
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
      <template #[`item.nombre_completo`]="{ item }">
        <span class="font-weight-medium text-grey-darken-3">
          {{ item.nombre_completo }}
        </span>
      </template>

      <template #[`item.estado`]="{ item }">
        <v-chip :color="item.estado ? 'success' : 'grey'" size="small" variant="tonal">
          {{ item.estado ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>

      <template #[`item.acciones`]="{ item }">
        <div class="d-flex align-center ga-1">
          <v-btn
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            color="primary"
            aria-label="Editar usuario"
            @click="emit('editar', item)"
          />

          <v-btn
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            color="error"
            aria-label="Eliminar usuario"
            @click="emit('eliminar', item)"
          />
        </div>
      </template>
    </v-data-table>

    <!-- CELULAR: TARJETAS -->
    <div v-else class="usuarios-cards pa-3">
      <div v-if="props.cargando" class="text-center pa-6">
        <v-progress-circular indeterminate color="primary" />
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
          <div class="d-flex align-start justify-space-between ga-2 mb-3">
            <div class="min-width-0">
              <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">
                {{ usuario.nombre_completo }}
              </div>

              <div class="text-caption text-medium-emphasis">DNI: {{ usuario.dni }}</div>
            </div>

            <v-chip :color="usuario.estado ? 'success' : 'grey'" size="small" variant="tonal">
              {{ usuario.estado ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </div>

          <v-divider class="mb-3" />

          <div class="d-flex flex-column ga-3 text-body-2">
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-phone-outline" size="small" color="grey" />
              <span>{{ usuario.telefono || 'Sin teléfono' }}</span>
            </div>

            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-email-outline" size="small" color="grey" />
              <span class="usuario-texto-correo">
                {{ usuario.correo }}
              </span>
            </div>

            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-account-badge-outline" size="small" color="grey" />
              <span>{{ usuario.nombre_rol }}</span>
            </div>
          </div>

          <v-divider class="my-3" />

          <div class="d-flex justify-end ga-2">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil-outline"
              @click="emit('editar', usuario)"
            >
              Editar
            </v-btn>

            <v-btn
              color="error"
              variant="tonal"
              size="small"
              prepend-icon="mdi-delete-outline"
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
