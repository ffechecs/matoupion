import { type TourConfig } from '../plugins/shepherd'

// Tour pour la page Dashboard (accueil)
export const dashboardTour: TourConfig = {
  id: 'dashboard-tour',
  steps: [
    {
      title: '🎉 Bienvenue sur Matoupion !',
      text: `
        <div class="space-y-3">
          <p>👋 Bienvenue dans ta plateforme d'apprentissage des échecs !</p>
          <p>Cette visite guidée va te présenter les principales fonctionnalités de l'application.</p>
          <p><strong>Tu peux arrêter cette visite à tout moment en appuyant sur Échap.</strong></p>
        </div>
      `
    },
    {
      title: '🏠 Retour à l\'accueil',
      text: `
        <div class="space-y-3">
          <p>Voici le logo Matoupion !</p>
          <p>🔄 <strong>À tout moment</strong>, tu peux cliquer sur ce logo pour revenir à cet écran de progression</p>
          <p>📍 C'est ton point de départ pour naviguer dans l'application</p>
        </div>
      `,
      attachTo: {
        element: '.logo, [class*="logo"], img[alt*="logo"], img[src*="logo"]',
        on: 'bottom'
      }
    },
    {
      title: '👤 Votre profil',
      text: `
        <div class="space-y-3">
          <p>Voici ta icône de profil !</p>
          <p>📊 Clique ici pour <strong>visualiser ta progression</strong> détaillée</p>
          <p>🏆 Tu y trouveras aussi tes <strong>récompenses</strong> et statistiques</p>
          <p>⭐ Suis tes performances et célèbre tes succès !</p>
        </div>
      `,
      attachTo: {
        element: '.profile, [class*="profile"], .user-icon, [class*="user"]',
        on: 'bottom-start'
      }
    },
    {
      title: '❓ Aide et didacticiel',
      text: `
        <div class="space-y-3">
          <p>Voici le bouton d'aide !</p>
          <p>🔄 Tu peux <strong>relancer ce didacticiel</strong> à tout moment en cliquant sur ce bouton</p>
          <p>💡 N'hésite pas à l'utiliser si tu as besoin d'aide !</p>
        </div>
      `,
      attachTo: {
        element: '.tour-help-button, .help-button, [class*="help"]',
        on: 'top'
      }
    },
    {
      title: '🎯 Les Thèmes d\'Exercices',
      text: `
        <div class="space-y-3">
          <p>Voici les thèmes d'exercices d'échecs ! Chaque losange de bois numéroté représente un thème différent.</p>
          <p>🔓 Les thèmes <strong>colorés</strong> sont débloqués et accessibles</p>
          <p>🔒 Les thèmes <strong>grisés</strong> se débloqueront au fur et à mesure de ta progression</p>
          <p>🔓 Pour débloquer le thème suivant, il faut avoir complété au moins 4 exercices du thème en cours</p>
          <p>⭐ Les étoiles sous chaque thème indiquent ta progression dans les exercices</p>
        </div>
      `,
      attachTo: {
        element: '.lg\\:block .relative.mx-auto, .grid.grid-cols-2',
        on: 'top'
      }
    },
    {
      title: '🧩 Les Puzzles',
      text: `
        <div class="space-y-3">
          <p>Voici la section des puzzles d'échecs !</p>
          <p>🧩 Les puzzles sont des problèmes tactiques à résoudre</p>
          <p>🔓 Tu peux accéder aux puzzles après avoir débloqué le 14ème thème</p>
          <p>🔢 Le chiffre indique le nombre de puzzles que tu as complétés</p>
          <p>💡 C'est un excellent moyen d'améliorer ta vision tactique</p>
        </div>
      `,
      attachTo: {
        element: 'img[src*="puzzle.png"]',
        on: 'left'
      }
    },
    {
      title: '🚀 Comment commencer ?',
      text: `
        <div class="space-y-3">
          <p><strong>Pour commencer ton apprentissage :</strong></p>
          <ol class="list-decimal list-inside space-y-2">
            <li>Clique sur le <strong>thème 1</strong> pour commencer par les bases</li>
            <li>Résouds les exercices dans l'ordre</li>
            <li>Collecte les étoiles en complétant les exercices</li>
            <li>Débloque progressivement les thèmes suivants</li>
          </ol>
        </div>
      `
    },
   
  ]
}

