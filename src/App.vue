<template>
  <div class="min-h-screen" :class="!adminPage ? 'bg-background' : 'bg-background-admin'">
    <Header 
      :page="currentPageName" 
      :title="currentPageTitle" 
      :adminPage="adminPage"
    />    
    <main>
      <router-view @update-page-info="updatePageInfo" />
    </main>
    
    <!-- Contrôleur de visite guidée -->
    <TourControl v-if="showTourControl" :auto-start="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import Header from './components/Layout/Header.vue';
import TourControl from './components/TourControl.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const currentPageName = ref('');
const currentPageTitle = ref('');
const adminPage = ref(false);

// Afficher le contrôleur de visite guidée seulement sur les pages authentifiées
const showTourControl = computed(() => {
  const isAuthenticated = authStore.isAuthenticated;
  const isAuthPage = ['login', 'register', 'forgot-password', 'reset-password', 'verification-email'].includes(route.name as string);
  return isAuthenticated && !isAuthPage;
});

// Méthode pour mettre à jour les informations de la page
const updatePageInfo = (pageInfo: { name?: string; title?: string }) => {
  if (pageInfo.name) currentPageName.value = pageInfo.name;
  if (pageInfo.title) currentPageTitle.value = pageInfo.title;
};

// Déterminer la page actuelle en fonction de la route
const determineCurrentPage = () => {
  const path = route.path;
  
  if (path.includes('/theme') && path.includes('/exercices')) {
    currentPageName.value = 'exercise';
    currentPageTitle.value = route.meta.title as string || '';
  } else if (path.includes('/puzzles')) {
    currentPageName.value = 'puzzle';
    currentPageTitle.value = 'Puzzles';
  } else if (path === '/') {
    currentPageName.value = 'dashboard';
    currentPageTitle.value = '';
  } 
  else if (path === '/index-exercices') {
    currentPageName.value = 'index-exercices';
    currentPageTitle.value = '';
    adminPage.value = true;
  }
  else if (path === '/reset') {
    currentPageName.value = 'reset';
    currentPageTitle.value = '';
    adminPage.value = true;
  }
  else if (path.includes('/exercices/verif/')) {
    currentPageName.value = 'verif';
    currentPageTitle.value = '';
    adminPage.value = true;
  }
  else {
    currentPageName.value = '';
    currentPageTitle.value = '';
  }

};

// Observer les changements de route and check authentication
watch(() => route.path, (newPath) => {
  determineCurrentPage();
  
  // Ne pas dupliquer la logique de redirection du routeur
  // Les redirections basées sur l'authentification sont déjà gérées dans router.beforeEach
}, { immediate: true });

onMounted(async () => {
  // Initialize authentication from cookies when the app loads
  await authStore.initializeFromCookies();
  determineCurrentPage();
  
  // Ne pas vérifier l'authentification ici non plus
  // La logique du routeur s'en chargera
});
</script>
