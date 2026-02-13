<script setup>
import HelloWorld from './components/HelloWorld.vue'

import ProgressMacros from "./components/ProgressionMacros.vue"
</script>

<template>
  <div id="parent-section" class="w-[95%] md:w-[85%] lg:w-[75%] mx-auto max-w-6xl">
    <div class="text-center p-4">
      <h1>NutriTrack Cloud</h1>
    </div>


    <!-- MAIN CONTENT -->
    <div class="grid xl:grid-cols-2 p-8">
      <div class="grid grid-cols-2 xl:mx-8">

        <!-- CALORIES SECTION -->
        <div id="calories-section" class="track-nutrition text-lg text-center font-semibold text-gray-200 tracking-wide uppercase m-3 p-3">
          <h2 class="text-red-400">Calories</h2>
          <div class="grid grid-cols-1 place-items-center mt-4">
            <div class="relative grid place-items-center">
              <!-- <div class="absolute inset-0 rounded-full border-8 border-gray-200"></div> -->
              <ProgressMacros :value="600" :max="1556" :size="160" />
              <p class="z-10 font-bold">120 / 120</p>
            </div>
          </div>
        </div>

        <!-- PROTEINS SECTION -->
        <div id="proteins-section" class="track-nutrition text-lg text-center font-semibold text-gray-200 tracking-wide uppercase m-3 p-3">
          <h2 class="text-orange-400">Proteins</h2>
          <div class="grid grid-cols-1 place-items-center mt-4">
            <div class="w-32 h-32 rounded-full border-8 border-gray-200"></div>
          </div>
        </div>

        <!-- CARBOHYDRATE SECTION -->
        <div id="carbohydrates-section" class="track-nutrition text-lg text-center font-semibold text-gray-200 tracking-wide uppercase m-3 p-3">
          <h2 class="text-green-400">Carbohydrates</h2>
          <div class="grid grid-cols-1 place-items-center mt-4">
            <div class="w-32 h-32 rounded-full border-8 border-gray-200"></div>
          </div>
        </div>

        <!-- LIPIDS SECTIONS -->
        <div id="lipids-section" class="track-nutrition text-lg text-center font-semibold text-gray-200 tracking-wide uppercase m-3 p-3">
          <h2 class="text-blue-400">Lipids</h2>
          <div class="grid grid-cols-1 place-items-center mt-4">
            <div class="w-32 h-32 rounded-full border-8 border-gray-200"></div>
          </div>
        </div>

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
