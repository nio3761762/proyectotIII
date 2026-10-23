<template>
  <div class="space-y-6">
    <!-- Porcentajes generales -->
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div class="px-5 py-3 border-b border-gray-200 bg-gray-50">
        <h3 class="text-sm font-semibold text-gray-800">Porcentajes sobre ventas (general)</h3>
      </div>
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-[11px] text-gray-500 uppercase">
            <th class="px-5 py-2 font-medium border-b border-gray-200">Origen</th>
            <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">% Ingreso</th>
            <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">% Neto</th>
            <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">Ingreso</th>
            <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">Neto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, idx) in porcentajes" :key="idx" class="text-sm text-gray-800">
            <td class="px-5 py-2 border-b border-gray-100">
              <span class="font-semibold">{{ p.origen }}</span>
              <span v-if="p.tipo === 'Revendedor'" class="ml-2 text-xs text-gray-500">{{ p.cantidad }} revendedor(es)</span>
              <span v-else class="ml-2 text-xs text-gray-500">{{ p.tipo }}</span>
            </td>
            <td class="px-5 py-2 border-b border-gray-100 text-right">{{ p.porcentaje }} %</td>
            <td class="px-5 py-2 border-b border-gray-100 text-right">{{ p.porcentajeNeto }} %</td>
            <td class="px-5 py-2 border-b border-gray-100 text-right">{{ formatCurrency(p.monto) }} bs</td>
            <td class="px-5 py-2 border-b border-gray-100 text-right">{{ formatCurrency(p.neto) }} bs</td>
          </tr>
          <tr v-if="!porcentajes.length">
            <td colspan="5" class="px-5 py-4 text-center text-sm text-gray-400">Sin datos</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Ganancias generales -->
    <div class="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 class="text-sm font-semibold text-gray-800 mb-4">Ganancias generales</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="border border-gray-200 rounded-xl px-4 py-3">
          <div class="text-[11px] text-gray-500 uppercase">Ingreso total</div>
          <div class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalesGlobales.ingreso) }} bs</div>
        </div>
        <div class="border border-gray-200 rounded-xl px-4 py-3">
          <div class="text-[11px] text-gray-500 uppercase">Gasto extra total</div>
          <div class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalesGlobales.gastoExtra) }} bs</div>
        </div>
        <div class="border border-gray-200 rounded-xl px-4 py-3">
          <div class="text-[11px] text-gray-500 uppercase">Neto (ganancia)</div>
          <div class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalesGlobales.neto) }} bs</div>
        </div>
        <div class="border border-gray-200 rounded-xl px-4 py-3">
          <div class="text-[11px] text-gray-500 uppercase">Comisión total</div>
          <div class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalesGlobales.comision) }} bs</div>
        </div>
      </div>
    </div>

    <!-- Vista Diaria -->
    <div v-if="vistaAgregacion === 'diario'" class="space-y-6">
      <VentaUnificadaTabla
        v-for="dia in dias"
        :key="dia.fecha"
        :titulo="formatFecha(dia.fecha)"
        :columnas="columnas"
        :grupos="grupos"
        :filas="dia.filas"
        :totales="dia.totales"
        :totales-por-columna="dia.totalesPorColumna"
      />
    </div>

    <!-- Vista Semanal: general de la semana + tablas diarias -->
    <div v-if="vistaAgregacion === 'semanal'" class="space-y-8">
      <div v-for="semana in semanas" :key="semana.key" class="space-y-4">
        <h2 class="text-base font-semibold text-gray-800">Semana {{ semana.label }}</h2>

        <VentaUnificadaTabla
          :titulo="'General de la semana'"
          :columnas="columnas"
          :grupos="grupos"
          :filas="semana.filas"
          :totales="semana.totales"
          :totales-por-columna="semana.totalesPorColumna"
        />

        <VentaUnificadaTabla
          v-for="dia in diasDeSemana(semana)"
          :key="dia.fecha"
          :titulo="formatFecha(dia.fecha)"
          :grande="false"
          :columnas="columnas"
          :grupos="grupos"
          :filas="dia.filas"
          :totales="dia.totales"
          :totales-por-columna="dia.totalesPorColumna"
        />
      </div>
    </div>

    <!-- Vista Mensual: general del mes + semanas (sin detalle diario) -->
    <div v-if="vistaAgregacion === 'mensual'" class="space-y-8">
      <!-- Resumen general por meses -->
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-800">Resumen general por meses</h3>
          <span class="text-xs text-gray-500">Cantidad de meses: {{ cantidadMeses }}</span>
        </div>
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[11px] text-gray-500 uppercase">
              <th class="px-5 py-2 font-medium border-b border-gray-200">Mes</th>
              <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">Ingreso</th>
              <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">Gasto extra</th>
              <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">Neto (ganancia)</th>
              <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">% del ingreso</th>
              <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">% de la ganancia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in resumenMeses" :key="'rm-' + m.key" class="text-sm text-gray-800">
              <td class="px-5 py-2 border-b border-gray-100 font-semibold">{{ m.label }}</td>
              <td class="px-5 py-2 border-b border-gray-100 text-right">{{ formatCurrency(m.ingreso) }} bs</td>
              <td class="px-5 py-2 border-b border-gray-100 text-right">{{ formatCurrency(m.gastoExtra) }} bs</td>
              <td class="px-5 py-2 border-b border-gray-100 text-right">{{ formatCurrency(m.neto) }} bs</td>
              <td class="px-5 py-2 border-b border-gray-100 text-right">{{ m.porcentajeIngreso }} %</td>
              <td class="px-5 py-2 border-b border-gray-100 text-right">{{ m.porcentajeNeto }} %</td>
            </tr>
            <tr v-if="!resumenMeses.length">
              <td colspan="6" class="px-5 py-3 text-center text-sm text-gray-400">Sin meses en el rango</td>
            </tr>
            <tr class="text-sm font-semibold text-gray-900 bg-gray-50">
              <td class="px-5 py-2">Total</td>
              <td class="px-5 py-2 text-right">{{ formatCurrency(totalesGlobales.ingreso) }} bs</td>
              <td class="px-5 py-2 text-right">{{ formatCurrency(totalesGlobales.gastoExtra) }} bs</td>
              <td class="px-5 py-2 text-right">{{ formatCurrency(totalesGlobales.neto) }} bs</td>
              <td class="px-5 py-2 text-right">{{ sumaPorcentajeIngreso }} %</td>
              <td class="px-5 py-2 text-right">{{ sumaPorcentajeNeto }} %</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-for="mes in meses" :key="mes.key" class="space-y-4">
        <h2 class="text-base font-semibold text-gray-800">{{ mes.label }}</h2>

        <VentaUnificadaTabla
          titulo="General del mes"
          :columnas="columnas"
          :grupos="grupos"
          :filas="mes.filas"
          :totales="mes.totales"
          :totales-por-columna="mes.totalesPorColumna"
        />

        <!-- Resumen por semanas del mes -->
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-800">Resumen por semanas</h3>
          </div>
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[11px] text-gray-500 uppercase">
                <th class="px-5 py-2 font-medium border-b border-gray-200">Semana</th>
                <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">Ingreso</th>
                <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">Gasto extra</th>
                <th class="px-5 py-2 font-medium border-b border-gray-200 text-right">Neto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="semana in mes.semanas" :key="'res-' + semana.key" class="text-sm text-gray-800">
                <td class="px-5 py-2 border-b border-gray-100">{{ semana.label }}</td>
                <td class="px-5 py-2 border-b border-gray-100 text-right">{{ formatCurrency(semana.totales.ingreso) }} bs</td>
                <td class="px-5 py-2 border-b border-gray-100 text-right">{{ formatCurrency(semana.totales.gastoExtra) }} bs</td>
                <td class="px-5 py-2 border-b border-gray-100 text-right">{{ formatCurrency(semana.totales.neto) }} bs</td>
              </tr>
              <tr v-if="!mes.semanas?.length">
                <td colspan="4" class="px-5 py-3 text-center text-sm text-gray-400">Sin semanas</td>
              </tr>
              <tr class="text-sm font-semibold text-gray-900 bg-gray-50">
                <td class="px-5 py-2">Total del mes</td>
                <td class="px-5 py-2 text-right">{{ formatCurrency(mes.totales.ingreso) }} bs</td>
                <td class="px-5 py-2 text-right">{{ formatCurrency(mes.totales.gastoExtra) }} bs</td>
                <td class="px-5 py-2 text-right">{{ formatCurrency(mes.totales.neto) }} bs</td>
              </tr>
            </tbody>
          </table>
        </div>

        <VentaUnificadaTabla
          v-for="semana in mes.semanas"
          :key="semana.key"
          :titulo="'Semana ' + semana.label"
          :grande="false"
          :columnas="columnas"
          :grupos="grupos"
          :filas="semana.filas"
          :totales="semana.totales"
          :totales-por-columna="semana.totalesPorColumna"
        />
      </div>
    </div>

    <div v-if="!cargando && !dias.length" class="text-center py-12 text-gray-400">
      Sin datos para el rango seleccionado
    </div>
    <div v-if="cargando" class="text-center py-12 text-gray-400">
      Cargando reporte...
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VentaUnificadaTabla from './VentaUnificadaTabla.vue'

