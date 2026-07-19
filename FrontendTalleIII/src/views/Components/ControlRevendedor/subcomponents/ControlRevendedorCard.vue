<template>
  <div class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div class="relative p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden shadow-lg text-orange-600">
            <img v-if="control.Persona?.Imagen" :src="control.Persona.Imagen" class="w-full h-full object-cover" />
            <UserIcon v-else class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-lg font-black text-gray-800 group-hover:text-orange-600 transition-colors">
              Control #{{ control.idrevendedorcontrol }}
            </h3>
            <p class="text-gray-600 text-xs font-bold uppercase tracking-wider">
              {{ control.Persona?.Nombre }} {{ control.Persona?.ApellidoPaterno }}
            </p>
          </div>
        </div> 

        <span
          :class="[
            'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-[10px] font-black uppercase tracking-widest',
            control.estado === 1 
              ? 'bg-linear-to-r from-orange-500 to-red-600' 
              : 'bg-linear-to-r from-red-500 to-rose-600'
          ]"
        >
          {{ control.estado === 1 ? 'Activo' : 'Anulado' }}
        </span>
      </div>

      <!-- Control Details Preview -->
      <div class="mb-4 p-4 bg-linear-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100/50">
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen General</span>
          <button
            @click="expandido = !expandido"
            class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            {{ expandido ? 'Ocultar' : 'Ver Detalles' }}
            <ChevronDown :class="['h-3 w-3 transition-transform duration-300', { 'rotate-180': expandido }]" />
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div class="flex flex-col">
            <span class="text-[8px] font-black text-gray-400 uppercase">Venta Total</span>
            <span class="text-xs font-black text-orange-700">Bs {{ formatCurrency(control.TotalVenta) }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[8px] font-black text-gray-400 uppercase">Comisión</span>
            <span class="text-xs font-black text-emerald-600">Bs {{ formatCurrency(control.TotalComision) }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[8px] font-black text-gray-400 uppercase">Gasto Extra</span>
            <div class="flex items-center gap-1">
              <span class="text-[9px] font-black text-gray-400">Bs</span>
              <input v-model.number="control.GastoExtra" type="number" step="0.01" min="0" @change="onGastoExtraChange"
                class="w-20 text-center text-xs font-black bg-white border border-orange-100 rounded-lg outline-none py-1 shadow-sm focus:ring-2 focus:ring-orange-500/20" />
            </div>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-orange-100/50 flex justify-between">
          <span class="text-[8px] font-black text-red-400 uppercase">Neto a Entregar</span>
          <span class="text-sm font-black text-red-700">Bs {{ formatCurrency(netoFinal) }}</span>
        </div>

        <div class="mt-3 pt-3 border-t border-orange-100/50 space-y-2">
          <div class="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-tight">
            <Calendar class="h-3 w-3 text-orange-500" />
            <span>{{ formatDate(control.fecha) }} {{ control.hora }}</span>
          </div>
          <div class="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-tight">
            <Building2 class="h-3 w-3 text-orange-500" />
            <span>{{ control.Sucursal?.Nombre }}</span>
          </div>
        </div> 
      </div>

      <!-- Expanded Details -->
      <Transition name="fade-slide">
        <div v-if="expandido" class="mb-4 space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
          <div v-for="det in control.Detalles" :key="det.IdDetalle" 
            class="p-4 bg-white/70 rounded-2xl shadow-sm border border-gray-100 group/item hover:border-orange-200 transition-all duration-300">
            
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-orange-500 border border-gray-100 overflow-hidden shrink-0">
                  <Package class="h-4 w-4" />
                </div>
                <div>
                  <p class="text-xs font-black text-gray-800 leading-none">{{ det.Producto }}</p>
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ det.Presentacion }}</p>
                </div>
              </div>
              <span class="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                {{ det.VendidoTotal }} uds
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4">
               <div class="space-y-1 text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                  <div class="flex justify-between"><span>Entregado:</span> <b class="text-gray-700">{{ det.CantidadEntregada }}</b></div>
                  <div class="flex justify-between"><span>Devuelto:</span> <b class="text-orange-500">{{ det.CantidadDevuelta }}</b></div>
                  <div class="flex justify-between"><span>Normal:</span> <b class="text-gray-700">{{ det.VendidoNormal }}</b></div>
               </div>
               <div class="space-y-1 text-[9px] font-bold text-gray-500 uppercase tracking-tighter border-l border-gray-100 pl-3">
                  <div class="flex justify-between"><span>Venta:</span> <b class="text-orange-700">Bs {{ formatCurrency(det.VentaTotal) }}</b></div>
                  <div class="flex justify-between"><span>Comisión:</span> <b class="text-emerald-600">Bs {{ formatCurrency(det.ComisionTotal) }}</b></div>
                  <div class="flex justify-between border-t border-gray-100 pt-1 mt-1">
                    <span class="text-red-800 font-black">Líquido:</span> 
                    <b class="text-red-800 font-black">Bs {{ formatCurrency(det.LiquidoPanaderia) }}</b>
                  </div>
               </div>
            </div>

            <!-- PreciosAjustados --> 
            <div v-if="det.PreciosAjustados?.length" class="mt-3 space-y-1">
              <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Desglose de Precios:</p>
              <div v-for="p in det.PreciosAjustados" :key="p.IdPrecio"
                class="flex items-center justify-between px-3 py-1.5 rounded-lg text-[9px]"
                :class="p.Estado === 'AJUSTE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'"
              >
                <span class="font-black uppercase tracking-wider">{{ p.Estado }}</span>
                <span><b class="font-black">{{ p.Cantidad }}</b> uds @ Bs <b>{{ p.PrecioVenta }}</b></span>
                <span v-if="p.Observacion" class="italic text-[8px] opacity-70">{{ p.Observacion }}</span>
              </div>
            </div>

            <div v-if="det.Motivo" class="mt-3 p-2 bg-amber-50/50 rounded-xl border border-amber-100 text-[9px] text-amber-700 italic">
               <Info class="h-3 w-3 inline mr-1" /> {{ det.Motivo }}
            </div>

            <button @click="$emit('edit-detail', det)" 
              class="w-full mt-3 py-2 bg-gray-50 hover:bg-orange-50 text-orange-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100 hover:border-orange-200 transition-all">
              Ajustar Detalle
            </button>
          </div>
        </div>
      </Transition>

      <!-- Quick Summary Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <div class="flex items-center gap-2">
           <div class="p-2 bg-red-100 rounded-xl text-red-600">
              <TrendingUp class="h-4 w-4" />
           </div>
            <div>
               <p class="text-[8px] font-black text-gray-400 uppercase leading-none">Neto a Entregar</p>
               <p class="text-sm font-black text-gray-800 leading-none mt-1">Bs {{ formatCurrency(netoFinal) }}</p>
            </div>
        </div>
        <button class="p-3 bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-2xl transition-all border border-gray-100 hover:border-orange-200">
           <FileText class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  User as UserIcon, Building2, ChevronDown, Edit2, Calendar, 
  Package, TrendingUp, Info, FileText 
} from 'lucide-vue-next';
import { actualizarGastoExtra } from '@/Server/ControlRevendedor';

const props = defineProps({
  control: { type: Object, required: true }
}); 

defineEmits(['edit-detail']);

const expandido = ref(false);

const netoFinal = computed(() => {
  return Number(props.control.TotalLiquidoPanaderia || 0) - Number(props.control.GastoExtra || 0);
});

let saveTimer = null;
const onGastoExtraChange = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await actualizarGastoExtra(props.control.idrevendedorcontrol, props.control.GastoExtra || 0);
    } catch (e) {
      console.error(e);
    }
  }, 500);
};
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (val) => Number(val || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
  overflow: hidden;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
</style>
