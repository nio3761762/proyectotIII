<template>
  <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
         :class="esTarde ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'">
      <div class="flex items-center gap-2">
        <span class="text-[10px] uppercase font-black tracking-widest" :class="esTarde ? 'text-orange-500' : 'text-blue-500'">{{ titulo }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-xs text-emerald-600 font-bold">Prod: {{ turno.total_producido }}</span>
        <span class="text-xs text-blue-600 font-bold">Vend: {{ turno.total_vendido }}</span>
        <span class="text-xs font-bold" :class="restanteTotal >= 0 ? 'text-amber-600' : 'text-red-600'">Restante: {{ restanteTotal }}</span>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/30">
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[150px]">Producto</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[100px]">Presentación</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[70px]">Inicio</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[80px]">Producido</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Vend. Tienda</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[80px]">Ing. Tienda</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Vend. Rev.</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[80px]">Ing. Rev.</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Total Vend.</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Restante</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in turno.productos" :key="item.idproducto + '::' + item.presentacion" class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
            <td class="p-3 font-medium text-gray-800">{{ item.producto }}</td>
            <td class="p-3 text-gray-500">{{ item.presentacion }}</td>
            <td class="p-3 text-center font-medium text-gray-500">{{ stockInicio(item) }}</td>
            <td class="p-3 text-center font-black text-emerald-600">{{ item.cantidad_producida }}</td>
            <td class="p-3 text-center font-medium text-blue-600">{{ item.cantidad_vendida_tienda }}</td>
            <td class="p-3 text-center font-medium text-gray-700">{{ formatMoney(item.total_venta_tienda) }}</td>
            <td class="p-3 text-center font-medium text-purple-600">{{ item.cantidad_vendida_revendedor }}</td>
            <td class="p-3 text-center font-medium text-gray-700">{{ formatMoney(item.total_venta_revendedor) }}</td>
            <td class="p-3 text-center font-black text-gray-700">{{ item.cantidad_vendida_total }}</td>
            <td class="p-3 text-center font-black" :class="restante(item) >= 0 ? 'text-amber-600' : 'text-red-600'">
              {{ restante(item) }}
            </td>
          </tr>
          <tr v-if="!turno.productos || turno.productos.length === 0">
            <td colspan="10" class="p-3 text-center text-gray-400 text-sm">Sin registros en este turno.</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-gray-50/50">
            <td class="p-3 font-black text-gray-600 text-xs uppercase border-t-2 border-gray-200" colspan="2">Totales</td>
            <td class="p-3 text-center font-black text-gray-500 border-t-2 border-gray-200">{{ stockInicioTotal }}</td>
            <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-gray-200">{{ turno.total_producido }}</td>
            <td class="p-3 text-center font-black text-blue-700 border-t-2 border-gray-200">{{ turnoTotalVendidoTienda }}</td>
            <td class="p-3 text-center font-black text-gray-700 border-t-2 border-gray-200">{{ formatMoney(turnoTotalIngresoTienda) }}</td>
            <td class="p-3 text-center font-black text-purple-700 border-t-2 border-gray-200">{{ turnoTotalVendidoRevendedor }}</td>
            <td class="p-3 text-center font-black text-gray-700 border-t-2 border-gray-200">{{ formatMoney(turnoTotalIngresoRevendedor) }}</td>
            <td class="p-3 text-center font-black text-gray-800 border-t-2 border-gray-200">{{ turno.total_vendido }}</td>
            <td class="p-3 text-center font-black border-t-2 border-gray-200" :class="restanteTotal >= 0 ? 'text-amber-700' : 'text-red-700'">
              {{ restanteTotal }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  turno: { type: Object, default: () => ({ productos: [], total_producido: 0, total_vendido: 0 }) },
  titulo: { type: String, default: 'Turno' },
  formatMoney: { type: Function, default: (v) => v },
  stockInicioPorProducto: { type: Object, default: () => ({}) }
})

const esTarde = computed(() => String(props.titulo).toLowerCase().includes('tarde'))

const keyOf = (item) => `${item.idproducto}::${item.presentacion || 'Unidad'}`

const stockInicio = (item) => props.stockInicioPorProducto[keyOf(item)] || 0

const restante = (item) => {
  const inicio = stockInicio(item)
  return inicio + (item.cantidad_producida || 0) - (item.cantidad_vendida_total || 0)
}

const restanteTotal = computed(() => stockInicioTotal.value + (props.turno.total_producido || 0) - (props.turno.total_vendido || 0))

const stockInicioTotal = computed(() => Object.values(props.stockInicioPorProducto).reduce((s, v) => s + (Number(v) || 0), 0))

const turnoTotalVendidoTienda = computed(() => (props.turno.productos || []).reduce((s, p) => s + (p.cantidad_vendida_tienda || 0), 0))
const turnoTotalIngresoTienda = computed(() => (props.turno.productos || []).reduce((s, p) => s + (p.total_venta_tienda || 0), 0))
const turnoTotalVendidoRevendedor = computed(() => (props.turno.productos || []).reduce((s, p) => s + (p.cantidad_vendida_revendedor || 0), 0))
const turnoTotalIngresoRevendedor = computed(() => (props.turno.productos || []).reduce((s, p) => s + (p.total_venta_revendedor || 0), 0))
</script>
