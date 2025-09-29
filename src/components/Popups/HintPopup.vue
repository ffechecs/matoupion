<script setup lang="ts">
defineProps(['hint']);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-white">
    <div class="relative w-full px-10 max-w-[789px] min-h-[516px] bg-[url('/images/popups/popup_standard.png')] bg-no-repeat" style="background-size: 100% 100%;">
      <div class="inset-0 flex flex-col items-center" style="margin-top: 50px">
        <h2 class="font-bold text-2xl md:text-4xl">Indice</h2>
      </div>
      <div class="inset-0 flex flex-col items-center justify-center mt-32">
        <p class="font-medium text-center text-xl sm:text-2xl">{{ hint }}</p>
      </div>
      <div class="inset-0 flex flex-col items-center align-center text-center justify-end my-10">
        <button @click="$emit('close')" class="px-6 py-2 text-white font-bold shadow-md transition-colors cta" style="background-image: url('/images/buttons/bouton_lg.svg'); background-size: cover; background-repeat: no-repeat; width: 191.31px; height: 71.69px;">
          OK
        </button>
      </div>
    </div>
  </div>
</template>
