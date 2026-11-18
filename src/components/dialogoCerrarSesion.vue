<script setup>
const abierto = defineModel({ type: Boolean, default: false })
const emit = defineEmits(['confirmar'])

function confirmar() {
  abierto.value = false
  emit('confirmar')
}
</script>

<template>
  <v-dialog v-model="abierto" max-width="400" persistent>
    <v-card rounded="xl" class="pa-4 text-center">
      <div class="d-flex justify-center mt-2 mb-3">
        <v-avatar color="#FFF3E0" size="64">
          <v-icon icon="mdi-logout-variant" color="#F2690D" size="34" />
        </v-avatar>
      </div>

      <v-card-title class="text-h6 font-weight-bold pb-1"> ¿Cerrar sesión? </v-card-title>

      <v-card-text class="text-body-2 text-grey-darken-1 pb-4">
        Estás a punto de salir del sistema. Tendrás que ingresar tus credenciales nuevamente para
        volver a entrar.
      </v-card-text>

      <v-card-actions class="d-flex ga-3 px-2 pb-2">
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          rounded="lg"
          class="flex-grow-1 text-none font-weight-medium"
          @click="abierto = false"
        >
          Cancelar
        </v-btn>

        <v-btn
          color="#F2690D"
          variant="flat"
          rounded="lg"
          class="flex-grow-1 text-none text-white font-weight-bold"
          @click="confirmar"
        >
          Sí, salir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
