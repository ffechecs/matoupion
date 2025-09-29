<template>
  <div class="">
    <main class="relative">
      <!-- Desktop serpentin view (hidden on mobile) -->
      <div class="absolute inset-0 z-0 hidden lg:block">
        <img src="/images/dashboard/serpentin_mtp.png" alt="" class="absolute inset-0 w-full h-full object-contain" />
      </div>

      <!-- Desktop layout with absolute positioning -->
      <div class="relative z-10 px-4 py-6 hidden lg:block">
        <div class="relative mx-auto max-w-[1228px] w-full min-h-[921.6px]">
          <div v-for="theme in themes" 
               :key="theme.id"
               :style="getThemePosition(theme.id)"
               class="absolute w-28 h-28 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
               @click="theme.unlocked && goToTheme(theme)">
            <div class="relative ">
              <img 
                :src="`/images/dashboard/niveaux_${getIconTheme(theme.id)}.png`" 
                :class="[
                  'w-24 h-24 transition-all duration-300', 
                  theme.unlocked ? 'opacity-100 hover:scale-110' : 'opacity-50 cursor-not-allowed'
                ]" 
                :alt="theme.name" 
              />
              <span class="absolute top-12 left-1/2 -translate-x-1/2 text-white font-spenbeb text-xl">{{ theme.id }}</span>
              <div class="absolute -bottom-3   flex">
                <template v-for="exercice in theme.exercices" :key="exercice.id">
                  <img 
                    :src="`/images/dashboard/${exercice.solved ? 'etoile_pleine' : 'etoile_vide'}.png`"
                    class="w-4 h-4"
                    alt=""
                  />
                </template>
              </div>
            </div>
          </div>

          <div 
            style="left: 80%; top: 88%;"
            class="absolute w-28 h-28 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            @click="goToPuzzles()">
            <div class="relative ">
              <img 
                :src="`/images/dashboard/puzzle.png`" 
                :class="[
                  'w-28 h-24 transition-all duration-300', 
                  puzzlesUnlocked ? 'opacity-100 hover:scale-110' : 'opacity-50 cursor-not-allowed'
                ]" 
              />
              <span class="absolute top-10 left-20 -translate-x-1/2 text-white font-spenbeb text-lg text-base/5">{{ puzzlesCompleted }}
                <span class="text-white font-spenbeb text-xs"><br>Puzzles</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile layout (grid with 2 per row) -->
      <div class="relative z-10 px-4 py-6 block lg:hidden">
        <div class="grid grid-cols-2 sm:grid-cols-3 mx-auto gap-x-20 gap-y-5 w-fit">
          <div v-for="theme in themes" 
               :key="theme.id"
               class="flex flex-col items-center cursor-pointer w-fit"
               @click="theme.unlocked && goToTheme(theme)">
            <div class="relative">
              <img 
                :src="`/images/dashboard/niveaux_${getIconTheme(theme.id)}.png`" 
                :class="[
                  'w-20 h-20 transition-all duration-300', 
                  theme.unlocked ? 'opacity-100 hover:scale-110' : 'opacity-50 cursor-not-allowed'
                ]" 
                :alt="theme.name" 
              />
              <span class="absolute top-8 left-1/2 -translate-x-1/2 text-white font-spenbeb text-lg">{{ theme.id }}</span>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 flex justify-center">
                <template v-for="exercice in theme.exercices" :key="exercice.id">
                  <img 
                    :src="`/images/dashboard/${exercice.solved ? 'etoile_pleine' : 'etoile_vide'}.png`"
                    class="w-3 h-3 mx-px"
                    alt=""
                  />
                </template>
              </div>
            </div>
          </div>
          <!-- Puzzles button for mobile -->
          <div class="flex flex-col items-center cursor-pointer"
               @click="goToPuzzles()">
            <div class="relative">
              <img 
                :src="`/images/dashboard/puzzle.png`" 
                :class="[
                  'w-20 h-20 transition-all duration-300', 
                  puzzlesUnlocked ? 'opacity-100 hover:scale-110' : 'opacity-50 cursor-not-allowed'
                ]" 
              />
              <span class="absolute top-7 left-16 -translate-x-1/2 text-white font-spenbeb text-lg">{{ puzzlesCompleted }}
                <span class="text-white font-spenbeb text-xs"><br>Puzzles</span>

              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useApi } from '../utils/useApi'
import { $api } from '../utils/api'
import { useDashboardTours } from '../composables/useTours'

// Define the emits and store the emit function in a variable
const emit = defineEmits(['update-page-info'])

onMounted(() => {
  // Now use the emit function returned by defineEmits
  emit('update-page-info', { name: 'dashboard', title: '' });
  
  // Rest of your onMounted logic...
  loadThemes();
})

// Function to load themes separately for cleaner code
const loadThemes = async () => {
  try {
    const response = await $api('/exercises/progress', {
      method: 'GET'
    })

    if (response.themes) {
      themes.value = response.themes
    }

     puzzlesUnlocked.value = response.puzzlesUnlocked

    if(response.puzzlesCompleted) {
      puzzlesCompleted.value = response.puzzlesCompleted
    }
  } catch (error) {
    console.error('Erreur lors du chargement des thèmes:', error)
  }
}

const router = useRouter()
const authStore = useAuthStore()
const { user } = authStore
const { shouldShowWelcomeTour, startDashboardTour } = useDashboardTours()

interface Theme {
  id: number
  name: string
  order: number
  unlocked: boolean
  completed_exercises: number
  total_exercises: number
  progress: number,
  exercices: any[]
}

const puzzlesUnlocked = ref(true)
const puzzlesCompleted = ref(0)
const themes = ref<Theme[]>([])

// Positions prédéfinies pour chaque thème sur le serpentin
const themePositions = {
  1: { left: '12%', top: '20%' },  // Premier thème en haut à gauche
  2: { left: '20%', top: '44%' },
  3: { left: '31%', top: '32%' },
  4: { left: '25%', top: '14%' },
  5: { left: '38%', top: '6%' },

  6: { left: '45%', top: '25%' },
  7: { left: '52%', top: '8%' },
  8: { left: '68%', top: '5%' },
  9: { left: '60%', top: '26%' },
  10: { left: '43%', top: '39%' },

  11: { left: '52%', top: '51%' },
  12: { left: '70%', top: '35%' },
  13: { left: '83%', top: '19%' },
  14: { left: '84%', top: '45%' },
  15: { left: '56%', top: '66%' },

  16: { left: '38%', top: '66%' },
  17: { left: '55%', top: '85%' },
  18: { left: '38%', top: '89%' },
  19: { left: '22%', top: '67%' },
  20: { left: '10%', top: '76%' },

  21: { left: '20%', top: '95%' }
}



const getThemePosition = (order: number) => {
  const position = themePositions[order] || { left: '0%', top: '0%' }
  return {
    left: position.left,
    top: position.top
  }
}

const goToTheme = (theme: Theme) => {
  if (theme.unlocked) {
    router.push(`/theme/${theme.id}/exercices`)
  }
}

const goToPuzzles = () => {
  if (puzzlesUnlocked.value) {
    router.push(`/puzzles`)
  }
}

const getIconTheme = (id: number) => {
  if( id <= 5 ) {
    return '1-5'
  } else if( id <= 10 ) {
    return '6-10'
  } else if( id <= 14 ) {
    return '11-14'
  } else if( id <= 18 ) {
    return '15-18'
  } else {
    return '19-21'
  }
}

</script>

<style scoped>
/* Ajouter des styles pour les animations si nécessaire */
.cursor-pointer:hover {
 cursor: pointer;
}
</style>
