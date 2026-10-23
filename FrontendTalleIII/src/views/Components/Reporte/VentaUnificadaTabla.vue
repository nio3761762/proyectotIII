<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div class="px-5 py-3 border-b border-gray-200 bg-gray-50">
      <h3 :class="['font-semibold text-gray-800', grande ? 'text-base' : 'text-sm']">{{ titulo }}</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr class="bg-gray-50">
            <th class="p-2 text-[10px] font-semibold text-gray-500 uppercase border-b border-r border-gray-200" rowspan="2"></th>
            <th class="p-2 text-[10px] font-semibold text-gray-500 uppercase border-b border-r border-gray-200" rowspan="2">Tipo</th>
            <th v-for="grupo in grupos" :key="grupo.producto" :colspan="grupo.presentaciones.length" class="p-2 text-[10px] font-semibold text-gray-700 uppercase border-b border-r border-gray-200 text-center">{{ grupo.producto }}</th>
            <th class="p-2 text-[10px] font-semibold text-gray-500 uppercase border-b border-gray-200 text-center" colspan="3">Total</th>
          </tr>
          <tr class="bg-gray-50">
            <th v-for="col in columnas" :key="col.key" class="px-2 py-1 text-[10px] font-medium text-gray-500 border-b border-r border-gray-200 text-center whitespace-nowrap">{{ col.etiqueta || col.presentacion }}</th>
            <th class="p-2 text-[10px] font-medium text-gray-500 border-b border-gray-200 text-center">Ingreso</th>
            <th class="p-2 text-[10px] font-medium text-gray-500 border-b border-gray-200 text-center">Gasto Extra</th>
            <th class="p-2 text-[10px] font-medium text-gray-500 border-b border-gray-200 text-center">Neto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fila in filas" :key="fila.origen + fila.tipo" class="hover:bg-gray-50">
            <td class="p-2 border-b border-r border-gray-200 font-semibold text-gray-800 whitespace-nowrap">{{ fila.origen }}</td>
            <td class="p-2 border-b border-r border-gray-200 text-sm text-gray-600 whitespace-nowrap">{{ fila.tipo }}</td>
            <td v-for="col in columnas" :key="col.key" class="px-2 py-2 border-b border-r border-gray-200 text-center text-sm text-gray-800">{{ fila.cantidades[col.key] || 0 }}</td>
            <td class="p-2 border-b border-gray-200 text-right text-sm text-gray-800">{{ formatCurrency(fila.ingreso) }} bs</td>
            <td class="p-2 border-b border-gray-200 text-right text-sm text-gray-800">{{ formatCurrency(fila.gastoExtra) }} bs</td>
            <td class="p-2 border-b border-gray-200 text-right text-sm font-semibold text-gray-900">{{ formatCurrency(fila.neto) }} bs</td>
          </tr>
          <tr v-if="!filas.length">
            <td :colspan="columnas.length + 5" class="p-4 text-center text-sm text-gray-400">Sin movimientos</td>
          </tr>
          <tr class="bg-gray-50 font-semibold">
            <td colspan="2" class="p-2 border-t border-gray-300 text-gray-800">TOTAL</td>
            <td v-for="col in columnas" :key="'t' + col.key" class="px-2 py-2 border-t border-gray-300 text-center text-sm text-gray-900">{{ totalesPorColumna[col.key] || 0 }}</td>
            <td class="p-2 border-t border-gray-300 text-right text-sm text-gray-900">{{ formatCurrency(totales.ingreso) }} bs</td>
            <td class="p-2 border-t border-gray-300 text-right text-sm text-gray-900">{{ formatCurrency(totales.gastoExtra) }} bs</td>
            <td class="p-2 border-t border-gray-300 text-right text-sm text-gray-900">{{ formatCurrency(totales.neto) }} bs</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  titulo: { type: String, required: true },
  grande: { type: Boolean, default: true },
  columnas: { type: Array, default: () => [] },
  grupos: { type: Array, default: () => [] },
  filas: { type: Array, default: () => [] },
  totales: { type: Object, default: () => ({ ingreso: 0, gastoExtra: 0, neto: 0 }) },
  totalesPorColumna: { type: Object, default: () => ({}) }
})

const formatCurrency = (val) => Number(val || 0).toFixed(2)
</script>
