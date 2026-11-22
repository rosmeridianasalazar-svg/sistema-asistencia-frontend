import api from '@/services/api'
import endpoints from '@/services/endpoints'

const asistenciaService = {
    async listarUsuarios(params = {}) {
        const { data } = await api.get(endpoints.asistencias.usuarios, { params })
        return data
    },

    async listar(params = {}) {
        const { data } = await api.get(endpoints.asistencias.listar, { params })
        return data
    },

    async resumen(params = {}) {
        const { data } = await api.get(endpoints.asistencias.resumen, { params })
        return data
    },

    async registrarJornada(datos) {
        const { data } = await api.post(endpoints.asistencias.crearJornada, datos)
        return data
    },

    async actualizarJornada(usuarioId, fecha, datos) {
        const { data } = await api.patch(
            endpoints.asistencias.jornada(usuarioId, fecha),
            datos,
        )
        return data
    },

    async eliminarJornada(usuarioId, fecha) {
        const { data } = await api.delete(
            endpoints.asistencias.jornada(usuarioId, fecha),
        )
        return data
    },
}

export default asistenciaService