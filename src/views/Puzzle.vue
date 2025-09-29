<script setup lang="ts">
import { ref, onMounted, computed, inject, watch } from "vue";
import { BoardApi, TheChessboard } from "vue3-chessboard";
import { usePuzzleStore } from "../stores/puzzle";
import "vue3-chessboard/style.css";
import "../assets/chessground.mtp.css";
import "../assets/chessground.pieces.css";
import { useRoute, useRouter } from "vue-router";
import { initialPuzzleBoardConfig } from "../config/Chessboard";
import Coordinates from "../components/Chessboard/Coordinates.vue";
import { useApi } from "../utils/useApi";

// Importer les tours
import { usePuzzleTours } from "../composables/useTours";

const route = useRoute();
const router = useRouter();
const puzzleStore = usePuzzleStore();

// Initialiser les tours
const { shouldShowPuzzleTour, startPuzzleTour } = usePuzzleTours();

const history = ref([]);
const historyIndex = ref(0);

const initialBoardConfig = {
  ...initialPuzzleBoardConfig,
  movable: {
    events: {
      after: (from: any, to: any) => {
        checkMove(from, to);
      },
    },
  },
};

let boardAPI: BoardApi;

const title = ref("");
const currentPuzzle = ref();

const isSuccessVisible = ref(false);
const isBravoVisible = ref(false);
const isFailedVisible = ref(false);

const newRating = ref(0);
const RatingVariation = ref(0);
const alreadyPlayed = ref(false);

const showSuccessPopup = () => {
  isSuccessVisible.value = true;
};
const showBravoPopup = () => {
  isBravoVisible.value = true;
};
const showFailedPopup = () => {
  isFailedVisible.value = true;
};

const isShaking = ref(false);

function warnShaking() {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 1500);
}

const checkMove = async (from: any, to: any) => {
  let move = boardAPI.getLastMove();

  if (move.color === currentPuzzle.value.turn.substring(0, 1)) {
    let isCorrectMove = puzzleStore.validateMove(move);

    if (isCorrectMove) {
      boardAPI.move(currentPuzzle.value.solution[puzzleStore.moveCount]);
      if (puzzleStore.isPuzzleComplete) puzzleSolved();
      else puzzleStore.increaseMoveCount();
    } else {
      puzzleFailed();
    }
  }
};

const loadBoard = (api: BoardApi) => {
  boardAPI = api;
  getPuzzle();
};

const loadPuzzle = () => {

  //boardAPI.resetBoard();

  isSuccessVisible.value = false;
  isBravoVisible.value = false;
  isFailedVisible.value = false;
  
  title.value = `THÈME : ${currentPuzzle?.value.theme_1}`;
  puzzleStore.setCurrentPuzzle(currentPuzzle.value);
  const config = JSON.parse(JSON.stringify(initialBoardConfig));

  config.orientation = (currentPuzzle.value as any).turn;
  config.turnColor = currentPuzzle.value.turn === "white" ? "black" : "white";
  config.movable.color = currentPuzzle.value.turn;

  //boardAPI.setConfig(initialBoardConfig, true);
  boardAPI.setConfig(config, false);
  boardAPI.setPosition(currentPuzzle.value.fen);
  boardAPI.move(currentPuzzle.value.firstMove);
  boardAPI.setConfig( { movable: { color: currentPuzzle.value.turn } }, false);

};

const puzzleSolved = async () => {
  const data = await puzzleStore.savePuzzleAttempt(true);
  let result = data.value as any;
  alreadyPlayed.value = result.already_played;
  updateElo(result.new_rating);
  showBravoPopup();
};

const puzzleFailed = async () => {
  warnShaking();
  //boardAPI.undoLastMove();
  const data = await puzzleStore.savePuzzleAttempt(false);

  let result = data.value as any;

  alreadyPlayed.value = result.already_played;

  if (result && result.new_rating) {
    updateElo(result.new_rating);
    showFailedPopup();
  }
};

const retryPuzzle = () => {
  isFailedVisible.value = false;
  getPuzzle(historyIndex.value);
}

