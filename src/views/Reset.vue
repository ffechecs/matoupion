<template>
  <div class="flex flex-col items-center gap-4 mt-8">
    <button 
      @click="btnValue = 'reset1'; reset()"
      class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded w-64">
      Reset Scénario 1
    </button>

    <button 
      @click="btnValue = 'reset2'; reset()"
      class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-64">
      Reset Scénario 2
    </button>

    <button 
      @click="btnValue = 'resetempty'; reset()"
      class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-64">
      Reset Complet du parcours
    </button>

    <button 
      @click="btnValue = 'resetfull'; reset()"
      class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-64">
      Reset Tout est résolu
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useApi } from '../utils/useApi'
import { $api } from '../utils/api'

const router = useRouter()
const authStore = useAuthStore()
const { user } = authStore

const btnValue = ref('')

// Définir l'émetteur d'événements
const emit = defineEmits(['update-page-info'])

onMounted(() => {
  // Mettre à jour les informations de page
  emit('update-page-info', { name: 'reset', title: 'Reset' })
})

const reset = async () => {
  try {
    // Appel à l'API de déconnexion
    const response = await $api('/reset', 
    { method: 'POST',
      body: {
        type: btnValue.value
      }
    });
    
    if(response.success) {
     alert("Reset effectué avec succès")
     router.push('/')
    }
  } catch (error) {
    console.error('Erreur lors du reset:', error);
  }
}

</script>

<style scoped>
/* Ajouter des styles pour les animations si nécessaire */
.cursor-pointer:hover {
 cursor: pointer;
}
</style>
