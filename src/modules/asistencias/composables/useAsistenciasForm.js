import { computed, reactive, ref } from 'vue'

function obtenerFechaHora(valor, tipo) {
    if (!valor) return ''

    const fecha = new Date(valor)

    if (Number.isNaN(fecha.getTime())) return ''

    const dosDigitos = numero => String(numero).padStart(2, '0')

    if (tipo === 'fecha') {
        return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`
    }

    return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
}

function convertirFechaHora(fecha, hora) {
    return new Date(`${fecha}T${hora}:00`).toISOString()
}

export function useAsistenciaForm() {
    const formulario = reactive({
        usuario_id: null,
        fecha: '',
        hora_entrada: '',
        estado_entrada: 'REGISTRADA',
        hora_salida: '',
        estado_salida: 'REGISTRADA',
    })

    const original = ref('')
    const esEdicion = ref(false)

    const tieneCambios = computed(() => {
        if (!esEdicion.value) return true

        return JSON.stringify(formulario) !== original.value
    })

    function cargar(jornada = null, usuarioId = null) {
        esEdicion.value = Boolean(jornada)

        if (!jornada) {
            Object.assign(formulario, {
                usuario_id: usuarioId,
                fecha: '',
                hora_entrada: '08:00',
                estado_entrada: 'REGISTRADA',
                hora_salida: '17:00',
                estado_salida: 'REGISTRADA',
            })
        } else {
            const entrada = jornada.entrada
            const salida = jornada.salida

            const referencia = entrada || salida

            Object.assign(formulario, {
                usuario_id: usuarioId,
                fecha: jornada.fecha,
                hora_entrada: entrada
                    ? obtenerFechaHora(entrada.fecha_hora_evento, 'hora')
                    : '08:00',
                estado_entrada: entrada?.estado_asistencia === 'FALTA'
                    ? 'REGISTRADA'
                    : entrada?.estado_asistencia || 'REGISTRADA',
                hora_salida: salida
                    ? obtenerFechaHora(salida.fecha_hora_evento, 'hora')
                    : '17:00',
                estado_salida: salida?.estado_asistencia || 'REGISTRADA',
            })
        }

        original.value = JSON.stringify(formulario)
    }

    function obtenerDatos() {
        return {
            fecha_hora_entrada: convertirFechaHora(
                formulario.fecha,
                formulario.hora_entrada,
            ),
            estado_entrada: formulario.estado_entrada,
            fecha_hora_salida: convertirFechaHora(
                formulario.fecha,
                formulario.hora_salida,
            ),
            estado_salida: formulario.estado_salida,
        }
    }

    function reiniciar() {
        Object.assign(formulario, {
            usuario_id: null,
            fecha: '',
            hora_entrada: '',
            estado_entrada: 'REGISTRADA',
            hora_salida: '',
            estado_salida: 'REGISTRADA',
        })

        original.value = ''
        esEdicion.value = false
    }

    return {
        formulario,
        esEdicion,
        tieneCambios,
        cargar,
        obtenerDatos,
        reiniciar,
    }
}