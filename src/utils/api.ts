import { ofetch } from 'ofetch'
import { useCookie } from './useCookie'

// Export par défaut pour faciliter l'auto-import
const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL,
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      options.credentials = 'include',
      options.headers = { 
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      } as any
    }
  },
 /* async onResponse({ response }) { 
    console.log("Raw API response before processing:", JSON.stringify(response._data))
  }
    */
})

export { $api }
export default $api