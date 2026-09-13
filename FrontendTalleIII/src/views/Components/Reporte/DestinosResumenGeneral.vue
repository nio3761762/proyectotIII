<template>
  <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h3 class="text-lg font-bold text-gray-800">Resumen General por Producto</h3>
      <p class="text-xs text-gray-500 mt-1">Consolidado del período seleccionado: producción acumulada (stock inicial heredado + producido), entregado por destino (revendedores, tienda, cocina) y stock restante final de cada presentación.</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/40">
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[150px]">Producto</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[70px]">Pres.</th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[70px]">Inicio</th>
            <th class="p-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b text-center min-w-[80px]">Producido</th>
            <th class="p-2 text-[10px] font-black text-violet-600 uppercase tracking-widest border-b text-center min-w-[80px]">Revendedores</th>
            <th class="p-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b text-center min-w-[70px]">Tienda</th>
            <th class="p-2 text-[10px] font-black text-amber-600 uppercase tracking-widest border-b text-center min-w-[70px]">Cocina</th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[80px]">Entregado</th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[80px]">Resta Final</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key" class="hover:bg-rose-50/20 transition-colors border-b border-gray-100">
            <td class="p-3 font-medium text-gray-800">{{ row.producto }}</td>
            <td class="p-3 text-rose-600 font-bold">{{ row.pres }}</td>
            <td class="p-3 text-center font-medium text-gray-500">{{ row.inicio }}</td>
            <td class="p-3 text-center font-black text-emerald-600 bg-emerald-50/40">{{ row.producido }}</td>
            <td class="p-3 text-center font-medium text-violet-600 bg-violet-50/30">{{ row.rev }}</td>
            <td class="p-3 text-center font-medium text-blue-600 bg-blue-50/30">{{ row.tda }}</td>
            <td class="p-3 text-center font-medium text-amber-600 bg-amber-50/30">{{ row.coc }}</td>
            <td class="p-3 text-center font-bold text-gray-700">{{ row.entregado }}</td>
            <td class="p-3 text-center font-black" :class="row.resta >= 0 ? 'text-green-600' : 'text-red-600'">{{ row.resta }}</td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="9" class="p-4 text-center text-gray-400 text-sm">Sin datos para el período seleccionado.</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length > 0">
          <tr class="bg-gray-50/60">
            <td class="p-3 font-black text-gray-600 text-xs uppercase border-t-2 border-gray-200" colspan="2">Totales</td>
            <td class="p-3 text-center font-black text-gray-500 border-t-2 border-gray-200">{{ tot.inicio }}</td>
            <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-gray-200 bg-emerald-50/40">{{ tot.producido }}</td>
            <td class="p-3 text-center font-black text-violet-700 border-t-2 border-gray-200 bg-violet-50/30">{{ tot.rev }}</td>
            <td class="p-3 text-center font-black text-blue-700 border-t-2 border-gray-200 bg-blue-50/30">{{ tot.tda }}</td>
            <td class="p-3 text-center font-black text-amber-700 border-t-2 border-gray-200 bg-amber-50/30">{{ tot.coc }}</td>
            <td class="p-3 text-center font-black text-gray-800 border-t-2 border-gray-200">{{ tot.entregado }}</td>
            <td class="p-3 text-center font-black border-t-2 border-gray-200" :class="tot.resta >= 0 ? 'text-green-700' : 'text-red-700'">{{ tot.resta }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  destinos: { type: Array, default: () => [] }
})

const esUnidadPres = (pres) => {
  const p = String(pres || '').trim()
  return p === 'Unidad' || p === 'S/N' || p === ''
}

const unitLabel = (u) => (u && String(u.abreviatura || '').trim())
  ? String(u.abreviatura).trim()
  : (u ? (u.presentacion || 'Unidad') : '')

const redondear = (v) => Math.round((Number(v) || 0) * 100) / 100

const sumObj = (obj) => {
  const t = {}
  Object.entries(obj || {}).forEach(([k, v]) => { t[k] = (t[k] || 0) + Number(v || 0) })
  return t
}

// Procesa el período en orden ascendente igual que la tabla diaria (arrastre de
// la Resta, absorción de presentaciones compuestas) para acumular totales por
// presentación y dejar el stock restante final de cada una.
const resumen = computed(() => {
  const ordenado = [...(props.destinos || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const carryRest = {}
  const accu = {}

  for (const dia of ordenado) {
    const flats = Object.entries(dia.unidades || {}).map(([k, m]) => ({ ...m, key: k }))

    for (const t of ['manana', 'tarde']) {
      const tr = (dia.turnos || {})[t]
      if (!tr) continue

      const prodMap = sumObj(tr.produccion)
      const tdaMap = sumObj(tr.tienda)
      const cocMap = sumObj(tr.cocina)
      const revT = {}
      ;(tr.revendedores || []).forEach(r => {
        const d = sumObj(r.detalle)
        Object.entries(d).forEach(([k, v]) => { revT[k] = (revT[k] || 0) + v })
      })

      const perKey = {}
      flats.forEach(u => {
        perKey[u.key] = {
          inicio: Number(carryRest[u.key]) || 0,
          producido: prodMap[u.key] || 0,
          ent: (revT[u.key] || 0) + (tdaMap[u.key] || 0) + (cocMap[u.key] || 0),
          consumo: 0,
          consumida: false
        }
      })

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

      flats.forEach(u => {
        const p = perKey[u.key]
        const rest = p.consumida ? 0 : redondear(p.inicio + p.producido - p.ent - (p.consumo / (Number(u.factor) || 1)))
        carryRest[u.key] = rest

        let a = accu[u.key]
        if (!a) {
          a = { key: u.key, idproducto: u.idproducto, producto: u.producto || 'Sin nombre', presentacion: u.presentacion || 'Unidad', abreviatura: u.abreviatura || '', factor: Number(u.factor) || 1, inicio: 0, inicioSet: false, producido: 0, rev: 0, tda: 0, coc: 0 }
          accu[u.key] = a
        }
        if (!a.inicioSet) { a.inicio = redondear(p.inicio); a.inicioSet = true }
        a.producido = redondear(a.producido + p.producido)
        a.rev = redondear(a.rev + (revT[u.key] || 0))
        a.tda = redondear(a.tda + (tdaMap[u.key] || 0))
        a.coc = redondear(a.coc + (cocMap[u.key] || 0))
      })
    }
  }

  const tot = { inicio: 0, producido: 0, rev: 0, tda: 0, coc: 0 }
  const out = Object.values(accu).map(a => {
    const entregado = redondear(a.rev + a.tda + a.coc)
    const resta = redondear(Number(carryRest[a.key]) || 0)
    tot.inicio += a.inicio
    tot.producido += a.producido
    tot.rev += a.rev
    tot.tda += a.tda
    tot.coc += a.coc
    return { ...a, pres: unitLabel(a), entregado, resta }
  })
  out.sort((a, b) => b.producido - a.producido)

  return { rows: out, tot: { ...tot, entregado: redondear(tot.rev + tot.tda + tot.coc), resta: redondear(Object.keys(accu).reduce((s, k) => s + (Number(carryRest[k]) || 0), 0)) } }
})

const rows = computed(() => resumen.value.rows)
const tot = computed(() => resumen.value.tot)
</script>