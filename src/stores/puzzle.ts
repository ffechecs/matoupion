import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '../utils/useApi'

interface Puzzle {
  id: string
  fen: string
  solution: string[]
  firstMove: string
  turn: string
  theme: string
  elo: number
  completed: boolean
}

export const usePuzzleStore = defineStore('puzzle', () => {

  const currentPuzzle = ref<Puzzle | null>(null)
  const userElo = ref(400)
  const moveCount = ref(0)

  const failedAttempts = ref(0)

  const isPuzzleComplete = computed(() => {
    return moveCount.value === currentPuzzle.value?.solution.length
  })


  function increaseMoveCount() {
    moveCount.value++
  }
  function decreaseMoveCount() {
    moveCount.value--
  }
 
  function setCurrentPuzzle(puzzle: Puzzle) {
    currentPuzzle.value = puzzle
    moveCount.value = 0
    failedAttempts.value = 0
  }


  function validateMove(move: any): boolean {

    if (!currentPuzzle.value) return false
   
    const expectedMove = currentPuzzle.value.solution[moveCount.value]

    if (move.lan === expectedMove) {
      increaseMoveCount()
      if (moveCount.value === currentPuzzle.value.solution.length) {
        currentPuzzle.value.completed = true
        return true
      }
      return true
    }
    failedAttempts.value++
    return false
  }


  async function savePuzzleAttempt(success: boolean) {

    if (!currentPuzzle.value) return
    try {
      const { data } = await useApi(`/puzzles/${currentPuzzle.value.id}/attempt`, {
        method: 'POST',
        body: JSON.stringify({
          success: success,
          failed_attempts: failedAttempts.value
        })
      });
      return data;
    } 
    catch (error) {
      console.error('Error saving failed attempt:', error);
      return null;
    }    
  }

  
  return {
    currentPuzzle,
    userElo,
    moveCount,
    isPuzzleComplete,
    setCurrentPuzzle,
    validateMove,
    increaseMoveCount,
    decreaseMoveCount,
    savePuzzleAttempt
  }
})

// Ajout de cette section pour supporter le HMR avec Pinia
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePuzzleStore, import.meta.hot))
}
