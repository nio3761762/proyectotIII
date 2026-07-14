<template>
  <div class="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
    <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <!-- Imagen / franja superior -->
    <div class="relative h-36 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
      <img v-if="promo.imagen" :src="promo.imagen" :alt="promo.nombre"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <div v-else class="w-full h-full flex items-center justify-center">
        <BadgePercent class="h-14 w-14 text-orange-200" />
      </div>

      <!-- Estado -->
      <span :class="['absolute top-3 left-3 px-2.5 py-1 rounded-xl text-white text-xs font-semibold shadow-lg',
        promo.estado === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-400 to-gray-500']">
        {{ promo.estado === 1 ? 'Activa' : 'Inactiva' }}
      </span>

      <!-- Precio promo -->
      <div class="absolute bottom-3 right-3">
        <span class="bg-orange-500/90 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm">
          Bs. {{ Number(promo.preciopromocion).toFixed(2) }}
        </span>
      </div>

      <!-- Tipo de descuento -->
      <div v-if="promo.tipodescuento" class="absolute top-3 right-3">
        <span class="bg-white/80 backdrop-blur-sm text-orange-700 px-2 py-0.5 rounded-lg text-xs font-medium shadow">
          {{ promo.tipodescuento }}
        </span>
      </div>
    </div>

    <div class="relative p-5">

      <!-- Nombre + tipo + descripción -->
      <div class="mb-3">
        <h3 class="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
          {{ promo.nombre }}
        </h3>
        <p v-if="promo.Tipopromocion?.Nombre" class="text-xs text-orange-500 font-medium mt-0.5">
          {{ promo.Tipopromocion.Nombre }}
        </p>
        <p v-if="promo.descripcion" class="text-gray-400 text-xs mt-1 line-clamp-2">
          {{ promo.descripcion }}
        </p>
      </div>

      <!-- Productos de la promoción -->
      <div class="mb-3">
        <button @click.stop="expandida = !expandida"
          class="w-full flex items-center justify-between px-3 py-2 bg-orange-50/80 hover:bg-orange-100 rounded-xl transition-colors">
          <div class="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
            <Package class="h-3.5 w-3.5" />
            {{ promo.Promocionproducto?.length || 0 }} producto(s)
          </div>
          <ChevronDown :class="['h-4 w-4 text-orange-500 transition-transform', expandida ? 'rotate-180' : '']" />
        </button>

        <Transition name="slide-down">
          <div v-if="expandida" class="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
            <div v-for="pp in promo.Promocionproducto" :key="pp.IdPromocionProducto"
              class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-xs">
              <div class="w-7 h-7 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center">
                <img v-if="pp.Productomedida?.Imagen" :src="pp.Productomedida.Imagen" class="w-full h-full object-cover" />
                <Package v-else class="h-3.5 w-3.5 text-gray-300" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-700 truncate">{{ pp.Productomedida?.Producto?.Nombre ?? '—' }}</p>
                <p class="text-gray-400">
                  {{ pp.Productomedida?.Presentacion?.Nombre ?? '' }}
                  · x{{ pp.Cantidad }}
                </p>
              </div>
              <div class="flex-shrink-0 text-right">
                <p class="font-bold text-orange-600">Bs. {{ Number(pp.Precio).toFixed(2) }}</p>
                <p v-if="pp.Descuento" class="text-green-500">-{{ Number(pp.Descuento) > 1 ? pp.Descuento + '%' : (Number(pp.Descuento) * 100).toFixed(0) + '%' }}</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Vigencia -->
      <div v-if="promo.Rango" class="mb-4 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
        <Calendar class="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
        <span>{{ formatFecha(promo.Rango.FechaInicio) }} → {{ formatFecha(promo.Rango.FechaFin) }}</span>
      </div>

      <!-- Limite uso -->
      <div class="mb-4 flex items-center gap-1.5 text-xs font-medium bg-gray-50 rounded-xl px-3 py-2">
        <Users class="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
        <span v-if="promo.limiteuso === 0" class="text-red-600 font-bold uppercase tracking-wider">Agotada</span>
        <span v-else-if="promo.limiteuso > 0" class="text-gray-600">Límite: {{ promo.limiteuso }} usos</span>
        <span v-else class="text-gray-400 italic">Sin límite de uso</span>
      </div>

      <!-- Acciones -->
      <div v-if="!hideActions" class="flex gap-2 pt-3 border-t border-gray-100">
        <button @click="$emit('editar', promo)"
          class="h-9 px-3 flex-shrink-0 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 rounded-2xl text-sm font-medium transition-all flex items-center gap-1">
          <Pencil class="h-3.5 w-3.5" /> Editar
        </button>
        <button @click="$emit('toggleEstado', promo)"
          :class="['w-9 h-9 flex-shrink-0 rounded-2xl transition-all flex items-center justify-center',
            promo.estado === 1
              ? 'border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500'
              : 'border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600']"
          :title="promo.estado === 1 ? 'Desactivar' : 'Activar'">
          <ToggleLeft v-if="promo.estado !== 1" class="h-4 w-4" />
          <ToggleRight v-else class="h-4 w-4" />
        </button>
      </div>
      
      <div v-else class="pt-3 border-t border-gray-100 flex justify-between items-center">
         <span class="text-[10px] text-gray-400 uppercase font-medium">Click para agregar</span>
         <div class="p-1.5 bg-orange-100 rounded-lg">
            <Plus class="h-4 w-4 text-orange-600" />
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BadgePercent, Package, Pencil, ToggleLeft, ToggleRight, ChevronDown, Calendar, Users, Plus } from 'lucide-vue-next';

defineProps({ 
  promo: { type: Object, required: true },
  hideActions: { type: Boolean, default: false }
});
defineEmits(['editar', 'toggleEstado']);

const expandida = ref(false);
const formatFecha = (f) => f ? new Date(f + 'T00:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }) : '—';
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(-4px); }
</style>
