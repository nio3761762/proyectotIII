<template>
  <div class="space-y-8">
    <div class="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl">
      <p class="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Totales Globales</p>
      <div class="flex items-center gap-10">
        <div>
          <p class="text-xl font-black">{{ resumen.total_producido }} uds.</p>
          <p class="text-[10px] opacity-80">Total Producido</p>
        </div>
        <div>
          <p class="text-xl font-black">{{ resumen.total_vendido }} uds.</p>
          <p class="text-[10px] opacity-80">Total Vendido</p>
        </div>
        <div>
          <p class="text-xl font-black" :class="diferenciaClase">{{ resumen.diferencia_total >= 0 ? '+' : '' }}{{ resumen.diferencia_total }}</p>
          <p class="text-[10px] opacity-80">Diferencia</p>
        </div>
      </div>
    </div>

    <div v-if="detalleDiario.length > 0" class="space-y-8">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Producción vs Venta {{ agruparPorSemana ? 'por Semana' : 'por Día' }}</h3>
        <div class="relative" style="height: 260px;">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800">Total por Producto</h3>
        </div>
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/30">
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[200px]">Producto</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Producido</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[110px]">Vendido Tienda</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[110px]">Vendido Rev.</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Total Vendido</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Diferencia</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">% Vendido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in productRows" :key="item.idproducto"
                class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
              <td class="p-3 font-medium text-gray-800">{{ item.producto }}</td>
              <td class="p-3 text-center font-black text-emerald-600">{{ item.cantidad_producida }}</td>
              <td class="p-3 text-center font-medium text-blue-600">{{ item.cantidad_vendida_tienda }}</td>
              <td class="p-3 text-center font-medium text-purple-600">{{ item.cantidad_vendida_revendedor }}</td>
              <td class="p-3 text-center font-black text-gray-700">{{ item.cantidad_vendida_total }}</td>
              <td class="p-3 text-center font-black" :class="item.diferencia >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ item.diferencia >= 0 ? '+' : '' }}{{ item.diferencia }}
              </td>
              <td class="p-3 text-center font-black text-gray-700">{{ item.porcentaje }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-orange-50/50">
              <td class="p-3 font-black text-gray-600 text-xs uppercase border-t-2 border-orange-200">Totales</td>
              <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-orange-200">{{ resumen.total_producido }}</td>
              <td class="p-3 text-center font-black text-blue-700 border-t-2 border-orange-200">{{ resumen.total_vendido_tienda }}</td>
              <td class="p-3 text-center font-black text-purple-700 border-t-2 border-orange-200">{{ resumen.total_vendido_revendedor }}</td>
              <td class="p-3 text-center font-black text-gray-800 border-t-2 border-orange-200">{{ resumen.total_vendido }}</td>
              <td class="p-3 text-center font-black border-t-2 border-orange-200" :class="resumen.diferencia_total >= 0 ? 'text-green-700' : 'text-red-700'">
                {{ resumen.diferencia_total >= 0 ? '+' : '' }}{{ resumen.diferencia_total }}
              </td>
              <td class="p-3 text-center font-black text-gray-700 border-t-2 border-orange-200">{{ totalPorcentaje }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl">
        <p class="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-3">Ganancias / Balance</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p class="text-[10px] opacity-80">Ingreso Tienda</p>
            <p class="text-xl font-black">{{ formatMoney(ganancias.ingreso_tienda) }}</p>
            <p class="text-[9px] opacity-70 mt-1">Ventas en tienda</p>
          </div>
          <div>
            <p class="text-[10px] opacity-80 flex items-center gap-1">Gasto Extra <span class="font-black">(−)</span></p>
            <p class="text-xl font-black">{{ formatMoney(ganancias.gasto_extra) }}</p>
            <p class="text-[9px] opacity-70 mt-1">Descuento a la tienda</p>
          </div>
          <div>
            <p class="text-[10px] opacity-80">Neto Tienda</p>
            <p class="text-xl font-black">{{ formatMoney(ganancias.neto_tienda) }}</p>
            <p class="text-[9px] opacity-70 mt-1">Ingreso − Gasto Extra</p>
          </div>
          <div>
            <p class="text-[10px] opacity-80 flex items-center gap-1">Líquido Revendedor <span class="font-black">(+)</span></p>
            <p class="text-xl font-black">{{ formatMoney(ganancias.liquido_revendedor) }}</p>
            <p class="text-[9px] opacity-70 mt-1">Ganancia de los revendedores</p>
          </div>
          <div>
            <p class="text-[10px] opacity-80 flex items-center gap-1">Gasto Extra Rev. <span class="font-black">(−)</span></p>
            <p class="text-xl font-black">{{ formatMoney(ganancias.gasto_extra_revendedor) }}</p>
            <p class="text-[9px] opacity-70 mt-1">Gasto extra de la liquidación</p>
          </div>
          <div>
            <p class="text-[10px] opacity-80">Neto Revendedor</p>
            <p class="text-xl font-black">{{ formatMoney(ganancias.neto_revendedor) }}</p>
            <p class="text-[9px] opacity-70 mt-1">Líquido − Gasto Extra Rev.</p>
          </div>
          <div class="bg-white/15 rounded-2xl p-3 flex flex-col justify-center col-span-2 md:col-span-2">
            <p class="text-[10px] opacity-90">Ganancia Total</p>
            <p class="text-3xl font-black">{{ formatMoney(ganancias.ganancia_total) }}</p>
            <p class="text-[9px] opacity-70 mt-1">Neto Tienda + Neto Revendedor</p>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800">Producción y Venta por Presentación</h3>
        </div>
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/30">
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[180px]">Producto</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[110px]">Presentación</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Producido</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Descartado</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Vend. Tienda</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Ing. Tienda</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Vend. Rev.</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Ing. Rev.</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[110px]">Gasto Extra Rev.</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[110px]">Total Venta</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Total Vend.</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">Diferencia</th>
              <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">% Vendido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in porPresentacionRows" :key="item.key"
                class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
              <td class="p-3 font-medium text-gray-800">{{ item.producto }}</td>
              <td class="p-3 text-gray-500">{{ item.presentacion }}</td>
              <td class="p-3 text-center font-black text-emerald-600">{{ item.cantidad_producida }}</td>
              <td class="p-3 text-center font-medium text-red-500">{{ item.cantidad_descartada }}</td>
              <td class="p-3 text-center font-medium text-blue-600">{{ item.cantidad_vendida_tienda }}</td>
              <td class="p-3 text-center font-medium text-gray-700">{{ formatMoney(item.total_venta_tienda) }}</td>
              <td class="p-3 text-center font-medium text-purple-600">{{ item.cantidad_vendida_revendedor }}</td>
              <td class="p-3 text-center font-black text-gray-700">{{ formatMoney(item.total_venta_revendedor) }}</td>
              <td class="p-3 text-center font-black text-red-600">{{ formatMoney(item.gasto_extra_revendedor) }}</td>
              <td class="p-3 text-center font-black text-emerald-700">{{ formatMoney(item.total_venta) }}</td>
              <td class="p-3 text-center font-black text-gray-700">{{ item.cantidad_vendida_total }}</td>
              <td class="p-3 text-center font-black" :class="item.diferencia >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ item.diferencia >= 0 ? '+' : '' }}{{ item.diferencia }}
              </td>
              <td class="p-3 text-center font-black text-gray-700">{{ item.porcentaje }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-orange-50/50">
              <td class="p-3 font-black text-gray-600 text-xs uppercase border-t-2 border-orange-200" colspan="2">Totales</td>
              <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-orange-200">{{ resumenPorPresentacion.total_producido }}</td>
              <td class="p-3 text-center font-black text-red-600 border-t-2 border-orange-200">{{ resumenPorPresentacion.total_descartado }}</td>
              <td class="p-3 text-center font-black text-blue-700 border-t-2 border-orange-200">{{ resumenPorPresentacion.total_vendido_tienda }}</td>
              <td class="p-3 text-center font-black text-gray-800 border-t-2 border-orange-200">{{ formatMoney(resumenPorPresentacion.total_ingreso_tienda) }}</td>
              <td class="p-3 text-center font-black text-purple-700 border-t-2 border-orange-200">{{ resumenPorPresentacion.total_vendido_revendedor }}</td>
              <td class="p-3 text-center font-black text-gray-800 border-t-2 border-orange-200">{{ formatMoney(resumenPorPresentacion.total_venta_revendedor) }}</td>
              <td class="p-3 text-center font-black text-red-600 border-t-2 border-orange-200">{{ formatMoney(resumenPorPresentacion.total_gasto_extra_revendedor) }}</td>
              <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-orange-200">{{ formatMoney(resumenPorPresentacion.total_venta) }}</td>
              <td class="p-3 text-center font-black text-gray-800 border-t-2 border-orange-200">{{ resumenPorPresentacion.total_vendido }}</td>
              <td class="p-3 text-center font-black border-t-2 border-orange-200" :class="resumenPorPresentacion.diferencia_total >= 0 ? 'text-green-700' : 'text-red-700'">
                {{ resumenPorPresentacion.diferencia_total >= 0 ? '+' : '' }}{{ resumenPorPresentacion.diferencia_total }}
              </td>
              <td class="p-3 text-center font-black text-gray-700 border-t-2 border-orange-200">{{ totalPorcentajePresentacion }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-if="agruparPorSemana" class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800">Resumen por Semana</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Semana</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Producido</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Diferencia</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">% Vendido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in weeklySummaryRows" :key="row.key"
                  class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
                <td class="p-3 font-bold text-gray-700">{{ row.label }}</td>
                <td class="p-3 text-center font-black text-emerald-600">{{ row.producido }}</td>
                <td class="p-3 text-center font-black text-blue-600">{{ row.vendido }}</td>
                <td class="p-3 text-center font-black" :class="row.diferencia >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ row.diferencia >= 0 ? '+' : '' }}{{ row.diferencia }}
                </td>
                <td class="p-3 text-center font-black text-gray-700">{{ row.porcentaje }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-orange-50/50">
                <td class="p-3 font-black text-gray-600 text-xs uppercase border-t-2 border-orange-200">Totales</td>
                <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-orange-200">{{ weeklySummaryTotals.producido }}</td>
                <td class="p-3 text-center font-black text-blue-700 border-t-2 border-orange-200">{{ weeklySummaryTotals.vendido }}</td>
                <td class="p-3 text-center font-black border-t-2 border-orange-200" :class="weeklySummaryTotals.diferencia >= 0 ? 'text-green-700' : 'text-red-700'">
                  {{ weeklySummaryTotals.diferencia >= 0 ? '+' : '' }}{{ weeklySummaryTotals.diferencia }}
                </td>
                <td class="p-3 text-center font-black text-gray-700 border-t-2 border-orange-200">{{ weeklySummaryTotals.porcentaje }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div v-if="agruparPorSemana" class="space-y-4">
        <div v-for="sem in weeklyGroups" :key="sem.semana" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(sem.semana)">
            <div class="flex items-center gap-3">
              <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.semana] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
              <span class="text-xs text-gray-400">|</span>
              <span class="text-sm text-gray-500">{{ sem.dias.length }} días</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Producido</p>
                <p class="text-sm font-black text-emerald-600">{{ sem.totalProducido }} uds.</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Vendido</p>
                <p class="text-sm font-black text-blue-600">{{ sem.totalVendido }} uds.</p>
              </div>
            </div>
          </div>
          <div v-if="expandedSemanas[sem.semana]" class="p-4 space-y-6">
            <div class="bg-gradient-to-r from-orange-50/50 to-amber-50/30 rounded-2xl border border-gray-200 overflow-hidden">
              <div class="p-3 border-b border-gray-100">
                <h4 class="font-bold text-gray-700 text-sm">Total por Producto (Semana)</h4>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50/30">
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[180px]">Producto</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Producido</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido Tienda</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido Rev.</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Total Vendido</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Diferencia</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">% Vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in getWeeklyProductRows(sem.dias)" :key="item.idproducto" class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
                      <td class="p-3 font-medium text-gray-800">{{ item.producto }}</td>
                      <td class="p-3 text-center font-black text-emerald-600">{{ item.cantidad_producida }}</td>
                      <td class="p-3 text-center font-medium text-blue-600">{{ item.cantidad_vendida_tienda }}</td>
                      <td class="p-3 text-center font-medium text-purple-600">{{ item.cantidad_vendida_revendedor }}</td>
                      <td class="p-3 text-center font-black text-gray-700">{{ item.cantidad_vendida_total }}</td>
                      <td class="p-3 text-center font-black" :class="item.diferencia >= 0 ? 'text-green-600' : 'text-red-600'">{{ item.diferencia >= 0 ? '+' : '' }}{{ item.diferencia }}</td>
                      <td class="p-3 text-center font-black text-gray-700">{{ item.porcentaje }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-for="dia in sem.dias" :key="dia.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-3">
                <h4 class="font-bold text-gray-700 text-sm">{{ formatFecha(dia.fecha) }}</h4>
                <span class="text-xs text-gray-500">|</span>
                <span class="text-xs text-emerald-600 font-bold">Prod: {{ dia.total_producido }}</span>
                <span class="text-xs text-blue-600 font-bold">Vend: {{ dia.total_vendido }}</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50/30">
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[180px]">Producto</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Producido</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido Tienda</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido Rev.</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Total Vendido</th>
                      <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in dia.productos" :key="item.idproducto" class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
                      <td class="p-3 font-medium text-gray-800">{{ item.producto }}</td>
                      <td class="p-3 text-center font-black text-emerald-600">{{ item.cantidad_producida }}</td>
                      <td class="p-3 text-center font-medium text-blue-600">{{ item.cantidad_vendida_tienda }}</td>
                      <td class="p-3 text-center font-medium text-purple-600">{{ item.cantidad_vendida_revendedor }}</td>
                      <td class="p-3 text-center font-black text-gray-700">{{ item.cantidad_vendida_total }}</td>
                      <td class="p-3 text-center font-black" :class="item.diferencia >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ item.diferencia >= 0 ? '+' : '' }}{{ item.diferencia }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div v-for="dia in sortedDiario" :key="dia.fecha" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleDia(dia.fecha)">
            <div class="flex items-center gap-3">
              <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedDias[dia.fecha] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              <h3 class="font-bold text-gray-800 text-lg">{{ formatFecha(dia.fecha) }}</h3>
              <span class="text-xs text-gray-400">|</span>
              <span class="text-xs text-emerald-600 font-bold">Prod: {{ dia.total_producido }}</span>
              <span class="text-xs text-blue-600 font-bold">Vend: {{ dia.total_vendido }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button @click.stop="expandAllDias" class="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg transition-colors">Expandir</button>
              <button @click.stop="collapseAllDias" class="text-[10px] font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded-lg transition-colors">Contraer</button>
            </div>
          </div>
          <div v-if="expandedDias[dia.fecha]" class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/30">
                  <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[180px]">Producto</th>
                  <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Producido</th>
                  <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido Tienda</th>
                  <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido Rev.</th>
                  <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Total Vendido</th>
                  <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in dia.productos" :key="item.idproducto" class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
                  <td class="p-3 font-medium text-gray-800">{{ item.producto }}</td>
                  <td class="p-3 text-center font-black text-emerald-600">{{ item.cantidad_producida }}</td>
                  <td class="p-3 text-center font-medium text-blue-600">{{ item.cantidad_vendida_tienda }}</td>
                  <td class="p-3 text-center font-medium text-purple-600">{{ item.cantidad_vendida_revendedor }}</td>
                  <td class="p-3 text-center font-black text-gray-700">{{ item.cantidad_vendida_total }}</td>
                  <td class="p-3 text-center font-black" :class="item.diferencia >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ item.diferencia >= 0 ? '+' : '' }}{{ item.diferencia }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/30">
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b min-w-[200px]">Producto</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Producido</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Vendido Tienda</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[120px]">Vendido Revendedor</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Total Vendido</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[100px]">Diferencia</th>
            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[90px]">% Vendido</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in productRowsFallback" :key="item.idproducto"
              class="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
            <td class="p-3 font-medium text-gray-800">{{ item.producto }}</td>
            <td class="p-3 text-center font-black text-emerald-600">{{ item.cantidad_producida }}</td>
            <td class="p-3 text-center font-medium text-blue-600">{{ item.cantidad_vendida_tienda }}</td>
            <td class="p-3 text-center font-medium text-purple-600">{{ item.cantidad_vendida_revendedor }}</td>
            <td class="p-3 text-center font-black text-gray-700">{{ item.cantidad_vendida_total }}</td>
            <td class="p-3 text-center font-black" :class="item.diferencia >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ item.diferencia >= 0 ? '+' : '' }}{{ item.diferencia }}
            </td>
            <td class="p-3 text-center font-black text-gray-700">{{ item.porcentaje }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-orange-50/50">
            <td class="p-3 font-black text-gray-600 text-xs uppercase border-t-2 border-orange-200">Totales</td>
            <td class="p-3 text-center font-black text-emerald-700 border-t-2 border-orange-200">{{ resumen.total_producido }}</td>
            <td class="p-3 text-center font-black text-blue-700 border-t-2 border-orange-200">{{ resumen.total_vendido_tienda }}</td>
            <td class="p-3 text-center font-black text-purple-700 border-t-2 border-orange-200">{{ resumen.total_vendido_revendedor }}</td>
            <td class="p-3 text-center font-black text-gray-800 border-t-2 border-orange-200">{{ resumen.total_vendido }}</td>
            <td class="p-3 text-center font-black border-t-2 border-orange-200" :class="resumen.diferencia_total >= 0 ? 'text-green-700' : 'text-red-700'">
              {{ resumen.diferencia_total >= 0 ? '+' : '' }}{{ resumen.diferencia_total }}
            </td>
            <td class="p-3 text-center font-black text-gray-700 border-t-2 border-orange-200">{{ totalPorcentaje }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getWeekStart as sharedWeekStart, getWeekLabel as sharedWeekLabel } from './useSemana'

Chart.register(...registerables)

const props = defineProps({
  detalle: { type: Array, default: () => [] },
  detalleDiario: { type: Array, default: () => [] },
  resumen: { type: Object, default: () => ({ total_producido: 0, total_vendido_tienda: 0, total_vendido_revendedor: 0, total_vendido: 0, diferencia_total: 0 }) },
  porPresentacion: { type: Array, default: () => [] },
  ganancias: { type: Object, default: () => ({ ingreso_tienda: 0, gasto_extra: 0, neto_tienda: 0, liquido_revendedor: 0, gasto_extra_revendedor: 0, neto_revendedor: 0, gasto_extra_total: 0, ganancia_total: 0, balance: 0 }) },
  resumenPorPresentacion: { type: Object, default: () => ({ total_producido: 0, total_descartado: 0, total_vendido_tienda: 0, total_ingreso_tienda: 0, total_vendido_revendedor: 0, total_venta_revendedor: 0, total_gasto_extra_revendedor: 0, total_venta: 0, total_vendido: 0, diferencia_total: 0 }) },
  formatFecha: { type: Function, default: (f) => f },
  agruparPorSemana: { type: Boolean, default: false }
})

const chartCanvas = ref(null)
let chartInstance = null

const diferenciaClase = computed(() => {
  const d = props.resumen.diferencia_total || 0
  return d >= 0 ? 'text-green-300' : 'text-red-300'
})

const getWeekStart = (dateStr) => sharedWeekStart(dateStr)

const getWeekLabel = (weekStartStr) => sharedWeekLabel(weekStartStr)

const sortedDiario = computed(() => {
  return [...props.detalleDiario].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const weeklyGroups = computed(() => {
  const weeks = {}
  props.detalleDiario.forEach(dia => {
    const weekStart = getWeekStart(dia.fecha)
    if (!weeks[weekStart]) {
      weeks[weekStart] = { semana: weekStart, semanaLabel: getWeekLabel(weekStart), dias: [], totalProducido: 0, totalVendido: 0 }
    }
    weeks[weekStart].dias.push(dia)
    weeks[weekStart].totalProducido += dia.total_producido || 0
    weeks[weekStart].totalVendido += dia.total_vendido || 0
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana))
})

const calcPct = (prod, vend) => {
  if (!prod || prod === 0) return '—'
  return ((vend / prod) * 100).toFixed(1) + '%'
}

const summaryRows = computed(() => {
  if (props.agruparPorSemana) {
    return weeklyGroups.value.map(w => ({
      key: w.semana,
      label: w.semanaLabel,
      producido: w.totalProducido,
      vendido: w.totalVendido,
      diferencia: w.totalProducido - w.totalVendido,
      porcentaje: calcPct(w.totalProducido, w.totalVendido)
    }))
  }
  return sortedDiario.value.map(d => ({
    key: d.fecha,
    label: props.formatFecha(d.fecha),
    producido: d.total_producido,
    vendido: d.total_vendido,
    diferencia: (d.total_producido || 0) - (d.total_vendido || 0),
    porcentaje: calcPct(d.total_producido, d.total_vendido)
  }))
})

const summaryTotals = computed(() => {
  const prod = summaryRows.value.reduce((s, r) => s + (r.producido || 0), 0)
  const vend = summaryRows.value.reduce((s, r) => s + (r.vendido || 0), 0)
  return { producido: prod, vendido: vend, diferencia: prod - vend, porcentaje: calcPct(prod, vend) }
})

const weeklySummaryRows = computed(() => {
  return weeklyGroups.value.map(w => ({
    key: w.semana,
    label: w.semanaLabel,
    producido: w.totalProducido,
    vendido: w.totalVendido,
    diferencia: w.totalProducido - w.totalVendido,
    porcentaje: calcPct(w.totalProducido, w.totalVendido)
  }))
})

const weeklySummaryTotals = computed(() => {
  const prod = weeklySummaryRows.value.reduce((s, r) => s + (r.producido || 0), 0)
  const vend = weeklySummaryRows.value.reduce((s, r) => s + (r.vendido || 0), 0)
  return { producido: prod, vendido: vend, diferencia: prod - vend, porcentaje: calcPct(prod, vend) }
})

const productRows = computed(() => {
  return props.detalle.map(item => ({
    ...item,
    porcentaje: calcPct(item.cantidad_producida, item.cantidad_vendida_total)
  }))
})

const totalPorcentaje = computed(() => calcPct(props.resumen.total_producido, props.resumen.total_vendido))

const formatMoney = (v) => '$' + Number(v || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const porPresentacionRows = computed(() => {
  return props.porPresentacion.map((item, i) => ({
    ...item,
    key: (item.idproductomedida || 'prod') + '-' + i,
    porcentaje: calcPct(item.cantidad_producida, item.cantidad_vendida_total)
  }))
})

const totalPorcentajePresentacion = computed(() => calcPct(props.resumenPorPresentacion.total_producido, props.resumenPorPresentacion.total_vendido))

const productRowsFallback = computed(() => {
  return props.detalle.map(item => ({
    ...item,
    porcentaje: calcPct(item.cantidad_producida, item.cantidad_vendida_total)
  }))
})

const chartLabels = computed(() => summaryRows.value.map(r => r.label))
const chartProducido = computed(() => summaryRows.value.map(r => r.producido))
const chartVendido = computed(() => summaryRows.value.map(r => r.vendido))

const renderChart = () => {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  if (!chartCanvas.value || chartLabels.value.length === 0) return

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: chartLabels.value,
      datasets: [
        {
          label: 'Producido',
          data: chartProducido.value,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'Vendido',
          data: chartVendido.value,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => v + ' uds.' } }
      }
    }
  })
}

watch(() => props.detalleDiario, () => nextTick(() => renderChart()), { deep: true })
watch(() => props.agruparPorSemana, () => nextTick(() => renderChart()))
onMounted(() => nextTick(() => setTimeout(renderChart, 200)))
onBeforeUnmount(() => { if (chartInstance) chartInstance.destroy() })

const expandedDias = ref({})
const toggleDia = (fecha) => { expandedDias.value[fecha] = !expandedDias.value[fecha] }
const expandAllDias = () => { props.detalleDiario.forEach(d => { expandedDias.value[d.fecha] = true }) }
const collapseAllDias = () => { Object.keys(expandedDias.value).forEach(k => { expandedDias.value[k] = false }) }

const getWeeklyProductRows = (dias) => {
  const map = {}
  dias.forEach(dia => {
    ;(dia.productos || []).forEach(p => {
      const id = p.idproducto
      if (!map[id]) {
        map[id] = { ...p, cantidad_producida: 0, cantidad_vendida_tienda: 0, cantidad_vendida_revendedor: 0, cantidad_vendida_total: 0, diferencia: 0 }
      }
      map[id].cantidad_producida += p.cantidad_producida || 0
      map[id].cantidad_vendida_tienda += p.cantidad_vendida_tienda || 0
      map[id].cantidad_vendida_revendedor += p.cantidad_vendida_revendedor || 0
      map[id].cantidad_vendida_total += p.cantidad_vendida_total || 0
      map[id].diferencia = map[id].cantidad_producida - map[id].cantidad_vendida_total
    })
  })
  return Object.values(map).map(item => ({
    ...item,
    porcentaje: calcPct(item.cantidad_producida, item.cantidad_vendida_total)
  }))
}

const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

defineExpose({
  expandAllSemanas: () => {
    weeklyGroups.value.forEach(sem => { expandedSemanas.value[sem.semana] = true })
  },
  collapseAllSemanas: () => {
    Object.keys(expandedSemanas.value).forEach(k => { expandedSemanas.value[k] = false })
  }
})
</script>
