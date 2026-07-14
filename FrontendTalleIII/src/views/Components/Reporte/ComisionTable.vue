<template>
  <div class="space-y-10">
    <!-- === RESUMEN SEMANAL (Acordeón) === -->
    <div v-if="props.agruparPorSemana" class="space-y-4">
      <div v-if="weeklyChartLabels.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Evolución por Semana</h3>
        <div class="relative" style="height: 220px;">
          <canvas ref="generalWeekChartRef"></canvas>
        </div>
      </div>
      <div v-for="sem in processedDetallado" :key="sem.fecha" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(sem.fecha)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.fecha] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
            <span class="text-xs text-gray-400">|</span>
            <span class="text-sm text-gray-500">{{ sem.controles.length }} controles</span>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Comisión Total</p>
              <p class="text-sm font-black text-blue-600">{{ formatCurrency(sem.controles.reduce((s,c) => s + parseFloat(c.total_comision||0), 0)) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Líq. Panadería</p>
              <p class="text-sm font-black text-emerald-600">{{ formatCurrency(sem.controles.reduce((s,c) => s + parseFloat(c.total_liquido_panaderia||0), 0)) }}</p>
            </div>
          </div>
        </div>
        <div v-if="expandedSemanas[sem.fecha]" class="p-6 space-y-6">
          <!-- Resumen de Comisiones -->
          <div class="overflow-x-auto">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-emerald-100 rounded-xl">
                <BarChart3 class="h-5 w-5 text-emerald-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Resumen de Comisiones</h4>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm" style="min-width: 600px;">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/30">
                    <th rowspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r min-w-[160px]">Empleado</th>
                    <th v-for="prod in weeklyConsolidados[sem.fecha]?.productosUnicos || []" :key="prod"
                        class="p-3 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-r text-center min-w-[90px]">
                      <div class="flex flex-col items-center">
                        <span class="text-gray-600">{{ prod }}</span>
                        <span class="text-[8px] text-gray-400 font-normal normal-case mt-0.5">(cant.)</span>
                      </div>
                    </th>
                    <th colspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[130px]">Totales</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="emp in weeklyConsolidados[sem.fecha]?.empleados || []" :key="emp.idempleado" class="hover:bg-orange-50/30 transition-colors">
                    <td class="p-3 border-b border-r font-bold text-gray-800 text-sm">
                      <div class="flex items-center gap-1.5">
                        <User class="h-4 w-4 text-orange-500 shrink-0" />
                        <span class="truncate">{{ emp.empleado }}</span>
                      </div>
                    </td>
                    <td v-for="prod in weeklyConsolidados[sem.fecha]?.productosUnicos || []" :key="prod" class="p-3 border-b border-r text-center text-sm font-bold text-gray-800">
                      {{ emp.productoMap[prod] ?? '-' }}
                    </td>
                    <td class="p-3 border-b text-right">
                      <div class="flex flex-col">
                        <span class="text-[9px] text-gray-400 font-bold uppercase">Comisión</span>
                        <span class="text-sm font-black text-blue-600">{{ Number(emp.total_comision).toFixed(2) }}</span>
                      </div>
                    </td>
                    <td class="p-3 border-b text-right">
                      <div class="flex flex-col">
                        <span class="text-[9px] text-gray-400 font-bold uppercase">Panadería</span>
                        <span class="text-sm font-black text-emerald-600">{{ Number(emp.total_liquido_panaderia).toFixed(2) }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="(weeklyConsolidados[sem.fecha]?.empleados?.length || 0) > 1">
                  <tr class="bg-orange-50/50">
                    <td class="p-3 border-t-2 border-orange-200 font-black text-gray-600 text-xs uppercase">Totales</td>
                    <td v-for="prod in weeklyConsolidados[sem.fecha]?.productosUnicos || []" :key="prod" class="p-3 border-t-2 border-orange-200 text-center font-black">
                      {{ weeklyConsolidados[sem.fecha]?.totalPorProducto[prod] ?? '-' }}
                    </td>
                    <td class="p-3 border-t-2 border-orange-200 text-right">
                      <span class="font-black text-blue-600">{{ weeklyConsolidados[sem.fecha]?.totalComisionGlobal.toFixed(2) }}</span>
                    </td>
                    <td class="p-3 border-t-2 border-orange-200 text-right">
                      <span class="font-black text-emerald-600">{{ weeklyConsolidados[sem.fecha]?.totalLiquidoGlobal.toFixed(2) }}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div v-if="expandedSemanas[sem.fecha]" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h5 class="text-sm font-bold text-gray-700 mb-3">Distribución de la Semana</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="relative" style="height: 180px;">
                <canvas :id="'wchart-' + sem.fecha.replace(/[^a-zA-Z0-9]/g, '-')"></canvas>
              </div>
              <div class="relative" style="height: 180px;">
                <canvas :id="'wchart2-' + sem.fecha.replace(/[^a-zA-Z0-9]/g, '-')"></canvas>
              </div>
            </div>
          </div>

          <!-- Detallado por día -->
          <div v-if="getWeeklyDays(sem.fecha).length > 0">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 rounded-xl">
                <List class="h-5 w-5 text-blue-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Detallado por Día</h4>
            </div>
            <div class="space-y-4">
              <div v-for="day in getWeeklyDays(sem.fecha)" :key="day.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-3">
                  <Calendar class="h-4 w-4 text-blue-500" />
                  <span class="font-bold text-gray-700 text-sm">{{ formatFecha(day.fecha) }}</span>
                  <span class="text-xs text-gray-500">({{ day.controles.length }} controles)</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/30">
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Empleado</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Sucursal</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Entregado</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Devuelto</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Ajustado</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Precio Vta.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión Unit.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión Total</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Líq. Panadería</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="control in day.controles" :key="control.idcontrol">
                        <template v-for="(det, detIdx) in control.detalles" :key="control.idcontrol + '-' + detIdx">
                          <tr class="hover:bg-gray-50/50 transition-colors group">
                            <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-sm align-top font-bold text-gray-700 bg-gray-50/10"><span class="text-orange-600">{{ control.empleado }}</span></td>
                            <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-xs align-top text-gray-500 bg-gray-50/10">{{ control.sucursal }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm font-medium text-gray-800">
                              <button v-if="det.precios_ajustados?.length" @click="toggleAjustes(control.idcontrol + '-' + detIdx)" class="inline-flex items-center gap-1 hover:text-orange-600 transition-colors">
                                <ChevronDown v-if="isExpandedAjustes(control.idcontrol + '-' + detIdx)" class="h-3 w-3 text-orange-500" />
                                <ChevronRight v-else class="h-3 w-3 text-gray-400" />
                                <span>{{ det.producto }}</span>
                                <span class="text-[8px] text-amber-500 font-bold">({{ det.precios_ajustados.length }})</span>
                              </button>
                              <span v-else>{{ det.producto }}</span>
                            </td>
                            <td class="p-3 border-b border-gray-100 text-xs text-gray-500">{{ det.presentacion }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-center">{{ det.cantidad_entregada }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-center text-red-500">{{ det.cantidad_devuelta }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-center text-amber-600">{{ det.cantidadajustada ?? '-' }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-center font-bold text-gray-800">{{ det.cantidad_vendida }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-right">{{ Number(det.precio_venta).toFixed(2) }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-right text-blue-600">{{ Number(det.comision_unitaria).toFixed(2) }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-right font-bold text-blue-600">{{ Number(det.comision_total).toFixed(2) }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-right font-bold text-emerald-600">{{ Number(det.liquido_panaderia).toFixed(2) }}</td>
                          </tr>
                          <tr v-for="(ajuste, aIdx) in (det.precios_ajustados || [])" :key="control.idcontrol + '-ajuste-' + detIdx + '-' + aIdx" v-show="isExpandedAjustes(control.idcontrol + '-' + detIdx)" class="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                            <td class="p-2 border-b border-amber-100"></td>
                            <td class="p-2 border-b border-amber-100"></td>
                            <td colspan="2" class="p-2 pl-6 text-[10px] text-amber-700 font-bold border-b border-amber-100"><span class="inline-flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>Ajuste {{ aIdx + 1 }}{{ ajuste.observacion ? ': ' + ajuste.observacion : '' }}</span></td>
                            <td class="p-2 border-b border-amber-100"></td>
                            <td class="p-2 border-b border-amber-100"></td>
                            <td class="p-2 text-center font-bold text-amber-700 border-b border-amber-100">{{ Number(ajuste.cantidad || 0) }}</td>
                            <td class="p-2 border-b border-amber-100"></td>
                            <td class="p-2 text-right font-bold text-amber-700 border-b border-amber-100">{{ Number(ajuste.precio_venta || 0).toFixed(2) }}</td>
                            <td class="p-2 text-[10px] text-amber-600 font-semibold border-b border-amber-100" colspan="3">{{ ajuste.estado || '' }}</td>
                          </tr>
                        </template>
                        <tr class="bg-blue-50/20">
                          <td colspan="10" class="p-2 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Totales del Control:</td>
                          <td class="p-2 text-right border-b font-black text-blue-600">{{ Number(control.total_comision).toFixed(2) }}</td>
                          <td class="p-2 text-right border-b font-black text-emerald-600">{{ Number(control.total_liquido_panaderia).toFixed(2) }}</td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="processedDetallado.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- === CONSOLIDADO (Resumen) === -->
    <div v-if="consolidado && consolidado.reporte && consolidado.reporte.length && !props.agruparPorSemana" class="animate-fade-in-up space-y-10">
      <!-- Charts -->
      <div v-if="chartEmpleados.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Comisiones por Empleado</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="comisionChartRef"></canvas>
          </div>
        </div>
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Comisión vs Líquido Panadería</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="comparacionChartRef"></canvas>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-emerald-100 rounded-xl">
          <BarChart3 class="h-6 w-6 text-emerald-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-800">Resumen de Comisiones</h3>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/30">
              <th rowspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r min-w-[180px]">Empleado</th>
              <th v-for="prod in processedConsolidado.productosUnicos" :key="prod"
                  colspan="1" class="p-3 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-r text-center min-w-[100px]">
                <div class="flex flex-col items-center">
                  <span class="text-gray-600">{{ prod }}</span>
                  <span class="text-[8px] text-gray-400 font-normal normal-case mt-0.5">(cant.)</span>
                </div>
              </th>
              <th colspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[140px]">Totales</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in processedConsolidado.empleados" :key="emp.idempleado"
                class="hover:bg-orange-50/30 transition-colors">
              <td class="p-3 border-b border-r font-bold text-gray-800 text-sm">
                <div class="flex items-center gap-1.5">
                  <User class="h-4 w-4 text-orange-500 shrink-0" />
                  <span class="truncate">{{ emp.empleado }}</span>
                </div>
              </td>
              <td v-for="prod in processedConsolidado.productosUnicos" :key="prod"
                  class="p-3 border-b border-r text-center text-sm font-bold text-gray-800">
                {{ emp.productoMap[prod] ?? '-' }}
              </td>
              <td class="p-3 border-b text-right">
                <div class="flex flex-col">
                  <span class="text-[9px] text-gray-400 font-bold uppercase">Comisión</span>
                  <span class="text-sm font-black text-blue-600">{{ Number(emp.total_comision).toFixed(2) }}</span>
                </div>
              </td>
              <td class="p-3 border-b text-right">
                <div class="flex flex-col">
                  <span class="text-[9px] text-gray-400 font-bold uppercase">Panadería</span>
                  <span class="text-sm font-black text-emerald-600">{{ Number(emp.total_liquido_panaderia).toFixed(2) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="processedConsolidado.empleados.length > 1">
            <tr class="bg-orange-50/50">
              <td class="p-3 border-t-2 border-orange-200 font-black text-gray-600 text-xs uppercase">Totales</td>
              <td v-for="prod in processedConsolidado.productosUnicos" :key="prod"
                  class="p-3 border-t-2 border-orange-200 text-center font-black">
                {{ processedConsolidado.totalPorProducto[prod] ?? '-' }}
              </td>
              <td class="p-3 border-t-2 border-orange-200 text-right">
                <span class="font-black text-blue-600">{{ processedConsolidado.totalComisionGlobal.toFixed(2) }}</span>
              </td>
              <td class="p-3 border-t-2 border-orange-200 text-right">
                <span class="font-black text-emerald-600">{{ processedConsolidado.totalLiquidoGlobal.toFixed(2) }}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-if="consolidado.totalesGlobales"
           class="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl">
        <p class="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Totales Globales</p>
        <div class="flex items-center gap-10">
          <div>
            <p class="text-xl font-black">{{ Number(consolidado.totalesGlobales.total_comision_empleados).toFixed(2) }} Bs.</p>
            <p class="text-[10px] opacity-80">Comisión Empleados</p>
          </div>
          <div>
            <p class="text-xl font-black">{{ Number(consolidado.totalesGlobales.total_ganancia_panaderia).toFixed(2) }} Bs.</p>
            <p class="text-[10px] opacity-80">Ganancia Panadería</p>
          </div>
        </div>
      </div>
    </div>

    <!-- === DETALLADO === -->
    <div v-if="!props.agruparPorSemana" class="animate-fade-in-up" style="animation-delay: 0.1s">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-xl">
            <List class="h-6 w-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">Historial Detallado</h3>
        </div>

        <div v-if="detallado && detallado.totalesGlobales" class="flex gap-4">
          <div class="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-[8px] text-gray-400 uppercase font-black">Comisión Total</p>
            <p class="text-sm font-black text-blue-600">{{ Number(detallado.totalesGlobales.total_comision_empleados).toFixed(2) }} Bs.</p>
          </div>
          <div class="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-[8px] text-gray-400 uppercase font-black">Ganancia Panadería</p>
            <p class="text-sm font-black text-emerald-600">{{ Number(detallado.totalesGlobales.total_ganancia_panaderia).toFixed(2) }} Bs.</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="expandAll" class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Expandir todo</button>
          <button @click="collapseAll" class="text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Contraer todo</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="group in processedDetallado" :key="group.fecha"
             class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300">

          <button @click="toggleDate(group.fecha)"
                  class="w-full p-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-4">
              <div :class="['p-2 rounded-xl transition-transform duration-300', isExpanded(group.fecha) ? 'rotate-180 bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-200']">
                <ChevronDown class="h-5 w-5" />
              </div>
              <div class="flex flex-col items-start text-left">
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-gray-400" />
                  <span class="font-bold text-gray-700">{{ group.semanaLabel || formatFecha(group.fecha) }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ group.controles.length }} controles registrados</span>
              </div>
            </div>
          </button>

          <div v-show="isExpanded(group.fecha)" class="overflow-x-auto border-t border-gray-100">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/30">
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Empleado</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Sucursal</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Entregado</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Devuelto</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Ajustado</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Precio Vta.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión Unit.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión Total</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Líq. Panadería</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="control in group.controles" :key="control.idcontrol">
                  <template v-for="(det, detIdx) in control.detalles" :key="control.idcontrol + '-' + detIdx">
                    <tr class="hover:bg-gray-50/50 transition-colors group">
                      <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-4 border-b border-gray-100 text-sm align-top font-bold text-gray-700 bg-gray-50/10">
                        <span class="text-orange-600">{{ control.empleado }}</span>
                      </td>
                      <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-4 border-b border-gray-100 text-xs align-top text-gray-500 bg-gray-50/10">
                        {{ control.sucursal }}
                      </td>
                      <td class="p-4 border-b border-gray-100 text-sm font-medium text-gray-800">
                        <button v-if="det.precios_ajustados?.length" @click="toggleAjustes(control.idcontrol + '-' + detIdx)" class="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                          <ChevronDown v-if="isExpandedAjustes(control.idcontrol + '-' + detIdx)" class="h-3.5 w-3.5 text-orange-500" />
                          <ChevronRight v-else class="h-3.5 w-3.5 text-gray-400" />
                          <span>{{ det.producto }}</span>
                          <span class="text-[9px] text-amber-500 font-bold">({{ det.precios_ajustados.length }})</span>
                        </button>
                        <span v-else>{{ det.producto }}</span>
                      </td>
                      <td class="p-4 border-b border-gray-100 text-xs text-gray-500">{{ det.presentacion }}</td>
                      <td class="p-4 border-b border-gray-100 text-sm text-center">{{ det.cantidad_entregada }}</td>
                      <td class="p-4 border-b border-gray-100 text-sm text-center text-red-500">{{ det.cantidad_devuelta }}</td>
                      <td class="p-4 border-b border-gray-100 text-sm text-center text-amber-600">{{ det.cantidadajustada ?? '-' }}</td>
                      <td class="p-4 border-b border-gray-100 text-sm text-center font-bold text-gray-800">{{ det.cantidad_vendida }}</td>
                      <td class="p-4 border-b border-gray-100 text-sm text-right">{{ Number(det.precio_venta).toFixed(2) }}</td>
                      <td class="p-4 border-b border-gray-100 text-sm text-right text-blue-600">{{ Number(det.comision_unitaria).toFixed(2) }}</td>
                      <td class="p-4 border-b border-gray-100 text-sm text-right font-bold text-blue-600">{{ Number(det.comision_total).toFixed(2) }}</td>
                      <td class="p-4 border-b border-gray-100 text-sm text-right font-bold text-emerald-600">{{ Number(det.liquido_panaderia).toFixed(2) }}</td>
                    </tr>
                    <tr v-for="(ajuste, aIdx) in (det.precios_ajustados || [])" :key="control.idcontrol + '-ajuste-' + detIdx + '-' + aIdx"
                        v-show="isExpandedAjustes(control.idcontrol + '-' + detIdx)"
                        class="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                      <td class="p-2 border-b border-amber-100"></td>
                      <td class="p-2 border-b border-amber-100"></td>
                      <td colspan="2" class="p-2 pl-6 text-[10px] text-amber-700 font-bold border-b border-amber-100">
                        <span class="inline-flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                          Ajuste {{ aIdx + 1 }}{{ ajuste.observacion ? ': ' + ajuste.observacion : '' }}
                        </span>
                      </td>
                      <td class="p-2 border-b border-amber-100"></td>
                      <td class="p-2 border-b border-amber-100"></td>
                      <td class="p-2 text-center font-bold text-amber-700 border-b border-amber-100">{{ Number(ajuste.cantidad || 0) }}</td>
                      <td class="p-2 border-b border-amber-100"></td>
                      <td class="p-2 text-right font-bold text-amber-700 border-b border-amber-100">{{ Number(ajuste.precio_venta || 0).toFixed(2) }}</td>
                      <td class="p-2 text-[10px] text-amber-600 font-semibold border-b border-amber-100" colspan="3">{{ ajuste.estado || '' }}</td>
                    </tr>
                  </template>
                  <tr class="bg-blue-50/20">
                    <td colspan="10" class="p-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Totales del Control:</td>
                    <td class="p-3 text-right border-b font-black text-blue-600">{{ Number(control.total_comision).toFixed(2) }}</td>
                    <td class="p-3 text-right border-b font-black text-emerald-600">{{ Number(control.total_liquido_panaderia).toFixed(2) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="!processedDetallado.length" class="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
          <div class="flex flex-col items-center gap-3">
            <div class="p-4 bg-gray-50 rounded-full">
              <Search class="h-8 w-8 text-gray-300" />
            </div>
            <p class="text-gray-500 font-medium">No se encontraron comisiones en este periodo.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import {
  User, BarChart3, Trophy, TrendingUp, TrendingDown, Users, 
  ChevronDown, ChevronRight, Clock, Package, Store, Search, List, Calendar
} from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  detallado: {
    type: Object,
    default: () => ({ reporte: [], totalesGlobales: {} })
  },
  consolidado: {
    type: Object,
    default: () => ({ reporte: [], totalesGlobales: {} })
  },
  formatFecha: {
    type: Function,
    required: true
  },
  agruparPorSemana: {
    type: Boolean,
    default: false
  }
})

const processedConsolidado = computed(() => {
  const data = props.consolidado?.reporte || [];
  if (!Array.isArray(data)) return { empleados: [], productosUnicos: [], totalPorProducto: {}, totalComisionGlobal: 0, totalLiquidoGlobal: 0 };
  const productosUnicos = [];
  const productSet = new Set();
  data.forEach(emp => {
    if (emp.productos) {
      emp.productos.forEach(p => {
        if (!productSet.has(p.producto)) {
          productSet.add(p.producto);
          productosUnicos.push(p.producto);
        }
      });
    }
  });
  const empleados = data.map(emp => {
    const productoMap = {};
    (emp.productos || []).forEach(p => {
      productoMap[p.producto] = Number(p.cantidad_total || 0);
    });
    return {
      empleado: emp.empleado,
      idempleado: emp.idempleado,
      total_comision: Number(emp.total_comision || 0),
      total_liquido_panaderia: Number(emp.total_liquido_panaderia || 0),
      productoMap
    };
  });
  const totalPorProducto = {};
  productosUnicos.forEach(prod => {
    totalPorProducto[prod] = empleados.reduce((sum, emp) => sum + (emp.productoMap[prod] || 0), 0);
  });
  const totalComisionGlobal = empleados.reduce((sum, emp) => sum + emp.total_comision, 0);
  const totalLiquidoGlobal = empleados.reduce((sum, emp) => sum + emp.total_liquido_panaderia, 0);
  return { empleados, productosUnicos, totalPorProducto, totalComisionGlobal, totalLiquidoGlobal };
});

const getWeekMonday = (dateStr) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'Sin fecha') return dateStr
  const clean = dateStr.split('T')[0]
  const d = new Date(clean + 'T12:00:00')
  if (isNaN(d.getTime())) return clean
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const getWeekLabel = (mondayStr) => {
  if (!mondayStr || mondayStr === 'N/A' || mondayStr === 'Sin fecha') return mondayStr
  const d = new Date(mondayStr + 'T12:00:00')
  if (isNaN(d.getTime())) return mondayStr
  const end = new Date(d)
  end.setDate(d.getDate() + 6)
  const fmt = (date) => {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }
  return `${fmt(d)} - ${fmt(end)}`
}

const processedDetallado = computed(() => {
  const data = props.detallado?.reporte || [];
  if (!Array.isArray(data)) return [];
  let groups = data.map(g => ({
    ...g,
    controles: (g.controles || []).map(c => {
      const detalles = (c.detalles || []).map(d => ({
        ...d,
        comision_total: Number(d.comision_total || 0),
        liquido_panaderia: Number(d.liquido_panaderia || 0),
        precio_venta: Number(d.precio_venta || 0),
        comision_unitaria: Number(d.comision_unitaria || 0),
        cantidadajustada: d.cantidadajustada ?? d.cantidad_ajustada ?? 0,
        precios_ajustados: (d.precios_ajustados || []).map(a => ({
          ...a,
          cantidad: Number(a.cantidad || 0),
          precio_venta: Number(a.precio_venta || 0)
        }))
      }))
      const totalDetalleRows = detalles.length
      return {
        ...c,
        total_comision: Number(c.total_comision || 0),
        total_liquido_panaderia: Number(c.total_liquido_panaderia || 0),
        detalles,
        totalDetalleRows
      }
    })
  }))

  if (props.agruparPorSemana) {
    const weeks = {}
    groups.forEach(g => {
      const monday = getWeekMonday(g.fecha)
      if (!weeks[monday]) {
        weeks[monday] = { fecha: monday, semanaLabel: getWeekLabel(monday), controles: [] }
      }
      weeks[monday].controles.push(...(g.controles || []))
    })
    groups = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }
  return groups
})

const weeklyConsolidados = computed(() => {
  const result = {}
  processedDetallado.value.forEach(sem => {
    const empleadosMap = {}
    const productSet = new Set()
    sem.controles.forEach(c => {
      if (!empleadosMap[c.idempleado]) {
        empleadosMap[c.idempleado] = { empleado: c.empleado, idempleado: c.idempleado, total_comision: 0, total_liquido_panaderia: 0, productoMap: {} }
      }
      const emp = empleadosMap[c.idempleado]
      emp.total_comision += Number(c.total_comision || 0)
      emp.total_liquido_panaderia += Number(c.total_liquido_panaderia || 0)
      ;(c.detalles || []).forEach(d => {
        productSet.add(d.producto)
        emp.productoMap[d.producto] = (emp.productoMap[d.producto] || 0) + Number(d.cantidad_vendida || 0)
      })
    })
    const productosUnicos = [...productSet]
    const empleados = Object.values(empleadosMap)
    const totalPorProducto = {}
    productosUnicos.forEach(prod => {
      totalPorProducto[prod] = empleados.reduce((sum, emp) => sum + (emp.productoMap[prod] || 0), 0)
    })
    result[sem.fecha] = { empleados, productosUnicos, totalPorProducto, totalComisionGlobal: empleados.reduce((s, e) => s + e.total_comision, 0), totalLiquidoGlobal: empleados.reduce((s, e) => s + e.total_liquido_panaderia, 0) }
  })
  return result
})

const weeklyDetallado = computed(() => {
  const data = props.detallado?.reporte || [];
  if (!Array.isArray(data) || !props.agruparPorSemana) return [];
  const groups = data.map(g => ({
    ...g,
    controles: (g.controles || []).map(c => {
      const detalles = (c.detalles || []).map(d => ({
        ...d,
        comision_total: Number(d.comision_total || 0),
        liquido_panaderia: Number(d.liquido_panaderia || 0),
        precio_venta: Number(d.precio_venta || 0),
        comision_unitaria: Number(d.comision_unitaria || 0),
        cantidadajustada: d.cantidadajustada ?? d.cantidad_ajustada ?? 0,
        precios_ajustados: (d.precios_ajustados || []).map(a => ({ ...a, cantidad: Number(a.cantidad || 0), precio_venta: Number(a.precio_venta || 0) }))
      }))
      return { ...c, total_comision: Number(c.total_comision || 0), total_liquido_panaderia: Number(c.total_liquido_panaderia || 0), detalles, totalDetalleRows: detalles.length }
    })
  }))
  const weeks = {}
  groups.forEach(g => {
    if (!g.fecha) return
    const monday = getWeekMonday(g.fecha)
    if (!weeks[monday]) weeks[monday] = { fecha: monday, days: [] }
    weeks[monday].days.push(g)
  })
  return Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const getWeeklyDays = (fecha) => weeklyDetallado.value.find(w => w.fecha === fecha)?.days || []

const formatCurrency = (val) => Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const comisionPorSemana = computed(() => {
  return processedDetallado.value.map(g => ({
    semana: g.fecha,
    semanaLabel: g.semanaLabel,
    cantControles: g.controles.length,
    comisionTotal: g.controles.reduce((sum, c) => sum + parseFloat(c.total_comision || 0), 0),
    liquidoPanaderia: g.controles.reduce((sum, c) => sum + parseFloat(c.total_liquido_panaderia || 0), 0)
  }))
})

const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

const expandedAjustes = ref(new Set())
const toggleAjustes = (key) => {
  const newSet = new Set(expandedAjustes.value)
  if (newSet.has(key)) newSet.delete(key)
  else newSet.add(key)
  expandedAjustes.value = newSet
}
const isExpandedAjustes = (key) => expandedAjustes.value.has(key)

const expandedDates = ref([])
const toggleDate = (fecha) => {
  const index = expandedDates.value.indexOf(fecha)
  if (index > -1) expandedDates.value.splice(index, 1)
  else expandedDates.value.push(fecha)
}
const isExpanded = (fecha) => expandedDates.value.includes(fecha)
const expandAll = () => expandedDates.value = processedDetallado.value.map(g => g.fecha)
const collapseAll = () => expandedDates.value = []

// Charts
const comisionChartRef = ref(null)
const comparacionChartRef = ref(null)
const generalWeekChartRef = ref(null)
let comisionChartInstance = null
let comparacionChartInstance = null
let generalWeekChartInstance = null

const chartEmpleados = computed(() => processedConsolidado.value.empleados.map(e => e.empleado))
const chartComisiones = computed(() => processedConsolidado.value.empleados.map(e => e.total_comision))
const chartLiquidos = computed(() => processedConsolidado.value.empleados.map(e => e.total_liquido_panaderia))

const weeklyChartLabels = computed(() => comisionPorSemana.value.map(w => w.semanaLabel))
const weeklyChartValues = computed(() => comisionPorSemana.value.map(w => w.comisionTotal))
const weeklyChartLiquidos = computed(() => comisionPorSemana.value.map(w => w.liquidoPanaderia))

const weeklyChartInstances = ref({})

watch(expandedSemanas, (val) => {
  Object.entries(val).forEach(([key, expanded]) => {
    if (expanded) {
      nextTick(() => {
        const id = 'wchart-' + key.replace(/[^a-zA-Z0-9]/g, '-')
        const el = document.getElementById(id)
        if (el && !weeklyChartInstances.value[key]) {
          const data = getWeekChartData(key)
          if (data) {
            weeklyChartInstances.value[key] = new Chart(el.getContext('2d'), {
              type: 'doughnut',
              data: { labels: data.labels, datasets: [{ data: data.values, backgroundColor: data.colors }] },
              options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 9 } } } } }
            })
          }
        }
        const id2 = 'wchart2-' + key.replace(/[^a-zA-Z0-9]/g, '-')
        const el2 = document.getElementById(id2)
        if (el2 && !weeklyChartInstances.value[key + '_cmp']) {
          const data = getWeekComparisonData(key)
          if (data) {
            weeklyChartInstances.value[key + '_cmp'] = new Chart(el2.getContext('2d'), {
              type: 'bar',
              data: {
                labels: data.labels,
                datasets: [
                  { label: 'Comisión', data: data.comisiones, backgroundColor: 'rgba(59, 130, 246, 0.7)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 1, borderRadius: 4 },
                  { label: 'Líq. Panadería', data: data.liquidos, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 1, borderRadius: 4 }
                ]
              },
              options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 9 }, usePointStyle: true } } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' Bs.' } } } }
            })
          }
        }
      })
    } else {
      if (weeklyChartInstances.value[key]) {
        weeklyChartInstances.value[key].destroy()
        delete weeklyChartInstances.value[key]
      }
      if (weeklyChartInstances.value[key + '_cmp']) {
        weeklyChartInstances.value[key + '_cmp'].destroy()
        delete weeklyChartInstances.value[key + '_cmp']
      }
    }
  })
}, { deep: true })

