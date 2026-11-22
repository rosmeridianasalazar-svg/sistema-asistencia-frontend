
import { ref } from 'vue'
import {
    obtenerUsuariosConHuellas,
    obtenerHuellasUsuario,
    registrarHuella,
    editarHuella,
    desactivarHuella,
} from '../services/huellaService'

export function useHuellas() {
    const usuarios = ref([])
    const huellas = ref([])

    const cargandoUsuarios = ref(false)
    const cargandoHuellas = ref(false)
    const guardando = ref(false)
    const error = ref('')
    const mensaje = ref('')

    const obtenerError = (err) => {
        const datos = err.response?.data

        if (!err.response && err.code === 'ECONNABORTED') {
            return 'Se agotó el tiempo de espera. El dispositivo no respondió.'
        }

        if (!err.response) {
            return 'No se pudo establecer comunicación con el servidor.'
        }

        if (datos?.mensaje) return datos.mensaje
        if (datos?.detail) return datos.detail

        if (datos && typeof datos === 'object') {
            const campo = Object.values(datos).flat()[0]
            if (typeof campo === 'string') return campo
        }

        return 'No se pudo completar el registro de la huella.'
    }

    const extraerLista = (respuesta) => {
        if (Array.isArray(respuesta)) return respuesta
        return respuesta?.datos || respuesta?.resultados || []
    }

    const cargarUsuarios = async () => {
        cargandoUsuarios.value = true
        error.value = ''

        try {
            usuarios.value = extraerLista(
                await obtenerUsuariosConHuellas(),
            )
        } catch (err) {
            error.value = obtenerError(err)
        } finally {
            cargandoUsuarios.value = false
        }
    }

    const cargarHuellas = async (idUsuario) => {
        if (!idUsuario) {
            huellas.value = []
            return
        }

        cargandoHuellas.value = true
        error.value = ''

        try {
            huellas.value = extraerLista(
                await obtenerHuellasUsuario(idUsuario),
            )
        } catch (err) {
            error.value = obtenerError(err)
            throw err
        } finally {
            cargandoHuellas.value = false
        }
    }

    const crearHuella = async (datos) => {
        guardando.value = true
        error.value = ''

        try {
            const respuesta = await registrarHuella(datos)

            await Promise.all([
                cargarHuellas(datos.usuarios_id_usuario),
                cargarUsuarios(),
            ])

            mensaje.value = 'La huella se registró correctamente.'
            return respuesta
        } catch (err) {
            error.value = obtenerError(err)
            throw err
        } finally {
            guardando.value = false
        }
    }

    const actualizarHuella = async (idHuella, datos, idUsuario) => {
        guardando.value = true
        error.value = ''

        try {
            const respuesta = await editarHuella(idHuella, datos)

            await Promise.all([
                cargarHuellas(idUsuario),
                cargarUsuarios(),
            ])

            mensaje.value = 'Los cambios se guardaron correctamente.'
            return respuesta
        } catch (err) {
            error.value = obtenerError(err)
            throw err
        } finally {
            guardando.value = false
        }
    }

    const eliminarHuella = async (idHuella, idUsuario) => {
        guardando.value = true
        error.value = ''

        try {
            const respuesta = await desactivarHuella(idHuella)

            await Promise.all([
                cargarHuellas(idUsuario),
                cargarUsuarios(),
            ])

            mensaje.value = 'La huella se desactivó correctamente.'
            return respuesta
        } catch (err) {
            error.value = obtenerError(err)
            throw err
        } finally {
            guardando.value = false
        }
    }

    const limpiarMensajes = () => {
        error.value = ''
        mensaje.value = ''
    }

    return {
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
    }
}
