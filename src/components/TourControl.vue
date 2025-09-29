<template>
  <div class="tour-control" v-if="showControl">
    <!-- Bouton d'aide principal -->
    <div class="relative">
      <button
        @click="toggleMenu"
        class="tour-help-button"
        :class="{ 'active': showMenu }"
        title="Aide et visite guidée"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <!-- Menu déroulant - TEMPORAIREMENT COMMENTÉ 
      <div v-show="showMenu" class="tour-menu">
        <div class="tour-menu-header">
          <h3>🎯 Aide & Visites</h3>
        </div>

        <div class="tour-menu-content">
          <div v-if="availableTours.length > 0" class="tour-section">
            <h4>📍 Cette page</h4>
            <div class="tour-buttons">
              <button
                v-for="tour in availableTours"
                :key="tour.tourId"
                @click="startSpecificTour(tour.tourId)"
                class="tour-button tour-button-primary"
              >
                <span class="button-icon">🎬</span>
                <span>Visite de cette page</span>
                <span v-if="isTourCompleted(tour.tourId)" class="completed-badge">✅</span>
              </button>
            </div>
          </div>

          <div class="tour-section">
            <h4>🗺️ Toutes les visites</h4>
            <div class="tour-buttons">
              <button
                @click="startSpecificTour('dashboard-tour')"
                class="tour-button tour-button-secondary"
              >
                <span class="button-icon">🏠</span>
                <span>Accueil</span>
                <span v-if="isTourCompleted('dashboard-tour')" class="completed-badge">✅</span>
              </button>
              
              <button
                @click="startSpecificTour('exercise-tour')"
                class="tour-button tour-button-secondary"
              >
                <span class="button-icon">♟️</span>
                <span>Exercices</span>
                <span v-if="isTourCompleted('exercise-tour')" class="completed-badge">✅</span>
              </button>
              
              <button
                @click="startSpecificTour('puzzle-tour')"
                class="tour-button tour-button-secondary"
              >
                <span class="button-icon">🧩</span>
                <span>Puzzles</span>
                <span v-if="isTourCompleted('puzzle-tour')" class="completed-badge">✅</span>
              </button>

              <button
                v-if="showAdminTours"
                @click="startSpecificTour('index-exercices-tour')"
                class="tour-button tour-button-secondary"
              >
                <span class="button-icon">👨‍💼</span>
                <span>Administration</span>
                <span v-if="isTourCompleted('index-exercices-tour')" class="completed-badge">✅</span>
              </button>
            </div>
          </div>

          <div class="tour-section">
            <h4>⚙️ Actions</h4>
            <div class="tour-buttons">
              <button
                @click="stopCurrentTour"
                class="tour-button tour-button-warning"
                :disabled="!hasActiveTour"
              >
                <span class="button-icon">⏹️</span>
                <span>Arrêter la visite</span>
              </button>
              
              <button
                @click="resetAllTours"
                class="tour-button tour-button-danger"
                title="Réinitialiser toutes les visites pour les revoir"
              >
                <span class="button-icon">🔄</span>
                <span>Tout réinitialiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTours } from '../composables/useTours'
import { useAuthStore } from '../stores/auth'

interface Props {
  showControl?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showControl: true,
  position: 'bottom-right',
  autoStart: true
})

const route = useRoute()
const authStore = useAuthStore()
const tours = useTours()

const showMenu = ref(false)

// Calculé
const availableTours = computed(() => {
  return tours.getAvailableToursForCurrentRoute()
})

const hasActiveTour = computed(() => {
  return tours.getCurrentTour() !== null
})

const showAdminTours = computed(() => {
  return authStore.user?.admin || false
})

// Méthodes
const toggleMenu = () => {
  // showMenu.value = !showMenu.value
  // Directement relancer le tour de la page courante
  const currentPath = route.path
  let tourId = null
  
  // Détecter le tour selon la route courante
  if (currentPath === '/') {
    tourId = 'dashboard-tour'
  } else if (currentPath.includes('/exercices/') || currentPath.includes('/theme/') && currentPath.includes('/exercices')) {
    tourId = 'exercise-tour'
  } else if (currentPath.includes('/puzzles')) {
    tourId = 'puzzle-tour'
  }
  
  // Lancer le tour avec force si on en a trouvé un
  if (tourId) {
    startSpecificTour(tourId)
  }
}

const startSpecificTour = (tourId: string) => {
  tours.startTour(tourId, { force: true })
  showMenu.value = false
}

const stopCurrentTour = () => {
  tours.stopTour()
  showMenu.value = false
}

const resetAllTours = () => {
  tours.resetAllTours()
  showMenu.value = false
  // Afficher une notification ou message de confirmation
  alert('Toutes les visites guidées ont été réinitialisées !')
}

const isTourCompleted = (tourId: string) => {
  return tours.isTourCompleted(tourId)
}

// Fermer le menu si on clique ailleurs
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.tour-control')) {
    showMenu.value = false
  }
}

// Lancer automatiquement le tour si activé
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  if (props.autoStart) {
    // Délai pour laisser le temps à la page de se charger
    setTimeout(() => {
      tours.startAutoTour()
    }, 1500)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tour-control {
  position: fixed;
  z-index: 1000;
}

/* Positions */
.tour-control {
  bottom: 1rem;
  right: 1rem;
}

.tour-help-button {
  @apply text-white p-1 rounded-full hover:bg-blue-700 transition-all duration-200 ease-in-out;
  @apply hover:scale-110 active:scale-95;
}

.tour-help-button.active {
  @apply bg-blue-800 scale-110;
}

.tour-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  @apply bg-white rounded-lg shadow-xl border border-gray-200;
  min-width: 280px;
  max-height: 500px;
  overflow-y: auto;
}

.tour-menu-header {
  @apply bg-blue-50 px-4 py-3 border-b border-gray-200 rounded-t-lg;
}

.tour-menu-header h3 {
  @apply text-lg font-semibold text-gray-800 m-0;
}

.tour-menu-content {
  @apply p-2;
}

.tour-section {
  @apply mb-4;
}

.tour-section:last-child {
  @apply mb-0;
}

.tour-section h4 {
  @apply text-sm font-medium text-gray-600 mb-2 px-2;
}

.tour-buttons {
  @apply space-y-1;
}

.tour-button {
  @apply w-full px-3 py-2 text-left text-sm rounded-md transition-colors duration-150;
  @apply flex items-center justify-between;
}

.tour-button:hover {
  @apply transform translate-x-1;
}

.tour-button-primary {
  @apply bg-blue-100 text-blue-800 hover:bg-blue-200;
}

.tour-button-secondary {
  @apply bg-gray-100 text-gray-800 hover:bg-gray-200;
}

.tour-button-warning {
  @apply bg-orange-100 text-orange-800 hover:bg-orange-200;
}

.tour-button-warning:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.tour-button-danger {
  @apply bg-red-100 text-red-800 hover:bg-red-200;
}

.button-icon {
  @apply mr-2;
}

.completed-badge {
  @apply text-green-600 ml-2;
}

/* Animation d'entrée du menu */
.tour-menu {
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .tour-control {
    bottom: 1rem;
    right: 1rem;
  }
  
  .tour-menu {
    right: -50px;
    min-width: 260px;
  }
}
</style> 