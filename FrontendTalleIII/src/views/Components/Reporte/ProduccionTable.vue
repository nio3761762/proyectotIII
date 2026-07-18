<template>
  <div class="space-y-8">
    <!-- === RESUMEN SEMANAL (Acordeón) === -->
    <div v-if="props.agruparPorSemana" class="space-y-4">
      <div v-if="weeklyChartLabels.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Evolución por Semana</h3>
        <div class="relative" style="height: 220px;">
          <canvas ref="generalWeekChartRef"></canvas>
        </div>
      </div>
      <div v-for="sem in produccionSemanalDetalle" :key="sem.semana" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(sem.semana)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.semana] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
            <span class="text-xs text-gray-400">|</span>
            <span class="text-sm text-gray-500">{{ sem.cantSesiones }} sesiones</span>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Total Producido</p>
              <p class="text-sm font-black text-emerald-600">{{ sem.totalProducido }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Costo Total</p>
              <p class="text-sm font-black text-blue-600">{{ formatCurrency(sem.costoTotal) }}</p>
            </div>
          </div>
        </div>
        <div v-if="expandedSemanas[sem.semana]" class="p-6 overflow-x-auto space-y-8">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-emerald-100 rounded-xl">
                <BarChart3 class="h-5 w-5 text-emerald-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Resumen de Producción por Sucursal</h4>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm" style="min-width: 600px;">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/30">
                    <th rowspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r min-w-[180px]">Sucursal / Empleado</th>
                    <th v-for="prod in weeklyConsolidados[sem.semana]?.productosUnicos || []" :key="prod.idproducto"
                        colspan="1" class="p-3 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-r text-center min-w-[100px]">
                      <div class="flex flex-col items-center">
                        <span class="text-gray-600">{{ prod.producto }}</span>
                        <span class="text-[8px] text-gray-400 font-normal normal-case mt-0.5">(prod.)</span>
                      </div>
                    </th>
                    <th colspan="1" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[120px]">Total Sucursal / Empleado</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="suc in weeklyConsolidados[sem.semana]?.sucursales || []" :key="suc.nombre">
                    <tr class="bg-gray-100/60 border-b-2 border-gray-200">
                      <td class="p-3 font-black text-gray-700 text-xs uppercase tracking-widest border-r">
                        <div class="flex items-center gap-1.5">
                          <Building class="h-4 w-4 text-orange-500 shrink-0" />
                          <span>{{ suc.nombre }}</span>
                        </div>
                      </td>
                      <td v-for="prod in weeklyConsolidados[sem.semana]?.productosUnicos || []" :key="prod.idproducto"
                          class="p-3 text-center font-black border-r">
                        <span class="text-emerald-700">{{ suc.productoTotalMap[prod.idproducto] ?? '-' }}</span>
                      </td>
                      <td class="p-3 text-right font-black">
                        <span class="text-blue-700">{{ Number(suc.total_sucursal).toFixed(0) }}</span>
                      </td>
                    </tr>
                    <tr v-for="emp in suc.empleados || []" :key="emp.nombre"
                        class="hover:bg-orange-50/30 transition-colors">
                      <td class="p-3 border-b border-r font-bold text-gray-800 text-sm">
                        <div class="flex items-center gap-1.5 pl-4">
                          <User class="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span class="truncate">{{ emp.nombre }}</span>
                        </div>
                      </td>
                      <td v-for="prod in weeklyConsolidados[sem.semana]?.productosUnicos || []" :key="prod.idproducto"
                          class="p-3 border-b border-r text-center text-sm font-bold text-gray-800">
                        {{ emp.productoMap[prod.idproducto] ?? '-' }}
                      </td>
                      <td class="p-3 border-b text-right">
                        <span class="font-black text-blue-600">{{ Number(emp.total_empleado).toFixed(0) }}</span>
                      </td>
                    </tr>
                  </template>
                </tbody>
                <tfoot v-if="(weeklyConsolidados[sem.semana]?.sucursales?.length || 0) > 1">
                  <tr class="bg-orange-50/50">
                    <td class="p-3 border-t-2 border-orange-200 font-black text-gray-600 text-xs uppercase">Totales</td>
                    <td v-for="prod in weeklyConsolidados[sem.semana]?.productosUnicos || []" :key="prod.idproducto"
                        class="p-3 border-t-2 border-orange-200 text-center font-black">
                      {{ weeklyConsolidados[sem.semana]?.totalPorProducto[prod.idproducto] ?? '-' }}
                    </td>
                    <td class="p-3 border-t-2 border-orange-200 text-right">
                      <span class="font-black text-blue-600">{{ weeklyConsolidados[sem.semana]?.totalGlobal.toFixed(0) }}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div v-if="weeklyInsumos[sem.semana]?.sucursales?.length">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-amber-100 rounded-xl">
                <Droplets class="h-5 w-5 text-amber-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Insumos Consumidos por Sucursal</h4>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm" style="min-width: 600px;">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/30">
                    <th rowspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r min-w-[180px]">Sucursal</th>
                    <th v-for="ins in weeklyInsumos[sem.semana]?.insumosUnicos || []" :key="ins.insumo"
                        colspan="1" class="p-3 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-r text-center min-w-[100px]">
                      <div class="flex flex-col items-center">
                        <span class="text-gray-600">{{ ins.insumo }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="suc in weeklyInsumos[sem.semana]?.sucursales || []" :key="suc.nombre"
                      class="hover:bg-amber-50/30 transition-colors">
                    <td class="p-3 border-b border-r font-bold text-gray-800 text-sm">
                      <div class="flex items-center gap-1.5">
                        <Building class="h-4 w-4 text-amber-500 shrink-0" />
                        <span class="truncate">{{ suc.nombre }}</span>
                      </div>
                    </td>
                    <td v-for="ins in weeklyInsumos[sem.semana]?.insumosUnicos || []" :key="ins.insumo"
                        class="p-3 border-b border-r text-center text-sm font-bold text-gray-800">
                      {{ suc.insumoMap[ins.insumo]?.toFixed(0) ?? '-' }} {{ ins.unidad }}
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="(weeklyInsumos[sem.semana]?.sucursales?.length || 0) > 1">
                  <tr class="bg-amber-50/50">
                    <td class="p-3 border-t-2 border-amber-200 font-black text-gray-600 text-xs uppercase">Totales</td>
                    <td v-for="ins in weeklyInsumos[sem.semana]?.insumosUnicos || []" :key="ins.insumo"
                        class="p-3 border-t-2 border-amber-200 text-center font-black">
                      {{ weeklyInsumos[sem.semana]?.totalPorInsumo[ins.insumo] ?? '-' }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div v-if="expandedSemanas[sem.semana]" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h5 class="text-sm font-bold text-gray-700 mb-3">Distribución de la Semana</h5>
            <div class="relative" style="height: 180px;">
              <canvas :id="'wchart-' + sem.semana.replace(/[^a-zA-Z0-9]/g, '-')"></canvas>
            </div>
          </div>

          <!-- Detallado por Día (como el detalle cronológico original) -->
          <div v-if="getWeeklyDays(sem.semana).length > 0">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 rounded-xl">
                <ClipboardList class="h-5 w-5 text-blue-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Detallado por Día</h4>
            </div>
            <div class="space-y-4">
              <div v-for="day in getWeeklyDays(sem.semana)" :key="day.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-3">
                  <Calendar class="h-4 w-4 text-blue-500" />
                  <span class="font-bold text-gray-700 text-sm">{{ formatFecha(day.fecha) }}</span>
                  <span class="text-xs text-gray-500">({{ day.producciones.length }} sesiones)</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                        <th class="px-6 py-4 w-10"></th>
                        <th class="px-6 py-4">Fecha / ID</th>
                        <th class="px-6 py-4">Sucursal</th>
                        <th class="px-6 py-4">Horario</th>
                        <th class="px-4 py-4 text-center">Cant. Total</th>
                        <th class="px-4 py-4 text-right">Insumos</th>
                        <th class="px-4 py-4 text-right">Mano Obra</th>
                        <th class="px-4 py-4 text-right">Indirectos</th>
                        <th class="px-6 py-4 text-right">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <template v-for="prod in day.producciones" :key="prod.idproduccion">
                        <tr @click="toggleWeeklyRow(prod.idproduccion)"
                            class="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                            :class="{'bg-blue-50/20': isWeeklyRowExpanded(prod.idproduccion)}">
                          <td class="px-6 py-4">
                            <div :class="['transition-transform duration-300', isWeeklyRowExpanded(prod.idproduccion) ? 'rotate-180' : '']">
                              <ChevronDown class="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex flex-col">
                              <span class="font-bold text-gray-700">{{ formatFecha(prod.fechaproduccion).substring(0,10) }}</span>
                              <span class="text-[10px] text-gray-400 font-mono">{{ prod.idproduccion }}</span>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-sm font-medium text-gray-600">{{ prod.sucursal_nombre }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock class="h-3 w-3" />
                              {{ prod.horainicio?.substring(0,5) }} - {{ prod.horafin?.substring(0,5) }}
                            </div>
                          </td>
                          <td class="px-4 py-4 text-center">
                            <div class="flex flex-col items-center">
                              <span class="font-black text-gray-700">{{ prod.CANTIDAD_TOTAL_PRODUCIDA }}</span>
                              <span v-if="prod.DetalleLotes && prod.DetalleLotes.some(l => l.cantidad_mala > 0)"
                                    class="text-[9px] font-black text-red-500 uppercase mt-0.5">
                                {{ prod.DetalleLotes.reduce((acc, l) => acc + (l.cantidad_mala || 0), 0) }} Merma
                              </span>
                            </div>
                          </td>
                          <td class="px-4 py-4 text-right text-sm text-gray-600">{{ parseFloat(prod.COSTO_INSUMOS || 0).toFixed(2) }}</td>
                          <td class="px-4 py-4 text-right text-sm text-gray-600">{{ parseFloat(prod.COSTO_MANO_OBRA || 0).toFixed(2) }}</td>
                          <td class="px-4 py-4 text-right text-sm text-gray-600">{{ parseFloat(prod.COSTO_INDIRECTO || 0).toFixed(2) }}</td>
                          <td class="px-6 py-4 text-right">
                            <span class="font-black text-blue-600">{{ parseFloat(prod.COSTO_TOTAL || 0).toFixed(2) }} <small class="text-[10px] ml-0.5">Bs.</small></span>
                          </td>
                        </tr>
                        <!-- Fila de Detalle expandida -->
                        <tr v-if="isWeeklyRowExpanded(prod.idproduccion)">
                          <td colspan="9" class="px-6 py-8 bg-gray-50/50 border-y border-gray-100">
                            <div class="max-w-7xl mx-auto space-y-8">
                              <div>
                                <div class="flex items-center gap-2 mb-4">
                                  <Layers class="h-4 w-4 text-orange-500" />
                                  <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalle de Productos por Empleado</h5>
                                </div>
                                <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                  <div class="overflow-x-auto">
                                    <table class="w-full text-left border-collapse">
                                      <thead class="bg-gray-50">
                                        <tr>
                                          <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase whitespace-nowrap">Empleado</th>
                                          <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase whitespace-nowrap">Producto</th>
                                          <th class="px-4 py-3 text-[9px] font-black text-green-600 uppercase text-center whitespace-nowrap">Cant. Producida</th>
                                          <th class="px-4 py-3 text-[9px] font-black text-red-400 uppercase text-center whitespace-nowrap">Cant. Mala</th>
                                          <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase whitespace-nowrap">Motivo</th>
                                          <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-center whitespace-nowrap">Hora Producción</th>
                                          <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-center whitespace-nowrap">Horno</th>
                                          <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-right whitespace-nowrap">C. Unit.</th>
                                          <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-right whitespace-nowrap">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody class="divide-y divide-gray-100">
                                        <template v-for="(empGroup, empIdx) in groupLotesByEmployee(prod.DetalleLotes || [])" :key="empIdx">
                                          <tr class="hover:bg-orange-50/30 transition-colors">
                                            <td class="px-4 py-3" rowspan="1">
                                              <div class="flex items-center gap-2">
                                                <div class="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                  <Users class="h-3.5 w-3.5 text-blue-600" />
                                                </div>
                                                <span class="text-xs font-bold text-gray-700">{{ empGroup.empleado }}</span>
                                              </div>
                                            </td>
                                            <td class="px-4 py-3">
                                              <div class="flex flex-col gap-0.5">
                                                <span v-for="p in empGroup.productos" :key="p.nombre" class="text-xs font-medium text-gray-600">
                                                  {{ p.nombre }}
                                                </span>
                                              </div>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                              <div class="flex flex-col gap-0.5">
                                                <span v-for="p in empGroup.productos" :key="p.nombre" class="text-xs font-black text-green-600">
                                                  {{ p.cantidad }}
                                                </span>
                                              </div>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                              <div class="flex flex-col gap-0.5">
                                                <span v-for="p in empGroup.productos" :key="p.nombre" :class="['text-xs font-black', p.cantidad_mala > 0 ? 'text-red-600' : 'text-gray-300']">
                                                  {{ p.cantidad_mala || 0 }}
                                                </span>
                                              </div>
                                            </td>
                                            <td class="px-4 py-3">
                                              <div class="flex flex-col gap-0.5">
                                                <span v-for="p in empGroup.productos" :key="p.nombre" class="text-[10px] text-gray-500 italic block max-w-[140px] truncate" :title="p.motivo_mala || '-'">
                                                  {{ p.motivo_mala || '-' }}
                                                </span>
                                              </div>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                              <div class="flex flex-col gap-0.5">
                                                <span v-for="p in empGroup.productos" :key="p.nombre" class="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-medium">
                                                  <Clock class="h-3 w-3" /> {{ p.hora }}
                                                </span>
                                              </div>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                              <div class="flex flex-col gap-0.5">
                                                <span v-for="p in empGroup.productos" :key="p.nombre" class="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-medium">
                                                  {{ p.horno_nombre }}
                                                </span>
                                              </div>
                                            </td>
                                            <td class="px-4 py-3 text-right">
                                              <div class="flex flex-col gap-0.5 items-end">
                                                <span v-for="p in empGroup.productos" :key="p.nombre" class="text-xs text-gray-600 font-medium">
                                                  {{ parseFloat(p.costo_unitario || 0).toFixed(2) }} Bs.
                                                </span>
                                              </div>
                                            </td>
                                            <td class="px-4 py-3 text-right">
                                              <div class="flex flex-col gap-0.5 items-end">
                                                <span v-for="p in empGroup.productos" :key="p.nombre" class="text-xs font-bold text-gray-800">
                                                  {{ (Number(p.cantidad || 0) * Number(p.costo_unitario || 0)).toFixed(2) }} Bs.
                                                </span>
                                              </div>
                                            </td>
                                          </tr>
                                        </template>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                  <div class="flex items-center gap-2 mb-3">
                                    <Users class="h-4 w-4 text-blue-500" />
                                    <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mano de Obra</h5>
                                  </div>
                                  <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <div v-for="(mo, idx) in (prod.ManoObraTotal || [])" :key="idx" class="flex justify-between items-center mb-2 last:mb-0">
                                      <div class="flex items-center gap-2">
                                        <span class="text-[11px] font-medium text-gray-600">{{ mo.empleado }}</span>
                                        <span class="text-[9px] text-gray-400 font-medium">
                                          ({{ mo.horainicio?.substring(0,5) ?? '--:--' }} - {{ mo.horafin?.substring(0,5) ?? '--:--' }})
                                        </span>
                                      </div>
                                      <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black">{{ mo.horas }} hrs</span>
                                    </div>
                                    <div class="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                                      <span class="text-[9px] text-gray-400 font-black uppercase">Costo MO</span>
                                      <span class="text-xs font-black text-gray-700">{{ parseFloat(prod.COSTO_MANO_OBRA || 0).toFixed(2) }} Bs.</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div class="flex items-center gap-2 mb-3">
                                    <Droplets class="h-4 w-4 text-blue-500" />
                                    <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Insumos Utilizados</h5>
                                  </div>
                                  <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm max-h-48 overflow-y-auto">
                                    <div v-for="insumo in (prod.CONSUMO_TOTAL_PRODUCCION || [])" :key="insumo.insumo_unidad" class="flex justify-between items-center mb-2 last:mb-0">
                                      <span class="text-[11px] text-gray-600">{{ insumo.insumo_unidad }}</span>
                                      <span class="text-[11px] font-black text-orange-600">{{ insumo.cantidad }}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
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
      <div v-if="produccionSemanalDetalle.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- === CONSOLIDADO (Resumen por Sucursal y Empleado) === -->
    <div v-if="processedConsolidado.sucursales.length > 0 && !props.agruparPorSemana" class="animate-fade-in-up space-y-10">
      <!-- Charts -->
      <div v-if="chartSucursales.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Producción Total por Sucursal</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="sucursalChartRef"></canvas>
          </div>
        </div>
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Distribución por Producto</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="productoChartRef"></canvas>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-emerald-100 rounded-xl">
          <BarChart3 class="h-6 w-6 text-emerald-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-800">Resumen de Producción por Sucursal</h3>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/30">
              <th rowspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r min-w-[180px]">Sucursal / Empleado</th>
              <th v-for="prod in processedConsolidado.productosUnicos" :key="prod.idproducto"
                  colspan="1" class="p-3 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-r text-center min-w-[100px]">
                <div class="flex flex-col items-center">
                  <span class="text-gray-600">{{ prod.producto }}</span>
                  <span class="text-[8px] text-gray-400 font-normal normal-case mt-0.5">(prod.)</span>
                </div>
              </th>
              <th colspan="1" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center min-w-[120px]">Total Sucursal / Empleado</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="suc in processedConsolidado.sucursales" :key="suc.nombre">
              <!-- Fila header de Sucursal con totales por producto -->
              <tr class="bg-gray-100/60 border-b-2 border-gray-200">
                <td class="p-3 font-black text-gray-700 text-xs uppercase tracking-widest border-r">
                  <div class="flex items-center gap-1.5">
                    <Building class="h-4 w-4 text-orange-500 shrink-0" />
                    <span>{{ suc.nombre }}</span>
                  </div>
                </td>
                <td v-for="prod in processedConsolidado.productosUnicos" :key="prod.idproducto"
                    class="p-3 text-center font-black border-r">
                  <span class="text-emerald-700">{{ suc.productoTotalMap[prod.idproducto] ?? '-' }}</span>
                </td>
                <td class="p-3 text-right font-black">
                  <span class="text-blue-700">{{ Number(suc.total_sucursal).toFixed(0) }}</span>
                </td>
              </tr>
              <!-- Filas de empleados -->
              <tr v-for="emp in suc.empleados" :key="emp.nombre"
                  class="hover:bg-orange-50/30 transition-colors">
                <td class="p-3 border-b border-r font-bold text-gray-800 text-sm">
                  <div class="flex items-center gap-1.5 pl-4">
                    <User class="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span class="truncate">{{ emp.nombre }}</span>
                  </div>
                </td>
                <td v-for="prod in processedConsolidado.productosUnicos" :key="prod.idproducto"
                    class="p-3 border-b border-r text-center text-sm font-bold text-gray-800">
                  {{ emp.productoMap[prod.idproducto] ?? '-' }}
                </td>
                <td class="p-3 border-b text-right">
                  <span class="font-black text-blue-600">{{ Number(emp.total_empleado).toFixed(0) }}</span>
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot v-if="processedConsolidado.sucursales.length > 1">
            <tr class="bg-orange-50/50">
              <td class="p-3 border-t-2 border-orange-200 font-black text-gray-600 text-xs uppercase">Totales</td>
              <td v-for="prod in processedConsolidado.productosUnicos" :key="prod.idproducto"
                  class="p-3 border-t-2 border-orange-200 text-center font-black">
                {{ processedConsolidado.totalPorProducto[prod.idproducto] ?? '-' }}
              </td>
              <td class="p-3 border-t-2 border-orange-200 text-right">
                <span class="font-black text-blue-600">{{ processedConsolidado.totalGlobal.toFixed(0) }}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Tabla de Insumos por Sucursal -->
      <div v-if="processedInsumos.sucursales.length > 0" class="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center gap-3 px-6 pt-6 pb-2">
          <div class="p-2 bg-amber-100 rounded-xl">
            <Droplets class="h-5 w-5 text-amber-600" />
          </div>
          <h3 class="text-lg font-bold text-gray-800">Insumos Consumidos por Sucursal</h3>
        </div>
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/30">
              <th rowspan="2" class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-r min-w-[180px]">Sucursal</th>
              <th v-for="ins in processedInsumos.insumosUnicos" :key="ins.insumo"
                  colspan="1" class="p-3 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-r text-center min-w-[100px]">
                <div class="flex flex-col items-center">
                  <span class="text-gray-600">{{ ins.insumo }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="suc in processedInsumos.sucursales" :key="suc.nombre"
                class="hover:bg-amber-50/30 transition-colors">
              <td class="p-3 border-b border-r font-bold text-gray-800 text-sm">
                <div class="flex items-center gap-1.5">
                  <Building class="h-4 w-4 text-amber-500 shrink-0" />
                  <span class="truncate">{{ suc.nombre }}</span>
                </div>
              </td>
              <td v-for="ins in processedInsumos.insumosUnicos" :key="ins.insumo"
                  class="p-3 border-b border-r text-center text-sm font-bold text-gray-800">
                {{ suc.insumoMap[ins.insumo]?.toFixed(0) ?? '-' }} {{ ins.unidad }}
              </td>
            </tr>
          </tbody>
          <tfoot v-if="processedInsumos.sucursales.length > 1">
            <tr class="bg-amber-50/50">
              <td class="p-3 border-t-2 border-amber-200 font-black text-gray-600 text-xs uppercase">Totales</td>
              <td v-for="ins in processedInsumos.insumosUnicos" :key="ins.insumo"
                  class="p-3 border-t-2 border-amber-200 text-center font-black">
                {{ processedInsumos.totalPorInsumo[ins.insumo] ?? '-' }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl">
        <p class="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Totales Globales</p>
        <div class="flex items-center gap-10">
          <div>
            <p class="text-xl font-black">{{ Number(consolidado?.total_general || processedConsolidado.totalGlobal).toFixed(0) }} uds.</p>
            <p class="text-[10px] opacity-80">Total Producido</p>
          </div>
          <div>
            <p class="text-xl font-black">{{ Number(consolidado?.costo_produccion_total || 0).toFixed(2) }} Bs.</p>
            <p class="text-[10px] opacity-80">Costo Producción</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detalle Cronológico -->
    <section v-if="!props.agruparPorSemana" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up" style="animation-delay: 0.1s">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <ClipboardList class="h-5 w-5 text-blue-600" />
          </div>
          <h3 class="text-lg font-bold text-gray-800">Detalle Cronológico de Producciones</h3>
        </div>
        <div class="flex gap-2">
          <button @click="expandAll" class="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors border border-blue-100">Expandir todo</button>
          <button @click="collapseAll" class="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors border border-gray-200">Contraer todo</button>
        </div>
      </div>

      <div class="space-y-6 p-6">
        <div v-for="grupo in produccionesPorFecha" :key="grupo.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div class="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-3">
            <Calendar class="h-4 w-4 text-blue-500" />
            <span class="font-bold text-gray-700 text-sm">{{ formatFecha(grupo.fecha) }}</span>
            <span class="text-xs text-gray-500">({{ grupo.producciones.length }} sesiones)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  <th class="px-6 py-4 w-10"></th>
                  <th class="px-6 py-4">ID</th>
                  <th class="px-6 py-4">Sucursal</th>
                  <th class="px-6 py-4">Horario</th>
                  <th class="px-4 py-4 text-center">Cant. Total</th>
                  <th class="px-4 py-4 text-right">Insumos</th>
                  <th class="px-4 py-4 text-right">Mano Obra</th>
                  <th class="px-4 py-4 text-right">Indirectos</th>
                  <th class="px-6 py-4 text-right">Costo Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <template v-for="prod in grupo.producciones" :key="prod.idproduccion">
                  <tr @click="toggleRow(prod.idproduccion)" 
                      class="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      :class="{'bg-blue-50/20': isRowExpanded(prod.idproduccion)}">
                    <td class="px-6 py-4">
                      <div :class="['transition-transform duration-300', isRowExpanded(prod.idproduccion) ? 'rotate-180' : '']">
                        <ChevronDown class="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-xs font-mono text-gray-500">{{ prod.idproduccion }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-medium text-gray-600">{{ prod.sucursal_nombre }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock class="h-3 w-3" />
                        {{ prod.horainicio?.substring(0,5) || '--:--' }} - {{ prod.horafin?.substring(0,5) || '--:--' }}
                      </div>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <div class="flex flex-col items-center">
                        <span class="font-black text-gray-700">{{ prod.CANTIDAD_TOTAL_PRODUCIDA }}</span>
                        <span v-if="prod.DetalleLotes?.some(l => l.cantidad_mala > 0)" 
                              class="text-[9px] font-black text-red-500 uppercase mt-0.5">
                          {{ prod.DetalleLotes.reduce((acc, l) => acc + (l.cantidad_mala || 0), 0) }} Merma
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-4 text-right text-sm text-gray-600">{{ parseFloat(prod.COSTO_INSUMOS || 0).toFixed(2) }}</td>
                    <td class="px-4 py-4 text-right text-sm text-gray-600">{{ parseFloat(prod.COSTO_MANO_OBRA || 0).toFixed(2) }}</td>
                    <td class="px-4 py-4 text-right text-sm text-gray-600">{{ parseFloat(prod.COSTO_INDIRECTO || 0).toFixed(2) }}</td>
                    <td class="px-6 py-4 text-right">
                      <span class="font-black text-blue-600">{{ parseFloat(prod.COSTO_TOTAL || 0).toFixed(2) }} <small class="text-[10px] ml-0.5">Bs.</small></span>
                    </td>
                  </tr>
                  
                  <!-- Fila de Detalle -->
                  <tr v-if="isRowExpanded(prod.idproduccion)">
                    <td colspan="9" class="px-6 py-8 bg-gray-50/50 border-y border-gray-100">
                      <div class="max-w-7xl mx-auto space-y-8">
                        <!-- Tabla Excel de Lotes -->
                        <div>
                          <div class="flex items-center gap-2 mb-4">
                            <Layers class="h-4 w-4 text-orange-500" />
                            <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalle de Productos por Empleado</h5>
                          </div>
                          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div class="overflow-x-auto">
                              <table class="w-full text-left border-collapse">
                                <thead class="bg-gray-50">
                                  <tr>
                                    <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase whitespace-nowrap">Empleado</th>
                                    <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase whitespace-nowrap">Producto</th>
                                    <th class="px-4 py-3 text-[9px] font-black text-green-600 uppercase text-center whitespace-nowrap">Cant. Producida</th>
                                    <th class="px-4 py-3 text-[9px] font-black text-red-400 uppercase text-center whitespace-nowrap">Cant. Mala</th>
                                    <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase whitespace-nowrap">Motivo</th>
                                    <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-center whitespace-nowrap">Hora Producción</th>
                                    <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-center whitespace-nowrap">Horno</th>
                                    <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-right whitespace-nowrap">C. Unit.</th>
                                    <th class="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-right whitespace-nowrap">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                  <template v-for="(empGroup, empIdx) in groupLotesByEmployee(prod.DetalleLotes || [])" :key="empIdx">
                                    <tr class="hover:bg-orange-50/30 transition-colors">
                                      <td class="px-4 py-3" rowspan="1">
                                        <div class="flex items-center gap-2">
                                          <div class="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Users class="h-3.5 w-3.5 text-blue-600" />
                                          </div>
                                          <span class="text-xs font-bold text-gray-700">{{ empGroup.empleado }}</span>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3">
                                        <div class="flex flex-col gap-0.5">
                                          <span v-for="p in empGroup.productos" :key="p.nombre" class="text-xs font-medium text-gray-600">{{ p.nombre }}</span>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3 text-center">
                                        <div class="flex flex-col gap-0.5">
                                          <span v-for="p in empGroup.productos" :key="p.nombre" class="text-xs font-black text-green-600">{{ p.cantidad }}</span>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3 text-center">
                                        <div class="flex flex-col gap-0.5">
                                          <span v-for="p in empGroup.productos" :key="p.nombre" :class="['text-xs font-black', p.cantidad_mala > 0 ? 'text-red-600' : 'text-gray-300']">{{ p.cantidad_mala || 0 }}</span>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3">
                                        <div class="flex flex-col gap-0.5">
                                          <span v-for="p in empGroup.productos" :key="p.nombre" class="text-[10px] text-gray-500 italic block max-w-[140px] truncate" :title="p.motivo_mala || '-'">{{ p.motivo_mala || '-' }}</span>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3 text-center">
                                        <div class="flex flex-col gap-0.5">
                                          <span v-for="p in empGroup.productos" :key="p.nombre" class="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-medium">
                                            <Clock class="h-3 w-3" /> {{ p.hora }}
                                          </span>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3 text-center">
                                        <div class="flex flex-col gap-0.5">
                                          <span v-for="p in empGroup.productos" :key="p.nombre" class="text-[10px] text-gray-500 font-medium">{{ p.horno_nombre }}</span>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3 text-right">
                                        <div class="flex flex-col gap-0.5 items-end">
                                          <span v-for="p in empGroup.productos" :key="p.nombre" class="text-xs text-gray-600 font-medium">{{ parseFloat(p.costo_unitario || 0).toFixed(2) }} Bs.</span>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3 text-right">
                                        <div class="flex flex-col gap-0.5 items-end">
                                          <span v-for="p in empGroup.productos" :key="p.nombre" class="text-xs font-bold text-gray-800">{{ (Number(p.cantidad || 0) * Number(p.costo_unitario || 0)).toFixed(2) }} Bs.</span>
                                        </div>
                                      </td>
                                    </tr>
                                  </template>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <!-- Recursos: Mano de Obra e Insumos en fila -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <!-- Mano de Obra -->
                          <div>
                            <div class="flex items-center gap-2 mb-3">
                              <Users class="h-4 w-4 text-blue-500" />
                              <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mano de Obra</h5>
                            </div>
                            <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                              <div v-for="(mo, idx) in (prod.ManoObraTotal || [])" :key="idx" class="flex justify-between items-center mb-2 last:mb-0">
                                <div class="flex items-center gap-2">
                                  <span class="text-[11px] font-medium text-gray-600">{{ mo.empleado }}</span>
                                  <span class="text-[9px] text-gray-400 font-medium">
                                    ({{ mo.horainicio?.substring(0,5) ?? '--:--' }} - {{ mo.horafin?.substring(0,5) ?? '--:--' }})
                                  </span>
                                </div>
                                <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black">{{ mo.horas }} hrs</span>
                              </div>
                              <div class="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                                <span class="text-[9px] text-gray-400 font-black uppercase">Costo MO</span>
                                <span class="text-xs font-black text-gray-700">{{ parseFloat(prod.COSTO_MANO_OBRA || 0).toFixed(2) }} Bs.</span>
                              </div>
                            </div>
                          </div>

                          <!-- Insumos Utilizados -->
                          <div>
                            <div class="flex items-center gap-2 mb-3">
                              <Droplets class="h-4 w-4 text-blue-500" />
                              <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Insumos Utilizados</h5>
                            </div>
                            <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm max-h-48 overflow-y-auto">
                              <div v-for="insumo in (prod.CONSUMO_TOTAL_PRODUCCION || [])" :key="insumo.insumo_unidad" class="flex justify-between items-center mb-2 last:mb-0">
                                <span class="text-[11px] text-gray-600">{{ insumo.insumo_unidad }}</span>
                                <span class="text-[11px] font-black text-orange-600">{{ insumo.cantidad }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Estado Vacío -->
      <div v-if="!todasLasProducciones || todasLasProducciones.length === 0" class="p-16 text-center">
        <div class="flex flex-col items-center gap-4">
          <div class="p-4 bg-gray-50 rounded-full">
            <Search class="h-10 w-10 text-gray-300" />
          </div>
          <div>
            <p class="text-gray-500 font-bold text-lg">No se encontraron producciones</p>
            <p class="text-gray-400 text-sm">Pruebe ajustando los filtros de fecha o sucursal.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import {
  Building, User, BarChart3, Package, ChevronDown, Factory, 
  Utensils, Clock, Users, Search, Calendar,Droplets, ClipboardList, Layers
} from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  consolidado: {
    type: Object,
    default: () => ({})
  },
  detallado: {
    type: Object,
    default: () => ({})
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

const formatCurrency = (val) => Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const groupLotesByEmployee = (lotes) => {
  const map = {};
  (lotes || []).forEach(l => {
    const key = l.empleado_completo;
    if (!map[key]) {
      map[key] = { empleado: key, productos: [] };
    }
    map[key].productos.push({
      nombre: l.producto_nombre,
      cantidad: l.cantidad,
      cantidad_mala: l.cantidad_mala || 0,
      motivo_mala: l.motivo_mala,
      hora: l.hora,
      horno_nombre: l.horno_nombre,
      costo_unitario: l.costo_unitario,
      insumos_receta: l.insumos_receta,
    });
  });
  return Object.values(map);
};

const produccionPorSemana = computed(() => {
  const weeks = {}
  const producciones = props.detallado?.producciones || []
  if (!Array.isArray(producciones)) return []
  producciones.forEach(prod => {
    const fecha = prod.fechaproduccion ? prod.fechaproduccion.split('T')[0] : 'N/A'
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantSesiones: 0, totalProducido: 0, costoTotal: 0 }
    }
    weeks[monday].cantSesiones++
    weeks[monday].totalProducido += Number(prod.CANTIDAD_TOTAL_PRODUCIDA || 0)
    weeks[monday].costoTotal += parseFloat(prod.COSTO_TOTAL || 0)
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana))
})

const processedConsolidado = computed(() => {
  const raw = props.consolidado;
  const sucursalesRaw = raw?.sucursales || [];
  if (!Array.isArray(sucursalesRaw) || sucursalesRaw.length === 0) {
    return { sucursales: [], productosUnicos: [], totalPorProducto: {}, totalGlobal: 0 };
  }

  const productosUnicos = [];
  const prodSet = new Set();
  sucursalesRaw.forEach(suc => {
    if (suc.productos) {
      suc.productos.forEach(p => {
        if (!prodSet.has(p.idproducto)) {
          prodSet.add(p.idproducto);
          productosUnicos.push({ idproducto: p.idproducto, producto: p.producto });
        }
      });
    }
  });

  const totalPorProducto = {};
  let totalGlobal = 0;

  const sucursales = sucursalesRaw.map(suc => {
    const totalSuc = Number(suc.total_sucursal || 0);
    totalGlobal += totalSuc;

    // Colectar empleados únicos dentro de la sucursal
    const empMap = {};
    (suc.productos || []).forEach(p => {
      const prodId = p.idproducto;
      (p.empleados || []).forEach(e => {
        if (!empMap[e.empleado]) {
          empMap[e.empleado] = { nombre: e.empleado, productoMap: {}, total_empleado: 0 };
        }
        const cant = Number(e.cantidad || 0);
        empMap[e.empleado].productoMap[prodId] = (empMap[e.empleado].productoMap[prodId] || 0) + cant;
        empMap[e.empleado].total_empleado += cant;
      });
    });

    // Acumular total por producto a nivel global
    (suc.productos || []).forEach(p => {
      totalPorProducto[p.idproducto] = (totalPorProducto[p.idproducto] || 0) + Number(p.total_producto || 0);
    });

    const productoTotalMap = {};
    (suc.productos || []).forEach(p => {
      productoTotalMap[p.idproducto] = Number(p.total_producto || 0);
    });

    return {
      nombre: suc.sucursal,
      total_sucursal: totalSuc,
      productoTotalMap,
      empleados: Object.values(empMap)
    };
  });

  return { sucursales, productosUnicos, totalPorProducto, totalGlobal };
});

const processedInsumos = computed(() => {
  const raw = props.consolidado;
  const sucursalesRaw = raw?.sucursales || [];
  if (!Array.isArray(sucursalesRaw) || sucursalesRaw.length === 0) {
    return { sucursales: [], insumosUnicos: [], totalPorInsumo: {} };
  }

  const insumosUnicos = [];
  const insumoSet = new Set();
  sucursalesRaw.forEach(suc => {
    if (suc.productos) {
      suc.productos.forEach(p => {
        (p.insumos_calculados || []).forEach(i => {
          if (!insumoSet.has(i.insumo)) {
            insumoSet.add(i.insumo);
            insumosUnicos.push({ insumo: i.insumo, unidad: i.unidad || '' });
          }
        });
      });
    }
  });

  const totalPorInsumo = {};

  const sucursales = sucursalesRaw.map(suc => {
    const insumoMap = {};
    (suc.productos || []).forEach(p => {
      (p.insumos_calculados || []).forEach(i => {
        insumoMap[i.insumo] = (insumoMap[i.insumo] || 0) + Number(i.cantidad_consumida || 0);
      });
    });
    Object.keys(insumoMap).forEach(k => {
      totalPorInsumo[k] = (totalPorInsumo[k] || 0) + insumoMap[k];
    });
    return {
      nombre: suc.sucursal,
      insumoMap
    };
  });

  return { sucursales, insumosUnicos, totalPorInsumo };
});

const weeklyConsolidados = computed(() => {
  const result = {}
  const weeks = {}
  const prods = [...(props.detallado?.producciones || [])]
  prods.forEach(p => {
    const fecha = p.fechaproduccion
    if (!fecha) return
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) weeks[monday] = { producciones: [] }
    weeks[monday].producciones.push(p)
  })
  Object.entries(weeks).forEach(([monday, weekData]) => {
    const sucursalesMap = {}
    const productSet = {}
    weekData.producciones.forEach(prod => {
      const sucKey = prod.sucursal_nombre || prod.sucursal || ''
      if (!sucursalesMap[sucKey]) {
        sucursalesMap[sucKey] = { nombre: sucKey, total_sucursal: 0, productoTotalMap: {}, empleadosMap: {} }
      }
      const suc = sucursalesMap[sucKey]
      ;(prod.DetalleLotes || []).forEach(det => {
        const prodName = det.producto_nombre || ''
        const prodId = det.idproducto || prodName
        const empName = det.empleado_completo || 'Sin empleado'
        const cant = Number(det.cantidad || 0)
        if (!productSet[prodId]) productSet[prodId] = { idproducto: prodId, producto: prodName }
        suc.total_sucursal += cant
        suc.productoTotalMap[prodId] = (suc.productoTotalMap[prodId] || 0) + cant
        if (!suc.empleadosMap[empName]) suc.empleadosMap[empName] = { nombre: empName, productoMap: {}, total_empleado: 0 }
        const emp = suc.empleadosMap[empName]
        emp.productoMap[prodId] = (emp.productoMap[prodId] || 0) + cant
        emp.total_empleado += cant
      })
    })
    const sucursales = Object.values(sucursalesMap).map(s => ({ ...s, empleados: Object.values(s.empleadosMap) }))
    const productosUnicos = Object.values(productSet)
    const totalPorProducto = {}
    productosUnicos.forEach(prod => {
      totalPorProducto[prod.idproducto] = sucursales.reduce((sum, s) => sum + (s.productoTotalMap[prod.idproducto] || 0), 0)
    })
    result[monday] = { sucursales, productosUnicos, totalPorProducto, totalGlobal: sucursales.reduce((s, su) => s + su.total_sucursal, 0) }
  })
  return result
})

const weeklyInsumos = computed(() => {
  const result = {}
  const weeks = {}
  const prods = [...(props.detallado?.producciones || [])]
  prods.forEach(p => {
    const fecha = p.fechaproduccion
    if (!fecha) return
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) weeks[monday] = { producciones: [] }
    weeks[monday].producciones.push(p)
  })
  Object.entries(weeks).forEach(([monday, weekData]) => {
    const sucMap = {}
    const insSet = {}
    weekData.producciones.forEach(prod => {
      const sucKey = prod.sucursal_nombre || prod.sucursal || ''
      ;(prod.DetalleLotes || []).forEach(det => {
        ;(det.insumos_calculados || []).forEach(ins => {
          const insName = ins.insumo || ins.nombre || ''
          const unidad = ins.unidad || ''
          const cantIns = Number(ins.cantidad || ins.cantidad_total || 0)
          if (!sucMap[sucKey]) sucMap[sucKey] = { nombre: sucKey, insumoMap: {} }
          const s = sucMap[sucKey]
          s.insumoMap[insName] = (s.insumoMap[insName] || 0) + cantIns
          if (!insSet[insName]) insSet[insName] = { insumo: insName, unidad }
        })
      })
    })
    const insumosUnicos = Object.values(insSet)
    const totalPorInsumo = {}
    insumosUnicos.forEach(ins => {
      totalPorInsumo[ins.insumo] = Object.values(sucMap).reduce((sum, s) => sum + (s.insumoMap[ins.insumo] || 0), 0)
    })
    result[monday] = { sucursales: Object.values(sucMap), insumosUnicos, totalPorInsumo }
  })
  return result
})

const weeklyDetallado = computed(() => {
  if (!props.agruparPorSemana || !props.detallado?.producciones) return []
  const weeks = {}
  const prods = [...props.detallado.producciones]
  prods.forEach(p => {
    const fecha = p.fechaproduccion ? p.fechaproduccion.split('T')[0] : 'N/A'
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) weeks[monday] = { fecha: monday, days: [] }
    const existing = weeks[monday].days.find(d => d.fecha === fecha)
    if (existing) {
      existing.producciones.push(p)
    } else {
      weeks[monday].days.push({ fecha, producciones: [p] })
    }
  })
  return Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const getWeeklyDays = (fecha) => weeklyDetallado.value.find(w => w.fecha === fecha)?.days || []

// Lista plana de todas las producciones para la tabla principal
const todasLasProducciones = computed(() => {
  if (!props.detallado || !props.detallado.producciones) return []
  return [...props.detallado.producciones].sort((a, b) => new Date(b.fechaproduccion) - new Date(a.fechaproduccion))
})

// Agrupación por fecha
const produccionesPorFecha = computed(() => {
  const grouped = {}
  todasLasProducciones.value.forEach(prod => {
    const fecha = prod.fechaproduccion ? prod.fechaproduccion.split('T')[0] : 'N/A'
    if (!grouped[fecha]) grouped[fecha] = { fecha, producciones: [] }
    grouped[fecha].producciones.push(prod)
  })
  return Object.values(grouped).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Lógica de expansión de filas
const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

const expandedWeeklyRows = ref(new Set())
const toggleWeeklyRow = (id) => {
  const newSet = new Set(expandedWeeklyRows.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  expandedWeeklyRows.value = newSet
}
const isWeeklyRowExpanded = (id) => expandedWeeklyRows.value.has(id)

const produccionSemanalDetalle = computed(() => {
  const weeks = {}
  const producciones = props.detallado?.producciones || []
  if (!Array.isArray(producciones)) return []
  producciones.forEach(prod => {
    const fecha = prod.fechaproduccion ? prod.fechaproduccion.split('T')[0] : 'N/A'
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantSesiones: 0, totalProducido: 0, costoTotal: 0, detalle: [] }
    }
    const w = weeks[monday]
    w.cantSesiones++
    w.totalProducido += Number(prod.CANTIDAD_TOTAL_PRODUCIDA || 0)
    w.costoTotal += parseFloat(prod.COSTO_TOTAL || 0)
    ;(prod.DetalleLotes || []).forEach(lote => {
      const key = lote.empleado_completo + '|' + lote.producto_nombre
      let existing = w.detalle.find(d => d.empleado === lote.empleado_completo && d.producto === lote.producto_nombre)
      if (existing) {
        existing.cantidad += Number(lote.cantidad || 0)
        existing.costo += Number(lote.cantidad || 0) * parseFloat(lote.costo_unitario || 0)
      } else {
        w.detalle.push({
          empleado: lote.empleado_completo,
          producto: lote.producto_nombre,
          cantidad: Number(lote.cantidad || 0),
          costo: Number(lote.cantidad || 0) * parseFloat(lote.costo_unitario || 0)
        })
      }
    })
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana))
})

const expandedRows = ref([])
const toggleRow = (id) => {
  const index = expandedRows.value.indexOf(id)
  if (index > -1) expandedRows.value.splice(index, 1)
  else expandedRows.value.push(id)
}
const isRowExpanded = (id) => expandedRows.value.includes(id)
const expandAll = () => expandedRows.value = todasLasProducciones.value.map(p => p.idproduccion)
const collapseAll = () => expandedRows.value = []

// Charts
const sucursalChartRef = ref(null)
const productoChartRef = ref(null)
const generalWeekChartRef = ref(null)
let sucursalChartInstance = null
let productoChartInstance = null
let generalWeekChartInstance = null

const chartSucursales = computed(() => processedConsolidado.value.sucursales.map(s => s.nombre))
const chartSucursalesTotales = computed(() => processedConsolidado.value.sucursales.map(s => s.total_sucursal))

const chartProductos = computed(() => processedConsolidado.value.productosUnicos.map(p => p.producto))
const chartProductosCant = computed(() => processedConsolidado.value.productosUnicos.map(p =>
  processedConsolidado.value.totalPorProducto[p.idproducto] || 0
))

const weeklyChartLabels = computed(() => produccionSemanalDetalle.value.map(w => w.semanaLabel))
const weeklyChartValues = computed(() => produccionSemanalDetalle.value.map(w => w.totalProducido))

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
      })
    } else {
      if (weeklyChartInstances.value[key]) {
        weeklyChartInstances.value[key].destroy()
        delete weeklyChartInstances.value[key]
      }
    }
  })
}, { deep: true })

