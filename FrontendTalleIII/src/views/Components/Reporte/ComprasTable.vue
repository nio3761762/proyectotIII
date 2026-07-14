<template>
  <div class="space-y-10">
    <!-- === RESUMEN SEMANAL (Acordeón) === -->
    <div v-if="props.agruparPorSemana" class="space-y-4">
      <div v-if="weeklyChartLabels.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Evolución por Semana</h3>
        <div class="relative" style="height: 220px;">
          <canvas ref="generalWeekChartRef"></canvas>
        </div>
      </div>
      <div v-for="sem in comprasSemanalDetalle" :key="sem.semana" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(sem.semana)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.semana] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
            <span class="text-xs text-gray-400">|</span>
            <span class="text-sm text-gray-500">{{ sem.cantCompras }} compras</span>
          </div>
          <div class="text-right">
            <p class="text-[9px] text-gray-400 uppercase font-black">Total Invertido</p>
            <p class="text-sm font-black text-indigo-600">{{ formatCurrency(sem.totalInvertido) }}</p>
          </div>
        </div>
        <div v-if="expandedSemanas[sem.semana]" class="p-6 overflow-x-auto">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-emerald-100 rounded-xl">
              <BarChart3 class="h-5 w-5 text-emerald-600" />
            </div>
            <h4 class="text-lg font-bold text-gray-800">Resumen de Compras por Proveedor</h4>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white shadow-sm" style="min-width: 600px;">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/30">
                  <th rowspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r min-w-[180px]">Proveedor</th>
                  <th v-for="ins in weeklyConsolidados[sem.semana]?.insumosUnicos || []" :key="ins"
                      colspan="1" class="p-3 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-r text-center min-w-[100px]">
                    <div class="flex flex-col items-center">
                      <span class="text-gray-600">{{ ins }}</span>
                      <span class="text-[8px] text-gray-400 font-normal normal-case mt-0.5">(cant.)</span>
                    </div>
                  </th>
                  <th colspan="1" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[140px]">Total Invertido</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prov in weeklyConsolidados[sem.semana]?.proveedores || []" :key="prov.proveedor"
                    class="hover:bg-orange-50/30 transition-colors">
                  <td class="p-3 border-b border-r font-bold text-gray-800 text-sm">
                    <div class="flex items-center gap-1.5">
                      <Truck class="h-4 w-4 text-orange-500 shrink-0" />
                      <span class="truncate">{{ prov.proveedor }}</span>
                    </div>
                  </td>
                  <td v-for="ins in weeklyConsolidados[sem.semana]?.insumosUnicos || []" :key="ins"
                      class="p-3 border-b border-r text-center text-sm font-bold text-gray-800">
                    {{ prov.insumoMap[ins] ?? '-' }}
                  </td>
                  <td class="p-3 border-b text-right">
                    <span class="font-black text-blue-600">{{ Number(prov.total_proveedor).toFixed(2) }}</span>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="(weeklyConsolidados[sem.semana]?.proveedores?.length || 0) > 1">
                <tr class="bg-orange-50/50">
                  <td class="p-3 border-t-2 border-orange-200 font-black text-gray-600 text-xs uppercase">Totales</td>
                  <td v-for="ins in weeklyConsolidados[sem.semana]?.insumosUnicos || []" :key="ins"
                      class="p-3 border-t-2 border-orange-200 text-center font-black">
                    {{ weeklyConsolidados[sem.semana]?.totalPorInsumo[ins] ?? '-' }}
                  </td>
                  <td class="p-3 border-t-2 border-orange-200 text-right">
                    <span class="font-black text-blue-600">{{ weeklyConsolidados[sem.semana]?.totalGastoGlobal.toFixed(2) }}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div v-if="expandedSemanas[sem.semana]" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h5 class="text-sm font-bold text-gray-700 mb-3">Distribución de la Semana</h5>
            <div class="relative" style="height: 180px;">
              <canvas :id="'wchart-' + sem.semana.replace(/[^a-zA-Z0-9]/g, '-')"></canvas>
            </div>
          </div>

          <!-- Detallado por Día -->
          <div v-if="getWeeklyDays(sem.semana).length > 0" class="mt-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-indigo-100 rounded-xl">
                <History class="h-5 w-5 text-indigo-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Detallado por Día</h4>
            </div>
            <div class="space-y-4">
              <div v-for="day in getWeeklyDays(sem.semana)" :key="day.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100 flex items-center gap-3">
                  <Calendar class="h-4 w-4 text-indigo-500" />
                  <span class="font-bold text-gray-700 text-sm">{{ formatFecha(day.fecha) }}</span>
                  <span class="text-xs text-gray-500">({{ day.compras.length }} compras)</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/30">
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Proveedor</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Insumo</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Unidad</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cantidad</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">P. Unitario</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="compra in day.compras" :key="compra.idcompra">
                        <tr v-for="(det, detIdx) in compra.detalles" :key="compra.idcompra + '-' + detIdx" class="hover:bg-gray-50/50 transition-colors group">
                          <td v-if="detIdx === 0" :rowspan="compra.detalles.length" class="p-3 border-b border-gray-100 text-sm align-top font-bold text-gray-700 bg-gray-50/10">
                            <div class="flex items-center gap-1.5">
                              <Truck class="h-3.5 w-3.5 text-orange-500" />
                              <span>{{ compra.proveedor }}</span>
                            </div>
                          </td>
                          <td class="p-3 border-b border-gray-100 text-sm font-medium text-gray-800">{{ det.insumo }}</td>
                          <td class="p-3 border-b border-gray-100 text-xs text-gray-500 text-center">{{ det.medida }}</td>
                          <td class="p-3 border-b border-gray-100 text-sm font-bold text-gray-700 text-center">{{ det.cantidad }}</td>
                          <td class="p-3 border-b border-gray-100 text-sm text-gray-600 text-right">{{ parseFloat(det.precio_unitario).toFixed(2) }} Bs.</td>
                          <td class="p-3 border-b border-gray-100 text-sm font-black text-indigo-600 text-right">{{ parseFloat(det.precio_total).toFixed(2) }} Bs.</td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="comprasSemanalDetalle.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- === CONSOLIDADO (Resumen) === -->
    <div v-if="consolidado && consolidado.detalle && consolidado.detalle.length && !props.agruparPorSemana" class="animate-fade-in-up space-y-10">
      <!-- Charts -->
      <div v-if="chartProveedores.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Inversión por Proveedor</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="proveedorChartRef"></canvas>
          </div>
        </div>
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Distribución de Insumos</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="insumoChartRef"></canvas>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-emerald-100 rounded-xl">
          <BarChart3 class="h-6 w-6 text-emerald-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-800">Resumen de Compras por Proveedor</h3>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/30">
              <th rowspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r min-w-[180px]">Proveedor</th>
              <th v-for="ins in processedConsolidado.insumosUnicos" :key="ins"
                  colspan="1" class="p-3 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-r text-center min-w-[100px]">
                <div class="flex flex-col items-center">
                  <span class="text-gray-600">{{ ins }}</span>
                  <span class="text-[8px] text-gray-400 font-normal normal-case mt-0.5">(cant.)</span>
                </div>
              </th>
              <th colspan="1" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[140px]">Total Invertido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prov in processedConsolidado.proveedores" :key="prov.proveedor"
                class="hover:bg-orange-50/30 transition-colors">
              <td class="p-3 border-b border-r font-bold text-gray-800 text-sm">
                <div class="flex items-center gap-1.5">
                  <Truck class="h-4 w-4 text-orange-500 shrink-0" />
                  <span class="truncate">{{ prov.proveedor }}</span>
                </div>
              </td>
              <td v-for="ins in processedConsolidado.insumosUnicos" :key="ins"
                  class="p-3 border-b border-r text-center text-sm font-bold text-gray-800">
                {{ prov.insumoMap[ins] ?? '-' }}
              </td>
              <td class="p-3 border-b text-right">
                <span class="font-black text-blue-600">{{ Number(prov.total_proveedor).toFixed(2) }}</span>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="processedConsolidado.proveedores.length > 1">
            <tr class="bg-orange-50/50">
              <td class="p-3 border-t-2 border-orange-200 font-black text-gray-600 text-xs uppercase">Totales</td>
              <td v-for="ins in processedConsolidado.insumosUnicos" :key="ins"
                  class="p-3 border-t-2 border-orange-200 text-center font-black">
                {{ processedConsolidado.totalPorInsumo[ins] ?? '-' }}
              </td>
              <td class="p-3 border-t-2 border-orange-200 text-right">
                <span class="font-black text-blue-600">{{ processedConsolidado.totalGastoGlobal.toFixed(2) }}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-if="consolidado.total_gastos"
           class="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl">
        <p class="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Total Gastos</p>
        <p class="text-xl font-black">{{ Number(consolidado.total_gastos).toFixed(2) }} Bs.</p>
      </div>
    </div>

    <!-- Tabla Detallada (Histórico de Precios) -->
    <div v-if="!props.agruparPorSemana" class="animate-fade-in-up" style="animation-delay: 0.1s">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-indigo-100 rounded-xl">
            <History class="h-6 w-6 text-indigo-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">Historial Detallado de Compras</h3>
        </div>
        <div class="flex gap-2">
          <button @click="expandAll" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Expandir todo</button>
          <button @click="collapseAll" class="text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Contraer todo</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="compra in processedCompras" :key="compra.idcompra" 
             class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300">

          <button @click="toggleCompra(compra.idcompra)" 
                  class="w-full p-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-4">
              <div :class="['p-2 rounded-xl transition-transform duration-300', isExpanded(compra.idcompra) ? 'rotate-180 bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-200']">
                <ChevronDown class="h-5 w-5" />
              </div>
              <div class="flex flex-col items-start text-left">
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-gray-400" />
                  <span class="font-bold text-gray-700">{{ formatFecha(compra.fecha.split('T')[0]) }}</span>
                  <span class="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span class="text-sm text-gray-500 font-medium">{{ compra.proveedor }}</span>
                </div>
                <span class="text-xs text-gray-400 font-mono">{{ compra.idcompra }}</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400 uppercase font-black tracking-widest">Monto Compra</p>
              <p class="text-lg font-black text-indigo-600">{{ parseFloat(compra.total_compra).toFixed(2) }} <span class="text-xs">Bs.</span></p>
            </div>
          </button>

          <div v-show="isExpanded(compra.idcompra)" class="overflow-x-auto border-t border-gray-100">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/30">
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Insumo</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Unidad</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cantidad</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">P. Unitario</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="det in compra.detalles" :key="det.insumo" class="hover:bg-gray-50/50 transition-colors">
                  <td class="p-4 border-b border-gray-100 text-sm">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 rounded-lg bg-gray-50 p-1 border border-gray-100">
                        <img v-if="det.imagen" :src="det.imagen" class="h-full w-full object-cover rounded-md">
                        <Package v-else class="h-full w-full text-gray-200" />
                      </div>
                      <span class="font-bold text-gray-700">{{ det.insumo }}</span>
                    </div>
                  </td>
                  <td class="p-4 border-b border-gray-100 text-sm text-gray-600 text-center">
                    {{ det.medida }}
                    <span v-if="det.abreviatura" class="block text-[10px] text-gray-400 uppercase tracking-tighter">{{ det.abreviatura }}</span>
                  </td>
                  <td class="p-4 border-b border-gray-100 text-sm font-bold text-gray-700 text-center">
                    {{ det.cantidad }}
                  </td>
                  <td class="p-4 border-b border-gray-100 text-sm text-gray-600 text-right">
                    {{ parseFloat(det.precio_unitario).toFixed(2) }} Bs.
                  </td>
                  <td class="p-4 border-b border-gray-100 text-sm font-black text-indigo-600 text-right">
                    {{ parseFloat(det.precio_total).toFixed(2) }} Bs.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="processedCompras.length === 0" class="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
          <div class="flex flex-col items-center gap-3">
            <div class="p-4 bg-gray-50 rounded-full">
              <Search class="h-8 w-8 text-gray-300" />
            </div>
            <p class="text-gray-500 font-medium">No se encontraron registros de compras.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { 
  Package, Truck, History, Calendar, Search, BarChart3,
  ChevronDown, ChevronRight 
} from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  compras: {
    type: Array,
    required: true
  },
  formatFecha: {
    type: Function,
    required: true
  },
  consolidado: {
    type: Object,
    default: () => ({})
  },
  agruparPorSemana: {
    type: Boolean,
    default: false
  }
})

