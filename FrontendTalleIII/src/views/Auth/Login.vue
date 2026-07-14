<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-400/10 to-red-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-red-400/10 to-orange-500/10 rounded-full blur-2xl"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-linear-to-r from-orange-300/5 to-red-400/5 rounded-full blur-xl"></div>

    <!-- Login Container -->
    <div class="relative w-full max-w-md">
      <!-- Header Card -->
      <div class="bg-white/80 backdrop-blur-sm rounded-t-3xl shadow-xl border border-white/50 p-8 text-center">
        <div class="flex items-center justify-center gap-4 mb-6">
          <div class="w-16 h-16 bg-linear-to-br from-orange-100 to-red-100 rounded-2xl shadow-lg flex items-center justify-center">
            <img src="./../assets/LogoMasasCorir.png" alt="Logo" class="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Masas C'ori
            </h1> 
            <p class="text-gray-600 text-sm font-medium">Sistema de Gestión</p>
          </div>
        </div>
        
        <div class="w-16 h-1 bg-linear-to-r from-orange-500 to-red-600 rounded-full mx-auto"></div>
      </div>

      <!-- Login Form -->
      <div class="bg-white/90 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/50 border-t-0 p-8">
        <div class="space-y-6">
          <!-- Email Field -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
            <div class="relative group">
              <div class="absolute inset-0 bg-linear-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative">
                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                  <Mail class="h-5 w-5" />
                </div>
                <input
                  v-model="LoginData.email"
                  type="email"
                  required
                  @input="mostrarMensajeEmail($event)"
                  @blur="mostrarMensajeEmail($event)"
                  ref="emailRef"
                  placeholder="ejemplo@email.com"
                  :class="[
                    'w-full pl-12 pr-4 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none',
                    'focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30',
                    errors.email ? 'ring-2 ring-red-500/20 bg-red-50' : ''
                  ]"
                />
              </div>
            </div>
            <p v-if="errors.email" class="text-red-500 text-xs italic flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ errors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
            <div class="relative group">
              <div class="absolute inset-0 bg-linear-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative">
                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                  <Lock class="h-5 w-5" />
                </div>
                <input
                  v-model="LoginData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  @input="mostrarMensajePassword($event)"
                  @blur="mostrarMensajePassword($event)"
                  ref="passwordRef"
                  placeholder="Tu contraseña"
                  :class="[
                    'w-full pl-12 pr-12 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none',
                    'focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30',
                    errors.password ? 'ring-2 ring-red-500/20 bg-red-50' : ''
                  ]"
                />
                <button
                  type="button"
                  @click="togglePassword"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <Eye v-if="!showPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs italic flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ errors.password }}
            </p>
          </div>

          <!-- PIN Field -->
          <!-- <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">PIN de Seguridad</label>
            <div class="relative group">
              <div class="absolute inset-0 bg-linear-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative">
                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                  <Key class="h-5 w-5" />
                </div>
                <input
                  v-model="LoginData.pin"
                  type="password"
                  required
                  maxlength="4"
                  inputmode="numeric"
                  @input="mostrarMensajePin($event)"
                  @blur="mostrarMensajePin($event)"
                  ref="pinRef"
                  placeholder="4 dígitos"
                  :class="[
                    'w-full pl-12 pr-4 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none',
                    'focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30',
                    errors.pin ? 'ring-2 ring-red-500/20 bg-red-50' : ''
                  ]"
                />
              </div>
            </div>
            <p v-if="errors.pin" class="text-red-500 text-xs italic flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ errors.pin }}
            </p>
          </div> -->

          <!-- Error Messages -->
          <div v-if="errorMessage && tiempoRestante === 0" class="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle class="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p class="text-red-800 font-semibold text-sm">Error de autenticación</p>
                <p class="text-red-600 text-xs">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Blocked Message -->
          <div v-if="tiempoRestante > 0" class="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock class="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p class="text-orange-800 font-semibold text-sm">Usuario Bloqueado</p>
                <p class="text-orange-600 text-xs">
                  Intenta nuevamente en {{ tiempoRestante }} segundo{{ tiempoRestante > 1 ? 's' : '' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            @click="Login"
            :disabled="tiempoRestante > 0 || isLoading"
            class="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
            <LogIn v-else class="h-5 w-5" />
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>

          <!-- Forgot Password Link -->
          <div class="text-center pt-4 invisible">
            <a
              href="/recuperar"
              class="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-300 flex items-center justify-center gap-2 group"
            >
              <HelpCircle class="h-4 w-4 group-hover:text-orange-500" />
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>

      <!-- Additional Features  Conexión Segura-->
      <!-- <div class="mt-6 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <div class="flex items-center gap-2">
            <Shield class="h-4 w-4 text-green-500" />
            <span>Conexión Segura</span>
          </div>
          <div class="flex items-center gap-2">
            <Smartphone class="h-4 w-4 text-blue-500" />
            <span>Acceso Móvil</span>
          </div>
        </div>
      </div> -->
    </div>

    <!-- Footer -->
    <footer class="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 px-6 py-3">
        <div class="flex items-center gap-3 text-gray-700">
          <div class="w-8 h-8 bg-linear-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">MC</span>
          </div>
          <div class="text-center">
            <div class="font-bold text-sm">Masas C'ori</div>
            <div class="text-xs text-gray-500">© {{year}} - Todos los derechos reservados</div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Success Toast -->
    <div
      v-if="showSuccessToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">¡Inicio de sesión exitoso!</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { login } from '@/Server/api';
import { startTokenRefreshTimer } from '@/Server/Autapi';
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/sessionStore';
import {
  Mail, Lock, Key, Eye, EyeOff, LogIn, AlertCircle, AlertTriangle,
  Clock, HelpCircle, Shield, Smartphone, Loader2, CheckCircle
} from 'lucide-vue-next'

// Reactive data
const sessionStore = useSessionStore();
const LoginData = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const showSuccessToast = ref(false)
const errorMessage = ref('')
const tiempoRestante = ref(0)
const intervalId = ref(null)
const LoginAttempts = ref(0)
const year = new Date().getFullYear();
const router = useRouter();
// Validation errors
const errors = reactive({
  email: '', 
  password: '',
}) 

// Refs for form elements
const emailRef = ref(null)
const passwordRef = ref(null)
const pinRef = ref(null)

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const mostrarMensajeEmail = (event) => {
  const email = event.target.value;
  errors.email = validateField('email', email);
}

const mostrarMensajePassword = (event) => {
  const password = event.target.value;
  errors.password = validateField('password', password);
}

// const mostrarMensajePin = (event) => {
//   const pin = event.target.value;
//   // Solo permitir números
//   if (pin && !/^\d*$/.test(pin)) {
//     event.target.value = pin.replace(/\D/g, '');
//     LoginData.value.pin = event.target.value;
//   }
//   errors.pin = validateField('pin', LoginData.value.pin);
// }

const isValidEmail = (email) => {
  // Verificar que tenga exactamente un @
  if ((email.match(/@/g) || []).length !== 1) {
    return 'El correo debe contener exactamente un símbolo @'
  }

  // Expresión regular para validar formato de email
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return 'El formato del correo electrónico no es válido'
  }

  const [localPart, domain] = email.split('@')

  // Validar parte local
  if (localPart.length === 0) {
    return 'El correo debe tener contenido antes del @'
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'El correo no puede iniciar o terminar con un punto'
  }

  // Validar dominio
  if (domain.length === 0) {
    return 'El correo debe tener un dominio válido'
  }

  return '' // No error
}

const isValidPassword = (password) => {
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una letra minúscula.'
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una letra mayúscula.'
  }
  if (!/\d/.test(password)) {
    return 'La contraseña debe contener al menos un número.'
  }
  if (!/[@$!%*#?&]/.test(password)) {
    return 'La contraseña debe contener al menos un caracter especial (@$!%#*?&).'
  }
  return '' // No error
}

const validateField = (field, value) => {
  let error = '';
  switch (field) {
    case 'email':
      if (!value) {
        error = 'El correo electrónico es requerido';
      } else {
        error = isValidEmail(value);
      }
      break;
    case 'password':
      if (!value) {
        error = 'La contraseña es requerida';
      } else {
        error = isValidPassword(value);
      }
      break;
    // case 'pin':
    //   if (!value) {
    //     error = 'El PIN es requerido';
    //   } else if (!/^\d*$/.test(value)) {
    //     error = 'El PIN solo puede contener números';
    //   } else if (value.length !== 4) {
    //     error = 'El PIN debe tener exactamente 4 dígitos';
    //   }
    //   break;
    default:
      break;
  }
  return error;
};

const validateForm = () => {
  errors.email = validateField('email', LoginData.value.email);
  errors.password = validateField('password', LoginData.value.password);
 // errors.pin = validateField('pin', LoginData.value.pin);
  
  return Object.values(errors).every(error => !error);
};

const startBlockTimer = (seconds) => {
  tiempoRestante.value = seconds
  intervalId.value = setInterval(() => {
    tiempoRestante.value--
    if (tiempoRestante.value <= 0) {
      clearInterval(intervalId.value)
      LoginAttempts.value = 0
    }
  }, 1000)
};

const Login = async () => {
  // Validar formulario
  if (!validateForm()) {
    return
  }

  // Verificar si está bloqueado
  if (tiempoRestante.value > 0) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await login(LoginData.value)

    // Login exitoso
    if (response && response.token) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('refreshToken', response.Rtoken)
      localStorage.setItem('usuario', JSON.stringify(response.RelatioUsuario))

      // Reiniciar contador de intentos
      LoginAttempts.value = 0

      // Iniciar el timer de refresh del token
      startTokenRefreshTimer()

      // Cargar roles y menús inmediatamente para determinar la redirección
      await sessionStore.cargarUsuarioYRoles(response.RelatioUsuario.IdUsuario);

      // Determinar a dónde redirigir según permisos
      let redirectPath = '/home/dashboard';
      
      // Obtener todos los enlaces de los menús permitidos
      const menusPermitidos = sessionStore.menus
        .filter(m => m.menu?.Visible === 1)
        .map(m => m.menu?.Enlace?.Enlace?.toLowerCase());
      
  

      // Lógica de prioridad: Venta > Producción > Dashboard
      if (menusPermitidos.includes('/home/venta')) {
        redirectPath = '/home/venta';
      } else if (menusPermitidos.includes('/home/produccion')) {
        redirectPath = '/home/produccion';
      }

      // Mostrar mensaje de éxito
      showSuccessToast.value = true

      // Redirigir después de 2 segundos
      setTimeout(() => {
        showSuccessToast.value = false
        router.push(redirectPath)
      }, 2000)

      return true
    }
  } catch (error) {
    // Incrementar intentos fallidos
    LoginAttempts.value++

    // Verificar si se alcanzó el límite de intentos
    if (LoginAttempts.value >= 3) {
      errorMessage.value = 'Ha excedido el número de intentos. Su cuenta ha sido bloqueada por 30 segundos.'
      startBlockTimer(30)
    } else {
      // Mostrar mensaje de error con el número de intento
      const intentosRestantes = 3 - LoginAttempts.value
      errorMessage.value = `Usuario o contraseña incorrectos. Intento ${LoginAttempts.value} de 3. Te quedan ${intentosRestantes} intento${intentosRestantes > 1 ? 's' : ''}.`
    }
  } finally {
    isLoading.value = false
  }
}

// Cleanup
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})


</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #f97316, #dc2626);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ea580c, #b91c1c);
}
</style>