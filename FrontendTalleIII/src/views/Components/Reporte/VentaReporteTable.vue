<template>
  <div class="space-y-6">
    <!-- Porcentajes superiores -->
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 bg-orange-100 rounded-xl">
          <BarChart3 class="h-5 w-5 text-orange-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-800">Porcentaje sobre Ventas</h3>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <div v-for="p in porcentajes" :key="p.origen" class="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
          <span class="text-sm font-bold text-gray-700">{{ p.origen }}</span>
          <span class="ml-2 text-sm font-black text-orange-600">{{ p.porcentaje }} %</span>
          <span class="ml-2 text-xs text-gray-500">({{ formatCurrency(p.monto) }} Bs.)</span>
        </div>
      </div>
    </div>

    <!-- Filtro por mes inicial -->
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex flex-col md:flex-row md:items-center gap-4">
      <div class="flex items-center gap-3">
        <Calendar class="h-5 w-5 text-gray-500" />
        <span class="text-sm font-bold text-gray-700">Mes inicial</span>
      </div>
      <input type="month" v-model="mesInicial" class="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
      <button @click="aplicarFiltroMeses" class="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold hover:shadow-lg transition-all">Aplicar</button>
      <div class="text-sm text-gray-500">Se mostrarán todos los meses desde {{ mesInicial || '...' }} hasta el período filtrado</div>
    </div>

    <!-- Vista General por Meses -->
    <div v-if="vistaActual === 'general'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">General por Meses</h2>
      </div>
      <div v-if="tablaGeneralMeses.length === 0" class="text-center py-12 text-gray-400">Sin datos</div>
      <div v-for="mes in tablaGeneralMeses" :key="mes.key" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-black text-gray-800">{{ mes.label }}</h3>
          </div>
          <button @click="verMes(mes)" class="px-4 py-2 rounded-xl bg-white text-orange-600 font-bold border border-orange-200 hover:bg-orange-50 transition-all">Ver detalle del mes</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr class="bg-gray-50/30">
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r" rowspan="2"></th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r" rowspan="2">Tipo</th>
                <th v-for="grupo in gruposColumnas" :key="grupo.key" :colspan="grupo.presentaciones.length" class="p-2 text-[10px] font-black text-gray-700 uppercase tracking-wide border-b border-r text-center">{{ grupo.producto }}</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center" colspan="3">Total</th>
              </tr>
              <tr class="bg-gray-50/30">
                <th v-for="col in columnasAplanadas" :key="col.key" class="px-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b border-r text-center">{{ col.presentacion }}</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Ingreso</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Gasto Extra</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Neto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fila in mes.filas" :key="fila.key" class="hover:bg-orange-50/20 transition-colors">
                <td class="p-3 border-b border-r font-bold text-gray-800">{{ fila.origen }}</td>
                <td class="p-3 border-b border-r text-sm text-gray-600">{{ fila.tipo }}</td>
                <td v-for="col in columnasAplanadas" :key="col.key" class="px-2 py-2 border-b border-r text-center text-sm font-bold text-gray-800">{{ fila.cantidades[col.key] || 0 }}</td>
                <td class="p-2 border-b text-right text-sm font-black text-blue-600">{{ formatCurrency(fila.ingreso) }} bs</td>
                <td class="p-2 border-b text-right text-sm font-black text-orange-500">{{ formatCurrency(fila.gastoExtra) }} bs</td>
                <td class="p-2 border-b text-right text-sm font-black text-emerald-600">{{ formatCurrency(fila.neto) }} bs</td>
              </tr>
              <tr class="bg-orange-50/40">
                <td colspan="2" class="p-3 border-t-2 border-orange-200 font-black text-gray-700">Total</td>
                <td v-for="col in columnasAplanadas" :key="'t-'+col.key" class="px-2 py-2 border-t-2 border-orange-200 text-center text-sm font-black text-gray-800">{{ mes.totalesPorColumna[col.key] || 0 }}</td>
                <td class="p-2 border-t-2 border-orange-200 text-right text-sm font-black text-blue-700">{{ formatCurrency(mes.totalIngreso) }} bs</td>
                <td class="p-2 border-t-2 border-orange-200 text-right text-sm font-black text-orange-600">{{ formatCurrency(mes.totalGastoExtra) }} bs</td>
                <td class="p-2 border-t-2 border-orange-200 text-right text-sm font-black text-emerald-700">{{ formatCurrency(mes.totalNeto) }} bs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Vista Detalle por Mes con Semanas -->
    <div v-if="vistaActual === 'mes'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="volverGeneral" class="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">← Volver a General</button>
          <h2 class="text-xl font-bold text-gray-800">{{ mesSeleccionado?.label }}</h2>
        </div>
      </div>
      <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-3 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-100">
          <h3 class="font-black text-gray-800">Tabla General del Mes</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr class="bg-gray-50/30">
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r" rowspan="2"></th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r" rowspan="2">Tipo</th>
                <th v-for="grupo in gruposColumnas" :key="grupo.key" :colspan="grupo.presentaciones.length" class="p-2 text-[10px] font-black text-gray-700 uppercase tracking-wide border-b border-r text-center">{{ grupo.producto }}</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center" colspan="3">Total</th>
              </tr>
              <tr class="bg-gray-50/30">
                <th v-for="col in columnasAplanadas" :key="col.key" class="px-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b border-r text-center">{{ col.presentacion }}</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Ingreso</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Gasto Extra</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Neto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fila in mesSeleccionado?.filas" :key="fila.key" class="hover:bg-orange-50/20 transition-colors">
                <td class="p-3 border-b border-r font-bold text-gray-800">{{ fila.origen }}</td>
                <td class="p-3 border-b border-r text-sm text-gray-600">{{ fila.tipo }}</td>
                <td v-for="col in columnasAplanadas" :key="col.key" class="px-2 py-2 border-b border-r text-center text-sm font-bold text-gray-800">{{ fila.cantidades[col.key] || 0 }}</td>
                <td class="p-2 border-b text-right text-sm font-black text-blue-600">{{ formatCurrency(fila.ingreso) }} bs</td>
                <td class="p-2 border-b text-right text-sm font-black text-orange-500">{{ formatCurrency(fila.gastoExtra) }} bs</td>
                <td class="p-2 border-b text-right text-sm font-black text-emerald-600">{{ formatCurrency(fila.neto) }} bs</td>
              </tr>
              <tr class="bg-orange-50/40">
                <td colspan="2" class="p-3 border-t-2 border-orange-200 font-black text-gray-700">Total</td>
                <td v-for="col in columnasAplanadas" :key="'tm-'+col.key" class="px-2 py-2 border-t-2 border-orange-200 text-center text-sm font-black text-gray-800">{{ mesSeleccionado?.totalesPorColumna[col.key] || 0 }}</td>
                <td class="p-2 border-t-2 border-orange-200 text-right text-sm font-black text-blue-700">{{ formatCurrency(mesSeleccionado?.totalIngreso) }} bs</td>
                <td class="p-2 border-t-2 border-orange-200 text-right text-sm font-black text-orange-600">{{ formatCurrency(mesSeleccionado?.totalGastoExtra) }} bs</td>
                <td class="p-2 border-t-2 border-orange-200 text-right text-sm font-black text-emerald-700">{{ formatCurrency(mesSeleccionado?.totalNeto) }} bs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Semanas -->
      <div v-for="semana in semanasDelMes" :key="semana.key" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-black text-gray-800">{{ semana.label }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr class="bg-gray-50/30">
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r" rowspan="2"></th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r" rowspan="2">Tipo</th>
                <th v-for="grupo in gruposColumnas" :key="grupo.key" :colspan="grupo.presentaciones.length" class="p-2 text-[10px] font-black text-gray-700 uppercase tracking-wide border-b border-r text-center">{{ grupo.producto }}</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center" colspan="3">Total</th>
              </tr>
              <tr class="bg-gray-50/30">
                <th v-for="col in columnasAplanadas" :key="col.key" class="px-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b border-r text-center">{{ col.presentacion }}</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Ingreso</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Gasto Extra</th>
                <th class="p-2 text-[9px] font-black text-gray-500 uppercase tracking-wide border-b text-center">Neto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fila in semana.filas" :key="fila.key" class="hover:bg-blue-50/20 transition-colors">
                <td class="p-3 border-b border-r font-bold text-gray-800">{{ fila.origen }}</td>
                <td class="p-3 border-b border-r text-sm text-gray-600">{{ fila.tipo }}</td>
                <td v-for="col in columnasAplanadas" :key="col.key" class="px-2 py-2 border-b border-r text-center text-sm font-bold text-gray-800">{{ fila.cantidades[col.key] || 0 }}</td>
                <td class="p-2 border-b text-right text-sm font-black text-blue-600">{{ formatCurrency(fila.ingreso) }} bs</td>
                <td class="p-2 border-b text-right text-sm font-black text-orange-500">{{ formatCurrency(fila.gastoExtra) }} bs</td>
                <td class="p-2 border-b text-right text-sm font-black text-emerald-600">{{ formatCurrency(fila.neto) }} bs</td>
              </tr>
              <tr class="bg-blue-50/40">
                <td colspan="2" class="p-3 border-t-2 border-blue-200 font-black text-gray-700">Total</td>
                <td v-for="col in columnasAplanadas" :key="'ts-'+col.key" class="px-2 py-2 border-t-2 border-blue-200 text-center text-sm font-black text-gray-800">{{ semana.totalesPorColumna[col.key] || 0 }}</td>
                <td class="p-2 border-t-2 border-blue-200 text-right text-sm font-black text-blue-700">{{ formatCurrency(semana.totalIngreso) }} bs</td>
                <td class="p-2 border-t-2 border-blue-200 text-right text-sm font-black text-orange-600">{{ formatCurrency(semana.totalGastoExtra) }} bs</td>
                <td class="p-2 border-t-2 border-blue-200 text-right text-sm font-black text-emerald-700">{{ formatCurrency(semana.totalNeto) }} bs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Calendar, BarChart3 } from 'lucide-vue-next'
