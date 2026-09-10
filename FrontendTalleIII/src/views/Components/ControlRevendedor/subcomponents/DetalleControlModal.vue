<template>
  <Transition name="fade-backdrop">
    <div v-if="isOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div class="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-scale-in flex flex-col" style="max-height: 92vh;">
        <!-- Header -->
        <div class="bg-linear-to-r from-orange-600 to-red-700 p-8 text-white relative shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="flex items-center justify-between relative z-10 gap-4">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center overflow-hidden shrink-0">
                <img v-if="control?.Persona?.Imagen" :src="control.Persona.Imagen" class="w-full h-full object-cover" />
                <UserIcon v-else class="h-7 w-7 text-white/80" />
              </div>
              <div class="min-w-0">
                <h3 class="text-xl font-black uppercase tracking-tight truncate">
                  {{ control?.Persona?.Nombre }} {{ control?.Persona?.ApellidoPaterno }}
                </h3>
                <p class="text-orange-100 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Tema / Control #{{ control?.idrevendedorcontrol }} · {{ formatDate(control?.fecha) }} {{ formatHora(control?.hora) }}
                </p>
                <p class="text-orange-100/80 text-[9px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <Building2 class="h-3 w-3" />
                  {{ control?.Sucursal?.Nombre }}
                </p>
              </div>
            </div>
            <button @click="$emit('close')" class="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors shrink-0">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div v-if="!control?.Detalles?.length" class="text-center py-10 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            Sin productos en este control.
          </div>

          <!-- Boleta por producto -->
          <div v-for="d in control.Detalles" :key="d.IdDetalle" class="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-orange-500 border border-gray-100 overflow-hidden shrink-0">
                  <img v-if="d.Imagen_Producto" :src="d.Imagen_Producto" class="w-full h-full object-cover" />
                  <Package v-else class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black text-gray-800 truncate">{{ d.Producto }}</p>
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{{ d.Presentacion }}</p>
                </div>
              </div>
              <span class="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                {{ d.VendidoTotal ?? 0 }} vendidas
              </span>
            </div>

            <div class="p-6 space-y-4">
              <!-- Desglose por unidades -->
              <div>
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Cantidades por unidad y precios</p>
                <div class="space-y-1.5">
                  <div v-for="p in precioLines(d)" :key="p.IdPrecio"
                    class="flex items-center justify-between px-4 py-2 rounded-xl text-[10px] font-black border"
                    :class="p.Estado === 'AJUSTE' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-white border-gray-100 text-gray-800'">
                    <span class="flex items-center gap-2">
                      <span :class="['px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest', p.Estado === 'AJUSTE' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500']">
                        {{ p.Estado }}
                      </span>
                      {{ p.Cantidad }} uds × Bs {{ formatBs(p.PrecioVenta) }}
                    </span>
                    <span class="font-black">= Bs {{ formatBs(p.Cantidad * p.PrecioVenta) }}</span>
                  </div>
                  <div v-if="precioLines(d).length === 0"
                    class="px-4 py-2 rounded-xl bg-white border border-gray-100 text-[10px] font-black text-gray-500 flex items-center justify-between">
                    <span>{{ d.VendidoNormal ?? 0 }} uds × Bs {{ formatBs(d.PrecioVenta) }}</span>
                    <span>= Bs {{ formatBs((d.VendidoNormal ?? 0) * (d.PrecioVenta ?? 0)) }}</span>
                  </div>
                </div>
              </div>

              <!-- Resumen del detalle -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <div class="text-center">
                  <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Entregado</p>
                  <p class="text-sm font-black text-gray-800">{{ d.CantidadEntregada }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Devuelto</p>
                  <p class="text-sm font-black text-orange-500">{{ d.CantidadDevuelta ?? 0 }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Venta</p>
                  <p class="text-sm font-black text-emerald-600">Bs {{ formatBs(d.VentaTotal) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Comisión</p>
                  <p class="text-sm font-black text-amber-600">Bs {{ formatBs(d.ComisionTotal) }}</p>
                </div>
              </div>

              <div v-if="d.Motivo" class="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100 text-[9px] text-amber-700 italic">
                <Info class="h-3 w-3 inline mr-1" /> {{ d.Motivo }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer totals -->
        <div class="p-6 border-t border-gray-100 shrink-0 space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="text-center">
              <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Venta</p>
              <p class="text-base font-black text-gray-800">Bs {{ formatBs(control?.TotalVenta) }}</p>
            </div>
            <div class="text-center">
              <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Comisión</p>
              <p class="text-base font-black text-emerald-600">Bs {{ formatBs(control?.TotalComision) }}</p>
            </div>
            <div class="text-center">
              <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Gasto Extra</p>
              <p class="text-base font-black text-orange-500">Bs {{ formatBs(control?.GastoExtra) }}</p>
            </div>
            <div class="text-center">
              <p class="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Neto a Entregar</p>
              <p class="text-lg font-black text-red-700">Bs {{ formatBs(netoFinal) }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="w-full py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200">
            CERRAR
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { User as UserIcon, X, Building2, Package, Info } from 'lucide-vue-next';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  control: { type: Object, default: null }
});

defineEmits(['close']);

const netoFinal = computed(() => {
  return Number(props.control?.TotalLiquidoPanaderia || 0) - Number(props.control?.GastoExtra || 0);
});

const precioLines = (d) => (d?.PreciosAjustados || []).filter(p => p.Cantidad > 0);

const formatBs = (val) => Number(val || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (date) => {
  if (!date) return 'N/A';
  const m = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return new Date(date).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatHora = (hora) => {
  if (!hora) return '--:--';
  return String(hora).slice(0, 5);
};
</script>

<style scoped>
.fade-backdrop-enter-active, .fade-backdrop-leave-active { transition: opacity 0.3s ease; }
.fade-backdrop-enter-from, .fade-backdrop-leave-to { opacity: 0; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
</style>