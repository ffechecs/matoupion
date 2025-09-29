<script setup lang="ts">
import { ref, watch , onMounted} from 'vue';
const props = defineProps({
  turn: {
    type: String,
    required: false,
    default: "white",
  },
});

const letters = ref(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
const numbers = ref([1, 2, 3, 4, 5, 6, 7, 8]);

const displayLetters = ref([]);
const displayNumbers = ref([]);

const setTurn = (turn: string) => {
  if (turn === 'white') {
    displayNumbers.value = [...numbers.value].reverse();
    displayLetters.value = [...letters.value];
  } else {
    displayNumbers.value = [...numbers.value];
    displayLetters.value = [...letters.value].reverse();
  }
}

onMounted(() => {
  setTurn(props.turn);
});

watch(() => props.turn, (newTurn) => {
  setTurn(newTurn);
});

</script>

<template>
  <div>
    <div class="coordinates-letters">
      <div
        v-for="letter in displayLetters"
        :key="letter"
        class="letter text-[0.9rem] sm:text-[1.2rem]"
      >
        {{ letter }}
      </div>
    </div>
    <div class="coordinates-numbers">
      <div
        v-for="number in displayNumbers"
        :key="number"
        class="number text-[0.9rem] sm:text-[1.2rem]"
      >
        {{ number }}
      </div>
    </div>
  </div>
</template>
