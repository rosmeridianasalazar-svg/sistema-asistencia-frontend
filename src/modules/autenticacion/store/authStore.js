import { defineStore } from 'pinia'
import authService from '@/modules/autenticacion/services/authService'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        access: sessionStorage.getItem('access') || null,
        refresh: sessionStorage.getItem('refresh') || null,
        usuario: JSON.parse(sessionStorage.getItem('usuario') || 'null'),
    }),

    getters: {
        estaAutenticado: (state) => !!state.access,
    },

    actions: {
        async iniciarSesion(correo, password) {
            try {
                const respuesta = await authService.iniciarSesion({
                    correo,
                    password,
                })

                const datos = respuesta.data

                this.access = datos.access
                this.refresh = datos.refresh
                this.usuario = datos.usuario

                sessionStorage.setItem('access', datos.access)
                sessionStorage.setItem('refresh', datos.refresh)
                sessionStorage.setItem(
                    'usuario',
                    JSON.stringify(datos.usuario),
                )

                return {
                    success: true,
                    usuario: datos.usuario,
                }
            } catch (error) {
                this.cerrarSesion()

                const mensaje =
                    error.response?.data?.detail ||
                    'No se pudo iniciar sesión. Verifica tus credenciales.'

                return {
                    success: false,
                    mensaje,
                }
            }
        },

        cerrarSesion() {
            this.access = null
            this.refresh = null
            this.usuario = null

            sessionStorage.removeItem('access')
            sessionStorage.removeItem('refresh')
            sessionStorage.removeItem('usuario')
        },

        //recuperacion
        async solicitarRecuperacion(correo) {
            try {
                const respuesta = await authService.solicitarRecuperacion(correo)
                return {
                    success: true,
                    mensaje: respuesta.data?.detail || 'Te enviamos un enlace a tu correo.',
                }
            } catch (error) {
                return {
                    success: false,
                    mensaje: error.response?.data?.detail || 'No se pudo enviar el correo.',
                }
            }
        },

        async confirmarRecuperacion(datos) {
            try {
                const respuesta = await authService.confirmarRecuperacion(datos)
                return {
                    success: true,
                    mensaje: respuesta.data?.detail || 'Contraseña actualizada correctamente.',
                }
            } catch (error) {
                return {
                    success: false,
                    mensaje: error.response?.data?.detail || 'El enlace no es válido o ya expiró.',
                }
            }
        },

    },
})