import { defineStore } from 'pinia'
import notificacionService from '@/modules/notificaciones/services/notificacionService'
import { supabase } from '@/services/supabase'

export const useNotificacionStore = defineStore('notificaciones', {
  state: () => ({
    lista: [],
    destinatarios: [],
    cargando: false,
    canalRealtime: null,
    ultimaNotificacionEnVivo: null,
  }),

  getters: {
    recibidas: (state) =>
      state.lista.filter((n) => n.estado_notificacion !== 'E'),
    enviadas: (state) =>
      state.lista.filter((n) => n.estado_notificacion === 'E'),
    noLeidasCount: (state) =>
      state.lista.filter((n) => n.estado_notificacion === 'P').length,
  },

  actions: {
    async cargarNotificaciones() {
      this.cargando = true
      try {
        const { data } = await notificacionService.listar()
        this.lista = data
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
      } finally {
        this.cargando = false
      }
    },

    async cargarDestinatarios() {
      try {
        const { data } = await notificacionService.obtenerDestinatarios()
        this.destinatarios = data
      } catch (error) {
        console.error('Error al cargar destinatarios:', error)
      }
    },

    async enviarNotificacion({ destinatario, mensaje }) {
      try {
        const { data } = await notificacionService.crear({ destinatario, mensaje })
        await this.cargarNotificaciones()
        return {
          success: true,
          mensaje: data.detail || 'Notificación enviada correctamente.',
        }
      } catch (error) {
        return {
          success: false,
          mensaje: error.response?.data?.detail || 'No se pudo enviar la notificación.',
        }
      }
    },

    async marcarComoLeida(idNotificacion) {
      try {
        await notificacionService.marcarLeida(idNotificacion)
        const item = this.lista.find((n) => n.id_notificacion === idNotificacion)
        if (item) {
          item.estado_notificacion = 'L'
        }
      } catch (error) {
        console.error('Error al marcar como leída:', error)
      }
    },

    async eliminarNotificacion(idNotificacion) {
      try {
        await notificacionService.eliminar(idNotificacion)
        this.lista = this.lista.filter((n) => n.id_notificacion !== idNotificacion)
        return true
      } catch (error) {
        console.error('Error al eliminar notificación:', error)
        return false
      }
    },

    async eliminarTodasLasNotificaciones(bandeja) {
      try {
        const { data } = await notificacionService.eliminarTodas(bandeja)
        if (bandeja === 'ENVIADOS') {
          this.lista = this.lista.filter((n) => n.estado_notificacion !== 'E')
        } else {
          this.lista = this.lista.filter((n) => n.estado_notificacion === 'E')
        }
        return {
          success: true,
          mensaje: data.detail || 'Bandeja vaciada correctamente.',
        }
      } catch (error) {
        return {
          success: false,
          mensaje: error.response?.data?.detail || 'No se pudieron eliminar las notificaciones.',
        }
      }
    },

    iniciarTiempoReal(idUsuario) {
      if (!idUsuario) return
      if (this.canalRealtime) {
        supabase.removeChannel(this.canalRealtime)
        this.canalRealtime = null
      }

      this.canalRealtime = supabase
        .channel(`notificaciones-live-${idUsuario}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificaciones',
          },
          (payload) => {
            const nueva = payload.new
            if (Number(nueva.usuarios_id_usuario) !== Number(idUsuario)) return
            if (nueva.estado_notificacion === 'E') return // No alertar por copias propias en Enviados

            const yaExiste = this.lista.some(
              (n) => n.id_notificacion === nueva.id_notificacion
            )
            if (!yaExiste) {
              this.lista.unshift(nueva)
              this.ultimaNotificacionEnVivo = { ...nueva }
            }
          }
        )
        .subscribe()
    },

    detenerTiempoReal() {
      if (this.canalRealtime) {
        supabase.removeChannel(this.canalRealtime)
        this.canalRealtime = null
      }
      this.lista = []
    },
  },
})