<script setup>
import ProgressionMacrosCards from "../components/ProgressionMacrosCards.vue"
import Calendar from "../components/Calendar.vue";
import { ref, onMounted, watch, computed } from 'vue';
import { API_URL, getImageUrl } from "../api.js";

const recentFoods = ref([]);
const searchQuery = ref('');
const searchResults = ref([]);
const meals = ref([]);
const macros = ref({ calories: 0, proteins: 0, carbohydrates: 0, lipids: 0 });
const goal = ref({ caloriesperday: 2000, macrosproteins: 150, macroscarbohydrates: 250, macroslipids: 70 });

const showAddModal = ref(false);
const selectedFood = ref(null);
const selectedMealId = ref('');
const quantity = ref(100);

const dailyEntries = ref([]);
const editingEntry = ref(null);
const editQuantity = ref(0);

const selectedDate = ref(new Date().toISOString().split('T')[0]);

function getToken() {
  return localStorage.getItem('token');
}

async function fetchMacros() {
  try {
    const res = await fetch(`${API_URL}/api/mealentry?date=${selectedDate.value}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    macros.value = {
      calories: parseFloat(data.calories) || 0,
      proteins: parseFloat(data.proteins) || 0,
      carbohydrates: parseFloat(data.carbohydrates) || 0,
      lipids: parseFloat(data.lipids) || 0,
    };
  } catch {
    console.error('Erreur chargement macros');
  }
}

async function fetchGoal() {
  try {
    const res = await fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.caloriesperday) goal.value = {
      caloriesperday: data.caloriesperday,
      macrosproteins: data.macrosproteins,
      macroscarbohydrates: data.macroscarbohydrates,
      macroslipids: data.macroslipids,
    };
  } catch {
    console.error('Erreur chargement objectifs');
  }
}

async function fetchMeals() {
  try {
    const res = await fetch(`${API_URL}/api/meals`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    meals.value = await res.json();
    if (meals.value.length > 0) selectedMealId.value = meals.value[0].meal_id;
  } catch {
    console.error('Erreur chargement repas');
  }
}

async function fetchRecentFoods() {
  try {
    const res = await fetch(`${API_URL}/api/food/recent`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    recentFoods.value = await res.json();
  } catch {
    console.error('Erreur chargement aliments récents');
  }
}

async function searchFoods() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/food/search?q=${searchQuery.value}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    searchResults.value = await res.json();
  } catch {
    console.error('Erreur recherche');
  }
}

function openAddModal(food) {
  selectedFood.value = food;
  quantity.value = 100;
  selectedMealId.value = meals.value[0]?.meal_id || '';
  showAddModal.value = true;
  searchQuery.value = '';
  searchResults.value = [];
}

async function addFoodEntry() {
  if (!selectedFood.value || !selectedMealId.value || !quantity.value) return;
  try {
    await fetch(`${API_URL}/api/mealentry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        food_id: selectedFood.value.food_id,
        meal_id: selectedMealId.value,
        quantity: quantity.value,
        date: selectedDate.value,
      })
    });
    showAddModal.value = false;
    await Promise.all([fetchMacros(), fetchDailyEntries()]);  // ← ajout
  } catch {
    console.error('Erreur ajout aliment');
  }
}

const previewMacros = computed(() => {
  if (!selectedFood.value) return null;
  const q = quantity.value || 0;
  return {
    calories: ((selectedFood.value.calories * q) / 100).toFixed(1),
    proteins: ((selectedFood.value.proteins * q) / 100).toFixed(1),
    carbohydrates: ((selectedFood.value.carbohydrates * q) / 100).toFixed(1),
    lipids: ((selectedFood.value.lipids * q) / 100).toFixed(1),
  };
});

const entriesByMeal = computed(() => {
  const groups = {};
  dailyEntries.value.forEach(entry => {
    if (!groups[entry.meal_id]) {
      groups[entry.meal_id] = {
        meal_id: entry.meal_id,
        mealtype: entry.mealtype,
        items: []
      };
    }
    groups[entry.meal_id].items.push(entry);
  });
  return Object.values(groups);
});

async function fetchDailyEntries() {
  try {
    const res = await fetch(`${API_URL}/api/mealentry/detail?date=${selectedDate.value}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    console.log('daily entries:', data);
    dailyEntries.value = data;
  } catch {
    console.error('Erreur chargement entrées');
  }
}

async function updateEntryQuantity(entry) {
  try {
    await fetch(`${API_URL}/api/mealentry/${entry.mealentry_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ quantity: editQuantity.value })
    });
    editingEntry.value = null;
    await Promise.all([fetchMacros(), fetchDailyEntries()]);
  } catch {
    console.error('Erreur mise à jour');
  }
}