import { getWeekStart as sharedWeekStart, getWeekLabel as sharedWeekLabel, getMonthKey as sharedMonthKey, getMonthLabel as sharedMonthLabel, sortMonthsDesc as sharedSortMonthsDesc } from './useSemana'

const props = defineProps({
  sortedVentas: { type: Array, default: () => [] },
  formatFecha: { type: Function, required: true },
  detalladoComision: { type: Object, default: () => ({ reporte: [] }) },
  agruparPorSemana: { type: Boolean, default: false },
  agruparPorMes: { type: Boolean, default: false }
})

const mesInicial = ref(new Date().toISOString().slice(0, 7))
const vistaActual = ref('general')
const mesSeleccionado = ref(null)

const formatCurrency = (val) => Number(val || 0).toFixed(2)
const getWeekMonday = (d) => sharedWeekStart(d)
const getWeekLabelFn = (m) => sharedWeekLabel(m)
const getMonthKeyLocal = (d) => sharedMonthKey(d)
const getMonthLabelLocal = (m) => sharedMonthLabel(m)
const sortMonthsDescLocal = (arr) => sharedSortMonthsDesc(arr)

const aplicarFiltroMeses = () => { vistaActual.value = 'general'; mesSeleccionado.value = null }
const volverGeneral = () => { vistaActual.value = 'general'; mesSeleccionado.value = null }
const verMes = (mes) => { mesSeleccionado.value = mes; vistaActual.value = 'mes' }

