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

onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) user.value = JSON.parse(stored);
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
  <div class="min-h-screen bg-[#121212] flex items-center justify-center">
    <div class="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-10 w-full max-w-lg">

      <div class="flex items-center gap-4 mb-8">
        <button @click="router.push('/')" class="text-gray-400 hover:text-white transition">
          ← Retour
        </button>
        <h1 class="text-white text-2xl font-bold">Mon profil - {{ user?.firstname }}</h1>
      </div>

      <div v-if="user" class="bg-[#2a2a2a] rounded-xl p-4 mb-6">
        <p class="text-white font-semibold">{{ user.firstname }} {{ user.lastname }}</p>
        <p class="text-gray-400 text-sm">{{ user.email }}</p>
      </div>

      <div v-if="success" class="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm">
        {{ success }}
      </div>
      <div v-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
        {{ error }}
      </div>

      <div class="flex flex-col gap-4">

        <!-- INFOS PHYSIQUES -->
        <h2 class="text-gray-400 text-sm uppercase font-semibold tracking-widest mt-2">Infos physiques</h2>

        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Taille (cm)</label>
          <input v-model="height" type="number" placeholder="175"
                 class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
        </div>



      </div>
    </div>
  </div>

</template>

<style scoped>

</style>