<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-400/10 to-red-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-red-400/10 to-orange-500/10 rounded-full blur-2xl"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-linear-to-r from-orange-300/5 to-red-400/5 rounded-full blur-xl"></div>

    <!-- Recovery Container -->
    <div class="relative w-full max-w-md">
      <!-- Header Card -->
      <div class="bg-white/80 backdrop-blur-sm rounded-t-3xl shadow-xl border border-white/50 p-8 text-center">
        <div class="flex items-center justify-center gap-4 mb-6">
          <div class="w-16 h-16 bg-linear-to-br from-orange-100 to-red-100 rounded-2xl shadow-lg flex items-center justify-center">
            <img src="./../assets/LogoMasasCorir.png" alt="Logo" class="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Recuperar Cuenta
            </h1>
            <p class="text-gray-600 text-sm font-medium">Masas C'ori</p>
          </div>
        </div> 
        
        <!-- Progress Indicator -->
        <div class="flex items-center justify-center gap-2 mb-4">
          <div
            v-for="(step, index) in steps"
            :key="index"
            :class="[
              'w-3 h-3 rounded-full transition-all duration-300',
              getCurrentStepIndex() >= index
                ? 'bg-linear-to-r from-orange-500 to-red-600 shadow-lg'
                : 'bg-gray-200'
            ]"
          ></div>
        </div>
        
        <div class="w-16 h-1 bg-linear-to-r from-orange-500 to-red-600 rounded-full mx-auto"></div>
      </div>

      <!-- Recovery Form -->
      <div class="bg-white/90 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/50 border-t-0 p-8">
        <form @submit.prevent class="space-y-6">
          
          <!-- PASO 1: Buscar Email -->
          <div v-if="paso === 'BUSCAR_EMAIL'" class="space-y-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-linear-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search class="h-8 w-8 text-orange-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-800 mb-2">Buscar tu cuenta</h2>
              <p class="text-gray-600 text-sm">Introduce tu correo electrónico para buscar tu cuenta.</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
              <div class="relative group">
                <div class="absolute inset-0 bg-linear-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                    <Mail class="h-5 w-5" />
                  </div>
                  <input
                    v-model="loginData.email"
                    type="email"
                    required
                    placeholder="ejemplo@gmail.com"
                    @input="mostrarMensajeEmail($event, true)"
                    @blur="mostrarMensajeEmail($event, false)"
                    :class="[
                      'w-full pl-12 pr-4 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none',
                      'focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30',
                      emailError ? 'ring-2 ring-red-500/20 bg-red-50' : ''
                    ]"
                  />
                </div>
              </div>
              <p v-if="emailError" class="text-red-500 text-xs italic flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ emailError }}
              </p>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="$router?.push('/login') || (window.location.href = '/login')"
                type="button"
                class="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-2xl py-3 transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                <ArrowLeft class="h-4 w-4" />
                Cancelar
              </button>
              <button
                @click="buscarUsuario"
                :disabled="isLoading"
                class="flex-1 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                <Search v-else class="h-4 w-4" />
                {{ isLoading ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </div>

          <!-- PASO 2: Verificar PIN -->
          <div v-if="paso === 'VERIFICAR_PIN'" class="space-y-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-linear-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield class="h-8 w-8 text-green-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-800 mb-2">Verificar código</h2>
              <p class="text-gray-600 text-sm">Se ha enviado un código de verificación a tu correo electrónico.</p>
            </div>

            <!-- PIN Input -->
            <div class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700 text-center">Código de Verificación</label>
              <div class="flex justify-center gap-3">
                <input
                  v-for="(digit, index) in pinDigits"
                  :key="index"
                  :ref="el => { if (el) pinInputs[index] = el }"
                  v-model="pinDigits[index]"
                  @input="handlePinInput($event, index)"
                  @keydown="handlePinKeyDown($event, index)"
                  @paste="handlePaste"
                  type="text"
                  maxlength="1"
                  class="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-gray-50/80 focus:bg-white"
                />
              </div>
              
              <!-- Resend Code -->
              <div class="text-center">
                <button
                  @click="reenviarCodigo"
                  :disabled="tiempoReenvio > 0"
                  class="text-sm text-gray-500 hover:text-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {{ tiempoReenvio > 0 ? `Reenviar en ${tiempoReenvio}s` : 'Reenviar código' }}
                </button>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="paso = 'BUSCAR_EMAIL'"
                type="button"
                class="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-2xl py-3 transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                <ArrowLeft class="h-4 w-4" />
                Atrás
              </button>
              <button
                @click="verificarPin"
                :disabled="isLoading || !isPinComplete"
                class="flex-1 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                <Shield v-else class="h-4 w-4" />
                {{ isLoading ? 'Verificando...' : 'Verificar' }}
              </button>
            </div>
          </div>

          <!-- PASO 3: Cambiar Contraseña -->
          <div v-if="paso === 'CAMBIAR_PASSWORD'" class="space-y-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-linear-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key class="h-8 w-8 text-orange-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-800 mb-2">Nueva contraseña</h2>
              <p class="text-gray-600 text-sm">Introduce una nueva contraseña segura para tu cuenta.</p>
            </div>

            <div class="space-y-4">
              <!-- Nueva Contraseña -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Nueva Contraseña</label>
                <div class="relative group">
                  <div class="absolute inset-0 bg-linear-to-r from-orange-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="relative">
                    <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                      <Lock class="h-5 w-5" />
                    </div>
                    <input
                      v-model="loginData.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      placeholder="Nueva contraseña"
                      @input="mostrarMensajePassword($event, true)"
                      @blur="mostrarMensajePassword($event, false)"
                      :class="[
                        'w-full pl-12 pr-12 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none',
                        'focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30',
                        passwordError ? 'ring-2 ring-red-500/20 bg-red-50' : ''
                      ]"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      <Eye v-if="!showPassword" class="h-5 w-5" />
                      <EyeOff v-else class="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p v-if="passwordError" class="text-red-500 text-xs italic flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ passwordError }}
                </p>
              </div>

              <!-- Confirmar Contraseña -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Confirmar Contraseña</label>
                <div class="relative group">
                  <div class="absolute inset-0 bg-linear-to-r from-orange-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="relative">
                    <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500">
                      <Lock class="h-5 w-5" />
                    </div>
                    <input
                      v-model="loginData.repeatpassword"
                      :type="showRepeatPassword ? 'text' : 'password'"
                      required
                      placeholder="Confirmar contraseña"
                      @input="mostrarMensajeRepeatPassword($event, true)"
                      @blur="mostrarMensajeRepeatPassword($event, false)"
                      :class="[
                        'w-full pl-12 pr-12 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none',
                        'focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30',
                        repeatPasswordError ? 'ring-2 ring-red-500/20 bg-red-50' : ''
                      ]"
                    />
                    <button
                      type="button"
                      @click="showRepeatPassword = !showRepeatPassword"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      <Eye v-if="!showRepeatPassword" class="h-5 w-5" />
                      <EyeOff v-else class="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p v-if="repeatPasswordError" class="text-red-500 text-xs italic flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ repeatPasswordError }}
                </p>
              </div>

              <!-- Password Strength Indicator -->
              <div v-if="loginData.password" class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-700">Seguridad de la contraseña</span>
                  <span :class="[
                    'text-xs font-semibold',
                    passwordStrength.level === 'weak' ? 'text-red-500' :
                    passwordStrength.level === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  ]">
                    {{ passwordStrength.text }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    :class="[
                      'h-2 rounded-full transition-all duration-300',
                      passwordStrength.level === 'weak' ? 'bg-red-500 w-1/3' :
                      passwordStrength.level === 'medium' ? 'bg-yellow-500 w-2/3' :
                      'bg-green-500 w-full'
                    ]"
                  ></div>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="limpiarToken"
                type="button"
                class="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-2xl py-3 transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                <X class="h-4 w-4" />
                Cancelar
              </button>
              <button
                @click="recuperarContrasena"
                :disabled="isLoading || !isPasswordValid"
                class="flex-1 bg-linear-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                <Key v-else class="h-4 w-4" />
                {{ isLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal Overlay -->
    <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <div class="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-white/50 p-8 text-center animate-slide-in">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle class="h-10 w-10 text-green-600" />
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">¡Éxito!</h3>
        <p class="text-gray-600 mb-8">Tu contraseña ha sido actualizada correctamente.</p>
        <button
          @click="$router?.push('/login') || (window.location.href = '/login')"
          class="w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 font-bold"
        >
          <LogIn class="h-5 w-5" />
          Iniciar Sesión
        </button>
      </div>
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
            <div class="text-xs text-gray-500">© {{year}} - Recuperación de cuenta</div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast Notifications -->
    <div
      v-if="showToast"
      :class="[
        'fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in',
        toastType === 'success' ? 'bg-green-500 text-white' :
        toastType === 'error' ? 'bg-red-500 text-white' :
        'bg-orange-500 text-white'
      ]"
    >
      <CheckCircle v-if="toastType === 'success'" class="h-5 w-5" />
      <AlertTriangle v-else-if="toastType === 'error'" class="h-5 w-5" />
      <Info v-else class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cambiarPassword, mensaje } from '@/Server/api';
