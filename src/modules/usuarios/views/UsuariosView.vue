<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

import UsuarioForm from '../components/usuarioForm.vue'
import UsuarioDeleteDialog from '../components/usuarioDeleteDialog.vue'
import UsuariosTabla from '../components/usuarioTabla.vue'
import UsuariosNotificacion from '../components/usuarioNotificaciones.vue'

import { useUsuarios } from '../composables/useUsuarios'
import { obtenerErrores } from '@/services/apiError'

import '../styles/usuarios.css'

// Dispositivos
const { mobile } = useDisplay()

// Datos y operaciones de usuarios
const {
  usuarios,
  roles,
  cargando,
  guardando,
  eliminando,
  error,
  mensaje,
  cargarDatos,
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  limpiarMensajes,
} = useUsuarios()

// Diálogos
const dialogFormulario = ref(false)
const dialogEliminar = ref(false)
const usuarioSeleccionado = ref(null)

// Errores
const serverErrors = ref({ campos: {}, general: '' })
const errorEliminacion = ref('')

// Notificaciones
const snackbar = ref(false)
const snackbarMensaje = ref('')
const snackbarColor = ref('success')

// Filtros
const busqueda = ref('')
const filtroRol = ref(null)
const filtroEstado = ref(null)

// Usuarios procesados y filtrados
const usuariosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return usuarios.value
    .map((usuario) => {
      const rol = usuario.id_rol

      return {
        ...usuario,

        nombre_completo: [usuario.nombre, usuario.apellido_paterno, usuario.apellido_materno]
          .filter(Boolean)
          .join(' '),

        nombre_rol:
          typeof rol === 'object' && rol !== null
            ? rol.nombre
            : roles.value.find((item) => Number(item.id_rol) === Number(rol))?.nombre || 'Sin rol',

        id_rol_numero: typeof rol === 'object' && rol !== null ? Number(rol.id_rol) : Number(rol),
      }
    })
    .filter((usuario) => {
      const coincideBusqueda =
        !texto ||
        [usuario.dni, usuario.nombre_completo, usuario.correo, usuario.telefono].some((valor) =>
          String(valor ?? '')
            .toLowerCase()
            .includes(texto),
        )

      const coincideRol =
        filtroRol.value === null || usuario.id_rol_numero === Number(filtroRol.value)

      const coincideEstado = filtroEstado.value === null || usuario.estado === filtroEstado.value

      return coincideBusqueda && coincideRol && coincideEstado
    })
})

// Notificaciones
function mostrarNotificacion(texto, color = 'success') {
  snackbarMensaje.value = texto
  snackbarColor.value = color
  snackbar.value = true
}

// Limpiar errores
function limpiarErrores() {
  serverErrors.value = { campos: {}, general: '' }
}

// Abrir registro
function abrirRegistro() {
  usuarioSeleccionado.value = null
  limpiarErrores()
  limpiarMensajes()
  dialogFormulario.value = true
}

// Abrir edición
function abrirEdicion(usuario) {
  usuarioSeleccionado.value = usuario
  limpiarErrores()
  limpiarMensajes()
  dialogFormulario.value = true
}

// Registrar o actualizar
async function guardarUsuario(datos) {
  try {
    const resultado = usuarioSeleccionado.value
      ? await actualizarUsuario(usuarioSeleccionado.value.id_usuario, datos)
      : await registrarUsuario(datos)

    dialogFormulario.value = false
    usuarioSeleccionado.value = null
    limpiarErrores()

    mostrarNotificacion(
      mensaje.value || 'Operación realizada correctamente.',
      resultado.listaActualizada ? 'success' : 'warning',
    )
  } catch (err) {
    serverErrors.value = obtenerErrores(err)
  }
}

// Abrir confirmación de eliminación
function abrirEliminar(usuario) {
  usuarioSeleccionado.value = usuario
  errorEliminacion.value = ''
  dialogEliminar.value = true
}

