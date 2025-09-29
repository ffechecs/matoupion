<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { Chart, registerables } from "chart.js";
import { $api } from "../../../utils/api";
import { useAuthStore } from "../../../stores/auth";

// Enregistrer les composants nécessaires de Chart.js
Chart.register(...registerables);

const authStore = useAuthStore();

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  refreshTrigger: {
    type: Boolean,
    default: false
  }
});

const eloChartInstance = ref(null);
const nbPuzzlesDone = ref(0);

// Données pour le graphique ELO
const eloData = ref({
  labels: [],
  datasets: [
    {
      label: "Classement ELO",
      data: [],
      borderColor: "#FFD700",
      backgroundColor: "rgba(255, 215, 0, 0.1)",
      borderWidth: 3,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: "#FFD700",
    },
  ],
});

// Fonction pour initialiser le graphique
const initEloChart = () => {
  const ctx = document.getElementById("eloChart") as HTMLCanvasElement;
  if (!ctx) {
    console.error("Canvas element not found");
    return;
  }

  // Attendre que le canvas soit complètement rendu
  setTimeout(() => {
    // Détruire l'instance précédente si elle existe
    if (eloChartInstance.value) {
      eloChartInstance.value.destroy();
    }

    try {
      eloChartInstance.value = new Chart(ctx, {
        type: "line",
        data: eloData.value,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              titleFont: {
                size: 16,
                weight: "bold",
              },
              bodyFont: {
                size: 14,
              },
              padding: 10,
              displayColors: false,
              callbacks: {
                title: function (tooltipItems) {
                  return "Partie #" + tooltipItems[0].label;
                },
                label: function (context) {
                  return "ELO: " + context.parsed.y;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              min: Math.min(...eloData.value.datasets[0].data) - 50,
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              ticks: {
                color: "#FFFFFF",
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
              title: {
                display: true,
                text: "ELO",
                color: "#FFFFFF",
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
            },
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              ticks: {
                color: "#FFFFFF",
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
              title: {
                display: true,
                text: "Nombre de puzzles terminés",
                color: "#FFFFFF",
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error initializing chart:", error);
    }
  }, 50);
};

// Fonction pour charger les données ELO
const loadEloData = async () => {
  try {
    const response = await $api("/auth/elo-history");

    if (response && response.eloHistory && response.eloHistory.length > 0) {
      const gameNumbers = response.eloHistory.map((entry) =>
        entry.puzzleNumber.toString()
      );
      const eloRatings = response.eloHistory.map((entry) => entry.elo);
      nbPuzzlesDone.value = response.eloHistory.length-1;

      eloData.value.labels = gameNumbers;
      eloData.value.datasets[0].data = eloRatings;
    } else {
      console.log("Aucune donnée ELO disponible, utilisation des données par défaut");
    }

    setTimeout(() => {
      initEloChart();
    }, 50);
  } catch (error) {
    console.error("Erreur lors du chargement des données ELO:", error);
  }
};

// Charger les données au montage du composant
onMounted(() => {
  loadEloData();
  console.log("mount",authStore.user.elo);
});

// Watch for refreshTrigger changes
watch(
  () => props.refreshTrigger,
  (newValue) => {
    if (newValue) {
      loadEloData();
        console.log("trigger",authStore.user.elo);
    }
  }
);
</script>

<template>
  <div class="w-full px-4 mt-4">
    <div class="flex justify-center items-center gap-10 mb-2">
      <div class="text-center">
        <span class="text-white text-4xl font-bold">{{ authStore.user?.elo || 400 }}</span>
        <span class="text-white ml-2">Elo</span>
      </div>
      <div class="text-center">
        <span class="text-white text-4xl font-bold">{{ nbPuzzlesDone }}</span>
        <span class="text-white ml-2">puzzles terminés</span>
      </div>
    </div>

    <div class="w-full h-[400px] mt-10 max-w-[780px]">
      <div class="w-full h-full max-w-[900px] mx-auto">
        <canvas id="eloChart" class="w-full h-full"></canvas>
      </div>
    </div>
  </div>
</template>

<style>
@import "@/assets/styles/profileComponents.css";
</style> 