<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useApi } from "../../utils/useApi";
import { ListBulletIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
  exercise: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['loadExercise']);

const localExercise = ref({ ...props.exercise });
const solutionInput = ref('');
const levels = ref<any[]>([]);
const themes = ref<any[]>([]);
const isLoading = ref(true);

const defaultExercise = {
  fen: "fen",
  turn: "white",
  instruction: "",
  hint: "",
  type_exercice: "move",
  nb_moves: 0,
  take_possible: null,
  solution: [],
  level_id: 1,
  theme_id: 1,
  num_exercice: 1,
  id: null
};

// Fetch levels and themes
async function fetchLevels() {
  try {
    const { data } = await useApi('/levels', { method: 'GET' });

    if (data.value && Array.isArray(data.value)) {
      levels.value = data.value;

    }
  } catch (error) {
    console.error('Error fetching levels:', error);
  }
}

async function fetchThemes() {
  try {
    const { data } = await useApi('/themes', { method: 'GET' });

    if (data.value && Array.isArray(data.value)) {
      themes.value = data.value;

    }
  } catch (error) {
    console.error('Error fetching themes:', error);
  } finally {
    isLoading.value = false;
  }
}

// Navigation logic
const hasPreviousExercise = computed(() => {
  if (localExercise.value?.id == 1) return false;
  return true;
});

const hasNextExercise = computed(() => {
  if (localExercise.value?.id == 127) return false;
  return true;
});

const getNextExerciseId = computed(() => {
  if (!hasNextExercise.value) return null;
  return localExercise.value.id + 1;
});

const getPreviousExerciseId = computed(() => {
  if (!hasPreviousExercise.value) return null;
  return localExercise.value.id - 1;
});

function navigateToPrevious() {
  if (!hasPreviousExercise.value) return;
  emit('loadExercise', getPreviousExerciseId.value);
}

function navigateToNext() {
  if (!hasNextExercise.value) return;
  emit('loadExercise', getNextExerciseId.value);
}

// Mettre à jour localExercise quand l'exercice change
watch(() => props.exercise, (newExercise) => {
  if (JSON.stringify(localExercise.value.id) !== JSON.stringify(newExercise.id)) {
    localExercise.value = { ...newExercise };

    if( newExercise )
    {
     if (Array.isArray(newExercise.solution[0]))
      {
        let variants = [];
        newExercise.solution.forEach(variant => {
          variants.push(variant.join(', ') || '');
        });
        solutionInput.value = variants.join('|');
      }
      else solutionInput.value = newExercise?.solution.join(', ') || '';
    }
    
  }
}, { deep: true });

onMounted(async () => {

   if( localExercise )
    {
      /*console.log('localExercise');
      console.log(localExercise.value);
      console.log(localExercise.value.solution);*/
      if (Array.isArray(localExercise.value.solution[0]))
      {
      //  console.log(localExercise.value.solution[0]);
        let variants = [];
        localExercise.value.solution.forEach(variant => {
          variants.push(variant.join(', ') || '');
        });
      // console.log(variants);
        solutionInput.value = variants.join('|');
      }
      else solutionInput.value = localExercise.value?.solution.join(', ') || '';
    }

  await fetchLevels();
  await fetchThemes();
})

// Fonction pour préparer un nouvel exercice
function prepareNewExercise(): void {
  localExercise.value = { ...defaultExercise };
  solutionInput.value = '';
}

