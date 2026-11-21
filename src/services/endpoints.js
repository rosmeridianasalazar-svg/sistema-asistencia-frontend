const endpoints = {
    autenticacion: {
        login: '/autenticacion/login/',
        refresh: '/autenticacion/refresh/',

        //recuperacion
        solicitarRecuperacion: '/autenticacion/recuperar-password/',
        confirmarRecuperacion: '/autenticacion/restablecer-password/',
        
    },

    usuarios: {
        listar: '/usuarios/',
        registrar: '/usuarios/',
        detalle: (id) => `/usuarios/${id}/`,
        actualizar: (id) => `/usuarios/${id}/`,
        eliminar: (id) => `/usuarios/${id}/`,
        cumpleanos: '/usuarios/cumpleanos/',
    },

    horarios: {
        turnos: '/horarios/turnos/',
        turnoDetalle: (id) => `/horarios/turnos/${id}/`,
        asignaciones: '/horarios/asignaciones/',
        asignacionEliminar: (id) => `/horarios/asignaciones/${id}/`,
    },

    roles: {
        listar: '/roles/',
        detalle: (id) => `/roles/${id}/`,
    },

    notificaciones: {
        listar: '/notificaciones/',
        crear: '/notificaciones/',
        marcarLeida: (id) => `/notificaciones/${id}/leer/`,
        eliminar: (id) => `/notificaciones/${id}/eliminar/`,
        eliminarTodas: '/notificaciones/eliminar-todas/',
        destinatarios: '/notificaciones/destinatarios/',
    },
}

export default endpoints