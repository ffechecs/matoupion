
<script setup lang="ts">
import { ref, onMounted } from 'vue';
const sadCats = ["chat_triste_1.png", "chat_triste_2.png"];
const sadCat = ref(sadCats[0]);

// on tire au sort une image de chat joyeux
onMounted(() => {
    sadCat.value = sadCats[Math.floor(Math.random() * sadCats.length)];
});
</script>
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-white">
    <div class="relative max-w-[791px] w-full px-10 h-[706px] bg-no-repeat"
    :style="`background-image: url('/images/popups/${sadCat}'); background-size: 100% 100%;`"
    >
      <!-- <img :src="`/images/popups/${sadCat}`" class="w-full h-full object-contain" alt="popup background" /> -->
      <div class=" inset-0 flex flex-col items-center" style="margin-top: 310px">
        <h2 class="font-bold text-2xl md:text-4xl">Raté</h2>
      </div>
      <div class=" inset-0 flex flex-col items-center justify-center">
        <p class="font-bold text-center text-xl md:text-2xl mt-[100px]">Tu as échoué !!<br />Tu feras mieux la prochaine fois !</p>
      </div>
      <div class=" inset-0 flex flex-col items-center align-center text-center justify-end mb-10 mt-10">
        <button @click="$emit('next')" class="px-6 py-2 shadow-md transition-colors cta cta-lg">
          SUIVANT
        </button>
      </div>
    </div>
  </div>
</template>