<template>
  <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
      <div>
        <h3 class="text-lg font-bold text-gray-800">Resumen General por Producto y Turno</h3>
        <p class="text-xs text-gray-500 mt-1">Consolidado del período seleccionado. Regla: la venta de la tarde (12:00 PM - 12:00 AM) pertenece al día siguiente; la de la mañana (12:00 AM - 12:00 PM) al mismo día.</p>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/40">
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[150px]" rowspan="2">Producto</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[100px]" rowspan="2">Presentación</th>
            <th class="p-2 text-[10px] font-black text-blue-500 uppercase tracking-widest border-b text-center min-w-[80px]" rowspan="2">Inicio</th>
            <th class="p-2 bg-blue-50/50 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b text-center" colspan="3">Mañana · 12:00 AM - 12:00 PM</th>
            <th class="p-2 bg-amber-50/50 text-[10px] font-black text-orange-600 uppercase tracking-widest border-b text-center" colspan="3">Tarde · 12:00 PM - 12:00 AM</th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center" rowspan="2">Total Prod.</th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center" rowspan="2">Total Vend.</th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center" rowspan="2">Restante Final</th>
          </tr>
          <tr class="bg-gray-50/40">
            <th class="p-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b text-center bg-blue-50/50">Producido</th>
            <th class="p-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b text-center bg-blue-50/50">Vendido</th>
            <th class="p-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b text-center bg-blue-50/50">Restante</th>
            <th class="p-2 text-[10px] font-black text-orange-600 uppercase tracking-widest border-b text-center bg-amber-50/50">Producido</th>
            <th class="p-2 text-[10px] font-black text-orange-600 uppercase tracking-widest border-b text-center bg-amber-50/50">Vendido</th>
            <th class="p-2 text-[10px] font-black text-orange-600 uppercase tracking-widest border-b text-center bg-amber-50/50">Restante</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key" class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
            <td class="p-3 font-medium text-gray-800">{{ row.producto }}</td>
            <td class="p-3 text-gray-500">{{ row.presentacion }}</td>
            <td class="p-3 text-center font-medium text-gray-500">{{ row.inicioManana }}</td>
            <td class="p-3 text-center font-black text-emerald-600 bg-blue-50/30">{{ row.producidoManana }}</td>
            <td class="p-3 text-center font-bold text-blue-600 bg-blue-50/30">{{ row.vendidoManana }}</td>
            <td class="p-3 text-center font-black bg-blue-50/30" :class="row.restanteManana >= 0 ? 'text-amber-600' : 'text-red-600'">{{ row.restanteManana }}</td>
            <td class="p-3 text-center font-black text-emerald-600 bg-amber-50/30">{{ row.producidoTarde }}</td>
            <td class="p-3 text-center font-bold text-orange-600 bg-amber-50/30">{{ row.vendidoTarde }}</td>
            <td class="p-3 text-center font-black bg-amber-50/30" :class="row.restanteTarde >= 0 ? 'text-amber-600' : 'text-red-600'">{{ row.restanteTarde }}</td>
            <td class="p-3 text-center font-black text-gray-700">{{ row.totalProducido }}</td>
            <td class="p-3 text-center font-black text-gray-700">{{ row.totalVendido }}</td>
            <td class="p-3 text-center font-black" :class="row.restanteFinal >= 0 ? 'text-green-600' : 'text-red-600'">{{ row.restanteFinal }}</td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="12" class="p-4 text-center text-gray-400 text-sm">Sin datos para el período seleccionado.</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-gray-50/50">
            <td class="p-3 font-black text-gray-600 text-xs uppercase border-t-2 border-gray-200" colspan="2">Totales</td>
            <td class="p-3 text-center font-black text-gray-500 border-t-2 border-gray-200">{{ tot.inicioManana }}</td>
            <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-gray-200 bg-blue-50/30">{{ tot.producidoManana }}</td>
            <td class="p-3 text-center font-black text-blue-700 border-t-2 border-gray-200 bg-blue-50/30">{{ tot.vendidoManana }}</td>
            <td class="p-3 text-center font-black border-t-2 border-gray-200 bg-blue-50/30" :class="tot.restanteManana >= 0 ? 'text-amber-700' : 'text-red-700'">{{ tot.restanteManana }}</td>
            <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-gray-200 bg-amber-50/30">{{ tot.producidoTarde }}</td>
            <td class="p-3 text-center font-black text-orange-700 border-t-2 border-gray-200 bg-amber-50/30">{{ tot.vendidoTarde }}</td>
            <td class="p-3 text-center font-black border-t-2 border-gray-200 bg-amber-50/30" :class="tot.restanteTarde >= 0 ? 'text-amber-700' : 'text-red-700'">{{ tot.restanteTarde }}</td>
            <td class="p-3 text-center font-black text-gray-800 border-t-2 border-gray-200">{{ tot.totalProducido }}</td>
            <td class="p-3 text-center font-black text-gray-800 border-t-2 border-gray-200">{{ tot.totalVendido }}</td>
            <td class="p-3 text-center font-black border-t-2 border-gray-200" :class="tot.restanteFinal >= 0 ? 'text-green-700' : 'text-red-700'">{{ tot.restanteFinal }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  detalleTurnos: { type: Array, default: () => [] }
})

