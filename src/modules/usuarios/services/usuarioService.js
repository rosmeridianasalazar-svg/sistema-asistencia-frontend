
import api from '@/services/api'
import endpoints from '@/services/endpoints'

const usuarioService = {
    async listar() {
        const { data } = await api.get(endpoints.usuarios.listar)
        return data
    },

    async listarRoles() {
        const { data } = await api.get(endpoints.roles.listar)
        return data
    },

    async registrar(datos) {
        const { data } = await api.post(
            endpoints.usuarios.registrar,
            datos
        )
        return data
    },

    async actualizar(id, datos) {
        const { data } = await api.patch(
            endpoints.usuarios.actualizar(id),
            datos
        )
        return data
    },

    async eliminar(id) {
        const { data } = await api.delete(
            endpoints.usuarios.eliminar(id)
        )
        return data
    },
}

export default usuarioService
