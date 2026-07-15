<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
    <!-- Purchase ID Header Bar -->
    <div class="bg-gradient-to-r from-gray-50 to-orange-50/50 px-6 py-2 border-b border-orange-100 flex justify-between items-center">
       <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Referencia</span>
       <span class="text-xs font-bold text-orange-600">#{{ compra.idcompra }}</span>
    </div>

    <div class="p-6">
      <!-- Provider Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
          <template v-if="compra.proveedor">
            <!-- Imagen del Proveedor -->
            <div class="relative group/img">
              <div class="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur opacity-20 group-hover/img:opacity-40 transition duration-300"></div>
              <div class="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gray-50 flex items-center justify-center">
                <img 
                  v-if="compra.proveedor.persona?.imagen" 
                  :src="compra.proveedor.persona.imagen" 
                  class="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  alt="Proveedor"
                />
                <User v-else class="w-8 h-8 text-gray-300" />
              </div>
            </div>

            <div class="flex flex-col gap-0.5">
              <h3 class="text-base font-bold text-gray-800 leading-tight">
                {{ compra.proveedor.persona?.nombre || '' }} {{ compra.proveedor.persona?.apellidopaterno || '' }}
              </h3>
              <p class="text-sm text-orange-600 font-bold">
                {{ compra.proveedor.razonsocial }}
              </p>
              <div class="mt-1">
                <span class="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg font-black border border-orange-200 uppercase tracking-wider">
                  {{ compra.proveedor.tipoproveedor?.nombre || 'General' }}
                </span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="relative group/img">
              <div class="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gray-100 flex items-center justify-center">
                <Building class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <h3 class="text-base font-bold text-gray-800 leading-tight">Sin proveedor</h3>
              <p v-if="compra.lugarcompra" class="text-sm text-gray-500 font-medium italic">
                {{ compra.lugarcompra }}
              </p>
              <p v-else class="text-sm text-gray-400">Compra directa</p>
            </div>
          </template>
        </div>

        <!-- Status Badge -->
        <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-[10px] font-black uppercase tracking-widest shrink-0', getStatusClass(compra.estado)]">
          {{ getStatusLabel(compra.estado) }}
        </span>
      </div>

      <!-- Purchase Info Section -->
      <div class="mb-4 px-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
        <div class="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
          <div class="flex items-center gap-1.5">
            <Tag class="h-3.5 w-3.5 text-orange-400" />
            {{ compra.comprobante.nombre }}: {{ compra.nrocomprobante }}
          </div>
          <div class="flex items-center gap-1.5">
            <Calendar class="h-3.5 w-3.5 text-orange-400" />
            {{ formatDate(compra.fechacompra) }}
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400 font-black uppercase">Precio Total</span>
            <span class="text-2xl font-black text-gray-800">{{ compra.preciototal }} <span class="text-xs">Bs.</span></span>
          </div>
          <button @click="toggleDetalles" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-4 py-2 text-xs flex items-center gap-2 transition-all font-black border border-orange-100 shadow-sm">
            {{ expandido ? 'OCULTAR' : 'VER DETALLES' }}
            <ChevronDown :class="['h-4 w-4 transition-transform', { 'rotate-180': expandido }]" />
          </button>
        </div>
      </div>

      <!-- Details List (Expandable) -->
      <Transition name="expand">
        <div v-if="expandido" class="mb-4 space-y-2 animate-fade-in max-h-60 overflow-y-auto p-1 custom-scrollbar">
          <div v-for="detalle in compra.detalles" :key="detalle.iddetallecompra" class="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                  <Package class="h-4 w-4" />
                </div>
                <div>
                  <p class="font-bold text-gray-800 text-xs">{{ detalle.insumo.nombre || 'Insumo' }}</p>
                  <p class="text-[10px] text-gray-500 font-medium">
                    {{ detalle.cantidad }} x {{detalle.insumomedida?.cantidad}} {{ detalle.insumomedida?.unidadmedida?.nombre }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-black text-gray-800">{{ detalle.precio }} Bs.</p>
                <p class="text-[9px] text-gray-400 uppercase font-bold mb-1">P. Unitario</p>
                <p class="text-[11px] font-black text-orange-600 border-t border-orange-50 pt-0.5">{{ detalle.preciototal }} Bs.</p>
                <p class="text-[9px] text-blue-400 uppercase font-bold">Subtotal</p>
              </div>
            </div>
            <div v-if="detalle.fechavencimiento" class="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1.5 text-[9px] text-red-400 font-bold uppercase">
               <Clock class="h-3 w-3" />
               Vencimiento: {{ formatDate(detalle.fechavencimiento) }}
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="compra.descripcion" class="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <div class="flex items-center gap-1.5 mb-1">
              <Info class="h-3 w-3 text-blue-500" />
              <span class="text-[9px] font-black text-blue-700 uppercase tracking-widest">Observaciones</span>
            </div>
            <p class="text-xs text-blue-600 italic leading-snug">{{ compra.descripcion }}</p>
          </div>
        </div>
      </Transition>

      <!-- Actions -->
      <div class="flex gap-2 mt-4">
        <button 
          v-if="compra.estado !== 0"
          @click="$emit('editar', compra)" 
          class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-200 active:scale-95"
        >
          <Pencil class="h-4 w-4" />
          Editar
        </button>
        <button 
          v-if="compra.estado !== 0" 
          @click="$emit('anular', compra)" 
          :disabled="!puedeAnular"
          class="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg hover:shadow-red-200 active:scale-95"
        >
          <X class="h-4 w-4" />
          Anular Transacción
          <span v-if="!puedeAnular" class="text-[8px] opacity-70 font-bold">(Límite superado)</span>
        </button>
        <div v-else class="flex-1 py-3 text-center text-red-500 font-black bg-red-50 rounded-2xl border-2 border-dashed border-red-200 italic uppercase text-[10px] tracking-[0.2em]">
          Compra Anulada
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, X, User, Tag, Calendar, Package, Info, Clock, Pencil, Building } from 'lucide-vue-next';

const props = defineProps({
  compra: { type: Object, required: true }
});

defineEmits(['anular', 'editar']);

const expandido = ref(false);
const currentTime = ref(new Date());
let timer = null;

const toggleDetalles = () => {
  expandido.value = !expandido.value;
};

const puedeAnular = computed(() => {
  if (props.compra.estado === 0) return false;
  
  // Combine date and time
  const fechaStr = props.compra.fechacompra.split('T')[0];
  const horaStr = props.compra.horacompra || '00:00:00';
  const compraDateTime = new Date(`${fechaStr}T${horaStr}`);
  
  const diffInMinutes = (currentTime.value - compraDateTime) / (1000 * 60);
  return diffInMinutes < 5;
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  // Ensure we don't have timezone shifts by taking only the date part
  const d = typeof date === 'string' ? new Date(date.split('T')[0] + 'T12:00:00') : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getStatusClass = (estado) => {
  switch (estado) {
    case 1: return 'bg-green-500 shadow-green-100';
    case 0: return 'bg-red-500 shadow-red-100';
    case 5: return 'bg-blue-500 shadow-blue-100';
    default: return 'bg-gray-500 shadow-gray-100';
  }
};

const getStatusLabel = (estado) => {
  switch (estado) {
    case 1: return 'Activa';
    case 0: return 'Anulada';
    case 5: return 'En Proceso';
    default: return 'Desconocido';
  }
};

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 10000); // Update every 10 seconds
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #fb923c;
  border-radius: 10px;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