const getWeekMonday = (dateStr) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'Sin fecha') return dateStr
  const clean = dateStr.split('T')[0]
  const d = new Date(clean + 'T12:00:00')
  if (isNaN(d.getTime())) return clean
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const getWeekLabel = (mondayStr) => {
  if (!mondayStr || mondayStr === 'N/A' || mondayStr === 'Sin fecha') return mondayStr
  const d = new Date(mondayStr + 'T12:00:00')
  if (isNaN(d.getTime())) return mondayStr
  const end = new Date(d)
  end.setDate(d.getDate() + 6)
  const fmt = (date) => {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }
  return `${fmt(d)} - ${fmt(end)}`
}

const formatCurrency = (val) => Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const comprasPorSemana = computed(() => {
  const weeks = {}
  props.compras.forEach(compra => {
    const fecha = compra.fecha ? compra.fecha.split('T')[0] : 'N/A'
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantCompras: 0, totalInvertido: 0 }
    }
    weeks[monday].cantCompras++
    weeks[monday].totalInvertido += parseFloat(compra.total_compra || 0)
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana))
})

const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

const comprasSemanalDetalle = computed(() => {
  const weeks = {}
  props.compras.forEach(compra => {
    const fecha = compra.fecha ? compra.fecha.split('T')[0] : 'N/A'
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantCompras: 0, totalInvertido: 0, detalle: [] }
    }
    const w = weeks[monday]
    w.cantCompras++
    w.totalInvertido += parseFloat(compra.total_compra || 0)
    const provKey = compra.proveedor
    let provItem = w.detalle.find(d => d.proveedor === provKey)
    if (provItem) {
      provItem.cantCompras++
      provItem.totalInvertido += parseFloat(compra.total_compra || 0)
    } else {
      w.detalle.push({ proveedor: provKey, cantCompras: 1, totalInvertido: parseFloat(compra.total_compra || 0) })
    }
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana))
})

