<template>
  <div class="relative">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/10 to-orange-500/10 rounded-full blur-xl"></div>

    <!-- Header Container -->
    <div class="relative bg-white/80 backdrop-blur-sm shadow-xl border-b border-white/50 p-4 md:p-6">
      <div class="flex justify-between items-center">
        <!-- Left Section - Logo and Brand -->
        <div class="flex items-center gap-4">
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              <img
                src="./../assets/LogoMasasCorir.png"
                alt="Logo Masas C'ori"
                class="w-8 h-8 md:w-12 md:h-12 object-contain"
              />
            </div>
          </div>
          
          <div>
            <h1 class="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Masas C'ori
            </h1>
            <p class="text-xs md:text-sm text-gray-600 font-medium">Sistema de Gestión</p>
          </div>
        </div>

        <!-- Center Section - Quick Actions (Hidden on mobile) -->
        <!-- <div class="hidden lg:flex items-center gap-3">
          <button class="p-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg group">
            <Bell class="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </button>
          
          <button class="p-3 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 transition-all duration-300 shadow-md hover:shadow-lg group">
            <MessageSquare class="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
          </button>
          
          <button class="p-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-all duration-300 shadow-md hover:shadow-lg group">
            <Settings class="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
          </button>
        </div> -->

        <!-- Right Section - User Info and Menu -->
        <div class="flex items-center gap-4">
          <!-- User Info (Hidden on small screens) -->
          <div class="hidden sm:block text-right">
            <div class="flex items-center justify-end gap-2 mb-1">
              <Shield class="h-4 w-4 text-orange-500" />
              <span class="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {{ usuario?.usuario?.Rolusuario?.[0]?.Rol?.Nombre|| 'Sin rol' }}
                <!-- {{ usuario }} -->
              </span>
            </div>
            <div class="flex items-center justify-end gap-2">
              <User class="h-3 w-3 text-gray-500" />
              <span class="text-xs text-gray-700 font-medium">
              {{ usuario?.usuario?.Persona?.Nombre }} {{ usuario?.usuario?.Persona?.ApellidoPaterno }} 
              </span>
            </div>
          </div>

          <!-- User Menu -->
          <div class="relative" ref="menuContainer">
            <button
              @click="toggleMenu"
              class="relative group"
            >
              <!-- Avatar Container -->
              <div class="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden border-2 border-white group-hover:border-orange-200">
                <img
                  v-if="usuario?.usuario?.Persona?.Imagen?.Url"
                  :src="usuario.usuario.Persona.Imagen.Url"
                  alt="Foto de perfil"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                  <User class="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                </div>
              </div>

              <!-- Online Status Indicator -->
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>

              <!-- Notification Badge -->
              <div class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                3
              </div>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 mt-3 w-72 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 z-50 overflow-hidden animate-fade-in"
            >
              <!-- User Info Header -->
              <div class="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg overflow-hidden border-2 border-white">
                    <img
                      v-if="usuario?.usuario?.Persona?.Imagen?.Url"
                      :src="usuario.usuario.Persona.Imagen.Url"
                      alt="Foto de perfil"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                      <User class="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 text-lg">
                        {{ usuario?.usuario?.Persona?.Nombre }} {{ usuario?.usuario?.Persona?.ApellidoPaterno }} 
                    </h3>
                    <div class="flex items-center gap-2 mt-1">
                      <Shield class="h-4 w-4 text-orange-500" />
                      <span class="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                         {{ usuario?.usuario?.Rolusuario?.[0]?.Rol?.Nombre|| 'Sin rol' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span class="text-xs text-gray-600">En línea</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Menu Items -->
              <div class="p-3 space-y-1">
                <button
                  @click="navigateToProfile"
                  class="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                >
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all duration-300">
                    <User class="h-5 w-5 text-blue-600" />
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-800 group-hover:text-blue-700">Mi Perfil</div>
                    <div class="text-xs text-gray-500">Configurar cuenta</div>
                  </div>
                  <ChevronRight class="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button
                  @click="openSettings"
                  class="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
                >
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all duration-300">
                    <Settings class="h-5 w-5 text-purple-600" />
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-800 group-hover:text-purple-700">Configuración</div>
                    <div class="text-xs text-gray-500">Preferencias del sistema</div>
                  </div>
                  <ChevronRight class="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </button>

                <button
                  @click="viewNotifications"
                  class="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group"
                >
                  <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all duration-300 relative">
                    <Bell class="h-5 w-5 text-green-600" />
                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-800 group-hover:text-green-700">Notificaciones</div>
                    <div class="text-xs text-gray-500">3 nuevas notificaciones</div>
                  </div>
                  <ChevronRight class="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>

                <!-- Divider -->
                <div class="border-t border-gray-100 my-2"></div>

                <button
                  @click="logout"
                  class="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-300 group"
                >
                  <div class="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all duration-300">
                    <LogOut class="h-5 w-5 text-red-600" />
                  </div>
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-800 group-hover:text-red-700">Cerrar Sesión</div>
                    <div class="text-xs text-gray-500">Salir del sistema</div>
                  </div>
                  <ChevronRight class="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile User Info (Shown only on small screens) -->
      <div class="sm:hidden mt-4 pt-4 border-t border-gray-100/50">
        <div class="flex items-center gap-3">
          <Shield class="h-4 w-4 text-orange-500" />
          <span class="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {{ usuario?.usuario?.Rolusuario?.[0]?.Rol?.Nombre|| 'Sin rol' }}
          </span>
          <span class="text-xs text-gray-500">•</span>
          <span class="text-xs text-gray-700 font-medium">
              {{ usuario?.usuario?.Persona?.Nombre }} {{ usuario?.usuario?.Persona?.ApellidoPaterno }} 
          </span>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile menu -->
    <div
      v-if="showMenu"
      class="fixed inset-0   z-40"
      @click="closeMenu"
    ></div>

    <!-- Success Toast -->
    <div
      v-if="showToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { RolUsuario } from '@/Server/Usuario'
