<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useApi } from '../utils/useApi'
import { $api } from '../utils/api'
import { useCookie } from '../utils/useCookie'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)

const queryParams = route.query;

const errors = ref({
  email: undefined,
  password: undefined,
})

const emailProvided = ref(false);

const showPassword = ref(false)

const isSuccessVisible = ref(false);

const email = ref('');
const token = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const submit = async () => {
  try {
    loading.value = true
    const res = await $api('/auth/reset-password', {
      method: 'POST',
      body: {
        email: email.value,
        token: token.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value
      },
      onResponseError({ response }) {
        errors.value = response._data.errors
        loading.value = false
        console.log(errors.value)
      }
    })

    isSuccessVisible.value = true;


  } catch (err) {
    loading.value = false
    console.error(err)
  }
   finally {
    loading.value = false
  }
}
const getUrlQueryParams = async () => {    
  await router.isReady()
  token.value = Array.isArray(route.query.token) ? route.query.token[0] : (route.query.token as string) || '';
  email.value = Array.isArray(route.query.email) ? route.query.email[0] : (route.query.email as string) || '';
  if(email.value){
    emailProvided.value = true;
  }
};

onMounted(() => {
  getUrlQueryParams()
});



</script>

<template>
  <div class="flex justify-center p-4">
   
    <div class="max-w-[577px] w-full mx-auto">
     
      <div class="logo-container">
        <img src="/images/logo_login.png" alt="Matoupion" class="logo" style="position:relative; top:80px;" />
      </div>
      
      <div class="flex flex-col w-full max-w-[577px] h-[540px] sm:h-[549px] p-0 bg-cover bg-center"   style="background-image: url('/images/popups/fenetre_login.png'); background-size: 100% 100%;">
      <h2 v-if="!isSuccessVisible" class="text-center px-5 text-xl sm:text-2xl mb-8" style="margin-top:120px;">Réinitialiser le mot de passe</h2>
      
      <div v-if="isSuccessVisible">
        <h2 class="text-center text-base md:text-2xl mb-8" style="margin-top:180px;">Réinitialisation<br> du mot de passe réussie !</h2>
      </div>
      <div v-else>
      <form class="space-y-6" @submit.prevent="submit">
        <div class="space-y-4 flex flex-col items-center">
          <div class="input-container">
            <input
              id="identifier"
              v-model="email"
              name="identifier"
              type="text"
              required
              class="game-input"
              placeholder="email"
              autocomplete="new-email"
              :readonly="emailProvided"
            />
          </div>
          <div class="input-container">
           
            <input
              id="password"
              v-model="password"
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
        class="text-red-600  text-center mt-[20px] md:mt-[40px]"
        >
         <span v-if="errors.email "> {{ Array.isArray(errors.email) ? errors.email[0] : errors.email }} </span>
         <span v-if="errors.password"> {{ Array.isArray(errors.password) ? errors.password[0] : errors.password }} </span>
        </div>
        

        <div class="space-y-4 flex flex-col items-center mt-50 mt-[20px] md:mt-[40px]">
        <button 
            class="px-6 text-white text-xl font-bold cta"
            style="background-image: url('/images/buttons/bouton_connecter.png'); 
            background-size: cover; background-repeat: no-repeat; width: 192px; height: 65px;"
          >
            Réinitialiser
          </button>
     
     
        </div>
        </form>
        </div>
        <div v-if="!isSuccessVisible" class="text-center text-xl mt-6"> 
          <a href="/login" class="text-white">Se connecter</a>
        </div>
        <div v-if="isSuccessVisible" class="text-center text-xl mt-4 md:mt-6"> 
                 <button 
                 @click="router.push('/login')"
            class="px-6 text-white text-xl font-bold cta"
            style="background-image: url('/images/buttons/bouton_connecter.png'); 
            background-size: cover; background-repeat: no-repeat; width: 192px; height: 65px;"
          >
            Se connecter
          </button>
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