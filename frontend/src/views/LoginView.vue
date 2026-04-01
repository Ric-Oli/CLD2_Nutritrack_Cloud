<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_URL } from "../api.js";

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const isRegister = ref(false);
const firstname = ref('');
const lastname = ref('');

async function submit() {
  error.value = '';
  const url = isRegister.value
      ? `${API_URL}/api/auth/register`
      : `${API_URL}/api/auth/login`;

  const body = isRegister.value
      ? { lastname: lastname.value, firstname: firstname.value, email: email.value, password: password.value }
      : { email: email.value, password: password.value };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return (error.value = data.message);

    if (!isRegister.value) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } else {
      isRegister.value = false;
    }
  } catch {
    error.value = 'Erreur de connexion au serveur';
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-10 w-full max-w-md">

      <h1 class="text-white text-3xl font-bold text-center mb-2">NutriTrack Cloud</h1>
      <p class="text-gray-400 text-center mb-8">
        {{ isRegister ? 'Créer un compte' : 'Connecte-toi pour continuer' }}
      </p>

      <div v-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
        {{ error }}
      </div>

      <div class="flex flex-col gap-4">

        <div v-if="isRegister" class="flex gap-3">
          <div class="flex flex-col gap-1 w-1/2">
            <label class="text-gray-400 text-sm">Prénom</label>
            <input v-model="firstname" type="text" placeholder="John"
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
          </div>
          <div class="flex flex-col gap-1 w-1/2">
            <label class="text-gray-400 text-sm">Nom</label>
            <input v-model="lastname" type="text" placeholder="Doe"
                   class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Email</label>
          <input v-model="email" type="email" placeholder="john@example.com"
                 class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-sm">Mot de passe</label>
          <input v-model="password" type="password" placeholder="••••••••"
                 class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#ff6b6b] transition" />
        </div>

        <button @click="submit"
                class="bg-[#ff6b6b] hover:bg-[#ff5252] text-white font-bold py-3 rounded-lg transition mt-2">
          {{ isRegister ? "S'inscrire" : 'Se connecter' }}
        </button>
      </div>

      <p class="text-gray-500 text-center text-sm mt-6">
        {{ isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
        <span @click="isRegister = !isRegister" class="text-[#ff6b6b] cursor-pointer hover:underline">
          {{ isRegister ? 'Se connecter' : "S'inscrire" }}
        </span>
      </p>

    </div>
  </div>
</template>