// Extraer columnas dinámicas desde ventas
const gruposColumnas = computed(() => {
  const grupos = new Map()
  ;(props.sortedVentas || []).forEach(g => {
    ;(g.ventas || []).forEach(v => {
      const prod = v.producto || 'Sin producto'
      const base = prod.split('(')[0].trim()
      if (!grupos.has(base)) grupos.set(base, new Map())
      const pres = (prod.match(/\(([^)]+)\)/)?.[1]) || 'Und'
      if (!grupos.get(base).has(pres)) grupos.get(base).set(pres, true)
    })
  })
  const result = []
  grupos.forEach((presMap, producto) => {
    result.push({ key: producto, producto, presentaciones: Array.from(presMap.keys()) })
  })
  return result.length ? result : [{ key: 'Producto', producto: 'Producto', presentaciones: ['U'] }]
})

const columnasAplanadas = computed(() => {
  const cols = []
  gruposColumnas.value.forEach(g => {
    g.presentaciones.forEach(p => cols.push({ key: g.key + '||' + p, producto: g.key, presentacion: p }))
  })
  return cols
})

const buildFila = (origen, tipo) => ({
  key: origen + '|' + tipo,
  origen,
  tipo,
  cantidades: {},
  ingreso: 0,
  gastoExtra: 0,
  neto: 0
})

