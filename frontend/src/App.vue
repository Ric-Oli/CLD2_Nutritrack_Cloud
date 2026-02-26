<script setup>
import HelloWorld from './components/HelloWorld.vue'

import ProgressionMacrosCards from "./components/ProgressionMacrosCards.vue"

import Calendar from "./components/Calendar.vue";
</script>

<template>
  <div id="parent-section" class="w-[95%] md:w-[85%] lg:w-[75%] mx-auto max-w-6xl">
    <div class="text-center p-4">
      <h1>NutriTrack Cloud</h1>
    </div>

    <!-- MAIN CONTENT -->
    <div class="grid-cols-1 xl:grid-cols-2 p-8">

      <!-- CALENDAR SECTION -->

        <Calendar />

        <!--
        <div class="text-center w-[14.28%]">
          <p>25 févr.</p>
        </div>
        -->

      <!-- CARDS SECTION -->
      <div class="grid grid-cols-2">

        <!-- CALORIES SECTION -->
        <ProgressionMacrosCards :title="'calories'" :unity="'kcal'" :value="1000" :max="1556" :color="'oklch(70.4% 0.191 22.216)'" :size="160" />

        <!-- PROTEINS SECTION -->
        <ProgressionMacrosCards :title="'proteins'" :value="1000" :max="1556" :color="'oklch(75% 0.183 55.934)'" :size="160" />

        <!-- CARBOHYDRATE SECTION -->
        <ProgressionMacrosCards :title="'carbohydrates'" :value="80" :max="1556" :color="'oklch(79.2% 0.209 151.711)'" :size="160" />

        <!-- LIPIDS SECTIONS -->
        <ProgressionMacrosCards :title="'lipids'" :value="1000" :max="1556" :color="'oklch(70.7% 0.165 254.624)'" :size="160" />

      </div>

      <!-- ADD FOOD SECTION -->
      <div class="uppercase font-bold p-3">
        <h2>Add food</h2>
      </div>
    </div>

  </div>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
</template>

<style scoped>
#parent-section {
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  background-color: #1a1a1a;
}

.track-nutrition{
  border-radius: 16px;
  min-height: 260px;
  border: 1px solid rgba(72,72,72,0.89);
  background-color: rgba(72,72,72,0.89);
}

/*
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
*/
</style>
