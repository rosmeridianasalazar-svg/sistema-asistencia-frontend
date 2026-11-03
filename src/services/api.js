import axios from 'axios'
import endpoints from './endpoints'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

//controla que solo exista una renovación de token a la vez.
let refreshPromise = null

//obtiene el token de acceso para las peticiones protegidas.
api.interceptors.request.use((config) => {
    const access = sessionStorage.getItem('access')

    const esAutenticacion =
        config.url === endpoints.autenticacion.login ||
        config.url === endpoints.autenticacion.refresh

    if (access && !esAutenticacion) {
        config.headers.Authorization = `Bearer ${access}`
    }

    return config
})

//gestiona los errores de autenticación.
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const config = error.config

        if (!config || error.response?.status !== 401) {
            return Promise.reject(error)
        }

        //no renovar tokens para login ni para la propia renovación
        if (
            config.url === endpoints.autenticacion.login ||
            config.url === endpoints.autenticacion.refresh
        ) {
            return Promise.reject(error)
        }

        //si la petición ya fue reintentada y sigue fallando
        //la sesión ya no es válida.
        if (config._retry) {
            cerrarSesionLocal()
            return Promise.reject(error)
        }

        config._retry = true

        try {
            if (!refreshPromise) {
                const refresh = sessionStorage.getItem('refresh')

                if (!refresh) {
                    throw new Error('No existe un token de renovación.')
                }

                refreshPromise = api
                    .post(endpoints.autenticacion.refresh, { refresh })
                    .then((response) => {
                        const nuevoAccess = response.data.access

                        if (!nuevoAccess) {
                            throw new Error('No se recibió un nuevo access token.')
                        }

                        sessionStorage.setItem('access', nuevoAccess)

                        //por si en el futuro habilitamos rotación de refresh.
                        if (response.data.refresh) {
                            sessionStorage.setItem(
                                'refresh',
                                response.data.refresh,
                            )
                        }

                        return nuevoAccess
                    })
                    .finally(() => {
                        refreshPromise = null
                    })
            }

            const nuevoAccess = await refreshPromise

            config.headers.Authorization = `Bearer ${nuevoAccess}`

            return api(config)
        } catch (refreshError) {
            cerrarSesionLocal()
            return Promise.reject(refreshError)
        }
    },
)

function cerrarSesionLocal() {
    sessionStorage.removeItem('access')
    sessionStorage.removeItem('refresh')
    sessionStorage.removeItem('usuario')

    if (window.location.pathname !== '/login') {
        window.location.assign('/login')
    }
}

export default api