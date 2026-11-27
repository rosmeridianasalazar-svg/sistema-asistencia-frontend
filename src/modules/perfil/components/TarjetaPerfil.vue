<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'

const props = defineProps({
  perfil: { type: Object, required: true },
})

const emit = defineEmits(['notificar'])
const authStore = useAuthStore()

const COLORES_AVATAR = ['#F2690D', '#6A1B9A', '#1565C0', '#2E7D32', '#00838F', '#37474F']
const colorAvatar = computed(() => authStore.colorAvatar)

const nombreCompleto = computed(() =>
  [props.perfil.nombre, props.perfil.apellido_paterno, props.perfil.apellido_materno]
    .filter(Boolean)
    .join(' ')
)

const iniciales = computed(() => {
  const n = (props.perfil.nombre || '').trim().charAt(0)
  const a = (props.perfil.apellido_paterno || '').trim().charAt(0)
  return (n + a).toUpperCase() || 'NX'
})

const nombreRol = computed(() => props.perfil.id_rol?.nombre || 'Colaborador')

function seleccionarColor(color) {
  if (colorAvatar.value === color) return
  authStore.cambiarColorAvatar(color)
  emit('notificar', 'Color de insignia actualizado correctamente.')
}
</script>

<template>
  <v-card rounded="lg" elevation="0" border class="bg-white overflow-hidden h-100">
    <div style="height: 82px; background: linear-gradient(135deg, #111111 0%, #262626 100%)" />

    <div class="px-5 pb-5 text-center" style="margin-top: -42px">
      <v-avatar
        size="84"
        :color="colorAvatar"
        class="text-white font-weight-bold text-h5 elevation-2"
        style="border: 4px solid #ffffff"
      >
        {{ iniciales }}
      </v-avatar>

      <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-4 mt-3 mb-1">
        {{ nombreCompleto || 'Usuario NEXOS' }}
      </h2>

      <v-chip size="small" color="#F2690D" variant="tonal" class="font-weight-bold mb-4">
        {{ nombreRol }}
      </v-chip>

      <!-- Selector rápido de color de avatar -->
      <div class="mb-4">
        <div class="text-caption text-grey mb-2">Color de tu insignia</div>
        <div class="d-flex justify-center ga-2">
          <button
            v-for="color in COLORES_AVATAR"
            :key="color"
            type="button"
            class="color-dot"
            :class="{ 'color-dot-active': colorAvatar === color }"
            :style="{ backgroundColor: color }"
            @click="seleccionarColor(color)"
          />
        </div>
      </div>

      <v-divider class="mb-4" />

      <!-- Datos institucionales fijos -->
      <div class="text-left d-flex flex-column ga-3 text-body-2">
        <div class="d-flex justify-space-between">
          <span class="text-grey-darken-1">DNI:</span>
          <span class="font-weight-bold text-grey-darken-4">{{ perfil.dni || '—' }}</span>
        </div>

        <div class="d-flex justify-space-between">
          <span class="text-grey-darken-1">Nacimiento:</span>
          <span class="font-weight-medium text-grey-darken-4">
            {{ perfil.fecha_nacimiento || 'No registrado' }}
          </span>
        </div>

        <div class="d-flex justify-space-between align-center">
          <span class="text-grey-darken-1">Estado:</span>
          <v-chip
            size="x-small"
            :color="perfil.estado ? 'success' : 'error'"
            variant="flat"
            class="font-weight-bold"
          >
            {{ perfil.estado ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.color-dot:hover {
  transform: scale(1.15);
}
.color-dot-active {
  border-color: #111111;
  transform: scale(1.15);
}
</style>