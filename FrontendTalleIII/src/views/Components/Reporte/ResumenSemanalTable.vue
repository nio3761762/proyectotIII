<template>
  <div class="space-y-6 animate-fade-in-up">
    <div v-if="loading" class="text-center py-12 text-gray-500">Cargando...</div>
    <div v-else-if="!data || !data.result || data.result.length === 0" class="text-center py-12 text-gray-500">
      No hay datos para el rango seleccionado.
    </div>
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-green-50 to-white p-5 rounded-3xl border border-green-100 shadow-sm">
          <p class="text-xs font-black text-green-600 uppercase tracking-widest mb-1">Total Ingresos</p>
          <p class="text-2xl font-black text-green-700">{{ totalIngresos.toFixed(2) }} <span class="text-xs">Bs.</span></p>
        </div>
        <div class="bg-gradient-to-br from-red-50 to-white p-5 rounded-3xl border border-red-100 shadow-sm">
          <p class="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Total Egresos</p>
          <p class="text-2xl font-black text-red-700">{{ totalEgresos.toFixed(2) }} <span class="text-xs">Bs.</span></p>
        </div>
        <div class="bg-gradient-to-br from-orange-50 to-white p-5 rounded-3xl border border-orange-100 shadow-sm">
          <p class="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Semanas</p>
          <p class="text-2xl font-black text-orange-700">{{ data.result.length }}</p>
        </div>
        <div :class="['p-5 rounded-3xl border shadow-sm', utilidadTotal >= 0 ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100']">
          <p class="text-xs font-black uppercase tracking-widest mb-1" :class="utilidadTotal >= 0 ? 'text-blue-600' : 'text-purple-600'">Utilidad Neta</p>
          <p class="text-2xl font-black" :class="utilidadTotal >= 0 ? 'text-blue-700' : 'text-purple-700'">{{ utilidadTotal.toFixed(2) }} <span class="text-xs">Bs.</span></p>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="(week, i) in sortedWeeks" :key="week.semana"
          class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-bold text-gray-800 text-lg">{{ week.semanaLabel }}</h3>
            <span :class="['px-3 py-1 rounded-full text-xs font-bold', week.resumen.utilidadSemanal >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
              {{ week.resumen.utilidadSemanal >= 0 ? '+' : '' }}{{ week.resumen.utilidadSemanal.toFixed(2) }} Bs.
            </span>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ingresos</p>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between"><span class="text-gray-600">Venta Tienda</span><span class="font-semibold text-green-700">{{ week.ingresos.ventaTienda.toFixed(2) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-600">Revendedores Neto</span><span class="font-semibold text-green-700">{{ week.ingresos.revendedoresNeto.toFixed(2) }}</span></div>
                <div class="flex justify-between border-t border-gray-100 pt-1.5"><span class="font-semibold text-gray-700">Total</span><span class="font-bold text-green-700">{{ week.ingresos.totalIngresos.toFixed(2) }}</span></div>
              </div>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Egresos</p>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between"><span class="text-gray-600">Compras</span><span class="font-semibold text-red-700">{{ week.egresos.compras.toFixed(2) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-600">Gastos Operativos</span><span class="font-semibold text-red-700">{{ week.egresos.gastosOperativos.toFixed(2) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-600">Gastos Generales</span><span class="font-semibold text-red-700">{{ week.egresos.gastosGenerales.toFixed(2) }}</span></div>
                <div class="flex justify-between border-t border-gray-100 pt-1.5"><span class="font-semibold text-gray-700">Total</span><span class="font-bold text-red-700">{{ week.egresos.totalEgresos.toFixed(2) }}</span></div>
              </div>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resumen</p>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between"><span class="text-gray-600">Ventas</span><span class="font-semibold">{{ week.resumen.cantVentas }}</span></div>
                <div class="flex justify-between"><span class="text-gray-600">Compras</span><span class="font-semibold">{{ week.resumen.cantCompras }}</span></div>
                <div class="flex justify-between border-t border-gray-100 pt-1.5">
                  <span class="font-semibold text-gray-700">Utilidad</span>
                  <span :class="['font-bold', week.resumen.utilidadSemanal >= 0 ? 'text-blue-700' : 'text-purple-700']">
                    {{ week.resumen.utilidadSemanal.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ReporteSemanalGeneral } from '@/Server/Reporte.js'

const props = defineProps({
  fechadesde: { type: String, default: '' },
  fechahasta: { type: String, default: '' },
  idsucursal: { type: String, default: 'TODOS' }
})

const data = ref(null)
const loading = ref(false)

const sortedWeeks = computed(() => {
  if (!data.value?.result) return []
  return [...data.value.result].sort((a, b) => b.semana.localeCompare(a.semana))
})

const totalIngresos = computed(() => {
  if (!data.value?.result) return 0
  return data.value.result.reduce((acc, w) => acc + (w.ingresos?.totalIngresos || 0), 0)
})

const totalEgresos = computed(() => {
  if (!data.value?.result) return 0
  return data.value.result.reduce((acc, w) => acc + (w.egresos?.totalEgresos || 0), 0)
})

const utilidadTotal = computed(() => totalIngresos.value - totalEgresos.value)

async function cargar() {
  if (!props.fechadesde || !props.fechahasta) return
  loading.value = true
  try {
    const resp = await ReporteSemanalGeneral(props.fechadesde, props.fechahasta, props.idsucursal)
    data.value = resp
  } catch (e) {
    console.error('Error al cargar resumen semanal:', e)
    data.value = null
  } finally {
    loading.value = false
  }
}

watch(() => [props.fechadesde, props.fechahasta, props.idsucursal], cargar, { immediate: true })
</script>