const weeklyConsolidados = computed(() => {
  const result = {}
  const weeks = {}
  const compras = [...(props.compras || [])]
  compras.forEach(c => {
    const fecha = c.fecha ? c.fecha.split('T')[0] : null
    if (!fecha) return
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) weeks[monday] = { compras: [] }
    weeks[monday].compras.push(c)
  })
  Object.entries(weeks).forEach(([monday, w]) => {
    const provMap = {}
    const insSet = {}
    w.compras.forEach(c => {
      const prov = c.proveedor || 'Sin proveedor'
      if (!provMap[prov]) provMap[prov] = { proveedor: prov, total_proveedor: 0, insumoMap: {} }
      const p = provMap[prov]
      const total = Number(c.total_compra || 0)
      p.total_proveedor += total
      ;(c.detalles || []).forEach(d => {
        const insName = d.insumo || d.nombre || ''
        const cant = Number(d.cantidad || 0)
        insSet[insName] = true
        p.insumoMap[insName] = (p.insumoMap[insName] || 0) + cant
      })
    })
    const insumosUnicos = Object.keys(insSet)
    const proveedores = Object.values(provMap)
    const totalPorInsumo = {}
    insumosUnicos.forEach(ins => {
      totalPorInsumo[ins] = proveedores.reduce((sum, p) => sum + (p.insumoMap[ins] || 0), 0)
    })
    result[monday] = { proveedores, insumosUnicos, totalPorInsumo, totalGastoGlobal: proveedores.reduce((s, p) => s + p.total_proveedor, 0) }
  })
  return result
})

