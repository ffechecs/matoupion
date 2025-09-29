import { useShepherd } from '../plugins/shepherd'

/**
 * Utilitaires pour faciliter la gestion des tours
 */

// Constantes pour les sélecteurs couramment utilisés
export const TOUR_SELECTORS = {
  // Dashboard
  THEMES_CONTAINER: '.lg\\:block .relative.mx-auto, .grid.grid-cols-2',
  THEME_BUTTON: '[style*="left"][style*="top"]',
  PUZZLE_BUTTON: 'img[src*="puzzle.png"]',
  FIRST_THEME: '[style*="left: 12%"]',
  
  // Exercise
  CHESSBOARD: '.cg-wrap, [class*="chessboard"], .board, [data-tour="chessboard"]',
  INSTRUCTIONS: '.instructions, [class*="instruction"], .exercise-description, [data-tour="instructions"]',
  ACTION_BUTTONS: '.actions, [class*="button"], .controls, [data-tour="actions"]',
  HINT_BUTTON: '[data-tour="hint"], .hint-button',
  RESET_BUTTON: '[data-tour="reset"], .reset-button',
  SOLUTION_BUTTON: '[data-tour="solution"], .solution-button',
  
  // Puzzle
  PUZZLE_SELECTOR: '.puzzle-selector, [data-tour="puzzle-selector"]',
  TIMER: '.timer, [data-tour="timer"]',
  DIFFICULTY_SELECTOR: '.difficulty, [data-tour="difficulty"]',
  
  // General
  HEADER: 'header, .header',
  NAVIGATION: 'nav, .navigation',
  USER_MENU: '.user-menu, [data-tour="user-menu"]',
  HELP_BUTTON: '.tour-help-button'
} as const

// Messages prédéfinis pour les tours
export const TOUR_MESSAGES = {
  WELCOME: {
    fr: {
      title: '🎉 Bienvenue !',
      text: 'Bienvenue dans votre plateforme d\'apprentissage des échecs ! Cette visite guidée va vous présenter les principales fonctionnalités.'
    }
  },
  CLICK_TO_CONTINUE: {
    fr: 'Cliquez sur "Suivant" pour continuer...'
  },
  FIRST_TIME_USER: {
    fr: {
      title: '👋 Première visite ?',
      text: 'Il semble que ce soit votre première visite. Voulez-vous faire le tour de l\'application ?'
    }
  },
  EXERCISE_HELP: {
    fr: {
      title: '💡 Besoin d\'aide ?',
      text: 'Utilisez les boutons d\'aide si vous êtes bloqué. L\'indice vous donne un conseil, la solution révèle la réponse complète.'
    }
  }
} as const

/**
 * Vérifie si un élément existe dans le DOM
 */
export const elementExists = (selector: string): boolean => {
  return document.querySelector(selector) !== null
}

/**
 * Attend qu'un élément apparaisse dans le DOM
 */
export const waitForElement = (selector: string, timeout: number = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}

/**
 * Ajoute des attributs data-tour pour faciliter le ciblage
 */
export const addTourAttributes = () => {
  // Dashboard
  const themes = document.querySelectorAll('[style*="left"][style*="top"]')
  themes.forEach((theme, index) => {
    theme.setAttribute('data-tour', `theme-${index + 1}`)
  })

  const puzzleButton = document.querySelector('img[src*="puzzle.png"]')
  if (puzzleButton) {
    puzzleButton.closest('div')?.setAttribute('data-tour', 'puzzle-button')
  }

  // Exercise page
  const chessboard = document.querySelector('.cg-wrap, [class*="chessboard"], .board')
  if (chessboard) {
    chessboard.setAttribute('data-tour', 'chessboard')
  }

  // Add more as needed...
}

/**
 * Gestionnaire d'événements pour les tours
 */
export class TourEventManager {
  private static instance: TourEventManager
  private listeners: Map<string, Function[]> = new Map()

