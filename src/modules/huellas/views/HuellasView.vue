<script setup>
import { onMounted, ref } from 'vue'

import { useHuellas } from '../composables/useHuellas'

import HuellaUsuarios from '../components/huellaUsuario.vue'
import HuellaDetalle from '../components/huellaDetalle.vue'
import HuellaFormulario from '../components/huellaFormulario.vue'
import HuellaRegistroDialog from '../components/huellaRegistroDialog.vue'
import HuellaExitoDialog from '../components/huellaExitoDialog.vue'
import HuellaEstado from '../components/huellaEstado.vue'

const {
  usuarios,
  huellas,
  cargandoUsuarios,
  cargandoHuellas,
  guardando,
  error,
  mensaje,
  cargarUsuarios,
  cargarHuellas,
  crearHuella,
  actualizarHuella,
  eliminarHuella,
  limpiarMensajes,
} = useHuellas()

const usuarioSeleccionado = ref(null)
const huellaEditando = ref(null)
const huellaCreada = ref(null)
const huellaDesactivar = ref(null)

const dialogFormulario = ref(false)
const dialogEspera = ref(false)
const dialogExito = ref(false)
const dialogDesactivar = ref(false)

// const nombreUsuario = computed(() => {
//   const usuario = usuarioSeleccionado.value

//   return usuario
//     ? [usuario.nombre, usuario.apellido_paterno, usuario.apellido_materno].filter(Boolean).join(' ')
//     : ''
// })

const seleccionarUsuario = async (usuario) => {
  limpiarMensajes()
  usuarioSeleccionado.value = usuario
  await cargarHuellas(usuario.id_usuario)
}

const regresar = () => {
  usuarioSeleccionado.value = null
  huellas.value = []
  limpiarMensajes()
}

const abrirRegistro = () => {
  limpiarMensajes()
  huellaEditando.value = null
  dialogFormulario.value = true
}

const abrirEdicion = (huella) => {
  limpiarMensajes()
  huellaEditando.value = huella
  dialogFormulario.value = true
}

const guardarFormulario = async (datos) => {
  if (!usuarioSeleccionado.value || guardando.value) return

  if (huellaEditando.value) {
    try {
      await actualizarHuella(
        huellaEditando.value.id_huella,
        datos,
        usuarioSeleccionado.value.id_usuario,
      )

      dialogFormulario.value = false
      huellaEditando.value = null
    } catch {
      // El composable gestiona el error.
    }

    return
  }

  dialogFormulario.value = false
  dialogEspera.value = true

  try {
    const respuesta = await crearHuella({
      usuarios_id_usuario: usuarioSeleccionado.value.id_usuario,
      mano: datos.mano,
      dedo: datos.dedo,
    })

    huellaCreada.value = respuesta
    dialogEspera.value = false
    dialogExito.value = true
  } catch {
    dialogEspera.value = false
  }
}

const aceptarRegistro = () => {
  dialogExito.value = false
  huellaCreada.value = null
  limpiarMensajes()
}

const confirmarDesactivacion = (huella) => {
  huellaDesactivar.value = huella
  dialogDesactivar.value = true
}

const desactivar = async () => {
  if (!huellaDesactivar.value || guardando.value) return

  try {
    await eliminarHuella(huellaDesactivar.value.id_huella, usuarioSeleccionado.value.id_usuario)

    dialogDesactivar.value = false
    huellaDesactivar.value = null
  } catch {
    // El composable gestiona el error.
  }
}

onMounted(cargarUsuarios)
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="mb-5">
      <div class="text-h5 font-weight-bold">Gestión de huellas</div>

      <div class="text-body-2 text-medium-emphasis mt-1">
        Administración de registros biométricos de los usuarios.
      </div>
    </div>

    <HuellaEstado
      :error="error"
      :mensaje="mensaje"
      @cerrar-error="limpiarMensajes"
      @cerrar-mensaje="limpiarMensajes"
    />

    <HuellaUsuarios
      v-if="!usuarioSeleccionado"
      :usuarios="usuarios"
      :loading="cargandoUsuarios"
      @seleccionar="seleccionarUsuario"
    />

    <HuellaDetalle
      v-else
      :usuario="usuarioSeleccionado"
      :huellas="huellas"
      :loading="cargandoHuellas"
      :guardando="guardando"
      @regresar="regresar"
      @crear="abrirRegistro"
      @editar="abrirEdicion"
      @desactivar="confirmarDesactivacion"
    />

    <HuellaFormulario
      v-model="dialogFormulario"
      :usuario="usuarioSeleccionado"
      :huella="huellaEditando"
      :loading="guardando"
      @guardar="guardarFormulario"
    />

    <HuellaRegistroDialog :model-value="dialogEspera" />

    <HuellaExitoDialog
      :model-value="dialogExito"
      :huella="huellaCreada"
      @aceptar="aceptarRegistro"
    />
    <v-dialog v-model="dialogDesactivar" max-width="420" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4"> Desactivar huella </v-card-title>

        <v-card-text>
          ¿Estás seguro de que deseas desactivar esta huella? También se solicitará eliminar su
          plantilla del sensor.
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" :disabled="guardando" @click="dialogDesactivar = false">
            Cancelar
          </v-btn>

          <v-btn color="error" :loading="guardando" :disabled="guardando" @click="desactivar">
            Desactivar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
