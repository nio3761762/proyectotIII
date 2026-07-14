<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-48 h-48 md:w-80 md:h-80 bg-gradient-to-tr from-red-400/10 to-orange-500/10 rounded-full blur-2xl"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-r from-orange-300/5 to-red-400/5 rounded-full blur-xl"></div>

    <!-- Header -->
    <header class="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-sm sticky top-0">
      <div class="container mx-auto px-4 py-3 md:py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 md:gap-4">
            <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
              <img src="./../assets/LogoMasasCorir.png" alt="Logo" class="w-8 h-8 md:w-12 md:h-12 object-contain" />
            </div>
            <div>
              <h1 class="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent leading-tight">
                Masas C'ori
              </h1>
              <p class="text-[10px] md:text-sm text-gray-600 font-medium uppercase tracking-wider">Sistema de Gestión</p>
            </div>
          </div>

          <router-link
            to="/login"
            class="px-4 py-2 md:px-8 md:py-4 text-sm md:text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2"
          >
            <User class="w-4 h-4 md:w-6 md:h-6" />
            <span class="hidden sm:inline">Ingresar</span>
          </router-link>
        </div> 
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 container mx-auto px-4 py-8 md:py-16">
      <!-- Welcome Section -->
      <div class="text-center mb-10 md:mb-16 animate-fade-in-up">
        <h2 class="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent mb-4 md:mb-6">
          Bienvenido a tu
          <br />
          <span class="text-gray-800">Sistema de Ventas</span>
        </h2>
        <p class="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed">
          La plataforma perfecta para gestionar las ventas de Masas C'ori. Controla inventario, procesa pedidos y
          aumenta las ventas con herramientas diseñadas para nuestra panadería.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-16 animate-fade-in-up delay-100 max-w-4xl mx-auto">
        <!-- Productos Card -->
        <article
          class="text-center bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl md:rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group"
          @click="toggleSection('productos')"
        >
          <header class="p-4 md:p-6">
            <div class="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-colors">
              <Package class="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
            </div>
            <h3 class="text-lg md:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              Productos
              <component :is="expandedSection === 'productos' ? ChevronUp : ChevronDown" class="h-4 w-4 md:h-5 md:w-5" />
            </h3>
            <p class="text-xs md:text-base text-gray-600 mt-2 md:mt-3 line-clamp-2 md:line-clamp-none">
              Catálogo completo de panes y pastelería con precios actualizados.
            </p>
          </header>
        </article>

        <!-- Promociones Card -->
        <article
          class="text-center bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl md:rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group"
          @click="toggleSection('promociones')"
        >
          <header class="p-4 md:p-6">
            <div class="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-colors">
              <Gift class="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
            </div>
            <h3 class="text-lg md:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              Promociones
              <component :is="expandedSection === 'promociones' ? ChevronUp : ChevronDown" class="h-4 w-4 md:h-5 md:w-5" />
            </h3>
            <p class="text-xs md:text-base text-gray-600 mt-2 md:mt-3 line-clamp-2 md:line-clamp-none">
              Ofertas especiales y combos diseñados para consentir tu paladar.
            </p>
          </header>
        </article>
      </div>

      <!-- Expanded panel -->
      <section v-if="expandedSection" class="mb-10 md:mb-16">
        <div class="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/50 p-4 md:p-8 relative">
          <button
            @click="expandedSection = null"
            class="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-20 shadow-sm"
          >
            <X class="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </button>

          <!-- Navigation Arrows (Desktop Only) -->
          <div class="hidden lg:block">
            <button 
              @click="scroll('left')"
              class="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-all z-20 border border-orange-100"
            >
              <ChevronLeft class="h-6 w-6" />
            </button>
            <button 
              @click="scroll('right')"
              class="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-all z-20 border border-orange-100"
            >
              <ChevronRight class="h-6 w-6" />
            </button>
          </div>

          <!-- Productos Section -->
          <div v-if="expandedSection === 'productos'">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-2">
              <h3 class="text-xl md:text-3xl font-bold text-gray-800">Nuestros Productos</h3>
              <div class="flex items-center gap-2 text-gray-400 text-xs md:text-sm italic">
                <span class="md:hidden">Desliza horizontalmente</span>
                <span class="hidden md:inline">Arrastra o usa las flechas</span>
              </div>
            </div>
            
            <div 
              ref="scrollContainer"
              class="flex overflow-x-auto snap-x snap-mandatory pb-4 md:pb-6 gap-4 md:gap-6 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
              @mousedown="startDragging"
              @mousemove="onDragging"
              @mouseup="stopDragging"
              @mouseleave="stopDragging"
            >
              <div 
                v-for="(producto, index) in productosApiData" 
                :key="producto.id || index" 
                class="flex-none w-[280px] md:w-80 snap-center bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                <div class="h-40 md:h-48 overflow-hidden relative group pointer-events-none">
                  <img 
                    v-if="producto.imageUrl" 
                    :src="producto.imageUrl" 
                    :alt="producto.name" 
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  >
                  <div v-else class="w-full h-full bg-orange-50 flex items-center justify-center">
                    <Package class="h-10 w-10 md:h-12 md:w-12 text-orange-200" />
                  </div>
                  <div class="absolute top-2 left-2 md:top-3 md:left-3">
                    <span class="px-2 py-0.5 md:px-3 md:py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold text-orange-600 shadow-sm border border-orange-100">
                      {{ producto.category || 'Panadería' }}
                    </span>
                  </div>
                </div>
                
                <div class="p-4 md:p-5 flex-grow flex flex-col">
                  <div class="pointer-events-none flex-grow">
                    <h4 class="font-bold text-gray-800 text-lg md:text-xl mb-1 md:mb-2 line-clamp-1">{{ producto.name }}</h4>
                    <p class="text-gray-500 text-xs md:text-sm line-clamp-2 mb-3 md:mb-4">{{ producto.description }}</p>
                  </div>
                  
                  <div class="flex items-center justify-between mt-auto pt-3 md:pt-4 border-t border-gray-50">
                    <div class="pointer-events-none">
                      <span class="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">Precio</span>
                      <span class="text-lg md:text-2xl font-black text-orange-600">{{ producto.price }}</span>
                    </div>
                    <a 
                      :href="'https://wa.me/59161868916?text=' + encodeURIComponent('Hola, me interesa el producto: ' + producto.name)"
                      target="_blank"
                      class="p-2 md:p-3 bg-green-100 text-green-600 rounded-lg md:rounded-xl hover:bg-green-600 hover:text-white transition-all transform hover:scale-110 shadow-sm active:scale-95 z-10"
                      @mousedown.stop
                    >
                      <MessageCircle class="h-5 w-5 md:h-6 md:w-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Promociones Section -->
          <div v-if="expandedSection === 'promociones'">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-2">
              <h3 class="text-xl md:text-3xl font-bold text-gray-800">Promociones Especiales</h3>
              <div class="flex items-center gap-2 text-gray-400 text-xs md:text-sm italic">
                <span class="md:hidden">Desliza horizontalmente</span>
                <span class="hidden md:inline">Arrastra o usa las flechas</span>
              </div>
            </div>

            <div 
              ref="scrollContainer"
              class="flex overflow-x-auto snap-x snap-mandatory pb-4 md:pb-6 gap-4 md:gap-6 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
              @mousedown="startDragging"
              @mousemove="onDragging"
              @mouseup="stopDragging"
              @mouseleave="stopDragging"
            >
              <div
                v-for="(promo, index) in promocionesApiData"
                :key="promo.id || index"
                class="flex-none w-[300px] md:w-[400px] snap-center bg-white rounded-2xl md:rounded-3xl border-2 border-orange-50 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
              >
                <div class="h-44 md:h-52 overflow-hidden relative pointer-events-none">
                  <img 
                    v-if="promo.imageUrl" 
                    :src="promo.imageUrl" 
                    :alt="promo.name" 
                    class="w-full h-full object-cover"
                  >
                  <div v-else class="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Gift class="h-12 w-12 md:h-16 md:w-16 text-white/50" />
                  </div>
                  <div class="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                    Ahorra más
                  </div>
                </div>

                <div class="p-4 md:p-6 flex-grow flex flex-col">
                  <div class="pointer-events-none">
                    <div class="mb-2 md:mb-3">
                      <span class="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-widest mb-0.5 md:mb-1 block">{{ promo.promotionType || 'Combo' }}</span>
                      <h4 class="font-black text-gray-800 text-lg md:text-2xl leading-tight">{{ promo.name }}</h4>
                    </div>
                    <p class="text-gray-500 text-xs md:text-sm mb-4 md:mb-6 line-clamp-2 italic">"{{ promo.description }}"</p>
                    <div class="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 md:mb-6 border border-gray-100">
                      <p class="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 md:mb-3 flex items-center gap-2">
                        <Package2 class="h-3 w-3" /> Incluye:
                      </p>
                      <ul class="space-y-1.5 md:space-y-2">
                        <li v-for="(product, pIndex) in promo.productsInPromotion" :key="pIndex" class="flex items-center text-xs md:text-sm text-gray-700">
                          <span class="w-5 h-5 md:w-6 md:h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold mr-2 md:mr-3">{{ product.quantity }}</span>
                          <span class="font-medium truncate">{{ product.productName }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="mt-auto flex items-end justify-between border-t border-dashed border-gray-200 pt-4 md:pt-5">
                    <div class="pointer-events-none">
                      <span class="text-xs md:text-sm text-gray-400 line-through font-bold block">{{ promo.original }}</span>
                      <span class="text-xl md:text-3xl font-black text-orange-600">{{ promo.price }}</span>
                    </div>
                    <a 
                      :href="'https://wa.me/59161868916?text=' + encodeURIComponent('Hola, me interesa la promoción: ' + promo.name)"
                      target="_blank"
                      class="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 z-10"
                      @mousedown.stop
                    >
                      <MessageCircle class="h-4 w-4 md:h-5 md:w-5" />
                      Lo quiero
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Info Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/50 p-6 md:p-8 text-center animate-fade-in-up delay-200">
        <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">¿Por qué elegir nuestro sistema?</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left max-w-4xl mx-auto">
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-xs md:text-base text-gray-600"><strong class="text-gray-800">Especializado:</strong> Diseñado específicamente para el negocio de Masas C'ori.</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-xs md:text-base text-gray-600"><strong class="text-gray-800">Fácil de usar:</strong> Interfaz intuitiva para aprendizaje rápido.</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-xs md:text-base text-gray-600"><strong class="text-gray-800">Analítica:</strong> Optimiza tu producción con reportes detallados.</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-xs md:text-base text-gray-600"><strong class="text-gray-800">Soporte:</strong> Asistencia de expertos que entienden tu negocio.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 mt-10 md:mt-16 bg-white/40 backdrop-blur-md border-t border-white/50">
      <div class="container mx-auto px-4 py-8 md:py-12">
        <div class="flex flex-col items-center space-y-6 md:space-y-8">
          <div class="bg-white/80 rounded-2xl shadow-sm border border-white px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                <span class="text-white font-bold text-xs">MC</span>
              </div>
              <div>
                <div class="font-bold text-gray-800 text-sm md:text-base">Masas C'ori</div>
                <div class="text-[10px] md:text-xs text-gray-500 font-medium tracking-wide">© {{year}} - Todos los derechos reservados</div>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center space-y-4">
            <h4 class="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-widest">Síguenos</h4>
            <div class="flex gap-4 md:gap-6">
              <a href="#" class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all transform hover:-translate-y-1">
                <Facebook class="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a href="#" class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all transform hover:-translate-y-1">
                <Instagram class="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a href="https://wa.me/59161868916" target="_blank" class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1">
                <MessageCircle class="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a href="#" class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">
                <Icon icon="logos:x" class="h-4 w-4 md:h-5 md:w-5" />
              </a>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] md:text-sm font-medium text-gray-500">
            <router-link to="#" class="hover:text-orange-600 transition-colors">Privacidad</router-link>
            <router-link to="#" class="hover:text-orange-600 transition-colors">Términos</router-link>
            <router-link to="#" class="hover:text-orange-600 transition-colors">Contacto</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import {
  Package,
  User,
  Gift,
  Package2,
  Facebook,
  Instagram,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-vue-next'
import { listarPromocionesVista } from '@/Server/Promocion'
import { listProductoVista } from '@/Server/Producto'

const promocionesApiData = ref([])
const productosApiData = ref([])
const expandedSection = ref(null)
const scrollContainer = ref(null)
const year = new Date().getFullYear(); 
// Dragging State
let isDragging = false
let startX
let scrollLeft

const toggleSection = (section) => {
  expandedSection.value = expandedSection.value === section ? null : section
}

const scroll = (direction) => {
  if (!scrollContainer.value) return
  const scrollAmount = window.innerWidth < 768 ? 300 : 400
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

const startDragging = (e) => {
  isDragging = true
  startX = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft = scrollContainer.value.scrollLeft
}

const stopDragging = () => {
  isDragging = false
}

const onDragging = (e) => {
  if (!isDragging) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX) * 2
  scrollContainer.value.scrollLeft = scrollLeft - walk
}

onMounted(async () => {
  try {
    const responsePromos = await listarPromocionesVista('', 1, 12)
    if (responsePromos && responsePromos.data) {
      promocionesApiData.value = responsePromos.data.map(promo => {
        let totalOriginal = 0
        if (promo.Promocionproducto && Array.isArray(promo.Promocionproducto)) {
          totalOriginal = promo.Promocionproducto.reduce((sum, pp) => {
            const price = pp.Productomedida?.PrecioVenta || 0
            return sum + (price * (pp.Cantidad || 0))
          }, 0)
        }
        return {
          name: promo.nombre || 'Promoción Especial',
          price: (promo.preciopromocion || 0) + ' Bs',
          description: promo.descripcion || 'Una oferta deliciosa que no puedes dejar pasar.',
          original: totalOriginal.toFixed(2) + ' Bs',
          id: promo.idpromocion,
          imageUrl: promo.imagen,
          productsInPromotion: promo.Promocionproducto?.map(pp => ({
            quantity: pp.Cantidad || 0,
            productName: pp.Productomedida?.Producto?.Nombre || 'Producto'
          })) || [],
          promotionType: promo.Tipopromocion?.Nombre || 'Combo'
        }
      })
    }

    const responseProds = await listProductoVista('', 1, 15)
    if (responseProds && responseProds.data) {
      productosApiData.value = responseProds.data.map(prod => {
        const price = prod.Productomedida && prod.Productomedida.length > 0 
          ? prod.Productomedida[0].PrecioVenta 
          : 0
        return {
          name: prod.nombre || 'Producto Premium',
          price: (price || 0) + ' Bs',
          description: prod.descripcion || 'Calidad y sabor artesanal en cada bocado.',
          imageUrl: prod.imagen,
          category: prod.Subcategoria?.Nombre || 'Especialidad',
          id: prod.idproducto
        }
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
  }
})
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;   
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.snap-x {
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.snap-center {
  scroll-snap-align: center;
}

.select-none {
  user-select: none;
  -webkit-user-drag: none;
}

/* Specific styling for iOS momentum scrolling */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}
</style>