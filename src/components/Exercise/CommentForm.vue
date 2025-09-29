<template>
  <div class="comments-section bg-gray-100 p-4 rounded-lg shadow" >

<button v-if="!route.meta.verif"
        @click="gotoEditForm" 
        class="mt-2 px-4 py-1 rounded font-small transition-all bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
        éditer l'exercice
      </button>

    <h3 class="text-lg text-black font-bold mb-3 mt-7" style="font-family: 'Roboto', sans-serif;">Evaluation</h3>
    
    <!-- Zone d'ajout de commentaire -->
    <div class="comment-form mb-4">
      <div class="flex items-center mb-2">
        <button 
          @click="sentiment = 'negative'" 
          class="mr-2 p-1 rounded"
          :class="{ 'bg-red-200': sentiment === 'negative' }"
        >
          <ThumbDownIcon class="w-8 h-8 text-red-500" />
        </button>
        
        <button 
          @click="sentiment = 'positive'" 
          class="mr-2 p-1 rounded"
          :class="{ 'bg-green-200': sentiment === 'positive' }"
        >
          <ThumbUpIcon class="w-8 h-8 text-green-500" />
        </button>
      </div>
      
      <!-- Message d'erreur pour le sentiment -->
      <div v-if="showSentimentError" class="text-red-500 text-sm mb-2">
        Veuillez sélectionner une évaluation (pouce en haut ou en bas)
      </div>
      
      <textarea 
        v-model="commentText" 
        class="w-full p-2 border rounded resize-none"
        rows="3"
        placeholder="Ajouter un commentaire (facultatif)..."
      ></textarea>
      
      <button 
        @click="addComment" 
        class="mt-2 px-4 py-2 rounded font-medium transition-all"
        :class="[
          sentiment 
            ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
        ]"
        :disabled="!sentiment"
      >
        {{ sentiment ? 'Ajouter' : 'Evaluer' }}
      </button>
    </div>
    
    <!-- Liste des commentaires -->
    <div v-if="comments.length > 0" class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment.id" 
        class="comment-item border-b py-2 last:border-0"
      >
        <div class="flex items-start">
          <ThumbUpIcon v-if="comment.is_working" class="w-5 h-5 mt-1 mr-2 text-green-500" />
          <ThumbDownIcon v-else class="w-5 h-5 mt-1 mr-2 text-red-500" />
          <div>
            <div class="flex items-center">
              <span class="font-semibold text-sm">{{ comment.user.name }}</span>
              <span class="text-xs text-gray-500 ml-2">
                {{ formatDate(comment.created_at) }}
              </span>
            </div>
            <p v-if="comment.content" class="text-sm mt-1">{{ comment.content }}</p>
            <p v-else class="text-sm mt-1 text-gray-500 italic">Pas de commentaire</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-sm text-gray-500">
      Aucun commentaire pour cet exercice.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useApi } from '../../utils/useApi';
import { HandThumbUpIcon as ThumbUpIcon, HandThumbDownIcon as ThumbDownIcon } from '@heroicons/vue/24/solid';
import { useRoute,useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  exerciseId: {
    type: Number,
    required: true
  }
});

const commentText = ref('');
const sentiment = ref('');
const comments = ref([]);
const showSentimentError = ref(false);

const gotoEditForm = () => {
  router.push(`/exercices/verif/${props.exerciseId}`);
}

// Charger les commentaires existants
const loadComments = async () => {
  if (!props.exerciseId) return;
  
  try {
    const { data, response } = await useApi(`/exercises/${props.exerciseId}/comments`, {
      method: 'GET'
    });
    
    if (response.value.ok && data.value && data.value.data) {
      comments.value = data.value.data;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires:', error);
  }
};

// Ajouter un nouveau commentaire
const addComment = async () => {

  // Vérifier si le sentiment est sélectionné
  if (!sentiment.value) {

    showSentimentError.value = true;
    return;
  }
  
  showSentimentError.value = false;
    
  try {
    const { data, response } = await useApi(`/exercises/${props.exerciseId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content: commentText.value.trim() || null,
        evaluation: sentiment.value === 'positive'
      })
    });
    
    if (response.value.ok && data.value && data.value.success) {
      commentText.value = '';
      sentiment.value = '';
      loadComments(); // Recharger les commentaires
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
  }
};

// Formater la date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Masquer l'erreur quand l'utilisateur sélectionne un sentiment
watch(sentiment, (newValue) => {
  if (newValue) {
    showSentimentError.value = false;
  }
});

// Surveiller les changements d'exercice
watch(() => props.exerciseId, (newId) => {
  if (newId) {
    loadComments();
  }
});

onMounted(() => {
  if (props.exerciseId) {
    loadComments();
  }
});
</script>

<style scoped>
.comments-section {
  max-width: 350px;
  max-height: 600px;
  overflow-y: auto;
  font-family: 'Roboto', sans-serif;
}
</style> 