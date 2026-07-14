<template>
  <div class="space-y-8">
    <!-- Total card -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-orange-50 to-white p-6 rounded-3xl border border-orange-100 shadow-sm">
        <p class="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Total Gastos</p>
        <p class="text-2xl font-black text-orange-700">{{ formatCurrency(totalGastos) }} <span class="text-xs">Bs.</span></p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
        <p class="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Cantidad de Gastos</p>
        <p class="text-2xl font-black text-blue-700">{{ cantidad }}</p>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-white p-6 rounded-3xl border border-purple-100 shadow-sm">
        <p class="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">Promedio por Gasto</p>
        <p class="text-2xl font-black text-purple-700">{{ formatCurrency(cantidad > 0 ? totalGastos / cantidad : 0) }} <span class="text-xs">Bs.</span></p>
      </div>
    </div>

    <!-- Chart -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4">{{ props.agruparPorSemana ? 'Gastos por Semana' : 'Gastos por Día' }}</h3>
      <div class="relative" style="height: 300px;">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>

    <!-- Weekly consolidated table -->
    <div v-if="props.agruparPorSemana" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Resumen Semanal de Gastos Generales</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Semana</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cant. Gastos</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Promedio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sem in gastosPorSemana" :key="sem.semana"
              class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
              <td class="px-6 py-4 font-semibold text-gray-800">{{ sem.semanaLabel }}</td>
              <td class="px-6 py-4 text-right text-gray-600">{{ sem.cantidad }}</td>
              <td class="px-6 py-4 text-right font-bold text-gray-800">{{ formatCurrency(sem.total) }}</td>
              <td class="px-6 py-4 text-right text-gray-600">{{ formatCurrency(sem.promedio) }}</td>
            </tr>
            <tr v-if="gastosPorSemana.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-400">No hay gastos generales en este período</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail table (hide when weekly view is active) -->
    <div v-if="!props.agruparPorSemana" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Costo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gasto in gastos" :key="gasto.idgastogeneral"
              class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
              <td class="px-6 py-4 font-semibold text-gray-800">{{ gasto.nombre }}</td>
              <td class="px-6 py-4 text-gray-600">{{ formatFecha(gasto.fecha ? gasto.fecha.split('T')[0] : '') }}</td>
              <td class="px-6 py-4 text-right font-bold text-gray-800">{{ formatCurrency(gasto.costo) }}</td>
            </tr>
            <tr v-if="gastos.length === 0">
              <td colspan="3" class="px-6 py-12 text-center text-gray-400">No hay gastos generales en este período</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  reporte: { type: Object, required: true },
  formatFecha: { type: Function, required: true },
  agruparPorSemana: { type: Boolean, default: false }
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

const chartRef = ref(null)
let chartInstance = null

const totalGastos = computed(() => Number(props.reporte?.totalGastos || 0))
const cantidad = computed(() => Number(props.reporte?.cantidad || 0))
const gastos = computed(() => props.reporte?.gastos || [])

const gastosPorDia = computed(() => {
  const map = {}
  gastos.value.forEach(g => {
    const rawFecha = g.fecha ? g.fecha.split('T')[0] : 'Sin fecha'
    const key = props.agruparPorSemana ? getWeekMonday(rawFecha) : rawFecha
    map[key] = (map[key] || 0) + Number(g.costo || 0)
  })
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([fecha, total]) => ({
      fecha,
      semanaLabel: props.agruparPorSemana ? getWeekLabel(fecha) : undefined,
      total
    }))
})

const gastosPorSemana = computed(() => {
  const map = {}
  gastos.value.forEach(g => {
    const rawFecha = g.fecha ? g.fecha.split('T')[0] : 'Sin fecha'
    const weekKey = getWeekMonday(rawFecha)
    const label = getWeekLabel(weekKey)
    if (!map[weekKey]) {
      map[weekKey] = { semana: weekKey, semanaLabel: label, cantidad: 0, total: 0 }
    }
    map[weekKey].cantidad++
    map[weekKey].total += Number(g.costo || 0)
  })
  return Object.values(map)
    .sort((a, b) => b.semana.localeCompare(a.semana))
    .map(s => ({ ...s, promedio: s.cantidad > 0 ? s.total / s.cantidad : 0 }))
})

const formatCurrency = (val) => {
  return Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const renderChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.destroy()

  const labels = gastosPorDia.value.map(d => d.semanaLabel || props.formatFecha(d.fecha))
  const data = gastosPorDia.value.map(d => d.total)

  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Gastos (Bs.)',
        data,
        backgroundColor: 'rgba(234, 88, 12, 0.7)',
        borderColor: 'rgba(234, 88, 12, 1)',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (v) => v + ' Bs.' }
        }
      }
    }
  })
}

watch(() => props.reporte, renderChart, { deep: true })

onMounted(() => {
  setTimeout(renderChart, 100)
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>
