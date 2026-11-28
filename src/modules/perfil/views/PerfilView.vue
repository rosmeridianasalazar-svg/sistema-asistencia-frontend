<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import perfilService from '../services/perfilService'
import TarjetaPerfil from '../components/TarjetaPerfil.vue'
import ContactoForm from '../components/ContactoForm.vue'
import PasswordForm from '../components/PasswordForm.vue'

const authStore = useAuthStore()
const cargando = ref(false)

const perfil = ref({
  dni: '',
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  telefono: '',
  fecha_nacimiento: '',
  estado: true,
  id_rol: null,
})

const snackbar = ref({
  visible: false,
  texto: '',
  color: 'success',
})

function notificar(texto, color = 'success') {
  snackbar.value = { visible: true, texto, color }
}

async function cargarPerfil() {
  cargando.value = true
  try {
    const { data } = await perfilService.obtenerPerfil()
    perfil.value = data
  } catch {
    if (authStore.usuario) {
      perfil.value = { ...perfil.value, ...authStore.usuario }
    }
  } finally {
    cargando.value = false
  }
}

onMounted(() => cargarPerfil())
</script>

<template>
  <div>
    <div class="mb-5">
      <h1 class="text-h5 font-weight-bold text-grey-darken-4">Mi perfil</h1>
      <p class="text-body-2 text-grey-darken-1 mb-0">
        Consulta tu información personal, actualiza tus datos de contacto o cambia tu contraseña
      </p>
    </div>

    <div v-if="cargando" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate color="#F2690D" />
    </div>

    <v-row v-else>
      <v-col cols="12" md="4">
        <TarjetaPerfil :perfil="perfil" @notificar="notificar" />
      </v-col>

      <v-col cols="12" md="8" class="d-flex flex-column ga-4">
        <ContactoForm
          :correo="perfil.correo"
          :telefono="perfil.telefono"
          @actualizado="perfil = $event"
          @notificar="notificar"
        />

        <PasswordForm @notificar="notificar" />
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      location="bottom right"
      timeout="3500"
      rounded="lg"
    >
      {{ snackbar.texto }}
      <template #actions>
        <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="snackbar.visible = false" />
      </template>
    </v-snackbar>
  </div>
</template>