<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
    <!-- Production ID Header Bar -->
    <div class="bg-gradient-to-r from-gray-50 to-orange-50/50 px-6 py-3 border-b border-orange-100 flex justify-between items-center">
       <div class="flex items-center gap-2">
         <div class="p-1.5 bg-orange-100 rounded-lg text-orange-600">
           <Factory class="h-4 w-4" />
         </div>
         <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Producción</span>
       </div>
       <span class="text-xs font-bold text-orange-600">#{{ produccion.idproduccion }}</span>
    </div>

    <div class="p-6">
      <!-- Main Info Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-3">
            <p class="text-sm text-gray-400 font-bold flex items-center gap-1.5">
              <Calendar class="h-3.5 w-3.5" />
              {{ formatDate(produccion.fecha) }} 
            </p>
            <span class="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-black">
               {{ produccion.horaInicio || '--:--' }} - {{ produccion.horaFin || '...' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <Building2 class="h-4 w-4 text-orange-600" />
            <span class="text-lg font-black text-gray-800">{{ produccion.sucursal?.Nombre || 'Sucursal S/N' }}</span>
          </div>
        </div>

        <!-- Status Badge -->
        <span :class="['px-3 py-1.5 rounded-xl text-white border-0 shadow-lg text-[10px] font-black uppercase tracking-widest shrink-0', getStatusClass(produccion.estado)]">
          {{ getStatusLabel(produccion.estado) }}
        </span>
      </div>

      <!-- Costs Summary Section -->
      <div v-if="produccion.estado === 1" class="grid grid-cols-2 gap-3 mb-6">
        <div class="p-3 bg-green-50/50 rounded-2xl border border-green-100/50">
          <p class="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Costo Total</p>
          <p class="text-xl font-black text-green-700">{{ formatCurrency(produccion.costoTotal) }} <span class="text-[10px]">Bs</span></p>
        </div>
        <div class="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <p class="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Productos</p>
          <p class="text-xl font-black text-blue-700">{{ produccion.cantidad }} <span class="text-[10px]">uds</span></p>
        </div>
      </div>

      <!-- Quick Details -->
      <div class="mb-4 space-y-3">
        <div class="flex items-center justify-between pt-1">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Responsable</span>
            <div class="flex items-center gap-2 mt-1.5">
              <div class="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden">
                <img v-if="produccion.empleados?.[0]?.imagen" :src="produccion.empleados[0].imagen" class="h-full w-full object-cover" />
                <User v-else class="h-3.5 w-3.5" />
              </div>
              <span class="text-sm font-bold text-gray-700">{{ produccion.responsable || 'Sistema' }}</span>
            </div>
          </div>
          <button @click="expandido = !expandido" class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-4 py-2 text-xs flex items-center gap-2 transition-all font-black border border-orange-100 shadow-sm self-end">
            {{ expandido ? 'OCULTAR' : 'DETALLES' }}
            <ChevronDown :class="['h-4 w-4 transition-transform', { 'rotate-180': expandido }]" />
          </button>
        </div>
      </div>

      <!-- Details List (Expandable) -->
      <Transition name="expand">
        <div v-if="expandido" class="mb-4 space-y-4 animate-fade-in max-h-80 overflow-y-auto p-1 custom-scrollbar">
          <!-- Cost Breakdown -->
          <div v-if="produccion.estado === 1" class="space-y-2">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Desglose de Costos</p>
            <div class="grid grid-cols-1 gap-2">
              <div class="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-xs font-bold text-gray-500">Insumos</span>
                <span class="text-xs font-black text-gray-700">{{ formatCurrency(produccion.costoInsumos) }} Bs</span>
              </div>
              <div class="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-xs font-bold text-gray-500">Mano de Obra</span>
                <span class="text-xs font-black text-gray-700">{{ formatCurrency(produccion.costoManoObra) }} Bs</span>
              </div>
              <div class="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-xs font-bold text-gray-500">Costos Indirectos</span>
                <span class="text-xs font-black text-gray-700">{{ formatCurrency(produccion.costoIndirecto) }} Bs</span>
              </div>
            </div>
          </div>

          <!-- Products Produced (Detailed Batch Info) -->
          <div v-if="produccion.salidas?.length" class="space-y-2">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Registros de Salida</p>
            <div v-for="s in produccion.salidas" :key="s.IdHornoProducto" class="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 group/item hover:border-orange-200 transition-colors">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                   <span class="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-black">{{ s.Hora || '--:--' }}</span>
                   <span class="text-xs font-bold text-gray-700">{{ s.Producto }}</span>
                </div>
                <span class="text-xs font-black text-blue-600 group-hover/item:text-orange-600">{{ s.Cantidad }} uds</span>
              </div>
              <div class="flex items-center gap-3 text-[9px] font-bold text-gray-400 border-t border-gray-50 pt-2">
                 <div class="flex items-center gap-1 text-orange-500/70">
                    <Flame class="h-3 w-3" />
                    <span>{{ s.Horno || 'S/H' }}</span>
                 </div>
                 <div class="flex items-center gap-1 text-blue-500/70">
                    <User class="h-3 w-3" />
                    <span>{{ s.Empleado || 'S/E' }}</span>
                 </div>
              </div>
            </div>
          </div>

          <!-- Fallback to Summary if no detailed salidas -->
          <div v-else-if="produccion.detalles?.length" class="space-y-2">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Resumen de Productos</p>
            <div v-for="detalle in produccion.detalles" :key="detalle.id" class="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group/item hover:border-orange-200 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 group-hover/item:bg-orange-50 group-hover/item:text-orange-500 transition-colors">
                  <Package class="h-4 w-4" />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-gray-700">{{ detalle.producto?.Nombre }}</span>
                  <span v-if="produccion.estado === 1" class="text-[9px] text-gray-400 font-bold">Costo Unit: {{ formatCurrency(detalle.costoUnitario) }} Bs</span>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-xs font-black text-blue-600 group-hover/item:text-orange-600">{{ detalle.cantidad }} uds</span>
                <div v-if="Number(detalle.cantidadMala) > 0" class="flex flex-col items-end mt-1">
                  <span class="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">
                    Dañados: {{ detalle.cantidadMala }}
                  </span>
                  <span class="text-[8px] text-gray-400 italic max-w-[120px] truncate" :title="detalle.motivo">
                    {{ detalle.motivo }}
                  </span>
                </div>
                <span v-if="produccion.estado === 1" class="text-[9px] text-gray-400 font-bold">{{ formatCurrency(detalle.costoTotal) }} Bs</span>
              </div>
            </div>
          </div>
          
          <!-- Observations -->
          <div v-if="produccion.observaciones" class="p-3 bg-orange-50/30 rounded-xl border border-orange-100/50">
            <div class="flex items-center gap-1.5 mb-1">
              <Info class="h-3 w-3 text-orange-400" />
              <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Observaciones</span>
            </div>
            <p class="text-xs text-gray-600 italic leading-snug">{{ produccion.observaciones }}</p>
          </div>
        </div>
      </Transition>

      <!-- Actions -->
      <div class="flex flex-col gap-2 mt-4">
        <div v-if="produccion.estado === 1 || produccion.estado === 2" class="grid grid-cols-2 gap-2">
          <button 
            @click="$emit('editar', produccion)" 
            class="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-200 active:scale-95"
          >
            <Edit class="h-4 w-4" />
            Editar
          </button>
          <button 
            v-if="produccion.estado === 2" 
            @click="$emit('gestionar', produccion)" 
            class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-200 active:scale-95"
          >
            <Activity class="h-4 w-4" />
            Gestionar
          </button>
          <button 
            v-if="produccion.estado === 1" 
            @click="$emit('anular', produccion)" 
            class="bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <X class="h-4 w-4" />
            Anular
          </button>
        </div>
        
        <div v-if="produccion.estado === 0" class="w-full py-3.5 text-center text-red-500 font-black bg-red-50 rounded-2xl border-2 border-dashed border-red-200 italic uppercase text-[10px] tracking-[0.2em]">
          Producción Anulada
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Factory, Building2, Package, Calendar, ChevronDown, Info, X, Activity, User, DollarSign, Flame, Edit } from 'lucide-vue-next';

const props = defineProps({
  produccion: { type: Object, required: true }
});

defineEmits(['anular', 'gestionar', 'editar']);

const expandido = ref(false); 

const formatDate = (date) => {
  if (!date) return 'N/A';
  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (value) => {
  return Number(value || 0).toFixed(2);
};

const getStatusClass = (estado) => {
  switch (estado) {
    case 1: return 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-green-100';
    case 0: return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-100';
    default: return 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-orange-100';
  }
};

const getStatusLabel = (estado) => {
  switch (estado) {
    case 1: return 'Completada';
    case 0: return 'Anulada';
    default: return 'En Proceso';
  }
};
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 800px;
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
