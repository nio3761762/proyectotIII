<template>
  <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
      <div>
        <h3 class="text-lg font-bold text-gray-800">{{ agruparPorSemana ? 'Resumen Semanal' : 'Resumen Diario' }}</h3>
        <p class="text-xs text-gray-500 mt-1">
          Detalle de productos por día (turnos mañana y tarde agrupados): producido, mala y vendido por medida.
          Con la vista semanal los días se agrupan en semanas.
        </p>
      </div>
      <div v-if="totals.dias > 0" class="flex items-center gap-3 text-xs">
        <span class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-bold">{{ totals.dias }} días</span>
      </div>
    </div>

    <!-- Vista por Día -->
    <div v-if="!agruparPorSemana">
      <div v-if="detalleDias.length === 0" class="p-4 text-center text-gray-400 text-sm">Sin datos para el período seleccionado.</div>
      <div v-for="dd in detalleDias" :key="dd.fecha" class="border-b border-gray-100">
        <div class="px-6 py-3 bg-gray-50/40 flex items-center justify-between flex-wrap gap-2">
          <h4 class="text-sm font-black text-gray-700">{{ formatFecha(dd.fecha) }}</h4>
          <div class="flex items-center gap-4 text-[11px]">
            <span class="text-gray-500">Ing. Tienda <b class="text-emerald-600 font-black">{{ formatMoney(dd.ingreso_tienda) }}</b></span>
            <span class="text-gray-500">Gasto Extra <b class="text-red-400 font-black">(−) {{ formatMoney(dd.gasto_extra) }}</b></span>
            <span class="text-gray-500">Ganancia del Día
              <b :class="['font-black', dd.ganancia_total >= 0 ? 'text-green-600' : 'text-red-600']">{{ formatMoney(dd.ganancia_total) }}</b>
            </span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white">
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[200px]">Producto</th>
                <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-left min-w-[110px]">Medida</th>
                <th class="p-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b text-center bg-blue-50/40 min-w-[90px]">Producido</th>
                <th class="p-2 text-[10px] font-black text-red-400 uppercase tracking-widest border-b text-center bg-gray-50/60 min-w-[70px]">Mala</th>
                <th class="p-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b text-center bg-blue-50/40 min-w-[90px]">Vendido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in dd.productos" :key="p.idproducto + '|' + p.medida" class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
                <td class="p-3 font-bold text-gray-700">{{ p.producto }}</td>
                <td class="p-3 text-gray-500">{{ p.medida }}</td>
                <td class="p-3 text-center font-black text-emerald-600 bg-blue-50/20">{{ p.producido }}</td>
                <td class="p-3 text-center font-medium text-red-400">{{ p.mala }}</td>
                <td class="p-3 text-center font-black text-blue-600 bg-blue-50/20">{{ p.vendido }}</td>
              </tr>
              <tr v-if="dd.productos.length === 0">
                <td colspan="5" class="p-3 text-center text-gray-400 text-xs">Sin producción ni ventas este día.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="px-6 py-4 bg-orange-50/50 flex items-center justify-between flex-wrap gap-3">
        <span class="font-black text-gray-600 text-xs uppercase">Total General {{ totals.dias }} días</span>
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-[9px] text-gray-400 uppercase font-black">Producido</p>
            <p class="text-sm font-black text-emerald-700">{{ totals.producido }} uds.</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] text-gray-400 uppercase font-black">Vendido</p>
            <p class="text-sm font-black text-blue-700">{{ totals.vendido }} uds.</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] text-gray-400 uppercase font-black">Ganancia</p>
            <p class="text-sm font-black" :class="totals.ganancia_total >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatMoney(totals.ganancia_total) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista por Semana -->
    <div v-else class="divide-y divide-gray-100">
      <div v-if="semanas.length === 0" class="p-4 text-center text-gray-400 text-sm">Sin datos para el período seleccionado.</div>
      <div v-for="sem in semanas" :key="sem.inicio">
        <button
          @click="toggleSemana(sem.inicio)"
          class="w-full px-6 py-4 flex items-center justify-between gap-4 bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 transition-colors text-left"
        >
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform flex-shrink-0', expandedSemanas[sem.inicio] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <div>
              <h4 class="font-bold text-gray-800">{{ sem.label }}</h4>
              <span class="text-xs text-gray-500">{{ sem.dias.length }} días</span>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Producido</p>
              <p class="text-sm font-black text-emerald-600">{{ sem.totalProducido }} uds.</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Vendido</p>
              <p class="text-sm font-black text-blue-600">{{ sem.totalVendido }} uds.</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Ganancia</p>
              <p class="text-sm font-black" :class="sem.totalGanancia >= 0 ? 'text-green-600' : 'text-red-600'">{{ formatMoney(sem.totalGanancia) }}</p>
            </div>
          </div>
        </button>

        <div v-if="expandedSemanas[sem.inicio]" class="border-t border-gray-100">
          <div v-for="dd in sem.dias" :key="dd.fecha" class="border-b border-gray-100">
            <div class="px-6 py-2.5 bg-gray-50/40 flex items-center justify-between flex-wrap gap-2">
              <h5 class="text-xs font-black text-gray-600">{{ formatFecha(dd.fecha) }}</h5>
              <div class="flex items-center gap-4 text-[11px]">
                <span class="text-gray-500">Ing. Tienda <b class="text-emerald-600 font-black">{{ formatMoney(dd.ingreso_tienda) }}</b></span>
                <span class="text-gray-500">Gasto Extra <b class="text-red-400 font-black">(−) {{ formatMoney(dd.gasto_extra) }}</b></span>
                <span class="text-gray-500">Ganancia
                  <b :class="['font-black', dd.ganancia_total >= 0 ? 'text-green-600' : 'text-red-600']">{{ formatMoney(dd.ganancia_total) }}</b>
                </span>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-white">
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[200px]">Producto</th>
                    <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-left min-w-[110px]">Medida</th>
                    <th class="p-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b text-center bg-blue-50/40 min-w-[90px]">Producido</th>
                    <th class="p-2 text-[10px] font-black text-red-400 uppercase tracking-widest border-b text-center bg-gray-50/60 min-w-[70px]">Mala</th>
                    <th class="p-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b text-center bg-blue-50/40 min-w-[90px]">Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in dd.productos" :key="p.idproducto + '|' + p.medida" class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
                    <td class="p-3 font-bold text-gray-700">{{ p.producto }}</td>
                    <td class="p-3 text-gray-500">{{ p.medida }}</td>
                    <td class="p-3 text-center font-black text-emerald-600 bg-blue-50/20">{{ p.producido }}</td>
                    <td class="p-3 text-center font-medium text-red-400">{{ p.mala }}</td>
                    <td class="p-3 text-center font-black text-blue-600 bg-blue-50/20">{{ p.vendido }}</td>
                  </tr>
                  <tr v-if="dd.productos.length === 0">
                    <td colspan="5" class="p-3 text-center text-gray-400 text-xs">Sin producción ni ventas este día.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="sem.productoTotales.length" class="px-6 py-4 bg-orange-50/40">
            <h5 class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total por Producto de la Semana</h5>
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white">
                  <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[200px]">Producto</th>
                  <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-left min-w-[110px]">Medida</th>
                  <th class="p-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b text-center min-w-[90px]">Producido</th>
                  <th class="p-2 text-[10px] font-black text-red-400 uppercase tracking-widest border-b text-center min-w-[70px]">Mala</th>
                  <th class="p-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b text-center min-w-[90px]">Vendido</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tp in sem.productoTotales" :key="tp.idproducto + '|' + tp.medida" class="border-b border-gray-100">
                  <td class="p-2 font-bold text-gray-700">{{ tp.producto }}</td>
                  <td class="p-2 text-gray-500">{{ tp.medida }}</td>
                  <td class="p-2 text-center font-black text-emerald-600">{{ tp.producido }}</td>
                  <td class="p-2 text-center font-medium text-red-400">{{ tp.mala }}</td>
                  <td class="p-2 text-center font-black text-blue-600">{{ tp.vendido }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-orange-50/50 flex items-center justify-between flex-wrap gap-3">
        <span class="font-black text-gray-600 text-xs uppercase">Total General {{ totals.dias }} días</span>
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-[9px] text-gray-400 uppercase font-black">Producido</p>
            <p class="text-sm font-black text-emerald-700">{{ totals.producido }} uds.</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] text-gray-400 uppercase font-black">Vendido</p>
            <p class="text-sm font-black text-blue-700">{{ totals.vendido }} uds.</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] text-gray-400 uppercase font-black">Ganancia</p>
            <p class="text-sm font-black" :class="totals.ganancia_total >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatMoney(totals.ganancia_total) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getWeekStart as sharedWeekStart, getWeekLabel as sharedWeekLabel } from './useSemana'