  static getInstance(): TourEventManager {
    if (!TourEventManager.instance) {
      TourEventManager.instance = new TourEventManager()
    }
    return TourEventManager.instance
  }

  // Écouter un événement de tour
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // Déclencher un événement
  emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  // Retirer un listener
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
}

/**
 * Valide la configuration d'un tour
 */
export const validateTourConfig = (config: any): boolean => {
  if (!config.id || !config.steps) {
    console.error('Tour config must have id and steps')
    return false
  }

  if (!Array.isArray(config.steps) || config.steps.length === 0) {
    console.error('Tour steps must be a non-empty array')
    return false
  }

  for (const step of config.steps) {
    if (!step.title || !step.text) {
      console.error('Each step must have title and text')
      return false
    }

    if (step.attachTo && !step.attachTo.element) {
      console.error('attachTo must have element selector')
      return false
    }
  }

  return true
}

/**
 * Analytics simples pour les tours
 */
export class TourAnalytics {
  private static STORAGE_KEY = 'tour-analytics'

  static trackTourStart(tourId: string) {
    const data = this.getData()
    if (!data.starts[tourId]) {
      data.starts[tourId] = 0
    }
    data.starts[tourId]++
    this.saveData(data)
  }

  static trackTourComplete(tourId: string) {
    const data = this.getData()
    if (!data.completions[tourId]) {
      data.completions[tourId] = 0
    }
    data.completions[tourId]++
    data.lastCompleted = new Date().toISOString()
    this.saveData(data)
  }

  static trackTourCancel(tourId: string, stepIndex: number) {
    const data = this.getData()
    if (!data.cancellations[tourId]) {
      data.cancellations[tourId] = []
    }
    data.cancellations[tourId].push({
      stepIndex,
      timestamp: new Date().toISOString()
    })
    this.saveData(data)
  }

  static getStats() {
    return this.getData()
  }

  private static getData() {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : {
      starts: {},
      completions: {},
      cancellations: {},
      lastCompleted: null
    }
  }

  private static saveData(data: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
  }
}

/**
 * Debug helpers pour les tours
 */
export const TourDebug = {
  // Liste tous les sélecteurs disponibles sur la page
  listAvailableSelectors() {
    const selectors: string[] = []
    
    // Classes
    document.querySelectorAll('[class]').forEach(el => {
      el.classList.forEach(className => {
        selectors.push(`.${className}`)
      })
    })
    
    // IDs
    document.querySelectorAll('[id]').forEach(el => {
      selectors.push(`#${el.id}`)
    })
    
    // Attributs data-tour
    document.querySelectorAll('[data-tour]').forEach(el => {
      const tourId = el.getAttribute('data-tour')
      selectors.push(`[data-tour="${tourId}"]`)
    })
    
    return [...new Set(selectors)].sort()
  },

  // Teste si un sélecteur fonctionne
  testSelector(selector: string) {
    const elements = document.querySelectorAll(selector)
    console.log(`Selector "${selector}" found ${elements.length} elements:`, elements)
    return elements
  },

  // Affiche les tours disponibles
  showAvailableTours() {
    console.log('Available tours: Use this method inside a Vue component with useShepherd()')
    console.log('Available selectors on page:', TourDebug.listAvailableSelectors())
  },

  // Highlight un élément pour debugging
  highlightElement(selector: string, duration: number = 3000) {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      const originalStyle = element.style.cssText
      element.style.cssText += `
        outline: 3px solid red !important;
        outline-offset: 2px !important;
        background-color: rgba(255, 0, 0, 0.1) !important;
      `
      
      setTimeout(() => {
        element.style.cssText = originalStyle
      }, duration)
      
      return element
    }
    return null
  }
}

// Export pour utilisation globale en dev
if (typeof window !== 'undefined') {
  (window as any).TourDebug = TourDebug;
  (window as any).TOUR_SELECTORS = TOUR_SELECTORS;
} 