const weeklyColors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1','#84CC16']

const getWeekChartData = (weekKey) => {
  const sem = weeklyConsolidados.value[weekKey]
  if (!sem || !sem.sucursales) return null
  return {
    labels: sem.sucursales.map(s => s.nombre),
    values: sem.sucursales.map(s => s.total_sucursal),
    colors: weeklyColors.slice(0, sem.sucursales.length)
  }
}

const renderCharts = () => {
  if (sucursalChartInstance) { sucursalChartInstance.destroy(); sucursalChartInstance = null }
  if (productoChartInstance) { productoChartInstance.destroy(); productoChartInstance = null }

  if (chartSucursales.value.length > 0 && sucursalChartRef.value) {
    sucursalChartInstance = new Chart(sucursalChartRef.value, {
      type: 'bar',
      data: {
        labels: chartSucursales.value,
        datasets: [{
          label: 'Producido',
          data: chartSucursalesTotales.value,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    })
  }

  if (chartProductos.value.length > 0 && productoChartRef.value) {
    const colors = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444', '#eab308', '#ec4899', '#6366f1']
    productoChartInstance = new Chart(productoChartRef.value, {
      type: 'doughnut',
      data: {
        labels: chartProductos.value,
        datasets: [{
          data: chartProductosCant.value,
          backgroundColor: colors.slice(0, chartProductos.value.length),
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } }
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
          label: 'Producción Total',
          data: weeklyChartValues.value,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    })
  }
}

watch(processedConsolidado, () => setTimeout(renderCharts, 100), { deep: true })
watch(produccionSemanalDetalle, () => setTimeout(renderCharts, 100), { deep: true })
onMounted(() => setTimeout(renderCharts, 200))
onBeforeUnmount(() => {
  if (sucursalChartInstance) sucursalChartInstance.destroy()
  if (productoChartInstance) productoChartInstance.destroy()
  if (generalWeekChartInstance) generalWeekChartInstance.destroy()
  Object.values(weeklyChartInstances.value).forEach(i => i.destroy())
})

defineExpose({
  expandAllSemanas: () => {
    produccionSemanalDetalle.value.forEach(sem => { expandedSemanas.value[sem.semana] = true })
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

/* Scrollbar personalizado para los detalles de insumos */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
