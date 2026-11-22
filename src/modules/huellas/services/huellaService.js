
import api from '@/services/api'
import endpoints from '@/services/endpoints'

export const obtenerUsuariosConHuellas = async () => {
    const { data } = await api.get(endpoints.huellas.usuarios)
    return data
}

export const obtenerHuellasUsuario = async (idUsuario) => {
    const { data } = await api.get(endpoints.huellas.usuario(idUsuario))
    return data
}

export const registrarHuella = async (datos) => {
    const { data } = await api.post(endpoints.huellas.registrar, datos)
    return data
}

export const editarHuella = async (idHuella, datos) => {
    const { data } = await api.patch(
        endpoints.huellas.editar(idHuella),
        datos,
    )
    return data
}

export const desactivarHuella = async (idHuella) => {
    const { data } = await api.delete(
        endpoints.huellas.desactivar(idHuella),
    )
    return data
}
