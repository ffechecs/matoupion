<script setup lang="ts">
import { ref, onMounted } from 'vue';
const happyCats = ["chat_joyeux_1.png", "chat_joyeux_2.png"];
const happyCat = ref(happyCats[0]);

const props = defineProps<{
  newTheme: string | number;
}>();

const themeNumber = ref(typeof props.newTheme === 'string' ? parseInt(props.newTheme, 10) : props.newTheme);

const getIconTheme = (id: number) => {
  if( id <= 5 ) {
    return '1-5'
  } else if( id <= 10 ) {
    return '6-10'
  } else if( id <= 14 ) {
    return '11-14'
  } else if( id <= 18 ) {
    return '15-18'
  } else {
    return '19-21'
  }
}

// on tire au sort une image de chat joyeux
onMounted(() => {
    happyCat.value = happyCats[Math.floor(Math.random() * happyCats.length)];
});
</script>
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-white">
    <div class="relative w-[791px] h-[706px]">
      <img :src="`/images/popups/${happyCat}`" class="w-full h-full object-contain" alt="popup background" />
      <div class="absolute inset-0 flex flex-col items-center" style="margin-top: 310px">
        <h2 class="font-bold text-4xl">Bravo</h2>
      </div>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <p class="font-bold text-center text-2xl w-[500px] mt-[250px]">
        <span class="block mt-4">Tu as réussi 4 exercices<br> dans ce niveau 😸</span>
         <span class="block mt-4">le niveau {{ themeNumber }} est débloqué ! </span>
         </p>
              <div class="relative ">
              <img 
                :src="`/images/dashboard/niveaux_${getIconTheme(themeNumber)}.png`" 
                class="w-24 h-24 transition-all duration-300 opacity-100 hover:scale-110" 
              />
              <span class="absolute top-12 left-1/2 -translate-x-1/2 text-white font-spenbeb text-xl">{{ themeNumber }}</span>
              </div>
      </div>
      <div class="absolute inset-0 flex flex-col items-center align-center text-center justify-end mb-[30px]">
        <button @click="$emit('next')" class="px-6 py-2 text-white font-bold shadow-md transition-colors cta" 
        style="background-image: url('/images/buttons/bouton_lg.svg'); background-size: cover; background-repeat: no-repeat; width: 191.31px; height: 71.69px;padding-top: 0px;">
          SUIVANT
        </button>
      </div>
    </div>
  </div>
</template>
