import './views/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.css'
import  './Server/interceptor'
import { refreshToken, setAccessToken } from './Server/Autapi';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import useVuelidate  from '@vuelidate/core';

const pinia = createPinia()

createApp(App)
.use(router)
.use(pinia)
.use(PrimeVue)
.use(ToastService)
.use(useVuelidate )
.component('Toast', Toast)
.mount('#app')


// setInterval(async () => {
//   try {
//     const newToken = await refreshToken(); 
//     setAccessToken(newToken);              
//     console.log('Token actualizado automáticamente');
//   } catch (error) {
//     console.warn('No se pudo refrescar el token, cerrando sesión');
//     // logout() o redirigir a login
//   }
// }, 5* 1000);
