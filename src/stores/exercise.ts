import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'
import { Chess , Square} from 'chess.js';
import { useApi } from '../utils/useApi'
import { addPieceToFen } from '../utils/fenUtils'
import mitt from 'mitt';

// Create a shared emitter that can be imported elsewhere
export const emitter = mitt();

interface Exercise {
  id: number
  num_exercice: number
  level_id: number
  level_name: string
  theme_id: number
  theme_name: string
  fen: string
  turn: string
  instruction: string
  hint: string
  type_exercice: string
  nb_moves:number
  take_possible: boolean
  move_count: number
  solution: Array<string>
  completed: boolean,
  all_exercices: Array<{id: number, solved: boolean}> 
  // id and solved status of other exercices of the theme for the connected user
}

export const useExerciseStore = defineStore('exercise', () => {


  const undoLastMoveAsked = ref(false)

  const currentExercise = ref<Exercise | null>(null)

  //const moveCount = ref(0)
  const failedAttempts = ref(0)
  const retryCount = ref(0)
  const chessgame = ref<Chess | null>(null)

  const successMessageVisible = ref(false)

  const lastIndexSolution = ref([])

  const isExerciseComplete = computed(() => {
    return currentExercise.value?.completed || false
  })

  function setCurrentExercise(exercise: Exercise) {
    currentExercise.value = exercise
    currentExercise.value.move_count = 0
    currentExercise.value.completed = false
    lastIndexSolution.value = []
    //console.log('setCurrentExercise', exercise)
    chessgame.value = new Chess(exercise.fen)
   // moveCount.value = 0
    failedAttempts.value = 0
    if( exercise.id != currentExercise.value?.id) {
      retryCount.value = 0
    }
    else {
      retryCount.value++
    }
  }

  function setSolution(solution: Array<string>) {
    currentExercise.value.solution = solution
  }

  function addMove(move: string) {
   // moveCount.value++
   currentExercise.value.move_count++
  }

   async function undoLastMove(boardAPI: any) {
 
    await new Promise(resolve => setTimeout(resolve, 1000));
    boardAPI.undoLastMove();
    boardAPI.setConfig({ movable: { color: currentExercise.value.turn}});
    chessgame.value.undo()
    keepSameTurn(boardAPI)    
  }



function logdebug(boardAPI: any){

  console.log('logdebug')
  console.log(boardAPI)
  console.log("turn boardAPI", boardAPI.getTurnColor())
  console.log("turn chessgame", chessgame.value.turn())
  console.log("movable boardAPI", boardAPI.board.state.movable.color)
  console.log("movable chessgame", chessgame.value.turn())
  console.log("fen boardAPI", boardAPI.getFen())
  console.log("fen state boardAPI", boardAPI.board.state.fen)
  console.log("fen state chessgame", chessgame.value.fen())
  console.log("move", boardAPI.getLastMove())


}

  function incrementFailedAttempts() {
    failedAttempts.value++
  }

  function updateChessgame(fen: string) {
    chessgame.value = new Chess(fen)
  }

  function addMoveToChessgame(from: any, to: any) {
    chessgame.value.move({from: from, to: to})
    }

  function addSanMoveToChessgame(san: string) {
    chessgame.value.move(san)
  }

  function keepSameTurn(boardAPI: any) {
    let fen = chessgame.value.fen()
    let search = currentExercise.value.turn == "white" ? "b" : "w";
    let replace = currentExercise.value.turn == "white" ? "w" : "b";
    fen = fen.replace(" "+search+" ", " "+replace+" ");
    updateChessgame(fen)
    boardAPI.setPosition(fen)
  }

  function setTurn(boardAPI: any, goodTurn: string) {
    let fen = chessgame.value.fen()
    let search = goodTurn == "w" ? "b" : "w";
    let replace = goodTurn == "w" ? "w" : "b";
    fen = fen.replace(" "+search+" ", " "+replace+" ");
    updateChessgame(fen)
    boardAPI.setPosition(fen)
  }

  function isAttacked(square: any): boolean {
    if (!chessgame.value || !currentExercise.value) return false;
    return chessgame.value.isAttacked(square, currentExercise.value.turn == 'white' ? 'b' : 'w');
  }

  function recordTakeMove(from: any, to: any, boardAPI: any): boolean {


    if (!currentExercise.value) return false
    
    if (!chessgame.value) return false

    try {

      let move = boardAPI.getLastMove()

      addSanMoveToChessgame(move.san)

      if (isAttacked(to)) {
        return false
      }

      let piece = chessgame.value.get(to)

      if (piece.type != currentExercise.value.solution[0].toLowerCase()) {  
        return false 
      }


    } catch (error) {
      console.log("error", error)
    }
   
    if (currentExercise.value.solution.includes(to)) {

      currentExercise.value.solution.splice(currentExercise.value.solution.indexOf(to), 1)
    }


    currentExercise.value.move_count++

    if(currentExercise.value.move_count <= currentExercise.value.nb_moves 
      && currentExercise.value.solution.length == 1)
    {
        currentExercise.value.completed = true
        return true
    }


    if(currentExercise.value.move_count >= currentExercise.value.nb_moves)
    {
          incrementFailedAttempts()
          return false
    }

    keepSameTurn(boardAPI)
    return true;
  }



  function recordGotoMove(from: any, to: any, boardAPI: any): boolean {

    if (!currentExercise.value) { return false  }

    if (!chessgame.value) { return false }


    try {

      let piece = chessgame.value.get(from)

      if (piece.type != currentExercise.value.solution[0].toLowerCase()) {  
        return false 
      }

      if ( ! currentExercise.value.take_possible && chessgame.value.get(to)) { 
        return false 
      }

      addMoveToChessgame(from, to)

      if (isAttacked(to)) { return false }
        
      keepSameTurn(boardAPI)
  
    } catch (error) {
      console.log("error recordGotoMoves to throw", error)
      throw error

    }
  
    currentExercise.value.move_count++

    if(currentExercise.value.move_count <= currentExercise.value.nb_moves 
      && currentExercise.value.solution[1] == to)
    {
        currentExercise.value.completed = true
        return true
    }
    if(currentExercise.value.move_count >= currentExercise.value.nb_moves)
    {
          incrementFailedAttempts()
          return false
    }
    return true;
  }

  async function checkMove(from: any, to: any, boardAPI: any): Promise<boolean> {

    let move = boardAPI.getLastMove();

    /* hack kelio pour type set*/
    if( move == undefined ) {
      undoLastMove(boardAPI);
      return false;
    }
    /* fin hack */

    if (move.flags.includes('e') || move.flags.includes('p')) {
      // on attend 500ms pour éviter les bugs de prise en passant
      await new Promise((resolve) => setTimeout(resolve, 500));      
    }

    if ( ["highlight", "multiset", "qcm"].includes(currentExercise.value.type_exercice)) {
      undoLastMove(boardAPI);
      return false;
    }


    if (currentExercise.value.type_exercice === "move") {

 
      let isCorrectMove = false;

        if (move.color === currentExercise.value.turn.substring(0, 1)) {

        addSanMoveToChessgame(move.san)
        let isCorrectMove = validateMove(move);

        if (isCorrectMove) {

          let validatedMove = ""
          if( lastIndexSolution.value.length > 0 ) {
            validatedMove = currentExercise.value.solution[lastIndexSolution.value[0]][currentExercise.value.move_count];
          }
          else {  
            validatedMove = currentExercise.value.solution[currentExercise.value.move_count];
          }

          boardAPI.move(validatedMove)

         // addSanMoveToChessgame(currentExercise.solution[moveCount.value])
          if (isExerciseComplete.value) {
            return true;
          } else {
            addSanMoveToChessgame(validatedMove)
            addMove(validatedMove);

            return true;
          }
        } else {
          undoLastMove(boardAPI);
          try {
            await useApi(`/exercises/${currentExercise.value.id}/attempt`, {
              method: "POST",
              body: JSON.stringify({
                success: false,
              }),
            });
            return false;
          } catch (error) {
            console.error("Error saving failed attempt:", error);
          }
        }
      }
    }


    if (currentExercise.value.type_exercice === "take" || currentExercise.value.type_exercice === "set") {

      if (recordTakeMove(from, to, boardAPI)) {
        if (isExerciseComplete.value) {
          return true;
        }
        //keepSameTurn(boardAPI)
        return true;
      }
      else {

        incrementFailedAttempts()
        undoLastMove(boardAPI);
        return false;
      }
    }

    if (currentExercise.value.type_exercice === "goto") {
      let fen = boardAPI.getFen();
      let isCorrectMove = false;

      try {
        isCorrectMove = recordGotoMove(from, to, boardAPI)
      } catch (error) {

        updateChessgame(fen);
        boardAPI.setPosition(fen);
        return false;
      }
  
      if (isCorrectMove) {
        if (isExerciseComplete.value) {
          return true;
        }

        keepSameTurn(boardAPI)
        return true;
      }
      else {
        incrementFailedAttempts()
        undoLastMove(boardAPI);
        return false;
      }
    }

  }

  const checkDraw = (shapes: any, boardAPI: any): boolean => {
    if (!currentExercise.value) return false;

    if (currentExercise.value.type_exercice == "set") {
      let square = shapes[0].orig;

      //check if square is already occupied
      if (chessgame.value.get(square)) {
        boardAPI.setShapes([]);

        return false;
      }

      //check if square is attacked
      if (isAttacked(square)) {
        emitter.emit('warn_shaking');
        boardAPI.setShapes([]);
        return false;
      }

      let piece = currentExercise.value.solution[0];
      piece = currentExercise.value.turn == "white"
        ? piece.toUpperCase()
        : piece.toLowerCase();
      
      // remove the first element from the solution array
      //currentExercise.value.solution.shift();

      const currentFen = boardAPI.getFen();
      // Modifier le FEN pour ajouter la nouvelle pièce
      const newFen = addPieceToFen(currentFen, square, piece);

      // Mettre à jour la position
      boardAPI.setPosition(newFen);
      updateChessgame(newFen);

      let afterNewPieceConfig = {
        selectable: {
          enabled: true,
        },
        draggable: {
          enabled: true,
        },
        drawable: {
          enabled: false,
        },
        movable: {
          color: 'both',
          free: true,
        },
        premovable: {
          enabled: false,
        },
      };
      boardAPI.setConfig(afterNewPieceConfig, false);
      return true;
    } 
    else {
      let success = true;
      let goodmove = true;
      let solution = currentExercise.value.solution.splice(1);

      let shapesArray = shapes.map((shape: any) => shape.orig);

      if (shapesArray.length != solution.length) {
        success = false;
      }

      solution.forEach((square: string) => {
        if (!shapesArray.includes(square)) {
          success = false;
        }
      });

      shapesArray.forEach((square: string) => {
        if (!solution.includes(square)) {
          goodmove = false;
          success = false;
          let newShapesArray = shapes.filter(
            (shape: any) => shape.orig != square
          );
          boardAPI.setShapes(newShapesArray);
        }
      });

      if (success && goodmove) {
        currentExercise.value.completed = true;
      } else if (!goodmove) {
        incrementFailedAttempts();
      }
      return goodmove;
    }
  };


  const checkHighlight = (squares: any): boolean => {
    if (!currentExercise.value) return false;

      let success = true;
      let goodmove = true;
      let solution = currentExercise.value.solution;

      if (squares.length != solution.length) {
        success = false;
      }

      solution.forEach((square: string) => {
        if (!squares.includes(square)) {
          success = false;
        }
      });

      squares.forEach((square: string) => {
        if (!solution.includes(square)) {
          goodmove = false;
          success = false;
        }
      });

      if (success && goodmove) {
        currentExercise.value.completed = true;
      } else if (!goodmove) {
        incrementFailedAttempts();
      }
      return goodmove;
    
  };


  const addPieceForPat = (piece: any, square: any, boardAPI: any): boolean => {
    if (!currentExercise.value ) return false;

      //check if square is already occupied
      if (chessgame.value.get(square)) {
        return false;
      }

      const currentFen = boardAPI.getFen();
      // Modifier le FEN pour ajouter la nouvelle pièce
      if( currentExercise.value.turn == "white") {
        piece = piece.toUpperCase();
      }
      else {
        piece = piece.toLowerCase();
      }
      const newFen = addPieceToFen(currentFen, square, piece);

      // Mettre à jour la position
      boardAPI.setPosition(newFen);
      updateChessgame(newFen);

      return true;
    } 
 

  function checkMultiset(boardAPI: any): boolean {
    if (!currentExercise.value) return false;

    if (currentExercise.value.type_exercice != "multiset") {
      return false;
    }

    let caseKing = ""
    let board = chessgame.value.board();

    let colortofind = currentExercise.value.turn == "white" ? "b" : "w";

    board.forEach((row: any) => {

      row.forEach((cell: any) => {

        if( cell != null ) {

          if( cell.type == "k" && cell.color == colortofind) {
            caseKing = cell.square;
          }
        }
      });
    });

        //Determine if we need to change turn
    let goodTurn = currentExercise.value.turn == "white" ? "b" : "w";

    setTurn(boardAPI, goodTurn);

    let board2 = chessgame.value.board();
    


    let isCheck1 = boardAPI.getIsCheck();
    //let isCheck2 = chessgame.value.inCheck();

    if( isCheck1 ) {
      incrementFailedAttempts();
      return false;
    }

    let chessturn = chessgame.value.turn();


    let moves = chessgame.value.moves({square: caseKing as Square});


    boardAPI.setConfig({ drawable: { enabled: true } });

    if( moves.length > 0 ) {
      const shapes = [];
      for( let move of moves) {

        shapes.push({ orig: caseKing, dest: move.substring(1),brush: "red"});
        boardAPI.drawMove({ orig: caseKing, dest: move.substring(1),brush: "red" });

      }
 
      boardAPI.setShapes(shapes);

      incrementFailedAttempts();
      return false;

    }

    currentExercise.value.completed = true;
 
    return true;
  }


  function validateMove(move: any): boolean {

    if (!currentExercise.value) return false

    let expectedMove = ""
    let expectedMoves = []
    
    if (Array.isArray(currentExercise.value.solution[0])) {

      if( lastIndexSolution.value.length > 0 ) {
        lastIndexSolution.value.forEach((index: number) => {
          if( currentExercise.value.solution[index][currentExercise.value.move_count] != undefined ) {
            expectedMoves.push( {variant: currentExercise.value.solution[index][currentExercise.value.move_count], indexSolution: index})
          }
        })
      }
      else {
        currentExercise.value.solution.forEach((variant: any, index: number) => {
          if( variant[currentExercise.value.move_count] != undefined ) {
            expectedMoves.push( {variant: variant[currentExercise.value.move_count], indexSolution: index})
          }
        })
      }
    }
    else expectedMove = currentExercise.value.solution[currentExercise.value.move_count]

    if ( expectedMoves.length > 0 ){
      lastIndexSolution.value = []

      let found = false
      let alreadyFound = false
     expectedMoves.forEach((expectedMove: any) => {

      if( move.san === expectedMove.variant )
        {

          if( ! alreadyFound ) {
            currentExercise.value.move_count++
            alreadyFound = true
          }
          lastIndexSolution.value.push(expectedMove.indexSolution)
          if (currentExercise.value.move_count === currentExercise.value.solution[expectedMove.indexSolution].length) {
            currentExercise.value.completed = true
            found = true
          }
          found = true
        }
      })
      if (found) {
        return true
      }
    }  
    else if (move.san === expectedMove) {

        currentExercise.value.move_count++
        if (currentExercise.value.move_count === currentExercise.value.solution.length) {
        currentExercise.value.completed = true
        return true
      }
      return true
    }
    incrementFailedAttempts()
    return false
  }


  async function saveExerciseChanges(): Promise<void> {
    if (!currentExercise.value) return

    try {
      const { response, data } = await useApi(`/exercises/save/${currentExercise.value.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fen: currentExercise.value.fen,
          turn: currentExercise.value.turn,
          instruction: currentExercise.value.instruction,
          hint: currentExercise.value.hint,
          type_exercice: currentExercise.value.type_exercice,
          nb_moves: currentExercise.value.nb_moves,
          solution: currentExercise.value.solution,
        }),
      })

      if (response.value.ok) {
        currentExercise.value = (data.value as { data: Exercise }).data
        successMessageVisible.value = true
        setTimeout(() => {
          successMessageVisible.value = false
        }, 3000)
      } else {
        console.error('Erreur lors de la sauvegarde des modifications')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des modifications:', error)
    }
  }

  return {
    currentExercise,
    undoLastMoveAsked,
   // moveCount,
    failedAttempts,
    retryCount,
    isExerciseComplete,
    setCurrentExercise,
    setSolution,
    addMove,
    validateMove,
    recordTakeMove,
    updateChessgame,
    incrementFailedAttempts,
    recordGotoMove,
    saveExerciseChanges,
    successMessageVisible,
    checkMove,
    checkDraw,
    isAttacked,
    addPieceForPat,
    checkMultiset,
    checkHighlight
  }
})

// Ajout de cette section pour supporter le HMR avec Pinia
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useExerciseStore, import.meta.hot))
}