const weeklyColors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1','#84CC16']

const getWeekChartData = (weekKey) => {
  const sem = weeklyConsolidados.value[weekKey]
  if (!sem || !sem.empleados) return null
  return {
    labels: sem.empleados.map(e => e.empleado),
    values: sem.empleados.map(e => e.total_comision),
    colors: weeklyColors.slice(0, sem.empleados.length)
  }
}

const getWeekComparisonData = (weekKey) => {
  const sem = weeklyConsolidados.value[weekKey]
  if (!sem || !sem.empleados) return null
  return {
    labels: sem.empleados.map(e => e.empleado),
    comisiones: sem.empleados.map(e => e.total_comision),
    liquidos: sem.empleados.map(e => e.total_liquido_panaderia)
  }
}

const renderCharts = () => {
  if (comisionChartInstance) { comisionChartInstance.destroy(); comisionChartInstance = null }
  if (comparacionChartInstance) { comparacionChartInstance.destroy(); comparacionChartInstance = null }

  if (chartEmpleados.value.length > 0 && comisionChartRef.value && comparacionChartRef.value) {
    comisionChartInstance = new Chart(comisionChartRef.value, {
      type: 'bar',
      data: {
        labels: chartEmpleados.value,
        datasets: [
          {
            label: 'Comisión',
            data: chartComisiones.value,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2, borderRadius: 6
          },
          {
            label: 'Líq. Panadería',
            data: chartLiquidos.value,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2, borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' Bs.' } } }
      }
    })

    comparacionChartInstance = new Chart(comparacionChartRef.value, {
      type: 'bar',
      data: {
        labels: chartEmpleados.value,
        datasets: [
          {
            label: 'Comisión',
            data: chartComisiones.value,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2, borderRadius: 6
          },
          {
            label: 'Líq. Panadería',
            data: chartLiquidos.value,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2, borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' Bs.' } } }
      }
    })
  }

  if (generalWeekChartRef.value && weeklyChartLabels.value.length > 0) {
    if (generalWeekChartInstance) { generalWeekChartInstance.destroy(); generalWeekChartInstance = null }
    generalWeekChartInstance = new Chart(generalWeekChartRef.value, {
      type: 'bar',
      data: {
        labels: weeklyChartLabels.value,
        datasets: [{
          label: 'Comisión',
          data: weeklyChartValues.value,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2, borderRadius: 6
        }, {
          label: 'Líq. Panadería',
          data: weeklyChartLiquidos.value,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' Bs.' } } }
      }
    })
  }
}

watch(processedConsolidado, () => setTimeout(renderCharts, 100), { deep: true })
watch(comisionPorSemana, () => setTimeout(renderCharts, 100), { deep: true })
onMounted(() => setTimeout(renderCharts, 200))
onBeforeUnmount(() => {
  if (comisionChartInstance) comisionChartInstance.destroy()
  if (comparacionChartInstance) comparacionChartInstance.destroy()
  if (generalWeekChartInstance) generalWeekChartInstance.destroy()
  Object.values(weeklyChartInstances.value).forEach(i => i.destroy())
})

defineExpose({
  expandAllSemanas: () => {
    processedDetallado.value.forEach(sem => { expandedSemanas.value[sem.fecha] = true })
  },
  collapseAllSemanas: () => {
    Object.keys(expandedSemanas.value).forEach(k => { expandedSemanas.value[k] = false })
  }
})
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
</style>
