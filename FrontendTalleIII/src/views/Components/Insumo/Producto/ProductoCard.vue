<template>
  <div class="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <!-- Imagen -->
    <div class="relative h-40 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 group/img"
      @mouseenter="detenerAutoplay"
      @mouseleave="iniciarAutoplay">
      <img
        v-if="imagenAMostrar"
        :src="imagenAMostrar" 
        :alt="producto.nombre"
        class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <ShoppingBag class="h-14 w-14 text-orange-300" />
      </div>

      <!-- Controles de navegación de imagen -->
      <div v-if="todasLasImagenes.length > 1" class="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
        <button @click.stop="anteriorImagen(); resetearAutoplay()" class="p-1 rounded-full bg-white/70 hover:bg-white text-orange-600 shadow-sm transition-all">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button @click.stop="siguienteImagen(); resetearAutoplay()" class="p-1 rounded-full bg-white/70 hover:bg-white text-orange-600 shadow-sm transition-all">
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>

      <!-- Indicador de imagen actual -->
      <div v-if="todasLasImagenes.length > 1" class="absolute bottom-2 right-2 flex gap-1">
        <div v-for="(_, i) in todasLasImagenes" :key="i"
          :class="['w-1.5 h-1.5 rounded-full transition-all', indiceImagenActual === i ? 'bg-orange-500 w-3' : 'bg-gray-300']">
        </div>
      </div>

      <!-- Badge estado -->
      <span :class="['absolute top-3 left-3 px-2.5 py-1 rounded-xl text-white text-xs font-semibold shadow-lg',
        producto.estado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-400 to-gray-500']">
        {{ producto.estado === 1 ? 'Activo' : 'Inactivo' }}
      </span>

      <!-- Precio mínimo de la primera presentación -->
      <div v-if="precioMin" class="absolute bottom-3 left-3">
        <span class="bg-orange-500/90 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm">
          Bs. {{ precioMin }}
        </span>
      </div>

      <!-- Botón foto -->
          <!-- @click.stop="$emit('actualizarFoto', producto)" -->
      <button
        class="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white text-blue-500 rounded-xl flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
        title="Actualizar foto"
      >
        <Camera class="h-4 w-4" />
      </button>
    </div>

    <!-- Contenido -->
    <div class="relative p-5">

      <!-- Nombre + ruta categoría -->
      <div class="mb-3">
        <h3 class="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate leading-snug">
          {{ producto.nombre?.trim() }}
        </h3>
        <p v-if="producto.descripcion" class="text-gray-400 text-xs mt-0.5 line-clamp-1">
          {{ producto.descripcion }}
        </p>
        <p class="text-xs text-orange-500 font-medium mt-1 truncate">
          <span v-if="producto.Subcategoria?.Categoria?.Nombre">{{ producto.Subcategoria.Categoria.Nombre }}</span>
          <span v-if="producto.Subcategoria?.Nombre" class="text-gray-400"> › {{ producto.Subcategoria.Nombre }}</span>
        </p>
      </div>

      <!-- Presentaciones colapsables -->
      <div class="mb-4">
        <button
          @click="expandida = !expandida"
          class="w-full flex items-center justify-between px-3 py-2 bg-orange-50/80 hover:bg-orange-100 rounded-xl transition-colors"
        >
          <div class="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
            <Tag class="h-3.5 w-3.5" />
            {{ medidasActivas.length }} presentación(es)
          </div>
          <ChevronDown :class="['h-4 w-4 text-orange-500 transition-transform duration-200', expandida ? 'rotate-180' : '']" />
        </button>

        <!-- Lista presentaciones -->
        <Transition name="slide-down">
          <div v-if="expandida" class="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
            <div
              v-for="pm in medidasActivas"
              :key="pm.IdProductoMedida"
              class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-xs"
            >
              <!-- Miniatura imagen presentación -->
              <div class="w-7 h-7 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center">
                <img v-if="pm.Imagen" :src="pm.Imagen" class="w-full h-full object-cover" />
                <Tag v-else class="h-3 w-3 text-gray-300" />
              </div>
              <span class="text-gray-700 font-medium truncate flex-1">
                {{ pm.Presentacion?.Nombre ?? 'Sin nombre' }}
                <span v-if="pm.Presentacion?.Abreviatura" class="text-gray-400 font-normal">({{ pm.Presentacion.Abreviatura }}  x {{ pm?.Cantidad }})</span>
              </span>
              <div class="flex-shrink-0 text-right flex flex-col">
                <span class="font-bold text-orange-600">Bs. {{ pm.PrecioVenta }}</span>
                <span v-if="pm.PrecioMayor" class="text-[10px] text-gray-400">Mayor: Bs. {{ pm.PrecioMayor }}</span>
                <span v-if="pm.Comision" class="text-[10px] text-green-500 font-medium">Com: Bs. {{ pm.Comision }}</span>
              </div>
            </div>
            <div v-if="!medidasActivas.length" class="text-center text-gray-400 text-xs italic py-1">
              Sin presentaciones
            </div>
          </div>
        </Transition>
      </div> 

      <!-- Badge ingredientes si tiene receta -->
      <!-- <div v-if="producto.Ingredientes?.length" class="mb-3">
        <span class="inline-flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
          <ChefHat class="h-3 w-3" /> {{ producto.Ingredientes.length }} ingrediente(s)
        </span>
      </div> -->

      <!-- Acciones --> 
       
      <div class="flex gap-2 pt-2 border-t border-gray-100">
        <button
          @click="$emit('editar', producto)"
          class="h-9 px-3 flex-shrink-0 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 rounded-2xl text-sm font-medium transition-all flex items-center gap-1"
        >
          <Pencil class="h-3.5 w-3.5" /> Editar
        </button>

        <!-- Receta / Ingredientes -->
        <button
          @click="$emit('administrarReceta', producto)"
          class="w-9 h-9 flex-shrink-0 border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600 rounded-2xl transition-all flex items-center justify-center"
          title="Administrar ingredientes de la receta"
        >
          <Utensils class="h-4 w-4" />
        </button>

        <!-- Precios al por Mayor -->
        <button
          @click="$emit('administrarPreciosMayor', producto)"
          class="w-9 h-9 flex-shrink-0 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all flex items-center justify-center"
          title="Administrar precios al por mayor"
        >
          <Tag class="h-4 w-4" />
        </button>

        <!-- Toggle estado -->
        <button
          @click="$emit('toggleEstado', producto)"
          :class="['w-9 h-9 flex-shrink-0 rounded-2xl transition-all flex items-center justify-center',
            producto.estado === 1
              ? 'border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500'
              : 'border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600']"
          :title="producto.estado === 1 ? 'Desactivar' : 'Activar'"
        >
          <ToggleLeft v-if="producto.estado !== 1" class="h-4 w-4" />
          <ToggleRight v-else class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  ShoppingBag, Camera, Pencil, ToggleLeft, ToggleRight,
  Tag, ChevronDown, Utensils, ChefHat, ChevronLeft, ChevronRight
} from 'lucide-vue-next';

