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

    <div v-if="vistaSemanal" class="space-y-4">
      <div v-for="grp in semanaGroups" :key="grp.inicio" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(grp.inicio)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[grp.inicio] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ grp.label }}</h3>
            <span class="text-xs text-gray-500">{{ grp.dias.length }} días</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Producido</p>
              <p class="text-sm font-black text-emerald-600">{{ grp.totalProducido }} uds.</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Vendido</p>
              <p class="text-sm font-black text-blue-600">{{ grp.totalVendido }} uds.</p>
            </div>
          </div>
        </div>
        <div v-if="expandedSemanas[grp.inicio]" class="p-4 space-y-4">
          <div v-for="dia in grp.dias" :key="dia.fecha" class="rounded-2xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
              <h4 class="font-bold text-gray-700">{{ formatFecha(dia.fecha) }}</h4>
              <span class="text-xs text-emerald-600 font-bold">Prod: {{ dia.total_producido }}</span>
              <span class="text-xs text-blue-600 font-bold">Vend: {{ dia.total_vendido }}</span>
            </div>
            <div class="p-4 space-y-4">
              <TurnoBloque :turno="dia.turnos.manana" :stock-inicio-por-producto="dia.stockManana" titulo="Mañana (12:00 AM - 12:00 PM)" :format-money="formatMoney" />
              <TurnoBloque :turno="dia.turnos.tarde" :stock-inicio-por-producto="dia.stockTarde" titulo="Tarde (12:00 PM - 12:00 AM)" :format-money="formatMoney" />
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
import TurnoBloque from './TurnoBloque.vue'

const props = defineProps({
  detalleTurnos: { type: Array, default: () => [] },
  formatFecha: { type: Function, default: (f) => f },
  agruparPorSemana: { type: Boolean, default: false }
})

const formatMoney = (v) => '$' + Number(v || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const sortedDias = computed(() => {
  return [...props.detalleTurnos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Calcula el stock inicial (heredado) por producto para cada turno. Cada día se
// divide por hora en dos turnos del mismo día: Mañana (12:00 AM - 12:00 PM) y
// Tarde (12:00 PM - 12:00 AM). Los productos con stock sobrante de días anteriores
// siguen apareciendo (continuación) en los turnos siguientes con su Inicio/Restante.
const diasConStock = computed(() => {
  const disponible = {}
  const meta = {}
  const diasAsc = JSON.parse(JSON.stringify(props.detalleTurnos)).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const keyOf = (p) => String(p.idproducto) + '::' + (p.presentacion || 'Unidad')
  const factorDe = (p) => Math.max(1, Number(p.presentacion_factor) || 1)
  const esUnidadDe = (p) => { const pr = String(p.presentacion || 'Unidad'); return pr === 'Unidad' || pr === 'S/N' || pr === '' }
  const snapshot = () => Object.fromEntries(Object.entries(disponible).filter(([, v]) => Number(v) > 0))
  const calcularRest = (p) => (p.consumida ? 0 : (p._inicio || 0) + (p.cantidad_producida || 0) - (p.cantidad_vendida_total || 0) - ((p.consumo_eq_unidades || 0) / factorDe(p)))
  const absorber = (rows) => {
    const groups = new Map()
    rows.forEach(p => { if (!groups.has(p.idproducto)) groups.set(p.idproducto, []); groups.get(p.idproducto).push(p) })
    groups.forEach(group => {
      group.forEach(p => { p.consumida = false; p.consumo_eq_unidades = 0; p.consumo_detalle = [] })
      const couriers = group.filter(p => !(p.cantidad_producida || 0) && (p.cantidad_vendida_total || 0) > 0)
      const targets = group.filter(p => (p.cantidad_producida || 0) > 0 || (p._inicio || 0) > 0)
      const target = targets.find(p => esUnidadDe(p)) || targets.sort((a, b) => ((b.cantidad_producida || 0) + (b._inicio || 0)) - ((a.cantidad_producida || 0) + (a._inicio || 0)))[0]
      couriers.forEach(c => {
        if ((c._inicio || 0) > 0 || !target) return
        c.consumida = true
        target.consumo_eq_unidades = (target.consumo_eq_unidades || 0) + (c.cantidad_vendida_total || 0) * factorDe(c)
        target.consumo_detalle.push({ pres: c.presentacion || 'Unidad', qty: c.cantidad_vendida_total || 0, factor: factorDe(c) })
      })
    })
  }
  const cabLeftover = (turno, snap) => {
    const stockInicio = {}
    const prods = [...(turno.productos || [])]
    const keys = new Set(prods.map(p => keyOf(p)))
    Object.entries(snap).forEach(([k, v]) => {
      if (!keys.has(k)) {
        prods.push({ idproducto: k.split('::')[0], ...(meta[k] || { producto: 'Stock anterior', presentacion: 'Unidad' }), presentacion: (meta[k] || {}).presentacion || k.split('::')[1] || 'Unidad', presentacion_factor: 1, cantidad_producida: 0, cantidad_vendida_tienda: 0, total_venta_tienda: 0, cantidad_vendida_revendedor: 0, total_venta_revendedor: 0, cantidad_vendida_total: 0, consumo_eq_unidades: 0, consumo_detalle: [], consumida: false })
      }
    })
    prods.forEach(p => { p._inicio = disponible[keyOf(p)] || 0; stockInicio[keyOf(p)] = p._inicio })
    absorber(prods)
    prods.forEach(p => { disponible[keyOf(p)] = calcularRest(p) })
    return { stockInicio, productos: prods }
  }
  const result = diasAsc.map(dia => {
    const turn = dia.turnos || { manana: { productos: [] }, tarde: { productos: [] } }
    ;(turn.manana.productos || []).forEach(p => { const k = keyOf(p); if (!meta[k]) meta[k] = { producto: p.producto || 'Sin nombre', presentacion: p.presentacion || 'Unidad' } })
    ;(turn.tarde.productos || []).forEach(p => { const k = keyOf(p); if (!meta[k]) meta[k] = { producto: p.producto || 'Sin nombre', presentacion: p.presentacion || 'Unidad' } })
    const manana = cabLeftover(turn.manana, snapshot())
    const tarde = cabLeftover(turn.tarde, snapshot())
    return { ...dia, turnos: { manana: { ...turn.manana, productos: manana.productos }, tarde: { ...turn.tarde, productos: tarde.productos } }, stockManana: manana.stockInicio, stockTarde: tarde.stockInicio }
  })
  return result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
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

const vistaSemanal = computed(() => props.agruparPorSemana && semanaGroups.value.length > 0)

const expandedDias = ref({})
const toggleDia = (fecha) => { expandedDias.value[fecha] = !expandedDias.value[fecha] }
const expandAll = () => { diasVisibles.value.forEach(d => { expandedDias.value[d.fecha] = true }) }
const collapseAll = () => { Object.keys(expandedDias.value).forEach(k => { expandedDias.value[k] = false }) }

const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

watch(() => props.detalleTurnos, () => {
  diasVisiblesLimite.value = 15
  diasConStock.value.forEach(d => { if (expandedDias.value[d.fecha] === undefined) expandedDias.value[d.fecha] = false })
})

defineExpose({
  expandAllSemanas: () => { semanaGroups.value.forEach(s => { expandedSemanas.value[s.inicio] = true }) },
  collapseAllSemanas: () => { Object.keys(expandedSemanas.value).forEach(k => { expandedSemanas.value[k] = false }) }
})
</script>
