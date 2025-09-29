<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useApi } from '../utils/useApi'
import { useCookie } from '../utils/useCookie'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const activated = ref(false)
const badToken = ref(false)
const token = ref('')

// Définir l'émetteur d'événements pour mettre à jour les informations de page
const emit = defineEmits(['update-page-info'])

onMounted(() => {
  // Mettre à jour les informations de page
  emit('update-page-info', { name: 'verification-email', title: 'Vérification Email' })
  
  // Récupérer le token depuis les paramètres de l'URL
  token.value = route.params.token as string || route.query.token as string || ''
  
  if (!token.value) {
    badToken.value = true
    loading.value = false
    return
  }
  else {
    handleVerification()
  }
})

const handleVerification = async () => {
  try {
    let url = '/auth/activate/' + token.value
    const res = await useApi(url);

    // Type the API response to inform TypeScript about its structure
    interface ActivationResponse {
      success: boolean;
      accessToken?: string;
      userData?: any;
    }

    // Vérifier si la réponse est valide et contient les données nécessaires
    if (!res || !(res.data.value as ActivationResponse).success) {
      badToken.value = true
      loading.value = false
      return
    }

    const { accessToken, userData } = res.data.value as ActivationResponse

    // Stocker les données d'authentification
    const tokenCookie = useCookie('accessToken')
    const userDataCookie = useCookie('userData')
  
    tokenCookie.value = accessToken
    userDataCookie.value = userData
  
    authStore.setUser(userData)
    loading.value = false
    activated.value = true

  } catch (err) {
    console.error('Erreur de connexion:', err)
    badToken.value = true

  } finally {
    // Délai pour l'UX
    setTimeout(() => {
      loading.value = false
    }, 1000)
  }
}
</script>

<template>
  <div class="flex justify-center p-4">
    <div class="max-w-[577px] mx-auto">
      <div class="logo-container">
        <img src="/images/logo_login.png" alt="Matoupion" class="logo mx-auto" />
      </div>
      
      <div class="login-window flex flex-col">
        <div class="flex flex-col items-center mt-200">
          <!-- État de chargement -->
          <div v-if="loading" class="status-message">
            <div class="mb-10">Activation en cours</div>
            <div role="status" aria-live="polite">
              <svg aria-hidden="true" class="spinner" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span class="sr-only">Chargement en cours...</span>
            </div>
          </div>

          <!-- Messages de statut -->
          <p v-if="activated" class="status-message">Votre compte a été<br> activé avec succès !</p>
          <p v-if="badToken" class="status-message">Ce lien d'activation est invalide ou a expiré</p>
        </div>

        <!-- Boutons d'action -->
        <div v-if="activated" class="action-buttons">
          <button @click="router.push('/')" class="action-button">
            commencer
          </button>
        </div>

        <div v-if="badToken" class="action-buttons">
          <button @click="router.push('/login')" class="action-button">
            connexion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo {
  width: 200px;
  height: auto;
  margin-bottom: 1.5rem;
  position: relative;
  top: 80px;
}

.login-window {
  width: 577px;
  height: 549px;
  padding: 0px;
  background-image: url('/images/popups/fenetre_login.png');
  background-size: cover;
  background-position: center;
}

.mt-200 {
  margin-top: 200px;
}

.status-message {
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.4rem;
  line-height: 2.25rem;
  color: white;
}

.spinner {
  display: inline;
  width: 2.5rem;
  height: 2.5rem;
  color: #e5e7eb;
  animation: spin 1s linear infinite;
  fill: #4b5563;
}

.action-buttons {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-button {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  line-height: 1.75rem;
  background-image: url('/images/buttons/bouton_connecter.png');
  background-size: cover;
  background-repeat: no-repeat;
  width: 192px;
  height: 65px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>