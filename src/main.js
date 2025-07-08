import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/index.js'
import Notifications from '@kyvg/vue3-notification'

import { createPinia } from 'pinia';

const app = createApp(App)

app.use(createPinia());
app.use(router)
app.use(Notifications)
app.mount('#app')
