<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-[3rem] shadow-xl border border-white/50 overflow-hidden animate-fade-in">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Persona e Información General</th>
            <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Resumen Financiero</th>
            <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <template v-for="c in controles" :key="c.idrevendedorcontrol">
            <!-- Main Row: Employee & Totals -->
            <tr class="bg-white hover:bg-orange-50/10 transition-colors">
              <td class="px-6 py-6 align-top">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg flex items-center justify-center text-white font-black text-sm overflow-hidden">
                    <img v-if="c.Persona?.Imagen" :src="c.Persona.Imagen" class="w-full h-full object-cover" />
                    <span v-else>{{ c.Persona?.Nombre?.[0] }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-black text-gray-800 text-lg leading-none">{{ c.Persona?.Nombre }} {{ c.Persona?.ApellidoPaterno }}</span>
                    <div class="flex items-center gap-2 mt-2">
                       <span class="text-[9px] font-black text-orange-600 px-2 py-0.5 bg-orange-50 rounded-lg">#{{ c.idrevendedorcontrol }}</span>
                       <span class="text-[9px] text-gray-400 font-bold uppercase">{{ formatDate(c.fecha) }}</span>
                       <span class="text-[9px] text-gray-400 font-bold">{{ c.hora }}</span>
                    </div>
                    <div class="flex items-center gap-1 mt-1 text-[9px] text-gray-500 font-bold uppercase tracking-tight">
                      <Building2 class="h-3 w-3 text-orange-400" />
                      <span>{{ c.Sucursal?.Nombre }}</span>
                    </div>
                    <div v-if="c.observacion" class="mt-1 text-[9px] text-gray-400 italic font-bold">
                      Obs: {{ c.observacion }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                  <div class="text-center">
                    <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Venta</p>
                    <p class="text-xs font-black text-gray-700">Bs {{ Number(c.TotalVenta || 0).toFixed(2) }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Normal</p>
                    <p class="text-xs font-black text-orange-600">Bs {{ calcNormalTotal(c).toFixed(2) }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Ajustes</p>
                    <p class="text-xs font-black text-blue-600">Bs {{ calcAjustesTotal(c).toFixed(2) }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Comisión Total</p>
                    <p class="text-xs font-black text-emerald-600">Bs {{ Number(c.TotalComision || 0).toFixed(2) }}</p>
                  </div>
                  <div class="text-center border-l border-gray-200">
                    <p class="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Neto Panadería</p>
                    <p class="text-sm font-black text-red-700">Bs {{ Number(c.TotalLiquidoPanaderia || 0).toFixed(2) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-6 text-right align-middle">
                <span
                  :class="[
                    'px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xs',
                    c.estado === 1 
                      ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                      : 'bg-red-50 text-red-600 border border-red-100'
                  ]"
                >
                  {{ c.estado === 1 ? 'Activo' : 'Anulado' }}
                </span>
              </td>
            </tr>
            <!-- Details Row: Product Table -->
            <tr v-if="c.Detalles?.length">
              <td colspan="3" class="px-6 pb-8 pt-0">
                <div class="bg-white border border-orange-100/50 rounded-[2rem] overflow-x-auto shadow-sm">
                  <table class="w-full text-[10px]">
                    <thead class="bg-orange-50/50 text-orange-700 font-black uppercase tracking-wider">
                      <tr>
                        <th class="px-6 py-3">Producto</th>
                        <th class="px-4 py-3 text-center">Entregado</th>
                        <th class="px-4 py-3 text-center">Precio</th>
                        <th class="px-4 py-3 text-center">Comisión</th>
                        <th class="px-4 py-3 text-center text-red-600">Devueltos</th>
                        <th class="px-4 py-3 text-center text-blue-600">Ajustes</th>
                        <th class="px-4 py-3 text-center text-emerald-600">Total Venta</th>
                        <th class="px-4 py-3 text-center text-emerald-600">Total Comisión</th>
                        <th class="px-4 py-3 text-right text-orange-800">Subtotal Neto</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-orange-50">
                      <tr v-for="d in c.Detalles" :key="d.IdDetalle" class="hover:bg-orange-50/30 transition-colors">
                        <td class="px-6 py-3">
                          <div class="flex items-center gap-3">
                            <div class="w-6 h-6 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                              <Package class="h-3 w-3 text-orange-300" />
                            </div>
                            <span class="font-bold text-gray-800">{{ d.Producto }} ({{ d.Presentacion }})</span>
                          </div>
                        </td> 
                        <td class="px-4 py-3 text-center font-black">{{ d.CantidadEntregada }}</td>
                        <td class="px-4 py-3 text-center font-medium">Bs {{ d.PrecioVenta }}</td>
                        <td class="px-4 py-3 text-center text-emerald-600 font-bold">Bs {{ d.ComisionUnitaria }}</td>
                        <td class="px-4 py-3 text-center text-red-500 font-black">{{ d.CantidadDevuelta || 0 }}</td>
                        <td class="px-4 py-3 text-center">
                          <template v-if="getAjustes(d).length > 0">
                            <div v-for="(aj, ai) in getAjustes(d)" :key="ai" class="text-[9px] leading-tight">
                              <span class="text-blue-600 font-black">{{ aj.Cantidad }}</span> @ <span class="text-blue-600 font-bold">Bs {{ aj.PrecioVenta }}</span>
                            </div>
                          </template>
                          <span v-else class="text-blue-600 font-black">0</span>
                        </td>
                        <td class="px-4 py-3 text-center text-emerald-700 font-black">Bs {{ Number(d.VentaTotal || 0).toFixed(2) }}</td>
                        <td class="px-4 py-3 text-center text-emerald-700 font-black">Bs {{ Number(d.ComisionTotal || 0).toFixed(2) }}</td>
                        <td class="px-4 py-3 text-right font-black text-gray-800">
                          Bs {{ Number(d.LiquidoPanaderia || 0).toFixed(2) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { Package, Building2 } from 'lucide-vue-next';

defineProps({
  controles: { type: Array, required: true }
});

const getAjustes = (d) => {
  return (d.PreciosAjustados || []).filter(p => p.Estado === 'AJUSTE');
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-BO', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

const calcNormalTotal = (c) => {
  if (!c.Detalles) return 0;
  return c.Detalles.reduce((acc, d) => {
    return acc + (d.VendidoNormal || 0) * d.PrecioVenta;
  }, 0);
};

const calcAjustesTotal = (c) => {
  if (!c.Detalles) return 0;
  return c.Detalles.reduce((acc, d) => {
    const normal = (d.VendidoNormal || 0) * d.PrecioVenta;
    return acc + Math.max(0, (d.VentaTotal || 0) - normal);
  }, 0);
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
