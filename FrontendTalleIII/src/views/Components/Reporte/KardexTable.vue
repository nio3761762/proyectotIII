<template>
  <div class="space-y-6">
    <!-- Resumen Semanal -->
    <div v-if="props.agruparPorSemana" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Resumen Semanal de Movimientos</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Semana</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cant. Movimientos</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entradas</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Salidas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in kardexPorSemana" :key="item.semana" class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
              <td class="px-6 py-4 font-semibold text-gray-800">{{ item.semanaLabel }}</td>
              <td class="px-6 py-4 text-right font-bold text-gray-700">{{ item.cantMovimientos }}</td>
              <td class="px-6 py-4 text-right font-bold text-green-600">{{ item.totalEntradas }}</td>
              <td class="px-6 py-4 text-right font-bold text-red-600">{{ item.totalSalidas }}</td>
            </tr>
            <tr v-if="kardexPorSemana.length === 0">
              <td colspan="99" class="px-6 py-12 text-center text-gray-400">No hay datos en este período</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Charts -->
    <div v-if="chartLabels.length > 0 && !props.agruparPorSemana" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">{{ props.agruparPorSemana ? 'Movimientos por Semana' : 'Movimientos por Día' }}</h3>
        <div class="relative" style="height: 260px;">
          <canvas ref="kardexChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Metadatos / Resumen -->
    <div v-if="reporte && reporte.metadatos && !props.agruparPorSemana" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-6 animate-fade-in-up">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
          <History class="h-6 w-6" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-800">{{ reporte.metadatos.reporte }}</h3>
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Periodo: {{ formatFecha(reporte.metadatos.filtros.fechadesde) }} - {{ formatFecha(reporte.metadatos.filtros.fechahasta) }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div class="text-center">
          <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Movimientos</p>
          <p class="text-2xl font-black text-indigo-600">{{ reporte.metadatos.totalMovimientos }}</p>
        </div>
        <div class="w-px h-10 bg-gray-100"></div>
        <div class="text-right">
          <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Generado en</p>
          <p class="text-sm font-bold text-gray-600">{{ new Date(reporte.metadatos.generadoEn).toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- Detalle Cronológico (Acordeón) -->
    <div v-if="movimientosAgrupados.length > 0 && !props.agruparPorSemana" class="animate-fade-in-up space-y-4" style="animation-delay: 0.1s">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-indigo-100 rounded-xl">
            <List class="h-6 w-6 text-indigo-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">Detalle Cronológico de Movimientos</h3>
        </div>
        <div class="flex gap-2">
          <button @click="expandAll" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Expandir todo</button>
          <button @click="collapseAll" class="text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Contraer todo</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="grupo in movimientosAgrupados" :key="grupo.fecha" 
             class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300">

          <button @click="toggleDate(grupo.fecha)" 
                  class="w-full p-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-4">
              <div :class="['p-2 rounded-xl transition-transform duration-300', isExpanded(grupo.fecha) ? 'rotate-180 bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-200']">
                <ChevronDown class="h-5 w-5" />
              </div>
              <div class="flex flex-col items-start text-left">
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-gray-400" />
                  <span class="font-bold text-gray-700">{{ grupo.semanaLabel || formatFecha(grupo.fecha) }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ grupo.movimientos.length }} movimientos registrados</span>
              </div>
            </div>
          </button>

          <div v-show="isExpanded(grupo.fecha)" class="overflow-x-auto border-t border-gray-100">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/30">
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Hora</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Item</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Tipo Mov.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Sucursal</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Entrada</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Salida</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Saldo Final</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Costo Unit.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Costo Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <template v-for="(mov, idx) in grupo.movimientos" :key="idx">
                  <tr class="hover:bg-gray-50/30 transition-colors group">
                    <td class="p-4 text-xs font-medium text-gray-500">
                      {{ new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div :class="['p-2 rounded-lg', mov.tipo_item === 'INSUMO' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500']">
                          <Package v-if="mov.tipo_item === 'INSUMO'" class="h-4 w-4" />
                          <ShoppingBag v-else class="h-4 w-4" />
                        </div>
                        <div>
                          <p class="text-sm font-bold text-gray-700">{{ mov.item_nombre }}</p>
                          <p class="text-[9px] text-gray-400 font-mono">{{ mov.idreferencia }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4 text-center">
                      <span v-if="mov.entrada > 0" class="px-2 py-0.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">Entrada</span>
                      <span v-else-if="mov.salida > 0" class="px-2 py-0.5 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase">Salida</span>
                      <span v-else class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase">Ajuste</span>
                    </td>
                    <td class="p-4 text-center text-xs font-bold text-gray-600">
                      {{ mov.sucursal }}
                    </td>
                    <td class="p-4 text-center">
                      <p v-if="mov.entrada > 0" class="text-sm font-black text-green-600">+{{ mov.entrada }}</p>
                      <p v-else class="text-gray-300">-</p>
                    </td>
                    <td class="p-4 text-center">
                      <p v-if="mov.salida > 0" class="text-sm font-black text-red-600">-{{ mov.salida }}</p>
                      <p v-else class="text-gray-300">-</p>
                    </td>
                    <td class="p-4 text-center font-black text-gray-800">
                      {{ mov.saldo }}
                    </td>
                    <td class="p-4 text-right text-xs text-gray-500">
                      {{ parseFloat(mov.costo_unitario || 0).toFixed(4) }} Bs.
                    </td>
                    <td class="p-4 text-right text-sm font-bold text-gray-700">
                      {{ parseFloat(mov.costo_total || 0).toFixed(2) }} Bs.
                    </td>
                  </tr>
                  <!-- Detalle de Unidades -->
                  <tr v-if="mov.unidades && mov.unidades.length > 0" class="bg-gray-50/20">
                    <td colspan="9" class="px-4 py-2 border-b border-gray-50">
                      <div class="flex flex-wrap gap-4 ml-14">
                        <span v-for="u in mov.unidades" :key="u.unidad" class="text-[10px] flex items-center gap-1.5">
                          <span class="font-black text-gray-400 uppercase tracking-tighter">{{ u.unidad }}:</span>
                          <span :class="['font-bold', u.entrada > 0 ? 'text-green-600' : u.salida > 0 ? 'text-red-600' : 'text-gray-600']">
                            {{ u.entrada > 0 ? '+' + u.entrada : u.salida > 0 ? '-' + u.salida : '0' }}
                          </span>
                          <span class="text-gray-400 font-mono">{{ u.abreviatura }}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!props.agruparPorSemana && movimientosAgrupados.length === 0" class="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
      <div class="flex flex-col items-center gap-4">
        <div class="p-4 bg-gray-50 rounded-full">
          <History class="h-10 w-10 text-gray-300" />
        </div>
        <p class="text-gray-500 font-medium text-lg">No hay movimientos registrados para este periodo o item.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { History, Package, ShoppingBag, Search, ChevronDown, ChevronRight, List, Calendar } from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  reporte: {
    type: Object,
    required: true
  },
  formatFecha: {
    type: Function,
    required: true
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

const kardexPorSemana = computed(() => {
  return movimientosAgrupados.value.map(g => {
    let totalEntradas = 0, totalSalidas = 0
    g.movimientos.forEach(mov => {
      totalEntradas += Number(mov.entrada || 0)
      totalSalidas += Number(mov.salida || 0)
    })
    return {
      semana: g.fecha,
      semanaLabel: g.semanaLabel,
      cantMovimientos: g.movimientos.length,
      totalEntradas,
      totalSalidas
    }
  })
})

// Lógica de Acordeón
const expandedDates = ref([])
const toggleDate = (fecha) => {
  const index = expandedDates.value.indexOf(fecha)
  if (index > -1) expandedDates.value.splice(index, 1)
  else expandedDates.value.push(fecha)
}
const isExpanded = (fecha) => expandedDates.value.includes(fecha)
const expandAll = () => expandedDates.value = movimientosAgrupados.value.map(g => g.fecha)
const collapseAll = () => expandedDates.value = []

const movimientos = computed(() => {
  const all = []
  if (props.reporte.insumos && Array.isArray(props.reporte.insumos)) {
    all.push(...props.reporte.insumos)
  }
  if (props.reporte.productos && Array.isArray(props.reporte.productos)) {
    all.push(...props.reporte.productos)
  }
  return all.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const movimientosAgrupados = computed(() => {
  const grouped = {}
  movimientos.value.forEach(mov => {
    const fecha = mov.fecha.split('T')[0]
    const key = props.agruparPorSemana ? getWeekMonday(fecha) : fecha
    if (!grouped[key]) {
      grouped[key] = {
        fecha: key,
        semanaLabel: props.agruparPorSemana ? getWeekLabel(key) : undefined,
        movimientos: []
      }
    }
    grouped[key].movimientos.push(mov)
  })
  return Object.values(grouped).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Charts
const kardexChartRef = ref(null)
let kardexChartInstance = null

const chartLabels = computed(() => movimientosAgrupados.value.map(g => g.semanaLabel || g.fecha))
const chartCantMov = computed(() => movimientosAgrupados.value.map(g => g.movimientos.length))

const renderCharts = () => {
  if (!kardexChartRef.value) return
  if (kardexChartInstance) { kardexChartInstance.destroy(); kardexChartInstance = null }

  if (chartLabels.value.length > 0) {
    kardexChartInstance = new Chart(kardexChartRef.value, {
      type: 'line',
      data: {
        labels: chartLabels.value.map(l => props.formatFecha(l)),
        datasets: [{
          label: 'Movimientos',
          data: chartCantMov.value,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true, tension: 0.3, pointRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    })
  }
}

watch(movimientosAgrupados, () => setTimeout(renderCharts, 100), { deep: true })
onMounted(() => setTimeout(renderCharts, 200))
onBeforeUnmount(() => {
  if (kardexChartInstance) kardexChartInstance.destroy()
})
</script>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
</style>
