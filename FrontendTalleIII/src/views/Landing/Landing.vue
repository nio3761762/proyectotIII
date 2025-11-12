<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 relative overflow-hidden">
    <!-- Background decorations - matching login style -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/10 to-orange-500/10 rounded-full blur-2xl"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-300/5 to-red-400/5 rounded-full blur-xl"></div>

    <!-- Header -->
    <header class="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl shadow-lg flex items-center justify-center">
              <span class="text-white text-2xl font-bold">   <img src="./../assets/LogoMasasCorir.png" alt="Logo" class="w-12 h-12 object-contain" /></span>
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Masas C'ori
              </h1>
              <p class="text-gray-600 text-sm font-medium">Sistema de Gestión</p>
            </div>
          </div>

          <!-- Reemplazo de Button asChild + Link -->
          <router-link
            to="/login"
            class="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
         <User></User>
          </router-link>
        </div> 
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 container mx-auto px-4 py-16">
      <!-- Welcome Section -->
      <div class="text-center mb-16 animate-fade-in-up">
        <h2 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent mb-6">
          Bienvenido a tu
          <br />
          <span class="text-gray-800">Sistema de Ventas</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          La plataforma perfecta para gestionar las ventas de Masas C'ori. Controla inventario, procesa pedidos y
          aumenta las ventas con herramientas diseñadas especialmente para nuestra panadería.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-16 animate-fade-in-up delay-100">
        <!-- Productos Card -->
        <article
          class="text-center bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          @click="toggleSection('productos')"
        >
          <header class="p-6">
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Package class="h-8 w-8 text-orange-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              Productos
              <component :is="expandedSection === 'productos' ? 'ChevronUp' : 'ChevronDown'" class="h-5 w-5" />
            </h3>
            <p class="text-base text-gray-600 mt-3">
              Gestiona tu catálogo completo de panes, pasteles y productos de panadería con control de precios y disponibilidad
            </p>
          </header>
        </article>

        <!-- Promociones Card -->
        <article
          class="text-center bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          @click="toggleSection('promociones')"
        >
          <header class="p-6">
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Gift class="h-8 w-8 text-orange-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              Promociones
              <component :is="expandedSection === 'promociones' ? 'ChevronUp' : 'ChevronDown'" class="h-5 w-5" />
            </h3>
            <p class="text-base text-gray-600 mt-3">
              Crea ofertas especiales, descuentos por volumen y promociones estacionales para aumentar tus ventas
            </p>
          </header>
        </article>

        <!-- Empaquetado Card -->
        <article
          class="text-center bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          @click="toggleSection('empaquetado')"
        >
          <header class="p-6">
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Package2 class="h-8 w-8 text-orange-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              Presentaciones
              <component :is="expandedSection === 'empaquetado' ? 'ChevronUp' : 'ChevronDown'" class="h-5 w-5" />
            </h3>
            <p class="text-base text-gray-600 mt-3">
              Controla opciones de empaque, bolsas especiales y presentación de productos para diferentes ocasiones
            </p>
          </header>
        </article>
      </div>

      <!-- Expanded panel -->
      <section v-if="expandedSection" class="mb-16">
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 relative">
          <button
            @click="expandedSection = null"
            class="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X class="h-4 w-4 text-gray-600" />
          </button>

          <!-- Productos -->
          <div v-if="expandedSection === 'productos'">
            <h3 class="text-3xl font-bold text-gray-800 mb-6 text-center">Nuestros Productos</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(producto, index) in productosApiData" :key="producto.id || index" class="bg-white/60 rounded-2xl p-4 border border-white/50 animate-fade-in-up" :style="{ 'animation-delay': `${index * 0.1}s` }">
                <div v-if="producto.imageUrl" class="mb-4">
                  <img :src="producto.imageUrl" :alt="producto.name" class="w-full h-48 object-cover rounded-lg shadow-md">
                </div>
                <h4 class="font-bold text-gray-800 text-lg">{{ producto.name }}</h4>
                <p class="text-orange-600 font-bold text-xl">{{ producto.price }}</p>
                <p class="text-gray-600 text-sm">{{ producto.description }}</p>
                <p v-if="producto.category" class="text-gray-500 text-xs mt-1">Categoría: {{ producto.category }}</p>
              </div>
            </div>
          </div>

          <!-- Promociones -->
          <div v-if="expandedSection === 'promociones'">
            <h3 class="text-3xl font-bold text-gray-800 mb-6 text-center">Promociones Especiales</h3>
            <div class="flex overflow-x-auto snap-x snap-mandatory pb-4 -mb-4 gap-6">
              <div
                v-for="(promo, index) in promocionesApiData"
                :key="promo.id || index"
                class="flex-none w-full md:w-1/2 lg:w-1/3 snap-center bg-white/60 rounded-2xl p-6 border border-white/50 animate-fade-in-up"
                :style="{ 'animation-delay': `${index * 0.1}s` }"
              >
                <div v-if="promo.imageUrl" class="mb-4">
                  <img :src="promo.imageUrl" :alt="promo.name" class="w-full h-48 object-cover rounded-lg shadow-md">
                </div>
                <h4 class="font-bold text-gray-800 text-xl">{{ promo.name }}</h4>
                <p v-if="promo.promotionType" class="text-sm text-gray-500 mb-2">Tipo: {{ promo.promotionType }}</p>
                <div class="flex items-center gap-2 my-2">
                  <span class="text-orange-600 font-bold text-2xl">{{ promo.price }}</span>
                  <span v-if="promo.original !== promo.price" class="text-gray-500 line-through text-lg">Original: {{ promo.original }}</span>
                </div>
                <p class="text-gray-600 mb-3">{{ promo.description }}</p>
                <div v-if="promo.productsInPromotion && promo.productsInPromotion.length > 0" class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p class="font-semibold text-gray-700 mb-1">Incluye:</p>
                  <ul class="list-disc list-inside text-sm text-gray-600">
                    <li v-for="(product, pIndex) in promo.productsInPromotion" :key="pIndex">
                      {{ product.quantity }}x {{ product.productName }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Empaquetado -->
          <div v-if="expandedSection === 'empaquetado'">
            <h3 class="text-3xl font-bold text-gray-800 mb-6 text-center">Presentaciones de Productos</h3>
            <div class="grid md:grid-cols-2 gap-6">
              <div v-for="(empaque, index) in empaquetadoData" :key="empaque.name + index" class="bg-white/60 rounded-2xl p-6 border border-white/50 animate-fade-in-up" :style="{ 'animation-delay': `${index * 0.1}s` }">
                <h4 class="font-bold text-gray-800 text-xl">{{ empaque.name }}</h4>
                <p class="text-orange-600 font-bold text-2xl mb-2">{{ empaque.price }}</p>
                <p class="text-gray-600 mb-3">{{ empaque.description }}</p>
                <div class="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                  <p class="text-sm font-semibold text-orange-800">Incluye:</p>
                  <p class="text-sm text-orange-700">{{ empaque.cantidad }} {{ empaque.product }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Info Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center animate-fade-in-up delay-200">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">¿Por qué elegir nuestro sistema para Masas C'ori?</h3>
        <div class="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-gray-600"><strong class="text-gray-800">Especializado en panadería:</strong> Funciones diseñadas específicamente para el negocio de Masas C'ori</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-gray-600"><strong class="text-gray-800">Fácil de usar:</strong> Interfaz intuitiva que nuestro equipo puede aprender rápidamente</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-gray-600"><strong class="text-gray-800">Reportes de ventas:</strong> Analiza los productos más vendidos y optimiza la producción diaria</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-gray-600"><strong class="text-gray-800">Soporte especializado:</strong> Asistencia de expertos que entienden nuestro negocio</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 mt-16">
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col items-center space-y-6">
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 px-6 py-3">
            <div class="flex items-center gap-3 text-gray-700">
              <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">MC</span>
              </div>
              <div class="text-center">
                <div class="font-bold text-sm">Masas C'ori</div>
                <div class="text-xs text-gray-500">© 2025 - Todos los derechos reservados</div>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center space-y-4">
            <h4 class="text-sm font-semibold text-gray-700">Síguenos en nuestras redes sociales</h4>
            <div class="flex gap-4">
              <a
                href="https://facebook.com/masascori"
                class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 hover:text-white transition-all duration-300 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook class="h-5 w-5 text-gray-600 group-hover:text-white" />
              </a>
              <a
                href="https://instagram.com/masascori"
                class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 hover:text-white transition-all duration-300 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram class="h-5 w-5 text-gray-600 group-hover:text-white" />
              </a>
              <a
                href="https://wa.me/1234567890"
                class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 hover:text-white transition-all duration-300 group"
                target="_blank"
                rel="noopener noreferrer"
              >
        <MessageCircle class="h-5 w-5 text-gray-600 group-hover:text-white" />
              </a>
              <a
              href="https://twitter.com/masascori"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 hover:text-white transition-all duration-300 group"
              >
               <Icon icon="logos:x"  class="h-5 w-5 text-gray-600 group-hover:text-white"  />  
              </a>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <router-link to="/privacy" class="hover:text-orange-600 transition-colors">Política de Privacidad</router-link>
            <router-link to="/terms" class="hover:text-orange-600 transition-colors">Términos de Servicio</router-link>
            <router-link to="/accessibility" class="hover:text-orange-600 transition-colors">Accesibilidad</router-link>
            <router-link to="/support" class="hover:text-orange-600 transition-colors">Soporte</router-link>
            <router-link to="/contact" class="hover:text-orange-600 transition-colors">Contacto</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue';
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
  X,
} from 'lucide-vue-next'
import { listarPromociones } from '@/Server/Promocion'; // Add listarProductos
import { listarProductos, PrecioProducto } from '@/Server/Producto';


const promocionesApiData = ref([]);
const productosApiData = ref([]); // New ref for products
const pp = ref({}); // To store product prices for calculation


const expandedSection = ref<string | null>(null)

const toggleSection = (section: string) => {
  expandedSection.value = expandedSection.value === section ? null : section
}

const productosData = [
  { name: 'Pan de Batalla', price: '2 Bs', description: 'Pan tradicional boliviano' },
  { name: 'Marraqueta', price: '1.5 Bs', description: 'Pan crujiente por fuera, suave por dentro' },
  { name: 'Pan Integral', price: '3 Bs', description: 'Pan saludable con fibra' },
  { name: 'Empanadas de Pollo', price: '8 Bs', description: 'Empanadas caseras rellenas de pollo' },
  { name: 'Empanadas de Queso', price: '7 Bs', description: 'Empanadas con queso derretido' },
  { name: 'Torta de Chocolate', price: '45 Bs', description: 'Torta húmeda de chocolate' },
  { name: 'Cuñapé', price: '2.5 Bs', description: 'Pan de queso tradicional' },
  { name: 'Sopaipillas', price: '1 Bs', description: 'Masa frita tradicional' },
]

const promocionesData = [
  { name: 'Combo Desayuno', price: '15 Bs', description: '2 panes + café + mermelada', original: '18 Bs' },
  { name: 'Docena de Empanadas', price: '80 Bs', description: '12 empanadas mixtas', original: '96 Bs' },
  { name: 'Torta + 6 Cuñapés', price: '50 Bs', description: 'Perfecto para reuniones', original: '60 Bs' },
  { name: 'Pan del Día', price: '1 Bs', description: 'Pan de batalla después de las 6 PM', original: '2 Bs' },
  { name: 'Combo Familiar', price: '35 Bs', description: '6 panes + 4 empanadas + 4 cuñapés', original: '42 Bs' },
]

const precioProducto = async (id) => {
  try {
     const response = await PrecioProducto(id);
     pp.value[id] = response;
  } catch (error) {
    console.error('Error al cargar el precio del producto:', error);
  }
};

const calculatePromotionPrices = async (productos) => {
  let totalDiscounted = 0;
  let totalOriginal = 0;
  const activeProducts = productos.filter((p) => p.Estado.IdEstado === 1);
  for (const item of activeProducts) {
    let itemOriginalPrice = 0;
    let itemDiscountedPrice = 0;

    if (item.Producto && item.Producto.IdProducto) {
      if (!pp.value[item.Producto.IdProducto]) {
        await precioProducto(item.Producto.IdProducto);
      }
      const priceInfo = pp.value[item.Producto.IdProducto];
      if (priceInfo && priceInfo.Precio) {
        itemOriginalPrice = (priceInfo.Precio || 0) * (item.Cantidad || 0);
        const discount = (item.Descuento || 0) / 100;
        itemDiscountedPrice = itemOriginalPrice * (1 - discount);
      }
    } else if (item.Paquete) {
        itemOriginalPrice = (item.Paquete.PrecioVenta || 0) * (item.Cantidad || 0);
        const discount = (item.Descuento || 0) / 100;
        itemDiscountedPrice = itemOriginalPrice * (1 - discount);
    }
    totalOriginal += itemOriginalPrice;
    totalDiscounted += itemDiscountedPrice;
  }
  return {
    discounted: totalDiscounted.toFixed(2),
    original: totalOriginal.toFixed(2)
  };
};

const empaquetadoData = [
  { name: "Bolsa de 3 Cuñapés", product: "Cuñapé", cantidad:"3", price: "7.5 Bs", description: "Bolsa con 3 cuñapés" },
  { name: "Caja de 6 Empanadas", product: "Empanadas de Pollo", cantidad:"6", price: "48 Bs", description: "Caja con 6 empanadas de pollo" },
  { name: "Bolsa 2 Sopaipillas", product: "Sopaipillas", cantidad:"2", price: "2 Bs", description: "Bolsa con 2 sopaipillas" },
  { name: "Caja de 1 Torta", product: "Torta de Chocolate", cantidad:"1", price: "45 Bs", description: "Caja con 1 torta de chocolate" },
];


onMounted(async () => {
  try {
    // Fetch Promotions
    const fetchedPromotions = await listarPromociones();
    for (const promo of fetchedPromotions) {
      if (promo.Estado.IdEstado === 1) { // Only show active promotions
        const prices = await calculatePromotionPrices(promo.Promocionproducto);
        promocionesApiData.value.push({
          name: promo.Nombre,
          price: prices.discounted + ' Bs',
          description: promo.Descripcion,
          original: prices.original + ' Bs',
          id: promo.IdPromocion,
          imageUrl: promo.Imagen?.Url, // Add image URL
          productsInPromotion: promo.Promocionproducto.map(pp => ({
            quantity: pp.Cantidad,
            productName: pp.Producto?.Nombre || pp.Paquete?.Nombre
          })),
          promotionType: promo.Tipopromocion?.Nombre // Add promotion type
        });
      } 
    }

    // Fetch Products
    console.log('Fetching products...'); // Debug log
    const fetchedProducts = await listarProductos();
    console.log('Fetched products:', fetchedProducts); // Debug log
    for (const prod of fetchedProducts) {
      console.log('Processing product:', prod); // Debug log
      if (prod.Estado.IdEstado === 1) { // Only show active products
        if (!pp.value[prod.IdProducto]) {
          await precioProducto(prod.IdProducto);
        }
        const priceInfo = pp.value[prod.IdProducto]?.Precio;
    //    console.log('Product price info:', priceInfo); // Debug log
        productosApiData.value.push({
          name: prod.Nombre,
          price: (priceInfo || 0) + ' Bs', // Use fetched price
          description: prod.Descripcion,
          imageUrl: prod.Imagen?.Url,
          category: prod.Subcategoria?.Nombre,
          id: prod.IdProducto
        });
        console.log('Pushed to productosApiData:', productosApiData.value[productosApiData.value.length - 1]); // Debug log
      } else {
        console.log('Product not active, skipping:', prod); // Debug log
      }
    }

  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
});

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
</style>