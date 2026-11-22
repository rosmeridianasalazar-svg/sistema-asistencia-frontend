<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/autenticacion/store/authStore'
import perfilService from '../services/perfilService'

const authStore = useAuthStore()

const cargando = ref(false)
const guardandoDatos = ref(false)
const guardandoClave = ref(false)

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

const correoEdit = ref('')
const telefonoEdit = ref('')
const passwordActual = ref('')
const passwordNueva = ref('')
const passwordConfirmar = ref('')
const verClaves = ref(false)
const COLORES_AVATAR = ['#F2690D', '#6A1B9A', '#1565C0', '#2E7D32', '#00838F', '#37474F']
const colorAvatar = computed(() => authStore.colorAvatar)

function seleccionarColorAvatar(color) {
  authStore.cambiarColorAvatar(color)
}

const snackbar = ref({
  visible: false,
  texto: '',
  color: 'success',
})

function notificar(texto, color = 'success') {
  snackbar.value = { visible: true, texto, color }
}

const nombreCompleto = computed(() => {
  return [perfil.value.nombre, perfil.value.apellido_paterno, perfil.value.apellido_materno]
    .filter(Boolean)
    .join(' ')
})

const iniciales = computed(() => {
  const n = (perfil.value.nombre || '').trim().charAt(0)
  const a = (perfil.value.apellido_paterno || '').trim().charAt(0)
  return (n + a).toUpperCase() || 'NX'
})

const nombreRol = computed(() => {
  return perfil.value.id_rol?.nombre || 'Colaborador'
})

async function cargarPerfil() {
  cargando.value = true
  try {
    const { data } = await perfilService.obtenerPerfil()
    perfil.value = data
    correoEdit.value = data.correo || ''
    telefonoEdit.value = data.telefono || ''
  } catch (error) {
    if (authStore.usuario) {
      perfil.value = { ...perfil.value, ...authStore.usuario }
      correoEdit.value = authStore.usuario.correo || ''
      telefonoEdit.value = authStore.usuario.telefono || ''
    }
  } finally {
    cargando.value = false
  }
}

async function guardarDatosContacto() {
  if (!correoEdit.value.trim()) {
    notificar('El correo electrónico no puede estar vacío.', 'error')
    return
  }

  guardandoDatos.value = true
  try {
    const { data } = await perfilService.actualizarPerfil({
      correo: correoEdit.value.trim().toLowerCase(),
      telefono: telefonoEdit.value.trim(),
    })
    perfil.value = data.usuario
    if (authStore.usuario) {
      authStore.usuario = { ...authStore.usuario, ...data.usuario }
      sessionStorage.setItem('usuario', JSON.stringify(authStore.usuario))
    }

    notificar(data.detail || 'Datos actualizados correctamente.', 'success')
  } catch (error) {
    notificar(error.response?.data?.detail || 'No se pudieron actualizar los datos.', 'error')
  } finally {
    guardandoDatos.value = false
  }
}

async function actualizarPassword() {
  if (!passwordActual.value || !passwordNueva.value || !passwordConfirmar.value) {
    notificar('Completa todos los campos de contraseña.', 'error')
    return
  }
  if (passwordNueva.value.length < 6) {
    notificar('La nueva contraseña debe tener al menos 6 caracteres.', 'error')
    return
  }
  if (passwordNueva.value !== passwordConfirmar.value) {
    notificar('Las contraseñas nuevas no coinciden.', 'error')
    return
  }

  guardandoClave.value = true
  try {
    const { data } = await perfilService.cambiarPassword({
      password_actual: passwordActual.value,
      password_nueva: passwordNueva.value,
    })
    passwordActual.value = ''
    passwordNueva.value = ''
    passwordConfirmar.value = ''
    notificar(data.detail || 'Contraseña actualizada correctamente.', 'success')
  } catch (error) {
    notificar(error.response?.data?.detail || 'No se pudo cambiar la contraseña.', 'error')
  } finally {
    guardandoClave.value = false
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
        <v-card rounded="lg" elevation="0" border class="bg-white overflow-hidden h-100">
          <div style="height: 82px; background: linear-gradient(135deg, #111111 0%, #262626 100%)"></div>
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
                  @click="seleccionarColorAvatar(color)"
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
                <span class="font-weight-medium text-grey-darken-4">{{ perfil.fecha_nacimiento || 'No registrado' }}</span>
              </div>

              <div class="d-flex justify-space-between align-center">
                <span class="text-grey-darken-1">Estado:</span>
                <v-chip size="x-small" :color="perfil.estado ? 'success' : 'error'" variant="flat" class="font-weight-bold">
                  {{ perfil.estado ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="8" class="d-flex flex-column ga-4">
        <!-- Datos de contacto -->
        <v-card rounded="lg" elevation="0" border class="bg-white pa-5">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-card-account-details-outline" color="#F2690D" />
            <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
              Datos de contacto
            </span>
          </div>
          <p class="text-caption text-grey-darken-1 mb-4">
            Mantén tu correo y número de celular actualizados para recibir notificaciones del sistema.
          </p>

          <v-row density="compact">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="correoEdit"
                label="Correo electrónico"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                density="compact"
                color="orange-darken-2"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="telefonoEdit"
                label="Teléfono / Celular"
                prepend-inner-icon="mdi-phone-outline"
                variant="outlined"
                density="compact"
                color="orange-darken-2"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-end mt-2">
            <v-btn
              color="#F2690D"
              variant="flat"
              rounded="lg"
              class="text-white font-weight-bold text-none"
              :loading="guardandoDatos"
              @click="guardarDatosContacto"
            >
              Guardar cambios
            </v-btn>
          </div>
        </v-card>

        <!-- Seguridad / Cambio de contraseña -->
        <v-card rounded="lg" elevation="0" border class="bg-white pa-5">
          <div class="d-flex align-center justify-space-between mb-1">
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-lock-reset" color="#F2690D" />
              <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
                Cambiar contraseña
              </span>
            </div>

            <v-btn
              variant="text"
              size="small"
              color="grey-darken-1"
              class="text-none"
              :prepend-icon="verClaves ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click="verClaves = !verClaves"
            >
              {{ verClaves ? 'Ocultar' : 'Mostrar' }}
            </v-btn>
          </div>

          <p class="text-caption text-grey-darken-1 mb-4">
            Ingresa tu contraseña actual y define una nueva clave de al menos 6 caracteres.
          </p>

          <v-row density="compact">
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="passwordActual"
                label="Contraseña actual"
                :type="verClaves ? 'text' : 'password'"
                variant="outlined"
                density="compact"
                color="orange-darken-2"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="passwordNueva"
                label="Nueva contraseña"
                :type="verClaves ? 'text' : 'password'"
                variant="outlined"
                density="compact"
                color="orange-darken-2"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="passwordConfirmar"
                label="Confirmar nueva"
                :type="verClaves ? 'text' : 'password'"
                variant="outlined"
                density="compact"
                color="orange-darken-2"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-end mt-2">
            <v-btn
              color="#111111"
              variant="flat"
              rounded="lg"
              class="text-white font-weight-bold text-none"
              :loading="guardandoClave"
              @click="actualizarPassword"
            >
              Actualizar contraseña
            </v-btn>
          </div>
        </v-card>
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