
import { computed, reactive, ref, watch } from 'vue'

export function useUsuarioForm(props, emit) {
    const formRef = ref(null)
    const mostrarPassword = ref(false)
    const original = ref(null)

    const fechaMinima = '1990-01-01'
    const fechaMaxima = '2015-12-31'

    // Datos del formulario
    const formulario = reactive({
        id_rol: null,
        dni: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono: '',
        correo: '',
        fecha_nacimiento: '',
        password: '',
        estado: true,
    })

    const esEdicion = computed(() => Boolean(props.usuario?.id_usuario))

    // Reglas de validación
    const reglas = {
        requerido: v =>
            Boolean(String(v ?? '').trim()) ||
            'Este campo es obligatorio.',

        dni: v =>
            /^\d{8}$/.test(String(v ?? '')) ||
            'El DNI debe contener exactamente 8 dígitos.',

        telefono: v =>
            /^\d{9}$/.test(String(v ?? '')) ||
            'El teléfono debe contener exactamente 9 dígitos.',

        correo: v => {
            const correo = String(v ?? '').trim().toLowerCase()

            if (!correo.includes('@')) {
                return "El correo debe contener un '@'."
            }

            const [usuario, dominio] = correo.split('@')

            if (!usuario) {
                return "Ingresa un nombre antes del '@'."
            }

            const dominiosPermitidos = ['gmail.com', 'hotmail.com', 'outlook.com']

            if (!dominio.endsWith('.com') || !dominiosPermitidos.includes(dominio)) {
                return 'Usa un correo válido con dominio gmail.com, hotmail.com o outlook.com.'
            }

            return true
        },

        password: v =>
            !v || String(v).length >= 8 ||
            'La contraseña debe tener al menos 8 caracteres.',

        passwordRequerida: v =>
            Boolean(String(v ?? '').trim()) ||
            'La contraseña es obligatoria.',

        fecha: v => {
            if (!v) return 'La fecha de nacimiento es obligatoria.'

            if (v < fechaMinima || v > fechaMaxima) {
                return 'La fecha debe estar entre 1990 y 2015.'
            }

            const fecha = new Date(`${v}T00:00:00`)

            return !Number.isNaN(fecha.getTime()) &&
                fecha.toISOString().slice(0, 10) === v
                ? true
                : 'Ingresa una fecha válida.'
        },
    }

    // Obtener valores normalizados
    function valoresActuales() {
        return {
            id_rol:
                formulario.id_rol !== null && formulario.id_rol !== ''
                    ? Number(formulario.id_rol)
                    : null,
            dni: formulario.dni.trim(),
            nombre: formulario.nombre.trim(),
            apellido_paterno: formulario.apellido_paterno.trim(),
            apellido_materno: formulario.apellido_materno.trim(),
            telefono: formulario.telefono.trim(),
            correo: formulario.correo.trim().toLowerCase(),
            fecha_nacimiento: formulario.fecha_nacimiento,
            estado: formulario.estado,
        }
    }

    // Cargar datos del usuario
    function cargarFormulario() {
        const u = props.usuario

        Object.assign(formulario, {
            id_rol: u?.id_rol?.id_rol ?? u?.id_rol ?? null,
            dni: u?.dni ?? '',
            nombre: u?.nombre ?? '',
            apellido_paterno: u?.apellido_paterno ?? '',
            apellido_materno: u?.apellido_materno ?? '',
            telefono: u?.telefono ?? '',
            correo: u?.correo ?? '',
            fecha_nacimiento: String(u?.fecha_nacimiento ?? '').slice(0, 10),
            password: '',
            estado: u?.estado ?? true,
        })

        original.value = valoresActuales()
        mostrarPassword.value = false
        formRef.value?.resetValidation()
    }

    // Cargar formulario al abrir o cambiar de usuario
    watch(
        () => [props.modelValue, props.usuario?.id_usuario],
        ([abierto]) => {
            if (abierto) cargarFormulario()
        },
    )

    // Comprobar campos obligatorios y válidos
    const formularioCompleto = computed(() => {
        const f = formulario

        return Boolean(
            f.id_rol &&
            reglas.dni(f.dni) === true &&
            f.nombre.trim() &&
            f.apellido_paterno.trim() &&
            reglas.telefono(f.telefono) === true &&
            reglas.correo(f.correo) === true &&
            reglas.fecha(f.fecha_nacimiento) === true &&
            reglas.password(f.password) === true &&
            (esEdicion.value || reglas.passwordRequerida(f.password) === true)
        )
    })

    // Obtener únicamente los campos modificados
    const cambios = computed(() => {
        if (!esEdicion.value || !original.value) return {}

        const actual = valoresActuales()

        return Object.fromEntries(
            Object.entries(actual).filter(
                ([campo, valor]) => valor !== original.value[campo],
            ),
        )
    })

    // Comprobar si existen modificaciones
    const tieneCambios = computed(() =>
        !esEdicion.value ||
        Object.keys(cambios.value).length > 0 ||
        Boolean(formulario.password.trim()),
    )

    // Habilitar o deshabilitar guardado
    const puedeGuardar = computed(() =>
        formularioCompleto.value &&
        tieneCambios.value &&
        !props.loading,
    )

    // Limpiar errores del servidor
    function limpiarErrores() {
        emit('limpiar-errores')
    }

    // Actualizar DNI y teléfono
    function actualizarNumero(campo, valor, longitud) {
        formulario[campo] = String(valor ?? '')
            .replace(/\D/g, '')
            .slice(0, longitud)

        limpiarErrores()
    }

    // Actualizar otros campos
    function actualizarCampo() {
        limpiarErrores()
    }

    // Cerrar formulario
    function cerrar() {
        if (!props.loading) {
            emit('update:modelValue', false)
        }
    }

    // Guardar usuario
    async function guardar() {
        if (!puedeGuardar.value) return

        const resultado = await formRef.value?.validate()

        if (!resultado?.valid) return

        const password = formulario.password.trim()

        // Actualizar usuario
        if (esEdicion.value) {
            const datos = { ...cambios.value }

            if (password) {
                datos.password = password
            }

            if (Object.keys(datos).length) {
                emit('guardar', datos)
            }

            return
        }

        // Registrar usuario
        const datos = valoresActuales()

        delete datos.estado

        emit('guardar', { ...datos, password })
    }

    return {
        formRef,
        formulario,
        reglas,
        esEdicion,
        fechaMinima,
        fechaMaxima,
        mostrarPassword,
        formularioCompleto,
        tieneCambios,
        puedeGuardar,
        actualizarNumero,
        actualizarCampo,
        cerrar,
        guardar,
    }
}
