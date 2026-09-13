<template>
  <div class="space-y-8">
    <div class="bg-gradient-to-r from-rose-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
      <p class="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Destinos de la Producción</p>
      <p class="text-xs opacity-80 mb-4">Cada día se divide en dos turnos por la hora: <b>Mañana</b> (12:00 AM - 12:00 PM) y <b>Tarde</b> (12:00 PM - 12:00 AM), y se muestra en dos tablas. La fila <b>Producción</b> incluye el stock inicial heredado + lo producido en el turno. <b>Revendedor</b> = lo que sacó (entregado). <b>Tienda</b> = transferencias de stock enviado a la tienda. <b>Cocina</b> = solo pedidos. <b>Resta</b> = Producción − lo entregado y pasa al siguiente turno/día.</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p class="text-xl font-black">{{ totales.produccion }} uds.</p>
          <p class="text-[10px] opacity-80">Total Producido</p>
        </div>
        <div>
          <p class="text-xl font-black">{{ totales.entregado }} uds.</p>
          <p class="text-[10px] opacity-80">Total Entregado</p>
        </div>
        <div>
          <p class="text-xl font-black">{{ totales.resta }} uds.</p>
          <p class="text-[10px] opacity-80">Resta final (stock que queda)</p>
        </div>
        <div>
          <p class="text-xl font-black">{{ totales.dias }} días</p>
          <p class="text-[10px] opacity-80">Días con datos</p>
        </div>
      </div>
    </div>

    <div v-if="diasTable.length === 0" class="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center">
      <p class="text-gray-400 text-sm">Sin datos en el rango seleccionado</p>
    </div>

    <div v-for="dia in diasTable" :key="'dest-'+dia.fecha" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleDia(dia.fecha)">
        <div class="flex items-center gap-3">
          <svg :class="['w-4 h-4 text-gray-400 transition-transform', isDiaExpanded(dia.fecha) ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          <h3 class="font-bold text-gray-800 text-lg">{{ formatFecha(dia.fecha) }}</h3>
          <span class="text-xs text-emerald-600 font-bold">Prod: {{ diaTotal(dia, 'produccionTotal') }}</span>
          <span class="text-xs text-blue-600 font-bold">Ent: {{ diaEntregado(dia) }}</span>
          <span class="text-xs text-amber-600 font-bold">Resta: {{ diaTotal(dia, 'restaTotal') }}</span>
        </div>
      </div>
      <div v-if="isDiaExpanded(dia.fecha)" class="p-4 space-y-4">
        <TablaTurno :turno="dia.manana" :cols="dia.cols" titulo="Mañana (12:00 AM - 12:00 PM)" />
        <TablaTurno :turno="dia.tarde" :cols="dia.cols" titulo="Tarde (12:00 PM - 12:00 AM)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

// Subcomponente interno: una tabla por turno
import TablaTurno from './DestinosTurnosTablaTurno.vue'

const props = defineProps({
  destinos: { type: Array, default: () => [] },
  formatFecha: { type: Function, default: (f) => f }
})

const esUnidadPres = (pres) => {
  const p = String(pres || '').trim()
  return p === 'Unidad' || p === 'S/N' || p === ''
}

const redondear = (v) => Math.round((Number(v) || 0) * 100) / 100