const processedConsolidado = computed(() => {
  const data = props.consolidado?.detalle || [];
  if (!Array.isArray(data)) return { proveedores: [], insumosUnicos: [], totalPorInsumo: {}, totalGastoGlobal: 0 };

  const insumosUnicos = [];
  const insumoSet = new Set();
  data.forEach(prov => {
    if (prov.insumos) {
      prov.insumos.forEach(i => {
        if (!insumoSet.has(i.insumo)) {
          insumoSet.add(i.insumo);
          insumosUnicos.push(i.insumo);
        }
      });
    }
  });

  const proveedores = data.map(prov => {
    const insumoMap = {};
    (prov.insumos || []).forEach(i => {
      insumoMap[i.insumo] = Number(i.cantidad || 0);
    });
    return {
      proveedor: prov.proveedor,
      total_proveedor: Number(prov.total_proveedor || 0),
      insumoMap
    };
  });

  const totalPorInsumo = {};
  insumosUnicos.forEach(ins => {
    totalPorInsumo[ins] = proveedores.reduce((sum, prov) => sum + (prov.insumoMap[ins] || 0), 0);
  });

  const totalGastoGlobal = proveedores.reduce((sum, prov) => sum + prov.total_proveedor, 0);

  return { proveedores, insumosUnicos, totalPorInsumo, totalGastoGlobal };
});

