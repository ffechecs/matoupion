import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'
import { useCookie } from '../utils/useCookie'
import { $api } from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isInitialized = ref(false)


  async function verifyToken() {
    const tokenCookie = useCookie('accessToken')
    if (!tokenCookie.value) return false

    try {
      const response = await $api('/auth/verify', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`
        }
      })

      if (response.valid) {
        setUser(response.userData)
        return true
      }
      return false
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  async function initializeFromCookies() {
    const tokenCookie = useCookie('accessToken')
    const userDataCookie = useCookie('userData')

    if (tokenCookie.value && userDataCookie.value) {
      setUser(userDataCookie.value)
      return await verifyToken()
    }
    return false
  }

  function setUser(userData) {

    user.value = JSON.parse(JSON.stringify(userData));
  }

  function clearUser() {
    user.value = null;
  }

  function logout() {
    user.value = null
    const tokenCookie = useCookie('accessToken')
    const userDataCookie = useCookie('userData')
    
    tokenCookie.value = null
    userDataCookie.value = null
  }

  const isAuthenticated = computed(() => {
    const tokenCookie = useCookie('accessToken')
    return !!user.value && !!tokenCookie.value
  })

  return {
    user,
    isAuthenticated,
    isInitialized,
    setUser,
    clearUser,
    logout,
    initializeFromCookies,
    verifyToken
  }
})

// Ajout de cette section pour supporter le HMR avec Pinia
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}