import { useRouter } from 'vue-router';
import {
  Search, Mail, ArrowLeft, Loader2, Shield, Key, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, AlertTriangle, Info, LogIn, X
} from 'lucide-vue-next'

// Reactive data
const paso = ref('BUSCAR_EMAIL');
const isLoading = ref(false);
const showSuccess = ref(false);
const showPassword = ref(false);
const showRepeatPassword = ref(false);
const tiempoReenvio = ref(0);
const intervalId = ref(null);
const year = new Date().getFullYear();
const router = useRouter();
const esPin = ref('');
const loginData = ref({
  email: '',
  password: '',
  repeatpassword: ''
});

// PIN handling
const pinDigits = ref(['', '', '', '', '', '']);
const pinInputs = ref([]);

// Validation errors
const emailError = ref('');
const passwordError = ref('');
const repeatPasswordError = ref('');

// Toast system
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('info')

// Steps for progress indicator
const steps = ['Buscar', 'Verificar', 'Cambiar']

// Computed properties
const isPinComplete = computed(() => {
  return pinDigits.value.every(digit => digit !== '')
})

const isPasswordValid = computed(() => {
  return loginData.value.password.length >= 6 && 
         loginData.value.password === loginData.value.repeatpassword
})

const passwordStrength = computed(() => {
  const password = loginData.value.password
  if (!password) return { level: 'weak', text: 'Débil' }
  
  let score = 0
  if (password.length >= 6) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score <= 2) return { level: 'weak', text: 'Débil' }
  if (score <= 3) return { level: 'medium', text: 'Media' }
  return { level: 'strong', text: 'Fuerte' }
})

