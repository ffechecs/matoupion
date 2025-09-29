import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShepherd } from '../plugins/shepherd'
import { allTours, toursConfig } from '../config/tours'

export function useTours() {
  const route = useRoute()
  const router = useRouter()
  const shepherd = useShepherd()

  // Initialiser tous les tours
  const initializeTours = () => {
    allTours.forEach(tour => {
      shepherd.registerTour(tour)
    })
  }

  // Vérifier si une route correspond à un pattern
  const matchesRoute = (routePattern: string, currentPath: string): boolean => {
    // Convertir le pattern de route en regex
    const regex = new RegExp(
      '^' + routePattern
        .replace(/:[^/]+\?/g, '([^/]*)?') // paramètres optionnels
        .replace(/:[^/]+/g, '([^/]+)')    // paramètres obligatoires
        .replace(/\*/g, '.*') + '$'
    )
    return regex.test(currentPath)
  }

  // Lancer un tour automatiquement selon la route
  const startAutoTour = async (delay: number = 1000) => {
    if (toursConfig.settings.disableAutoTours) {
      return
    }

    const currentPath = route.path
    
    // Vérifier si la route est exclue du système automatique
    const isExcluded = toursConfig.settings.excludeAutoTours?.some(excludedRoute => 
      matchesRoute(excludedRoute, currentPath)
    )
    
    if (isExcluded) {
      return
    }

    const autoTour = toursConfig.autoTours.find(tour => 
      matchesRoute(tour.route, currentPath)
    )

    if (autoTour && !shepherd.isTourCompleted(autoTour.tourId)) {
      // Attendre que la page soit complètement chargée
      await new Promise(resolve => setTimeout(resolve, delay))
      shepherd.startTour(autoTour.tourId, { delay: autoTour.delay })
    }
  }

  // Lancer un tour spécifique
  const startTour = (tourId: string, options?: { delay?: number; force?: boolean }) => {
    if (options?.force || !shepherd.isTourCompleted(tourId)) {
      shepherd.startTour(tourId, { delay: options?.delay || 500 })
    }
  }

  // Arrêter le tour actuel
  const stopTour = () => {
    shepherd.stopCurrentTour()
  }

  // Vérifier si un tour est terminé
  const isTourCompleted = (tourId: string): boolean => {
    return shepherd.isTourCompleted(tourId)
  }

  // Réinitialiser tous les tours
  const resetAllTours = () => {
    shepherd.resetCompletedTours()
  }

  // Obtenir le tour actuel
  const getCurrentTour = () => {
    return shepherd.getCurrentTour()
  }

  // Créer un bouton d'aide pour lancer manuellement un tour
  const createHelpButton = (tourId: string, buttonText: string = '❓ Aide') => {
    return {
      text: buttonText,
      onClick: () => startTour(tourId, { force: true }),
      isCompleted: isTourCompleted(tourId)
    }
  }

  // Tours disponibles pour la route actuelle
  const getAvailableToursForCurrentRoute = () => {
    const currentPath = route.path
    return toursConfig.autoTours.filter(tour => 
      matchesRoute(tour.route, currentPath)
    )
  }

  // Gestion du cycle de vie du composant
  onMounted(() => {
    initializeTours()
  })

  return {
    // Méthodes principales
    initializeTours,
    startAutoTour,
    startTour,
    stopTour,
    
    // Utilitaires
    isTourCompleted,
    resetAllTours,
    getCurrentTour,
    createHelpButton,
    getAvailableToursForCurrentRoute,
    
    // Accès direct au shepherd manager
    shepherd
  }
}

// Composable spécialisé pour la page Dashboard
export function useDashboardTours() {
  const tours = useTours()

  const startDashboardTour = (force: boolean = false) => {
    tours.startTour('dashboard-tour', { delay: 1000, force })
  }

  const shouldShowWelcomeTour = () => {
    return !tours.isTourCompleted('dashboard-tour')
  }

  return {
    ...tours,
    startDashboardTour,
    shouldShowWelcomeTour
  }
}

// Composable spécialisé pour la page Exercise
export function useExerciseTours() {
  const tours = useTours()

  const startExerciseTour = (force: boolean = false) => {
    tours.startTour('exercise-tour', { delay: 1500, force })
  }

  const shouldShowExerciseTour = () => {
    return !tours.isTourCompleted('exercise-tour')
  }

  return {
    ...tours,
    startExerciseTour,
    shouldShowExerciseTour
  }
}

// Composable spécialisé pour la page Puzzles
export function usePuzzleTours() {
  const tours = useTours()

  const startPuzzleTour = (force: boolean = false) => {
    tours.startTour('puzzle-tour', { delay: 1000, force })
  }

  const shouldShowPuzzleTour = () => {
    return !tours.isTourCompleted('puzzle-tour')
  }

  return {
    ...tours,
    startPuzzleTour,
    shouldShowPuzzleTour
  }
}

// Composable spécialisé pour la page Index Exercices (Admin)
/*
export function useIndexExercicesTours() {
  const tours = useTours()

  const startIndexExercicesTour = (force: boolean = false) => {
    tours.startTour('index-exercices-tour', { delay: 1000, force })
  }

  const shouldShowIndexExercicesTour = () => {
    return !tours.isTourCompleted('index-exercices-tour')
  }

  return {
    ...tours,
    startIndexExercicesTour,
    shouldShowIndexExercicesTour
  }
}*/ 