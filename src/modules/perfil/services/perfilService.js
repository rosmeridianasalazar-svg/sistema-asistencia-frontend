import api from '@/services/api'
import endpoints from '@/services/endpoints'

export default {
  obtenerPerfil() {
    return api.get(endpoints.usuarios.miPerfil)
  },
  actualizarPerfil(datos) {
    return api.put(endpoints.usuarios.miPerfil, datos)
  },
  cambiarPassword(datos) {
    return api.post(endpoints.usuarios.cambiarPassword, datos)
  },
}