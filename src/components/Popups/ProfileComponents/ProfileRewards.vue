<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { $api } from "../../../utils/api";

const props = defineProps({
  refreshTrigger: {
    type: Boolean,
    default: false
  }
});

const userRewards = ref([]);

// Fonction pour charger les données de récompenses
const loadRewardsData = async () => {
  try {
    const response = await $api("/auth/rewards");
    if (response && response.rewards) {
      userRewards.value = response.rewards.map(reward => reward.reward_number);
    } else {
      console.log("Aucune récompense disponible");
      userRewards.value = [];
    }
  } catch (error) {
    console.error("Erreur lors du chargement des récompenses:", error);
    userRewards.value = [];
  }
};

// Fonction pour vérifier si une récompense est débloquée
const isRewardUnlocked = (rewardNumber) => {
  return userRewards.value.includes(rewardNumber);
};

// Fonction pour générer le chemin vers l'image de la récompense
const getRewardImagePath = (rewardNumber) => {
  let defaultNumber = 20;
  if (isRewardUnlocked(rewardNumber)) {
    return `/images/rewards/reward_${rewardNumber}.png`;
  } else {
     if (rewardNumber >= 1 && rewardNumber <= 20) {
      defaultNumber = 20;
    } else if (rewardNumber >= 21 && rewardNumber <= 40) {
      defaultNumber = 40;
    } else if (rewardNumber >= 41 && rewardNumber <= 60) {
      defaultNumber = 60;
    } else if (rewardNumber >= 61 && rewardNumber <= 80) {
      defaultNumber = 80;
    } else if (rewardNumber >= 81 && rewardNumber <= 100) {
      defaultNumber = 100;
    } else if (rewardNumber >= 101 && rewardNumber <= 120) {
      defaultNumber = 120;
    }
    return `/images/rewards/reward_${defaultNumber}.png`;
  }

};

onMounted(() => {
  loadRewardsData();
});

const getRewardClass = (n) => {

 let rewardClass = "";
 if ( !isRewardUnlocked(n)) {
  rewardClass = "opacity-20 ";
 }
 if (n >= 1 && n <= 20) {
  rewardClass += "reward-pion";
 } else if (n >= 21 && n <= 40) {
  rewardClass += "reward-tour";
 } else if (n >= 41 && n <= 60) {
  rewardClass += "reward-cavalier";
 } else if (n >= 61 && n <= 80) {
  rewardClass += "reward-fou";
 } else if (n >= 81 && n <= 100) {
  rewardClass += "reward-dame";
 } else if (n >= 101 && n <= 120) {
  rewardClass += "reward-roi";
 }
 return rewardClass;
};

// Watch for refreshTrigger changes
watch(
  () => props.refreshTrigger,
  () => {
    loadRewardsData();
  }
);
</script>

<template>
  <div class="w-full mt-4">
    <div class="text-center mb-4 mx-10">
      <p class="text-white text-lg">
        <span class="text-center">
          <span class="text-white text-2xl md:text-4xl font-bold">{{ userRewards.length }}</span>
          <span class="text-white ml-2">/ 120</span>
        </span>
        <span class="ml-5 md:ml-10 text-white text-lg">Plus tu joues souvent, plus tu obtiens de récompenses. Collectionne-les toutes !</span>
      </p>
    </div>

    <!-- Grille de récompenses avec scroll vertical -->
    <div class="px-5 sm:px-20 pt-1 w-full max-h-[455px] z-12 overflow-y-auto rewards-grid-container">
      <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-0 justify-items-center">
        <!-- Générer 120 cases de récompenses (10 par ligne) -->
        <div
          v-for="n in 120"
          :key="n"
          class="relative reward-item h-[75px] w-[75px] flex items-center justify-center"
          :class="{ 'reward-unlocked': isRewardUnlocked(n), 'reward-locked': !isRewardUnlocked(n) }"
        >

          <img
            :src="getRewardImagePath(n)"
            class="relative z-10 object-contain"
            :class="getRewardClass(n)"
            alt="Pièce d'échecs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import "@/assets/styles/profileComponents.css";

.reward-locked {
  background-color: #D75D31;
  border-radius: 10px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.reward-unlocked {
  background-color: #8E2B0F;
  border-radius: 10px;
}

.reward-pion {
height: 95px;
width: 95px;
margin-bottom: 40px;
}

.reward-tour {
height: 85px;
width: 85px;
margin-bottom: 30px;
}

.reward-cavalier {
height: 80px;
width: 80px;
margin-bottom: 20px;
}

.reward-fou {
height: 75px;
width: 75px;
margin-bottom: 20px;
}

.reward-dame {
height: 70px;
width: 70px;
margin-bottom: 5px;
}

.reward-roi {
height: 60px;
width: 60px;
margin-bottom: 0px;
}


</style> 