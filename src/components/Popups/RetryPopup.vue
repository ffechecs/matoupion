
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
    <div class="relative w-[791px] h-[706px]">
      <img :src="`/images/popups/${sadCat}`" class="w-full h-full object-contain" alt="popup background" />
      <div class="absolute inset-0 flex flex-col items-center" style="margin-top: 255px">
        <h2 class="font-bold text-4xl">Raté</h2>
      </div>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <p class="font-bold text-center text-2xl w-[500px] mt-[200px]">Tu as échoué !!<br />Tu peux réessayer</p>
      </div>
      <div class="absolute inset-0 flex flex-col items-center align-center text-center justify-end mb-10">
        <button @click="$emit('retry')" class="px-6 py-2 text-white font-bold shadow-md transition-colors cta" style="background-image: url('/images/buttons/bouton_lg.svg'); background-size: cover; background-repeat: no-repeat; width: 191.31px; height: 71.69px;">
          RÉESSAYER
        </button>
      </div>
    </div>
  </div>
</template>
