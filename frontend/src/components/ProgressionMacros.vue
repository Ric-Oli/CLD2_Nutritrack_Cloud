<script setup>
import { computed } from "vue"

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    default: 128, // taille du cercle
  },
  stroke: {
    type: Number,
    default: 10, // épaisseur de la ligne
  },
  color: {
    type: String,
    default: "#ef4444",
  },
  bgColor: {
    type: String,
    default: "#e5e7eb",
  },
})

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

const progress = computed(() =>
    Math.min(props.value / props.max, 1)
)

const offset = computed(() =>
    circumference.value * (1 - progress.value)
)
</script>

<template>
  <div
      class="relative flex items-center justify-center"
      :style="{ width: size + 'px', height: size + 'px' }"
  >
    <svg
        :width="size"
        :height="size"
        class="-rotate-90"
    >
      <!-- Cercle fond -->
      <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          :stroke="bgColor"
          :stroke-width="stroke"
          fill="transparent"
      />

      <!-- Cercle progression -->
      <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          :stroke="color"
          :stroke-width="stroke"
          fill="transparent"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
          stroke-linecap="round"
          class="transition-all duration-500 ease-out"
      />
    </svg>

    <!-- Texte centre -->
    <div class="absolute text-center font-bold text-lg">
      {{ value }} / {{ max }}
    </div>
  </div>
</template>
