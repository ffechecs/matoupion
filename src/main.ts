import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import helpers from './plugins/helpers'
import shepherdPlugin from './plugins/shepherd'

import './style.css'

const app = createApp(App)

app.use(helpers)
app.use(shepherdPlugin)

app.use(createPinia())
app.use(router)
app.mount('#app')