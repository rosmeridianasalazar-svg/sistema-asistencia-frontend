<script setup>
import { useUsuarioForm } from '../composables/useUsuarioForm'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  usuario: { type: Object, default: null },
  roles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  serverErrors: {
    type: Object,
    default: () => ({ campos: {}, general: '' }),
  },
})

const emit = defineEmits(['update:modelValue', 'guardar', 'limpiar-errores'])

const {
  formRef,
  formulario,
  reglas,
  esEdicion,
  fechaMinima,
  fechaMaxima,
  mostrarPassword,
  puedeGuardar,
  actualizarNumero,
  actualizarCampo,
  cerrar,
  guardar,
} = useUsuarioForm(props, emit)
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    width="calc(100% - 24px)"
    scrollable
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <!-- Encabezado -->
      <v-card-title class="d-flex align-center justify-space-between pa-4 pa-sm-5">
        <div>
          <div class="text-h6 font-weight-bold">
            {{ esEdicion ? 'Editar usuario' : 'Registrar usuario' }}
          </div>

          <div class="text-caption text-medium-emphasis mt-1">
            {{
              esEdicion
                ? 'Actualiza los datos del usuario.'
                : 'Completa los datos para registrar un nuevo usuario.'
            }}
          </div>
        </div>

        <v-btn icon="mdi-close" variant="text" :disabled="loading" @click="cerrar" />
      </v-card-title>

      <v-divider />

      <v-form ref="formRef" @submit.prevent="guardar">
        <v-card-text class="pa-4 pa-sm-5">
          <!-- Error general -->
          <v-alert
            v-if="serverErrors.general"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            {{ serverErrors.general }}
          </v-alert>

          <!-- Información personal -->
          <div class="text-subtitle-1 font-weight-bold mb-3">Información personal</div>

          <v-row>
            <!-- Rol -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="formulario.id_rol"
                label="Rol"
                :items="roles"
                item-title="nombre"
                item-value="id_rol"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido]"
                :error-messages="serverErrors.campos?.id_rol"
                @update:model-value="actualizarCampo"
              />
            </v-col>

            <!-- DNI -->
            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="formulario.dni"
                label="DNI"
                variant="outlined"
                density="comfortable"
                maxlength="8"
                counter="8"
                :rules="[reglas.requerido, reglas.dni]"
                :error-messages="serverErrors.campos?.dni"
                @update:model-value="actualizarNumero('dni', $event, 8)"
              />
            </v-col>

            <!-- Nombres -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.nombre"
                label="Nombres"
                variant="outlined"
                density="comfortable"
                maxlength="50"
                :rules="[reglas.requerido]"
                :error-messages="serverErrors.campos?.nombre"
                @update:model-value="actualizarCampo"
              />
            </v-col>

            <!-- Apellido paterno -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.apellido_paterno"
                label="Apellido paterno"
                variant="outlined"
                density="comfortable"
                maxlength="50"
                :rules="[reglas.requerido]"
                :error-messages="serverErrors.campos?.apellido_paterno"
                @update:model-value="actualizarCampo"
              />
            </v-col>

            <!-- Apellido materno -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formulario.apellido_materno"
                label="Apellido materno"
                variant="outlined"
                density="comfortable"
                maxlength="50"
                :error-messages="serverErrors.campos?.apellido_materno"
                @update:model-value="actualizarCampo"
              />
            </v-col>

            <!-- Teléfono -->
            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="formulario.telefono"
                label="Teléfono"
                variant="outlined"
                density="comfortable"
                maxlength="9"
                counter="9"
                :rules="[reglas.requerido, reglas.telefono]"
                :error-messages="serverErrors.campos?.telefono"
                @update:model-value="actualizarNumero('telefono', $event, 9)"
              />
            </v-col>

            <!-- Fecha de nacimiento -->
            <v-col cols="12">
              <v-text-field
                v-model="formulario.fecha_nacimiento"
                label="Fecha de nacimiento"
                type="date"
                variant="outlined"
                density="comfortable"
                :min="fechaMinima"
                :max="fechaMaxima"
                :rules="[reglas.fecha]"
                :error-messages="serverErrors.campos?.fecha_nacimiento"
                @update:model-value="actualizarCampo"
              />
            </v-col>
          </v-row>

          <v-divider class="my-3" />

          <!-- Información de acceso -->
          <div class="text-subtitle-1 font-weight-bold mb-3">Información de acceso</div>

          <v-row>
            <!-- Correo -->
            <v-col cols="12">
              <v-text-field
                v-model="formulario.correo"
                label="Correo electrónico"
                type="email"
                variant="outlined"
                density="comfortable"
                maxlength="100"
                :rules="[reglas.requerido, reglas.correo]"
                :error-messages="serverErrors.campos?.correo"
                @update:model-value="actualizarCampo"
              />
            </v-col>

            <!-- Contraseña -->
            <v-col cols="12">
              <v-text-field
                v-model="formulario.password"
                label="Contraseña"
                :type="mostrarPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="esEdicion ? [reglas.password] : [reglas.passwordRequerida, reglas.password]"
                :error-messages="serverErrors.campos?.password"
                :hint="
                  esEdicion
                    ? 'Déjala vacía para conservar la contraseña actual.'
                    : 'Debe contener al menos 8 caracteres.'
                "
                persistent-hint
                @click:append-inner="mostrarPassword = !mostrarPassword"
                @update:model-value="actualizarCampo"
              />
            </v-col>

            <!-- Estado -->
            <v-col v-if="esEdicion" cols="12">
              <v-switch
                v-model="formulario.estado"
                label="Usuario activo"
                color="success"
                inset
                hide-details
                @update:model-value="actualizarCampo"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <!-- Acciones -->
        <v-card-actions class="pa-4 flex-wrap justify-end">
          <v-btn variant="text" color="grey-darken-1" :disabled="loading" @click="cerrar">
            Cancelar
          </v-btn>

          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            :loading="loading"
            :disabled="!puedeGuardar"
          >
            <v-icon start icon="mdi-content-save" />
            {{ esEdicion ? 'Guardar cambios' : 'Registrar usuario' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
