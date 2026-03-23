<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const selectedOffset = ref(0);
const windowWidth = ref(window.innerWidth);

function updateWidth() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));

const offsets = computed(() => {
  if (windowWidth.value < 780) return [-1, 0, 1];        // 3 jours
  if (windowWidth.value < 900) return [-2, -1, 0, 1, 2]; // 5 jours
  return [-3, -2, -1, 0, 1, 2, 3];                       // 7 jours
});

const getDateInfo = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return {
    weekday: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
    number: date.getDate(),
    month: date.toLocaleDateString('fr-FR', { month: 'short' }),
    full: date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    isToday: offset === 0,
  };
};

const selectedDateFull = computed(() => getDateInfo(selectedOffset.value).full);
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- Date sélectionnée -->
    <div class="flex items-center justify-between">
      <p class="text-white font-semibold text-base capitalize">{{ selectedDateFull }}</p>
      <button v-if="selectedOffset !== 0"
              @click="selectedOffset = 0"
              class="text-xs px-3 py-1 rounded-full transition"
              style="background-color: #2a2a2a; color: #9ca3af;">
        Aujourd'hui
      </button>
    </div>

    <!-- Navigation -->
    <div class="flex items-center gap-2">

      <!-- Flèche gauche -->
      <button @click="selectedOffset--"
              class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-[#3a3a3a]"
              style="background-color: #2a2a2a; color: #9ca3af;">
        ‹
      </button>

      <!-- Jours -->
      <div class="flex gap-1.5 flex-1">
        <button
            v-for="offset in offsets.map(o => o + selectedOffset - 0)"
            :key="offset"
            @click="selectedOffset = offset"
            class="flex-1 flex flex-col items-center py-2.5 rounded-xl transition relative"
            :style="selectedOffset === offset
            ? 'background: linear-gradient(135deg, #ff6b6b, #ff5252); color: white; box-shadow: 0 4px 15px rgba(255,107,107,0.3);'
            : offset === 0
              ? 'background-color: #2a2a2a; color: white; border: 1px solid #3a3a3a;'
              : 'background-color: #242424; color: #6b7280;'">
          <span class="text-[9px] font-medium uppercase tracking-wide">
            {{ getDateInfo(offset).weekday }}
          </span>
          <span class="text-base font-bold leading-tight mt-0.5">
            {{ getDateInfo(offset).number }}
          </span>
          <span class="text-[9px]">
            {{ getDateInfo(offset).month }}
          </span>

          <!-- Point indicateur aujourd'hui -->
          <span v-if="offset === 0 && selectedOffset !== 0"
                class="absolute bottom-1 w-1 h-1 rounded-full"
                style="background-color: #ff6b6b;">
          </span>
        </button>
      </div>

      <!-- Flèche droite -->
      <button @click="selectedOffset++"
              class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-[#3a3a3a]"
              style="background-color: #2a2a2a; color: #9ca3af;">
        ›
      </button>

    </div>
  </div>
</template>