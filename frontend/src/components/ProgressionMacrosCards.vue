<script setup>
import { computed } from "vue"
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unity: {
    type: String,
    required: true,
    default: "gram"
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
  <div class="track-nutrition text-lg text-center font-semibold tracking-wide m-3 p-3">
    <h2 class="uppercase" :style="{ color: color}">{{ title }}</h2>
    <div class="grid grid-cols-1 place-items-center mt-4">
      <div class="relative grid place-items-center">
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
                :stroke="color"
                :stroke-width="stroke"
                stroke-opacity="0.5"
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
          <div class="absolute text-center font-bold text-lg w-28">
            {{ value }} / {{ max }} {{ unity }}
          </div>
        </div>
        <p class="z-10 font-bold">120 / 120</p>
      </div>
    </div>
  </div>
</template>
