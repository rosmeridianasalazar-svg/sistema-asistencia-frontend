
import { ref } from 'vue'
import usuarioService from '../services/usuarioService'

function normalizarLista(data) {
    if (Array.isArray(data)) return data

    return Array.isArray(data?.results) ? data.results : []
}

export function useUsuarios() {
    const usuarios = ref([])
    const roles = ref([])

    const cargando = ref(false)
    const guardando = ref(false)
    const eliminando = ref(false)

    const error = ref('')
    const mensaje = ref('')

    async function listarUsuarios() {
        cargando.value = true
        error.value = ''

        try {
            const respuesta = await usuarioService.listar()

            usuarios.value = normalizarLista(respuesta)

            return true
        } catch {
            error.value = 'No se pudieron cargar los usuarios.'
            return false
        } finally {
            cargando.value = false
        }
    }

    async function listarRoles() {
        try {
            const respuesta = await usuarioService.listarRoles()

            roles.value = normalizarLista(respuesta)

            return true
        } catch {
            error.value = 'No se pudieron cargar los roles.'
            return false
        }
    }

    async function cargarDatos() {
        error.value = ''

        const [usuariosCargados, rolesCargados] = await Promise.all([
            listarUsuarios(),
            listarRoles(),
        ])

        return usuariosCargados && rolesCargados
    }

    async function registrarUsuario(datos) {
        guardando.value = true
        error.value = ''
        mensaje.value = ''

        try {
            const respuesta = await usuarioService.registrar(datos)

            const listaActualizada = await listarUsuarios()

            mensaje.value = listaActualizada
                ? 'Usuario registrado correctamente.'
                : 'Usuario registrado, pero no se pudo actualizar la lista.'

            return {
                respuesta,
                listaActualizada,
            }
        } catch (err) {
            throw err
        } finally {
            guardando.value = false
        }
    }

    async function actualizarUsuario(id, datos) {
        guardando.value = true
        error.value = ''
        mensaje.value = ''

        try {
            const respuesta = await usuarioService.actualizar(id, datos)

            const listaActualizada = await listarUsuarios()

            mensaje.value = listaActualizada
                ? 'Usuario actualizado correctamente.'
                : 'Usuario actualizado, pero no se pudo actualizar la lista.'

            return {
                respuesta,
                listaActualizada,
            }
        } catch (err) {
            throw err
        } finally {
            guardando.value = false
        }
    }

    async function eliminarUsuario(id) {
        eliminando.value = true
        error.value = ''
        mensaje.value = ''

        try {
            const respuesta = await usuarioService.eliminar(id)

            const listaActualizada = await listarUsuarios()

            mensaje.value = listaActualizada
                ? 'Usuario eliminado correctamente.'
                : 'Usuario eliminado, pero no se pudo actualizar la lista.'

            return {
                respuesta,
                listaActualizada,
            }
        } catch (err) {
            throw err
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
        roles,
        cargando,
        guardando,
        eliminando,
        error,
        mensaje,
        listarUsuarios,
        listarRoles,
        cargarDatos,
        registrarUsuario,
        actualizarUsuario,
        eliminarUsuario,
        limpiarMensajes,
    }
}