const loadPreviousPuzzle = async () => {
  if( historyIndex.value > 0 ) {
    historyIndex.value--;
    getPuzzle( historyIndex.value );
  }
};

const nextPuzzle = () => {
  if( historyIndex.value < history.value.length - 1 ) {
    historyIndex.value++;
    getPuzzle(historyIndex.value);
  }
  else {
    getPuzzle();
  }
};



const updateElo = (rating) => {
  newRating.value = rating.new_rating;
  RatingVariation.value = rating.variation;
};

const emit = defineEmits(['update-page-info']);

// Mettre à jour le titre lorsque le puzzle change
watch(() => currentPuzzle.value, (newPuzzle) => {
  if (newPuzzle) {
    const title = `THÈME : ${newPuzzle.theme_1}`;
    emit('update-page-info', { name: 'puzzle', title });
  }
}, { immediate: true });

// ou simplement émettre lors du montage du composant
onMounted(async () => {
  // Lancer le tour de puzzle en premier si c'est la première visite
  if (shouldShowPuzzleTour()) {
    // Délai minimal pour laisser le DOM se charger
    setTimeout(() => {
      startPuzzleTour(false);
    }, 200);
  }
  
  // Check theme access before loading exercise
  const hasAccess = await checkThemeAccess();
  if( ! hasAccess ) {
    router.push('/');
    return;
  }
  emit('update-page-info', { name: 'puzzle', title: 'PUZZLES' });

});


const checkThemeAccess = async () => {
  
  try {
    const { data } = await useApi(`/themes/15/access`, {
      method: 'GET',
    });
    
    if (data && data.value && (data.value as any).hasAccess) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking theme access:", error);
    return false;
  }
};





const getPuzzle = async (puzzleIndex = null) => {

  let url = "/puzzles/get";
  let id = 0;
  if( puzzleIndex != null && puzzleIndex < history.value.length ) {
    id = history.value[puzzleIndex];
    url += "/" + id;
  }

  try {

    const { data } = await useApi(url, {
      method: "GET",
    });

    if (data) {
      let result = data.value as any;
      currentPuzzle.value = result.data;
      if( id == 0 )
      {
        history.value.push(currentPuzzle.value.id);
        historyIndex.value = history.value.length - 1;
      }
      else {
        historyIndex.value = puzzleIndex;
      }

      loadPuzzle();
    }
  } catch (error) {
    console.error("Error loading Puzzle:", error);
  }
};



</script>

