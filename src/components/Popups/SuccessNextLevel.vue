
<script setup lang="ts">
import { ref, onMounted } from 'vue';
const happyCats = ["chat_joyeux_1.png", "chat_joyeux_2.png"];
const happyCat = ref(happyCats[0]);

// on tire au sort une image de chat joyeux
onMounted(() => {
    happyCat.value = happyCats[Math.floor(Math.random() * happyCats.length)];
});

const props = defineProps<{
  oldLevel: string;
  newLevel: string;
}>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-white">
    <div class="relative w-[791px] h-[706px]">
      <img :src="`/images/popups/${happyCat}`" class="w-full h-full object-contain" alt="popup background" />
      <div class="absolute inset-0 flex flex-col items-center" style="margin-top: 310px">
        <h2 class="font-bold text-4xl">Félicitations</h2>
      </div>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <p class="font-bold text-center text-2xl w-[500px] mt-[260px]">
        Tu as terminé tous les<br>niveaux du rang {{ oldLevel }} 😸
         <br />Tu accèdes au rang {{ newLevel }} ! </p>
          <img 
                :src="'/images/pieces/piece_'+(newLevel || 'pawn').toLowerCase()+'_marron_selected.png'" 
                alt="Rang" 
                class="w-18 h-auto mt-2" 
              />
      </div>
      <div class="absolute inset-0 flex flex-col items-center align-center text-center justify-end mb-10">
        <button @click="$emit('next')" class="px-6 py-2 text-white font-bold shadow-md transition-colors cta" 
        style="background-image: url('/images/buttons/bouton_lg.svg'); background-size: cover; background-repeat: no-repeat; width: 191.31px; height: 71.69px;padding-top: 0px;">
          SUIVANT
        </button>
      </div>
    </div>
  </div>
</template>
