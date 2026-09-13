<template>
  <div class="space-y-8">
    <div class="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl p-6 text-white shadow-xl">
      <p class="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Producción vs Venta por Turnos</p>
      <p class="text-xs opacity-80 mb-4">Cada día se divide en dos turnos por la hora: <b>Mañana</b> (12:00 AM - 12:00 PM) y <b>Tarde</b> (12:00 PM - 12:00 AM) del mismo día. Todo se muestra en su propia fecha y en su presentación como se registró. La columna <b>Restante</b> sigue el stock que queda y pasa al siguiente turno/día.</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p class="text-xl font-black">{{ totales.globalProduccion }} uds.</p>
          <p class="text-[10px] opacity-80">Total Producido</p>
        </div>
        <div>
          <p class="text-xl font-black">{{ totales.globalVendido }} uds.</p>
          <p class="text-[10px] opacity-80">Total Vendido</p>
        </div>
        <div>
          <p class="text-xl font-black">M: {{ totales.mananaProduccion }} / {{ totales.mananaVendido }}</p>
          <p class="text-[10px] opacity-80">Mañana (Prod / Vend)</p>
        </div>
        <div>
          <p class="text-xl font-black">T: {{ totales.tardeProduccion }} / {{ totales.tardeVendido }}</p>
          <p class="text-[10px] opacity-80">Tarde (Prod / Vend)</p>
        </div>
      </div>
    </div>

    <div v-if="vistaSemanal" class="space-y-5">
      <div v-if="semanasData.length === 0" class="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center">
        <p class="text-gray-400 text-sm">Sin datos en el rango seleccionado</p>
      </div>
      <div v-for="sem in semanasData" :key="'sem-'+sem.inicio" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer select-none" @click="toggleSemana(sem.inicio)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', isSemanaExpanded(sem.inicio) ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <div>
              <h3 class="font-bold text-gray-800 text-lg">Semana: {{ sem.label }}</h3>
              <p class="text-xs text-gray-400">{{ sem.dias.length }} día{{ sem.dias.length === 1 ? '' : 's' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-emerald-600 font-bold">Prod: {{ sem.totalProducido }}</span>
            <span class="text-xs text-blue-600 font-bold">Vend: {{ sem.totalVendido }}</span>
          </div>
        </div>

        <div v-if="isSemanaExpanded(sem.inicio)" class="p-4 space-y-5">
          <div class="overflow-hidden rounded-2xl border border-gray-200">
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h4 class="text-sm font-black text-gray-700 uppercase tracking-widest">Resumen Semanal por Unidades</h4>
              <p class="text-[11px] text-gray-400 mt-0.5">Producción y venta por producto y unidad para cada día. Cada día se divide en dos turnos: Mañana y Tarde. La fila Resta = stock que queda al cierre del día (inicio + producido − vendido − mala − consumo de presentaciones compuestas, p.ej. bolsa x5 que absorbe unidades base). Unidades con el mismo producto son distintas presentaciones y cada una se muestra con su abreviatura.</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/40">
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[110px]" rowspan="2">Fecha</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[100px]" rowspan="2">Turno</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[70px]" rowspan="2">Tipo</th>
                    <th v-for="col in sem.matrizC.cols" :key="'col-'+col.idproducto" :colspan="col.units.length"
                        class="p-2 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b text-center bg-gradient-to-r from-indigo-50 to-violet-50">
                      {{ col.producto }}
                    </th>
                    <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[80px]" rowspan="2">Total</th>
                  </tr>
                  <tr class="bg-gray-50/40">
                    <th v-for="u in sem.matrizC.flats" :key="'unit-'+u.key"
                        class="p-2 text-[10px] font-black text-violet-600 uppercase tracking-widest border-b text-center bg-gray-50/60 min-w-[46px]">
                      {{ unitLabel(u) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="sem.matrizC.filas.length === 0">
                    <tr>
                      <td :colspan="3 + sem.matrizC.flats.length + 1" class="p-4 text-center text-gray-400 text-sm">Sin datos en esta semana</td>
                    </tr>
                  </template>
                  <template v-for="(f, fi) in sem.matrizC.filas" :key="f.fecha">
                    <template v-for="(tr, ti) in f.turnos" :key="tr.turno">
                      <tr :class="ti === 0 ? 'bg-blue-50/30' : 'bg-amber-50/30'">
                        <td v-if="ti === 0" :rowspan="4" class="p-3 font-black text-gray-700 align-middle whitespace-nowrap">{{ formatFecha(f.fecha) }}</td>
                        <td :rowspan="2" class="p-3 font-black text-gray-600 align-middle">{{ tr.label }}</td>
                        <td class="p-3 text-[11px] font-black text-emerald-600 uppercase tracking-wider">Prod</td>
                        <td v-for="(v, i) in tr.prod" :key="'p'+ti+'-'+i" class="p-2 text-center font-bold text-gray-700">{{ v }}</td>
                        <td class="p-2 text-center font-black text-emerald-700">{{ tr.totalProd }}</td>
                      </tr>
                      <tr :class="ti === 0 ? 'bg-blue-50/30' : 'bg-amber-50/30'">
                        <td class="p-3 text-[11px] font-black text-blue-600 uppercase tracking-wider">Venta</td>
                        <td v-for="(v, i) in tr.venta" :key="'v'+ti+'-'+i" class="p-2 text-center font-medium text-gray-600">{{ v }}</td>
                        <td class="p-2 text-center font-black text-blue-700">{{ tr.totalVenta }}</td>
                      </tr>
                    </template>
                    <tr class="bg-orange-50/60 border-t-2 border-gray-200">
                      <td :rowspan="3" class="p-3 font-black text-gray-700 align-middle whitespace-nowrap">{{ formatFecha(f.fecha) }}</td>
                      <td :rowspan="3" class="p-3 font-black text-gray-700 align-middle">TOTAL</td>
                      <td class="p-3 text-[11px] font-black text-emerald-600 uppercase tracking-wider">Prod</td>
                      <td v-for="(v, i) in f.totals.prod" :key="'tp-'+i" class="p-2 text-center font-black text-emerald-700">{{ v }}</td>
                      <td class="p-2 text-center font-black text-emerald-700">{{ f.totals.totalProd }}</td>
                    </tr>
                    <tr class="bg-orange-50/60">
                      <td class="p-3 text-[11px] font-black text-blue-600 uppercase tracking-wider">Venta</td>
                      <td v-for="(v, i) in f.totals.venta" :key="'tv-'+i" class="p-2 text-center font-black text-blue-700">{{ v }}</td>
                      <td class="p-2 text-center font-black text-blue-700">{{ f.totals.totalVenta }}</td>
                    </tr>
                    <tr class="bg-orange-50/60">
                      <td class="p-3 text-[11px] font-black text-gray-700 uppercase tracking-wider">Resta</td>
                      <td v-for="(v, i) in f.totals.resta" :key="'tr-'+i" class="p-2 text-center font-black" :class="v >= 0 ? 'text-gray-700' : 'text-red-600'">{{ v }}</td>
                      <td class="p-2 text-center font-black" :class="f.totals.totalResta >= 0 ? 'text-gray-800' : 'text-red-600'">{{ f.totals.totalResta }}</td>
                    </tr>
                  </template>
                </tbody>
                <tfoot>
                  <tr class="bg-gradient-to-r from-indigo-50 to-violet-50">
                    <td :rowspan="3" class="p-3 font-black text-indigo-700 text-xs uppercase align-middle whitespace-nowrap">Total Semana</td>
                    <td :rowspan="3" class="p-3 font-black text-indigo-600 text-xs uppercase align-middle">TODOS</td>
                    <td class="p-3 text-[11px] font-black text-emerald-600 uppercase tracking-wider">Prod</td>
                    <td v-for="(v, i) in sem.matrizC.semana.prod" :key="'sp-'+i" class="p-2 text-center font-black text-emerald-700 border-t-2 border-gray-200">{{ v }}</td>
                    <td class="p-2 text-center font-black text-emerald-700 border-t-2 border-gray-200">{{ sem.matrizC.semana.totalProd }}</td>
                  </tr>
                  <tr class="bg-gradient-to-r from-indigo-50 to-violet-50">
                    <td class="p-3 text-[11px] font-black text-blue-600 uppercase tracking-wider">Venta</td>
                    <td v-for="(v, i) in sem.matrizC.semana.venta" :key="'sv-'+i" class="p-2 text-center font-black text-blue-700">{{ v }}</td>
                    <td class="p-2 text-center font-black text-blue-700">{{ sem.matrizC.semana.totalVenta }}</td>
                  </tr>
                  <tr class="bg-gradient-to-r from-indigo-50 to-violet-50">
                    <td class="p-3 text-[11px] font-black text-gray-700 uppercase tracking-wider">Resta</td>
                    <td v-for="(v, i) in sem.matrizC.semana.resta" :key="'sr-'+i" class="p-2 text-center font-black" :class="v >= 0 ? 'text-gray-700' : 'text-red-600'">{{ v }}</td>
                    <td class="p-2 text-center font-black" :class="sem.matrizC.semana.totalResta >= 0 ? 'text-gray-800' : 'text-red-600'">{{ sem.matrizC.semana.totalResta }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Resumen General por Producto y Turno · por Día</h4>
            <div class="space-y-5">
              <div v-for="dia in sem.dias" :key="'res-'+dia.fecha">
                <div class="mb-2 flex items-center gap-3 flex-wrap">
                  <span class="text-sm font-black text-gray-800 uppercase tracking-wider">{{ formatFecha(dia.fecha) }}</span>
                  <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Prod: {{ dia.total_producido }}</span>
                  <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Vend: {{ dia.total_vendido }}</span>
                  <span class="text-[10px] font-bold text-red-400 bg-red-50 px-2 py-1 rounded-lg">Mala: {{ malaDia(dia) }}</span>
                  <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Stock: {{ stockDia(dia) }}</span>
                </div>
                <ResumenTurnosTable :detalle-turnos="[dia]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div v-for="dia in diasVisibles" :key="dia.fecha" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleDia(dia.fecha)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedDias[dia.fecha] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ formatFecha(dia.fecha) }}</h3>
            <span class="text-xs text-gray-400">|</span>
            <span class="text-xs text-emerald-600 font-bold">Prod: {{ dia.total_producido }}</span>
            <span class="text-xs text-blue-600 font-bold">Vend: {{ dia.total_vendido }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button @click.stop="expandAll" class="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg transition-colors">Expandir</button>
            <button @click.stop="collapseAll" class="text-[10px] font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded-lg transition-colors">Contraer</button>
          </div>
        </div>
        <div v-if="expandedDias[dia.fecha]" class="p-4 space-y-4">
          <TurnoBloque :turno="dia.turnos.manana" :stock-inicio-por-producto="dia.stockManana" titulo="Mañana (12:00 AM - 12:00 PM)" :format-money="formatMoney" />
          <TurnoBloque :turno="dia.turnos.tarde" :stock-inicio-por-producto="dia.stockTarde" titulo="Tarde (12:00 PM - 12:00 AM)" :format-money="formatMoney" />
        </div>
      </div>
      <div v-if="diasOcultos > 0" class="text-center pt-2">
        <button @click="mostrarMasDias" class="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">Mostrar más días ({{ diasOcultos }} restantes)</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getWeekStart as sharedWeekStart, getWeekLabel as sharedWeekLabel } from './useSemana'
import { keyOfProducto, restanteItem } from './useStock'
import TurnoBloque from './TurnoBloque.vue'
import ResumenTurnosTable from './ResumenTurnosTable.vue'

const props = defineProps({
  detalleTurnos: { type: Array, default: () => [] },
  formatFecha: { type: Function, default: (f) => f },
  agruparPorSemana: { type: Boolean, default: false }
})

const formatMoney = (v) => '$' + Number(v || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// El stock heredado (Inicio/Restante) por producto y turno ya viene calculado
// en el backend (reporte/produccion-vs-venta). Cada fila incluye inicio,
// restante, consumida y consumo_detalle; los días incluyen stockManana/stockTarde.
const diasConStock = computed(() => {
  return [...props.detalleTurnos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const diasVisiblesLimite = ref(15)
const diasVisibles = computed(() => diasConStock.value.slice(0, diasVisiblesLimite.value))
const mostrarMasDias = () => { diasVisiblesLimite.value += 15 }
const diasOcultos = computed(() => Math.max(0, diasConStock.value.length - diasVisibles.value.length))

const totales = computed(() => {
  let globalProduccion = 0, globalVendido = 0, mananaProduccion = 0, mananaVendido = 0, tardeProduccion = 0, tardeVendido = 0
  props.detalleTurnos.forEach(dia => {
    globalProduccion += dia.total_producido || 0
    globalVendido += dia.total_vendido || 0
    mananaProduccion += (dia.turnos?.manana?.total_producido || 0)
    mananaVendido += (dia.turnos?.manana?.total_vendido || 0)
    tardeProduccion += (dia.turnos?.tarde?.total_producido || 0)
    tardeVendido += (dia.turnos?.tarde?.total_vendido || 0)
  })
  return { globalProduccion, globalVendido, mananaProduccion, mananaVendido, tardeProduccion, tardeVendido }
})

const semanaGroups = computed(() => {
  const weeks = {}
  diasConStock.value.forEach(dia => {
    const inicio = sharedWeekStart(dia.fecha)
    if (!weeks[inicio]) weeks[inicio] = { inicio, label: sharedWeekLabel(inicio), dias: [], totalProducido: 0, totalVendido: 0 }
    weeks[inicio].dias.push(dia)
    weeks[inicio].totalProducido += dia.total_producido || 0
    weeks[inicio].totalVendido += dia.total_vendido || 0
  })
  return Object.values(weeks).sort((a, b) => new Date(b.inicio) - new Date(a.inicio))
})

// ===== Reporte semanal general (por fecha) & resumen por día =====
const keyOf = keyOfProducto

const malaDia = (dia) => ['manana', 'tarde'].reduce((sum, t) => {
  return sum + (dia.turnos?.[t]?.productos || []).reduce((a, p) => a + (Number(p.cantidad_mala) || 0), 0)
}, 0)

// Stock final del día = restante con la regla de la vista diaria (restanteItem):
// descuenta el consumo de presentaciones compuestas (p.ej. bolsa x5 galletas).
const stockDia = (dia) => {
  const balance = {}
  ;['manana', 'tarde'].forEach(t => {
    const stockIni = t === 'manana' ? (dia.stockManana || {}) : (dia.stockTarde || {})
    ;(dia.turnos?.[t]?.productos || []).forEach(p => {
      balance[keyOf(p)] = restanteItem(p, stockIni, keyOf)
    })
  })
  return Object.values(balance).reduce((sum, v) => sum + Math.max(0, Number(v) || 0), 0)
}

// ===== Resumen semanal por unidades (productos × unidades como columnas) =====
// Cada columna de producto contiene las unidades (presentaciones) de ese producto.
// Se usa la abreviatura de la presentación (pres.abreviatura); si no existe, el nombre.
// Altas (presentaciones compuestas) se descuentan igual que el diario:
// la venta se computa en la unidad en la que se registró (useStock / TurnoBloque).
const unitLabel = (u) => u && String(u.abreviatura || '').trim()
  ? String(u.abreviatura).trim()
  : (u ? (u.presentacion || 'Unidad') : '')

const esUnidadPres = (pres) => {
  const p = String(pres || '').trim()
  return p === 'Unidad' || p === 'S/N' || p === ''
}

const CELL_VACIO = { manana: { prod: 0, venta: 0 }, tarde: { prod: 0, venta: 0 } }

const buildSemanaCompacta = (sem) => {
  const dias = [...sem.dias].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  // 1) Columnas por producto → unidades (presentaciones) detectadas en la semana
  const prodCols = new Map()   // idproducto -> Map<unitKey, info>
  const prodNames = new Map()
  const prodProducido = new Map()

  dias.forEach(dia => {
    ;['manana', 'tarde'].forEach(t => {
      ;(dia.turnos?.[t]?.productos || []).forEach(p => {
        const pid = String(p.idproducto || '')
        const key = keyOf(p)
        if (!prodNames.has(pid)) prodNames.set(pid, p.producto || 'Sin nombre')
        prodProducido.set(pid, (prodProducido.get(pid) || 0) + (Number(p.cantidad_producida) || 0))
        if (!prodCols.has(pid)) prodCols.set(pid, new Map())
        const units = prodCols.get(pid)
        if (!units.has(key)) {
          units.set(key, {
            key,
            presentacion: p.presentacion || 'Unidad',
            abreviatura: p.abreviatura || '',
            factor: Number(p.presentacion_factor) || 1
          })
        }
      })
    })
  })

  const cols = []
  prodCols.forEach((units, pid) => {
    const arr = [...units.values()].sort((a, b) => {
      const wa = esUnidadPres(a.presentacion) ? -1 : (Number(a.factor) || 99)
      const wb = esUnidadPres(b.presentacion) ? -1 : (Number(b.factor) || 99)
      if (wa !== wb) return wa - wb
      return String(a.presentacion).localeCompare(String(b.presentacion))
    })
    cols.push({ idproducto: pid, producto: prodNames.get(pid) || 'Sin nombre', units: arr })
  })
  cols.sort((a, b) => (prodProducido.get(b.idproducto) || 0) - (prodProducido.get(a.idproducto) || 0))

  const flats = []
  cols.forEach(c => c.units.forEach(u => flats.push(u)))

  // 2) Filas por día
  // El restante se controla igual que la vista diaria (TurnoBloque/useStock):
  // usa el `restante` que entrega el backend por fila/turno (inicio + producido
  // − venta − mala − consumo de presentaciones, p.ej. bolsa x5 que absorbe
  // unidades base del producto). El saldo de unidades que no registran actividad
  // se arrastra día a día y queda al cierre de la semana.
  const redondear = (v) => Math.round((Number(v) || 0) * 100) / 100
  const restDeItem = (p, stockIni) => p && p.restante != null
    ? redondear(p.restante)
    : redondear(restanteItem(p, stockIni, keyOf))

  const filas = []
  const carryRest = {} // unitKey -> saldo al cierre del día (arrastrado entre días)
  dias.forEach(dia => {
    const cells = {} // unitKey -> { manana:{prod,venta}, tarde:{prod,venta} }
    const itemsTurno = { manana: {}, tarde: {} } // unitKey -> item (para su restante)
    const turnos = ['manana', 'tarde'].map(t => {
      const acc = { manana: { prod: 0, venta: 0 }, tarde: { prod: 0, venta: 0 } }
      ;(dia.turnos?.[t]?.productos || []).forEach(p => {
        const key = keyOf(p)
        if (!cells[key]) cells[key] = { manana: { prod: 0, venta: 0 }, tarde: { prod: 0, venta: 0 } }
        cells[key][t].prod += Number(p.cantidad_producida) || 0
        cells[key][t].venta += Number(p.cantidad_vendida_total) || 0
        itemsTurno[t][key] = p
        acc[t].prod += Number(p.cantidad_producida) || 0
        acc[t].venta += Number(p.cantidad_vendida_total) || 0
      })
      return {
        turno: t,
        label: t === 'manana' ? 'Mañana' : 'Tarde',
        prod: flats.map(u => (cells[u.key] || CELL_VACIO)[t].prod),
        venta: flats.map(u => (cells[u.key] || CELL_VACIO)[t].venta),
        totalProd: acc[t].prod,
        totalVenta: acc[t].venta
      }
    })

    // Balance del día por unidad: cierre de la tarde si aparece la unidad, si no
    // el de la mañana, y si no hay registro se arrastra el saldo del día previo.
    flats.forEach(u => {
      const tardeItem = itemsTurno.tarde[u.key]
      const mananaItem = itemsTurno.manana[u.key]
      const saldo = tardeItem ? restDeItem(tardeItem, dia.stockTarde || {})
        : (mananaItem ? restDeItem(mananaItem, dia.stockManana || {})
          : (carryRest[u.key] || 0))
      carryRest[u.key] = saldo
    })

    const dayTotals = {
      prod: flats.map(u => {
        const c = cells[u.key]
        return c ? c.manana.prod + c.tarde.prod : 0
      }),
      venta: flats.map(u => {
        const c = cells[u.key]
        return c ? c.manana.venta + c.tarde.venta : 0
      }),
      resta: flats.map(u => (carryRest[u.key] || 0))
    }
    dayTotals.totalProd = dayTotals.prod.reduce((s, v) => s + v, 0)
    dayTotals.totalVenta = dayTotals.venta.reduce((s, v) => s + v, 0)
    dayTotals.totalResta = dayTotals.resta.reduce((s, v) => s + v, 0)

    filas.push({ fecha: dia.fecha, turnos, totals: dayTotals })
  })

  // 3) Totales de la semana
  const semana = {
    prod: flats.map(() => 0),
    venta: flats.map(() => 0)
  }
  filas.forEach(f => {
    f.totals.prod.forEach((v, i) => { semana.prod[i] += v })
    f.totals.venta.forEach((v, i) => { semana.venta[i] += v })
  })
  // El sobrante de la semana = saldo final al cierre del último día del rango.
  semana.resta = flats.map(u => (carryRest[u.key] || 0))
  semana.totalProd = semana.prod.reduce((s, v) => s + v, 0)
  semana.totalVenta = semana.venta.reduce((s, v) => s + v, 0)
  semana.totalResta = semana.resta.reduce((s, v) => s + v, 0)

  return { cols, flats, filas, semana }
}

const semanasData = computed(() => {
  return semanaGroups.value.map(sem => ({ ...sem, matrizC: buildSemanaCompacta(sem) }))
})

const vistaSemanal = computed(() => props.agruparPorSemana)

const expandedDias = ref({})
const toggleDia = (fecha) => { expandedDias.value[fecha] = !expandedDias.value[fecha] }
const expandAll = () => { diasVisibles.value.forEach(d => { expandedDias.value[d.fecha] = true }) }
const collapseAll = () => { Object.keys(expandedDias.value).forEach(k => { expandedDias.value[k] = false }) }

const expandedSemanas = ref({})
const isSemanaExpanded = (key) => expandedSemanas.value[key] !== false
const toggleSemana = (key) => { expandedSemanas.value[key] = isSemanaExpanded(key) ? false : true }

watch(() => props.detalleTurnos, () => {
  diasVisiblesLimite.value = 15
  diasConStock.value.forEach(d => { if (expandedDias.value[d.fecha] === undefined) expandedDias.value[d.fecha] = false })
})

defineExpose({
  expandAllSemanas: () => { semanaGroups.value.forEach(s => { expandedSemanas.value[s.inicio] = true }) },
  collapseAllSemanas: () => { Object.keys(expandedSemanas.value).forEach(k => { expandedSemanas.value[k] = false }) },
  getSemanasConMatriz: () => semanasData.value
})
</script>
