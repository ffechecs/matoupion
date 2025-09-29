import { App } from 'vue'
import Shepherd from 'shepherd.js'
import type { Tour } from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'

// Types pour les tours
export interface TourStep {
  title: string
  text: string
  attachTo?: {
    element: string
    on: 'auto' | 'auto-start' | 'auto-end' | 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end'
  }
  buttons?: Array<{
    text: string
    action?: () => void
    classes?: string
  }>
  classes?: string
  modalOverlayOpeningPadding?: number
  canClickTarget?: boolean
}

export interface TourConfig {
  id: string
  steps: TourStep[]
  options?: {
    exitOnEsc?: boolean
    keyboardNavigation?: boolean
    useModalOverlay?: boolean
    classPrefix?: string
  }
}

class ShepherdManager {
  private activeTour: Tour | null = null
  private tours: Map<string, TourConfig> = new Map()

  // Configuration par défaut pour tous les tours
  private defaultOptions = {
    exitOnEsc: true,
    keyboardNavigation: true,
    useModalOverlay: true,
    classPrefix: 'shepherd',
    defaultStepOptions: {
      scrollTo: { behavior: 'smooth' as ScrollBehavior, block: 'center' as ScrollLogicalPosition },
      modalOverlayOpeningPadding: 8,
      canClickTarget: false
    }
  }

  // Styles par défaut
  private setupDefaultStyles() {
    const style = document.createElement('style')
    style.textContent = `
      .shepherd-modal-overlay-container {
        background-color: rgba(0, 0, 0, 0.6) !important;
      }
      
      .shepherd-element {
        background: white !important;
        border-radius: 8px !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        max-width: 400px !important;
        z-index: 9999 !important;
      }
      
      .shepherd-header {
        background: #3b82f6 !important;
        color: white !important;
        padding: 1rem !important;
        border-radius: 8px 8px 0 0 !important;
      }
      
      .shepherd-title {
        font-size: 1.1rem !important;
        font-weight: normal !important;
        margin: 0 !important;
      }
      
      .shepherd-text {
        padding: 1rem !important;
        line-height: 1.5 !important;
        color: #374151 !important;
      }
      
      .shepherd-footer {
        padding: 1rem !important;
        border-top: 1px solid #e5e7eb !important;
        display: flex !important;
        justify-content: space-between !important;
        gap: 0.5rem !important;
      }
      
      .shepherd-button {
        padding: 0.5rem 1rem !important;
        border-radius: 6px !important;
        border: none !important;
        cursor: pointer !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
      }
      
      .shepherd-button-primary {
        background: #3b82f6 !important;
        color: white !important;
      }
      
      .shepherd-button-primary:hover {
        background: #2563eb !important;
      }
      
      .shepherd-button-secondary {
        background: #f3f4f6 !important;
        color: #374151 !important;
      }
      
      .shepherd-button-secondary:hover {
        background: #e5e7eb !important;
      }
      
      .shepherd-cancel-icon {
        color: #6b7280 !important;
      }
      
      .shepherd-cancel-icon:hover {
        color: #374151 !important;
      }
      
      .shepherd-arrow:before {
        background: white !important;
      }
    `
    document.head.appendChild(style)
  }

  constructor() {
    this.setupDefaultStyles()
  }

  // Enregistrer un tour
  registerTour(config: TourConfig) {
    this.tours.set(config.id, config)
  }

  // Démarrer un tour
  async startTour(tourId: string, options?: { delay?: number }) {
    const config = this.tours.get(tourId)
    if (!config) {
      console.warn(`Tour "${tourId}" not found`)
      return
    }

    // Arrêter le tour actuel s'il y en a un
    if (this.activeTour) {
      this.activeTour.complete()
    }

    // Attendre un délai si spécifié (utile pour laisser le DOM se charger)
    if (options?.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    // Créer le nouveau tour
    this.activeTour = new Shepherd.Tour({
      ...this.defaultOptions,
      ...config.options
    })

    // Ajouter les étapes
    config.steps.forEach((step, index) => {
      this.activeTour!.addStep({
        title: step.title,
        text: step.text,
        attachTo: step.attachTo,
        buttons: step.buttons || this.getDefaultButtons(index, config.steps.length),
        classes: step.classes || 'shepherd-theme-arrows',
        modalOverlayOpeningPadding: step.modalOverlayOpeningPadding || 8,
        canClickTarget: step.canClickTarget || false
      })
    })

    // Gérer la fin du tour
    this.activeTour.on('complete', () => {
      this.activeTour = null
      this.markTourAsCompleted(tourId)
      // Émettre un événement global
      window.dispatchEvent(new CustomEvent('tour-complete', { detail: { tourId } }))
    })

    this.activeTour.on('cancel', () => {
      this.activeTour = null
      // Émettre un événement global
      window.dispatchEvent(new CustomEvent('tour-cancel', { detail: { tourId } }))
    })

    // Démarrer le tour
    this.activeTour.start()
  }

  // Boutons par défaut
  private getDefaultButtons(stepIndex: number, totalSteps: number) {
    const buttons = []

    // Bouton précédent (sauf pour la première étape)
    if (stepIndex > 0) {
      buttons.push({
        text: 'Précédent',
        classes: 'shepherd-button-secondary',
        action: () => this.activeTour?.back()
      })
    }

    // Bouton suivant ou terminer
    if (stepIndex < totalSteps - 1) {
      buttons.push({
        text: 'Suivant',
        classes: 'shepherd-button-primary',
        action: () => this.activeTour?.next()
      })
    } else {
      buttons.push({
        text: 'Terminer',
        classes: 'shepherd-button-primary',
        action: () => this.activeTour?.complete()
      })
    }

    return buttons
  }

  // Marquer un tour comme terminé
  private markTourAsCompleted(tourId: string) {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]')
    if (!completedTours.includes(tourId)) {
      completedTours.push(tourId)
      localStorage.setItem('completedTours', JSON.stringify(completedTours))
    }
  }

  // Vérifier si un tour a été terminé
  isTourCompleted(tourId: string): boolean {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]')
    return completedTours.includes(tourId)
  }

  // Réinitialiser les tours terminés
  resetCompletedTours() {
    localStorage.removeItem('completedTours')
  }

  // Arrêter le tour actuel
  stopCurrentTour() {
    if (this.activeTour) {
      this.activeTour.complete()
      this.activeTour = null
    }
  }

  // Obtenir le tour actuel
  getCurrentTour() {
    return this.activeTour
  }
}

// Instance globale
export const shepherdManager = new ShepherdManager()

// Plugin Vue
export default {
  install(app: App) {
    app.config.globalProperties.$shepherd = shepherdManager
    app.provide('shepherd', shepherdManager)
  }
}

// Composable pour utiliser Shepherd
export function useShepherd() {
  return shepherdManager
} 