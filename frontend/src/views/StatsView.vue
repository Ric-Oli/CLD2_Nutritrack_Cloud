<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { API_URL } from "../api.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const historyData = ref([]);
const goal = ref({ caloriesperday: 2000, macrosproteins: 150, macroscarbohydrates: 250, macroslipids: 70 });

// Périodes sélectionnées
const caloriesPeriod = ref(7);
const macrosPeriod = ref(7);

function getToken() {
  return localStorage.getItem('token');
}

async function fetchHistory(days) {
  try {
    const res = await fetch(`${API_URL}/api/mealentry/history?days=${days}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    historyData.value = await res.json();
  } catch (err) {
    console.error('Erreur chargement historique:', err);
  }
}

async function fetchGoal() {
  try {
    const res = await fetch('${API_URL}/api/profile', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.caloriesperday) goal.value = {
      caloriesperday: data.caloriesperday,
      macrosproteins: data.macrosproteins,
      macroscarbohydrates: data.macroscarbohydrates,
      macroslipids: data.macroslipids,
    };
  } catch (err) {
    console.error('Erreur chargement objectifs:', err);
  }
}

// Données filtrées selon la période
const caloriesData = computed(() => {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - caloriesPeriod.value);
  return historyData.value.filter(d => new Date(d.date) >= cutoff);
});

const macrosData = computed(() => {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - macrosPeriod.value);
  return historyData.value.filter(d => new Date(d.date) >= cutoff);
});

// Stats résumées
const avgCalories = computed(() => {
  if (caloriesData.value.length === 0) return 0;
  const sum = caloriesData.value.reduce((acc, d) => acc + (d.calories || 0), 0);
  return Math.round(sum / caloriesData.value.length);
});

const totalProtein = computed(() => {
  return Math.round(macrosData.value.reduce((acc, d) => acc + (d.proteins || 0), 0));
});

// ============ GRAPHIQUE CALORIES ============
const caloriesChartData = computed(() => ({
  labels: caloriesData.value.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('fr-CH', { day: '2-digit', month: 'short' });
  }),
  datasets: [
    {
      label: 'Calories',
      data: caloriesData.value.map(d => d.calories || 0),
      backgroundColor: caloriesData.value.map(d => 
        (d.calories || 0) > goal.value.caloriesperday 
          ? 'rgba(248, 113, 113, 0.8)' 
          : 'rgba(255, 107, 107, 0.8)'
      ),
      borderColor: caloriesData.value.map(d => 
        (d.calories || 0) > goal.value.caloriesperday 
          ? '#f87171' 
          : '#ff6b6b'
      ),
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      label: 'Objectif',
      data: caloriesData.value.map(() => goal.value.caloriesperday),
      type: 'line',
      borderColor: '#4ade80',
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
    }
  ]
}));

const caloriesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        color: '#9ca3af',
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: { size: 11 }
      },
      onClick: (e, legendItem, legend) => {
        const index = legendItem.datasetIndex;
        const ci = legend.chart;
        const meta = ci.getDatasetMeta(index);
        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
        ci.update();
      }
    },
    tooltip: {
      backgroundColor: '#2a2a2a',
      borderColor: '#3a3a3a',
      borderWidth: 1,
      titleColor: '#9ca3af',
      bodyColor: '#ffffff',
      padding: 12,
      displayColors: true,
      callbacks: {
        label: ctx => {
          if (ctx.dataset.label === 'Objectif') return `Objectif: ${ctx.parsed.y} kcal`;
          return `${ctx.parsed.y} kcal`;
        }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#6b7280', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.03)' },
      border: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: { 
        color: '#6b7280', 
        font: { size: 11 },
        callback: val => `${val} kcal`
      },
      grid: { color: 'rgba(255,255,255,0.03)' },
      border: { display: false }
    }
  }
};

// ============ GRAPHIQUE MACROS ============
const macrosChartData = computed(() => ({
  labels: macrosData.value.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('fr-CH', { day: '2-digit', month: 'short' });
  }),
  datasets: [
    {
      label: 'Protéines',
      data: macrosData.value.map(d => d.proteins || 0),
      backgroundColor: 'rgba(251, 191, 36, 0.8)',
      borderColor: '#fbbf24',
      borderWidth: 1,
      borderRadius: 4,
      stack: 'macros',
    },
    {
      label: 'Glucides',
      data: macrosData.value.map(d => d.carbohydrates || 0),
      backgroundColor: 'rgba(74, 222, 128, 0.8)',
      borderColor: '#4ade80',
      borderWidth: 1,
      borderRadius: 4,
      stack: 'macros',
    },
    {
      label: 'Lipides',
      data: macrosData.value.map(d => d.lipids || 0),
      backgroundColor: 'rgba(96, 165, 250, 0.8)',
      borderColor: '#60a5fa',
      borderWidth: 1,
      borderRadius: 4,
      stack: 'macros',
    }
  ]
}));

const macrosChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        color: '#9ca3af',
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: { size: 11 }
      },
      onClick: (e, legendItem, legend) => {
        const index = legendItem.datasetIndex;
        const ci = legend.chart;
        const meta = ci.getDatasetMeta(index);
        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
        ci.update();
      }
    },
    tooltip: {
      backgroundColor: '#2a2a2a',
      borderColor: '#3a3a3a',
      borderWidth: 1,
      titleColor: '#9ca3af',
      bodyColor: '#ffffff',
      padding: 12,
      displayColors: true,
      callbacks: {
        label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}g`
      }
    }
  },
  scales: {
    x: {
      stacked: true,
      ticks: { color: '#6b7280', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.03)' },
      border: { display: false }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { 
        color: '#6b7280', 
        font: { size: 11 },
        callback: val => `${val}g`
      },
      grid: { color: 'rgba(255,255,255,0.03)' },
      border: { display: false }
    }
  }
};

