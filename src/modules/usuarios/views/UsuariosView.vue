<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

import UsuarioForm from '../components/usuarioForm.vue'
import UsuarioDeleteDialog from '../components/usuarioDeleteDialog.vue'
import UsuariosTabla from '../components/usuarioTabla.vue'
import UsuariosNotificacion from '../components/usuarioNotificaciones.vue'

import { useUsuarios } from '../composables/useUsuarios'
import { obtenerErrores } from '@/services/apiError'
import { descargarCSV, descargarPDF } from '@/utils/exportarArchivos'

import '../styles/usuarios.css'

const { mobile } = useDisplay()

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

const dialogFormulario = ref(false)
const dialogEliminar = ref(false)
const usuarioSeleccionado = ref(null)

const serverErrors = ref({ campos: {}, general: '' })
const errorEliminacion = ref('')

const snackbar = ref(false)
const snackbarMensaje = ref('')
const snackbarColor = ref('success')

const busqueda = ref('')
const filtroRol = ref(null)
const filtroEstado = ref(null)

const usuariosFiltrados = computed(() => {
  const texto = (busqueda.value || '').trim().toLowerCase()

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

function exportarUsuarios(formato) {
  if (usuariosFiltrados.value.length === 0) {
    mostrarNotificacion('No hay usuarios para exportar.', 'warning')
    return
  }

  const columnas = [
    { titulo: 'DNI', campo: 'dni' },
    { titulo: 'Colaborador', campo: 'nombre_completo' },
    { titulo: 'Rol', campo: 'nombre_rol' },
    { titulo: 'Correo', campo: 'correo' },
    { titulo: 'Teléfono', campo: 'telefono' },
    { titulo: 'F. Nacimiento', campo: 'fecha_nacimiento' },
    { titulo: 'Estado', campo: 'estado_texto' },
  ]

  const filas = usuariosFiltrados.value.map((u) => ({
    ...u,
    estado_texto: u.estado ? 'Activo' : 'Inactivo',
  }))

  const fechaHoy = new Date().toISOString().slice(0, 10)

  if (formato === 'csv') {
    descargarCSV(`usuarios_nexos_${fechaHoy}`, columnas, filas)
    mostrarNotificacion('Archivo CSV de usuarios descargado.', 'success')
  } else {
    descargarPDF({
      nombreArchivo: `usuarios_nexos_${fechaHoy}`,
      titulo: 'Directorio de Colaboradores',
      subtitulo: `Total de registros exportados: ${filas.length}`,
      columnas,
      filas,
      orientacion: 'portrait',
    })
    mostrarNotificacion('Reporte PDF de usuarios generado.', 'success')
  }
}

function mostrarNotificacion(texto, color = 'success') {
  snackbarMensaje.value = texto
  snackbarColor.value = color
  snackbar.value = true
}

function limpiarErrores() {
  serverErrors.value = { campos: {}, general: '' }
}

function abrirRegistro() {
  usuarioSeleccionado.value = null
  limpiarErrores()
  limpiarMensajes()
  dialogFormulario.value = true
}

function abrirEdicion(usuario) {
  usuarioSeleccionado.value = usuario
  limpiarErrores()
  limpiarMensajes()
  dialogFormulario.value = true
}

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

function abrirEliminar(usuario) {
  usuarioSeleccionado.value = usuario
  errorEliminacion.value = ''
  dialogEliminar.value = true
}

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

function limpiarFiltros() {
  busqueda.value = ''
  filtroRol.value = null
  filtroEstado.value = null
}

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

      <div class="d-flex align-center ga-2">
        <!-- Menú Exportar PDF / CSV -->
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              color="grey-darken-3"
              prepend-icon="mdi-download-outline"
              append-icon="mdi-chevron-down"
              rounded="lg"
              height="42"
              class="bg-white font-weight-bold text-none"
            >
              Exportar
            </v-btn>
          </template>

          <v-list density="compact" rounded="lg" elevation="3">
            <v-list-item
              prepend-icon="mdi-file-pdf-box"
              title="Descargar PDF (Imprimir)"
              base-color="red-darken-2"
              @click="exportarUsuarios('pdf')"
            />
            <v-list-item
              prepend-icon="mdi-file-delimited-outline"
              title="Descargar CSV (Excel)"
              base-color="green-darken-3"
              @click="exportarUsuarios('csv')"
            />
          </v-list>
        </v-menu>

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
    </div>

    <!-- ERROR DE CARGA -->
    <v-alert v-if="error" type="error" variant="tonal" density="comfortable" class="mb-4" closable>
      {{ error }}
    </v-alert>

    <!-- FILTROS -->
    <v-card rounded="lg" elevation="0" border class="bg-white mb-4">
      <v-card-text class="pa-3 pa-sm-4">
        <v-row align="center" density="compact">
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
              @click:clear="busqueda = ''"
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

    <UsuarioForm
      v-model="dialogFormulario"
      :usuario="usuarioSeleccionado"
      :roles="roles"
      :loading="guardando"
      :server-errors="serverErrors"
      @guardar="guardarUsuario"
      @limpiar-errores="limpiarErrores"
    />


    <UsuarioDeleteDialog
      v-model="dialogEliminar"
      :usuario="usuarioSeleccionado"
      :loading="eliminando"
      :error="errorEliminacion"
      @confirmar="confirmarEliminacion"
    />


    <UsuariosNotificacion v-model="snackbar" :mensaje="snackbarMensaje" :color="snackbarColor" />
  </div>
</template>