<template>
  <div class="space-y-10">
    <!-- Resumen Semanal (Acordeón) -->
    <div v-if="props.agruparPorSemana" class="space-y-4">
      <div v-if="weeklyChartLabels.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Evolución por Semana</h3>
        <div class="relative" style="height: 220px;">
          <canvas ref="generalWeekChartRef"></canvas>
        </div>
      </div>
      <div v-for="sem in processedTransferencias" :key="sem.fecha" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(sem.fecha)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.fecha] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
            <span class="text-xs text-gray-400">|</span>
            <span class="text-sm text-gray-500">{{ sem.transferencias.length }} transferencias</span>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Monto Total</p>
              <p class="text-sm font-black text-green-600">{{ formatCurrency(sem.transferencias.reduce((s,t) => s + parseFloat(t.montoTotal||0), 0)) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Comisiones</p>
              <p class="text-sm font-black text-blue-600">{{ formatCurrency(sem.transferencias.reduce((s,t) => s + parseFloat(t.comision||0), 0)) }}</p>
            </div>
          </div>
        </div>
        <div v-if="expandedSemanas[sem.fecha]" class="p-6 space-y-6">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-orange-100 rounded-xl">
                <ArrowRightLeft class="h-5 w-5 text-orange-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Resumen de Transferencias</h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(item, index) in weeklyConsolidados[sem.fecha]?.data || []" :key="index"
                   class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div class="p-4 bg-gradient-to-r from-orange-50 to-amber-50">
                  <div class="flex justify-between items-start mb-2">
                    <span :class="['px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase', item.tipo === 'EMPLEADO' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600']">
                      {{ item.tipo }}
                    </span>
                    <span class="text-xs font-bold text-gray-500">{{ item.nro_transferencias }} Transf.</span>
                  </div>
                  <h4 class="font-black text-gray-800 text-sm mb-1">{{ item.origen }}</h4>
                  <div class="flex items-center gap-2 text-gray-400">
                    <ArrowRight class="h-3 w-3" />
                    <span class="text-xs font-bold">{{ item.destino }}</span>
                  </div>
                </div>
                <div class="p-4 flex-1">
                  <div class="space-y-2">
                    <div v-for="(detalle, dIdx) in item.detalle_items" :key="dIdx" class="flex justify-between items-center text-xs">
                      <span class="text-gray-600 font-medium">{{ detalle.nombre_producto }}</span>
                      <span class="font-bold text-gray-800">x{{ detalle.cantidad_total }}</span>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                    <div class="flex justify-between text-xs">
                      <span class="text-gray-400 font-bold uppercase tracking-widest">Monto Total</span>
                      <span class="font-black text-orange-600">{{ Number(item.monto_total || 0).toFixed(2) }} Bs.</span>
                    </div>
                    <div class="flex justify-between text-xs" v-if="Number(item.comisiones_totales || 0) > 0">
                      <span class="text-gray-400 font-bold uppercase tracking-widest">Comisiones</span>
                      <span class="font-bold text-blue-600">{{ Number(item.comisiones_totales || 0).toFixed(2) }} Bs.</span>
                    </div>
                    <div class="flex justify-between text-xs" v-if="Number(item.panaderia_total || 0) > 0">
                      <span class="text-gray-400 font-bold uppercase tracking-widest">Panadería</span>
                      <span class="font-bold text-emerald-600">{{ Number(item.panaderia_total || 0).toFixed(2) }} Bs.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="expandedSemanas[sem.fecha]" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h5 class="text-sm font-bold text-gray-700 mb-3">Distribución de la Semana</h5>
            <div class="relative" style="height: 180px;">
              <canvas :id="'wchart-' + sem.fecha.replace(/[^a-zA-Z0-9]/g, '-')"></canvas>
            </div>
          </div>

          <!-- Detallado por Día -->
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
                  <span class="text-xs text-gray-500">({{ day.transferencias.length }} transferencias)</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/30">
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">ID / Hora</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Origen → Destino</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto / Insumo</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Precio Unit.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión Unit.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="trans in day.transferencias" :key="trans.idtransferencia">
                        <template v-for="(item, itemIdx) in (trans.detalles || [])" :key="trans.idtransferencia + '-' + itemIdx">
                          <tr class="hover:bg-gray-50/50 transition-colors group">
                            <td v-if="itemIdx === 0" :rowspan="(trans.detalles || []).length" class="p-3 border-b border-gray-100 text-[10px] align-top font-bold text-gray-500 bg-gray-50/10">
                              <div class="text-blue-600 mb-1">{{ trans.idtransferencia }}</div>
                              <div class="flex items-center gap-1 text-gray-400">
                                <Clock class="h-3 w-3" />
                                {{ trans.hora }}
                              </div>
                            </td>
                            <td v-if="itemIdx === 0" :rowspan="(trans.detalles || []).length" class="p-3 border-b border-gray-100 text-sm align-top bg-gray-50/10">
                              <div class="flex flex-col">
                                <span class="font-bold text-gray-700 text-xs">{{ trans.origen }}</span>
                                <div class="flex items-center gap-1 text-gray-300 my-0.5">
                                  <ArrowDown class="h-3 w-3" />
                                </div>
                                <span class="text-orange-600 font-bold text-xs">{{ trans.destino }}</span>
                              </div>
                            </td>
                            <td class="p-3 border-b border-gray-100 text-sm">
                              <div class="flex items-center gap-3">
                                <div v-if="item.imagen" class="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                  <img :src="item.imagen" class="w-full h-full object-cover" alt="item">
                                </div>
                                <div v-else class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Package class="h-4 w-4 text-gray-300" />
                                </div>
                                <div class="flex flex-col">
                                  <span :class="['text-[7px] font-black px-1 rounded w-fit mb-0.5 uppercase', item.tipo === 'Producto' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600']">
                                    {{ item.tipo }}
                                  </span>
                                  <span class="font-bold text-gray-800 text-xs">{{ item.nombre }}</span>
                                </div>
                              </div>
                            </td>
                            <td class="p-3 border-b border-gray-100 text-xs font-medium text-gray-600">{{ item.presentacion }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-gray-600 text-center font-black">{{ item.cantidad }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-gray-500 text-right font-medium">{{ item.precio > 0 ? parseFloat(item.precio).toFixed(2) + ' Bs.' : '-' }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-blue-600 text-right font-bold">{{ item.comision > 0 ? parseFloat(item.comision).toFixed(2) + ' Bs.' : '-' }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-gray-800 text-right font-black">{{ item.subtotal > 0 ? parseFloat(item.subtotal).toFixed(2) + ' Bs.' : '-' }}</td>
                            <td v-if="itemIdx === 0" :rowspan="(trans.detalles || []).length" class="p-3 border-b border-gray-100 text-sm text-center align-top bg-gray-50/10">
                              <span :class="['px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider', trans.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                                {{ trans.estado === 1 ? 'Activo' : 'Anulado' }}
                              </span>
                            </td>
                          </tr>
                        </template>
                        <tr class="bg-blue-50/20">
                          <td colspan="7" class="p-2 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Totales de la Transferencia:</td>
                          <td class="p-2 text-right border-b">
                            <div class="flex flex-col items-end">
                              <span class="text-xs font-black text-gray-800">{{ parseFloat(trans.montoTotal).toFixed(2) }} Bs.</span>
                              <span v-if="trans.comision > 0" class="text-[9px] font-bold text-blue-600">Comisión: {{ parseFloat(trans.comision).toFixed(2) }} Bs.</span>
                            </div>
                          </td>
                          <td class="border-b"></td>
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
      <div v-if="processedTransferencias.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- Resumen Consolidado de Transferencias -->
    <div v-if="consolidado && consolidado.data && !props.agruparPorSemana" class="animate-fade-in-up space-y-10">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-orange-100 rounded-xl">
          <ArrowRightLeft class="h-6 w-6 text-orange-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-800">Resumen de Transferencias</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(item, index) in consolidado.data" :key="index" 
             class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 bg-gradient-to-r from-orange-50 to-amber-50">
            <div class="flex justify-between items-start mb-2">
              <span :class="['px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase', item.tipo === 'EMPLEADO' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600']">
                {{ item.tipo }}
              </span>
              <span class="text-xs font-bold text-gray-500">{{ item.nro_transferencias }} Transf.</span>
            </div>
            <h4 class="font-black text-gray-800 text-sm mb-1">{{ item.origen }}</h4>
            <div class="flex items-center gap-2 text-gray-400">
              <ArrowRight class="h-3 w-3" />
              <span class="text-xs font-bold">{{ item.destino }}</span>
            </div>
          </div>

          <div class="p-4 flex-1">
            <div class="space-y-3">
              <div v-for="(detalle, dIdx) in item.detalle_items" :key="dIdx" class="flex justify-between items-center text-xs">
                <span class="text-gray-600 font-medium">{{ detalle.nombre_producto }}</span>
                <span class="font-bold text-gray-800">x{{ detalle.cantidad_total }}</span>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-gray-400 font-bold uppercase tracking-widest">Monto Total</span>
                <span class="font-black text-orange-600">{{ parseFloat(item.monto_total || 0).toFixed(2) }} Bs.</span>
              </div>
              <div class="flex justify-between text-xs" v-if="parseFloat(item.comisiones_totales || 0) > 0">
                <span class="text-gray-400 font-bold uppercase tracking-widest">Comisiones</span>
                <span class="font-bold text-blue-600">{{ parseFloat(item.comisiones_totales || 0).toFixed(2) }} Bs.</span>
              </div>
              <div class="flex justify-between text-xs" v-if="parseFloat(item.panaderia_total || 0) > 0">
                <span class="text-gray-400 font-bold uppercase tracking-widest">Panadería</span>
                <span class="font-bold text-emerald-600">{{ parseFloat(item.panaderia_total || 0).toFixed(2) }} Bs.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div v-if="chartLabels.length > 0 && !props.agruparPorSemana" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">{{ props.agruparPorSemana ? 'Transferencias por Semana' : 'Transferencias por Día' }}</h3>
        <div class="relative" style="height: 260px;">
          <canvas ref="transfersChartRef"></canvas>
        </div>
      </div>
      <div v-if="sucursalLabels.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Cantidad Transferida por Sucursal</h3>
        <div class="relative" style="height: 260px;">
          <canvas ref="sucursalChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Detalle Cronológico de Transferencias -->
    <div v-if="!props.agruparPorSemana" class="animate-fade-in-up" style="animation-delay: 0.1s">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-xl">
            <List class="h-6 w-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">Historial Detallado</h3>
        </div>

        <!-- Resumen Global (si existe) -->
        <div v-if="transferencias && transferencias.resumenGlobal" class="flex gap-4">
          <div class="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-[8px] text-gray-400 uppercase font-black">Total Monto</p>
            <p class="text-sm font-black text-orange-600">{{ parseFloat(transferencias.resumenGlobal.totalMonto || 0).toFixed(2) }} Bs.</p>
          </div>
          <div class="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-[8px] text-gray-400 uppercase font-black">Comisiones</p>
            <p class="text-sm font-black text-blue-600">{{ parseFloat(transferencias.resumenGlobal.totalComisiones || 0).toFixed(2) }} Bs.</p>
          </div>
          <div class="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-[8px] text-gray-400 uppercase font-black">Panadería</p>
            <p class="text-sm font-black text-emerald-600">{{ parseFloat(transferencias.resumenGlobal.totalPanaderia || 0).toFixed(2) }} Bs.</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="expandAll" class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Expandir todo</button>
          <button @click="collapseAll" class="text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Contraer todo</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="group in processedTransferencias" :key="group.fecha" 
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
                <span class="text-xs text-gray-500">{{ group.transferencias.length }} transferencias registradas</span>
              </div>
            </div>
          </button>

          <div v-show="isExpanded(group.fecha)" class="overflow-x-auto border-t border-gray-100">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/30">
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">ID / Hora</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Origen → Destino</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto / Insumo</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Precio Unit.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión Unit.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="trans in group.transferencias" :key="trans.idtransferencia">
                  <tr v-for="(item, itemIdx) in trans.detalles" :key="trans.idtransferencia + '-' + itemIdx" 
                      class="hover:bg-gray-50/50 transition-colors group">
                    <!-- Datos de la Transferencia (Agrupados) -->
                    <td v-if="itemIdx === 0" :rowspan="trans.detalles.length" class="p-4 border-b border-gray-100 text-[10px] align-top font-bold text-gray-500 bg-gray-50/10">
                      <div class="text-blue-600 mb-1">{{ trans.idtransferencia }}</div>
                      <div class="flex items-center gap-1 text-gray-400">
                        <Clock class="h-3 w-3" />
                        {{ trans.hora }}
                      </div>
                    </td>
                    <td v-if="itemIdx === 0" :rowspan="trans.detalles.length" class="p-4 border-b border-gray-100 text-sm align-top bg-gray-50/10">
                      <div class="flex flex-col">
                        <span class="font-bold text-gray-700 text-xs">{{ trans.origen }}</span>
                        <div class="flex items-center gap-1 text-gray-300 my-0.5">
                          <ArrowDown class="h-3 w-3" />
                        </div>
                        <span class="text-orange-600 font-bold text-xs">{{ trans.destino }}</span>
                      </div>
                    </td>

                    <!-- Detalle del Item (Agrupado por Producto) -->
                    <td v-if="item.isFirstInProduct" :rowspan="item.productRowspan" class="p-4 border-b border-gray-100 text-sm align-top">
                      <div class="flex items-center gap-3">
                        <div v-if="item.imagen" class="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                          <img :src="item.imagen" class="w-full h-full object-cover" alt="item">
                        </div>
                        <div v-else class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package class="h-4 w-4 text-gray-300" />
                        </div>
                        <div class="flex flex-col">
                          <span :class="['text-[7px] font-black px-1 rounded w-fit mb-0.5 uppercase', item.tipo === 'Producto' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600']">
                            {{ item.tipo }}
                          </span>
                          <span class="font-bold text-gray-800 text-xs">{{ item.nombre }}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td class="p-4 border-b border-gray-100 text-xs font-medium text-gray-600">
                      {{ item.presentacion }}
                    </td>

                    <td class="p-4 border-b border-gray-100 text-sm text-gray-600 text-center font-black">
                      {{ item.cantidad }}
                    </td>

                    <td class="p-4 border-b border-gray-100 text-sm text-gray-500 text-right font-medium">
                      {{ item.precio > 0 ? parseFloat(item.precio).toFixed(2) + ' Bs.' : '-' }}
                    </td>

                    <td class="p-4 border-b border-gray-100 text-sm text-blue-600 text-right font-bold">
                      {{ item.comision > 0 ? parseFloat(item.comision).toFixed(2) + ' Bs.' : '-' }}
                    </td>

                    <td class="p-4 border-b border-gray-100 text-sm text-gray-800 text-right font-black">
                      {{ item.subtotal > 0 ? parseFloat(item.subtotal).toFixed(2) + ' Bs.' : '-' }}
                    </td>

                    <!-- Estado (Agrupado) -->
                    <td v-if="itemIdx === 0" :rowspan="trans.detalles.length" class="p-4 border-b border-gray-100 text-sm text-center align-top bg-gray-50/10">
                      <span :class="[
                        'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider',
                        trans.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      ]">
                        {{ trans.estado === 1 ? 'Activo' : 'Anulado' }}
                      </span>
                    </td>
                  </tr>
                  <!-- Fila de Totales de la Transferencia -->
                  <tr class="bg-blue-50/20">
                    <td colspan="7" class="p-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Totales de la Transferencia:</td>
                    <td class="p-3 text-right border-b">
                       <div class="flex flex-col items-end">
                         <span class="text-xs font-black text-gray-800">{{ parseFloat(trans.montoTotal).toFixed(2) }} Bs.</span>
                         <span v-if="trans.comision > 0" class="text-[9px] font-bold text-blue-600">Comisión: {{ parseFloat(trans.comision).toFixed(2) }} Bs.</span>
                       </div>
                    </td>
                    <td class="border-b"></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="processedTransferencias.length === 0" class="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
          <div class="flex flex-col items-center gap-3">
            <div class="p-4 bg-gray-50 rounded-full">
              <Search class="h-8 w-8 text-gray-300" />
            </div>
            <p class="text-gray-500 font-medium">No se encontraron transferencias en este periodo.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { 
  ArrowRightLeft, ArrowRight, ArrowDown, List, Calendar, 
  Clock, ChevronDown, Search, Package
} from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  transferencias: {
    type: Object,
    default: () => ({ data: [] })
  },
  consolidado: {
    type: Object,
    default: () => ({ data: [] })
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

// Procesar transferencias detalladas para agrupar por fecha y aplanar presentaciones
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

const processedTransferencias = computed(() => {
  const data = props.transferencias?.data || props.transferencias?.transferencias || (Array.isArray(props.transferencias) ? props.transferencias : []);
  if (!data || !Array.isArray(data)) return [];
  
  const groups = {};
  data.forEach(t => {
    const fecha = t.fecha ? t.fecha.split('T')[0] : 'N/A';
    if (!groups[fecha]) {
      groups[fecha] = {
        fecha,
        transferencias: []
      };
    }
    
    // Aplanar productos e insumos para que cada presentación/medida sea una fila
    const flattenedDetalles = [];
    
    if (t.Productos) {
      t.Productos.forEach(p => {
        const presentations = p.presentaciones || [];
        const rowspan = presentations.length || 1;
        
        if (presentations.length > 0) {
          presentations.forEach((pr, prIdx) => {
            flattenedDetalles.push({
              tipo: 'Producto',
              nombre: p.producto_nombre,
              imagen: p.producto_imagen,
              presentacion: pr.presentacion,
              cantidad: pr.cantidad,
              precio: pr.precio_venta || 0,
              comision: pr.comision_unitaria || 0,
              subtotal: (parseFloat(pr.cantidad) * parseFloat(pr.precio_venta || 0)),
              isFirstInProduct: prIdx === 0,
              productRowspan: rowspan
            });
          });
        } else {
           flattenedDetalles.push({
              tipo: 'Producto',
              nombre: p.producto_nombre,
              imagen: p.producto_imagen,
              presentacion: 'N/A',
              cantidad: p.total_cantidad,
              precio: 0,
              comision: 0,
              subtotal: p.MontoTotalProductos || 0,
              isFirstInProduct: true,
              productRowspan: 1
            });
        }
      });
    }
    
    if (t.Insumos) {
      t.Insumos.forEach(i => {
        const measures = i.medidas || [];
        const rowspan = measures.length || 1;

        if (measures.length > 0) {
          measures.forEach((m, mIdx) => {
            flattenedDetalles.push({
              tipo: 'Insumo',
              nombre: i.insumo_nombre,
              imagen: i.insumo_imagen,
              presentacion: m.unidad || m.abreviatura,
              cantidad: m.cantidad,
              precio: 0,
              comision: 0,
              subtotal: 0,
              isFirstInProduct: mIdx === 0,
              productRowspan: rowspan
            });
          });
        } else {
          flattenedDetalles.push({
            tipo: 'Insumo',
            nombre: i.insumo_nombre,
            imagen: i.insumo_imagen,
            presentacion: 'Unidad',
            cantidad: i.total_cantidad,
            precio: 0,
            comision: 0,
            subtotal: 0,
            isFirstInProduct: true,
            productRowspan: 1
          });
        }
      });
    }
    
    groups[fecha].transferencias.push({
      fecha,
      idtransferencia: t.idtransferencia,
      hora: t.hora,
      origen: t.SucursalOrigen,
      destino: t.SucursalDestino || t.EmpleadoDestino || 'N/A',
      montoTotal: t.MontoTotalProductos || 0,
      comision: t.TotalComision || 0,
      estado: t.estado,
      detalles: flattenedDetalles.length > 0 ? flattenedDetalles : [{ tipo: 'S/D', nombre: 'Sin detalles', presentacion: '-', cantidad: '-' }]
    });
  });
  
  let dayGroups = Object.values(groups).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (props.agruparPorSemana) {
    const weeks = {}
    dayGroups.forEach(group => {
      const monday = getWeekMonday(group.fecha)
      if (!weeks[monday]) {
        weeks[monday] = { fecha: monday, semanaLabel: getWeekLabel(monday), transferencias: [] }
      }
      weeks[monday].transferencias.push(...group.transferencias)
    })
    dayGroups = Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }

  return dayGroups;
});

const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

const getWeeklyDays = (monday) => {
  const sem = processedTransferencias.value.find(w => w.fecha === monday)
  if (!sem) return []
  const days = {}
  sem.transferencias.forEach(t => {
    const d = t.fecha || 'N/A'
    if (!days[d]) days[d] = { fecha: d, transferencias: [] }
    days[d].transferencias.push(t)
  })
  return Object.values(days).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

const weeklyConsolidados = computed(() => {
  const result = {}
  processedTransferencias.value.forEach(sem => {
    const data = sem.transferencias || []
    const paired = {}
    data.forEach(t => {
      const key = (t.origen || '') + '|' + (t.destino || '')
      if (!paired[key]) paired[key] = { origen: t.origen || '', destino: t.destino || '', tipo: '', nro_transferencias: 0, monto_total: 0, comisiones_totales: 0, panaderia_total: 0, detalle_items: {} }
      const p = paired[key]
      p.nro_transferencias += 1
      p.monto_total += Number(t.montoTotal || 0)
      p.comisiones_totales += Number(t.comision || 0)
      ;(t.detalles || []).forEach(det => {
        const detKey = det.nombre || ''
        if (!p.detalle_items[detKey]) p.detalle_items[detKey] = { nombre_producto: detKey, cantidad_total: 0 }
        p.detalle_items[detKey].cantidad_total += Number(det.cantidad || 1)
      })
    })
    result[sem.fecha] = { data: Object.values(paired).map(p => ({ ...p, detalle_items: Object.values(p.detalle_items) })) }
  })
  return result
})

const formatCurrency = (val) => Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const transferenciasPorSemana = computed(() => {
  const weeks = {}
  const data = props.transferencias?.data || props.transferencias?.transferencias || (Array.isArray(props.transferencias) ? props.transferencias : [])
  if (!Array.isArray(data)) return []
  data.forEach(t => {
    const fecha = t.fecha ? t.fecha.split('T')[0] : 'N/A'
    const monday = getWeekMonday(fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantTransferencias: 0, montoTotal: 0, comisionesTotal: 0 }
    }
    weeks[monday].cantTransferencias++
    weeks[monday].montoTotal += parseFloat(t.MontoTotalProductos || 0)
    weeks[monday].comisionesTotal += parseFloat(t.TotalComision || 0)
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana))
})

// Lógica de Acordeón
const expandedDates = ref([])
const toggleDate = (fecha) => {
  const index = expandedDates.value.indexOf(fecha)
  if (index > -1) expandedDates.value.splice(index, 1)
  else expandedDates.value.push(fecha)
}
const isExpanded = (fecha) => expandedDates.value.includes(fecha)
const expandAll = () => expandedDates.value = processedTransferencias.value.map(g => g.fecha)
const collapseAll = () => expandedDates.value = []

// Charts
const transfersChartRef = ref(null)
const sucursalChartRef = ref(null)
const generalWeekChartRef = ref(null)
let transfersChartInstance = null
let sucursalChartInstance = null
let generalWeekChartInstance = null

const chartLabels = computed(() => processedTransferencias.value.map(g => g.semanaLabel || g.fecha))
const chartMontos = computed(() => processedTransferencias.value.map(g =>
  g.transferencias.reduce((sum, t) => sum + parseFloat(t.montoTotal || 0), 0)
))

const weeklyChartLabels = computed(() => transferenciasPorSemana.value.map(w => w.semanaLabel))
const weeklyChartValues = computed(() => transferenciasPorSemana.value.map(w => w.montoTotal))

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
  if (!sem || !sem.data) return null
  return {
    labels: sem.data.map(d => d.origen + ' → ' + d.destino),
    values: sem.data.map(d => d.monto_total),
    colors: weeklyColors.slice(0, sem.data.length)
  }
}

const sucursalLabels = computed(() => {
  const map = {};
  processedTransferencias.value.forEach(group => {
    group.transferencias.forEach(trans => {
      if (!map[trans.origen]) map[trans.origen] = 0;
      trans.detalles.forEach(item => {
        map[trans.origen] += Number(item.cantidad) || 0;
      });
    });
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([nombre]) => nombre);
});

const sucursalValues = computed(() => {
  const map = {};
  processedTransferencias.value.forEach(group => {
    group.transferencias.forEach(trans => {
      if (!map[trans.origen]) map[trans.origen] = 0;
      trans.detalles.forEach(item => {
        map[trans.origen] += Number(item.cantidad) || 0;
      });
    });
  });
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return entries.map(([, valor]) => valor);
});

const renderCharts = () => {
  if (transfersChartInstance) { transfersChartInstance.destroy(); transfersChartInstance = null }
  if (sucursalChartInstance) { sucursalChartInstance.destroy(); sucursalChartInstance = null }

  if (chartLabels.value.length > 0 && transfersChartRef.value) {
    transfersChartInstance = new Chart(transfersChartRef.value, {
      type: 'bar',
      data: {
        labels: chartLabels.value.map(l => props.formatFecha(l)),
        datasets: [{
          label: 'Monto',
          data: chartMontos.value,
          backgroundColor: 'rgba(234, 88, 12, 0.7)',
          borderColor: 'rgba(234, 88, 12, 1)',
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

  if (sucursalLabels.value.length > 0 && sucursalChartRef.value) {
    const colors = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444', '#eab308', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e']
    sucursalChartInstance = new Chart(sucursalChartRef.value, {
      type: 'doughnut',
      plugins: [ChartDataLabels],
      data: {
        labels: sucursalLabels.value,
        datasets: [{
          data: sucursalValues.value,
          backgroundColor: colors.slice(0, sucursalLabels.value.length),
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 9 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} uds.` } },
          datalabels: {
            color: '#fff', font: { weight: 'bold', size: 10 },
            formatter: (value) => value + ' uds.',
            anchor: 'center', align: 'center',
            display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0
          }
        }
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
          label: 'Monto Total (Bs.)',
          data: weeklyChartValues.value,
          backgroundColor: 'rgba(234, 88, 12, 0.7)',
          borderColor: 'rgba(234, 88, 12, 1)',
          borderWidth: 2, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' Bs.' } } }
      }
    })
  }
}

watch(processedTransferencias, () => setTimeout(renderCharts, 100), { deep: true })
watch(transferenciasPorSemana, () => setTimeout(renderCharts, 100), { deep: true })
onMounted(() => setTimeout(renderCharts, 200))
onBeforeUnmount(() => {
  if (transfersChartInstance) transfersChartInstance.destroy()
  if (sucursalChartInstance) sucursalChartInstance.destroy()
  if (generalWeekChartInstance) generalWeekChartInstance.destroy()
  Object.values(weeklyChartInstances.value).forEach(i => i.destroy())
})

defineExpose({
  expandAllSemanas: () => {
    processedTransferencias.value.forEach(sem => { expandedSemanas.value[sem.fecha] = true })
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