const getCurrentStepIndex = () => {
  switch (paso.value) {
    case 'BUSCAR_EMAIL': return 0
    case 'VERIFICAR_PIN': return 1
    case 'CAMBIAR_PASSWORD': return 2
    default: return 0
  }
}

// Methods
const showToastMessage = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const buscarUsuario = async () => {
  if (!validateEmail()) {
    return;
  }
  
  emailError.value = ''
  isLoading.value = true
  
  try {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000))
   
    const response = await mensaje(loginData.value);
   
    esPin.value= response.PinRecuperar;
    
    // Simular búsqueda exitosa
    showToastMessage('Código enviado a tu correo electrónico', 'success')
    paso.value = 'VERIFICAR_PIN'
    startResendTimer()
  } catch (error) {
    showToastMessage('Error al buscar la cuenta', 'error')
  } finally {
    isLoading.value = false
  }
}

const verificarPin = async () => {
  if (!isPinComplete.value) {
    showToastMessage('Por favor, completa el código de verificación', 'error')
    return
  }
  
  isLoading.value = true
  
  try {
    // Simular verificación
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const pin = pinDigits.value.join('')
    // Simular PIN correcto: 123456
    if (pin === esPin.value) {
      showToastMessage('Código verificado correctamente', 'success')
      paso.value = 'CAMBIAR_PASSWORD'
    } else {
      showToastMessage('Código incorrecto. Intenta nuevamente.', 'error')
      // Limpiar PIN
      pinDigits.value = ['', '', '', '', '', '']
      if (pinInputs.value[0]) {
        pinInputs.value[0].focus()
      }
    }
  } catch (error) {
    showToastMessage('Error al verificar el código', 'error')
  } finally {
    isLoading.value = false
  }
}

const recuperarContrasena = async () => {
  if (!validatePassword()) {
    return;
  }
  
  isLoading.value = true
  
  try {
    // Simular cambio de contraseña
    await new Promise(resolve => setTimeout(resolve, 2000))
    const response = await cambiarPassword(loginData.value);
 
    showToastMessage(response.message, 'success')
    showSuccess.value = true
  } catch (error) {
    showToastMessage('Error al cambiar la contraseña', 'error')
  } finally {
    isLoading.value = false
  }
}

