<script setup lang="ts">
// utils
import { ref, onMounted, onUnmounted, computed, inject, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "../utils/useApi";
import { useAuthStore } from "../stores/auth";

//layout
// import Header from "../components/Layout/Header.vue";

//chess
import { Chess } from "chess.js";
import { BoardApi, TheChessboard, Piece } from "vue3-chessboard";
import { useExerciseStore } from "../stores/exercise";
import { initialExerciseBoardConfig } from "../config/Chessboard";
import "vue3-chessboard/style.css";
import "../assets/chessground.mtp.css";
import "../assets/chessground.pieces.css";
import Coordinates from "../components/Chessboard/Coordinates.vue";
import ChessPiece from "../components/Chessboard/Piece.vue";
import { addPieceToFen } from "../utils/fenUtils";

// popups
import InstructionPopup from "../components/Popups/InstructionPopup.vue";
import HintPopup from "../components/Popups/HintPopup.vue";
import SuccessNextTheme from "../components/Popups/SuccessNextTheme.vue";
import SuccessNextLevel from "../components/Popups/SuccessNextLevel.vue";
import SuccessNextExo from "../components/Popups/SuccessNextExo.vue";
import RetryPopup from "../components/Popups/RetryPopup.vue";
import FailedNextPopup from "../components/Popups/FailedNextPopup.vue";
import { animateInstructionTransition } from "../utils/animations";

// edit form
import ExerciseEditForm from "../components/Exercise/ExerciseEditForm.vue";

// import mitt from 'mitt';
// const emitter = mitt();

// Instead, import the shared emitter from the store
import { emitter } from "../stores/exercise";

// Ajouter l'import du nouveau composant
import CommentForm from "../components/Exercise/CommentForm.vue";

// Importer l'icône HeroIcon Check
import { CheckIcon } from '@heroicons/vue/24/solid';
import { h, render } from 'vue';

// Importer les tours
import { useExerciseTours } from "../composables/useTours";

const authStore = useAuthStore();
const { user } = authStore;
const route = useRoute();
const router = useRouter();
const exerciseId = computed(() => route.params.exerciseId);
const exerciseNumber = computed(() => route.params.exerciseNumber);
const themeId = computed(() => route.params.themeId);

// Initialiser les tours
const { shouldShowExerciseTour, startExerciseTour, getCurrentTour, isTourCompleted } = useExerciseTours();

// Variable pour tracking si le tour a été lancé
const tourHasBeenStarted = ref(false);
const tourHasEnded = ref(false);

const exerciseStore = useExerciseStore();
const title = ref("");
const currentExercise = ref();
const nextExercise = ref();
const instructionText = ref("");

const newTheme = ref("14");
const newLevel = ref("Cavalier");
const oldLevel = ref("Pion");

const undo = ref(false);
const indiceShown = ref(false);


const highlightedSquares = ref<string[]>([]);

let boardAPI: BoardApi;

const initialBoardConfig = {
  ...initialExerciseBoardConfig,
  movable: {
    color: "both",
    free: false,
    rookCastle: true,
    showDests: false,
    events: {
      after: (from: any, to: any) => {
        checkMove(from, to);
      },
    },
  },
};

const isPlacementMode = ref(false);
const isQcmMode = ref(false);
const piecesToPlace = ref<string[]>([]);

const isInstructionVisible = ref(false);
const isHintVisible = ref(false);
const isSuccessNextThemeVisible = ref(false);
const isSuccessNextExoVisible = ref(false);
const isSuccessNextLevelVisible = ref(false);
const isRetryVisible = ref(false);
const isFailedNextVisible = ref(false);

// Références pour l'animation
const popupRef = ref(null);
const instructionZoneRef = ref<HTMLElement | null>(null);

const handleInstructionClose = () => {
  isInstructionVisible.value = false;
};

const showInstructionPopup = () => {
  isInstructionVisible.value = true;
};

const showHintPopup = () => {
  indiceShown.value = true;
  isHintVisible.value = true;
};

const showSuccessNextThemePopup = () => {
  isSuccessNextThemeVisible.value = true;
};

const showSuccessNextLevelPopup = () => {
  isSuccessNextLevelVisible.value = true;
};

const showSuccessNextExoPopup = () => {
  isSuccessNextExoVisible.value = true;
};

const showRetryPopup = () => {
  isRetryVisible.value = true;
};

const showFailedNextPopup = () => {
  isFailedNextVisible.value = true;
};

const undoMove = () => {
  boardAPI.undoLastMove();
};

const isShaking = ref(false);

async function warnShaking() {
  isShaking.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isShaking.value = false;
}

emitter.on("warn_shaking", warnShaking);

const checkMove = async (from: any, to: any) => {

  const isCorrectMove = await exerciseStore.checkMove(from, to, boardAPI);


  if (exerciseStore.isExerciseComplete) {
    await exerciceSolved();
  } else if (exerciseStore.failedAttempts >= 2) {
    exerciceFailed();
  } else if (exerciseStore.failedAttempts > 0 && !isCorrectMove) {
    warnShaking();


    // if type == goto, reload starting position
    if (currentExercise.value.type_exercice == "goto") {
      // loadExercice();
      loadExercice(1);
    }

  }

  //return true;
};




const selectOption = (index: number) => {

  const isCorrectAnswer = currentExercise.value.solution[0] == index + 1;

  if( ! isCorrectAnswer) {
    exerciseStore.incrementFailedAttempts();
  }
  else {
    exerciceSolved();
  }

  if (exerciseStore.failedAttempts >= 2) {
    exerciceFailed();
  } else if (exerciseStore.failedAttempts > 0 && !isCorrectAnswer) {
    warnShaking();
  }
};

const eventMove = (move: any) => {};

const checkSet = async (shapes: any) => {
  const isCorrectDraw = await exerciseStore.checkDraw(shapes, boardAPI);
  
  if (!isCorrectDraw) {
    refreshPiecesToPlace();
  }

  if (exerciseStore.isExerciseComplete) {
    exerciceSolved();
  } else if (exerciseStore.failedAttempts >= 2) {
    exerciceFailed();
  } else if (exerciseStore.failedAttempts > 0 && !isCorrectDraw) {
    warnShaking();
  }
};

const checkMultiset = async (shapes: any) => {
  let pat = exerciseStore.checkMultiset(boardAPI);

  if (exerciseStore.isExerciseComplete) {
    exerciceSolved();
  } else if (exerciseStore.failedAttempts >= 2) {
    exerciceFailed();
  } else if (exerciseStore.failedAttempts > 0 && !pat) {
    warnShaking();
    //pause 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    refreshPiecesToPlace();

    boardAPI.setPosition(currentExercise.value.fen);
    exerciseStore.updateChessgame(currentExercise.value.fen);
  }
};

const draggedPiece = ref<string | null>(null);
const draggedPieceIndex = ref<number | null>(null);

const handlePieceDragStart = (event: any, piece: string, index: number) => {

  if( ! ["set", "multiset"].includes(currentExercise.value.type_exercice)) {
   return;
  }

  draggedPiece.value = piece;

  draggedPieceIndex.value = index;

  // Set dataTransfer data to make the drag operation work
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", piece);
    event.dataTransfer.effectAllowed = "move";
  }
};

