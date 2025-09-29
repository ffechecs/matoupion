<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { $api } from "../../../utils/api";
import { useAuthStore } from "../../../stores/auth";

const authStore = useAuthStore();

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  refreshTrigger: {
    type: Boolean,
    default: false
  }
});

defineEmits(['show-rewards', 'show-elo']);

const rewardsCount = ref(0);

// Charger le nombre de récompenses
const loadRewardsCount = async () => {
  try {
    const response = await $api("/auth/rewards");
    if (response && response.rewards) {
      rewardsCount.value = response.rewards.length;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des récompenses:", error);
    rewardsCount.value = 0;
  }
};

onMounted(() => {
  loadRewardsCount();
});

// Watch for refreshTrigger changes
watch(
  () => props.refreshTrigger,
  () => {
    loadRewardsCount();
  }
);
</script>

<template>
  <div class="mt-16 md:mt-20">
    <div class="flex items-center gap-10 justify-center text-center mb-3">
      <div class="flex justify-center mb-6">
        <div class="text-center items-center">
          <h2 class="text-white text-xl font-bold mb-2">RANG</h2>
          <div class="relative">
            <img
              src="/images/popups/rang.png"
              alt="Mascotte et rang"
              class="w-[auto] h-[100px] md:h-[150px] lg:h-[200px] mx-auto"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <img 
                :src="'/images/pieces/piece_'+(authStore.user?.level || 'pawn').toLowerCase()+'_blanc.png'" 
                alt="Rang" 
                class="w-18 h-[40px] md:h-[60px] lg:h-auto mt-7 md:mt-9 lg:mt-12" 
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center mb-6 mt-2">
        <div class="text-center items-center">
          <h2 class="text-white text-xl font-bold mb-2">ELO</h2>
          <div class="relative">
            <img
              src="/images/popups/rang.png"
              alt="Mascotte et rang"
              class="w-[auto] h-[100px] md:h-[150px] lg:h-[200px] mx-auto"
            />
            <div class="absolute inset-0 flex items-center justify-center mt-8 md:mt-12 lg:mt-16">
              <span class="text-[#FFF4CF] text-xl md:text-2xl lg:text-4xl font-bold">{{ authStore.user?.elo || 400 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center justify-center text-center mb-0 mx-auto ">
      <p class="text-white text-center mb-2">
        Tu as actuellement {{ rewardsCount }} récompenses.
      </p>
      <div class="flex justify-center mb-2">
        <button @click="$emit('show-rewards')" class="cta-button">VOIR MES RÉCOMPENSES</button>
      </div>

      <button @click="$emit('show-elo')" class="cta-button">
        VOIR MA COURBE ELO
      </button>
    </div>
  </div>
</template>

<style>
@import "@/assets/styles/profileComponents.css";
</style> 