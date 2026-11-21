import api from '@/services/api'
import endpoints from '@/services/endpoints'

export default {
  listarTurnos() {
    return api.get(endpoints.horarios.turnos)
  },
  crearTurno(datos) {
    return api.post(endpoints.horarios.turnos, datos)
  },
  actualizarTurno(id, datos) {
    return api.put(endpoints.horarios.turnoDetalle(id), datos)
  },
  eliminarTurno(id) {
    return api.delete(endpoints.horarios.turnoDetalle(id))
  },
  listarAsignaciones() {
    return api.get(endpoints.horarios.asignaciones)
  },
  crearAsignacion(datos) {
    return api.post(endpoints.horarios.asignaciones, datos)
  },
  eliminarAsignacion(id) {
    return api.delete(endpoints.horarios.asignacionEliminar(id))
  },
}