const handlePieceDragEnd = (event: any) => {
  // The dragend event doesn't provide drop target information
  // We'll handle actual placement in the drop event listener
};

const handleBoardDrop = (event: any) => {
  event.preventDefault();

    if( ! ["set", "multiset"].includes(currentExercise.value.type_exercice)) {
   return;
  }

  if (!draggedPiece.value || draggedPieceIndex.value === null) return;

  // Get the coordinates of the drop
  const boardRect = document.querySelector(".cg-wrap")?.getBoundingClientRect();
  if (!boardRect) return;

  // Calculate relative position within the board
  const x = event.clientX - boardRect.left;
  const y = event.clientY - boardRect.top;

  // Convert position to square (a1, e4, etc.)
  const boardSize = boardRect.width;
  const squareSize = boardSize / 8;

  // Determine file and rank based on board orientation
  const orientation = currentExercise.value?.turn || "white";

  let fileIndex = Math.floor(x / squareSize);

  let rankIndex = Math.floor(y / squareSize);

  if (orientation === "black") {
    fileIndex = 7 - fileIndex;
    // rankIndex = 7 - rankIndex;
  } else {
    rankIndex = 7 - rankIndex;
  }
  const file = String.fromCharCode(97 + fileIndex); // 97 is ASCII for 'a'
  const rank = rankIndex + 1;
  const square = `${file}${rank}`;

  // Remove the piece from piecesToPlace
  if (draggedPieceIndex.value !== null) {
    piecesToPlace.value.splice(draggedPieceIndex.value, 1);
  }



  if (currentExercise.value.type_exercice == "set") {
    const shapes = [];
    shapes.push({ orig: square });
    checkSet(shapes);
  } else if (currentExercise.value.type_exercice == "multiset") {
    exerciseStore.addPieceForPat(draggedPiece.value, square, boardAPI);

    if (piecesToPlace.value.length == 0) {
      checkMultiset(boardAPI);
    }
  }

  // Reset draggedPiece
  draggedPiece.value = null;
  draggedPieceIndex.value = null;
};

