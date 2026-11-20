<script setup>
defineProps({
  esMiCumple: { type: Boolean, default: false },
  miNombre: { type: String, default: '' },
  cumpleanerosHoy: { type: Array, default: () => [] },
})

defineEmits(['felicitar'])
</script>

<template>
  <v-card
    v-if="esMiCumple"
    rounded="lg"
    elevation="1"
    class="banner-vip text-white pa-5 pa-sm-6 mb-6 position-relative overflow-hidden"
  >
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 position-relative" style="z-index: 1">
      <div class="d-flex align-center ga-4">
        <div class="icono-vip d-flex align-center justify-center rounded-circle">
          <v-icon icon="mdi-cake-variant-outline" color="#F2690D" size="30" />
        </div>

        <div>
          <div class="text-caption font-weight-bold text-uppercase mb-1" style="color: #F2690D; letter-spacing: 1px">
            ¡Hoy es tu día especial!
          </div>
          <h2 class="text-h5 font-weight-bold text-white mb-1">
            ¡Feliz cumpleaños, {{ miNombre }}!
          </h2>
          <p class="text-body-2 text-grey-lighten-2 mb-0">
            Todo el equipo de <strong class="text-white">NEXOS Tiendas S.A.C.</strong> te desea un año lleno de salud, bienestar y éxitos.
          </p>
        </div>
      </div>
    </div>

    <div class="decoracion-circulo"></div>
  </v-card>
  <v-card
    v-else-if="cumpleanerosHoy.length > 0"
    rounded="lg"
    elevation="0"
    border
    class="banner-companero bg-white pa-4 pa-sm-5 mb-6"
  >
    <div class="d-flex flex-wrap align-center justify-space-between ga-3">
      <div class="d-flex align-center ga-3">
        <v-avatar color="#FFF3E0" size="46">
          <v-icon icon="mdi-party-popper" color="#F2690D" size="24" />
        </v-avatar>

        <div>
          <div class="text-caption font-weight-bold text-uppercase" style="color: #F2690D; letter-spacing: 0.6px">
            Celebración del día
          </div>
          <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
            Hoy cumple años
            <span style="color: #F2690D">
              {{ cumpleanerosHoy.map((u) => u.nombre_completo).join(' y ') }}
            </span>
          </div>
          <div class="text-caption text-grey-darken-1">
            Envíale un mensaje breve para felicitarlo en su día.
          </div>
        </div>
      </div>

      <v-btn
        color="#F2690D"
        variant="flat"
        prepend-icon="mdi-send-outline"
        rounded="lg"
        height="40"
        class="text-white font-weight-bold text-none px-4"
        @click="$emit('felicitar')"
      >
        Enviar saludo
      </v-btn>
    </div>
  </v-card>

  <v-card
    v-else
    rounded="lg"
    elevation="0"
    border
    class="bg-white pa-5 mb-6 text-center"
  >
    <div class="d-flex flex-column align-center justify-center">
      <v-avatar color="#F5F5F5" size="46" class="mb-2">
        <v-icon icon="mdi-calendar-today-outline" color="grey-darken-1" size="24" />
      </v-avatar>

      <div class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-1">
        Sin cumpleaños por hoy
      </div>

      <div class="text-body-2 text-grey-darken-1">
        Hoy guardamos las tortas. Puedes revisar los cumpleaños de los siguientes meses.
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.banner-vip {
  background: linear-gradient(175deg, #232222 0%, #F2690D 100%) !important;
  border-left: 4px solid #F2690D !important;
}

.icono-vip {
  width: 56px;
  height: 56px;
  background-color: rgba(242, 105, 13, 0.14);
  border: 1px solid rgba(242, 105, 13, 0.35);
  flex-shrink: 0;
}

.decoracion-circulo {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(242, 105, 13, 0.16) 0%, transparent 70%);
  right: -40px;
  top: -60px;
  pointer-events: none;
}

.banner-companero {
  border-left: 4px solid #F2690D !important;
}
</style>