// Charger les données au changement de période
watch([caloriesPeriod, macrosPeriod], () => {
  const maxPeriod = Math.max(caloriesPeriod.value, macrosPeriod.value);
  fetchHistory(maxPeriod);
});

onMounted(async () => {
  await Promise.all([fetchHistory(30), fetchGoal()]);
});
</script>

<template>
  <div class="min-h-screen" style="background-color: #121212;">

    <!-- Header -->
    <div style="background-color: #1a1a1a; border-bottom: 1px solid #2a2a2a;" class="px-8 py-5 flex items-center gap-3">
      <h1 class="text-white font-bold text-lg">Statistiques</h1>
    </div>

    <div class="p-4">

      <!-- Stats cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-5">
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Moy. Calories</p>
          <p class="text-white text-2xl font-bold">{{ avgCalories }} <span class="text-gray-400 text-sm font-normal">kcal/j</span></p>
        </div>
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-5">
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Objectif</p>
          <p class="text-white text-2xl font-bold">{{ goal.caloriesperday }} <span class="text-gray-400 text-sm font-normal">kcal/j</span></p>
        </div>
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-5">
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Jours enregistrés</p>
          <p class="text-white text-2xl font-bold">{{ historyData.length }} <span class="text-gray-400 text-sm font-normal">jours</span></p>
        </div>
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-5">
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Protéines</p>
          <p class="text-white text-2xl font-bold" style="color: #fbbf24;">{{ totalProtein }} <span class="text-gray-400 text-sm font-normal">g</span></p>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Graphique Calories -->
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest">Calories par jour</h2>
            
            <!-- Sélecteur de période -->
            <div class="flex gap-1">
              <button 
                v-for="period in [7, 30]" 
                :key="period"
                @click="caloriesPeriod = period"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                :style="caloriesPeriod === period 
                  ? 'background-color: #ff6b6b; color: white;' 
                  : 'background-color: #2a2a2a; color: #9ca3af;'"
                :class="caloriesPeriod !== period ? 'hover:bg-[#3a3a3a]' : ''">
                {{ period }}j
              </button>
            </div>
          </div>
          
          <div class="h-72" v-if="caloriesData.length > 0">
            <Bar :data="caloriesChartData" :options="caloriesChartOptions" />
          </div>
          <div v-else class="h-72 flex items-center justify-center">
            <p class="text-gray-600">Aucune donnée pour cette période</p>
          </div>
        </div>

        <!-- Graphique Macros -->
        <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest">Macronutriments par jour</h2>
            
            <!-- Sélecteur de période -->
            <div class="flex gap-1">
              <button 
                v-for="period in [7, 14, 30]" 
                :key="period"
                @click="macrosPeriod = period"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                :style="macrosPeriod === period 
                  ? 'background-color: #ff6b6b; color: white;' 
                  : 'background-color: #2a2a2a; color: #9ca3af;'"
                :class="macrosPeriod !== period ? 'hover:bg-[#3a3a3a]' : ''">
                {{ period }}j
              </button>
            </div>
          </div>
          
          <div class="h-72" v-if="macrosData.length > 0">
            <Bar :data="macrosChartData" :options="macrosChartOptions" />
          </div>
          <div v-else class="h-72 flex items-center justify-center">
            <p class="text-gray-600">Aucune donnée pour cette période</p>
          </div>
        </div>

      </div>

      <!-- Légende explicative -->
      <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a;" class="rounded-2xl p-6 mt-4">
        <h2 class="text-gray-400 text-xs uppercase font-semibold tracking-widest mb-3">Comment lire ces graphiques</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <p class="text-white font-medium mb-1">Calories par jour</p>
            <p>Les barres montrent vos calories quotidiennes. La ligne verte pointillée représente votre objectif. Cliquez sur la légende pour masquer/afficher une série.</p>
          </div>
          <div>
            <p class="text-white font-medium mb-1">Macronutriments</p>
            <p>Les barres empilées montrent la répartition de vos macros (protéines, glucides, lipides) par jour. Survolez pour voir les valeurs exactes.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