// Ajout de la fonction pour détecter le clic sur l'échiquier
const handleBoardClick = async (event: MouseEvent | TouchEvent) => {
  event.preventDefault();

    if( ! ["highlight"].includes(currentExercise.value.type_exercice)) {
   return;
  }

  // Récupérer le conteneur de l'échiquier
  const boardRect = document.querySelector(".cg-wrap")?.getBoundingClientRect();
  if (!boardRect) return;

  // Calculer la position relative dans l'échiquier

  let clientX: number, clientY: number;

  if (event instanceof TouchEvent) {
    const touch = event.changedTouches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const x = clientX - boardRect.left;
  const y = clientY - boardRect.top;


  // Convertir la position en coordonnées de case (a1, e4, etc.)
  const boardSize = boardRect.width;
  const squareSize = boardSize / 8;

  // Déterminer la colonne et la rangée en fonction de l'orientation
  const orientation = currentExercise.value?.turn || "white";

  let fileIndex = Math.floor(x / squareSize);
  let rankIndex = Math.floor(y / squareSize);

  if (orientation === "black") {
    fileIndex = 7 - fileIndex;
    // rankIndex reste inchangé comme dans handleBoardDrop
  } else {
    rankIndex = 7 - rankIndex;
  }
  
  const file = String.fromCharCode(97 + fileIndex); // 97 est le code ASCII pour 'a'
  const rank = rankIndex + 1;
  const square = `${file}${rank}`;

  // Ajouter l'icône HeroIcon Check sur la case

  highlightedSquares.value.push(square);
  let goodSquare = exerciseStore.checkHighlight(highlightedSquares.value);

  if (goodSquare) {
    addCheckIconToSquare(square, boardRect, squareSize, fileIndex, rankIndex, true);

    if(exerciseStore.isExerciseComplete) {
      exerciceSolved();
    }
  }
  else {
    addCheckIconToSquare(square, boardRect, squareSize, fileIndex, rankIndex, false);
    
    warnShaking();
    highlightedSquares.value.pop();
    await new Promise((resolve) => setTimeout(resolve, 500));
    //pause 2 seconds
    removeCheckIconFromSquare(square);
    if (exerciseStore.failedAttempts >= 2)     exerciceFailed();
  }

};

// Fonction pour ajouter une icône HeroIcon Check sur une case
const addCheckIconToSquare = (square: string, boardRect: DOMRect, squareSize: number, fileIndex: number, rankIndex: number, isGood: boolean) => {
  // Vérifier si une icône existe déjà sur cette case
  const squareId = `check-icon-${square}`;
  const existingIcon = document.getElementById(squareId);
  
  // Si une icône existe déjà sur cette case, ne rien faire
  if (existingIcon) return;
  
  // Calculer la taille de l'icône (80% de la largeur de la case)
  const iconSize = Math.floor(squareSize * 0.8);
  
  // Créer un conteneur pour l'icône
  const iconContainer = document.createElement('div');
  iconContainer.className = 'square-check-icon';
  iconContainer.id = squareId; // Ajouter un ID unique basé sur la case
  iconContainer.style.position = 'absolute';
  iconContainer.style.zIndex = '10';
  iconContainer.style.width = `${iconSize}px`;
  iconContainer.style.height = `${iconSize}px`;
  
  // Positionner l'icône au centre de la case
  // Ajuster la position en fonction de l'orientation
  const orientation = currentExercise.value?.turn || "white";
  let leftPos, topPos;
  
  // Calculer le décalage pour centrer l'icône dans la case (moitié de la différence entre taille de case et taille d'icône)
  const offset = (squareSize - iconSize) / 2;
  
  if (orientation === 'black') {
    leftPos = (7 - fileIndex) * squareSize + offset;
    topPos = rankIndex * squareSize + offset;
  } else {
    leftPos = fileIndex * squareSize + offset;
    topPos = (7 - rankIndex) * squareSize + offset;
  }
  
  iconContainer.style.left = `${leftPos}px`;
  iconContainer.style.top = `${topPos}px`;
  
  // Créer et rendre l'icône - un Check vert si correct, une croix rouge si incorrect
  let vnode;
  
  if (isGood) {
    // Icône check verte pour les bons coups
    vnode = h(CheckIcon, { 
      class: 'w-full h-full text-green-500',
      style: 'filter: drop-shadow(0px 0px 2px white); stroke-width: 2.5;' // Trait plus épais
    });
  } else {
    // Créer une croix rouge pour les mauvais coups (utilisant SVG brut)
    vnode = h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      class: 'w-full h-full text-red-500',
      stroke: 'currentColor',
      style: 'filter: drop-shadow(0px 0px 2px white); stroke-width: 2.5;'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M6 18L18 6M6 6l12 12'
      })
    ]);
  }
  
  render(vnode, iconContainer);
  
  // Ajouter l'icône au conteneur de l'échiquier
  const chessboardContainer = document.querySelector('.cg-wrap');
  if (chessboardContainer) {
    chessboardContainer.appendChild(iconContainer);
  }
 
};

