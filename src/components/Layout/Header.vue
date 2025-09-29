<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import ProfilePopup from '../Popups/ProfilePopup.vue';
import { Cog6ToothIcon } from '@heroicons/vue/24/solid';
import { emitter } from "../../stores/exercise";

//props
const props = defineProps({
  page: {
    type: String,
    required: false,
    default: "",
  },
  title: {
    type: String,
    required: false,
    default: "",
  },
  adminPage: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const showProfilePopup = ref(false);
const showAdminMenu = ref(false);

const toggleProfilePopup = () => {
  showProfilePopup.value = !showProfilePopup.value;
  if (showAdminMenu.value) showAdminMenu.value = false;
};

const closeProfilePopup = () => {
  showProfilePopup.value = false;
};

const toggleAdminMenu = () => {
  showAdminMenu.value = !showAdminMenu.value;
  if (showProfilePopup.value) showProfilePopup.value = false;
};

const closeAdminMenu = () => {
  showAdminMenu.value = false;
};

const gotoReset = () => {
    showAdminMenu.value = false;
     router.push(`/reset`)
}

const gotoVerif = () => {
    showAdminMenu.value = false;
     router.push(`/exercices/verif/1`)
}

const gotoListeExercices = () => {
    showAdminMenu.value = false;
     router.push(`/index-exercices`)
}

// Add a reactive title that can be updated from other components
const pageTitle = ref(props.title || "");

// Keep pageTitle in sync with props.title when it changes
watch(() => props.title, (newTitle) => {
  if (newTitle) {
    pageTitle.value = newTitle;
  }
});

// Listen for title updates from Exercise.vue
onMounted(() => {
  emitter.on('update-title', (data) => {
    if (data && typeof data === 'object' && 'title' in data) {
      pageTitle.value = String(data.title);
    }
  });
});

// Watch for route changes to close any open menus
watch(() => route.path, () => {
  showProfilePopup.value = false;
  showAdminMenu.value = false;
});

onMounted(() => {
  //console.log(authStore.user);
})

</script>

<template>
  <header class="w-full h-[72px] flex justify-between items-center px-4">
      <div class="flex items-center w-[230px]">
        <!-- Affiche "Home" sur la page index-exercices, sinon affiche le logo -->
        <template v-if="props.adminPage">
          <a href="/" class="home-link text-white text-xl font-bold hover:underline">
            Home
          </a>
        </template>
        <template v-else>
          <!-- logo link to home -->
          <a href="/" class="logo-link">
            <img src="/images/logo_matoupion.png" alt="Logo de Matoupion"  class="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 lg:mt-[120px] mt-[48px]" />
          </a>
        </template>
      </div>

      <!-- Zone centrale pour le titre -->
      <div v-if="props.page === 'puzzle' || props.page === 'exercise'" class="text-center title-container">
        <h1 class=" text-lg sm:text-xl md:text-2xl font-spenbeb text-white">
          <span>{{ pageTitle }}</span>
        </h1>
      </div>

      <!-- Zone droite pour les boutons -->
      <div class="flex justify-end w-[230px] pt-2">
        <!-- Bouton admin - affiché uniquement si l'utilisateur est admin -->
        <button 
          v-if="authStore.user && authStore.user.admin" 
          @click="toggleAdminMenu" 
          class="w-[62px] h-[66px] flex items-center justify-center admin-link mr-2"
        >
          <Cog6ToothIcon class="w-8 h-8 text-white" />
        </button>
        
        <!-- Bouton profil - affiché uniquement si l'utilisateur est connecté -->
        <button 
          v-if="authStore.isAuthenticated" 
          @click="toggleProfilePopup" 
          class="w-[62px] h-[66px] flex items-center profile-link"
        >
          <img src="/images/buttons/bouton_profil.png" alt="Bouton pour accéder au profil" />
        </button>
      </div>
    </header>

    <!-- Menu Admin Dropdown -->
    <div v-if="authStore.user && authStore.user.admin && showAdminMenu" class="admin-dropdown">
      <div class="admin-menu-content">
        <button @click="gotoListeExercices" class="admin-menu-item">
          Liste exercices
        </button>
        <button @click="gotoVerif" class="admin-menu-item">
          Verif
        </button>
        <button @click="gotoReset" class="admin-menu-item">
          Reset
        </button>
      </div>
    </div>

    <!-- Popup Profil - affiché uniquement si l'utilisateur est connecté -->
    <ProfilePopup v-if="authStore.isAuthenticated" :show="showProfilePopup" @close="closeProfilePopup" />
</template>

<style scoped>
.input-field {
  width: 100%;
  padding: 10px;
  background-color: #f5deb3;
  border: 1px solid #8B4513;
  border-radius: 5px;
  font-size: 16px;
  margin-bottom: 8px;
}

.input-field:focus {
  outline: none;
  border-color: #deb887;
}

.admin-dropdown {
  position: absolute;
  top: 72px;
  right: 75px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.admin-menu-content {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.admin-menu-item {
  padding: 10px 15px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.admin-menu-item:hover {
  background-color: #f5f5f5;
}
</style>
