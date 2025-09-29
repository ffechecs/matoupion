<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { $api } from "../../utils/api";
import { useCookie } from "../../utils/useCookie";
import ProfileRank from "./ProfileComponents/ProfileRank.vue";
import ProfileCredentials from "./ProfileComponents/ProfileCredentials.vue";
import ProfileEloChart from "./ProfileComponents/ProfileEloChart.vue";
import ProfileRewards from "./ProfileComponents/ProfileRewards.vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const router = useRouter();
const authStore = useAuthStore();
// Créons une référence réactive locale pour l'utilisateur
const userData = ref(null);
const isUserLoaded = ref(false);

const activeTab = ref("rang"); // 'rang' ou 'identifiants' ou 'elo' ou 'rewards'
const activeSubTab = ref("rank"); // 'rank' ou 'credentials'
const refreshData = ref(false);

// Watch for profile popup visibility
watch(
  () => props.show,
  async (isShown) => {
    if (isShown) {
      // Trigger data refresh in all components
      refreshData.value = !refreshData.value;
      
      // Load fresh user data
      await loadUserData();
    }
  }
);

// Fonction pour charger les données utilisateur à jour
const loadUserData = async () => {
  try {

    const response = await $api("/auth/user");

    if (response) {

      userData.value = JSON.parse(JSON.stringify(response));
      
      const userDataCookie = useCookie("userData");
      userDataCookie.value = userData.value;
      authStore.setUser(userData.value);
      
      isUserLoaded.value = true;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Chargeons les données utilisateur au montage du composant
onMounted(async () => {
  if (props.show) {
    await loadUserData();
  }
});

const logout = () => {
  authStore.logout();
  router.push("/login");
};

const showEloRanking = () => {
  activeTab.value = "elo";
};

const showRewards = () => {
  activeTab.value = "rewards";
};

const backToRank = () => {
  activeTab.value = "rang";
};

const handleClose = () => {
  emit('close');
  activeTab.value = 'rang';
};
</script>

<template>
  <div
    v-if="props.show"
    class=" max-h-[100vh] fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
  >
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50"
      @click="handleClose"
    ></div>

    <!-- Popup Content -->
    <div
      class="max-h-[95vh] relative bg-[url('/images/popups/popup_profil.png')] bg-no-repeat w-full max-w-[1000px] min-h-[700px] md:min-h-[750px] z-50 flex flex-col justify-center items-center px-[28px] lg:px-24 py-20"
      style="background-size: 100% 100%;"
      >
      <!-- Titre -->
      <div class="relative flex justify-center w-full h-[100px] -mt-[68px]">
        <div class="flex items-center justify-center">
          <h1 class="text-white sm:text-lg md:text-3xl font-bold">
            {{ activeTab === "elo" ? "ELO" : activeTab === "rewards" ? "RÉCOMPENSES" : "PROFIL" }}
          </h1>
        </div>
      </div>

      <!-- Bouton fermeture -->
      <button
        @click="handleClose"
        class="absolute top-20 right-5 md:right-[56px] w-10 h-10 lg:w-12 lg:h-12 bg-[url('/images/buttons/bt_close_popup_profil.png')] bg-contain bg-no-repeat"
      ></button>

      <!-- Message de chargement ou d'erreur si l'utilisateur n'est pas chargé -->
      <div v-if="!isUserLoaded" class="flex flex-1 items-center justify-center">
        <p class="text-white text-xl">Chargement des données utilisateur...</p>
      </div>

      <!-- Only show components that need user data when user exists -->
      <div v-else-if="userData" class="overflow-y-auto flex flex-1 max-w-full flex-wrap w-full">
        <!-- Bouton retour (visible pour les modes ELO et Récompenses) -->
        <button
          v-if="activeTab === 'elo' || activeTab === 'rewards'"
          @click="backToRank"
          class="absolute top-20 left-8 md:left-[60px] w-10 h-10 lg:w-12 lg:h-12 bg-[url('/images/buttons/bt_back_popup_profil.png')] bg-contain bg-no-repeat"
        ></button>


        <!-- Affichage du composant actif en fonction de l'onglet -->
        <ProfileEloChart 
          v-if="activeTab === 'elo'" 
          :user="userData" 
          :refreshTrigger="refreshData" 
        />
        
        <ProfileRewards 
          v-if="activeTab === 'rewards'"
          :refreshTrigger="refreshData"
        />

        <template v-if="activeTab === 'rang'">
          <!-- Tab navigation -->
          <div class="flex justify-center w-full h-[50px] z-10 mt-[-40px]">
            <div class="bg-[#92350f] rounded-lg overflow-hidden flex shadow-lg mx-10 w-full max-w-[400px] h-[50px] mt-[65px]">
              <button 
                @click="activeSubTab = 'rank'" 
                :class="[
                  'w-1/2 py-2 text-white font-bold transition-all duration-200 text-center',
                  activeSubTab === 'rank' ? 'bg-[#e06419]' : 'hover:bg-[#b8461f]'
                ]"
              >
                Rang
              </button>
              <button 
                @click="activeSubTab = 'credentials'" 
                :class="[
                  'w-1/2 py-2 text-white font-bold transition-all duration-200 text-center',
                  activeSubTab === 'credentials' ? 'bg-[#e06419]' : 'hover:bg-[#b8461f]'
                ]"
              >
                Identifiants
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 w-full popup-scrollbar overflow-y-auto">
            <ProfileRank 
              v-if="activeSubTab === 'rank'"
              :user="userData" 
              :refreshTrigger="refreshData"
              @show-rewards="showRewards" 
              @show-elo="showEloRanking" 
            />
            
            <ProfileCredentials 
              v-if="activeSubTab === 'credentials'"
              :user="Object.freeze(JSON.parse(JSON.stringify(userData)))" 
              @logout="logout" 
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
@import "@/assets/styles/profileComponents.css";
</style>
