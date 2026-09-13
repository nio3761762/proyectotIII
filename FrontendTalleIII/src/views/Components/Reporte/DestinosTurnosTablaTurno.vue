<template>
  <div class="overflow-hidden rounded-2xl border border-gray-200">
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
      <h4 class="text-sm font-black text-gray-700 uppercase tracking-widest">{{ titulo }}</h4>
      <p v-if="!turno" class="text-[11px] text-gray-400 mt-0.5">Sin datos en este turno</p>
    </div>
    <div v-if="turno" class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/40">
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[110px]" rowspan="2">Destino</th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[90px]" rowspan="2">Tipo</th>
            <th v-for="col in cols" :key="'dc-'+col.idproducto" :colspan="col.units.length"
                class="p-2 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b text-center bg-gradient-to-r from-rose-50 to-orange-50">
              {{ col.producto }}
            </th>
            <th class="p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[80px]" rowspan="2">Total</th>
          </tr>
          <tr class="bg-gray-50/40">
            <th v-for="u in turno.flats" :key="'du-'+u.key"
                class="p-2 text-[10px] font-black text-rose-600 uppercase tracking-widest border-b text-center bg-gray-50/60 min-w-[46px]">
              {{ unitLabel(u) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Producción -->
          <tr class="bg-emerald-50/50">
            <td class="p-2 text-[11px] font-black text-emerald-700 uppercase tracking-wider">Producción</td>
            <td class="p-2 text-[10px] font-bold text-gray-400">Inicio + Prod.</td>
            <td v-for="(v, i) in turno.produccion" :key="'dp-'+i" class="p-2 text-center font-bold text-emerald-700">{{ v }}</td>
            <td class="p-2 text-center font-black text-emerald-800 bg-emerald-100/60">{{ turno.produccionTotal }}</td>
          </tr>
          <!-- Revendedores -->
          <tr v-for="(r, ri) in turno.revendedores" :key="'rev-'+ri">
            <td class="p-2 text-[11px] font-bold text-gray-700 whitespace-nowrap">{{ r.nombre }}</td>
            <td class="p-2 text-[10px] font-bold text-gray-400">Entregado</td>
            <td v-for="(v, i) in r.flat" :key="'dr-'+ri+'-'+i" class="p-2 text-center font-medium text-gray-600">{{ v }}</td>
            <td class="p-2 text-center font-black text-violet-700">{{ r.total }}</td>
          </tr>
          <!-- Tienda -->
          <tr class="bg-blue-50/40">
            <td class="p-2 text-[11px] font-black text-blue-700 uppercase tracking-wider">Tienda</td>
            <td class="p-2 text-[10px] font-bold text-gray-400">Transferencia</td>
            <td v-for="(v, i) in turno.tienda" :key="'dt-'+i" class="p-2 text-center font-medium text-gray-600">{{ v }}</td>
            <td class="p-2 text-center font-black text-blue-700 bg-blue-100/60">{{ turno.tiendaTotal }}</td>
          </tr>
          <!-- Cocina -->
          <tr class="bg-amber-50/40">
            <td class="p-2 text-[11px] font-black text-amber-700 uppercase tracking-wider">Cocina</td>
            <td class="p-2 text-[10px] font-bold text-gray-400">Pedidos</td>
            <td v-for="(v, i) in turno.cocina" :key="'dcoc-'+i" class="p-2 text-center font-medium text-gray-600">{{ v }}</td>
            <td class="p-2 text-center font-black text-amber-700 bg-amber-100/60">{{ turno.cocinaTotal }}</td>
          </tr>
          <!-- Resta -->
          <tr class="bg-orange-50/60">
            <td class="p-2 text-[11px] font-black text-gray-700 uppercase tracking-wider">Resta</td>
            <td class="p-2 text-[10px] font-bold text-gray-400">Stock que queda</td>
            <td v-for="(v, i) in turno.resta" :key="'drest-'+i" class="p-2 text-center font-black" :class="v >= 0 ? 'text-gray-700' : 'text-red-600'">{{ v }}</td>
            <td class="p-2 text-center font-black" :class="turno.restaTotal >= 0 ? 'text-gray-800' : 'text-red-600'">{{ turno.restaTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, default: '' },
  turno: { type: Object, default: null },
  cols: { type: Array, default: () => [] }
})

const unitLabel = (u) => (u && String(u.abreviatura || '').trim())
  ? String(u.abreviatura).trim()
  : (u ? (u.presentacion || 'Unidad') : '')
</script>