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

const isSuccessVisible = ref(false);
const submitted = ref(false);

const email = ref('')
const refform = ref(null)

const errors = ref({
  email: undefined,
})


const submit = async () => {
  try {
      loading.value = true
    submitted.value = true;
    const res = await $api('/auth/forgot-password', {
      method: 'POST',
      body: {
        email: email.value
      },
      onResponseError({ response }) {
        errors.value = response._data.errors
        submitted.value = false;
      }
    })

    isSuccessVisible.value = true;
    refform.value.reset();
    submitted.value = false;


  } catch (err) {
    submitted.value = false;
    console.error(err)
  }
  finally {
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
      <h2 v-if="!isSuccessVisible" class="text-center text-xl mb-8" style="margin-top:120px;">Réinitialiser<br> le mot de passe</h2>
      
      <div v-if="isSuccessVisible" class="text-center px-8 mt-[120px] sm:mt-[150px] text-[#FFF4CF]">
        <div class=" text-2xl mb-6">
          Un email de réinitialisation a été<br>envoyé à ton adresse email.<br>
          <br>Vérifie ta boîte de réception<br>et suis les instructions.
        </div>
        <div class="text-center text-xl mt-8"> 
               <button 
            class="px-6 text-white font-bold cta text-base md:text-xl"
            style="background-image: url('/images/buttons/cta_popup_profil.png'); 
            background-size: cover; background-repeat: no-repeat; max-width: 317px; width: 100%; height: 65px; background-size: 100% 100%;"
            @click="router.push('/login')"
          >
            Retourner à la page de login
          </button>
        </div>
      </div>

      <form v-else class="space-y-6" @submit.prevent="submit" ref="refform">
        <div class="space-y-4 flex flex-col items-center">
          <div class="input-container">
            <input
              id="identifier"
              v-model="email"
              name="identifier"
              type="text"
              required
              class="game-input"
              placeholder="Email"
              autocomplete="new-email"
            />
          </div>
        </div>
     
        <div v-if="errors.email != undefined " 
        class="text-red-600  text-center" style="margin-top:40px;"
        >
         <span v-if="errors.email "> {{ Array.isArray(errors.email) ? errors.email[0] : errors.email }} </span>

        </div>
        
        <div class="space-y-4 flex flex-col items-center mt-50" style="margin-top:40px;">
          <button 
            class="px-6 text-white font-bold cta text-xl"
            style="background-image: url('/images/buttons/bouton_connecter.png'); 
            background-size: cover; background-repeat: no-repeat; width: 192px; height: 65px;"
            :disabled="loading"
          >
            {{ loading ? 'Envoi...' : 'Réinitialiser' }}
          </button>
        </div>
      </form>

      <div v-if="!isSuccessVisible" class="text-center text-xl mt-8"> 
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