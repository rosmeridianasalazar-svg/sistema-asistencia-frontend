import api from '@/services/api'
import endpoints from '@/services/endpoints'

const notificacionService = {
  listar() {
    return api.get(endpoints.notificaciones.listar)
  },

  crear(datos) {
    return api.post(endpoints.notificaciones.crear, datos)
  },

  marcarLeida(idNotificacion) {
    return api.patch(endpoints.notificaciones.marcarLeida(idNotificacion))
  },

  eliminar(idNotificacion) {
    return api.delete(endpoints.notificaciones.eliminar(idNotificacion))
  },

  obtenerDestinatarios() {
    return api.get(endpoints.notificaciones.destinatarios)
  },

  eliminarTodas(bandeja) {
    return api.delete(endpoints.notificaciones.eliminarTodas, {
      params: { bandeja },
    })
  },
}

export default notificacionService