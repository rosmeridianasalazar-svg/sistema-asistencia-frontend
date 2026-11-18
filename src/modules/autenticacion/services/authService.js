import api from '@/services/api'
import endpoints from '@/services/endpoints'

const authService = {
    iniciarSesion(credenciales) {
        return api.post(
            endpoints.autenticacion.login,
            credenciales,
        )
    },

    renovarToken(refresh) {
        return api.post(
            endpoints.autenticacion.refresh,
            { refresh },
        )
    },

    //recuperacion
    renovarToken(refresh) {
        return api.post(
            endpoints.autenticacion.refresh,
            { refresh },
        )
    },

    solicitarRecuperacion(correo) {
        return api.post(
            endpoints.autenticacion.solicitarRecuperacion,
            { correo },
        )
    },

    confirmarRecuperacion(datos) {
        return api.post(
            endpoints.autenticacion.confirmarRecuperacion,
            datos,
        )
    },
}

export default authService