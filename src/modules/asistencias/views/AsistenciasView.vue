<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import { useAsistencias } from '../composables/useAsistencias'
import AsistenciaUsuarios from '../components/asistenciaUsuarios.vue'
import '../styles/asistencia.css'

const router = useRouter()
const authStore = useAuthStore()

const { usuarios, cargando, error, listarUsuarios } = useAsistencias()

const rol = computed(
  () =>
    authStore.usuario?.id_rol?.nombre ||
    authStore.usuario?.rol ||
    authStore.usuario?.nombre_rol ||
    '',
)

const esAdministrador = computed(() => rol.value === 'Administrador')

onMounted(async () => {
  if (esAdministrador.value) {
    await listarUsuarios()
    return
  }

  const usuarioId = authStore.usuario?.id_usuario

  if (usuarioId) {
    router.replace({
      name: 'asistencias-usuario',
      params: { usuarioId },
    })
  }
})

function abrirHistorial(usuario) {
  router.push({
    name: 'asistencias-usuario',
    params: { usuarioId: usuario.id_usuario },
    query: {
      nombre: usuario.nombre,
      dni: usuario.dni,
      rol: usuario.rol || '',
    },
  })
}
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="mb-5">
      <div class="title text-h5 font-weight-bold">Gestión de asistencias</div>

      <div class="text-body-2 text-medium-emphasis">
        Consulta y administra los registros de asistencia.
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" closable class="mb-4">
      {{ error }}
    </v-alert>

    <AsistenciaUsuarios
      v-if="esAdministrador"
      :usuarios="usuarios"
      :loading="cargando"
      @seleccionar="abrirHistorial"
    />

    <v-progress-circular v-else indeterminate color="primary" class="d-block mx-auto mt-10" />
  </v-container>
</template>