// Fonction pour effacer toutes les icônes (au besoin)
const clearAllCheckIcons = () => {
  const icons = document.querySelectorAll('.square-check-icon');
  icons.forEach(icon => icon.remove());
};

// Mettre à jour la fonction setupBoardDropEvents pour aussi gérer les clics
const setupBoardDropEvents = () => {
  nextTick(() => {
    const board = document.querySelector(".cg-wrap");
    if (board) {
      board.addEventListener("dragover", (e) => {
        e.preventDefault(); // Autoriser le drop
      });
      board.addEventListener("drop", handleBoardDrop);
    }
  });
};

const setupBoardClickEvents = () => {
  nextTick(() => {
    const board = document.querySelector(".cg-wrap");
    if (board) {

      // Remove existing ones
      board.removeEventListener("click", handleBoardClick);
      board.removeEventListener("touchend", handleBoardClick);
      
      board.addEventListener("click", handleBoardClick);
      board.addEventListener("touchend", handleBoardClick);
    }
  });
};


const loadBoard = (api: BoardApi) => {
  boardAPI = api;
  getExerciseData();

};

const exerciceFailed = async () => {
  try {
    const { data } = await useApi(
      `/exercises/${currentExercise.value.id}/attempt`,
      {
        method: "POST",
        body: JSON.stringify({
          success: false,
          retry_count: exerciseStore.retryCount,
        }),
      }
    );

    let result = data.value as any;

    // show popup with retry button
    if (exerciseStore.retryCount < 1) {
      showRetryPopup();
    } else {
      if (result.next_exercise) {
        nextExercise.value = result.next_exercise;
        showFailedNextPopup();
      }
    }
  } catch (error) {
    console.error("Error saving failed attempt:", error);
  }
};

const retryExercise = () => {
  isRetryVisible.value = false;
  loadExercice();
};

const refreshPiecesToPlace = () => {
  piecesToPlace.value = [];

  if (currentExercise.value.type_exercice == "set") {
    let pieceToPlace = currentExercise.value.solution[0];
    pieceToPlace =
      currentExercise.value.turn == "white"
        ? pieceToPlace.toUpperCase()
        : pieceToPlace.toLowerCase();

    piecesToPlace.value.push(pieceToPlace);
  }

  if (currentExercise.value.type_exercice == "multiset") {
    currentExercise.value.solution.forEach((piece: any) => {
      piece =
        currentExercise.value.turn == "white"
          ? piece.toUpperCase()
          : piece.toLowerCase();

      piecesToPlace.value.push(piece);
    });
  }
};