const keyOf = (p) => `${p.idproducto}::${p.presentacion || 'Unidad'}`

const rows = computed(() => {
  const map = {}
  const nombres = {}
  props.detalleTurnos.forEach(dia => {
    ;['manana', 'tarde'].forEach(turnoName => {
      const turno = (dia.turnos || {})[turnoName] || { productos: [] }
      ;(turno.productos || []).forEach(p => {
        const key = keyOf(p)
        if (!map[key]) {
          map[key] = {
            key,
            idproducto: p.idproducto,
            producto: p.producto || nombres[key] || 'Sin nombre',
            presentacion: p.presentacion || 'Unidad',
            producidoManana: 0, vendidoManana: 0,
            producidoTarde: 0, vendidoTarde: 0
          }
        }
        const r = map[key]
        const prod = p.cantidad_producida || 0
        const vend = p.cantidad_vendida_total || 0
        if (turnoName === 'manana') {
          r.producidoManana += prod
          r.vendidoManana += vend
        } else {
          r.producidoTarde += prod
          r.vendidoTarde += vend
        }
        nombres[key] = p.producto || 'Sin nombre'
      })
    })
  })

  let inicioAcum = {}
  const out = Object.values(map).map(row => {
    const inicioManana = inicioAcum[row.key] || 0
    const restanteManana = inicioManana + row.producidoManana - row.vendidoManana
    inicioAcum[row.key] = restanteManana
    const inicioTarde = restanteManana
    const restanteTarde = inicioTarde + row.producidoTarde - row.vendidoTarde
    inicioAcum[row.key] = restanteTarde
    return {
      ...row,
      inicioManana,
      restanteManana,
      inicioTarde,
      restanteTarde,
      totalProducido: row.producidoManana + row.producidoTarde,
      totalVendido: row.vendidoManana + row.vendidoTarde,
      restanteFinal: restanteTarde
    }
  })

  out.sort((a, b) => b.totalProducido - a.totalProducido)
  return out
})

const tot = computed(() => {
  return rows.value.reduce((acc, r) => {
    acc.inicioManana += r.inicioManana
    acc.producidoManana += r.producidoManana
    acc.vendidoManana += r.vendidoManana
    acc.restanteManana += r.restanteManana
    acc.producidoTarde += r.producidoTarde
    acc.vendidoTarde += r.vendidoTarde
    acc.restanteTarde += r.restanteTarde
    acc.totalProducido += r.totalProducido
    acc.totalVendido += r.totalVendido
    acc.restanteFinal += r.restanteFinal
    return acc
  }, { inicioManana: 0, producidoManana: 0, vendidoManana: 0, restanteManana: 0, producidoTarde: 0, vendidoTarde: 0, restanteTarde: 0, totalProducido: 0, totalVendido: 0, restanteFinal: 0 })
})
</script>
