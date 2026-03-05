<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
</script>

<template>
  <!-- Menu flottant vertical en haut à droite -->
  <div v-if="route.path !== '/login'"
       class="fixed top-6 right-6 z-50 flex flex-col gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 shadow-xl">

    <button @click="logout"
            class="bg-[#ff6b6b]/10 hover:bg-[#ff6b6b] text-[#ff6b6b] text-sm px-4 py-2 rounded-lg transition text-right">
      Déconnexion
    </button>

    <button @click="router.push('/profile')"
            class="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-sm px-4 py-2 rounded-lg transition text-right">
      Mon profil
    </button>

  </div>

  <RouterView />
</template>