const reenviarCodigo = async () => {
  if (tiempoReenvio.value > 0) return
  
  try {
    // Simular reenvío
    await new Promise(resolve => setTimeout(resolve, 1000))
    showToastMessage('Código reenviado a tu correo', 'success')
    startResendTimer()
  } catch (error) {
    showToastMessage('Error al reenviar el código', 'error')
  }
}

const startResendTimer = () => {
  tiempoReenvio.value = 60
  intervalId.value = setInterval(() => {
    tiempoReenvio.value--
    if (tiempoReenvio.value <= 0) {
      clearInterval(intervalId.value)
    }
  }, 1000)
}

const limpiarToken = () => {
  // Limpiar datos y volver al inicio
  loginData.value = { email: '', password: '', repeatpassword: '' }
  pinDigits.value = ['', '', '', '', '', '']
  paso.value = 'BUSCAR_EMAIL'
  showSuccess.value = false
  emailError.value = ''
  passwordError.value = ''
  repeatPasswordError.value = ''
}

// PIN input handlers
const handlePinInput = (event, index) => {
  const value = event.target.value.replace(/\D/g, '') // Solo números
  pinDigits.value[index] = value
  
  if (value && index < pinDigits.value.length - 1) {
    pinInputs.value[index + 1]?.focus()
  }
}

const handlePinKeyDown = (event, index) => {
  if (event.key === 'Backspace' && !pinDigits.value[index] && index > 0) {
    pinInputs.value[index - 1]?.focus()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const paste = event.clipboardData.getData('text').replace(/\D/g, '')
  const digits = paste.slice(0, 6).split('')
  
  digits.forEach((digit, index) => {
    if (index < pinDigits.value.length) {
      pinDigits.value[index] = digit
    }
  })
  
  // Focus en el siguiente campo vacío o el último
  const nextEmptyIndex = pinDigits.value.findIndex(digit => digit === '')
  const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : pinDigits.value.length - 1
  pinInputs.value[focusIndex]?.focus()
}

const isValidEmail = (email) => {
  if ((email.match(/@/g) || []).length !== 1) {
    return 'El correo debe contener exactamente un símbolo @';
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return 'El correo no tiene un formato valido.'
  }
  const localPart = email.split('@')[0]
  if (!/^[a-zA-Z0-9._]+$/.test(localPart)) {
    return 'El correo solo puede contener letras, números, "." o "_"'
  }
  return '' // No error
}

const validateEmail = () => {
  emailError.value = '';
  if (!loginData.value.email) {
    emailError.value = 'El correo electrónico es requerido';
    return false;
  }
  const error = isValidEmail(loginData.value.email);
  if (error) {
    emailError.value = error;
    return false;
  }
  return true;
};

const validatePassword = () => {
  passwordError.value = '';
  repeatPasswordError.value = '';
  let isValid = true;
  if (loginData.value.password.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres';
    isValid = false;
  }
  if (loginData.value.password !== loginData.value.repeatpassword) {
    repeatPasswordError.value = 'Las contraseñas no coinciden';
    isValid = false;
  }
  return isValid;
};

const mostrarMensajeEmail = (event, isInput) => {
  const email = event.target.value;
  emailError.value = '';
  if (!email && !isInput) {
    emailError.value = 'El correo electrónico es requerido';
  } else if (email) {
    emailError.value = isValidEmail(email);
  }
};

const mostrarMensajePassword = (event, isInput) => {
  const password = event.target.value;
  passwordError.value = '';
  if (!password && !isInput) {
    passwordError.value = 'La contraseña es requerida';
  }
};

const mostrarMensajeRepeatPassword = (event, isInput) => {
  const repeatPassword = event.target.value;
  repeatPasswordError.value = '';
  if (!repeatPassword && !isInput) {
    repeatPasswordError.value = 'Debe confirmar la contraseña';
  }
  if (loginData.value.password !== repeatPassword) {
    repeatPasswordError.value = 'Las contraseñas no coinciden';
  }
};

// Cleanup
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})

// Auto-focus on email field when component mounts
onMounted(() => {
  // Focus will be handled by the input field when it becomes visible
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

/* Custom scrollbar */
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