// Fonction pour sauvegarder un exercice (nouveau ou existant)
async function saveExerciseChanges(): Promise<void> {
  if (!localExercise.value) return;
  
  let solutionsArray = []

  // if solutionInput is a string with |, split it into an array
  if (solutionInput.value.includes('|')) {

    solutionsArray = solutionInput.value.split('|').map(
      item => {
        return item.split(',').map(item => item.trim());
      }
    );
    console.log(solutionsArray);

  }
  else {
    solutionsArray = solutionInput.value.split(',').map(item => item.trim());
  }

  
  try {
    let url, method;
    
    // Si c'est un nouvel exercice (sans id)
    if (!localExercise.value.id) {
      url = '/exercises/create';
      method = 'POST';
    } else {
      url = `/exercises/save/${localExercise.value.id}`;
      method = 'PUT';
    }
    
    const body: any = {
      fen: localExercise.value.fen,
      turn: localExercise.value.turn,
      instruction: localExercise.value.instruction,
      hint: localExercise.value.hint,
      type_exercice: localExercise.value.type_exercice,
      nb_moves: localExercise.value.nb_moves,
      solution: solutionsArray,
      level_id: localExercise.value.level_id,
      theme_id: localExercise.value.theme_id,
      num_exercice: localExercise.value.num_exercice,
    };
      
    if (localExercise.value.take_possible !== null) {
      body.take_possible = localExercise.value.take_possible;
    }

    const { response, data } = await useApi(url, {
      method: method,
      body: JSON.stringify(body),
    });

    if (response.value.ok) {
      localExercise.value = (data.value as { data: any }).data;
      emit('loadExercise', localExercise.value.id);
      showSuccessMessage();
    } else {
      console.error('Erreur lors de la sauvegarde des modifications', response.value.status, data.value);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des modifications:', error);
  }
}

const successMessageVisible = ref(false);

const showSuccessMessage = () => {
  successMessageVisible.value = true;
  setTimeout(() => {
    successMessageVisible.value = false;
  }, 2000);
};

// Remplacer la fonction createNewExercise par prepareNewExercise
function createNewExercise(): void {
  prepareNewExercise();
}

function updateOptions(): void {
  let types = ['move', 'highlight', 'multiset', 'qcm'];
  if (types.includes(localExercise.value.type_exercice)) {
    localExercise.value.nb_moves = 0;
    localExercise.value.take_possible = null;
  } 
  if (localExercise.value.type_exercice === 'goto' ) {
    localExercise.value.take_possible = 0;
  }
}
</script>

<template>
  <div class="exercise-edit-form-container" style="max-width:500px; position: relative; z-index: 200;">
    <div class="w-full bg-white p-6 rounded-xl shadow-md" style="font-family: 'Roboto', sans-serif;">
      <div class="flex items-center mb-4">
        <div class="flex items-center">
          <button 
            @click="navigateToPrevious" 
            class="w-10 h-10 flex items-center justify-center text-3xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            :disabled="!hasPreviousExercise"
            :class="{ 'opacity-50 cursor-not-allowed': !hasPreviousExercise }"
          >
            &#8249;
          </button>
          <div class="text-lg font-bold text-black mx-2">Exercice {{ localExercise.id }}</div>
          <button 
            @click="navigateToNext" 
            class="w-10 h-10 flex items-center justify-center text-3xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            :disabled="!hasNextExercise"
            :class="{ 'opacity-50 cursor-not-allowed': !hasNextExercise }"
          >
            &#8250;
          </button>
        </div>
        <div class="ml-auto flex items-center">
          <button 
            @click="createNewExercise" 
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors mr-2"
          >
            Ajouter un exercice
          </button>
          <a 
            href="/index-exercices" 
            class="bg-blue-500 text-white h-[40px] px-3 flex items-center justify-center rounded-md hover:bg-blue-600 transition-colors"
            title="Liste des exercices"
          >
            <ListBulletIcon class="w-8 h-8" />
          </a>
        </div>
      </div>

      <form @submit.prevent="saveExerciseChanges" class="space-y-4">
        <div v-if="isLoading">Chargement des données...</div>
        
        <div class="flex space-x-1">
          <div class="flex-2">
            <label class="block text-sm font-medium text-gray-700">Level</label>
            <select 
              v-model="localExercise.level_id"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
            >
              <option v-for="level in levels" :key="`level-${level.id}`" :value="level.id">
                {{ level.name }} ({{ level.id }})
              </option>
              <!-- Fallback options if API fails -->
              <option v-if="levels.length === 0" v-for="i in 5" :key="`level-${i}`" :value="i">Level {{ i }}</option>
            </select>
          </div>

          <div class="flex-3">
            <label class="block text-sm font-medium text-gray-700">Thème</label>
            <select 
              v-model="localExercise.theme_id"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
            >
              <option v-for="theme in themes" :key="`theme-${theme.id}`" :value="theme.id">
                {{ theme.name }} ({{ theme.id }})
              </option>
              <!-- Fallback options if API fails -->
              <option v-if="themes.length === 0" v-for="i in 21" :key="`theme-${i}`" :value="i">Thème {{ i }}</option>
            </select>
          </div>
<!--
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700">Numéro d'exercice</label>
            <input 
              type="number" 
              v-model="localExercise.num_exercice"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
            >
          </div>
          -->
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">FEN</label>
          <input 
            type="text"
            v-model="localExercise.fen" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div class="flex space-x-1">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700">Turn</label>
            <select 
              v-model="localExercise.turn"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>

          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700">Type d'exercice</label>
            <select 
              v-model="localExercise.type_exercice"
              @change="updateOptions"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="move">Move</option>
              <option value="highlight">Highlight</option>
              <option value="take">Take</option>
              <option value="set">Set</option>
              <option value="goto">Goto</option>
              <option value="multiset">Multiset</option>
              <option value="qcm">QCM</option>
            </select>
          </div>

          
        </div>

           <div class="flex space-x-1">
<div class="flex-1">
            <label class="block text-sm font-medium text-gray-700">Nombre de coups</label>
            <input 
              type="number" 
              v-model="localExercise.nb_moves"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              :disabled="localExercise.type_exercice === 'move' || localExercise.type_exercice === 'highlight'"
            >
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700">Prise possible</label>
            <select 
              v-model="localExercise.take_possible"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              :disabled="localExercise.type_exercice !== 'goto'"
            >
              <option value="1">Oui</option>
              <option value="0">Non</option>
            </select>
          </div>
           </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Instruction</label>
          <textarea 
            v-model="localExercise.instruction" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows="3"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Indice</label>
          <textarea 
            v-model="localExercise.hint" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows="3"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Solution</label>
          <textarea 
            v-model="solutionInput"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="e.g. e2,e4,d7,d5"
            rows="2"
          ></textarea>
        </div>

        <button 
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Sauvegarder les modifications
        </button>
        <span v-if="successMessageVisible" class="text-green-500 ml-2">
          ✔️
        </span>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Ensure text is visible in select dropdowns */
select, input, textarea {
  color: black;
  background-color: white;
}

.exercise-edit-form-container {
  position: relative;
  z-index: 200; /* Plus élevé que le z-index du logo (100) */
}

/* Style pour les inputs et selects désactivés */
input:disabled,
select:disabled {
  background-color: #f5f5f5;    /* Fond grisé */
  color: #999;                  /* Texte grisé */
  border: 1px solid #ddd;       /* Bordure plus claire */
  cursor: not-allowed;          /* Curseur spécifique */
  opacity: 0.7;                 /* Légère transparence */
  box-shadow: none;             /* Suppression des ombres */
}

/* Option: ajouter une indication visuelle supplémentaire */
input:disabled,
select:disabled {
  position: relative;
}

/* Option: ajouter une bordure hachurée */
input:disabled,
select:disabled {
  border-style: dashed;
}
</style> 