const loadExercice = (failedAttempts: number = 0) => {
  indiceShown.value = false;

  boardAPI.clearBoard();
  boardAPI.resetBoard();

  title.value = `THÈME ${currentExercise.value?.theme_id} : ${currentExercise.value?.theme_name}`;
  emitter.emit("update-title", { title: title.value });

  highlightedSquares.value = [];
  currentExercise.value.move_count = 0;
  exerciseStore.setCurrentExercise(currentExercise.value);

  if (failedAttempts == 1) {
    exerciseStore.incrementFailedAttempts();
  }

  const config = JSON.parse(JSON.stringify(initialBoardConfig));

  config.orientation = currentExercise.value.turn;
  config.turnColor = currentExercise.value.turn;
  config.movable.color = currentExercise.value.turn;

  if (
    ["highlight", "set", "multiset", "qcm"].includes(currentExercise.value.type_exercice)
  ) {
     config.drawable.enabled = false;
    config.movable.free = false;
    config.selectable.enabled = false;
    config.draggable.enabled = false;
  }

  if (["set", "multiset"].includes(currentExercise.value.type_exercice)) {
    isPlacementMode.value = true;
    refreshPiecesToPlace();
  }

  if( ["set", "multiset"].includes(currentExercise.value.type_exercice)) {
    setupBoardDropEvents();
  }

  if( ["highlight"].includes(currentExercise.value.type_exercice)) {
    setupBoardClickEvents();
  }
  
  if (currentExercise.value.type_exercice == "qcm") {
    isQcmMode.value = true;
  }

  boardAPI.setConfig(config, false);
  boardAPI.setPosition(currentExercise.value.fen);

  
  if( currentExercise.value.type_exercice != "qcm") {
    boardAPI.setConfig({    highlight: { lastMove: true, check: true}});
  }  


  boardAPI.setConfig({ movable: { color: currentExercise.value.turn } });

    if (currentExercise.value && currentExercise.value.instruction) {
      instructionText.value = currentExercise.value.instruction;
    }

  // Ne plus afficher automatiquement les instructions
  // Elles s'afficheront après la fin du tour ou si pas de tour
  if (!route.meta.verif && failedAttempts == 0 && tourHasEnded.value) {
    isInstructionVisible.value = true;
  }


  if( currentExercise.value.type_exercice == "goto") {
 // let destination = currentExercise.value.solution[1];
   // with the coordinates, highlight the destination square without using the boardAPI
  }


  // Emit title update to Header component
  emitter.emit("update-title", { title: title.value });
};

const exerciceSolved = async () => {
  try {
    const { data } = await useApi(
      `/exercises/${currentExercise.value.id}/attempt`,
      {
        method: "POST",
        body: JSON.stringify({
          success: true,
        }),
      }
    );

    let result = data.value as any;

    if (result.next_exercise) {
      nextExercise.value = result.next_exercise;
    }

    if (result.goto_next_level) {
      newLevel.value = result.next_level.name;
      oldLevel.value = result.old_level;
      showSuccessNextLevelPopup();
    } else if (result.goto_next_theme) {
      newTheme.value = result.next_theme.id;
      showSuccessNextThemePopup();
    } else {
      showSuccessNextExoPopup();
    }
  } catch (error) {
    console.error("Error saving exercise attempt:", error);
  }
};

const closePopup = () => {
  isInstructionVisible.value = false;
  isSuccessNextThemeVisible.value = false;
  isSuccessNextExoVisible.value = false;
  isSuccessNextLevelVisible.value = false;
  isFailedNextVisible.value = false;
  isRetryVisible.value = false;
};

const loadNextExercise = () => {
  closePopup();
  if (!route.meta.verif) {
    if (nextExercise.value) {
      currentExercise.value = nextExercise.value;
      routeToExercise();
    }
  }
  loadExercice();
};