async function deleteEntry(id) {
  try {
    await fetch(`${API_URL}/api/mealentry/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    await Promise.all([fetchMacros(), fetchDailyEntries()]);
  } catch {
    console.error('Erreur suppression');
  }
}

// Met à jour les macros quand la date change
watch(selectedDate, async () => {
  await Promise.all([fetchMacros(), fetchDailyEntries()]);
});

onMounted(async () => {
  await Promise.all([fetchMacros(), fetchGoal(), fetchMeals(), fetchRecentFoods(), fetchDailyEntries()]);
});
</script>

<template>
  <div class="min-h-screen p-6 flex flex-col gap-2" style="background-color: #121212;">

    <!-- Modale ajout aliment -->
    <div v-if="showAddModal"
         class="fixed inset-0 z-50 flex items-center justify-center"
         style="background-color: rgba(0,0,0,0.7);"
         @click.self="showAddModal = false">

      <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;"
           class="rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">

        <div class="flex items-center justify-between">
          <h2 class="text-white text-xl font-bold">Ajouter à mon journal</h2>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-white transition text-2xl">×</button>
        </div>

        <div style="background-color: #242424; border: 1px solid #2a2a2a;" class="rounded-xl p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0">
            <img v-if="selectedFood?.image"
                 :src="getImageUrl(selectedFood.image)"
                 class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center" style="background-color: #3a3a3a;">🍽️</div>
          </div>
          <div>
            <p class="text-white font-bold">{{ selectedFood?.name }}</p>
            <p class="text-gray-400 text-xs">Pour 100g : {{ selectedFood?.calories }} kcal</p>
          </div>
        </div>

        <!-- Repas -->
        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Repas</label>
          <select v-model="selectedMealId"
                  class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition">
            <option v-for="meal in meals" :key="meal.meal_id" :value="meal.meal_id">
              {{ meal.mealtype }}
            </option>
          </select>
        </div>

        <!-- Quantité -->
        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Quantité (g)</label>
          <input v-model="quantity" type="numeric" min="1" placeholder="100"
                 class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
        </div>

        <!-- Aperçu macros -->
        <div v-if="previewMacros" style="background-color: #242424; border: 1px solid #2a2a2a;" class="rounded-xl p-4 flex flex-col gap-2">
          <p class="text-gray-400 text-xs uppercase tracking-widest">Pour {{ quantity }}g</p>
          <div class="flex gap-3 flex-wrap">
            <span class="text-xs px-2 py-1 rounded-full" style="background-color: #2a2a2a; color: oklch(70.4% 0.191 22.216);">{{ previewMacros.calories }} kcal</span>
            <span class="text-xs px-2 py-1 rounded-full" style="background-color: #2a2a2a; color: oklch(75% 0.183 55.934);">{{ previewMacros.proteins }}g prot</span>
            <span class="text-xs px-2 py-1 rounded-full" style="background-color: #2a2a2a; color: oklch(79.2% 0.209 151.711);">{{ previewMacros.carbohydrates }}g gluc</span>
            <span class="text-xs px-2 py-1 rounded-full" style="background-color: #2a2a2a; color: oklch(70.7% 0.165 254.624);">{{ previewMacros.lipids }}g lip</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="showAddModal = false"
                  class="flex-1 py-3 rounded-xl text-gray-400 hover:text-white transition"
                  style="background-color: #2a2a2a;">
            Annuler
          </button>
          <button @click="addFoodEntry"
                  class="flex-1 bg-[#ff6b6b] hover:bg-[#ff5252] text-white font-bold py-3 rounded-xl transition">
            Ajouter
          </button>
        </div>

      </div>
    </div>

    <!-- Calendrier -->
    <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
      <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Calendrier</h2>
      <Calendar @date-change="selectedDate = $event" />
    </div>

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1">

      <!-- Colonne gauche — Recherche + Récents -->
      <div class="flex flex-col gap-2">

        <!-- Recherche -->
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
          <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Ajouter un aliment</h2>
          <div class="relative">
            <input v-model="searchQuery" @input="searchFoods" type="text"
                   placeholder="Rechercher un aliment..."
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition w-full text-sm" />

            <div v-if="searchResults.length > 0"
                 style="background-color: #2a2a2a; border: 1px solid #3a3a3a;"
                 class="absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden z-10">
              <div v-for="food in searchResults" :key="food.food_id"
                   class="px-4 py-3 hover:bg-[#3a3a3a] cursor-pointer transition flex items-center justify-between"
                   @click="openAddModal(food)">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    <img v-if="food.image"
                         :src="getImageUrl(food.image)"
                         class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-xs" style="background-color: #3a3a3a;">🍽️</div>
                  </div>
                  <div>
                    <p class="text-white text-sm font-medium">{{ food.name }}</p>
                    <p class="text-gray-400 text-xs">{{ food.calories }} kcal / 100g</p>
                  </div>
                </div>
                <span class="text-[#ff6b6b] text-xs ml-4">+ Ajouter</span>
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
                 class="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer hover:bg-[#3a3a3a] transition"
                 @click="openAddModal(food)">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                  <img v-if="food.image"
                       :src="getImageUrl(food.image)"
                       class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-xs" style="background-color: #3a3a3a;">🍽️</div>
                </div>
                <div>
                  <p class="text-white text-sm font-medium">{{ food.name }}</p>
                  <p class="text-gray-500 text-xs">{{ food.calories }} kcal / 100g</p>
                </div>
              </div>
              <span class="text-[#ff6b6b] text-xs">+ Ajouter</span>
            </div>
          </div>
          <p v-else class="text-gray-600 text-sm text-center py-4">Aucun aliment enregistré</p>
        </div>

      </div>

      <!-- Colonne droite — Macros -->
      <div class="lg:col-span-2" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 1rem; padding: 1.5rem;">
        <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-6">Apports du jour</h2>
        <div class="grid grid-cols-2 gap-2">
          <ProgressionMacrosCards :title="'calories'" :unity="'kcal'" :value="Math.round(macros.calories)" :max="goal.caloriesperday || 2000" :color="'oklch(70.4% 0.191 22.216)'" :size="160" />
          <ProgressionMacrosCards :title="'proteins'" :unity="'g'" :value="Math.round(macros.proteins)" :max="goal.macrosproteins || 150" :color="'oklch(75% 0.183 55.934)'" :size="160" />
          <ProgressionMacrosCards :title="'carbohydrates'" :unity="'g'" :value="Math.round(macros.carbohydrates)" :max="goal.macroscarbohydrates || 250" :color="'oklch(79.2% 0.209 151.711)'" :size="160" />
          <ProgressionMacrosCards :title="'lipids'" :unity="'g'" :value="Math.round(macros.lipids)" :max="goal.macroslipids || 70" :color="'oklch(70.7% 0.165 254.624)'" :size="160" />
        </div>
      </div>

      <!-- Section journal du jour -->
      <div class="lg:col-span-3 rounded-2xl p-6" style="background-color: #1a1a1a; border: 1px solid #2a2a2a;">
        <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Journal du jour</h2>

        <div v-if="entriesByMeal.length > 0" class="flex flex-col gap-6">
          <div v-for="mealGroup in entriesByMeal" :key="mealGroup.meal_id">

            <!-- Titre du repas -->
            <h3 class="text-white font-semibold mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" style="background-color: #ff6b6b; display: inline-block;"></span>
              {{ mealGroup.mealtype }}
            </h3>

            <!-- Liste des aliments -->
            <div class="flex flex-col gap-2">
              <div v-for="entry in mealGroup.items" :key="entry.mealentry_id"
                   style="background-color: #242424; border: 1px solid #2a2a2a;"
                   class="flex items-center gap-4 rounded-xl px-4 py-3">

                <!-- Image -->
                <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                  <img v-if="entry.image"
                       :src="getImageUrl(entry.image)"
                       class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-xs"
                       style="background-color: #3a3a3a;">🍽️</div>
                </div>

                <!-- Nom + macros -->
                <div class="flex-1">
                  <p class="text-white text-sm font-medium">{{ entry.name }}</p>
                  <div class="flex gap-3 mt-1 flex-wrap">
                    <span class="text-xs" style="color: oklch(70.4% 0.191 22.216);">{{ entry.total_calories }} kcal</span>
                    <span class="text-xs" style="color: oklch(75% 0.183 55.934);">{{ entry.total_proteins }}g prot</span>
                    <span class="text-xs" style="color: oklch(79.2% 0.209 151.711);">{{ entry.total_carbohydrates }}g gluc</span>
                    <span class="text-xs" style="color: oklch(70.7% 0.165 254.624);">{{ entry.total_lipids }}g lip</span>
                  </div>
                </div>

                <!-- Quantité éditable -->
                <div v-if="editingEntry === entry.mealentry_id" class="flex items-center gap-2">
                  <input v-model="editQuantity" type="number" min="1"
                         class="bg-[#2a2a2a] text-white rounded-lg px-3 py-1 outline-none border border-transparent focus:border-[#636CFF] transition w-20 text-sm" />
                  <span class="text-gray-400 text-xs">g</span>
                  <button @click="updateEntryQuantity(entry)"
                          class="text-xs px-3 py-1 rounded-lg bg-[#ff6b6b] text-white hover:bg-[#ff5252] transition">
                    ✓
                  </button>
                  <button @click="editingEntry = null"
                          class="text-xs px-3 py-1 rounded-lg text-gray-400 hover:text-white transition"
                          style="background-color: #3a3a3a;">
                    ✕
                  </button>
                </div>
                <div v-else class="flex items-center gap-2">
                  <span class="text-gray-400 text-sm">{{ entry.quantity }}g</span>
                  <button @click="editingEntry = entry.mealentry_id; editQuantity = entry.quantity"
                          class="w-7 h-7 flex items-center justify-center rounded-lg transition"
                          style="background-color: #3a3a3a; color: #9ca3af;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; min-width: 12px;">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button @click="deleteEntry(entry.mealentry_id)"
                          class="w-7 h-7 flex items-center justify-center rounded-lg transition"
                          style="background-color: #3a3a3a; color: #9ca3af;"
                          onmouseover="this.style.color='#f87171'"
                          onmouseout="this.style.color='#9ca3af'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; min-width: 12px;">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/>
                      <path d="M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-600 text-sm text-center py-4">Aucun aliment enregistré pour ce jour</p>
      </div>

    </div>
  </div>
</template>