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
}

export default authService