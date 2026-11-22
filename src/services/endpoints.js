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
        miPerfil: '/usuarios/mi-perfil/',
        cambiarPassword: '/usuarios/cambiar-password/',
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

    huellas: {
        usuarios: '/huellas/usuarios/',
        registrar: '/huellas/registrar/',
        usuario: (id) => `/huellas/usuario/${id}/`,
        editar: (id) => `/huellas/${id}/editar/`,
        desactivar: (id) => `/huellas/${id}/desactivar/`,
    },

    asistencias: {
        listar: '/asistencias/',
        usuarios: '/asistencias/usuarios/',
        resumen: '/asistencias/resumen/',
        marcar: '/asistencias/marcar/',
        crearJornada: '/asistencias/jornadas/',
        jornada: (usuarioId, fecha) =>
            `/asistencias/jornadas/${usuarioId}/${fecha}/`,
        detalle: id => `/asistencias/${id}/`,
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