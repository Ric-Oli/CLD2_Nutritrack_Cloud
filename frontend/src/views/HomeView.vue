<script setup>
import ProgressionMacrosCards from "../components/ProgressionMacrosCards.vue"
import Calendar from "../components/Calendar.vue";
import { ref, onMounted } from 'vue';

const recentFoods = ref([]);
const searchQuery = ref('');
const searchResults = ref([]);

async function fetchRecentFoods() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:3000/api/food/recent', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    recentFoods.value = data;
  } catch {
    console.error('Impossible de charger les aliments récents');
  }
}

async function searchFoods() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:3000/api/food/search?q=${searchQuery.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    searchResults.value = await res.json();
  } catch {
    console.error('Erreur de recherche');
  }
}

onMounted(fetchRecentFoods);
</script>

<template>
  <div class="min-h-screen" style="background-color: #121212;">

    <!-- Header -->
    <div style="background-color: #1a1a1a; border-bottom: 1px solid #2a2a2a;" class="px-8 py-5 flex items-center justify-between">
      <h1 class="text-white font-bold text-lg">🥗 NutriTrack Cloud</h1>
      <p class="text-gray-400 text-sm">{{ new Date().toLocaleDateString('fr-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
    </div>

    <div class="p-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Colonne gauche — Calendrier + Recherche + Récents -->
        <div class="flex flex-col gap-6">

          <!-- Calendrier -->
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
            <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Calendrier</h2>
            <Calendar />
          </div>

          <!-- Recherche -->
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
            <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Ajouter un aliment</h2>
            <div class="relative">
              <input v-model="searchQuery" @input="searchFoods" type="text"
                     placeholder="Rechercher un aliment..."
                     class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition w-full" />

              <!-- Résultats de recherche -->
              <div v-if="searchResults.length > 0"
                   style="background-color: #2a2a2a; border: 1px solid #3a3a3a;"
                   class="absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden z-10">
                <div v-for="food in searchResults" :key="food.food_id"
                     class="px-4 py-3 hover:bg-[#3a3a3a] cursor-pointer transition flex items-center justify-between">
                  <div>
                    <p class="text-white text-sm font-medium">{{ food.name }}</p>
                    <p class="text-gray-400 text-xs">{{ food.calories }} kcal · {{ food.proteins }}g prot · {{ food.carbohydrates }}g gluc · {{ food.lipids }}g lip</p>
                  </div>
                  <button class="text-[#ff6b6b] text-xs hover:text-[#ff5252] transition ml-4">
                    + Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Aliments récents -->
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
            <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Récemment ajoutés</h2>

            <div v-if="recentFoods.length > 0" class="flex flex-col gap-2">
              <div v-for="food in recentFoods" :key="food.food_id"
                   style="background-color: #242424; border: 1px solid #2a2a2a;"
                   class="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer hover:bg-[#3a3a3a] transition">
                <div>
                  <p class="text-white text-sm font-medium">{{ food.name }}</p>
                  <p class="text-gray-500 text-xs">{{ food.calories }} kcal</p>
                </div>
                <button class="text-[#ff6b6b] text-xs hover:text-[#ff5252] transition">
                  + Ajouter
                </button>
              </div>
            </div>
            <p v-else class="text-gray-600 text-sm text-center py-4">Aucun aliment enregistré</p>

          </div>
        </div>

        <!-- Colonne droite — Macros -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
            <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-6">Apports du jour</h2>
            <div class="grid grid-cols-2 gap-4">
              <ProgressionMacrosCards :title="'calories'" :unity="'kcal'" :value="1000" :max="1556" :color="'oklch(70.4% 0.191 22.216)'" :size="160" />
              <ProgressionMacrosCards :title="'proteins'" :value="1000" :max="1556" :color="'oklch(75% 0.183 55.934)'" :size="160" />
              <ProgressionMacrosCards :title="'carbohydrates'" :value="80" :max="1556" :color="'oklch(79.2% 0.209 151.711)'" :size="160" />
              <ProgressionMacrosCards :title="'lipids'" :value="1000" :max="1556" :color="'oklch(70.7% 0.165 254.624)'" :size="160" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>