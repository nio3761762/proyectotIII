<template>
  <div class="flex h-full w-full bg-linear-to-br from-slate-50 via-orange-50/30 to-red-50/20 relative">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- Botón menú móvil -->
    <button
      v-if="isMobile && !sidebarOpen"
      @click="toggleSidebar"
      class="fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300"
    >
      <Menu class="h-6 w-6" />
    </button>

    <!-- Sidebar   -->
    <div
      :class="[
        'transition-all duration-300 ease-in-out',
        isMobile
          ? (sidebarOpen ? 'fixed inset-y-0 left-0 w-80 z-[60]' : 'hidden')
          : (sidebarOpen ? 'relative w-80 z-40' : 'relative w-20 z-40')
      ]"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Sidebar Content -->
      <div class="h-full bg-white/80 backdrop-blur-sm shadow-2xl border-r border-white/50 flex flex-col">
        <!-- Header con botón cerrar para móvil -->
        <div v-if="isMobile && sidebarOpen" class="p-4 border-b border-gray-100/50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">MC</span>
            </div>
            <h1 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Menú
            </h1>
          </div>
          <button
            @click="toggleSidebar"
            class="p-2 rounded-xl hover:bg-orange-50 transition-colors text-gray-600 hover:text-orange-600"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Navigation -->
        <div :class="[
          'flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-transparent',
          isMobile && !sidebarOpen ? '' : ''
        ]">
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
              v-if="item.submenu && item.expanded && (sidebarOpen || isMobile)"
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
              <p class="text-sm font-semibold text-gray-800">{{ sessionStore.rolSeleccionado?.Nombre }}</p>
              <p class="text-xs text-gray-500">{{ sessionStore.usuario?.Persona?.Email?.Email }}</p>
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
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] md:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineProps, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Menu, Home, Users, Package, ShoppingCart, Truck, ClipboardList,
  User, Key, Ruler , Tag, Percent, UserCheck, DollarSign,
  Calendar, MapPin, Bell, Settings, LogOut, ChevronDown, Building, Accessibility, X
} from 'lucide-vue-next'
import { RolUsuario } from '@/Server/Usuario'
import { Listarmenusrol } from '@/Server/rol'
import { logout, stopTokenRefreshTimer } from '@/Server/Autapi'
import { useAlertStore } from '@/stores/alertStore';
import { useSessionStore } from '@/stores/sessionStore';

// 1. Mapeos y constantes primero (No dependen de nada reactivo)
const menuIconMap = {
  'Dashboard': Home,
  'Gestion Datos': Settings,
  'Gestión Sucursal': Building,
  'Gestión Reporte': ClipboardList,
  'Gestión Perfil': User,
  'Gestión Rol': Key,
  'Gestión Persona': Users,
  'Gestión Producto': Package,
  'Gestión Medida': Ruler,
  'Gestión Categoría': Tag,
  'Gestión Presentación': Ruler,
  'Gestión Promoción': Percent,
  'Gestión Venta': DollarSign,
  'Gestión Comisión': Percent,
  'Gestión Transferencia': DollarSign,
  'Gestión Pedido': ClipboardList,
  'Gestión Produccion': Package,
  'Gestión Compra': ShoppingCart
};

const menuCategoryMap = {
  'Dashboard': { category: 'principal', order: 1 },
  'Gestion Datos': { category: 'principal', order: 2 },
  'Gestión Sucursal': { category: 'principal', order: 3 },
  'Gestión Reporte': { category: 'principal', order: 4 },
  'Gestión Perfil': { category: 'Usuario', categoryIcon: Users, order: 1 },
  'Gestión Rol': { category: 'Usuario', categoryIcon: Users, order: 2 },
  'Gestión Persona': { category: 'Usuario', categoryIcon: Users, order: 3 },
  'Gestión Producto': { category: 'Producto', categoryIcon: Package, order: 1 },
  'Gestión Medida': { category: 'Producto', categoryIcon: Package, order: 2 },
  'Gestión Categoría': { category: 'Producto', categoryIcon: Package, order: 3 },
  'Gestión Presentación': { category: 'Producto', categoryIcon: Package, order: 4 },
  'Gestión Promoción': { category: 'Producto', categoryIcon: Package, order: 5 },
  'Gestión Venta': { category: 'Venta', categoryIcon: DollarSign, order: 1 },
  'Gestión Comisión': { category: 'Venta', categoryIcon: DollarSign, order: 2 },
  'Gestión Transferencia': { category: 'Pedidos', categoryIcon: ClipboardList, order: 2 },
  'Gestión Pedido': { category: 'Pedidos', categoryIcon: ClipboardList, order: 1 },
  'Gestión Produccion': { category: 'Producto', categoryIcon: Package, order: 6 },
  'Gestión Compra': { category: 'Compra', categoryIcon: ShoppingCart, order: 1 }
};
// esta es la nueva lista de los menus y sus enlaces 
// // "Gestión Perfil"	"/home/perfil"
// "Gestión Rol"	"/home/rol"
// "Gestion Datos"	"/home/datos"
// "Dashboard"	"/home/dashboard"
// "Gestión Sucursal"	"/home/sucursal"
// "Gestión Venta"	"/home/venta"
// "Gestión Compra"	"/home/compra"
// "Gestión Reporte"	"/home/reporte"
// "Gestión Comisión"	"/home/comision"
// "Gestión Producto"	"/home/producto"
// "Gestión Medida"	"/home/medida"
// "Gestión Categoría"	"/home/categoria"
// "Gestión Presentación"	"/home/presentacion"
// "Gestión Promoción"	"/home/promocion"
// "Gestión Persona"	"/home/persona"
// "Gestión Transferencia"	"/home/transferencia"
// "Gestión Pedido"	"/home/pedido"
// "Gestión Produccion"	"/home/produccion"

