<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  piece: string;
  square?: string;
  draggable?: boolean;
}>();

const emit = defineEmits(['dragstart', 'dragend']);

// Map piece letters to their class names
const pieceTypeMap: Record<string, string> = {
  'p': 'pawn',
  'n': 'knight',
  'b': 'bishop',
  'r': 'rook',
  'q': 'queen',
  'k': 'king',
};

// Determine piece type and color from the piece code
const pieceType = computed(() => {
  const letter = props.piece.toLowerCase();
  return pieceTypeMap[letter] || 'pawn'; // Default to pawn if unknown
});

const pieceColor = computed(() => {
  // If the piece letter is uppercase, it's white, otherwise black
  return props.piece === props.piece.toUpperCase() ? 'white' : 'black';
});

// Combine classes for the piece
const pieceClasses = computed(() => {
  return [
    'chess-piece',
    pieceType.value,
    pieceColor.value,
    props.draggable ? 'draggable' : ''
  ];
});

// Drag event handlers
const handleDragStart = (event: DragEvent) => {
  if (props.draggable) {
    // Set data to be used during drop
    event.dataTransfer?.setData('text/plain', props.piece);
    
    // Create a drag image - this makes the drag look nicer
    const img = new Image();
    const pieceType = pieceTypeMap[props.piece.toLowerCase()];
    const color = props.piece === props.piece.toUpperCase() ? 'white' : 'black';
    const pieceElement = event.target as HTMLElement;
    
    // Use the computed style of the element being dragged
    if (pieceElement) {
      const computedStyle = window.getComputedStyle(pieceElement);
      img.src = computedStyle.backgroundImage.slice(5, -2); // Extract URL from url('...')
      
      if (img.src) {
        // Set the drag image offset for better positioning
        event.dataTransfer?.setDragImage(img, 40, 40);
      }
    }
    
    emit('dragstart', props.piece);
  }
};

const handleDragEnd = (event: DragEvent) => {
  if (props.draggable) {
    emit('dragend');
  }
};
</script>

<template>
  <div 
    :class="pieceClasses" 
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  ></div>
</template>

<style scoped>
.chess-piece {
  width: 100%;
  height: 100%;
  background-size: 80%;
  background-position: center;
  background-repeat: no-repeat;
}

.draggable {
  cursor: grab;
}

.draggable:active {
  cursor: grabbing;
}

/* Use the same background images defined in chessground.pieces.css */
.pawn.white {
  background-image: url('/images/pieces/piece_pion_blanc.png');
}
.bishop.white {
  background-image: url('/images/pieces/piece_fou_blanc.png');
}
.knight.white {
  background-image: url('/images/pieces/piece_cavalier_blanc.png');
}
.rook.white {
  background-image: url('/images/pieces/piece_tour_blanc.png');
}
.queen.white {
  background-image: url('/images/pieces/piece_dame_blanc.png');
}
.king.white {
  background-image: url('/images/pieces/piece_roi_blanc.png');
}

.pawn.black {
  background-image: url('/images/pieces/piece_pion_marron.png');
}
.bishop.black {
  background-image: url('/images/pieces/piece_fou_marron.png');
}
.knight.black {
  background-image: url('/images/pieces/piece_cavalier_marron.png');
}
.rook.black {
  background-image: url('/images/pieces/piece_tour_marron.png');
}
.queen.black {
  background-image: url('/images/pieces/piece_dame_marron.png');
}
.king.black {
  background-image: url('/images/pieces/piece_roi_marron.png');
}
</style> 