// Confirmar eliminación
async function confirmarEliminacion() {
  if (!usuarioSeleccionado.value) return

  try {
    const resultado = await eliminarUsuario(usuarioSeleccionado.value.id_usuario)

    dialogEliminar.value = false
    usuarioSeleccionado.value = null

    mostrarNotificacion(
      mensaje.value || 'Usuario eliminado correctamente.',
      resultado.listaActualizada ? 'success' : 'warning',
    )
  } catch (err) {
    const errores = obtenerErrores(err)

    errorEliminacion.value = errores.general || 'No se pudo eliminar el usuario.'
  }
}

// Limpiar filtros
function limpiarFiltros() {
  busqueda.value = ''
  filtroRol.value = null
  filtroEstado.value = null
}

// Carga inicial
onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="usuarios-page">
    <!-- ENCABEZADO -->
    <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold text-grey-darken-4">Gestión de usuarios</h1>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          Administra los usuarios registrados, roles y estados de acceso en el sistema.
        </p>
      </div>

      <v-btn
        color="#F2690D"
        prepend-icon="mdi-account-plus-outline"
        variant="flat"
        rounded="lg"
        height="42"
        class="text-white font-weight-bold text-none"
        @click="abrirRegistro"
      >
        Nuevo usuario
      </v-btn>
    </div>

    <!-- ERROR DE CARGA -->
    <v-alert v-if="error" type="error" variant="tonal" density="comfortable" class="mb-4" closable>
      {{ error }}
    </v-alert>

    <!-- FILTROS -->
    <v-card rounded="lg" elevation="0" border class="bg-white mb-4">
      <v-card-text class="pa-3 pa-sm-4">
        <v-row align="center" dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="busqueda"
              label="Buscar usuario"
              placeholder="DNI, nombre, correo o teléfono"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              color="orange-darken-2"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" sm="5" md="3">
            <v-select
              v-model="filtroRol"
              label="Filtrar por rol"
              :items="roles"
              item-title="nombre"
              item-value="id_rol"
              variant="outlined"
              density="compact"
              color="orange-darken-2"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" sm="5" md="3">
            <v-select
              v-model="filtroEstado"
              label="Estado"
              :items="[
                { title: 'Activos', value: true },
                { title: 'Inactivos', value: false },
              ]"
              variant="outlined"
              density="compact"
              color="orange-darken-2"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" sm="2" md="1" class="d-flex justify-end">
            <v-btn
              variant="tonal"
              color="grey-darken-2"
              height="40"
              block
              title="Limpiar filtros"
              @click="limpiarFiltros"
            >
              <v-icon icon="mdi-filter-remove-outline" />
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- USUARIOS REGISTRADOS -->
    <v-card rounded="lg" elevation="0" border class="bg-white overflow-hidden">
      <v-card-title class="pa-4 d-flex align-center justify-space-between flex-wrap ga-2">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-account-group-outline" color="#F2690D" />
          <span class="text-subtitle-1 font-weight-bold text-grey-darken-4">
            Usuarios registrados
          </span>
        </div>

        <v-chip size="small" color="#F2690D" variant="tonal" class="font-weight-bold">
          {{ usuariosFiltrados.length }} {{ usuariosFiltrados.length === 1 ? 'registro' : 'registros' }}
        </v-chip>
      </v-card-title>

      <v-divider />

      <UsuariosTabla
        :usuarios="usuariosFiltrados"
        :cargando="cargando"
        :mobile="mobile"
        @editar="abrirEdicion"
        @eliminar="abrirEliminar"
      />
    </v-card>

    <!-- FORMULARIO -->
    <UsuarioForm
      v-model="dialogFormulario"
      :usuario="usuarioSeleccionado"
      :roles="roles"
      :loading="guardando"
      :server-errors="serverErrors"
      @guardar="guardarUsuario"
      @limpiar-errores="limpiarErrores"
    />

    <!-- CONFIRMACIÓN DE ELIMINACIÓN -->
    <UsuarioDeleteDialog
      v-model="dialogEliminar"
      :usuario="usuarioSeleccionado"
      :loading="eliminando"
      :error="errorEliminacion"
      @confirmar="confirmarEliminacion"
    />

    <!-- NOTIFICACIONES -->
    <UsuariosNotificacion v-model="snackbar" :mensaje="snackbarMensaje" :color="snackbarColor" />
  </div>
</template>