// 2. Funciones de ayuda (Definirlas antes de usarlas en watchers)
const construirMenu = (rolMenus) => {
  if (!rolMenus || rolMenus.length === 0) return [];
  
  const categorizedMenus = {};
  const principalMenus = [];

  rolMenus.forEach(rolMenu => {
    const menuNombre = rolMenu.menu.Nombre;
    const menuEnlace = rolMenu.menu.Enlace?.Enlace || '';
    const menuVisible = rolMenu.menu.Visible;

    const categoryInfo = menuCategoryMap[menuNombre];
    if (!categoryInfo || !menuVisible) return;

    const icon = menuIconMap[menuNombre] || Package;

    const menuItem = {
      name: menuNombre,
      icon: icon,
      route: menuEnlace,
      order: categoryInfo.order || 999,
      permisos: rolMenu.permisos || []
    };

    if (categoryInfo.category === 'principal') {
      principalMenus.push({ ...menuItem, expanded: false });
    } else if (categoryInfo.category) {
      const category = categoryInfo.category;
      if (!categorizedMenus[category]) {
        categorizedMenus[category] = {
          name: category,
          icon: categoryInfo.categoryIcon,
          expanded: false,
          submenu: []
        };
      }
      categorizedMenus[category].submenu.push(menuItem);
    }
  });

  Object.values(categorizedMenus).forEach(category => {
    category.submenu.sort((a, b) => a.order - b.order);
  });
  principalMenus.sort((a, b) => a.order - b.order);

  const finalMenu = [...principalMenus];
  const categoryOrder = ['Usuario', 'Producto', 'Compra', 'Venta', 'Pedidos'];
  categoryOrder.forEach(categoryName => {
    if (categorizedMenus[categoryName]) finalMenu.push(categorizedMenus[categoryName]);
  });

  return finalMenu;
}

// 3. Datos reactivos y watchers (Ya tienen acceso a lo anterior)
const sessionStore = useSessionStore()
const sidebarOpen = ref(false)
const selectedIndex = ref(0)
const isMobile = ref(false)
const menuItems = ref([])
const currentRoute = ref('/home/dashboard')
const router = useRouter()
const alertStore = useAlertStore();
let alertInterval = null;

const updateSelectionFromRoute = () => {
  const path = router.currentRoute.value.path
  currentRoute.value = path
  
  menuItems.value.forEach((item, index) => {
    if (item.route === path) {
      selectedIndex.value = index
    } else if (item.submenu) {
      const subIndex = item.submenu.findIndex(sub => sub.route === path)
      if (subIndex !== -1) {
        selectedIndex.value = index
        item.expanded = true
      }
    }
  })
}

watch(() => sessionStore.menus, (newMenus) => {
  if (newMenus) {
    menuItems.value = construirMenu(newMenus);
    updateSelectionFromRoute();
  }
}, { immediate: true });

watch(() => router.currentRoute.value.path, () => {
  updateSelectionFromRoute();
});

// Computed properties
const currentPageTitle = computed(() => {
  const currentItem = findCurrentMenuItem()
  return currentItem ? currentItem.name : 'Dashboard'
})

const currentPageDescription = computed(() => {
  const descriptions = {
    '/home/dashboard': 'Panel principal del sistema',
    '/home/perfil': 'Gestiona tu perfil personal',
    '/home/rol': 'Configura roles y permisos',
    '/home/persona': 'Administra personas y sus datos',
    '/home/datos': 'Administración de datos generales',
    '/home/sucursal': 'Gestión de sucursales',
    '/home/venta': 'Procesa ventas y facturación',
    '/home/compra': 'Registra y controla compras',
    '/home/reporte': 'Genera y visualiza reportes del sistema',
    '/home/comision': 'Configura comisiones de venta',
    '/home/producto': 'Gestiona el catálogo de productos',
    '/home/medida': 'Define unidades de medida',
    '/home/categoria': 'Organiza productos por categorías',
    '/home/presentacion': 'Gestiona presentaciones de productos',
    '/home/promocion': 'Crea y administra promociones',
    '/home/transferencia': 'Gestiona transferencias de productos',
    '/home/pedido': 'Administra pedidos de clientes',
    '/home/produccion': 'Gestiona el proceso de producción'
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
    // En móvil, asegurarse de que el sidebar esté abierto
    if (isMobile.value && !sidebarOpen.value) {
      sidebarOpen.value = true
    }
    item.expanded = !item.expanded
    selectedIndex.value = index
  } else { 
    selectedIndex.value = index
    navigateToRoute(item.route)
  }
}

const navigateToRoute = (route) => {
  currentRoute.value = route
 
  
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

const CerrarSesion = async () =>{
    try {
    logout();
    stopTokenRefreshTimer();
    sessionStore.resetSession();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesion:', error);
  }
}

// Lifecycle
onMounted(async () => {
  const usuarioStr = localStorage.getItem('usuario');
   if (usuarioStr) {
    const usuarios = JSON.parse(usuarioStr); // convertir string a objeto
    // If store doesn't have menus yet, load them
    if (!sessionStore.menus.length) {
      await sessionStore.cargarUsuarioYRoles(usuarios.IdUsuario);
    }
  } else {
   
  }
  checkMobile();
  window.addEventListener('resize', checkMobile)
  
  // Fetch alerts periodically
  // alertStore.fetchAlerts();
  // alertInterval = setInterval(() => {
  //   alertStore.fetchAlerts();
  // }, 30000); // Check for new alerts every 30 seconds
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