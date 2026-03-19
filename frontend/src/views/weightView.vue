<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const router = useRouter();
const weights = ref([]);
const newWeight = ref('');
const newDate = ref(new Date().toISOString().split('T')[0]);
const error = ref('');
const success = ref('');

async function fetchWeights() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:3000/api/weight', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    weights.value = data;
    if (data.length > 0) {
      newWeight.value = data[data.length - 1].weight;
    }
  } catch {
    error.value = 'Impossible de charger les données';
  }
}

async function addWeight() {
  if (!newWeight.value || !newDate.value) return;
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:3000/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ weight: newWeight.value, date_: newDate.value })
    });
    if (!res.ok) return;
    success.value = 'Poids ajouté !';
    newWeight.value = '';
    await fetchWeights();
    setTimeout(() => success.value = '', 3000);
  } catch {
    error.value = 'Erreur lors de l\'ajout';
  }
}

async function deleteWeight(id) {
  const token = localStorage.getItem('token');
  try {
    await fetch(`http://localhost:3000/api/weight/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetchWeights();
  } catch {
    error.value = 'Erreur lors de la suppression';
  }
}

const lastWeight = computed(() => weights.value.length > 0 ? weights.value[weights.value.length - 1].weight : null);
const firstWeight = computed(() => weights.value.length > 0 ? weights.value[0].weight : null);
const weightDiff = computed(() => lastWeight.value && firstWeight.value ? (lastWeight.value - firstWeight.value).toFixed(1) : null);

const chartData = computed(() => ({
  labels: weights.value.map(w => new Date(w.date_).toLocaleDateString('fr-CH')),
  datasets: [{
    label: 'Poids (kg)',
    data: weights.value.map(w => w.weight),
    borderColor: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    pointBackgroundColor: '#ff6b6b',
    pointBorderColor: '#1a1a1a',
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 8,
    tension: 0.4,
    fill: true,
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#2a2a2a',
      borderColor: '#3a3a3a',
      borderWidth: 1,
      titleColor: '#9ca3af',
      bodyColor: '#ffffff',
      callbacks: { label: ctx => `  ${ctx.parsed.y} kg` }
    }
  },
  scales: {
    x: {
      ticks: { color: '#6b7280', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.03)' },
      border: { display: false }
    },
    y: {
      ticks: { color: '#6b7280', font: { size: 11 }, callback: val => `${val} kg` },
      grid: { color: 'rgba(255,255,255,0.03)' },
      border: { display: false }
    }
  }
};

onMounted(fetchWeights);
</script>

<template>
  <div class="min-h-screen" style="background-color: #121212;">

    <!-- Header -->
    <div style="background-color: #1a1a1a; border-bottom: 1px solid #2a2a2a;" class="px-8 py-5 flex items-center gap-4">
      <button @click="router.push('/')" class="text-gray-400 hover:text-white transition text-sm">
        ← Retour
      </button>
      <div style="width: 1px; background-color: #2a2a2a; height: 20px;"></div>
      <h1 class="text-white font-bold text-lg">Suivi du poids</h1>
    </div>

    <div class="p-8">

      <!-- Stats cards -->
      <div class="grid grid-cols-3 gap-4 mb-6" v-if="weights.length > 0">
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-5">
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Poids actuel</p>
          <p class="text-white text-3xl font-bold">{{ lastWeight }} <span class="text-gray-400 text-lg font-normal">kg</span></p>
        </div>
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-5">
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Poids initial</p>
          <p class="text-white text-3xl font-bold">{{ firstWeight }} <span class="text-gray-400 text-lg font-normal">kg</span></p>
        </div>
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-5">
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Évolution</p>
          <p class="text-3xl font-bold" :style="{ color: weightDiff > 0 ? '#f87171' : '#4ade80' }">
            {{ weightDiff > 0 ? '+' : '' }}{{ weightDiff }} <span class="text-gray-400 text-lg font-normal">kg</span>
          </p>
        </div>
      </div>

      <!-- Grid principale avec hauteur fixe -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" style="height: 600px;">

        <!-- Colonne gauche -->
        <div class="lg:col-span-2 flex flex-col gap-6 h-full">

          <!-- Graphique -->
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6 flex-1">
            <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-6">Évolution du poids</h2>
            <div class="h-56" v-if="weights.length > 0">
              <Line :data="chartData" :options="chartOptions" />
            </div>
            <div v-else class="h-56 flex items-center justify-center">
              <p class="text-gray-600">Aucune donnée à afficher</p>
            </div>
          </div>

          <!-- Ajouter -->
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6 shrink-0">
            <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-4">Ajouter une entrée</h2>

            <div v-if="success" class="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm">{{ success }}</div>
            <div v-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">{{ error }}</div>

            <div class="flex flex-wrap gap-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-gray-400 text-sm">Poids (kg)</label>
                <input v-model="newWeight" type="number" step="0.1" placeholder="70.5"
                       class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
              </div>
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-gray-400 text-sm">Date</label>
                <input v-model="newDate" type="date"
                       class="bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#636CFF] transition" />
              </div>
              <div class="w-full lg:w-auto lg:flex lg:items-end">
                <button @click="addWeight"
                        class="bg-[#ff6b6b] hover:bg-[#ff5252] text-white font-bold px-6 py-3 rounded-lg transition w-full">
                  Ajouter
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Colonne droite — historique -->
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;"
             class="rounded-2xl p-6 flex flex-col gap-4 h-[400px] lg:h-full overflow-hidden">

          <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest shrink-0">Historique</h2>

          <div v-if="weights.length > 0"
               class="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
            <div v-for="entry in [...weights].reverse()" :key="entry.historical_id"
                 style="background-color: #242424; border: 1px solid #2a2a2a;"
                 class="flex items-center justify-between rounded-xl px-4 py-3 shrink-0">
              <div>
                <p class="text-gray-500 text-xs">{{ new Date(entry.date_).toLocaleDateString('fr-CH') }}</p>
                <p class="text-white font-bold">{{ entry.weight }} kg</p>
              </div>
              <button @click="deleteWeight(entry.historical_id)" class="delete transition text-xs">
                Supprimer
              </button>
            </div>
          </div>
          <p v-else class="text-gray-600 text-sm text-center py-8">Aucune entrée</p>

        </div>

      </div>
    </div>
  </div>
</template>