// Tour pour la page Exercise
export const exerciseTour: TourConfig = {
  id: 'exercise-tour',
  steps: [
    {
      title: '♟️ Interface d\'Exercice',
      text: `
        <div class="space-y-3">
          <p>Bienvenue dans l'interface d'exercice !</p>
          <p>Ici tu vas t'entraîner sur plein de thèmes différents</p>
        </div>
      `
    },
    {
      title: '🎯 Le thème de l\'exercice',
      text: `
        <div class="space-y-3">
          <p>En haut de l'écran, tu peux voir le <strong>thème</strong> de la série d'exercices.</p>
          <p>📚 Chaque thème regroupe des exercices sur une technique particulière</p>
          <p>🎯 Par exemple : "Les pions", "Les fourchettes", "Le clouage", etc.</p>
          <p>💡 Tous les exercices de cette page portent sur le même concept !</p>
        </div>
      `,
      attachTo: {
        element: '.title, h1, [class*="title"], [class*="theme"]',
        on: 'bottom'
      }
    },
    {
      title: '⚫⚪ L\'indicateur de trait',
      text: `
        <div class="space-y-3">
          <p>Ce petit rond t'indique <strong>qui a le trait</strong> !</p>
          <p>⚪ <strong>Point Blanc</strong> : c'est aux blancs de jouer</p>
          <p>⚫ <strong>Point Noir</strong> : c'est aux noirs de jouer</p>
          <p>🔄 L'échiquier est toujours orienté pour le joueur de cette couleur</p>
        </div>
      `,
      attachTo: {
        element: '.turn-indicator, .white-turn, .black-turn',
        on: 'right'
      }
    },
    {
      title: '♔ L\'Échiquier',
      text: `
        <div class="space-y-3">
          <p>Voici l'échiquier interactif où tu vas résoudre les exercices.</p>
          <p>🖱️ Clique et glisse les pièces pour jouer tes coups</p>
          <p>✅ Le système vérifiera automatiquement si ton coup est correct</p>
        </div>
      `,
      attachTo: {
        element: '.cg-wrap, [class*="chessboard"], .board',
        on: 'left'
      }
    },
    {
      title: '📝 Les Instructions',
      text: `
        <div class="space-y-3">
          <p>Cette zone contient les instructions de l'exercice.</p>
          <p>📖 Lis attentivement l'énoncé avant de jouer</p>
          <p>🎯 L'objectif te indique ce que tu dois accomplir</p>
        </div>
      `,
      attachTo: {
        element: '.instructions, [class*="instruction"], .exercise-description',
        on: 'right'
      }
    },
    {
      title: '💡 Obtenir un indice',
      text: `
        <div class="space-y-3">
          <p>Si tu es bloqué sur l'exercice, utilise ce bouton pour obtenir de l'aide !</p>
          <p>🔍 L'indice te donnera une piste pour trouver la solution</p>
          <p>💡 Mais essaye d'abord de réfléchir par toi-même, tu progresseras plus vite !</p>
        </div>
      `,
      attachTo: {
        element: '#hint-button',
        on: 'top'
      }
    },
    {
      title: '🏆 Progression',
      text: `
        <div class="space-y-3">
          <p>Cette barre latérale montre ta progression dans le thème actuel.</p>
          <p>⭐ Chaque étoile représente un exercice complété</p>
          <p>🎯 Complete tous les exercices pour obtenir toutes les étoiles et débloquer le thème suivant !</p>
        </div>
      `,
      attachTo: {
        element: '.sidebar, .progression-sidebar, [class*="sidebar"], .stars-container',
        on: 'left'
      }
    }
  ]
}