const tablaGeneralMeses = computed(() => {
  const months = {}
  const desde = mesInicial.value ? mesInicial.value + '-01' : null
  ;(props.sortedVentas || []).forEach(g => {
    if (!g.fecha) return
    if (desde && g.fecha < desde) return
    const f = g.fecha.split('T')[0]
    const mk = getMonthKeyLocal(f)
    if (!months[mk]) {
      months[mk] = { key: mk, label: getMonthLabelLocal(mk), filasMap: {}, diasVentas: [] }
    }
    months[mk].diasVentas.push(g)
  })
  Object.values(months).forEach(month => {
    const filas = { 'Revendedor': buildFila('Revendedor', 'Revendedor'), 'Tienda Central': buildFila('Tienda Central', 'Vendido'), 'Cocina': buildFila('Cocina', 'Pedido') }
    month.diasVentas.forEach(dia => {
      ;(dia.ventas || []).forEach(v => {
        const suc = (v.sucursal || '').toLowerCase()
        let key = 'Tienda Central'
        if (suc.includes('cocina') || suc.includes('pedido')) key = 'Cocina'
        else if (v.cliente && v.cliente.toLowerCase() !== 'consumidor final') key = 'Revendedor'
        const fila = filas[key]
        const prod = v.producto || ''
        const base = prod.split('(')[0].trim()
        const pres = (prod.match(/\(([^)]+)\)/)?.[1]) || 'Und'
        const ckey = base + '||' + pres
        fila.cantidades[ckey] = (fila.cantidades[ckey] || 0) + Number(v.cantidad || 0)
        fila.ingreso += Number(v.precioTotalVenta || 0)
        fila.gastoExtra += Number(v.gastoextra || 0)
      })
    })
    Object.values(filas).forEach(f => { f.neto = f.ingreso - f.gastoExtra })
    const filasArr = Object.values(filas).filter(f => f.ingreso > 0 || Object.values(f.cantidades).some(x=>x>0))
    const totalesPorColumna = {}
    columnasAplanadas.value.forEach(c => { totalesPorColumna[c.key] = filasArr.reduce((s,f)=>s+Number(f.cantidades[c.key]||0),0) })
    month.filas = filasArr
    month.totalesPorColumna = totalesPorColumna
    month.totalIngreso = filasArr.reduce((s,f)=>s+f.ingreso,0)
    month.totalGastoExtra = filasArr.reduce((s,f)=>s+f.gastoExtra,0)
    month.totalNeto = filasArr.reduce((s,f)=>s+f.neto,0)
  })
  return sortMonthsDescLocal(Object.values(months))
})

const semanasDelMes = computed(() => {
  if (!mesSeleccionado.value) return []
  const semanas = {}
  ;(mesSeleccionado.value.diasVentas || []).forEach(g => {
    const f = g.fecha.split('T')[0]
    const monday = getWeekMonday(f)
    if (!semanas[monday]) semanas[monday] = { key: monday, label: getWeekLabelFn(monday), diasVentas: [] }
    semanas[monday].diasVentas.push(g)
  })
  const result = []
  Object.values(semanas).sort((a,b)=>new Date(b.key)-new Date(a.key)).forEach(sem => {
    const filas = { 'Revendedor': buildFila('Revendedor', 'Revendedor'), 'Tienda Central': buildFila('Tienda Central', 'Vendido'), 'Cocina': buildFila('Cocina', 'Pedido') }
    sem.diasVentas.forEach(dia => {
      ;(dia.ventas || []).forEach(v => {
        const suc = (v.sucursal || '').toLowerCase()
        let key = 'Tienda Central'
        if (suc.includes('cocina') || suc.includes('pedido')) key = 'Cocina'
        else if (v.cliente && v.cliente.toLowerCase() !== 'consumidor final') key = 'Revendedor'
        const fila = filas[key]
        const prod = v.producto || ''
        const base = prod.split('(')[0].trim()
        const pres = (prod.match(/\(([^)]+)\)/)?.[1]) || 'Und'
        const ckey = base + '||' + pres
        fila.cantidades[ckey] = (fila.cantidades[ckey] || 0) + Number(v.cantidad || 0)
        fila.ingreso += Number(v.precioTotalVenta || 0)
        fila.gastoExtra += Number(v.gastoextra || 0)
      })
    })
    Object.values(filas).forEach(f => { f.neto = f.ingreso - f.gastoExtra })
    const filasArr = Object.values(filas).filter(f => f.ingreso > 0 || Object.values(f.cantidades).some(x=>x>0))
    const totalesPorColumna = {}
    columnasAplanadas.value.forEach(c => { totalesPorColumna[c.key] = filasArr.reduce((s,f)=>s+Number(f.cantidades[c.key]||0),0) })
    result.push({ ...sem, filas: filasArr, totalesPorColumna, totalIngreso: filasArr.reduce((s,f)=>s+f.ingreso,0), totalGastoExtra: filasArr.reduce((s,f)=>s+f.gastoExtra,0), totalNeto: filasArr.reduce((s,f)=>s+f.neto,0) })
  })
  return result
})

const porcentajes = computed(() => {
  let total = 0
  const map = {}
  ;(props.sortedVentas || []).forEach(g => {
    ;(g.ventas || []).forEach(v => {
      const suc = (v.sucursal || '').toLowerCase()
      let key = 'Tienda Central'
      if (suc.includes('cocina') || suc.includes('pedido')) key = 'Pedido'
      else if (v.cliente && v.cliente.toLowerCase() !== 'consumidor final') key = 'Revendedor'
      else key = 'Tienda Central'
      map[key] = (map[key] || 0) + Number(v.precioTotalVenta || 0)
      total += Number(v.precioTotalVenta || 0)
    })
  })
  if (total === 0) return []
  return Object.entries(map).map(([origen, monto]) => ({ origen, monto, porcentaje: ((monto/total)*100).toFixed(1) }))
})
</script>