const props = defineProps({
  detalleTurnos: { type: Array, default: () => [] },
  gananciasDiarias: { type: Array, default: () => [] },
  formatFecha: { type: Function, default: (f) => f },
  formatMoney: { type: Function, default: (v) => v },
  agruparPorSemana: { type: Boolean, default: false }
})

const emptyRow = (fecha) => ({
  fecha,
  producido: 0,
  vendido: 0,
  cantidad_mala: 0,
  ingreso_tienda: 0,
  gasto_extra: 0,
  neto_tienda: 0,
  liquido_revendedor: 0,
  gasto_extra_revendedor: 0,
  neto_revendedor: 0,
  gasto_extra_total: 0,
  ganancia_total: 0
})

// Detalle por día: todos los productos con su medida, turnos agrupados
const detalleDias = computed(() => {
  const map = {}
  ;(props.detalleTurnos || []).forEach(d => {
    const fecha = String(d.fecha || '').split('T')[0]
    if (!map[fecha]) map[fecha] = { fecha, productos: [], ingreso_tienda: 0, gasto_extra: 0, ganancia_total: 0 }
    const index = {}
    ;['manana', 'tarde'].forEach(turno => {
      const productos = (d.turnos && d.turnos[turno] && d.turnos[turno].productos) || []
      productos.forEach(p => {
        const medida = String(p.presentacion || 'Unidad')
        const key = `${String(p.idproducto || '')}|${medida}`
        if (!index[key]) {
          index[key] = { idproducto: p.idproducto, producto: p.producto || 'Sin nombre', medida, producido: 0, mala: 0, vendido: 0 }
          map[fecha].productos.push(index[key])
        }
        index[key].producido += Number(p.cantidad_producida) || 0
        index[key].mala += Number(p.cantidad_mala) || 0
        index[key].vendido += Number(p.cantidad_vendida_total) || 0
      })
    })
  })
  ;(props.gananciasDiarias || []).forEach(g => {
    const fecha = String(g.fecha || '').split('T')[0]
    if (!map[fecha]) return
    Object.assign(map[fecha], {
      ingreso_tienda: Number(g.ingreso_tienda) || 0,
      gasto_extra: Number(g.gasto_extra) || 0,
      ganancia_total: Number(g.ganancia_total) || 0
    })
  })
  return Object.values(map).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const dias = computed(() => {
  const map = {}
  ;(props.detalleTurnos || []).forEach(d => {
    const fecha = String(d.fecha || '').split('T')[0]
    if (!map[fecha]) map[fecha] = emptyRow(fecha)
    map[fecha].producido += Number(d.total_producido) || 0
    map[fecha].vendido += Number(d.total_vendido) || 0
  })
  ;(props.gananciasDiarias || []).forEach(g => {
    const fecha = String(g.fecha || '').split('T')[0]
    if (!map[fecha]) map[fecha] = emptyRow(fecha)
    Object.assign(map[fecha], {
      cantidad_mala: Number(g.cantidad_mala) || 0,
      ingreso_tienda: Number(g.ingreso_tienda) || 0,
      gasto_extra: Number(g.gasto_extra) || 0,
      neto_tienda: Number(g.neto_tienda) || 0,
      liquido_revendedor: Number(g.liquido_revendedor) || 0,
      gasto_extra_revendedor: Number(g.gasto_extra_revendedor) || 0,
      neto_revendedor: Number(g.neto_revendedor) || 0,
      gasto_extra_total: Number(g.gasto_extra_total) || 0,
      ganancia_total: Number(g.ganancia_total) || 0
    })
  })
  return Object.values(map).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const totalizar = (rows) => rows.reduce((acc, r) => {
  acc.dias += 1
  acc.producido += r.producido
  acc.vendido += r.vendido
  acc.cantidad_mala += r.cantidad_mala
  acc.ingreso_tienda += r.ingreso_tienda
  acc.gasto_extra += r.gasto_extra
  acc.neto_tienda += r.neto_tienda
  acc.liquido_revendedor += r.liquido_revendedor
  acc.gasto_extra_revendedor += r.gasto_extra_revendedor
  acc.neto_revendedor += r.neto_revendedor
  acc.gasto_extra_total += r.gasto_extra_total
  acc.ganancia_total += r.ganancia_total
  return acc
}, { dias: 0, producido: 0, vendido: 0, cantidad_mala: 0, ingreso_tienda: 0, gasto_extra: 0, neto_tienda: 0, liquido_revendedor: 0, gasto_extra_revendedor: 0, neto_revendedor: 0, gasto_extra_total: 0, ganancia_total: 0 })

const totals = computed(() => totalizar(dias.value))

const semanas = computed(() => {
  const groups = {}
  detalleDias.value.forEach(dd => {
    const inicio = sharedWeekStart(dd.fecha)
    if (!groups[inicio]) groups[inicio] = { inicio, label: sharedWeekLabel(inicio), dias: [] }
    groups[inicio].dias.push(dd)
  })
  return Object.values(groups)
    .map(s => {
      const byKey = {}
      s.dias.forEach(dd => {
        dd.productos.forEach(p => {
          const key = `${String(p.idproducto || '')}|${p.medida}`
          if (!byKey[key]) byKey[key] = { idproducto: p.idproducto, producto: p.producto, medida: p.medida, producido: 0, mala: 0, vendido: 0 }
          byKey[key].producido += p.producido
          byKey[key].mala += p.mala
          byKey[key].vendido += p.vendido
        })
      })
      const weekDays = dias.value.filter(d => sharedWeekStart(d.fecha) === s.inicio)
      const t = totalizar(weekDays)
      return {
        ...s,
        dias: s.dias,
        productoTotales: Object.values(byKey).sort((a, b) => b.producido - a.producido),
        totalProducido: t.producido,
        totalVendido: t.vendido,
        totalMala: t.cantidad_mala,
        totalIngreso: t.ingreso_tienda,
        totalGastoExtra: t.gasto_extra,
        totalGanancia: t.ganancia_total
      }
    })
    .sort((a, b) => new Date(b.inicio) - new Date(a.inicio))
})

const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

watch(() => props.detalleTurnos, () => {
  expandedSemanas.value = {}
})

watch(() => props.gananciasDiarias, () => {
  expandedSemanas.value = {}
})
</script>