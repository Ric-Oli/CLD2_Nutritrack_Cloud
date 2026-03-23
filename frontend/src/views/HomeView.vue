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
  <div class="min-h-screen p-6 flex flex-col gap-4" style="background-color: #121212;">

    <!-- LIGNE DU HAUT — Calendrier -->
    <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
      <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Calendrier</h2>
      <Calendar />
    </div>

    <!-- LIGNE DU BAS — Ajout aliment + Macros -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">

      <!-- Colonne gauche — Ajout + Récents -->
      <div class="flex flex-col gap-4">

        <!-- Recherche -->
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
          <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Ajouter un aliment</h2>
          <div class="relative">
            <input v-model="searchQuery" @input="searchFoods" type="text"
                   placeholder="Rechercher un aliment..."
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition w-full text-sm" />

            <!-- Résultats -->
            <div v-if="searchResults.length > 0"
                 style="background-color: #2a2a2a; border: 1px solid #3a3a3a;"
                 class="absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden z-10">
              <div v-for="food in searchResults" :key="food.food_id"
                   class="px-4 py-3 hover:bg-[#3a3a3a] cursor-pointer transition flex items-center justify-between">
                <div>
                  <p class="text-white text-sm font-medium">{{ food.name }}</p>
                  <p class="text-gray-400 text-xs">{{ food.calories }} kcal</p>
                </div>
                <button class="text-[#ff6b6b] text-xs hover:text-[#ff5252] transition ml-4">+ Ajouter</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Récemment ajoutés -->
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6 flex-1">
          <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Récemment ajoutés</h2>

          <div v-if="recentFoods.length > 0" class="flex flex-col gap-2">
            <div v-for="food in recentFoods" :key="food.food_id"
                 style="background-color: #242424; border: 1px solid #2a2a2a;"
                 class="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer hover:bg-[#3a3a3a] transition">
              <div>
                <p class="text-white text-sm font-medium">{{ food.name }}</p>
                <p class="text-gray-500 text-xs">{{ food.calories }} kcal · {{ food.proteins }}g prot</p>
              </div>
              <button class="text-[#ff6b6b] text-xs hover:text-[#ff5252] transition">+ Ajouter</button>
            </div>
          </div>
          <p v-else class="text-gray-600 text-sm text-center py-4">Aucun aliment enregistré</p>
        </div>

      </div>

      <!-- Colonne droite — Macros -->
      <div class="lg:col-span-2 rounded-2xl p-6" style="background-color: #1a1a1a; border: 1px solid #2a2a2a;">
        <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-6">Apports du jour</h2>
        <div class="grid grid-cols-2 gap-4 h-full">
          <ProgressionMacrosCards :title="'calories'" :unity="'kcal'" :value="1000" :max="1556" :color="'oklch(70.4% 0.191 22.216)'" :size="160" />
          <ProgressionMacrosCards :title="'proteins'" :value="1000" :max="1556" :color="'oklch(75% 0.183 55.934)'" :size="160" />
          <ProgressionMacrosCards :title="'carbohydrates'" :value="80" :max="1556" :color="'oklch(79.2% 0.209 151.711)'" :size="160" />
          <ProgressionMacrosCards :title="'lipids'" :value="1000" :max="1556" :color="'oklch(70.7% 0.165 254.624)'" :size="160" />
        </div>
      </div>

    </div>
  </div>
</template>