<template>
  <div class="mt-3 flex flex-col">
    <div class="flex-1 flex items-center justify-center">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
        <div class="w-full h-full">
          <div class="px-4 sm:p-6 w-full h-full">
            <div
              class="w-full h-full"
              id="chessboard-container"
              style="max-height: calc(80vh - 100px)"
            >
              <div
                class="flex justify-center chessboard matoupion stone"
                :class="{ shake: isShaking }"
              >
                <Coordinates :turn="currentPuzzle?.turn" />
                <TheChessboard
                  :board-config="initialBoardConfig"
                  @board-created="loadBoard"
                  :player-color="currentPuzzle?.turn"
                  class="w-full h-full"
                />
              </div>

              <div class="puzzle-turn mb-2">
                Aux {{ currentPuzzle?.turn == "white" ? "blancs" : "noirs" }} de
                jouer
              </div>

              <div class="flex justify-center gap-10 mt-1">
                <button :disabled="historyIndex == 0" @click="loadPreviousPuzzle">
                  <span class="text-6xl" style="color:rgb(233, 136, 25);">⬅</span>
                </button>

                <button @click="getPuzzle">
                  <span class="text-6xl" style="color:rgb(233, 136, 25);">➡</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Popup for Bravo -->
    <div
      v-if="isBravoVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-white"
    >
    <div class="relative w-full max-w-[791px] h-[706px] bg-[url('/images/popups/popup_bravo.png')] bg-no-repeat"
      style="background-size: 100% 100%;">
           
        <!-- Content positioned absolutely over the background -->
        <div
          class="absolute inset-0 flex flex-col items-center"
          style="margin-top: 255px"
        >
          <h2 class="font-bold text-2xl md:text-4xl">Bravo</h2>
        </div>
        <div class="absolute inset-0 flex flex-col items-center justify-center px-8">
          <p class="font-bold text-center text-xl md:text-2xl mt-[200px]">
            Tu as réussi ce puzzle, <br />tu peux passer au suivant
          </p>
          <div class="mt-[50px] flex gap-2">
            <p v-if=" ! alreadyPlayed" class="font-bold text-center text-xl md:text-2xl">
              Tu as gagné {{ RatingVariation }} points Elo <br />

              Ton nouveau classement est de {{ newRating }} Elo
            </p>

            <p v-else class="font-bold text-center text-xl md:text-2xl">
              Ton Elo ne varie pas car tu avais déjà fait ce puzzle
            </p>
          </div>
        </div>
        <div
          class="absolute inset-0 flex flex-col items-center align-center text-center justify-end mb-10"
        >
          <button
            @click="nextPuzzle"
            class="px-6 py-2 text-white font-bold shadow-md transition-colors cta"
            style="
              background-image: url('/images/buttons/bouton_lg.svg');
              background-size: cover;
              background-repeat: no-repeat;
              width: 191.31px;
              height: 71.69px;
            "
          >
            SUIVANT
          </button>
        </div>
      </div>
    </div>

    <!-- Popup for Failed -->
    <div
      v-if="isFailedVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-white"
    >
      <div class="relative w-full max-w-[791px] h-[706px] bg-[url('/images/popups/popup_standard.png')] bg-no-repeat"
        style="background-size: 100% 100%;">

        <!-- Content positioned absolutely over the background -->
        <div
          class="absolute inset-0 flex flex-col items-center"
          style="margin-top: 70px"
        >
          <h2 class="font-bold text-2xl md:text-4xl">Dommage</h2>
        </div>
        <div class="absolute inset-0 flex flex-col items-center justify-center px-8">
          <p class="font-bold text-center text-xl md:text-2xl mt-[50px]">
           Oups tu t'es trompé ! <br />tu feras mieux la prochaine
            fois
          </p>
          <div class="mt-[50px] flex gap-2">
             <p v-if=" ! alreadyPlayed" class="font-bold text-center text-xl md:text-2xl">
              Tu as perdu {{ RatingVariation }} points Elo <br />
              Ton nouveau classement est de {{ newRating }} Elo
            </p>
            <p v-else class="font-bold text-center text-xl md:text-2xl">
              Ton Elo ne varie pas car tu avais déjà fait ce puzzle
            </p>
          </div>
        </div>
        <div
          class="absolute inset-0 flex flex-col items-center align-center text-center justify-end mb-10"
        >
        <div class="flex gap-2 flex-wrap justify-center">
           <button
            @click="retryPuzzle"
            class="px-6 py-2 text-white font-bold shadow-md transition-colors cta"
            style="
              background-image: url('/images/buttons/bouton_lg.svg');
              background-size: cover;
              background-repeat: no-repeat;
              width: 191.31px;
              height: 71.69px;
              padding-bottom: 12px;
            "
          >
            RECOMMENCER
          </button>
          <button
            @click="nextPuzzle"
            class="px-6 py-2 text-white font-bold shadow-md transition-colors cta"
            style="
              background-image: url('/images/buttons/bouton_lg.svg');
              background-size: cover;
              background-repeat: no-repeat;
              width: 191.31px;
              height: 71.69px;
              padding-bottom: 12px;
            "
          >
            SUIVANT
          </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#chessboard-container {
  width: 100%;
  aspect-ratio: 1;
  max-width: min(80vh, 700px);
  margin: 0 auto;
}

/* Assurez-vous que le composant TheChessboard conserve son ratio carré */
:deep(.vue3-chessboard) {
  width: 100% !important;
  height: 100% !important;
}

.puzzle-turn {
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  color: white;
  width: 100%;
}
</style>
