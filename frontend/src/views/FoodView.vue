<script setup>
import { ref, onMounted } from 'vue';

const foods = ref([]);
const success = ref('');
const error = ref('');

const name = ref('');
const calories = ref('');
const proteins = ref('');
const carbohydrates = ref('');
const lipids = ref('');

const imageFile = ref(null);
const imagePreview = ref(null);

// Modale
const showModal = ref(false);
const editingFood = ref(null);
const editName = ref('');
const editCalories = ref('');
const editProteins = ref('');
const editCarbohydrates = ref('');
const editLipids = ref('');
const editImageFile = ref(null);
const editImagePreview = ref(null);

function handleEditImageChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  editImageFile.value = file;
  editImagePreview.value = URL.createObjectURL(file);
}

function openEditModal(food) {
  editingFood.value = food;
  editName.value = food.name;
  editCalories.value = parseFloat(food.calories);
  editProteins.value = parseFloat(food.proteins);
  editCarbohydrates.value = parseFloat(food.carbohydrates);
  editLipids.value = parseFloat(food.lipids);
  editImageFile.value = null;
  editImagePreview.value = food.image
      ? `http://localhost:3000/uploads/foods/${food.image}`
      : null;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingFood.value = null;
}

async function updateFood() {
  if (!editName.value) return;
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append('name', editName.value);
  formData.append('calories', editCalories.value || 0);
  formData.append('proteins', editProteins.value || 0);
  formData.append('carbohydrates', editCarbohydrates.value || 0);
  formData.append('lipids', editLipids.value || 0);
  if (editImageFile.value) formData.append('image', editImageFile.value);

  try {
    const res = await fetch(`http://localhost:3000/api/food/${editingFood.value.food_id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) return;
    closeModal();
    await fetchFoods();
  } catch {
    error.value = 'Erreur lors de la modification';
  }
}

async function fetchFoods() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:3000/api/food', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    foods.value = await res.json();
  } catch {
    error.value = 'Impossible de charger les aliments';
  }
}

function handleImageChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
}

async function createFood() {
  if (!name.value) return (error.value = 'Le nom est obligatoire');
  error.value = '';
  success.value = '';
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append('name', name.value);
  formData.append('calories', calories.value || 0);
  formData.append('proteins', proteins.value || 0);
  formData.append('carbohydrates', carbohydrates.value || 0);
  formData.append('lipids', lipids.value || 0);
  if (imageFile.value) formData.append('image', imageFile.value);

  try {
    const res = await fetch('http://localhost:3000/api/food', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Ne pas mettre Content-Type ici — FormData le gère automatiquement
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) return (error.value = data.message);

    success.value = 'Aliment créé avec succès !';
    name.value = '';
    calories.value = '';
    proteins.value = '';
    carbohydrates.value = '';
    lipids.value = '';
    imageFile.value = null;
    imagePreview.value = null;
    await fetchFoods();
    setTimeout(() => success.value = '', 3000);
  } catch {
    error.value = 'Erreur lors de la création';
  }
}

async function deleteFood(id) {
  const token = localStorage.getItem('token');
  try {
    await fetch(`http://localhost:3000/api/food/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetchFoods();
  } catch {
    error.value = 'Erreur lors de la suppression';
  }
}

onMounted(fetchFoods);
</script>

<template>
  <div class="min-h-screen" style="background-color: #121212;">

    <!-- Modale modification -->
    <div v-if="showModal"
         class="fixed inset-0 z-50 flex items-center justify-center"
         style="background-color: rgba(0,0,0,0.7);"
         @click.self="closeModal">

      <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;"
           class="rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">

        <div class="flex items-center justify-between">
          <h2 class="text-white text-xl font-bold">Modifier l'aliment</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-white transition text-2xl">×</button>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Nom de l'aliment</label>
          <input v-model="editName" type="text"
                 class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Image</label>
          <div v-if="editImagePreview" class="w-full h-32 rounded-xl overflow-hidden mb-2">
            <img :src="editImagePreview" class="w-full h-full object-cover" />
          </div>
          <label class="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl py-4 transition hover:bg-[#3a3a3a]"
                 style="background-color: #2a2a2a; border: 1px dashed #3a3a3a;">
            <span class="text-2xl">📷</span>
            <span class="text-gray-400 text-xs">{{ editImageFile ? editImageFile.name : 'Changer l\'image' }}</span>
            <input type="file" accept="image/*" class="hidden" @change="handleEditImageChange" />
          </label>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm flex items-center gap-2">
            <span style="color: oklch(70.4% 0.191 22.216);">●</span> Calories (kcal)
          </label>
          <input v-model="editCalories" type="numeric"
                 class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-xs flex items-center gap-1">
              <span style="color: oklch(75% 0.183 55.934);">●</span> Prot. (g)
            </label>
            <input v-model="editProteins" type="numeric"
                   class="bg-[#2a2a2a] text-white rounded-lg px-3 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-xs flex items-center gap-1">
              <span style="color: oklch(79.2% 0.209 151.711);">●</span> Gluc. (g)
            </label>
            <input v-model="editCarbohydrates" type="numeric"
                   class="bg-[#2a2a2a] text-white rounded-lg px-3 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-xs flex items-center gap-1">
              <span style="color: oklch(70.7% 0.165 254.624);">●</span> Lip. (g)
            </label>
            <input v-model="editLipids" type="numeric"
                   class="bg-[#2a2a2a] text-white rounded-lg px-3 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
          </div>
        </div>

        <div class="flex gap-3 mt-2">
          <button @click="closeModal"
                  class="flex-1 py-3 rounded-xl text-gray-400 hover:text-white transition"
                  style="background-color: #2a2a2a;">
            Annuler
          </button>
          <button @click="updateFood"
                  class="flex-1 bg-[#ff6b6b] hover:bg-[#ff5252] text-white font-bold py-3 rounded-xl transition">
            Sauvegarder
          </button>
        </div>

      </div>
    </div>

    <div class="p-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" style="height: 700px;">

        <!-- Colonne gauche — Formulaire -->
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;"
             class="rounded-2xl p-8 flex flex-col gap-5">

          <h2 class="text-white text-xl font-bold">Nouvel aliment</h2>

          <div v-if="success" class="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 text-sm">
            {{ success }}
          </div>
          <div v-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
            {{ error }}
          </div>

          <!-- Nom -->
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-sm">Nom de l'aliment <span class="text-red-400">*</span></label>
            <input v-model="name" type="text" placeholder="Ex: Poulet grillé"
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
          </div>

          <!-- Image -->
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-sm">Image (optionnel)</label>

            <!-- Preview -->
            <div v-if="imagePreview"
                 class="w-full h-32 rounded-xl overflow-hidden mb-2">
              <img :src="imagePreview" class="w-full h-full object-cover" />
            </div>

            <!-- Upload zone -->
            <label class="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl py-4 transition hover:bg-[#3a3a3a]"
                   style="background-color: #2a2a2a; border: 1px dashed #3a3a3a;">
              <span class="text-2xl">📷</span>
              <span class="text-gray-400 text-xs">{{ imageFile ? imageFile.name : 'Cliquer pour ajouter une image' }}</span>
              <span class="text-gray-600 text-xs">JPG, PNG, WEBP — max 5MB</span>
              <input type="file" accept="image/*" class="hidden" @change="handleImageChange" />
            </label>
          </div>

          <!-- Calories -->
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-sm flex items-center gap-2">
              <span style="color: oklch(70.4% 0.191 22.216);">●</span> Calories (kcal)
            </label>
            <input v-model="calories" type="numeric" placeholder="0"
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
          </div>

          <!-- Macros -->
          <div class="grid grid-cols-3 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-gray-400 text-xs flex items-center gap-1">
                <span style="color: oklch(75% 0.183 55.934);">●</span> Prot. (g)
              </label>
              <input v-model="proteins" type="numeric" placeholder="0"
                     class="bg-[#2a2a2a] text-white rounded-lg px-3 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-gray-400 text-xs flex items-center gap-1">
                <span style="color: oklch(79.2% 0.209 151.711);">●</span> Gluc. (g)
              </label>
              <input v-model="carbohydrates" type="numeric" placeholder="0"
                     class="bg-[#2a2a2a] text-white rounded-lg px-3 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-gray-400 text-xs flex items-center gap-1">
                <span style="color: oklch(70.7% 0.165 254.624);">●</span> Lip. (g)
              </label>
              <input v-model="lipids" type="numeric" placeholder="0"
                     class="bg-[#2a2a2a] text-white rounded-lg px-3 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
            </div>
          </div>

          <!-- Aperçu -->
          <div style="background-color: #242424; border: 1px solid #2a2a2a;" class="rounded-xl p-4 flex flex-col gap-2">
            <p class="text-gray-400 text-xs uppercase tracking-widest">Aperçu</p>
            <p class="text-white font-bold">{{ name || 'Nom de l\'aliment' }}</p>
            <div class="flex gap-3 flex-wrap">
              <span class="text-xs px-2 py-1 rounded-full" style="background-color: #2a2a2a; color: oklch(70.4% 0.191 22.216);">
                {{ calories || 0 }} kcal
              </span>
              <span class="text-xs px-2 py-1 rounded-full" style="background-color: #2a2a2a; color: oklch(75% 0.183 55.934);">
                {{ proteins || 0 }}g prot
              </span>
              <span class="text-xs px-2 py-1 rounded-full" style="background-color: #2a2a2a; color: oklch(79.2% 0.209 151.711);">
                {{ carbohydrates || 0 }}g gluc
              </span>
              <span class="text-xs px-2 py-1 rounded-full" style="background-color: #2a2a2a; color: oklch(70.7% 0.165 254.624);">
                {{ lipids || 0 }}g lip
              </span>
            </div>
          </div>

          <button @click="createFood"
                  class="bg-[#ff6b6b] hover:bg-[#ff5252] text-white font-bold py-3 rounded-xl transition mt-auto">
            Créer l'aliment
          </button>

        </div>

        <!-- Colonne droite — Liste des aliments -->
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;"
             class="lg:col-span-2 rounded-2xl p-8 flex flex-col gap-4 overflow-hidden">

          <div class="flex items-center justify-between shrink-0">
            <h2 class="text-white text-xl font-bold">Aliments enregistrés</h2>
            <span class="text-gray-500 text-sm">{{ foods.length }} aliment{{ foods.length > 1 ? 's' : '' }}</span>
          </div>

          <!-- En-tête tableau -->
          <div class="grid grid-cols-8 gap-4 px-4 shrink-0">
            <p class="text-gray-500 text-xs uppercase tracking-widest col-span-1"></p>
            <p class="text-gray-500 text-xs uppercase tracking-widest col-span-2">Nom</p>
            <p class="text-gray-500 text-xs uppercase tracking-widest text-center">Kcal</p>
            <p class="text-gray-500 text-xs uppercase tracking-widest text-center">Prot.</p>
            <p class="text-gray-500 text-xs uppercase tracking-widest text-center">Gluc.</p>
            <p class="text-gray-500 text-xs uppercase tracking-widest text-center">Lip.</p>
            <p class="text-gray-500 text-xs uppercase tracking-widest text-center">Actions</p>
          </div>

          <!-- Liste -->
          <!-- Liste -->
          <div class="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
            <div v-if="foods.length > 0">
              <div v-for="food in foods" :key="food.food_id"
                   style="background-color: #242424; border: 1px solid #2a2a2a;"
                   class="grid grid-cols-8 gap-4 items-center px-4 py-3 rounded-xl mb-2">

                <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                  <img v-if="food.image"
                       :src="`http://localhost:3000/uploads/foods/${food.image}`"
                       class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-sm"
                       style="background-color: #3a3a3a;">🍽️</div>
                </div>

                <p class="text-white font-medium text-sm col-span-2 truncate">{{ food.name }}</p>
                <p class="text-center text-sm" style="color: oklch(70.4% 0.191 22.216);">{{ parseFloat(food.calories).toFixed(0) }}</p>
                <p class="text-center text-sm" style="color: oklch(75% 0.183 55.934);">{{ parseFloat(food.proteins).toFixed(0) }}g</p>
                <p class="text-center text-sm" style="color: oklch(79.2% 0.209 151.711);">{{ parseFloat(food.carbohydrates).toFixed(0) }}g</p>
                <p class="text-center text-sm" style="color: oklch(70.7% 0.165 254.624);">{{ parseFloat(food.lipids).toFixed(0) }}g</p>

                <!-- Actions -->
                <div class="flex gap-2 justify-center">
                  <!-- Modifier -->
                  <button @click="openEditModal(food)"
                          class="w-8 h-8 flex items-center justify-center rounded-lg"
                          style="background-color: #3a3a3a;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; min-width: 12px;">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>

                  <!-- Supprimer -->
                  <button @click="deleteFood(food.food_id)"
                          class="w-8 h-8 flex items-center justify-center rounded-lg"
                          style="background-color: #3a3a3a;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; min-width: 12px;">
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
            <p v-else class="text-gray-600 text-sm text-center py-12">Aucun aliment enregistré</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>