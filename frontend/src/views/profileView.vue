<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);
const height = ref('');
const caloriesperday = ref('');
const macrosproteins = ref('');
const macroscarbohydrates = ref('');
const macroslipids = ref('');
const success = ref('');
const error = ref('');

onMounted(async() => {
  const stored = localStorage.getItem('user');
  if (stored) user.value = JSON.parse(stored);

  const token = localStorage.getItem('token');

  try {
    const res = await fetch('http://localhost:3000/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();

    height.value = data.height || '';
    caloriesperday.value = data.caloriesperday || '';
    macrosproteins.value = data.macrosproteins || '';
    macroscarbohydrates.value = data.macroscarbohydrates || '';
    macroslipids.value = data.macroslipids || '';
  } catch {
    error.value = 'Impossible de charger le profil';
  }
});

async function saveProfile() {
  success.value = '';
  error.value = '';
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('http://localhost:3000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        height: height.value,
        caloriesperday: caloriesperday.value,
        macrosproteins: macrosproteins.value,
        macroscarbohydrates: macroscarbohydrates.value,
        macroslipids: macroslipids.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) return (error.value = data.message);
    success.value = 'Profil mis à jour avec succès !';
  } catch {
    error.value = 'Erreur de connexion au serveur';
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center gap-6">

    <!-- Bouton retour à gauche du bloc -->
    <button @click="router.push('/')"
            class="self-start mt-35 text-gray-400 hover:text-white transition text-2xl">
      ← retour
    </button>

    <!-- Bloc principal -->
    <div class="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-10 w-full max-w-lg">

      <h1 class="text-white text-2xl font-bold mb-8">Mon profil - {{ user?.firstname }}</h1>

      <div v-if="success" class="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm">
        {{ success }}
      </div>
      <div v-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
        {{ error }}
      </div>

      <div class="flex flex-col gap-4">
        <h2 class="text-gray-400 text-sm uppercase font-semibold tracking-widest mt-2">Infos physiques</h2>

        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Taille (cm)</label>
          <input v-model="height" type="numeric" placeholder="175"
                 class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
        </div>

        <h2 class="text-gray-400 text-sm uppercase font-semibold tracking-widest mt-2">Objectifs nutritionnels</h2>

        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Calories par jour (kcal)</label>
          <input v-model="caloriesperday" type="numeric" placeholder="2000"
                 class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-sm">Protéines (g)</label>
            <input v-model="macrosproteins" type="numeric" placeholder="150"
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-sm">Glucides (g)</label>
            <input v-model="macroscarbohydrates" type="numeric" placeholder="250"
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-gray-400 text-sm">Lipides (g)</label>
            <input v-model="macroslipids" type="numeric" placeholder="70"
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
          </div>
        </div>

        <button @click="saveProfile"
                class="bg-[#ff6b6b] hover:bg-[#ff5252] text-white font-bold py-3 rounded-lg transition mt-2">
          Sauvegarder
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>