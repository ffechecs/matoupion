<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useAuthStore } from "../../../stores/auth";
import { $api } from "../../../utils/api";
import { useCookie } from "../../../utils/useCookie";
import { EnvelopeIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
  user: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const localUser = ref({
  ...JSON.parse(JSON.stringify(props.user || {}))
});

watch(() => props.user, (newUser) => {
  if (newUser) {
    localUser.value = {
      ...JSON.parse(JSON.stringify(newUser)),
      email: newUser.email === undefined || newUser.email === null ? null : newUser.email
    };
  } else {
    localUser.value = {email: null};
  }

}, { deep: true });

defineEmits(["logout"]);

const authStore = useAuthStore();
const password = ref("");
const message = ref("");
const success = ref(false);

const updateAccount = async () => {
  try {
    const response = await $api("/auth/update-account", {
      method: "POST",
      body: JSON.stringify({
        username: localUser.value.username,
        email: localUser.value.email,
        password: password.value,
      }),
    });
    success.value = true;
    message.value = "Compte mis à jour avec succès!";
    setTimeout(() => {
      message.value = "";
    }, 5000);

    const userDataCookie = useCookie("userData");
    userDataCookie.value = response.userData;
    authStore.setUser(response.userData);
  } catch (error) {
    
    success.value = false;
    
    if (error.data && error.data.errors) {
      const errorField = Object.keys(error.data.errors)[0];
      if (errorField) {
        message.value = error.data.errors[errorField][0];
        return;
      }
    }
    
    // Message par défaut si aucune erreur spécifique n'est trouvée
    message.value = "Erreur lors de la mise à jour du compte.";
  }
};


</script>

<template>
  <div class="p-8 pt-20">
    <div class="">
      <h2 class="text-white text-xl font-bold mb-4 text-center">
        IDENTIFIANTS
      </h2>
      <div 
        class="flex flex-col items-center justify-center h-full">
        <form @submit.prevent="updateAccount"    autocomplete="off" class="w-full max-w-md">
          <!-- Pseudo -->
          <div class="mb-8 mt-6 relative">
            <div class="input-container">
              <div class="input-icon">
                <img
                  src="/images/others/picto_login_user.png"
                  alt="Pseudo"
                  class="w-5 h-6"
                />
              </div>
              <input
                type="Pseudo"
                v-model="localUser.username"
                class="game-input pl-10"
                placeholder="Pseudo"
                required
              />
            </div>
          </div>

          <!-- Email -->
          <div class="mb-8 relative">
            <div class="input-container">
              <div class="input-icon">
                <EnvelopeIcon class="w-6 h-7 font-bold text-[#FFF4CF]" />
              </div>
              <input
                type="email"
                v-model="localUser.email"
                class="game-input pl-10"
                placeholder="Email"
                 autocomplete="off"
              />
            </div>
          </div>

          <!-- Mot de passe -->
          <div class="mb-8 relative">
            <div class="input-container">
              <div class="input-icon">
                <img
                  src="/images/others/picto_login_mdp.png"
                  alt="Lock"
                  class="w-5 h-6"
                />
              </div>
              <input
                type="password"
                v-model="password"
                class="game-input pl-10"
                placeholder="Mot de passe"
                   autocomplete="off"
              />
            </div>
          </div>

          <!-- Bouton de modification -->
          <div class="flex flex-col items-center">
            <button type="submit" class="cta-button mb-4">ENREGISTRER</button>
            <span
              v-if="message"
              class="text-center font-bold mb-4"
              :class="{
                'text-green-400': success,
                'text-red-400': !success,
              }"
            >
              {{ message }}
            </span>
          </div>
        </form>
      </div>
    </div>
    <div class="flex justify-center">
    <button
      @click.prevent="$emit('logout')"
      class="text-white underline hover:text-yellow-300 text-center mx-auto"
    >
      Déconnexion
    </button>
    </div>
  </div>
</template>

<style>
@import "@/assets/styles/profileComponents.css";
</style> 
