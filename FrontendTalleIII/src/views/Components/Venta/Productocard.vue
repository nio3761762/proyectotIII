<template>
  <div
    @click="!disabled && $emit('select', producto)"
    :class="[
      'bg-white/60 rounded-2xl p-3 border border-white/50 hover:shadow-md transition-all duration-300 group flex flex-col h-full',
      disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'
    ]"
  >
    <div class="h-32 mb-2 rounded-xl overflow-hidden relative">
      <!-- Image Carousel -->
      <div class="absolute inset-0 w-full h-full">
        <Transition name="fade" mode="out-in">
          <img 
            :key="currentImageUrl"
            :src="currentImageUrl"
            :alt="producto.nombre || producto.Nombre"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        </Transition>
      </div>

      <!-- Carousel Indicators -->
      <div v-if="allImages.length > 1" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        <div 
          v-for="(_, index) in allImages" 
          :key="index" 
          :class="['w-1.5 h-1.5 rounded-full transition-all duration-300', currentImageIndex === index ? 'bg-orange-500 w-3' : 'bg-white/60']"
        ></div>
      </div>

      <div v-if="stock <= 0" class="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
        <span class="text-white font-bold text-xs px-2 py-1 bg-red-600 rounded-lg shadow-lg">Agotado</span>
      </div>
    </div>
    
    <div class="flex-1">
      <h4 class="font-semibold text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">{{ producto.nombre || producto.Nombre }}</h4>
      <p class="text-xs text-gray-500 mb-2 font-medium">Stock: {{ Number(stock).toFixed(0) }} unidades</p>
      
      <!-- Medidas / Precios -->
      <div class="space-y-1">
        <div 
          v-for="medida in listadoMedidas" 
          :key="medida.idproductomedida || medida.IdPresentacion"
          :class="[
            'flex justify-between items-center text-[11px] p-2 rounded-xl border transition-all',
            disabled 
              ? 'bg-gray-100 border-gray-200 text-gray-400' 
              : 'bg-orange-50/50 hover:bg-orange-100 border-orange-100/50 hover:border-orange-300'
          ]"
          @click.stop="!disabled && $emit('select-medida', { producto, medida })"
          @mouseenter="onHoverMedida(medida)"
          @mouseleave="resetRotation"
        >
          <div class="flex flex-col min-w-0">
            <span class="text-gray-700 font-medium truncate">
              {{ (typeof medida.presentacion === 'object' ? medida.presentacion.nombre : medida.presentacion) || medida.Nombre || 'Estándar' }} x {{ medida.cantidad }}
            </span>
            <span class="text-[10px] text-gray-400 font-semibold">
              Stock: {{ stockPorMedida(medida) }} uni.
            </span>
            <span v-if="medida.preciomayor || medida.PrecioMayor" class="text-[9px] text-orange-500 font-semibold">
              Por Mayor: Bs. {{ medida.preciomayor || medida.PrecioMayor }}
            </span>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <span :class="['font-bold whitespace-nowrap', disabled ? 'text-gray-400' : 'text-green-600']">Bs. {{ medida.precioventa || medida.Precio }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
       <span class="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
         {{ disabled ? 'Visualización' : 'Click para agregar' }}
       </span>
       <div :class="['p-1 rounded-lg transition-colors', disabled ? 'bg-gray-100 text-gray-300' : 'bg-orange-50 group-hover:bg-orange-500 group-hover:text-white']">
         <Plus class="h-3.5 w-3.5" />
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Plus } from 'lucide-vue-next';

const props = defineProps({
  producto: {
    type: Object,
    required: true
  },
  medidas: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['select', 'select-medida']);

const currentImageIndex = ref(0);
let rotationInterval = null;
const fallbackImage = 'https://placehold.co/400x300?text=Sin+Imagen';

const listadoMedidas = computed(() => props.producto.medidas || props.medidas || []);

const allImages = computed(() => {
  const images = [];
  const mainImg = props.producto.imagen || props.producto.Imagen?.Url;
  if (mainImg) images.push(mainImg);

  // Collect images from measures
  listadoMedidas.value.forEach(m => {
    if (m.imagen && !images.includes(m.imagen)) {
      images.push(m.imagen);
    }
  });

  return images.length > 0 ? images : [fallbackImage];
});

const currentImageUrl = computed(() => {
  return allImages.value[currentImageIndex.value] || fallbackImage;
});

const stock = computed(() => {
  if (props.producto.cantidad !== undefined && props.producto.cantidad !== null) {
    return props.producto.cantidad;
  }
  return props.producto.Productosucursal?.[0]?.Cantidad || 0;
});

const stockPorMedida = (medida) => {
  const factor = parseFloat(medida.cantidad || medida.Cantidad || 1);
  if (factor <= 0) return 0;
  return Math.floor(stock.value / factor);
};

const startRotation = () => {
  if (allImages.value.length <= 1) return;
  rotationInterval = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % allImages.value.length;
  }, 3500);
};

const stopRotation = () => {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }
};

const onHoverMedida = (medida) => {
  if (medida.imagen) {
    stopRotation();
    const idx = allImages.value.indexOf(medida.imagen);
    if (idx !== -1) currentImageIndex.value = idx;
  }
};

const resetRotation = () => {
  stopRotation();
  startRotation();
};

onMounted(() => {
  startRotation();
});

onUnmounted(() => {
  stopRotation();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
