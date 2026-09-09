<template>
  <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h3 class="text-lg font-bold text-gray-800">Resumen de Ganancias por Día</h3>
      <p class="text-xs text-gray-500 mt-1">Balance diario: ingresos de tienda y revendedores menos gastos extra por cada día del período.</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/40">
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[110px]" rowspan="2">Fecha</th>
            <th class="p-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b text-center bg-emerald-50/40" colspan="2">Tienda</th>
            <th class="p-2 text-[10px] font-black text-orange-600 uppercase tracking-widest border-b text-center bg-amber-50/50" colspan="2">Revendedores</th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center" rowspan="2">Gasto Extra Total</th>
            <th class="p-2 text-[10px] font-black text-gray-700 uppercase tracking-widest border-b text-center bg-white/60" rowspan="2">Ganancia del Día</th>
          </tr>
          <tr class="bg-gray-50/40">
            <th class="p-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b text-center bg-emerald-50/40">Ingreso</th>
            <th class="p-2 text-[10px] font-black text-red-400 uppercase tracking-widest border-b text-center bg-emerald-50/40">Gasto Extra</th>
            <th class="p-2 text-[10px] font-black text-orange-600 uppercase tracking-widest border-b text-center bg-amber-50/50">Líquido</th>
            <th class="p-2 text-[10px] font-black text-red-400 uppercase tracking-widest border-b text-center bg-amber-50/50">Gasto Extra</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.fecha" class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
            <td class="p-3 font-bold text-gray-700">{{ formatFecha(row.fecha) }}</td>
            <td class="p-3 text-center font-black text-emerald-600">{{ formatMoney(row.ingreso_tienda) }}</td>
            <td class="p-3 text-center font-bold text-red-400">(−) {{ formatMoney(row.gasto_extra) }}</td>
            <td class="p-3 text-center font-black text-orange-600">{{ formatMoney(row.liquido_revendedor) }}</td>
            <td class="p-3 text-center font-bold text-red-400">(−) {{ formatMoney(row.gasto_extra_revendedor) }}</td>
            <td class="p-3 text-center font-black text-gray-500">{{ formatMoney(row.gasto_extra_total) }}</td>
            <td class="p-3 text-center bg-gradient-to-r from-amber-50/40 to-emerald-50/40">
              <div class="font-black text-sm" :class="row.ganancia_total >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatMoney(row.ganancia_total) }}
              </div>
              <div class="text-[9px] text-gray-400 font-medium">{{ formatMoney(row.neto_tienda) }} + {{ formatMoney(row.neto_revendedor) }}</div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="7" class="p-4 text-center text-gray-400 text-sm">Sin ganancias para el período seleccionado.</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-orange-50/50">
            <td class="p-3 font-black text-gray-600 text-xs uppercase border-t-2 border-orange-200">Totales</td>
            <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-orange-200">{{ formatMoney(tot.ingreso_tienda) }}</td>
            <td class="p-3 text-center font-black text-red-400 border-t-2 border-orange-200">(−) {{ formatMoney(tot.gasto_extra) }}</td>
            <td class="p-3 text-center font-black text-orange-600 border-t-2 border-orange-200">{{ formatMoney(tot.liquido_revendedor) }}</td>
            <td class="p-3 text-center font-black text-red-400 border-t-2 border-orange-200">(−) {{ formatMoney(tot.gasto_extra_revendedor) }}</td>
            <td class="p-3 text-center font-black text-gray-500 border-t-2 border-orange-200">{{ formatMoney(tot.gasto_extra_total) }}</td>
            <td class="p-3 text-center font-black border-t-2 border-orange-200 bg-gradient-to-r from-amber-50/60 to-emerald-50/60" :class="tot.ganancia_total >= 0 ? 'text-green-700' : 'text-red-700'">
              {{ formatMoney(tot.ganancia_total) }}
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
  gananciasDiarias: { type: Array, default: () => [] },
  formatMoney: { type: Function, default: (v) => v },
  formatFecha: { type: Function, default: (f) => f }
})

const rows = computed(() => {
  return [...props.gananciasDiarias].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const tot = computed(() => {
  return rows.value.reduce((acc, r) => {
    acc.ingreso_tienda += r.ingreso_tienda || 0
    acc.gasto_extra += r.gasto_extra || 0
    acc.neto_tienda += r.neto_tienda || 0
    acc.liquido_revendedor += r.liquido_revendedor || 0
    acc.gasto_extra_revendedor += r.gasto_extra_revendedor || 0
    acc.neto_revendedor += r.neto_revendedor || 0
    acc.gasto_extra_total += r.gasto_extra_total || 0
    acc.ganancia_total += r.ganancia_total || 0
    return acc
  }, { ingreso_tienda: 0, gasto_extra: 0, neto_tienda: 0, liquido_revendedor: 0, gasto_extra_revendedor: 0, neto_revendedor: 0, gasto_extra_total: 0, ganancia_total: 0 })
})
</script>