import { ref, onMounted, onUnmounted, defineProps } from 'vue'
import {
  User, Shield, Bell, MessageSquare, Settings, ChevronRight,
  LogOut, CheckCircle
} from 'lucide-vue-next'
import { logout, stopTokenRefreshTimer } from '@/Server/Autapi'

// Props
const props = defineProps({
  Usuario: {
    type: Object,
    default: () => ({
      Persona: {
        Nombre: 'Usuario',
        ApellidoPaterno: 'Demo',
        Imagen: { Url: null },
        Rolpersona: [{ Rol: { Nombre: '' } }]
      }
    })
  }
})

const usuario = ref({})
const obtenerRol = async (id) =>{
    try {
    const response = await RolUsuario(id);
    usuario.value = response;
    console.log(usuario.value)
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
}
// Reactive data
const showMenu = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const menuContainer = ref(null)

// Methods
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const navigateToProfile = () => {
  console.log('Navigating to profile...')
  // Si tienes Vue Router configurado:
  // this.$router.push('/home/perfil')
  showToastMessage('Navegando al perfil...')
  closeMenu()
}

const openSettings = () => {
  console.log('Opening settings...')
  showToastMessage('Abriendo configuración...')
  closeMenu()
}

const viewNotifications = () => {
  console.log('Viewing notifications...')
  showToastMessage('Mostrando notificaciones...')
  closeMenu()
}

const logout = async () => {
  console.log('Logging out...')
  try {
    await logout(); // Call the logout function from Autapi.js
    stopTokenRefreshTimer(); // Stop the token refresh timer
    showToastMessage('Cerrando sesión...');
    closeMenu();
    setTimeout(() => {
      window.location.href = '/login'; // Redirect to login page
    }, 2000);
  } catch (error) {
    console.error('Error during logout:', error);
    showToastMessage('Error al cerrar sesión.');
  }
}

const handleClickOutside = (event) => {
  if (menuContainer.value && !menuContainer.value.contains(event.target)) {
    closeMenu()
  }
}

// Lifecycle
onMounted(async ()  => {
  const usuarioStr = localStorage.getItem('usuario');
  console.log(usuarioStr)
   if (usuarioStr) {
    const usuarios = JSON.parse(usuarioStr); // convertir string a objeto
    console.log(usuarios);
    obtenerRol(usuarios.IdUsuario);  // ahora sí accedes al IdUsuario
  } else {
    console.log("No hay usuario en localStorage");
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

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

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fdba74, #f97316);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f97316, #ea580c);
}
</style>