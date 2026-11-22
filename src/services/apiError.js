
const traducciones = {
    'This field is required.': 'Este campo es obligatorio.',
    'Enter a valid email address.': 'Ingresa un correo electrónico válido.',
    'This field must be unique.': 'Este valor ya está registrado.',
    'Enter a valid date.': 'Ingresa una fecha válida.',
    'This password is too common.': 'La contraseña es demasiado común.',
    'This password is entirely numeric.': 'La contraseña no puede contener solamente números.',
    'This password is too short.': 'La contraseña es demasiado corta.',
    'Ensure this field has no more than 8 characters.':
        'El campo no debe superar los 8 caracteres.',
    'Ensure this field has at least 8 characters.':
        'El campo debe contener al menos 8 caracteres.',
}

const mensajesDuplicados = {
    dni: 'Este DNI ya está registrado.',
    correo: 'Este correo electrónico ya está registrado.',
    telefono: 'Este teléfono ya está registrado.',
}

function traducirMensaje(mensaje, campo) {
    const texto = String(mensaje ?? '')

    const esDuplicado =
        /unique|already exists|ya existe|ya está registrado|duplicado/i.test(texto)

    if (esDuplicado) {
        return mensajesDuplicados[campo] || 'Este valor ya está registrado.'
    }

    return traducciones[texto] || texto
}

function obtenerPrimerMensaje(valor) {
    if (Array.isArray(valor)) {
        return valor.length ? obtenerPrimerMensaje(valor[0]) : ''
    }

    if (typeof valor === 'object' && valor !== null) {
        return valor.message || valor.detail || 'Ocurrió un error de validación.'
    }

    return String(valor ?? '')
}

export function obtenerErrores(error) {
    const respuesta = error?.response
    const data = respuesta?.data

    if (!data) {
        return {
            campos: {},
            general: 'No se pudo conectar con el servidor. Verifica tu conexión.',
        }
    }

    const campos = {}
    let general = ''

    const errores = data.errors || data

    if (data.mensaje) {
        general = data.mensaje
    }

    if (data.errores) {
        general = [
            general,
            ...(
                Array.isArray(data.errores)
                    ? data.errores
                    : [data.errores]
            ),
        ].filter(Boolean).join(' ')
    }

    for (const [campo, valor] of Object.entries(errores)) {
        const mensaje = obtenerPrimerMensaje(valor)

        if (!mensaje) continue

        if (
            campo === 'detail' ||
            campo === 'non_field_errors' ||
            campo === 'mensaje' ||
            campo === 'errores'
        ) {
            general = general || traducirMensaje(mensaje, campo)
            continue
        }

        campos[campo] = traducirMensaje(mensaje, campo)
    }

    const estado = respuesta.status

    if (estado === 401) {
        general = 'Tu sesión no es válida o ha expirado.'
    } else if (estado === 403) {
        general = 'No tienes permisos para realizar esta operación.'
    } else if (estado === 404) {
        general = 'El registro solicitado no existe.'
    } else if (estado === 409) {
        general = general || 'No se puede completar la operación porque existe un conflicto.'
    } else if (estado >= 500) {
        general = 'Ocurrió un error interno del servidor. Inténtalo nuevamente.'
    }

    return {
        campos,
        general,
    }
}
