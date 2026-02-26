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

</template>

<style scoped>

</style>