const props = defineProps({
  producto: { type: Object, required: true }
});

defineEmits(['editar', 'toggleEstado', 'actualizarFoto', 'administrarReceta', 'administrarPreciosMayor']);

const expandida = ref(false);
const indiceImagenActual = ref(0);
let timerAutoplay = null;

// Filtrar presentaciones activas (estado === 1)
const medidasActivas = computed(() => {
  return (props.producto.Productomedida ?? []).filter(pm => {
    const estado = pm.Estado?.idestado ?? pm.Estado?.Idestado ?? pm.Estado;
    return estado === 1;
  });
});

// Lista de todas las imágenes disponibles (principal + presentaciones activas)
const todasLasImagenes = computed(() => {
  const imgs = [];
  if (props.producto.imagen) imgs.push(props.producto.imagen);
  
  medidasActivas.value.forEach(pm => {
    if (pm.Imagen && !imgs.includes(pm.Imagen)) {
      imgs.push(pm.Imagen);
    }
  });
  
  return imgs;
});

const imagenAMostrar = computed(() => {
  if (todasLasImagenes.value.length === 0) return null;
  return todasLasImagenes.value[indiceImagenActual.value];
});

const siguienteImagen = () => {
  indiceImagenActual.value = (indiceImagenActual.value + 1) % todasLasImagenes.value.length;
};

const anteriorImagen = () => {
  indiceImagenActual.value = (indiceImagenActual.value - 1 + todasLasImagenes.value.length) % todasLasImagenes.value.length;
};

// Autoplay logic
const iniciarAutoplay = () => {
  if (todasLasImagenes.value.length > 1) {
    timerAutoplay = setInterval(siguienteImagen, 3000); // Cambia cada 3 segundos
  }
};

const detenerAutoplay = () => {
  if (timerAutoplay) clearInterval(timerAutoplay);
};

const resetearAutoplay = () => {
  detenerAutoplay();
  iniciarAutoplay();
};

onMounted(() => {
  iniciarAutoplay();
});

onUnmounted(() => {
  detenerAutoplay();
});

// Precio más bajo de las presentaciones activas para mostrar en la imagen
const precioMin = computed(() => {
  const precios = medidasActivas.value
    .map(pm => pm.PrecioVenta)
    .filter(p => p != null && p > 0);
  if (!precios.length) return null;
  return Math.min(...precios);
});
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(-4px); }
</style>
