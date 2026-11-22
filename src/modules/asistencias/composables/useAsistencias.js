import { ref, reactive } from 'vue'
import asistenciaService from '../services/asistenciaService'

function obtenerMensajeError(error) {
    const data = error.response?.data

    if (!data) return 'Ocurrió un error al procesar la solicitud.'

    if (typeof data.mensaje === 'string') return data.mensaje
    if (Array.isArray(data.mensaje)) return data.mensaje.join(' ')
    if (typeof data.detail === 'string') return data.detail

    if (data.errores) {
        return Array.isArray(data.errores)
            ? data.errores.join(' ')
            : JSON.stringify(data.errores)
    }

    return Object.values(data)
        .flat()
        .filter(value => typeof value === 'string')
        .join(' ') || 'No se pudo completar la operación.'
}

export function useAsistencias() {
    const usuarios = ref([])
    const jornadas = ref([])
    const resumen = ref(null)

    const cargando = ref(false)
    const guardando = ref(false)
    const eliminando = ref(false)

    const error = ref('')
    const mensaje = ref('')

    const paginacion = reactive({
        count: 0,
        next: null,
        previous: null,
        page: 1,
        pageSize: 20,
    })

    const filtros = reactive({
        fecha: '',
        fecha_inicio: '',
        fecha_fin: '',
        tipo_evento: '',
        estado: '',
        busqueda: '',
    })

    function obtenerFiltros() {
        return Object.fromEntries(
            Object.entries(filtros).filter(([, valor]) => valor !== ''),
        )
    }

    async function listarUsuarios() {
        cargando.value = true
        error.value = ''

        try {
            const data = await asistenciaService.listarUsuarios()
            usuarios.value = Array.isArray(data) ? data : data.results || []
        } catch (e) {
            error.value = obtenerMensajeError(e)
        } finally {
            cargando.value = false
        }
    }

    async function listarJornadas(usuarioId, pagina = 1) {
        cargando.value = true
        error.value = ''

        try {
            const data = await asistenciaService.listar({
                usuario_id: usuarioId,
                ...obtenerFiltros(),
                page: pagina,
                page_size: paginacion.pageSize,
            })

            jornadas.value = data.results || []
            paginacion.count = data.count || 0
            paginacion.next = data.next
            paginacion.previous = data.previous
            paginacion.page = pagina
        } catch (e) {
            error.value = obtenerMensajeError(e)
        } finally {
            cargando.value = false
        }
    }

    async function obtenerResumen(usuarioId) {
        error.value = ''

        try {
            resumen.value = await asistenciaService.resumen({
                usuario_id: usuarioId,
            })
        } catch (e) {
            error.value = obtenerMensajeError(e)
        }
    }

    async function cargarHistorial(usuarioId, pagina = 1) {
        if (!usuarioId) return

        await Promise.all([
            listarJornadas(usuarioId, pagina),
            obtenerResumen(usuarioId),
        ])
    }

    async function buscar(usuarioId) {
        paginacion.page = 1
        await cargarHistorial(usuarioId, 1)
    }

    function limpiarFiltros(usuarioId) {
        Object.assign(filtros, {
            fecha: '',
            fecha_inicio: '',
            fecha_fin: '',
            tipo_evento: '',
            estado: '',
            busqueda: '',
        })

        return buscar(usuarioId)
    }

    async function cambiarPagina(usuarioId, pagina) {
        await listarJornadas(usuarioId, pagina)
    }

    async function registrarJornada(datos, usuarioId) {
        guardando.value = true
        error.value = ''
        mensaje.value = ''

        try {
            await asistenciaService.registrarJornada(datos)
            mensaje.value = 'Jornada registrada correctamente.'
            await cargarHistorial(usuarioId, paginacion.page)
            return true
        } catch (e) {
            error.value = obtenerMensajeError(e)
            return false
        } finally {
            guardando.value = false
        }
    }

    async function actualizarJornada(usuarioId, fecha, datos) {
        guardando.value = true
        error.value = ''
        mensaje.value = ''

        try {
            await asistenciaService.actualizarJornada(usuarioId, fecha, datos)
            mensaje.value = 'Jornada actualizada correctamente.'
            await cargarHistorial(usuarioId, paginacion.page)
            return true
        } catch (e) {
            error.value = obtenerMensajeError(e)
            return false
        } finally {
            guardando.value = false
        }
    }

    async function eliminarJornada(usuarioId, fecha) {
        eliminando.value = true
        error.value = ''
        mensaje.value = ''

        try {
            await asistenciaService.eliminarJornada(usuarioId, fecha)
            mensaje.value = 'Jornada eliminada correctamente.'

            const paginaActual = jornadas.value.length === 1 && paginacion.page > 1
                ? paginacion.page - 1
                : paginacion.page

            await cargarHistorial(usuarioId, paginaActual)
            return true
        } catch (e) {
            error.value = obtenerMensajeError(e)
            return false
        } finally {
            eliminando.value = false
        }
    }

    function limpiarMensajes() {
        error.value = ''
        mensaje.value = ''
    }

    return {
        usuarios,
        jornadas,
        resumen,
        cargando,
        guardando,
        eliminando,
        error,
        mensaje,
        filtros,
        paginacion,
        listarUsuarios,
        listarJornadas,
        obtenerResumen,
        cargarHistorial,
        buscar,
        limpiarFiltros,
        cambiarPagina,
        registrarJornada,
        actualizarJornada,
        eliminarJornada,
        limpiarMensajes,
    }
}