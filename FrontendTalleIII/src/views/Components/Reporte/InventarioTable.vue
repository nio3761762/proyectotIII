<template>
  <div class="space-y-10">
    <!-- Charts -->
    <div v-if="chartSucursalLabels.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Items por Sucursal</h3>
        <div class="relative" style="height: 260px;">
          <canvas ref="sucursalChartRef"></canvas>
        </div>
      </div>
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Distribución Estado del Stock</h3>
        <div class="relative" style="height: 260px;">
          <canvas ref="stockChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Totales Globales -->
    <div v-if="consolidado && (consolidado.totalesGlobales || consolidado.resumen)" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-2 bg-blue-100 rounded-xl text-blue-600">
            <Package class="h-6 w-6" />
          </div>
          <span class="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Items</span>
        </div>
        <div class="text-3xl font-black text-gray-800">{{ (consolidado.totalesGlobales || consolidado.resumen).totalItems }}</div>
      </div>
      
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-2 bg-red-100 rounded-xl text-red-600">
            <AlertCircle class="h-6 w-6" />
          </div>
          <span class="text-sm font-bold text-gray-500 uppercase tracking-wider">Agotados</span>
        </div>
        <div class="text-3xl font-black text-red-600">{{ (consolidado.totalesGlobales || consolidado.resumen).itemsAgotados }}</div>
      </div>

      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-2 bg-amber-100 rounded-xl text-amber-600">
            <TrendingDown class="h-6 w-6" />
          </div>
          <span class="text-sm font-bold text-gray-500 uppercase tracking-wider">Stock Bajo</span>
        </div>
        <div class="text-3xl font-black text-amber-600">{{ (consolidado.totalesGlobales || consolidado.resumen).itemsStockBajo }}</div>
      </div>
    </div>

    <!-- Inventario por Sucursal -->
    <div v-if="processedSucursales && processedSucursales.length > 0" class="space-y-8 animate-fade-in-up" style="animation-delay: 0.1s">
      <div v-for="sucursal in processedSucursales" :key="sucursal.nombre" class="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div class="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Store class="h-6 w-6 text-gray-400" />
            <h3 class="text-xl font-bold text-gray-800">{{ sucursal.nombre }}</h3>
          </div>
          <span class="px-4 py-1.5 bg-white rounded-xl text-xs font-black text-gray-500 border border-gray-100 uppercase tracking-widest">
            {{ sucursal.items?.length || 0 }} Items
          </span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/30">
                <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Item</th>
                <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Tipo</th>
                <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Stock Actual</th>
                <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Costo Unit.</th>
                <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in sucursal.items" :key="item.id" class="hover:bg-gray-50/30 transition-colors">
                <td class="p-4 text-sm">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                      <Package v-if="item.tipo === 'INSUMO'" class="h-6 w-6 text-amber-400" />
                      <ShoppingBag v-else class="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p class="font-bold text-gray-700">{{ item.nombre }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <span :class="['px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter', item.tipo === 'INSUMO' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600']">
                    {{ item.tipo }}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <div class="flex flex-col items-center gap-1.5">
                    <template v-for="(u, uIdx) in item.unidades" :key="uIdx">
                      <div v-if="item.tipo !== 'PRODUCTO' || (u.nombre.toUpperCase().includes('UNIDAD') || u.abreviatura.toUpperCase() === 'U')" class="flex items-center gap-2">
                        <!-- Prefijo 'o' para medidas de insumos después de la primera -->
                        <span v-if="item.tipo === 'INSUMO' && uIdx > 0" class="text-[10px] text-gray-400 font-bold lowercase">o</span>
                        
                        <span class="text-sm font-black text-gray-700">
                          {{ item.tipo === 'PRODUCTO' ? Math.round(u.cantidad_total) : parseFloat(u.cantidad_total).toFixed(2) }}
                        </span>
                        
                        <span class="text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded uppercase border border-indigo-100">
                          {{ u.abreviatura }}
                        </span>
                      </div>
                    </template>
                  </div>
                </td>
                <td class="p-4 text-right text-gray-600 text-sm">
                  {{ parseFloat(item.costo_unitario || 0).toFixed(4) }} Bs.
                </td>
                <td class="p-4 text-center">
                  <span v-if="item.estado_backend === 'AGOTADO' || item.estado_backend === 'CRÍTICO'" class="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {{ item.estado_backend }}
                  </span>
                  <span v-else-if="item.estado_backend === 'BAJO' || item.estado_backend === 'ADVERTENCIA'" class="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Bajo
                  </span>
                  <span v-else class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Óptimo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!processedSucursales || processedSucursales.length === 0" class="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
      <div class="flex flex-col items-center gap-4">
        <div class="p-4 bg-gray-50 rounded-full">
          <Search class="h-10 w-10 text-gray-300" />
        </div>
        <p class="text-gray-500 font-medium text-lg">No se encontraron datos de inventario con los filtros seleccionados.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Package, ShoppingBag, Store, DollarSign, AlertCircle, TrendingDown, Search } from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  consolidado: {
    type: Object,
    default: () => ({})
  },
  agruparPorSemana: {
    type: Boolean,
    default: false
  }
})