// Tour pour la page Puzzles
export const puzzleTour: TourConfig = {
  id: 'puzzle-tour',
  steps: [
    {
      title: '🧩 Bienvenue dans les Puzzles !',
      text: `
        <div class="space-y-3">
          <p>Les puzzles sont des problèmes tactiques à résoudre !</p>
          <p>🎯 Trouve le meilleur coup dans la position donnée</p>
          <p>⚡ Ils améliorent ta vision tactique et ta rapidité</p>
        </div>
      `
    },
    {
      title: '🎯 Le thème du puzzle',
      text: `
        <div class="space-y-3">
          <p>En haut de l'écran, tu peux voir le <strong>thème</strong> du puzzle actuel.</p>
          <p>📚 Chaque thème regroupe des puzzles sur une technique particulière</p>
          <p>🎯 Par exemple : "Prise en prise", "Mat en 2", "Fourchette", etc.</p>
          <p>💡 Cela te donne un indice sur le type de tactique à chercher !</p>
        </div>
      `,
      attachTo: {
        element: '.title, h1, [class*="title"], [class*="theme"]',
        on: 'bottom'
      }
    },
    {
      title: '⚫⚪ Qui a le trait ?',
      text: `
        <div class="space-y-3">
          <p>Cette phrase sous l'échiquier t'indique <strong>qui a le trait</strong> !</p>
          <p>⚪ <strong>"Aux blancs de jouer"</strong> : c'est à toi de jouer avec les pièces blanches</p>
          <p>⚫ <strong>"Aux noirs de jouer"</strong> : c'est à toi de jouer avec les pièces noires</p>
          <p>🔄 L'échiquier est toujours orienté pour que tu adoptes le point de vue du joueur au trait</p>
        </div>
      `,
      attachTo: {
        element: '.puzzle-turn',
        on: 'top'
      }
    },
    {
      title: '👑 Indications visuelles !',
      text: `
        <div class="space-y-3">
          <p>👁️ Les cases et pièces importantes sont souvent mises en évidence</p>
          <p>🎯 Cela t'aide à identifier rapidement la situation sur l'échiquier</p>
          <p>💡 Utilise ces indices visuels pour trouver la solution plus facilement</p>
        </div>
      `,
      attachTo: {
        element: '.cg-wrap, [class*="chessboard"], .board',
        on: 'left'
      }
    },
    {
      title: '🔄 Navigation entre puzzles',
      text: `
        <div class="space-y-3">
          <p>Utilise ces flèches sous l'échiquier pour naviguer entre les puzzles !</p>
          <p>⬅️ <strong>Flèche gauche</strong> : revenir au puzzle précédent</p>
          <p>➡️ <strong>Flèche droite</strong> : passer au puzzle suivant</p>
          <p>🔄 Tu peux refaire un puzzle ou passer directement au suivant</p>
          <p>🎯 <strong>Bon entraînement et amuse-toi bien !</strong></p>
        </div>
      `,
      attachTo: {
        element: '.flex.justify-center.gap-10.mt-1',
        on: 'top'
      }
    }
  ]
}

// Tour pour la page Index Exercices (Admin)
export const indexExercicesTour: TourConfig = {
  id: 'index-exercices-tour',
  steps: [
    {
      title: '👨‍💼 Interface Administration',
      text: `
        <div class="space-y-3">
          <p>Bienvenue dans l'interface d'administration des exercices !</p>
          <p>🔧 Ici vous pouvez gérer tous les exercices de la plateforme</p>
          <p>⚠️ Cette interface est réservée aux administrateurs</p>
        </div>
      `
    },
    {
      title: '📋 Liste des Exercices',
      text: `
        <div class="space-y-3">
          <p>Voici la liste complète de tous les exercices :</p>
          <ul class="list-disc list-inside space-y-1">
            <li><strong>Créer</strong> : Ajouter de nouveaux exercices</li>
            <li><strong>Modifier</strong> : Éditer les exercices existants</li>
            <li><strong>Supprimer</strong> : Retirer des exercices</li>
            <li><strong>Réorganiser</strong> : Changer l'ordre des exercices</li>
          </ul>
        </div>
      `
    }
  ]
}

// Configuration générale des tours
export const toursConfig = {
  // Tours à lancer automatiquement lors de la première visite
  autoTours: [
    { route: '/', tourId: 'dashboard-tour', delay: 300 },
    { route: '/theme/:themeId/exercices/:exerciseNumber?', tourId: 'exercise-tour', delay: 500 },
    { route: '/exercices/:exerciseId?', tourId: 'exercise-tour', delay: 500 },
    { route: '/puzzles/:puzzleId?', tourId: 'puzzle-tour', delay: 300 },
    //{ route: '/index-exercices', tourId: 'index-exercices-tour', delay: 1000 }
  ],
  
  // Configuration globale
  settings: {
    // Désactiver les tours automatiques (l'utilisateur peut les lancer manuellement)
    disableAutoTours: false,
    // Exclure les routes d'exercices et puzzles du système automatique car gérées manuellement
    excludeAutoTours: ['/theme/:themeId/exercices/:exerciseNumber?', '/exercices/:exerciseId?', '/puzzles/:puzzleId?'],
    
    // Réinitialiser les tours après X jours
    resetAfterDays: 200
  }
}

// Export de tous les tours
export const allTours = [
  dashboardTour,
  exerciseTour,
  puzzleTour,
  //indexExercicesTour
] 