// ===== Construcción del modelo por día =====
// Se procesa en orden ascendente para aplicar el arrastre (Resta → siguiente
// turno/día) y después se muestra en orden descendente (más reciente primero).
const diasTable = computed(() => {
  const ordenado = [...(props.destinos || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const carryRest = {}
  const resultado = []

  for (const dia of ordenado) {
    const metaEntries = Object.entries(dia.unidades || {})
    const prodCols = new Map()
    metaEntries.forEach(([key, m]) => {
      const pid = String(m.idproducto || '')
      if (!prodCols.has(pid)) prodCols.set(pid, new Map())
      prodCols.get(pid).set(key, { ...m, key })
    })

    const cols = []
    prodCols.forEach((units, pid) => {
      const arr = [...units.values()].sort((a, b) => {
        const wa = esUnidadPres(a.presentacion) ? -1 : (Number(a.factor) || 99)
        const wb = esUnidadPres(b.presentacion) ? -1 : (Number(b.factor) || 99)
        if (wa !== wb) return wa - wb
        return String(a.presentacion).localeCompare(String(b.presentacion))
      })
      cols.push({ idproducto: pid, producto: (arr[0] && arr[0].producto) || 'Sin nombre', units: arr })
    })
    cols.sort((a, b) => String(a.producto).localeCompare(String(b.producto)))

    const flats = []
    cols.forEach(c => c.units.forEach(u => flats.push(u)))

    const sumKeys = (obj) => {
      const t = {}
      Object.entries(obj || {}).forEach(([k, v]) => { t[k] = (t[k] || 0) + Number(v || 0) })
      return t
    }

    const bTurnoTabla = (turnoData) => {
      if (!turnoData) return null

      const prodMap = sumKeys(turnoData.produccion)
      const tiendaMap = sumKeys(turnoData.tienda)
      const cocinaMap = sumKeys(turnoData.cocina)
      const totalRev = {}
      const revRows = []
      ;(turnoData.revendedores || []).forEach(r => {
        const det = sumKeys(r.detalle)
        Object.entries(det).forEach(([k, v]) => { totalRev[k] = (totalRev[k] || 0) + v })
        const flat = flats.map(u => redondear(det[u.key] || 0))
        revRows.push({ nombre: r.revendedor || 'Revendedor', flat, total: redondear(flat.reduce((s, v) => s + v, 0)) })
      })

      const perKey = {}
      flats.forEach(u => {
        perKey[u.key] = {
          inicio: Number(carryRest[u.key]) || 0,
          producido: prodMap[u.key] || 0,
          ent: (totalRev[u.key] || 0) + (tiendaMap[u.key] || 0) + (cocinaMap[u.key] || 0),
          consumo: 0,
          consumida: false
        }
      })

      // Absorción: presentaciones compuestas (p.ej. bolsa x5) que se entregaron
      // sin producirse/inicio se descuentan de la presentación base del producto.
      const groups = new Map()
      flats.forEach(u => {
        const pid = String(u.idproducto)
        if (!groups.has(pid)) groups.set(pid, [])
        groups.get(pid).push(u)
      })
      groups.forEach(group => {
        const couriers = group.filter(u => Number(perKey[u.key].ent) > 0 && !perKey[u.key].inicio && !perKey[u.key].producido)
        const targets = group.filter(u => perKey[u.key].inicio > 0 || perKey[u.key].producido > 0)
        const target = targets.find(u => esUnidadPres(u.presentacion))
          || (targets.length ? [...targets].sort((a, b) => (perKey[b.key].inicio + perKey[b.key].producido) - (perKey[a.key].inicio + perKey[a.key].producido))[0] : undefined)
        couriers.forEach(u => {
          if (!target || perKey[u.key].inicio > 0) return
          perKey[u.key].consumida = true
          perKey[target.key].consumo += (perKey[u.key].ent || 0) * (Number(u.factor) || 1)
        })
      })

      const restaFlat = flats.map(u => {
        const p = perKey[u.key]
        const rest = p.consumida ? 0 : redondear(p.inicio + p.producido - p.ent - (p.consumo / (Number(u.factor) || 1)))
        carryRest[u.key] = rest
        return rest
      })
      const produccionFlat = flats.map(u => redondear(perKey[u.key].inicio + perKey[u.key].producido))
      const tiendaFlat = flats.map(u => redondear(tiendaMap[u.key] || 0))
      const cocinaFlat = flats.map(u => redondear(cocinaMap[u.key] || 0))
      const sumF = (arr) => arr.reduce((s, v) => s + v, 0)

      return {
        flats,
        produccion: produccionFlat,
        produccionTotal: redondear(sumF(produccionFlat)),
        revendedores: revRows,
        tienda: tiendaFlat,
        tiendaTotal: redondear(sumF(tiendaFlat)),
        cocina: cocinaFlat,
        cocinaTotal: redondear(sumF(cocinaFlat)),
        resta: restaFlat,
        restaTotal: redondear(sumF(restaFlat))
      }
    }

    resultado.push({
      fecha: dia.fecha,
      cols,
      manana: bTurnoTabla(dia.turnos && dia.turnos.manana),
      tarde: bTurnoTabla(dia.turnos && dia.turnos.tarde)
    })
  }

  return resultado.reverse()
})

const totales = computed(() => {
  let produccion = 0, entregado = 0
  diasTable.value.forEach(dia => {
    ;['manana', 'tarde'].forEach(v => {
      const t = dia[v]
      if (!t) return
      produccion += t.produccionTotal || 0
      entregado += (t.tiendaTotal || 0) + (t.cocinaTotal || 0) + t.revendedores.reduce((s, r) => s + (r.total || 0), 0)
    })
  })
  // Stock final = resta del último turno del día más reciente del rango.
  const ultimo = diasTable.value[0]
  const fin = ultimo ? (ultimo.tarde ? ultimo.tarde.restaTotal : (ultimo.manana ? ultimo.manana.restaTotal : 0)) : 0
  return { produccion, entregado, resta: fin, dias: diasTable.value.length }
})

const diaTotal = (dia, campo) => {
  const s = (t) => (t ? (t[campo] || 0) : 0)
  return s(dia.manana) + s(dia.tarde)
}

const diaEntregado = (dia) => {
  const s = (t) => (t ? (t.tiendaTotal || 0) + (t.cocinaTotal || 0) + t.revendedores.reduce((a, r) => a + (r.total || 0), 0) : 0)
  return s(dia.manana) + s(dia.tarde)
}

const expandedDias = ref({})
const isDiaExpanded = (fecha) => expandedDias.value[fecha] !== false
const toggleDia = (fecha) => { expandedDias.value[fecha] = isDiaExpanded(fecha) ? false : true }

watch(() => props.destinos, () => { expandedDias.value = {} })
</script>