<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-linear-to-r from-orange-50 to-red-50 text-gray-600 text-sm uppercase tracking-wider">
            <th class="px-6 py-4 font-black">ID / Fecha</th>
            <th class="px-6 py-4 font-black">Proveedor</th>
            <th class="px-6 py-4 font-black">Comprobante</th>
            <th class="px-6 py-4 font-black">Total</th>
            <th class="px-6 py-4 font-black">Estado</th>
            <th class="px-6 py-4 font-black text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <template v-for="compra in compras" :key="compra.idcompra">
            <tr
              :class="['hover:bg-orange-50/30 transition-colors group', compra.estado === 0 ? 'opacity-60 grayscale' : '']"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-black text-gray-800">#{{ compra.idcompra }}</span>
                  <span class="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar class="h-3 w-3" /> {{ formatDate(compra.fechacompra) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <template v-if="compra.proveedor">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden shrink-0">
                      <img
                        v-if="compra.proveedor.persona?.imagen"
                        :src="compra.proveedor.persona.imagen"
                        class="w-full h-full object-cover"
                        alt=""
                      />
                      <span v-else class="text-sm">{{ (compra.proveedor.persona?.nombre || 'P')[0] }}</span>
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="font-bold text-gray-800 truncate">
                        {{ compra.proveedor.persona?.nombre }} {{ compra.proveedor.persona?.apellidopaterno }}
                      </span>
                      <span class="text-xs text-gray-500 truncate">{{ compra.proveedor.razonsocial }}</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden shrink-0">
                      <Building class="w-5 h-5" />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="font-bold text-gray-800">Sin proveedor</span>
                      <span class="text-xs text-gray-500 truncate italic">{{ compra.lugarcompra || 'Compra directa' }}</span>
                    </div>
                  </div>
                </template>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800">{{ compra.comprobante?.nombre || '-' }}</span>
                  <span class="text-xs text-gray-400">#{{ compra.nrocomprobante || '-' }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-lg font-black text-green-600">Bs. {{ Number(compra.preciototal).toFixed(2) }}</span>
              </td>
              <td class="px-6 py-4">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase',
                  compra.estado === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                  {{ compra.estado === 1 ? 'Activa' : 'Anulada' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="toggleRow(compra.idcompra)"
                    class="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                    :title="expandedRows[compra.idcompra] ? 'Ocultar detalles' : 'Ver detalles'"
                  >
                    <ChevronDown :class="['h-4 w-4 transition-transform', { 'rotate-180': expandedRows[compra.idcompra] }]" />
                  </button>
                  <button
                    v-if="compra.estado !== 0"
                    @click.stop="$emit('editar', compra)"
                    class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    title="Editar"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    v-if="compra.estado !== 0"
                    @click.stop="$emit('anular', compra)"
                    class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Anular"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <!-- Expanded Detail Row -->
            <tr v-if="expandedRows[compra.idcompra]">
              <td colspan="6" class="p-0">
                <div class="bg-gray-50/50 p-6 pl-16 border-t border-gray-100">
                  <div v-if="compra.detalles?.length" class="space-y-2">
                    <p class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Detalle de Insumos</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div
                        v-for="det in compra.detalles"
                        :key="det.iddetallecompra"
                        class="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
                      >
                        <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                          <Package class="h-4 w-4" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="font-bold text-gray-800 text-sm truncate">{{ det.insumo?.nombre || 'Insumo' }}</p>
                          <div class="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                            <span class="font-semibold">{{ det.cantidad }} x {{ det.insumomedida?.cantidad }} {{ det.insumomedida?.unidadmedida?.nombre }}</span>
                            <span class="text-gray-300">|</span>
                            <span class="font-bold text-orange-600">Bs. {{ Number(det.preciototal).toFixed(2) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="compra.descripcion" class="mt-3 text-xs text-gray-500 italic bg-white rounded-xl p-3 border border-gray-100">
                    <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest not-italic">Obs: </span>
                    {{ compra.descripcion }}
                  </div>
                  <div v-if="!compra.detalles?.length && !compra.descripcion" class="text-xs text-gray-400 italic">
                    Sin detalles adicionales
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div v-if="compras.length === 0" class="p-10 text-center text-sm text-gray-400 font-medium">
      No hay compras para mostrar
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Calendar, Package, ChevronDown, X, Pencil, Building } from 'lucide-vue-next';

const props = defineProps({
  compras: { type: Array, required: true }
});

defineEmits(['anular', 'editar']);

const expandedRows = ref({});

const toggleRow = (id) => {
  expandedRows.value[id] = !expandedRows.value[id];
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date.split('T')[0] + 'T12:00:00') : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
</script>
