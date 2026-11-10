<template>
  <div class="bg-white rounded-2xl border border-gray-300 overflow-hidden">
    <div class="px-5 py-3 border-b border-gray-300 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
      <h3 class="text-sm font-semibold text-gray-800">
        {{ etiquetaTipo }}: <span class="font-black">{{ origenVisible }}</span>
      </h3>
      <span class="text-xs text-gray-600">Fecha : {{ rangoTexto }}</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[900px] [&_th]:border [&_td]:border [&_th]:border-gray-400 [&_td]:border-gray-400">
        <thead>
          <tr class="bg-gray-100">
            <th rowspan="2" class="p-2 text-[11px] font-bold text-gray-700 uppercase text-left align-middle">Producto</th>
            <th rowspan="2" class="p-2 text-[11px] font-bold text-gray-700 uppercase text-left align-middle">Presentación</th>
            <th v-for="dia in dias" :key="'d-' + dia.fecha" colspan="2" class="p-2 text-[11px] font-bold text-gray-700 uppercase text-center bg-indigo-50">
              <div>{{ dia.nombre }}</div>
              <div class="text-[10px] font-normal text-gray-500">{{ formatFecha(dia.fecha) }}</div>
            </th>
            <th colspan="2" class="p-2 text-[11px] font-bold text-gray-700 uppercase text-center bg-orange-50">Total semana</th>
          </tr>
          <tr class="bg-gray-100">
            <template v-for="dia in dias" :key="'h-' + dia.fecha">
              <th class="px-2 py-1.5 text-[10px] font-semibold text-gray-600 text-center w-14">C</th>
              <th class="px-2 py-1.5 text-[10px] font-semibold text-gray-600 text-right">P</th>
            </template>
            <th class="px-2 py-1.5 text-[10px] font-semibold text-gray-600 text-center w-14">C</th>
            <th class="px-2 py-1.5 text-[10px] font-semibold text-gray-600 text-right">P</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="fila in filasProducto" :key="fila.key" class="hover:bg-gray-50">
            <td v-if="fila.inicioProducto" :rowspan="fila.rowspanProducto" class="p-2.5 font-bold text-gray-800 whitespace-nowrap align-middle bg-white">{{ fila.producto }}</td>
            <td class="p-2.5 text-sm text-gray-700 whitespace-nowrap">{{ fila.etiqueta }}</td>
            <template v-for="(celda, i) in fila.celdas" :key="'c-' + i">
              <td class="px-2 py-2.5 text-center text-sm text-gray-800 bg-indigo-50/30">{{ celda.cantidad }}</td>
              <td class="px-2 py-2.5 text-right text-sm text-gray-800">{{ formatCurrency(celda.monto) }}</td>
            </template>
            <td class="px-2 py-2.5 text-center text-sm font-semibold text-gray-900 bg-orange-50/40">{{ fila.totalC }}</td>
            <td class="px-2 py-2.5 text-right text-sm font-semibold text-gray-900 bg-orange-50/40">{{ formatCurrency(fila.totalP) }}</td>
          </tr>

          <tr v-if="!filasProducto.length">
            <td :colspan="4 + dias.length * 2" class="p-4 text-center text-sm text-gray-400">Sin movimientos en la semana</td>
          </tr>

          <!-- Total: solo montos (P) por dia y de la semana -->
          <tr class="bg-gray-100 font-semibold">
            <td colspan="2" class="p-2.5 text-gray-900">Total</td>
            <template v-for="(r, i) in resumenDias" :key="'t-' + i">
              <td class="px-2 py-2.5"></td>
              <td class="px-2 py-2.5 text-right text-sm text-gray-900">{{ formatCurrency(r.monto) }}</td>
            </template>
            <td class="px-2 py-2.5"></td>
            <td class="px-2 py-2.5 text-right text-sm text-gray-900">{{ formatCurrency(totalGeneral.monto) }}</td>
          </tr>

          <tr class="text-sm text-blue-700">
            <td colspan="2" class="p-2.5 font-semibold">Comisión</td>
            <td v-for="(r, i) in resumenDias" :key="'com-' + i" colspan="2" class="px-2 py-2.5 text-center font-semibold">{{ formatCurrency(r.comision) }}</td>
            <td colspan="2" class="px-2 py-2.5 text-center font-bold bg-orange-50/40">{{ formatCurrency(totalGeneral.comision) }}</td>
          </tr>

          <tr class="text-sm text-orange-600">
            <td colspan="2" class="p-2.5 font-semibold">Gasto</td>
            <td v-for="(r, i) in resumenDias" :key="'gas-' + i" colspan="2" class="px-2 py-2.5 text-center font-semibold">{{ formatCurrency(r.gasto) }}</td>
            <td colspan="2" class="px-2 py-2.5 text-center font-bold bg-orange-50/40">{{ formatCurrency(totalGeneral.gasto) }}</td>
          </tr>

          <!-- Neto: Total - Comision - Gasto -->
          <tr class="bg-emerald-50 text-sm text-emerald-800">
            <td colspan="2" class="p-2.5 font-black">Neto</td>
            <td v-for="(r, i) in resumenDias" :key="'neto-' + i" colspan="2" class="px-2 py-2.5 text-center font-black">{{ formatCurrency(r.neto) }}</td>
            <td colspan="2" class="px-2 py-2.5 text-center font-black bg-emerald-100">{{ formatCurrency(totalGeneral.neto) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { construirSemanalOrigen, etiquetaTipoOrigen, dinero } from './ventaSemanalModelo.js'

// Tabla semanal por origen (revendedor, tienda o pedido de cocina).
// El calculo vive en ventaSemanalModelo.js (tambien lo usa el PDF).
const props = defineProps({
  origen: { type: String, required: true },
  tipo: { type: String, required: true },                 // Revendedor | Venta | Pedido
  fechas: { type: Array, default: () => [] },             // fechas YYYY-MM-DD de la semana
  diasPorFecha: { type: Object, default: () => ({}) },    // dia del backend indexado por fecha
  columnas: { type: Array, default: () => [] },           // columnas producto||presentacion del backend
  formatFecha: { type: Function, required: true }
})

const formatCurrency = (val) => dinero(val)

const etiquetaTipo = computed(() => etiquetaTipoOrigen(props.tipo))

// Cocina se muestra como Pedido (igual que en el resto del reporte de venta)
const origenVisible = computed(() => {
  const nombre = String(props.origen || '')
  return /^cocina$/i.test(nombre) ? 'Cocina' : nombre
})

const modelo = computed(() => construirSemanalOrigen({
  origen: props.origen,
  tipo: props.tipo,
  fechas: props.fechas,
  diasPorFecha: props.diasPorFecha,
  columnas: props.columnas
}))

const dias = computed(() => modelo.value.dias)
const filasProducto = computed(() => modelo.value.filas)
const resumenDias = computed(() => modelo.value.resumenDias)
const totalGeneral = computed(() => modelo.value.totalGeneral)

const rangoTexto = computed(() => {
  if (!dias.value.length) return ''
  const primera = props.formatFecha(dias.value[0].fecha)
  const ultima = props.formatFecha(dias.value[dias.value.length - 1].fecha)
  return `${primera} - ${ultima}`
})
</script>
