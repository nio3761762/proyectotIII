import './views/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.css'
import './Server/interceptor'
import { startTokenRefreshTimer } from './Server/Autapi';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import useVuelidate from '@vuelidate/core';

const pinia = createPinia()

// Recuperación ante chunks desactualizados (deploy nuevo con index.html cacheado).
// Evita un bucle: solo recarga si no se intentó en los últimos 10 segundos.
export const recargarPorChunkDesactualizado = () => {
  const CHUNK_RELOAD_KEY = 'chunk-reload-timestamp'
  const ahora = Date.now()
  const ultimo = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0)
  if (ahora - ultimo < 10000) return
  sessionStorage.setItem(CHUNK_RELOAD_KEY, String(ahora))
  window.location.reload()
}

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  recargarPorChunkDesactualizado()
})

// Iniciar el temporizador si ya hay un token en localStorage
startTokenRefreshTimer();

createApp(App)
  .use(router)
  .use(pinia)
  .use(PrimeVue)
  .use(ToastService)
  .use(useVuelidate)
  .component('Toast', Toast)
  .mount('#app')
