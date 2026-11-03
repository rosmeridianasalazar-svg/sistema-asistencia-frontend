const endpoints = {
    autenticacion: {
        login: '/autenticacion/login/',
        refresh: '/autenticacion/refresh/',
    },

    usuarios: {
        listar: '/usuarios/',
        registrar: '/usuarios/',
        detalle: (id) => `/usuarios/${id}/`,
        actualizar: (id) => `/usuarios/${id}/`,
        eliminar: (id) => `/usuarios/${id}/`,
    },

    roles: {
        listar: '/roles/',
        detalle: (id) => `/roles/${id}/`,
    },
}

export default endpoints