const weeklyDetallado = computed(() => {
  if (!props.agruparPorSemana) return []
  const weeks = {}
  const compras = [...(props.compras || [])]
  compras.forEach(c => {
    const fecha = c.fecha ? c.fecha.split('T')[0] : 'N/A'
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) weeks[monday] = { fecha: monday, days: [] }
    const existing = weeks[monday].days.find(d => d.fecha === fecha)
    if (existing) {
      existing.compras.push(c)
    } else {
      weeks[monday].days.push({ fecha, compras: [c] })
    }
  })
  return Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const getWeeklyDays = (fecha) => weeklyDetallado.value.find(w => w.fecha === fecha)?.days || []

const processedCompras = computed(() => {
  return [...props.compras].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Lógica de Acordeón
const expandedCompras = ref([])
const toggleCompra = (id) => {
  const index = expandedCompras.value.indexOf(id)
  if (index > -1) expandedCompras.value.splice(index, 1)
  else expandedCompras.value.push(id)
}
const isExpanded = (id) => expandedCompras.value.includes(id)
const expandAll = () => expandedCompras.value = props.compras.map(c => c.idcompra)
const collapseAll = () => expandedCompras.value = []

// Charts
const proveedorChartRef = ref(null)
const insumoChartRef = ref(null)
const generalWeekChartRef = ref(null)
let proveedorChartInstance = null
let insumoChartInstance = null
let generalWeekChartInstance = null

const chartProveedores = computed(() => processedConsolidado.value.proveedores.map(p => p.proveedor))
const chartProveedorMontos = computed(() => processedConsolidado.value.proveedores.map(p => p.total_proveedor))

const insumosLabels = computed(() => processedConsolidado.value.insumosUnicos)
const insumosCantidades = computed(() => processedConsolidado.value.insumosUnicos.map(ins =>
  processedConsolidado.value.totalPorInsumo[ins] || 0
))

const weeklyChartLabels = computed(() => comprasPorSemana.value.map(w => w.semanaLabel))
const weeklyChartValues = computed(() => comprasPorSemana.value.map(w => w.totalInvertido))

const weeklyChartInstances = ref({})

watch(expandedSemanas, (val) => {
  Object.entries(val).forEach(([key, expanded]) => {
    if (expanded) {
      nextTick(() => {
        const id = 'wchart-' + key.replace(/[^a-zA-Z0-9]/g, '-')
        const el = document.getElementById(id)
        if (el && !weeklyChartInstances.value[key]) {
          const data = getWeekChartData(key)
          if (data) {
            weeklyChartInstances.value[key] = new Chart(el.getContext('2d'), {
              type: 'doughnut',
              data: { labels: data.labels, datasets: [{ data: data.values, backgroundColor: data.colors }] },
              options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 9 } } } } }
            })
          }
        }
      })
    } else {
      if (weeklyChartInstances.value[key]) {
        weeklyChartInstances.value[key].destroy()
        delete weeklyChartInstances.value[key]
      }
    }
  })
}, { deep: true })