const processedSucursales = computed(() => {
  if (!props.consolidado || !props.consolidado.sucursales) return []

  return props.consolidado.sucursales.map(suc => {
    const items = []
    
    if (suc.insumos) {
      suc.insumos.forEach(ins => {
        items.push({
          id: `ins-${ins.nombre}-${suc.sucursal}`,
          nombre: ins.nombre,
          tipo: ins.tipo_item,
          unidades: ins.unidades || [],
          costo_unitario: ins.costo_promedio,
          valor_inventario: ins.valor_total,
          estado_backend: ins.estado
        })
      })
    }

    if (suc.productos) {
      suc.productos.forEach(prod => {
        items.push({
          id: `prod-${prod.nombre}-${suc.sucursal}`,
          nombre: prod.nombre,
          tipo: prod.tipo_item,
          unidades: prod.unidades || [],
          costo_unitario: prod.costo_promedio,
          valor_inventario: prod.valor_total,
          estado_backend: prod.estado
        })
      })
    }

    return {
      nombre: suc.sucursal,
      items: items
    }
  })
})

// Charts
const sucursalChartRef = ref(null)
const stockChartRef = ref(null)
let sucursalChartInstance = null
let stockChartInstance = null

const chartSucursalLabels = computed(() => processedSucursales.value.map(s => s.nombre))
const chartSucursalItems = computed(() => processedSucursales.value.map(s => s.items?.length || 0))

const totalItemsRef = computed(() => props.consolidado?.totalesGlobales || props.consolidado?.resumen || {})
const chartStockLabels = ['Normal', 'Stock Bajo', 'Agotado']
const chartStockValues = computed(() => [
  (totalItemsRef.value.totalItems || 0) - (totalItemsRef.value.itemsStockBajo || 0) - (totalItemsRef.value.itemsAgotados || 0),
  totalItemsRef.value.itemsStockBajo || 0,
  totalItemsRef.value.itemsAgotados || 0
])

const renderCharts = () => {
  if (!sucursalChartRef.value || !stockChartRef.value) return
  if (sucursalChartInstance) { sucursalChartInstance.destroy(); sucursalChartInstance = null }
  if (stockChartInstance) { stockChartInstance.destroy(); stockChartInstance = null }

  if (chartSucursalLabels.value.length > 0) {
    sucursalChartInstance = new Chart(sucursalChartRef.value, {
      type: 'bar',
      data: {
        labels: chartSucursalLabels.value,
        datasets: [{
          label: 'Items',
          data: chartSucursalItems.value,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    })
  }

  stockChartInstance = new Chart(stockChartRef.value, {
    type: 'doughnut',
    data: {
      labels: chartStockLabels,
      datasets: [{
        data: chartStockValues.value,
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } }
    }
  })
}

watch(processedSucursales, () => setTimeout(renderCharts, 100), { deep: true })
onMounted(() => setTimeout(renderCharts, 200))
onBeforeUnmount(() => {
  if (sucursalChartInstance) sucursalChartInstance.destroy()
  if (stockChartInstance) stockChartInstance.destroy()
})
</script>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
</style>
