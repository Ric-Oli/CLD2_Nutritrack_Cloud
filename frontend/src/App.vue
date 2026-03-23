<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, computed } from 'vue';

const router = useRouter();
const route = useRoute();
const dropdownOpen = ref(false);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
  dropdownOpen.value = false;
}

function navigate(path) {
  router.push(path);
  dropdownOpen.value = false;
}

const user = computed(() => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
});

const userInitials = computed(() => {
  if (!user.value) return '?';
  return `${user.value.firstname?.[0] || ''}${user.value.lastname?.[0] || ''}`.toUpperCase();
});

const navItems = [
  { path: '/', label: 'Accueil' },
  { path: '/weight', label: 'Suivi du poids' },
  { path: '/profile', label: 'Mon profil' },
];

const isLoginPage = computed(() => route.path === '/login');
</script>

<template>
  <div class="flex min-h-screen" style="background-color: #121212;">

    <!-- ===================== -->
    <!-- SIDEBAR — desktop     -->
    <!-- ===================== -->
    <aside v-if="!isLoginPage"
           style="background-color: #1a1a1a; border-right: 1px solid #2a2a2a;"
           class="hidden sm:flex w-56 shrink-0 fixed top-0 left-0 h-screen flex-col z-50">

      <!-- Logo -->
      <div class="px-6 py-5" style="border-bottom: 1px solid #2a2a2a;">
        <h1 class="text-white font-bold text-base" style="font-size: 28pt">NutriTrack</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-col gap-1 p-3 flex-1">
        <button
            v-for="item in navItems"
            :key="item.path"
            @click="router.push(item.path)"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition text-left w-full"
            :style="route.path === item.path
            ? 'background-color: #2a2a2a; color: white;'
            : 'color: #6b7280;'"
            :class="route.path !== item.path ? 'hover:bg-[#242424] hover:text-white' : ''">
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Utilisateur + Déconnexion -->
      <div class="p-3" style="border-top: 1px solid #2a2a2a;">
        <div class="px-3 py-2 mb-1">
          <p class="text-white text-sm font-medium">{{ user?.firstname }} {{ user?.lastname }}</p>
          <p class="text-gray-500 text-xs truncate">{{ user?.email }}</p>
        </div>
        <button @click="logout"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition w-full text-left hover:bg-[#2a2a2a]"
                style="color: #f87171;">
          <span>Déconnexion</span>
        </button>
      </div>

    </aside>

    <!-- ===================== -->
    <!-- NAVBAR — mobile       -->
    <!-- ===================== -->
    <div v-if="!isLoginPage"
         style="background-color: #1a1a1a; border-bottom: 1px solid #2a2a2a;"
         class="sm:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3">

      <h1 class="text-white font-bold text-base">NutriTrack</h1>

      <!-- Avatar cliquable -->
      <div class="relative">
        <button id="avatar-btn"
                @click="dropdownOpen = !dropdownOpen"
                class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold transition"
                style="background-color: #ff6b6b; width: 40px; height: 40px; border-radius: 100%">
          {{ userInitials }}
        </button>

        <!-- Dropdown -->
        <div v-if="dropdownOpen"
             style="background-color: #1a1a1a; border: 1px solid #2a2a2a;"
             class="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden shadow-xl">

          <!-- Infos utilisateur -->
          <div class="px-4 py-3" style="border-bottom: 1px solid #2a2a2a;">
            <p class="text-white text-sm font-medium">{{ user?.firstname }} {{ user?.lastname }}</p>
            <p class="text-gray-500 text-xs truncate">{{ user?.email }}</p>
          </div>

          <!-- Navigation -->
          <div class="p-2">
            <button
                v-for="item in navItems"
                :key="item.path"
                @click="navigate(item.path)"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition text-left w-full hover:bg-[#2a2a2a]"
                :style="route.path === item.path ? 'color: white;' : 'color: #6b7280;'">
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
          </div>

          <!-- Déconnexion -->
          <div class="p-2" style="border-top: 1px solid #2a2a2a;">
            <button @click="logout"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition w-full text-left hover:bg-[#2a2a2a]"
                    style="color: #f87171;">
              <span>Déconnexion</span>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- ===================== -->
    <!-- Contenu principal     -->
    <!-- ===================== -->
    <main
        :class="!isLoginPage ? 'sm:ml-56' : ''"
        class="flex-1 min-w-0"
        :style="!isLoginPage ? 'padding-top: 0' : ''">

      <!-- Espace pour la navbar mobile -->
      <div v-if="!isLoginPage" class="sm:hidden h-14"></div>

      <RouterView />
    </main>

  </div>
</template>