const weeklyColors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1','#84CC16']

const getWeekChartData = (weekKey) => {
  const sem = weeklyConsolidados.value[weekKey]
  if (!sem || !sem.proveedores) return null
  return {
    labels: sem.proveedores.map(p => p.proveedor),
    values: sem.proveedores.map(p => p.total_proveedor),
    colors: weeklyColors.slice(0, sem.proveedores.length)
  }
}

const renderCharts = () => {
  if (proveedorChartInstance) { proveedorChartInstance.destroy(); proveedorChartInstance = null }
  if (insumoChartInstance) { insumoChartInstance.destroy(); insumoChartInstance = null }

  if (chartProveedores.value.length > 0 && proveedorChartRef.value) {
    proveedorChartInstance = new Chart(proveedorChartRef.value, {
      type: 'bar',
      data: {
        labels: chartProveedores.value,
        datasets: [{
          label: 'Inversión (Bs.)',
          data: chartProveedorMontos.value,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' Bs.' } } }
      }
    })
  }

  if (insumosLabels.value.length > 0 && insumoChartRef.value) {
    const colors = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444', '#eab308', '#ec4899', '#6366f1']
    insumoChartInstance = new Chart(insumoChartRef.value, {
      type: 'doughnut',
      data: {
        labels: insumosLabels.value,
        datasets: [{
          data: insumosCantidades.value,
          backgroundColor: colors.slice(0, insumosLabels.value.length),
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } }
      }
    })
  }

  if (generalWeekChartRef.value && weeklyChartLabels.value.length > 0) {
    if (generalWeekChartInstance) { generalWeekChartInstance.destroy(); generalWeekChartInstance = null }
    generalWeekChartInstance = new Chart(generalWeekChartRef.value, {
      type: 'bar',
      data: {
        labels: weeklyChartLabels.value,
        datasets: [{
          label: 'Total Invertido (Bs.)',
          data: weeklyChartValues.value,
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' Bs.' } } }
      }
    })
  }
}

watch(processedConsolidado, () => setTimeout(renderCharts, 100), { deep: true })
watch(comprasPorSemana, () => setTimeout(renderCharts, 100), { deep: true })
onMounted(() => setTimeout(renderCharts, 200))
onBeforeUnmount(() => {
  if (proveedorChartInstance) proveedorChartInstance.destroy()
  if (insumoChartInstance) insumoChartInstance.destroy()
  if (generalWeekChartInstance) generalWeekChartInstance.destroy()
  Object.values(weeklyChartInstances.value).forEach(i => i.destroy())
})

defineExpose({
  expandAllSemanas: () => {
    comprasSemanalDetalle.value.forEach(sem => { expandedSemanas.value[sem.semana] = true })
  },
  collapseAllSemanas: () => {
    Object.keys(expandedSemanas.value).forEach(k => { expandedSemanas.value[k] = false })
  }
})
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
</style>