const props = defineProps({
  reporte: { type: Object, default: () => ({}) },
  formatFecha: { type: Function, required: true },
  vistaAgregacion: { type: String, default: 'diario' }, // diario | semanal | mensual
  cargando: { type: Boolean, default: false }
})

const formatCurrency = (val) => Number(val || 0).toFixed(2)

// Todos los datos de agregacion (semanas, meses, totales) llegan calculados desde el backend
const columnas = computed(() => props.reporte?.columnas || [])
const grupos = computed(() => props.reporte?.grupos || [])
const dias = computed(() => props.reporte?.dias || [])
const semanas = computed(() => props.reporte?.semanas || [])
const meses = computed(() => props.reporte?.meses || [])
const porcentajes = computed(() => props.reporte?.porcentajes || [])
const resumenMeses = computed(() => props.reporte?.resumenMeses || [])
const cantidadMeses = computed(() => props.reporte?.cantidadMeses ?? resumenMeses.value.length)
const sumaPorcentajeIngreso = computed(() => resumenMeses.value.reduce((s, m) => s + Number(m.porcentajeIngreso || 0), 0).toFixed(2))
const sumaPorcentajeNeto = computed(() => resumenMeses.value.reduce((s, m) => s + Number(m.porcentajeNeto || 0), 0).toFixed(2))
const totalesGlobales = computed(() => props.reporte?.totalesGlobales || { ingreso: 0, gastoExtra: 0, neto: 0, comision: 0 })

// Acceso directo al detalle diario por fecha (para mostrar las diarias dentro de cada semana)
const diasPorFecha = computed(() => {
  const mapa = {}
  dias.value.forEach((dia) => { mapa[dia.fecha] = dia })
  return mapa
})

const diasDeSemana = (semana) => (semana.fechas || [])
  .map((fecha) => diasPorFecha.value[fecha])
  .filter(Boolean)
</script>
