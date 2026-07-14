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
