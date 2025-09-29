<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useApi } from '../utils/useApi'
import { $api } from '../utils/api'
import { useCookie } from '../utils/useCookie'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
let registerAttempts = ref(0)
const formSubmitted = ref(false)
const successMessage = ref('')

const errors = ref({
  username: undefined,
  email: undefined,
  password: undefined,
})

const showPassword = ref(false)

const credentials = ref({
  username: '',
  email: '',
  password: '',
})

const handleRegister = async () => {
  try {
    loading.value = true
   
    const res = await $api('/auth/register', {
      method: 'POST',
      body: {
        username: credentials.value.username,
        email: credentials.value.email,
        password: credentials.value.password,
      },
      onResponseError({ response }) {
        errors.value = response._data.errors
      },
    })

    formSubmitted.value = true
    successMessage.value = res.message || 'Inscription réussie !</br>Veuillez vérifier votre email pour activer votre compte.'
    
    const { accessToken, userData } = res

    const tokenCookie = useCookie('accessToken')
    const userDataCookie = useCookie('userData')
    
    tokenCookie.value = accessToken
    userDataCookie.value = userData
    
    authStore.setUser(userData)

    
  } catch (err) {
    console.error('Erreur d\'inscription:', err)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="flex justify-center p-4">
   
    <div class="max-w-[577px] w-full mx-auto">
     
      <div class="logo-container">
        <img src="/images/logo_login.png" alt="Matoupion" class="logo" style="position:relative; top:80px;" />
      </div>
      
      <div class="flex flex-col w-full max-w-[577px] h-[540px] sm:h-[549px] p-0 bg-cover bg-center"   style="background-image: url('/images/popups/fenetre_login.png'); background-size: 100% 100%;">
      <h2 class="text-center mb-8 mt-[110px] text-2xl sm:text-3xl md:text-4xl">Inscription</h2>

      
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
      
      <div v-else-if="formSubmitted" class="flex flex-col items-center justify-center px-8" style="margin-top:40px;">
        <div class="text-center text-2xl mb-6 text-[#fff2d0]" v-html="successMessage"></div>
        <div class="text-center mt-6">
          <a href="/login" class="text-white underline">Retour à la connexion</a>
        </div>
      </div>
      
      <form v-else class="space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4 flex flex-col items-center">
        <div class="input-container">
            <input
              id="username"
              v-model="credentials.username"
              name="username"
              type="text"
              required
              class="game-input"
              placeholder="username"
              autocomplete="new-username"
            />
          </div>
          <div class="input-container">
            <input
              id="identifier"
              v-model="credentials.email"
              name="identifier"
              type="text"
              required
              class="game-input"
              placeholder="email"
              autocomplete="new-email"
            />
          </div>
          <div class="input-container">
           
            <input
              id="password"
              v-model="credentials.password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="game-input"
              placeholder="Mot de passe"
              autocomplete="new-password"
            />
            <button 
      type="button"
      class="password-toggle"
      @click="showPassword = !showPassword"
    >
    <EyeIcon v-if=" ! showPassword" class="size-5 text-[#FFF2D0]" />
    <EyeSlashIcon v-else class="size-5 text-[#FFF2D0]" />
    </button>
          </div>
        </div>
     

        <div v-if="errors.email != undefined || errors.password != undefined" 
        class="text-red-600  text-center" style="margin-top:40px;"
        >
         <span v-if="errors.email "> {{ Array.isArray(errors.email) ? errors.email[0] : errors.email }} </span>
         <span v-if="errors.password"> {{ Array.isArray(errors.password) ? errors.password[0] : errors.password }} </span>
        </div>
        

        <div class="space-y-4 flex flex-col items-center mt-50" style="margin-top:40px;">
        <button 
            class="px-6 text-white text-xl font-bold cta"
            style="background-image: url('/images/buttons/bouton_connecter.png'); 
            background-size: cover; background-repeat: no-repeat; width: 192px; height: 65px;"
          >
            S'inscrire
          </button>
     
     
        </div>
        </form>

        <div v-if="!formSubmitted" class="text-center text-xl mt-6"> 
          <a href="/login" class="text-white">Se connecter</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


.input-container {
  position: relative;
  width: 240px;
  height: 45px;
  background-image: url('/images/others/input_bg.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 10px;
  border-radius: 10px;
}

input.game-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  font-size: 1.2rem;
  color: white;
  background: transparent !important;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  z-index: 1;
}

input.game-input::placeholder {
  color: rgba(255, 255, 255, 0.9);
}

/* Ajout de ces règles spécifiques pour le focus */
input.game-input:focus {
  outline: none;
  border: none;
  box-shadow: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
}

/* Pour Safari et Firefox */
input.game-input:focus-visible {
  outline: none;
  border: none;
  box-shadow: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 2;
}

.password-toggle img {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.password-toggle:hover img {
  opacity: 1;
}
</style>