const checkThemeAccess = async () => {
  if (!themeId.value) return true;

  try {
    const { data } = await useApi(`/themes/${themeId.value}/access`, {
      method: "GET",
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

// Fonction pour afficher les instructions après le tour
const showInstructionsAfterTour = () => {
  console.log('showInstructionsAfterTour appelée');
  tourHasEnded.value = true;
  if (currentExercise.value && currentExercise.value.instruction && !route.meta.verif) {
    console.log('Conditions OK, affichage instructions');
    setTimeout(() => {
      isInstructionVisible.value = true;
    }, 300);
  }
};

onMounted(async () => {
  // Lancer le tour d'exercice en premier si c'est la première visite
  if (shouldShowExerciseTour()) {
    tourHasBeenStarted.value = true;
    
    // Écouter les événements du tour
    window.addEventListener('tour-complete', showInstructionsAfterTour);
    window.addEventListener('tour-cancel', showInstructionsAfterTour);
    
    // Délai minimal pour laisser le DOM se charger
    setTimeout(() => {
      startExerciseTour(false);
    }, 200);
  } else {
    // Si pas de tour, marquer comme terminé pour afficher les instructions
    tourHasEnded.value = true;
  }

  // Check theme access before loading exercise
  const hasAccess = await checkThemeAccess();
  if (!hasAccess) {
    router.push("/");
    return;
  }
  getExerciseData();
});

onUnmounted(() => {
  // Nettoyer les event listeners
  window.removeEventListener('tour-complete', showInstructionsAfterTour);
  window.removeEventListener('tour-cancel', showInstructionsAfterTour);
});

const isNotEmpty = (value: any) => {
  return value != undefined && value != null && value != "";
};

const routeToExercise = () => {
  if (currentExercise.value) {
    let url_to_show = "";
    if (route.meta.verif)
      url_to_show = `/exercices/verif/${currentExercise.value.id}`;
    else
      url_to_show = `/theme/${currentExercise.value.theme_id}/exercices/${currentExercise.value.num_exercice}`;

    router.replace(url_to_show);
  }
};

const nextExerciseFromEditForm = (id: any) => {
  router.push(`/exercices/verif/${id}`);
  getExerciseData(id);
};

const getExerciseData = async (id: any = null) => {
  let url = "";
  let url_to_show = "";

  if (isNotEmpty(id)) {
    url = `/exercises/${id}`;
  } else if (isNotEmpty(exerciseId.value)) {
    url = `/exercises/${exerciseId.value}`;
  } else if (isNotEmpty(exerciseNumber.value)) {
    url = `/exercises/${themeId.value}/${exerciseNumber.value}`;
  } else {
    url = `/exercises/current/${themeId.value}`;
  }

  try {
    const { data } = await useApi(url, {
      method: "GET",
    });
    if (data) {
      currentExercise.value = (data.value as any).data;

      loadExercice();
    }
  } catch (error) {
    console.error("Error loading exercise:", error);
    router.push("/");
  }
};

const emit = defineEmits(["update-page-info"]);

// Mettre à jour le titre lorsque l'exercice change
watch(
  () => currentExercise.value,
  (newExercise) => {
    if (newExercise) {
      const title = `THÈME ${newExercise.theme_id} : ${newExercise.theme_name}`;
      emit("update-page-info", { name: "exercise", title });
    }
  },
  { immediate: true }
);

// Add this watcher to detect route changes (like browser back button)
watch(
  () => route.params,
  (newParams) => {
    // Only reload if we're in verification mode and the exerciseId has changed
    if (route.meta.verif && newParams.exerciseId) {
      getExerciseData(newParams.exerciseId);
    }
  },
  { deep: true }
);

// Watcher pour détecter quand le tour se termine
watch(
  () => getCurrentTour(),
  (currentTour, previousTour) => {
    console.log('Tour status change:', { currentTour, previousTour, tourHasBeenStarted: tourHasBeenStarted.value });
    
    // Si le tour était actif et maintenant il n'y en a plus, c'est qu'il s'est terminé
    if (tourHasBeenStarted.value && previousTour && !currentTour) {
      console.log('Tour terminé, affichage des instructions...');
      tourHasEnded.value = true;
      // Afficher les instructions après la fin du tour
      nextTick(() => {
        if (currentExercise.value && currentExercise.value.instruction && !route.meta.verif) {
          console.log('Affichage de la popup instruction');
          setTimeout(() => {
            isInstructionVisible.value = true;
          }, 300);
        } else {
          console.log('Conditions non remplies pour afficher instructions:', {
            hasExercise: !!currentExercise.value,
            hasInstruction: !!currentExercise.value?.instruction,
            isNotVerif: !route.meta.verif
          });
        }
      });
    }
  }
);

// Watcher alternatif utilisant isTourCompleted
watch(
  () => isTourCompleted('exercise-tour'),
  (isCompleted) => {
    if (tourHasBeenStarted.value && isCompleted && !tourHasEnded.value) {
      console.log('Tour complété détecté via isTourCompleted');
      tourHasEnded.value = true;
      nextTick(() => {
        if (currentExercise.value && currentExercise.value.instruction && !route.meta.verif) {
          setTimeout(() => {
            isInstructionVisible.value = true;
          }, 500);
        }
      });
    }
  }
);

// Fonction pour enlever l'icône d'une case spécifique
const removeCheckIconFromSquare = (square: string) => {
  const squareId = `check-icon-${square}`;
  const icon = document.getElementById(squareId);

  if (icon) {
    icon.remove();

    return true;
  }
  

  return false;
};
</script>

<template>
  <div class="flex flex-col">
    <div class="flex-1 flex items-start justify-center">


      <div v-if="currentExercise && user && user.admin && route.meta.verif">
        <ExerciseEditForm
          v-if="currentExercise"
          v-model:exercise="currentExercise"
          @loadExercise="nextExerciseFromEditForm"
        />
      </div>

      <!-- To Make Responsive -->

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-1 w-full">
        <div class="">
          <div class="sm:p-6">
            <div
              id="chessboard-container"
            >
              <div
                class="flex justify-center chessboard matoupion wood relative"
                :class="{ shake: isShaking }"
              >
                <!-- Turn indicator circle -->
                <div 
                  class="turn-indicator w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]" 
                  :class="currentExercise?.turn === 'white' ? 'white-turn' : 'black-turn'"
                ></div>

                <div
                  v-if="
                    currentExercise?.type_exercice === 'set' ||
                    currentExercise?.type_exercice === 'take' ||
                    currentExercise?.type_exercice === 'goto'
                  "
                  class="nb-moves w-full text-center"
                >
                  <div class="text-white sm:text-xl lg:text-2xl font-bold w-full -mt-2 sm:mt-0">
                   Coups joués : {{ currentExercise.move_count }} / {{ currentExercise.nb_moves }}
                  </div>
                </div>
                <Coordinates :turn="currentExercise?.turn" />
                <TheChessboard
                  :board-config="initialBoardConfig"
                  @board-created="loadBoard"
                  :player-color="currentExercise?.turn"
                  @move="eventMove"
                  class="w-full h-full"
                />
              </div>
            </div>

            <div
              class="flex items-center justify-between bg-wood p-4 rounded-xl shadow-xl sm:flex-row flex-col mx-[20px] sm:mx-0"
            >
              <!-- Piece placement interface with drag functionality -->
              <div
                v-if="isPlacementMode && piecesToPlace.length > 0"
                class="pieces-zone"
              >
                <div class="piece-to-place-container">
                  <div class="pieces-grid">
                    <div
                      v-for="(piece, index) in piecesToPlace"
                      :key="index"
                      class="piece-display max-w-[55px] max-h-[55px] md:max-h-[80px] md:max-w-[80px]"
                    >
                      <ChessPiece
                        :piece="piece"
                        :draggable="true"
                        @dragstart="
                          (event) => handlePieceDragStart(event, piece, index)
                        "
                        @dragend="handlePieceDragEnd"
                      />
                    </div>
                    <p class="text-white text-sm mt-2">
                      Glissez
                      {{
                        piecesToPlace.length > 1 ? "les pièces" : "la pièce"
                      }}
                      vers une case de l'échiquier
                     </p>
                  </div>
                </div>
              </div>
              <transition name="slide-down">
              <div class="flex flex-col">
                <div
                  ref="instructionZoneRef"
                  v-if="instructionText"
                  class="instruction-zone md:text-[1.2rem]  mt-1 p-2 md:p-4"
                  v-html="instructionText"
                ></div>

                <div v-if="isQcmMode">
                  <div class="qcm-zone">
                    <div class="qcm-options flex flex-wrap gap-2">
                      <div
                        v-for="(option, index) in currentExercise.solution?.slice(1)"
                        :key="index"
                        class="qcm-option"
                      >
                        <button class="qcm-option-button p-2 text-white w-[97px] h-[68px] font-bold text-xl"  @click="selectOption(index)"
                        style="background-image: url('/images/buttons/bouton_ok.png'); background-size: cover; padding-bottom: 15px; background-repeat: no-repeat;">
                          {{ option }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </transition>
              <button id="hint-button"
                class="w-[50px] h-[50px] min-h-[50px] min-w-[50px] md:w-[62px] md:h-[66px] md:min-w-[62px] md:min-h-[66px] flex items-center justify-end"
                @click="showHintPopup"
              >
                <img
                  :src="indiceShown ? '/images/buttons/bouton_indice_off.png' : '/images/buttons/bouton_indice.png'"
                  alt="Bouton pour afficher un indice"
                />
              </button>
     
            </div>

            <div
              v-if="!route.meta.verif"
              class="stars-sidebar w-fit h-fit -translate-y-2/4 fixed -bottom-[5%] md:top-[50%] flex flex-col justify-center items-center gap-2 mr-4 ">
              <template
                v-if="currentExercise?.all_exercices"
                v-for="exercise in currentExercise.all_exercices"
                :key="exercise.id"
              >
                <div
                  class="star-container"
                  :class="{ active: exercise.id === currentExercise.id }"
                >
                  <a :href="`/theme/${themeId}/exercices/${exercise.num_exercice}`">
                    <img
                      :src="
                        exercise.solved
                          ? '/images/stars/etoile_pleine.png'
                          : '/images/stars/etoile_vide.png'
                      "
                      :alt="exercise.solved ? 'Étoile pleine' : 'Étoile vide'"
                      class="w-4 h-4 sm:w-6 sm:h-6 lg:w-12 lg:h-12"
                      :class="{ current: exercise.id === currentExercise.id }"
                    />
                  </a>
                </div>
              </template>
             </div>

          </div>
        </div>
      </div>

      <!-- Ajouter le composant de commentaires pour les administrateurs -->
      <div v-if="currentExercise && user && user.admin" class="ml-4">
        <CommentForm :exerciseId="currentExercise.id" />
      </div>
    </div>

    <!-- Les popups -->
    <InstructionPopup
      v-if="isInstructionVisible"
      ref="popupRef"
      :exercise="currentExercise"
      @close="handleInstructionClose"
    />
    <HintPopup
      v-if="isHintVisible"
      :hint="currentExercise?.hint"
      @close="isHintVisible = false"
    />
    <SuccessNextTheme
      v-if="isSuccessNextThemeVisible"
      :newTheme="newTheme"
      @next="loadNextExercise"
    />
    <SuccessNextLevel
      v-if="isSuccessNextLevelVisible"
      :oldLevel="oldLevel"
      :newLevel="newLevel"
      @next="loadNextExercise"
    />
    <SuccessNextExo v-if="isSuccessNextExoVisible" @next="loadNextExercise" />
    <RetryPopup v-if="isRetryVisible" @retry="retryExercise" />
    <FailedNextPopup v-if="isFailedNextVisible" @next="loadNextExercise" />
  </div>
</template>

<style scoped>
.bg-wood {
  background-image: url("/images/others/fond_bois.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Turn indicator styles */
.turn-indicator {
  position: absolute;
  bottom: 20%;
  left: 4%;

  border-radius: 50%;
  z-index: 10;
  border: 2px solid #8B4513;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

.white-turn {
  background-color: #ffdfc6;
}

.black-turn {
  background-color: #682f2c;
}

.instruction-zone {
  /* Couleur de fond de base (case claire) */
  /* font-size: 1.2rem; */
  color: #fff;
}

/* Animation pour la zone (slide-down) */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.pieces-zone {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.pieces-grid {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem 0;
  width: 100%;
}

.piece-to-place-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
}

.piece-display {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  margin: 0.25rem auto;
}

/* Make the chessboard accept drops */
:deep(.cg-wrap) {
  /*position: relative;*/
}

.qcm-option-button {
  transition: transform 0.2s; /* Ajout d'une transition pour un effet fluide */
}

.qcm-option-button:hover {
  transform: scale(1.05); /* Légère augmentation de la taille au survol */
}

.square-check-icon {
  pointer-events: none; /* Pour empêcher que l'icône n'interfère avec les clics sur l'échiquier */
  transition: all 0.3s ease; /* Animation quand l'icône apparaît */
}
</style>
