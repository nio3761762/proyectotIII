<template>
  <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-6 py-4 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-100 flex items-center justify-between">
      <h3 class="font-black text-gray-800 text-lg">{{ titulo }}</h3>
      <span class="text-xs text-gray-500">{{ bloques.length }} {{ periodo.toLowerCase() }}(s) en el rango</span>
    </div>

    <div v-if="bloques.length === 0" class="p-6 text-center text-sm text-gray-400">Sin periodos en el rango seleccionado</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr class="bg-gray-50/30">
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r" rowspan="2">{{ periodo }}</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r" rowspan="2">Origen</th>
            <th v-for="grupo in grupos" :key="grupo.producto" :colspan="grupo.presentaciones.length" class="p-2 text-[10px] font-black text-gray-700 uppercase tracking-wide border-b border-r text-center">{{ grupo.producto }}</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center" colspan="3">Total</th>
          </tr>
          <tr class="bg-gray-50/30">
            <th v-for="col in columnas" :key="col.key" class="px-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b border-r text-center">{{ col.presentacion }}</th>
            <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Ingreso</th>
            <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Gasto Extra</th>
            <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Neto</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="bloque in bloques" :key="bloque.key">
            <template v-if="bloque.filas.length">
              <tr v-for="(fila, i) in bloque.filas" :key="bloque.key + '|' + fila.origen" class="hover:bg-orange-50/20 transition-colors">
                <td v-if="i === 0" :rowspan="bloque.filas.length + 1" class="p-3 border-b border-r font-black text-gray-800 align-top bg-gray-50/40">{{ bloque.label }}</td>
                <td class="p-3 border-b border-r font-bold text-gray-700">{{ fila.origen }}</td>
                <td v-for="col in columnas" :key="col.key" class="px-2 py-2 border-b border-r text-center text-sm font-bold text-gray-800">{{ fila.cantidades[col.key] || 0 }}</td>
                <td class="p-2 border-b text-right text-sm font-black text-blue-600">{{ formatMoney(fila.ingreso) }} Bs.</td>
                <td class="p-2 border-b text-right text-sm font-black text-orange-500">{{ formatMoney(fila.gastoExtra) }} Bs.</td>
                <td class="p-2 border-b text-right text-sm font-black text-emerald-600">{{ formatMoney(fila.neto) }} Bs.</td>
              </tr>
              <tr class="bg-orange-50/40">
                <td class="p-3 border-b border-r font-black text-gray-700">Total {{ periodo.toLowerCase() }}</td>
                <td v-for="col in columnas" :key="'pt-' + bloque.key + col.key" class="px-2 py-2 border-b border-r text-center text-sm font-black text-gray-800">{{ bloque.totalesPorColumna[col.key] || 0 }}</td>
                <td class="p-2 border-b text-right text-sm font-black text-blue-700">{{ formatMoney(bloque.totales.ingreso) }} Bs.</td>
                <td class="p-2 border-b text-right text-sm font-black text-orange-600">{{ formatMoney(bloque.totales.gastoExtra) }} Bs.</td>
                <td class="p-2 border-b text-right text-sm font-black text-emerald-700">{{ formatMoney(bloque.totales.neto) }} Bs.</td>
              </tr>
            </template>
            <tr v-else>
              <td class="p-3 border-b border-r font-black text-gray-400 align-top">{{ bloque.label }}</td>
              <td :colspan="columnas.length + 4" class="p-3 border-b text-center text-sm text-gray-400">Sin ventas en este periodo</td>
            </tr>
          </template>

          <tr class="bg-orange-100/60">
            <td colspan="2" class="p-3 border-t-2 border-orange-300 font-black text-gray-900">TOTAL GENERAL</td>
            <td v-for="col in columnas" :key="'tg-' + col.key" class="px-2 py-2 border-t-2 border-orange-300 text-center text-sm font-black text-gray-900">{{ total.totalesPorColumna[col.key] || 0 }}</td>
            <td class="p-2 border-t-2 border-orange-300 text-right text-sm font-black text-blue-800">{{ formatMoney(total.totales.ingreso) }} Bs.</td>
            <td class="p-2 border-t-2 border-orange-300 text-right text-sm font-black text-orange-700">{{ formatMoney(total.totales.gastoExtra) }} Bs.</td>
            <td class="p-2 border-t-2 border-orange-300 text-right text-sm font-black text-emerald-800">{{ formatMoney(total.totales.neto) }} Bs.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// Tabla general única: un bloque por periodo (día, semana o mes) y total general al final.
// Los cálculos llegan desde VentasTable.vue (construirTablaGeneral en ventasGeneral.js).
const props = defineProps({
  titulo: { type: String, default: 'Tabla general' },
  periodo: { type: String, default: 'Día' },
  grupos: { type: Array, default: () => [] },
  columnas: { type: Array, default: () => [] },
  bloques: { type: Array, default: () => [] },
  total: { type: Object, default: () => ({ filas: [], columnas: [], totalesPorColumna: {}, totales: { ingreso: 0, gastoExtra: 0, neto: 0 } }) }
})

const formatMoney = (val) => Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
</script>
