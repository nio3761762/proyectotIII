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
      <div v-for="sem in ventasSemanalDetalle" :key="sem.semana" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(sem.semana)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.semana] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
            <span class="text-xs text-gray-400">|</span>
            <span class="text-sm text-gray-500">{{ sem.cantVentas }} ventas</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Total Ingresos</p>
              <p class="text-sm font-black text-green-600">{{ formatCurrency(sem.totalIngresos) }}</p>
            </div>
            <div v-if="sem.totalGastoExtra > 0" class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Gasto Extra</p>
              <p class="text-sm font-black text-orange-500">{{ formatCurrency(sem.totalGastoExtra) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Total Neto</p>
              <p class="text-sm font-black text-green-600">{{ formatCurrency(sem.totalIngresos - sem.totalGastoExtra) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Promedio</p>
              <p class="text-sm font-black text-blue-600">{{ formatCurrency(sem.promedioVenta) }}</p>
            </div>
          </div>
        </div>
        <div v-if="expandedSemanas[sem.semana]" class="p-6 space-y-6">
          <!-- Ventas por Sucursal -->
          <div v-if="weeklyConsolidados[sem.semana]?.ventasPorSucursal?.length">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-indigo-100 rounded-xl">
                <Store class="h-5 w-5 text-indigo-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Ventas por Sucursal</h4>
            </div>
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-gray-50/50">
                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Sucursal</th>
                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Ventas</th>
                    <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="suc in weeklyConsolidados[sem.semana]?.ventasPorSucursal || []" :key="suc.nombre" class="hover:bg-gray-50/30 transition-colors">
                    <td class="p-4 text-sm font-bold text-gray-700">{{ suc.nombre }}</td>
                    <td class="p-4 text-sm text-gray-600 text-center">{{ suc.cant_ventas }}</td>
                    <td class="p-4 text-sm font-bold text-indigo-600 text-right">{{ Number(suc.total).toFixed(2) }} Bs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Métodos de Pago -->
          <div v-if="weeklyConsolidados[sem.semana]?.metodosPago?.length">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-emerald-100 rounded-xl">
                <CreditCard class="h-5 w-5 text-emerald-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Uso de Métodos de Pago</h4>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="metodo in weeklyConsolidados[sem.semana]?.metodosPago || []" :key="metodo.nombre"
                   class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p class="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">{{ metodo.nombre }}</p>
                  <p class="text-2xl font-black text-emerald-600">{{ Number(metodo.total).toFixed(2) }} <span class="text-xs">Bs.</span></p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-700">{{ metodo.cantidad }}</p>
                  <p class="text-[10px] text-gray-400 uppercase">Transacciones</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="expandedSemanas[sem.semana]" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h5 class="text-sm font-bold text-gray-700 mb-3">Distribución de la Semana</h5>
            <div class="relative" style="height: 180px;">
              <canvas :id="'wchart-' + sem.semana.replace(/[^a-zA-Z0-9]/g, '-')"></canvas>
            </div>
          </div>

          <!-- Detallado por Día -->
          <div v-if="getWeeklyDays(sem.semana).length > 0">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 rounded-xl">
                <List class="h-5 w-5 text-blue-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Detallado por Día</h4>
            </div>
            <div class="space-y-4">
              <div v-for="day in getWeeklyDays(sem.semana)" :key="day.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-3">
                  <Calendar class="h-4 w-4 text-blue-500" />
                  <span class="font-bold text-gray-700 text-sm">{{ formatFecha(day.fecha) }}</span>
                  <span class="text-xs text-gray-500">({{ day.ventas.length }} transacciones)</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/30">
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Cliente</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto / Detalle</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Unitario</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Venta</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Gasto Extra</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Neto</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Factura</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="(ventaData, idx) in day.ventas" :key="ventaData.idVenta + idx">
                        <tr class="hover:bg-gray-50/50 transition-colors group">
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan"
                              class="p-3 border-b border-gray-100 text-sm align-top font-bold text-gray-700">
                            <div class="flex items-center gap-2">
                              <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                {{ ventaData.cliente.charAt(0) }}
                              </div>
                              <span class="truncate max-w-[120px]">{{ ventaData.cliente }}</span>
                            </div>
                          </td>
                          <td class="p-3 border-b border-gray-100 text-sm text-gray-600">{{ ventaData.producto }}</td>
                          <td class="p-3 border-b border-gray-100 text-sm text-gray-600 text-center font-bold">{{ ventaData.cantidad }}</td>
                          <td class="p-3 border-b border-gray-100 text-sm text-gray-600 text-right">{{ ventaData.precio }} Bs.</td>
                          <td class="p-3 border-b border-gray-100 text-sm font-bold text-gray-800 text-right">{{ ventaData.subtotal }} Bs.</td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan"
                              class="p-3 border-b border-gray-100 text-sm font-black text-blue-700 text-right align-top bg-blue-50/20">
                            {{ ventaData.precioTotalVenta }} Bs.
                          </td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan"
                              class="p-3 border-b border-gray-100 text-sm font-bold text-orange-600 text-right align-top bg-orange-50/20">
                            {{ ventaData.gastoextra && parseFloat(ventaData.gastoextra) > 0 ? ventaData.gastoextra + ' Bs.' : '-' }}
                          </td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan"
                              class="p-3 border-b border-gray-100 text-sm font-black text-green-700 text-right align-top bg-green-50/20">
                            {{ ventaData.totalNeto }} Bs.
                          </td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-center align-top">
                            <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', ventaData.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                              {{ ventaData.estado }}
                            </span>
                          </td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-center align-top">
                            <div v-if="ventaData.hasFactura" class="flex items-center justify-center">
                              <a :href="ventaData.urlFactura" target="_blank"
                                 class="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold transition-colors bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                <FileText class="h-3 w-3" />
                                <span class="text-xs">{{ ventaData.nroFactura?.split('-').pop() }}</span>
                              </a>
                            </div>
                            <span v-else class="text-gray-400 text-xs italic">S/F</span>
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
      <div v-if="ventasSemanalDetalle.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- Resumen Consolidado -->
    <div v-if="consolidado && !props.agruparPorSemana" class="animate-fade-in-up space-y-10">

      <!-- Charts -->
      <div v-if="chartLabels.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">{{ props.agruparPorSemana ? 'Ventas por Semana' : 'Ventas por Día' }}</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="ventasChartRef"></canvas>
          </div>
        </div>
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Ventas por Sucursal</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="sucursalChartRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Fila 1: Sucursales y Métodos de Pago -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Ranking de Sucursales -->
        <div v-if="consolidado.ventasPorSucursal && consolidado.ventasPorSucursal.length > 0">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-indigo-100 rounded-xl">
              <Store class="h-6 w-6 text-indigo-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-800">Ventas por Sucursal</h3>
          </div>
          <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-gray-50/50">
                  <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Sucursal</th>
                  <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Ventas</th>
                  <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                  <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Part.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="suc in consolidado.ventasPorSucursal" :key="suc.nombre" class="hover:bg-gray-50/30 transition-colors">
                  <td class="p-4 text-sm font-bold text-gray-700">{{ suc.nombre }}</td>
                  <td class="p-4 text-sm text-gray-600 text-center">{{ suc.cant_ventas }}</td>
                  <td class="p-4 text-sm font-bold text-indigo-600 text-right">{{ parseFloat(suc.total).toFixed(2) }} Bs.</td>
                  <td class="p-4 text-right">
                    <span class="text-xs font-black text-gray-400">{{ parseFloat(suc.participacion).toFixed(1) }}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Métodos de Pago -->
        <div v-if="consolidado.metodosPago && consolidado.metodosPago.length > 0">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-emerald-100 rounded-xl">
              <CreditCard class="h-6 w-6 text-emerald-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-800">Uso de Métodos de Pago</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="metodo in consolidado.metodosPago" :key="metodo.nombre" 
                 class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">{{ metodo.nombre }}</p>
                <p class="text-2xl font-black text-emerald-600">{{ parseFloat(metodo.total).toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-700">{{ metodo.cantidad }}</p>
                <p class="text-[10px] text-gray-400 uppercase">Transacciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila 2: Análisis Maestro de Productos (Nueva Estructura Backend) -->
      <div v-if="consolidado.productosTop && consolidado.productosTop.length > 0">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-orange-100 rounded-xl">
            <Package class="h-6 w-6 text-orange-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">Análisis de Productos y Presentaciones</h3>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div v-for="prod in consolidado.productosTop" :key="prod.idproducto" 
               class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <!-- Cabecera del Producto -->
            <div class="p-6 bg-gradient-to-r from-orange-50 to-amber-50 flex items-center justify-between">
              <div class="flex items-center gap-5">
                <div class="h-20 w-20 rounded-2xl bg-white p-1 shadow-sm border border-orange-100">
                  <img v-if="prod.imagen" :src="prod.imagen" :alt="prod.nombre" class="h-full w-full object-cover rounded-xl">
                  <div v-else class="h-full w-full flex items-center justify-center text-orange-200">
                    <Package class="h-10 w-10" />
                  </div>
                </div>
                <div>
                  <h4 class="font-black text-gray-800 text-xl">{{ prod.nombre }}</h4>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-xs font-bold text-orange-600 uppercase tracking-widest">{{ prod.presentaciones?.length || 0 }} presentaciones</span>
                    <span class="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span class="text-xs font-bold text-gray-500">{{ prod.total_unidades_vendidas }} unidades base</span>
                  </div>
                </div>
              </div>
              <div class="text-right border-l border-orange-200 pl-6">
                <p class="text-[10px] text-orange-400 uppercase font-black tracking-widest">Total Ingresos</p>
                <p class="text-2xl font-black text-orange-600">{{ parseFloat(prod.ingresos_totales).toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
            </div>

            <!-- Detalle de Variantes -->
            <div class="p-2 overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th class="px-4 py-3">Variante</th>
                    <th class="px-4 py-3 text-center">Contenido</th>
                    <th class="px-4 py-3 text-center">Cant. Vendida</th>
                      <th class="px-4 py-3 text-center">Total Cant.</th>
                    <th class="px-4 py-3 text-right">Subtotal Ingresos</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="pres in prod.presentaciones" :key="pres.presentacion" class="hover:bg-orange-50/30 transition-colors group">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <ChevronRight class="h-3 w-3 text-orange-300 group-hover:translate-x-1 transition-transform" />
                        <span class="text-sm font-bold text-gray-700">{{ pres.presentacion }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500">
                        {{ pres.unidades_por_presentacion }} und.
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center text-sm font-black text-gray-700">
                      {{ pres.cantidad_vendida }}
                    </td>
                    <td class="px-4 py-3 text-center text-sm font-black text-gray-700">
                      {{ pres.cantidad_vendida * pres.unidades_por_presentacion }}
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-bold text-green-600">
                      {{ parseFloat(pres.subtotal_ingresos).toFixed(2) }} Bs.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila 3: Promociones con Composición -->
      <div v-if="consolidado.promocionesTop && consolidado.promocionesTop.length > 0">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-purple-100 rounded-xl">
            <Star class="h-6 w-6 text-purple-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">Composición de Promociones</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="promo in consolidado.promocionesTop" :key="promo.nombre" 
               class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div class="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="h-16 w-16 rounded-2xl bg-white p-1 shadow-sm border border-purple-100">
                  <img v-if="promo.imagen" :src="promo.imagen" :alt="promo.nombre" class="h-full w-full object-cover rounded-xl">
                  <div v-else class="h-full w-full flex items-center justify-center text-purple-200">
                    <Star class="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h4 class="font-black text-gray-800 text-lg">{{ promo.nombre }}</h4>
                  <p class="text-xs text-purple-600 font-bold uppercase tracking-widest">{{ promo.cantidad }} unidades vendidas</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-gray-400 uppercase font-black">Total Ingresos</p>
                <p class="text-xl font-black text-indigo-600">{{ parseFloat(promo.total).toFixed(2) }} Bs.</p>
              </div>
            </div>

            <div class="p-4 flex-1">
              <p class="text-[10px] text-gray-400 uppercase font-black mb-3 px-2">Contenido de la Promoción</p>
              <div v-if="promo.detalle_productos && promo.detalle_productos.length > 0" class="space-y-2">
                <div v-for="det in promo.detalle_productos" :key="det.producto + det.presentacion" 
                     class="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="h-2 w-2 rounded-full bg-purple-400"></div>
                    <div>
                      <p class="text-sm font-bold text-gray-700">{{ det.producto }}</p>
                      <p class="text-[10px] text-gray-500 uppercase font-bold">{{ det.presentacion }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xs font-black text-gray-800">x{{ det.cantidad_por_promo }} <span class="text-[10px] text-gray-400">en promo</span></p>
                    <p class="text-[10px] text-purple-600 font-bold">{{ det.total_unidades }} unidades totales</p>
                  </div>
                </div>
              </div>
              <div v-else class="p-8 text-center text-gray-400 text-xs italic">
                Sin detalles de composición disponibles
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Tabla Detallada por Fechas (Acordeón) -->
    <div v-if="!props.agruparPorSemana" class="animate-fade-in-up" style="animation-delay: 0.1s">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-xl">
            <List class="h-6 w-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">Detalle Cronológico de Ventas</h3>
        </div>
        <div class="flex gap-2">
          <button @click="expandAll" class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Expandir todo</button>
          <button @click="collapseAll" class="text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Contraer todo</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="dateGroup in sortedVentas" :key="dateGroup.fecha" 
             class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300">

          <button @click="toggleDate(dateGroup.fecha)" 
                  class="w-full p-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-4">
              <div :class="['p-2 rounded-xl transition-transform duration-300', isExpanded(dateGroup.fecha) ? 'rotate-180 bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-200']">
                <ChevronDown class="h-5 w-5" />
              </div>
              <div class="flex flex-col items-start text-left">
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-gray-400" />
                  <span class="font-bold text-gray-700">{{ dateGroup.semanaLabel || formatFecha(dateGroup.fecha) }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ dateGroup.ventas.length }} transacciones registradas</span>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="text-right">
                <p class="text-xs text-gray-400 uppercase font-black tracking-widest">Ingreso Total</p>
                <p class="text-lg font-black text-blue-600">{{ dateGroup.totalIngreso.toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
              <div v-if="dateGroup.totalGastoExtra > 0" class="text-right">
                <p class="text-xs text-gray-400 uppercase font-black tracking-widest">Gasto Extra</p>
                <p class="text-lg font-black text-orange-500">{{ dateGroup.totalGastoExtra.toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-400 uppercase font-black tracking-widest">Total Neto</p>
                <p class="text-lg font-black text-green-600">{{ (dateGroup.totalIngreso - dateGroup.totalGastoExtra).toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
            </div>
          </button>

          <div v-show="isExpanded(dateGroup.fecha)" class="overflow-x-auto border-t border-gray-100">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/30">
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Cliente</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto / Detalle</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Unitario</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Venta</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Gasto Extra</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Neto</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Factura</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(ventaData, idx) in dateGroup.ventas" :key="ventaData.idVenta + idx">
                  <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" 
                        class="p-4 border-b border-gray-100 text-sm align-top font-bold text-gray-700">
                      <div class="flex items-center gap-2">
                        <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                          {{ ventaData.cliente.charAt(0) }}
                        </div>
                        <span class="truncate max-w-[120px]">{{ ventaData.cliente }}</span>
                      </div>
                    </td>
                    <td class="p-4 border-b border-gray-100 text-sm text-gray-600">
                      {{ ventaData.producto }}
                    </td>
                    <td class="p-4 border-b border-gray-100 text-sm text-gray-600 text-center font-bold">
                      {{ ventaData.cantidad }}
                    </td>
                    <td class="p-4 border-b border-gray-100 text-sm text-gray-600 text-right">
                      {{ ventaData.precio }} Bs.
                    </td>
                    <td class="p-4 border-b border-gray-100 text-sm font-bold text-gray-800 text-right">
                      {{ ventaData.subtotal }} Bs.
                    </td>
                    <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" 
                        class="p-4 border-b border-gray-100 text-sm font-black text-blue-700 text-right align-top bg-blue-50/20">
                      {{ ventaData.precioTotalVenta }} Bs.
                    </td>
                    <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan"
                        class="p-4 border-b border-gray-100 text-sm font-bold text-orange-600 text-right align-top bg-orange-50/20">
                      {{ ventaData.gastoextra && parseFloat(ventaData.gastoextra) > 0 ? ventaData.gastoextra + ' Bs.' : '-' }}
                    </td>
                    <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan"
                        class="p-4 border-b border-gray-100 text-sm font-black text-green-700 text-right align-top bg-green-50/20">
                      {{ ventaData.totalNeto }} Bs.
                    </td>
                    <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-4 border-b border-gray-100 text-sm text-center align-top">
                      <span :class="[
                        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                        ventaData.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      ]">
                        {{ ventaData.estado }}
                      </span>
                    </td>
                    <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-4 border-b border-gray-100 text-sm text-center align-top">
                      <div v-if="ventaData.hasFactura" class="flex items-center justify-center">
                        <a :href="ventaData.urlFactura" target="_blank" 
                           class="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold transition-colors bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                          <FileText class="h-3 w-3" />
                          <span class="text-xs">{{ ventaData.nroFactura.split('-').pop() }}</span>
                        </a>
                      </div>
                      <span v-else class="text-gray-400 text-xs italic">S/F</span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="sortedVentas.length === 0" class="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
          <div class="flex flex-col items-center gap-3">
            <div class="p-4 bg-gray-50 rounded-full">
              <Search class="h-8 w-8 text-gray-300" />
            </div>
            <p class="text-gray-500 font-medium">No se encontraron ventas en este periodo.</p>
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
  Package, List, Calendar, FileText, Search, Star, 
  ChevronDown, Store, CreditCard, ChevronRight 
} from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  sortedVentas: {
    type: Array,
    required: true
  },
  formatFecha: {
    type: Function,
    required: true
  },
  consolidado: {
    type: Object,
    default: () => ({})
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

const getWeeklyDays = (weekKey) => {
  if (!props.agruparPorSemana || !props.sortedVentas) return []
  return props.sortedVentas.filter(g => getWeekMonday(g.fecha) === weekKey)
}

const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

const ventasSemanalDetalle = computed(() => {
  const weeks = {}
  props.sortedVentas.forEach(group => {
    const monday = getWeekMonday(group.fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantVentas: 0, totalIngresos: 0, totalGastoExtra: 0, detalle: [] }
    }
    const w = weeks[monday]
    w.cantVentas += group.ventas.length
    w.totalIngresos += (group.totalIngreso || 0)
    w.totalGastoExtra += (group.totalGastoExtra || 0)
    const detMap = {}
    group.ventas.forEach(v => {
      if (!detMap[v.cliente]) detMap[v.cliente] = { cliente: v.cliente, cantProductos: 0, totalVenta: 0 }
      detMap[v.cliente].cantProductos += parseInt(v.cantidad) || 1
      detMap[v.cliente].totalVenta += parseFloat(v.precioTotalVenta || 0)
    })
    Object.values(detMap).forEach(d => w.detalle.push(d))
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana)).map(w => ({
    ...w,
    promedioVenta: w.cantVentas > 0 ? w.totalIngresos / w.cantVentas : 0
  }))
})

const weeklyConsolidados = computed(() => {
  const weekMap = {}
  const groups = props.sortedVentas || []
  groups.forEach(group => {
    const weekKey = getWeekMonday(group.fecha)
    if (!weekMap[weekKey]) weekMap[weekKey] = { ventas: [] }
    ;(group.ventas || []).forEach(v => {
      weekMap[weekKey].ventas.push(v)
    })
  })
  const result = {}
  Object.entries(weekMap).forEach(([weekKey, weekData]) => {
    const ventas = weekData.ventas
    const sucMap = {}
    const metodoMap = {}
    ventas.forEach(v => {
      const suc = v.sucursal || 'Sin sucursal'
      if (!sucMap[suc]) sucMap[suc] = { nombre: suc, cant_ventas: 0, total: 0 }
      sucMap[suc].cant_ventas++
      sucMap[suc].total += Number(v.precioTotalVenta || 0)
      const metodo = v.metodo_pago || 'Efectivo'
      if (!metodoMap[metodo]) metodoMap[metodo] = { nombre: metodo, total: 0, cantidad: 0 }
      metodoMap[metodo].cantidad++
      metodoMap[metodo].total += Number(v.precioTotalVenta || 0)
    })
    result[weekKey] = {
      ventasPorSucursal: Object.values(sucMap),
      metodosPago: Object.values(metodoMap),
      productosTop: [],
      promocionesTop: []
    }
  })
  return result
})

const ventasPorSemana = computed(() => {
  const weeks = {}
  props.sortedVentas.forEach(group => {
    const monday = getWeekMonday(group.fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantVentas: 0, totalIngresos: 0 }
    }
    weeks[monday].cantVentas += group.ventas.length
    weeks[monday].totalIngresos += (group.totalIngreso || 0)
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana)).map(w => ({
    ...w,
    promedioVenta: w.cantVentas > 0 ? w.totalIngresos / w.cantVentas : 0
  }))
})

// Lógica de Acordeón
const expandedDates = ref([])
const toggleDate = (fecha) => {
  const index = expandedDates.value.indexOf(fecha)
  if (index > -1) expandedDates.value.splice(index, 1)
  else expandedDates.value.push(fecha)
}
const isExpanded = (fecha) => expandedDates.value.includes(fecha)
const expandAll = () => expandedDates.value = props.sortedVentas.map(g => g.fecha)
const collapseAll = () => expandedDates.value = []

// Charts
const ventasChartRef = ref(null)
const sucursalChartRef = ref(null)
const generalWeekChartRef = ref(null)
let ventasChartInstance = null
let sucursalChartInstance = null
let generalWeekChartInstance = null

const chartLabels = computed(() => props.sortedVentas.map(g => g.semanaLabel || g.fecha))
const chartIngresos = computed(() => props.sortedVentas.map(g => g.totalIngreso))

const sucursalLabels = computed(() => (props.consolidado?.ventasPorSucursal || []).map(s => s.nombre))
const sucursalValues = computed(() => (props.consolidado?.ventasPorSucursal || []).map(s => parseFloat(s.total || 0)))

const weeklyChartLabels = computed(() => ventasPorSemana.value.map(w => w.semanaLabel))
const weeklyChartValues = computed(() => ventasPorSemana.value.map(w => w.totalIngresos))

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
  if (!sem || !sem.ventasPorSucursal) return null
  return {
    labels: sem.ventasPorSucursal.map(s => s.nombre),
    values: sem.ventasPorSucursal.map(s => s.total),
    colors: weeklyColors.slice(0, sem.ventasPorSucursal.length)
  }
}

const renderCharts = () => {
  if (ventasChartInstance) { ventasChartInstance.destroy(); ventasChartInstance = null }
  if (sucursalChartInstance) { sucursalChartInstance.destroy(); sucursalChartInstance = null }

  if (chartLabels.value.length > 0 && ventasChartRef.value) {
    ventasChartInstance = new Chart(ventasChartRef.value, {
      type: 'bar',
      data: {
        labels: chartLabels.value.map(l => props.formatFecha(l)),
        datasets: [{
          label: 'Ventas (Bs.)',
          data: chartIngresos.value,
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' Bs.' } } }
      }
    })
  }

  if (sucursalLabels.value.length > 0 && sucursalChartRef.value) {
    const colors = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444', '#eab308']
    sucursalChartInstance = new Chart(sucursalChartRef.value, {
      type: 'doughnut',
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
          label: 'Ingresos (Bs.)',
          data: weeklyChartValues.value,
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgba(79, 70, 229, 1)',
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

watch(() => props.sortedVentas, () => setTimeout(renderCharts, 100), { deep: true })
watch(() => props.consolidado, () => setTimeout(renderCharts, 100), { deep: true })
watch(ventasPorSemana, () => setTimeout(renderCharts, 100), { deep: true })
onMounted(() => setTimeout(renderCharts, 200))
onBeforeUnmount(() => {
  if (ventasChartInstance) ventasChartInstance.destroy()
  if (sucursalChartInstance) sucursalChartInstance.destroy()
  if (generalWeekChartInstance) generalWeekChartInstance.destroy()
  Object.values(weeklyChartInstances.value).forEach(i => i.destroy())
})

defineExpose({
  expandAllSemanas: () => {
    ventasSemanalDetalle.value.forEach(sem => { expandedSemanas.value[sem.semana] = true })
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
