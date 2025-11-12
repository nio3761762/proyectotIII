<template>
  <div class="flex h-full w-full bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 relative">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- Sidebar   -->
    <div
      :class="[
        'relative transition-all duration-300 ease-in-out z-40',
        sidebarOpen 
          ? 'w-80' 
          : 'w-20'
      ]"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Sidebar Content -->
      <div class="h-full bg-white/80 backdrop-blur-sm shadow-2xl border-r border-white/50 flex flex-col">
        <!-- Header -->
        <!-- <div class="p-6 border-b border-gray-100/50">
          <div v-if="sidebarOpen" class="flex items-center gap-3">
            <div class="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">MC</span>
            </div>
            <div>
              <h1 class="text-xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Masas C'ori
              </h1>
              <p class="text-gray-500 text-sm">Sistema de Gestión</p>
            </div>
          </div>
          <div  class="flex justify-center">
            <div class="w-10 h-10 bg-linear-to-br from-orange-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center">
              <span class="text-white font-bold">MC</span>
            </div>
          </div>
        </div> -->

        <!-- Navigation -->
        <div class="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-transparent">
          <div v-for="(item, index) in menuItems" :key="index" class="space-y-1">
            <!-- Main Menu Item -->
            <button
              @click="toggleMenuItem(item, index)"
              :class="[
                'w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                selectedIndex === index
                  ? 'bg-linear-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-[1.02]'
                  : 'hover:bg-white/60 hover:shadow-md text-gray-700 hover:text-orange-600'
              ]"
            >
              <!-- Background decoration for active item -->
              <div
                v-if="selectedIndex === index"
                class="absolute inset-0 bg-linear-to-r from-orange-400/20 to-red-500/20 rounded-2xl blur opacity-50"
              ></div>
              
              <div class="relative z-10 flex items-center gap-3 w-full">
                <div :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300',
                  selectedIndex === index 
                    ? 'bg-white/20 shadow-lg' 
                    : 'group-hover:bg-orange-50'
                ]">
                  <component 
                    :is="item.icon" 
                    :class="[
                      'h-5 w-5 transition-colors duration-300',
                      selectedIndex === index 
                        ? 'text-white' 
                        : 'text-gray-600 group-hover:text-orange-600'
                    ]" 
                  />
                </div>
                
                <span
                  v-if="sidebarOpen"
                  :class="[
                    'font-semibold transition-colors duration-300 flex-1 text-left',
                    selectedIndex === index 
                      ? 'text-white' 
                      : 'text-gray-700 group-hover:text-orange-600'
                  ]"
                >
                  {{ item.name }}
                </span>
                
                <ChevronDown
                  v-if="sidebarOpen && item.submenu"
                  :class="[
                    'h-4 w-4 transition-all duration-300',
                    item.expanded ? 'rotate-180' : 'rotate-0',
                    selectedIndex === index 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-orange-600'
                  ]"
                />
              </div>
            </button>

            <!-- Submenu -->
            <div
              v-if="sidebarOpen && item.submenu && item.expanded"
              class="ml-6 space-y-1 animate-fade-in"
            >
              <button
                v-for="(subitem, subIndex) in item.submenu"
                :key="subIndex"
                @click="navigateToRoute(subitem.route)"
                :class="[
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                  isActiveRoute(subitem.route)
                    ? 'bg-linear-to-r from-orange-100 to-red-100 border border-orange-200 text-orange-700 shadow-md'
                    : 'hover:bg-white/40 hover:shadow-sm text-gray-600 hover:text-orange-600'
                ]"
              >
                <div class="absolute inset-0 bg-linear-to-r from-orange-500/5 to-red-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div class="relative z-10 flex items-center gap-3 w-full">
                  <div :class="[
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300',
                    isActiveRoute(subitem.route)
                      ? 'bg-orange-200 shadow-sm'
                      : 'group-hover:bg-orange-50'
                  ]">
                    <component 
                      :is="subitem.icon" 
                      :class="[
                        'h-4 w-4 transition-colors duration-300',
                        isActiveRoute(subitem.route)
                          ? 'text-orange-600'
                          : 'text-gray-500 group-hover:text-orange-600'
                      ]" 
                    />
                  </div>
                  
                  <span :class="[
                    'text-sm font-medium transition-colors duration-300',
                    isActiveRoute(subitem.route)
                      ? 'text-orange-700'
                      : 'text-gray-600 group-hover:text-orange-600'
                  ]">
                    {{ subitem.name }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-100/50">
          <div v-if="sidebarOpen" class="flex items-center gap-3 p-3 rounded-2xl bg-linear-to-r from-gray-50 to-orange-50/30">
            <div class="w-10 h-10 bg-linear-to-br from-orange-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center">
              <User class="h-5 w-5 text-white" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-800">{{ usuario?.usuario?.Rolusuario?.[0]?.Rol?.Nombre }}</p>
              <p class="text-xs text-gray-500">{{ usuario?.usuario?.Persona?.Email?.Email }}</p>
            </div>
            <button @click="CerrarSesion" class="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut class="h-4 w-4" />
            </button>
          </div>
          <div v-else class="flex justify-center">
            <button class="w-10 h-10 bg-linear-to-br from-gray-100 to-orange-100 rounded-xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300">
              <User class="h-5 w-5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <!-- Top Bar -->
    

      <!-- Page Content -->
      <div class="p-6 bg-linear-to-br from-orange-50 via-red-50/30 to-orange-50/20">
        <router-view />
        
        <!-- Demo Content when no router-view -->
        <div v-if="!$route" class="space-y-6">
          <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center">
            <div class="w-24 h-24 bg-linear-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home class="h-12 w-12 text-orange-500" />
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">¡Bienvenido al Sistema!</h2>
            <p class="text-gray-600 mb-6">Selecciona una opción del menú lateral para comenzar.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <Users class="h-8 w-8 text-blue-600 mb-3" />
                <h3 class="font-semibold text-blue-800 mb-2">Gestión de Usuarios</h3>
                <p class="text-sm text-blue-600">Administra usuarios y roles del sistema</p>
              </div>
              
              <div class="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <Package class="h-8 w-8 text-green-600 mb-3" />
                <h3 class="font-semibold text-green-800 mb-2">Gestión de Productos</h3>
                <p class="text-sm text-green-600">Controla inventario y productos</p>
              </div>
              
              <div class="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <ShoppingCart class="h-8 w-8 text-purple-600 mb-3" />
                <h3 class="font-semibold text-purple-800 mb-2">Gestión de Ventas</h3>
                <p class="text-sm text-purple-600">Procesa ventas y pedidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import {
  Menu, Home, Users, Package, ShoppingCart, Truck, ClipboardList,
  User, Key, Ruler , Tag, Percent, UserCheck, DollarSign,
  Calendar, MapPin, Bell, Settings, LogOut, ChevronDown, Building, Accessibility 
} from 'lucide-vue-next'
import { RolUsuario } from '@/Server/Usuario'
import { logout, stopTokenRefreshTimer } from '@/Server/Autapi'
import { useAlertStore } from '@/stores/alertStore';

// Reactive data
const sidebarOpen = ref(false)
const selectedIndex = ref(0)
const isMobile = ref(false)
const currentRoute = ref('/home/dashboard')
const router = useRouter()
const alertStore = useAlertStore();
let alertInterval = null;

// Menu items configuration
const menuItems = ref([
  {
    name: 'Dashboard',
    icon: Home,
    route: '/home/dashboard',
    expanded: false
  },
   {
    name: 'Administrar Datos',
    icon: Settings,
    route: '/home/datos',
    expanded: false
  },
   {
    name: 'Gestion Sucursal',
    icon: Building,
    route: '/home/sucursal',
    expanded: false
  },
  {
    name: 'Usuario',
    icon: Users,
    expanded: false,
    submenu: [
      { name: 'Gestión Perfil', icon: User, route: '/home/perfil' },
      { name: 'Gestión Usuario', icon: Users, route: '/home/usuario' },
      { name: 'Gestión Rol', icon: Key, route: '/home/rol' }
    ]
  },
  {
    name: 'Producto',
    icon: Package,
    expanded: false,
    submenu: [
      { name: 'Gestión Presentacion', icon: Ruler, route: '/home/presentacion' },
      { name: 'Gestión Medida', icon: Ruler, route: '/home/medidas' },
      { name: 'Gestión Producto', icon: Package , route: '/home/producto' },
      { name: 'Gestión Promoción', icon: Percent, route: '/home/promocion' },
      { name: 'Gestión Categoría', icon: Tag, route: '/home/categoria' }
    ]
  },
  {
    name: 'Compra',
    icon: ShoppingCart,
    expanded: false,
    submenu: [
      { name: 'Gestión Proveedor', icon: UserCheck, route: '/home/proveedor' },
       { name: 'Gestión Insumo', icon: Package, route: '/home/insumo' },
      { name: 'Gestión Compra', icon: ShoppingCart, route: '/home/compras' }
    ]
  },
  {
    name: 'Venta',
    icon: DollarSign,
    expanded: false,
    submenu: [
      { name: 'Gestión Comisión', icon: Percent, route: '/home/comision' },
      { name: 'Gestión Cliente', icon: Users, route: '/home/cliente' },
      { name: 'Gestión Venta', icon: DollarSign, route: '/home/venta' }
    ]
  },
  {
    name: 'Pedidos',
    icon: ClipboardList,
    expanded: false,
    submenu: [
      { name: 'Gestión Reserva', icon: Calendar, route: '/home/reserva' },
      { name: 'Gestión Entrega/Devolucion', icon: Truck, route: '/home/entrega' },
      { name: 'Gestión Distribución', icon: Truck, route: '/home/distribucion' },
      // { name: 'Seguimiento de Envío', icon: Truck, route: '/home/seguimiento-pedido' },
    //  { name: 'Gestion Envio', icon: MapPin, route: '/home/panel-despacho' },
      { name: 'Gestión Repartidor', icon: Accessibility , route: '/home/repartidores' },
    ]
  },
  {
    name: 'Reportes',
    icon: ClipboardList,
    route: '/home/reporte',
    expanded: false
  }
])

// Computed properties
const currentPageTitle = computed(() => {
  const currentItem = findCurrentMenuItem()
  return currentItem ? currentItem.name : 'Dashboard'
})

const currentPageDescription = computed(() => {
  const descriptions = {
    '/home/dashboard': 'Panel principal del sistema',
    '/home/perfil': 'Gestiona tu perfil personal',
    '/home/usuario': 'Administra usuarios del sistema',
    '/home/rol': 'Configura roles y permisos',
    '/home/medidas': 'Define unidades de medida',
    '/home/producto': 'Gestiona el catálogo de productos',
    '/home/promocion': 'Crea y administra promociones',
    '/home/categoria': 'Organiza productos por categorías',
    '/home/proveedor': 'Administra proveedores',
    '/home/compras': 'Registra y controla compras',
    '/home/comision': 'Configura comisiones de venta',
    '/home/cliente': 'Gestiona base de clientes',
    '/home/venta': 'Procesa ventas y facturación',
    '/home/reserva': 'Gestiona reservas y citas',
    '/home/entrega': 'Controla entregas y distribución',
    '/home/reporte': 'Genera y visualiza reportes del sistema'
  }
  return descriptions[currentRoute.value] || 'Selecciona una opción del menú'
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleMouseEnter = () => {
  if (!isMobile.value) {
    sidebarOpen.value = true
  }
}

const handleMouseLeave = () => {
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

const toggleMenuItem = (item, index) => {
  if (item.submenu) {
    item.expanded = !item.expanded
    selectedIndex.value = index
  } else {
    selectedIndex.value = index
    navigateToRoute(item.route)
  }
}

const navigateToRoute = (route) => {
  currentRoute.value = route
  console.log('Navigating to:', route)
  
  // Si tienes Vue Router configurado, descomenta la siguiente línea:
  router.push(route)
  // En móvil, cerrar sidebar después de navegar
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

const isActiveRoute = (route) => {
  return currentRoute.value === route
}

const findCurrentMenuItem = () => {
  for (const item of menuItems.value) {
    if (item.route === currentRoute.value) {
      return item
    }
    if (item.submenu) {
      const subitem = item.submenu.find(sub => sub.route === currentRoute.value)
      if (subitem) {
        return subitem
      }
    }
  }
  return null
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}
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
const CerrarSesion = async () =>{
    try {
    const response = await logout();
    stopTokenRefreshTimer(); // Stop the token refresh timer
    usuario.value = response;
    router.push('/login');
    console.log(usuario.value)
  } catch (error) {
    console.error('Error al cerrar sesion:', error);
  }
}

// Lifecycle
onMounted(async () => {
  const usuarioStr = localStorage.getItem('usuario');
   if (usuarioStr) {
    const usuarios = JSON.parse(usuarioStr); // convertir string a objeto
    await obtenerRol(usuarios.IdUsuario);  // ahora sí accedes al IdUsuario
  } else {
    console.log("No hay usuario en localStorage");
  }
  checkMobile();
  window.addEventListener('resize', checkMobile)

  // Fetch alerts periodically
  alertStore.fetchAlerts();
  alertInterval = setInterval(() => {
    alertStore.fetchAlerts();
  }, 30000); // Check for new alerts every 30 seconds
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (alertInterval) {
    clearInterval(alertInterval);
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Custom scrollbar */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thumb-orange-300 {
  scrollbar-color: #fdba74 transparent;
}

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

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>