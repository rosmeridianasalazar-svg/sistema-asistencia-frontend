<script setup>
import { ref } from 'vue'
import horarioService from '../services/horarioService'

defineProps({
  turnos: { type: Array, default: () => [] },
})

const emit = defineEmits(['actualizado', 'notificar'])

const nombre = ref('')
const horaEntrada = ref('14:30')
const horaSalida = ref('18:30')
const tolerancia = ref(10)
const guardando = ref(false)
const error = ref('')

async function crearTurno() {
  error.value = ''
  if (!nombre.value.trim() || !horaEntrada.value || !horaSalida.value) {
    error.value = 'Completa el nombre, hora de entrada y hora de salida.'
    return
  }

  guardando.value = true
  try {
    await horarioService.crearTurno({
      nombre: nombre.value.trim(),
      hora_entrada: horaEntrada.value,
      hora_salida: horaSalida.value,
      tolerancia_min: Number(tolerancia.value) || 0,
      estado_horario: true,
    })
    nombre.value = ''
    emit('notificar', { texto: 'Turno creado correctamente.', color: 'success' })
    emit('actualizado')
  } catch (err) {
    error.value = err.response?.data?.nombre?.[0] || err.response?.data?.detail || 'Error al crear el turno.'
  } finally {
    guardando.value = false
  }
}

async function eliminarTurno(id) {
  try {
    await horarioService.eliminarTurno(id)
    emit('notificar', { texto: 'Turno eliminado correctamente.', color: 'success' })
    emit('actualizado')
  } catch (err) {
    emit('notificar', {
      texto: err.response?.data?.detail || 'No se pudo eliminar el turno.',
      color: 'error',
    })
  }
}
</script>

<template>
  <v-row>
    <!-- Formulario nuevo turno -->
    <v-col cols="12" md="4">
      <v-card rounded="lg" elevation="0" border class="pa-4 bg-white">
        <div class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-3">
          Nuevo bloque horario
        </div>

        <v-text-field
          v-model="nombre"
          label="Nombre del turno"
          placeholder="Ej. Tarde Regular 2:30 - 6:30"
          variant="outlined"
          density="compact"
          color="orange-darken-2"
          class="mb-3"
        />

        <v-row density="compact" class="mb-2">
          <v-col cols="6">
            <v-text-field
              v-model="horaEntrada"
              label="Entrada"
              type="time"
              variant="outlined"
              density="compact"
              color="orange-darken-2"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="horaSalida"
              label="Salida"
              type="time"
              variant="outlined"
              density="compact"
              color="orange-darken-2"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model="tolerancia"
          label="Tolerancia (minutos)"
          type="number"
          variant="outlined"
          density="compact"
          color="orange-darken-2"
          class="mb-3"
        />

        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-3 text-caption">
          {{ error }}
        </v-alert>

        <v-btn
          color="#F2690D"
          block
          variant="flat"
          class="text-white font-weight-bold text-none"
          :loading="guardando"
          @click="crearTurno"
        >
          Agregar turno
        </v-btn>
      </v-card>
    </v-col>

    <!-- Lista de turnos creados -->
    <v-col cols="12" md="8">
      <v-card rounded="lg" elevation="0" border class="bg-white overflow-hidden">
        <v-table density="comfortable">
          <thead>
            <tr class="bg-grey-lighten-4">
              <th class="text-caption font-weight-bold">NOMBRE DEL TURNO</th>
              <th class="text-caption font-weight-bold">ENTRADA</th>
              <th class="text-caption font-weight-bold">SALIDA</th>
              <th class="text-caption font-weight-bold">TOLERANCIA</th>
              <th class="text-caption font-weight-bold text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="turnos.length === 0">
              <td colspan="5" class="text-center py-6 text-caption text-grey">
                Aún no hay turnos registrados. Crea el primero a la izquierda.
              </td>
            </tr>
            <tr v-for="t in turnos" :key="t.id_horario">
              <td class="text-body-2 font-weight-medium">{{ t.nombre }}</td>
              <td class="text-body-2">{{ t.hora_entrada?.slice(0, 5) }}</td>
              <td class="text-body-2">{{ t.hora_salida?.slice(0, 5) }}</td>
              <td class="text-caption">{{ t.tolerancia_min }} min</td>
              <td class="text-right">
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  @click="eliminarTurno(t.id_horario)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>
</template>