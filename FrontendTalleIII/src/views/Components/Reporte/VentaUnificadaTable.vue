<template>
  <div class="space-y-10">
    <!-- VISTA MENSUAL: Mes -> Semanas -> Días (UNIFICADO) -->
    <div v-if="props.agruparPorMes" class="space-y-4">
      <template v-for="mes in ventaMensualUnificado" :key="mes.monthKey">
        <div class="bg-white rounded-3xl border border-2 border-orange-200 shadow-sm overflow-hidden">
          <div
            class="px-6 py-4 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-100 flex items-center justify-between cursor-pointer"
            @click="toggleMes(mes.monthKey)"
          >
            <div class="flex items-center gap-3">
              <svg
                :class="['w-5 h-5 text-orange-500 transition-transform', expandedMeses[mes.monthKey] ? 'rotate-180' : '']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <h2 class="font-black text-gray-800 text-xl">{{ mes.monthLabel }}</h2>
              <span class="text-xs text-gray-400">|</span>
              <span class="text-sm text-gray-500">{{ mes.semanas.length }} semanas · {{ mes.totalVentasCount }} ventas · {{ mes.totalControlesComision }} controles</span>
            </div>
            <div class="flex items-center gap-4 flex-wrap justify-end">
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Ingresos Ventas</p>
                <p class="text-sm font-black text-green-600">{{ formatCurrency(mes.totalIngresosVentas) }} Bs.</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Gasto Extra Ventas</p>
                <p class="text-sm font-black text-orange-500">{{ formatCurrency(mes.totalGastoExtraVentas) }} Bs.</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Neto Ventas</p>
                <p class="text-sm font-black text-emerald-600">{{ formatCurrency(mes.totalNetoVentas) }} Bs.</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Comisión Total</p>
                <p class="text-sm font-black text-blue-600">{{ formatCurrency(mes.totalComision) }} Bs.</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Liq. Panadería</p>
                <p class="text-sm font-black text-emerald-700">{{ formatCurrency(mes.totalLiquidoPanaderia) }} Bs.</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Gasto Extra Com.</p>
                <p class="text-sm font-black text-red-500">{{ formatCurrency(mes.totalGastoExtraComision) }} Bs.</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] text-gray-400 uppercase font-black">Neto a Entregar</p>
                <p class="text-sm font-black text-red-700">{{ formatCurrency(mes.totalNetoEntregar) }} Bs.</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="expandedMeses[mes.monthKey]" class="space-y-4 pl-2 md:pl-4 border-l-4 border-orange-200">
          <div v-for="sem in mes.semanas" :key="sem.semanaKey" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div
              class="px-6 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer"
              @click="toggleSemana(sem.semanaKey)"
            >
              <div class="flex items-center gap-3">
                <svg
                  :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.semanaKey] ? 'rotate-180' : '']"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <h3 class="font-bold text-gray-700 text-lg">{{ sem.semanaLabel }}</h3>
                <span class="text-xs text-gray-400">|</span>
                <span class="text-sm text-gray-500">{{ sem.totalVentasCount }} ventas · {{ sem.totalControlesComision }} controles</span>
              </div>
              <div class="flex items-center gap-4 flex-wrap justify-end">
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Ingresos</p>
                  <p class="text-sm font-black text-green-600">{{ formatCurrency(sem.totalIngresosVentas) }} Bs.</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Neto Ventas</p>
                  <p class="text-sm font-black text-emerald-600">{{ formatCurrency(sem.totalNetoVentas) }} Bs.</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Comisión</p>
                  <p class="text-sm font-black text-blue-600">{{ formatCurrency(sem.totalComision) }} Bs.</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Neto a Entregar</p>
                  <p class="text-sm font-black text-red-700">{{ formatCurrency(sem.totalNetoEntregar) }} Bs.</p>
                </div>
              </div>
            </div>

            <div v-if="expandedSemanas[sem.semanaKey]" class="p-6 space-y-8">
              <!-- VENTAS UNIFICADAS -->
              <div>
                <div class="flex items-center gap-3 mb-4">
                  <div class="p-2 bg-green-100 rounded-xl">
                    <ShoppingCart class="h-5 w-5 text-green-600" />
                  </div>
                  <h4 class="text-lg font-bold text-gray-800">Ventas (Unificado)</h4>
                </div>
                <div class="space-y-4">
                  <div v-for="dia in sem.dias" :key="dia.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div class="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <Calendar class="h-4 w-4 text-green-600" />
                        <span class="font-bold text-gray-700 text-sm">{{ formatFecha(dia.fecha) }}</span>
                        <span class="text-xs text-gray-500">({{ dia.ventas.length }} transacciones)</span>
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="text-right">
                          <p class="text-[9px] text-gray-400 uppercase font-black">Ingreso</p>
                          <p class="text-sm font-black text-green-600">{{ formatCurrency(dia.totalIngreso) }} Bs.</p>
                        </div>
                        <div class="text-right">
                          <p class="text-[9px] text-gray-400 uppercase font-black">Gasto Extra</p>
                          <p class="text-sm font-black text-orange-500">{{ formatCurrency(dia.totalGastoExtra) }} Bs.</p>
                        </div>
                        <div class="text-right">
                          <p class="text-[9px] text-gray-400 uppercase font-black">Neto</p>
                          <p class="text-sm font-black text-emerald-600">{{ formatCurrency(dia.totalIngreso - dia.totalGastoExtra) }} Bs.</p>
                        </div>
                      </div>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                        <thead>
                          <tr class="bg-gray-50/30">
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Cliente</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Sucursal</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto/Detalle</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">P.Unit.</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Venta</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Gasto Extra</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Neto</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="(ventaData, idx) in dia.ventas" :key="ventaData.idVenta + '-' + idx">
                            <tr class="hover:bg-gray-50/50 transition-colors">
                              <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm font-bold text-gray-700">{{ ventaData.cliente }}</td>
                              <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-gray-600">{{ ventaData.sucursal === 'Cocina' || ventaData.sucursal === 'cocina' ? 'Pedido' : (ventaData.sucursal || '-') }}</td>
                              <td class="p-3 border-b border-gray-100 text-sm text-gray-600">{{ ventaData.producto }}</td>
                              <td class="p-3 border-b border-gray-100 text-sm text-center font-bold">{{ ventaData.cantidad }}</td>
                              <td class="p-3 border-b border-gray-100 text-sm text-right">{{ ventaData.precio }} Bs.</td>
                              <td class="p-3 border-b border-gray-100 text-sm text-right font-bold">{{ ventaData.subtotal }} Bs.</td>
                              <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-black text-blue-700 bg-blue-50/10">{{ ventaData.precioTotalVenta }} Bs.</td>
                              <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-bold text-orange-600 bg-orange-50/10">{{ ventaData.gastoextra && parseFloat(ventaData.gastoextra) > 0 ? ventaData.gastoextra + ' Bs.' : '-' }}</td>
                              <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-black text-green-700 bg-green-50/10">{{ ventaData.totalNeto }} Bs.</td>
                              <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-center">
                                <span :class="['px-2 py-1 rounded-full text-[9px] font-black uppercase', ventaData.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">{{ ventaData.estado }}</span>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- COMISIONES UNIFICADAS -->
              <div>
                <div class="flex items-center gap-3 mb-4">
                  <div class="p-2 bg-blue-100 rounded-xl">
                    <Users class="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 class="text-lg font-bold text-gray-800">Comisiones (Unificado)</h4>
                </div>
                <div v-if="sem.comisiones.length === 0" class="text-center py-8 text-gray-400 text-sm">Sin controles de comisión para esta semana</div>
                <div v-else class="space-y-4">
                  <div v-for="dia in sem.comisionesPorDia" :key="dia.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <Calendar class="h-4 w-4 text-blue-600" />
                        <span class="font-bold text-gray-700 text-sm">{{ formatFecha(dia.fecha) }}</span>
                        <span class="text-xs text-gray-500">({{ dia.controles.length }} controles)</span>
                      </div>
                      <div class="flex items-center gap-4 flex-wrap justify-end">
                        <div class="text-right">
                          <p class="text-[9px] text-gray-400 uppercase font-black">Comisión</p>
                          <p class="text-sm font-black text-blue-600">{{ formatCurrency(dia.totalComision) }} Bs.</p>
                        </div>
                        <div class="text-right">
                          <p class="text-[9px] text-gray-400 uppercase font-black">Liq. Panadería</p>
                          <p class="text-sm font-black text-emerald-600">{{ formatCurrency(dia.totalLiquido) }} Bs.</p>
                        </div>
                        <div class="text-right">
                          <p class="text-[9px] text-gray-400 uppercase font-black">Gasto Extra</p>
                          <p class="text-sm font-black text-red-500">{{ formatCurrency(dia.totalGastoExtra) }} Bs.</p>
                        </div>
                        <div class="text-right">
                          <p class="text-[9px] text-gray-400 uppercase font-black">Neto a Entregar</p>
                          <p class="text-sm font-black text-red-700">{{ formatCurrency(dia.totalNeto) }} Bs.</p>
                        </div>
                      </div>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                        <thead>
                          <tr class="bg-gray-50/30">
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Revendedor</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Sucursal</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Entregado</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Devuelto</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">P.Venta</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión U.</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión T.</th>
                            <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Liq. Panadería</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="control in dia.controles" :key="control.idcontrol">
                            <template v-for="(det, detIdx) in control.detalles" :key="control.idcontrol + '-' + detIdx">
                              <tr class="hover:bg-gray-50/50 transition-colors">
                                <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-sm font-bold text-orange-600">{{ control.empleado }}</td>
                                <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-xs text-gray-500">{{ control.sucursal }}</td>
                                <td class="p-3 border-b border-gray-100 text-sm text-gray-800">{{ det.producto }}</td>
                                <td class="p-3 border-b border-gray-100 text-xs text-gray-500">{{ det.presentacion }}</td>
                                <td class="p-3 border-b border-gray-100 text-sm text-center">{{ det.cantidad_entregada }}</td>
                                <td class="p-3 border-b border-gray-100 text-sm text-center text-red-500">{{ det.cantidad_devuelta }}</td>
                                <td class="p-3 border-b border-gray-100 text-sm text-center font-bold">{{ det.cantidad_vendida }}</td>
                                <td class="p-3 border-b border-gray-100 text-sm text-right">{{ Number(det.precio_venta).toFixed(2) }}</td>
                                <td class="p-3 border-b border-gray-100 text-sm text-right text-blue-600">{{ Number(det.comision_unitaria).toFixed(2) }}</td>
                                <td class="p-3 border-b border-gray-100 text-sm text-right font-bold text-blue-600">{{ Number(det.comision_total).toFixed(2) }}</td>
                                <td class="p-3 border-b border-gray-100 text-sm text-right font-bold text-emerald-600">{{ Number(det.liquido_panaderia).toFixed(2) }}</td>
                              </tr>
                            </template>
                            <tr class="bg-blue-50/20">
                              <td colspan="9" class="p-2 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Totales del Control:</td>
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
        </div>
      </template>
      <div v-if="ventaMensualUnificado.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- VISTA SEMANAL (UNIFICADO) -->
    <div v-if="props.agruparPorSemana && !props.agruparPorMes" class="space-y-4">
      <div v-for="sem in ventaSemanalUnificado" :key="sem.semanaKey" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div
          class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer"
          @click="toggleSemana(sem.semanaKey)"
        >
          <div class="flex items-center gap-3">
            <svg
              :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.semanaKey] ? 'rotate-180' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
            <span class="text-xs text-gray-400">|</span>
            <span class="text-sm text-gray-500">{{ sem.totalVentasCount }} ventas · {{ sem.totalControlesComision }} controles</span>
          </div>
          <div class="flex items-center gap-4 flex-wrap justify-end">
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Ingresos Ventas</p>
              <p class="text-sm font-black text-green-600">{{ formatCurrency(sem.totalIngresosVentas) }} Bs.</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Neto Ventas</p>
              <p class="text-sm font-black text-emerald-600">{{ formatCurrency(sem.totalNetoVentas) }} Bs.</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Comisión</p>
              <p class="text-sm font-black text-blue-600">{{ formatCurrency(sem.totalComision) }} Bs.</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Neto a Entregar</p>
              <p class="text-sm font-black text-red-700">{{ formatCurrency(sem.totalNetoEntregar) }} Bs.</p>
            </div>
          </div>
        </div>
        <div v-if="expandedSemanas[sem.semanaKey]" class="p-6 space-y-8">
          <!-- Ventas -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-green-100 rounded-xl">
                <ShoppingCart class="h-5 w-5 text-green-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Ventas</h4>
            </div>
            <div class="space-y-4">
              <div v-for="dia in sem.dias" :key="dia.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Calendar class="h-4 w-4 text-green-600" />
                    <span class="font-bold text-gray-700 text-sm">{{ formatFecha(dia.fecha) }}</span>
                    <span class="text-xs text-gray-500">({{ dia.ventas.length }} transacciones)</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <p class="text-[9px] text-gray-400 uppercase font-black">Ingreso</p>
                      <p class="text-sm font-black text-green-600">{{ formatCurrency(dia.totalIngreso) }} Bs.</p>
                    </div>
                    <div class="text-right">
                      <p class="text-[9px] text-gray-400 uppercase font-black">Neto</p>
                      <p class="text-sm font-black text-emerald-600">{{ formatCurrency(dia.totalIngreso - dia.totalGastoExtra) }} Bs.</p>
                    </div>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/30">
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Cliente</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Sucursal</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto/Detalle</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">P.Unit.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Venta</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Gasto Extra</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Neto</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="(ventaData, idx) in dia.ventas" :key="ventaData.idVenta + '-' + idx">
                        <tr class="hover:bg-gray-50/50 transition-colors">
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm font-bold text-gray-700">{{ ventaData.cliente }}</td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-gray-600">{{ ventaData.sucursal === 'Cocina' || ventaData.sucursal === 'cocina' ? 'Pedido' : (ventaData.sucursal || '-') }}</td>
                          <td class="p-3 border-b border-gray-100 text-sm text-gray-600">{{ ventaData.producto }}</td>
                          <td class="p-3 border-b border-gray-100 text-sm text-center font-bold">{{ ventaData.cantidad }}</td>
                          <td class="p-3 border-b border-gray-100 text-sm text-right">{{ ventaData.precio }} Bs.</td>
                          <td class="p-3 border-b border-gray-100 text-sm text-right font-bold">{{ ventaData.subtotal }} Bs.</td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-black text-blue-700 bg-blue-50/10">{{ ventaData.precioTotalVenta }} Bs.</td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-bold text-orange-600 bg-orange-50/10">{{ ventaData.gastoextra && parseFloat(ventaData.gastoextra) > 0 ? ventaData.gastoextra + ' Bs.' : '-' }}</td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-black text-green-700 bg-green-50/10">{{ ventaData.totalNeto }} Bs.</td>
                          <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-center">
                            <span :class="['px-2 py-1 rounded-full text-[9px] font-black uppercase', ventaData.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">{{ ventaData.estado }}</span>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Comisiones -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 rounded-xl">
                <Users class="h-5 w-5 text-blue-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Comisiones</h4>
            </div>
            <div v-if="sem.comisiones.length === 0" class="text-center py-8 text-gray-400 text-sm">Sin controles de comisión para esta semana</div>
            <div v-else class="space-y-4">
              <div v-for="dia in sem.comisionesPorDia" :key="dia.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Calendar class="h-4 w-4 text-blue-600" />
                    <span class="font-bold text-gray-700 text-sm">{{ formatFecha(dia.fecha) }}</span>
                    <span class="text-xs text-gray-500">({{ dia.controles.length }} controles)</span>
                  </div>
                  <div class="flex items-center gap-4 flex-wrap justify-end">
                    <div class="text-right">
                      <p class="text-[9px] text-gray-400 uppercase font-black">Comisión</p>
                      <p class="text-sm font-black text-blue-600">{{ formatCurrency(dia.totalComision) }} Bs.</p>
                    </div>
                    <div class="text-right">
                      <p class="text-[9px] text-gray-400 uppercase font-black">Liq. Panadería</p>
                      <p class="text-sm font-black text-emerald-600">{{ formatCurrency(dia.totalLiquido) }} Bs.</p>
                    </div>
                    <div class="text-right">
                      <p class="text-[9px] text-gray-400 uppercase font-black">Gasto Extra</p>
                      <p class="text-sm font-black text-red-500">{{ formatCurrency(dia.totalGastoExtra) }} Bs.</p>
                    </div>
                    <div class="text-right">
                      <p class="text-[9px] text-gray-400 uppercase font-black">Neto a Entregar</p>
                      <p class="text-sm font-black text-red-700">{{ formatCurrency(dia.totalNeto) }} Bs.</p>
                    </div>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/30">
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Revendedor</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Sucursal</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Entregado</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Devuelto</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">P.Venta</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión U.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión T.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Liq. Panadería</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="control in dia.controles" :key="control.idcontrol">
                        <template v-for="(det, detIdx) in control.detalles" :key="control.idcontrol + '-' + detIdx">
                          <tr class="hover:bg-gray-50/50 transition-colors">
                            <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-sm font-bold text-orange-600">{{ control.empleado }}</td>
                            <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-xs text-gray-500">{{ control.sucursal }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-gray-800">{{ det.producto }}</td>
                            <td class="p-3 border-b border-gray-100 text-xs text-gray-500">{{ det.presentacion }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-center">{{ det.cantidad_entregada }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-center text-red-500">{{ det.cantidad_devuelta }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-center font-bold">{{ det.cantidad_vendida }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-right">{{ Number(det.precio_venta).toFixed(2) }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-right text-blue-600">{{ Number(det.comision_unitaria).toFixed(2) }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-right font-bold text-blue-600">{{ Number(det.comision_total).toFixed(2) }}</td>
                            <td class="p-3 border-b border-gray-100 text-sm text-right font-bold text-emerald-600">{{ Number(det.liquido_panaderia).toFixed(2) }}</td>
                          </tr>
                        </template>
                        <tr class="bg-blue-50/20">
                          <td colspan="9" class="p-2 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Totales del Control:</td>
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
      <div v-if="ventaSemanalUnificado.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- VISTA DIARIA (UNIFICADO) -->
    <div v-if="!props.agruparPorSemana && !props.agruparPorMes" class="space-y-8">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-green-100 rounded-xl">
            <ShoppingCart class="h-5 w-5 text-green-600" />
          </div>
          <h4 class="text-lg font-bold text-gray-800">Ventas</h4>
        </div>
        <div class="space-y-4">
          <div v-for="dateGroup in sortedVentasUnificado" :key="dateGroup.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div class="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Calendar class="h-4 w-4 text-green-600" />
                <span class="font-bold text-gray-700 text-sm">{{ formatFecha(dateGroup.fecha) }}</span>
                <span class="text-xs text-gray-500">({{ dateGroup.ventas.length }} transacciones)</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Ingreso</p>
                  <p class="text-sm font-black text-green-600">{{ formatCurrency(dateGroup.totalIngreso) }} Bs.</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Gasto Extra</p>
                  <p class="text-sm font-black text-orange-500">{{ formatCurrency(dateGroup.totalGastoExtra) }} Bs.</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Neto</p>
                  <p class="text-sm font-black text-emerald-600">{{ formatCurrency(dateGroup.totalIngreso - dateGroup.totalGastoExtra) }} Bs.</p>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/30">
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Cliente</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Sucursal</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto/Detalle</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">P.Unit.</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Venta</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Gasto Extra</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Total Neto</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Factura</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(ventaData, idx) in dateGroup.ventas" :key="ventaData.idVenta + '-' + idx">
                    <tr class="hover:bg-gray-50/50 transition-colors">
                      <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm font-bold text-gray-700">{{ ventaData.cliente }}</td>
                      <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-gray-600">{{ ventaData.sucursal === 'Cocina' || ventaData.sucursal === 'cocina' ? 'Pedido' : (ventaData.sucursal || '-') }}</td>
                      <td class="p-3 border-b border-gray-100 text-sm text-gray-600">{{ ventaData.producto }}</td>
                      <td class="p-3 border-b border-gray-100 text-sm text-center font-bold">{{ ventaData.cantidad }}</td>
                      <td class="p-3 border-b border-gray-100 text-sm text-right">{{ ventaData.precio }} Bs.</td>
                      <td class="p-3 border-b border-gray-100 text-sm text-right font-bold">{{ ventaData.subtotal }} Bs.</td>
                      <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-black text-blue-700 bg-blue-50/10">{{ ventaData.precioTotalVenta }} Bs.</td>
                      <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-bold text-orange-600 bg-orange-50/10">{{ ventaData.gastoextra && parseFloat(ventaData.gastoextra) > 0 ? ventaData.gastoextra + ' Bs.' : '-' }}</td>
                      <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-sm text-right font-black text-green-700 bg-green-50/10">{{ ventaData.totalNeto }} Bs.</td>
                      <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-center">
                        <span :class="['px-2 py-1 rounded-full text-[9px] font-black uppercase', ventaData.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">{{ ventaData.estado }}</span>
                      </td>
                      <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-100 text-center">
                        <span v-if="ventaData.hasFactura" class="text-xs text-blue-600">{{ ventaData.nroFactura || 'SI' }}</span>
                        <span v-else class="text-xs text-gray-400">S/F</span>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-blue-100 rounded-xl">
            <Users class="h-5 w-5 text-blue-600" />
          </div>
          <h4 class="text-lg font-bold text-gray-800">Comisiones</h4>
        </div>
        <div class="space-y-4">
          <div v-for="group in normalizedComisionGroups" :key="group.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Calendar class="h-4 w-4 text-blue-600" />
                <span class="font-bold text-gray-700 text-sm">{{ formatFecha(group.fecha) }}</span>
                <span class="text-xs text-gray-500">({{ group.controles.length }} controles)</span>
              </div>
              <div class="flex items-center gap-4 flex-wrap justify-end">
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Comisión</p>
                  <p class="text-sm font-black text-blue-600">{{ formatCurrency(group.controles.reduce((s,c)=>s+Number(c.total_comision||0),0)) }} Bs.</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Liq. Panadería</p>
                  <p class="text-sm font-black text-emerald-600">{{ formatCurrency(group.controles.reduce((s,c)=>s+Number(c.total_liquido_panaderia||0),0)) }} Bs.</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Gasto Extra</p>
                  <p class="text-sm font-black text-red-500">{{ formatCurrency(group.controles.reduce((s,c)=>s+Number(c.total_gasto_extra||0),0)) }} Bs.</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black">Neto a Entregar</p>
                  <p class="text-sm font-black text-red-700">{{ formatCurrency(group.controles.reduce((s,c)=>s+Number(c.neto_a_entregar||c.total_liquido_panaderia||0),0)) }} Bs.</p>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/30">
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Revendedor</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Sucursal</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Producto</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Entregado</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Devuelto</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Vendido</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">P.Venta</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión U.</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Comisión T.</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Liq. Panadería</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Gasto Extra</th>
                    <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Neto a Entregar</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="control in group.controles" :key="control.idcontrol">
                    <template v-for="(det, detIdx) in control.detalles" :key="control.idcontrol + '-' + detIdx">
                      <tr class="hover:bg-gray-50/50 transition-colors">
                        <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-sm font-bold text-orange-600">{{ control.empleado }}</td>
                        <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-xs text-gray-500">{{ control.sucursal }}</td>
                        <td class="p-3 border-b border-gray-100 text-sm text-gray-800">{{ det.producto }}</td>
                        <td class="p-3 border-b border-gray-100 text-xs text-gray-500">{{ det.presentacion }}</td>
                        <td class="p-3 border-b border-gray-100 text-sm text-center">{{ det.cantidad_entregada }}</td>
                        <td class="p-3 border-b border-gray-100 text-sm text-center text-red-500">{{ det.cantidad_devuelta }}</td>
                        <td class="p-3 border-b border-gray-100 text-sm text-center font-bold">{{ det.cantidad_vendida }}</td>
                        <td class="p-3 border-b border-gray-100 text-sm text-right">{{ Number(det.precio_venta).toFixed(2) }}</td>
                        <td class="p-3 border-b border-gray-100 text-sm text-right text-blue-600">{{ Number(det.comision_unitaria).toFixed(2) }}</td>
                        <td class="p-3 border-b border-gray-100 text-sm text-right font-bold text-blue-600">{{ Number(det.comision_total).toFixed(2) }}</td>
                        <td class="p-3 border-b border-gray-100 text-sm text-right font-bold text-emerald-600">{{ Number(det.liquido_panaderia).toFixed(2) }}</td>
                        <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-sm text-right font-bold text-red-500">{{ Number(control.total_gasto_extra || 0).toFixed(2) }}</td>
                        <td v-if="detIdx === 0" :rowspan="control.totalDetalleRows" class="p-3 border-b border-gray-100 text-sm text-right font-bold text-red-700">{{ Number(control.neto_a_entregar || control.total_liquido_panaderia).toFixed(2) }}</td>
                      </tr>
                    </template>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Calendar, ShoppingCart, Users } from 'lucide-vue-next'
import { getWeekStart as sharedWeekStart, getWeekLabel as sharedWeekLabel, getMonthKey as sharedMonthKey, getMonthLabel as sharedMonthLabel, sortMonthsDesc as sharedSortMonthsDesc } from './useSemana'

const props = defineProps({
  sortedVentas: { type: Array, default: () => [] },
  formatFecha: { type: Function, required: true },
  consolidado: { type: Object, default: () => ({}) },
  detalladoComision: { type: Object, default: () => ({ reporte: [], totalesGlobales: {} }) },
  consolidadoComision: { type: Object, default: () => ({ reporte: [], totalesGlobales: {} }) },
  agruparPorSemana: { type: Boolean, default: false },
  agruparPorMes: { type: Boolean, default: false }
})

const getWeekMonday = (dateStr) => sharedWeekStart(dateStr)
const getWeekLabelFn = (mondayStr) => sharedWeekLabel(mondayStr)
const getMonthKeyLocal = (dateStr) => sharedMonthKey(dateStr)
const getMonthLabelLocal = (monthKey) => sharedMonthLabel(monthKey)
const sortMonthsDescLocal = (months) => sharedSortMonthsDesc(months)

const formatCurrency = (val) => Number(val || 0).toFixed(2)

const expandedMeses = ref({})
const expandedSemanas = ref({})
const toggleMes = (key) => { expandedMeses.value[key] = !expandedMeses.value[key] }
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

const sortedVentasUnificado = computed(() => props.sortedVentas || [])

const normalizedComisionGroups = computed(() => {
  const data = props.detalladoComision?.reporte || []
  if (!Array.isArray(data)) return []
  return data.map(g => ({
    ...g,
    controles: (g.controles || []).map(c => {
      const detalles = (c.detalles || []).map(d => ({
        ...d,
        comision_total: Number(d.comision_total || 0),
        liquido_panaderia: Number(d.liquido_panaderia || 0),
        precio_venta: Number(d.precio_venta || 0),
        comision_unitaria: Number(d.comision_unitaria || 0)
      }))
      return {
        ...c,
        total_comision: Number(c.total_comision || 0),
        total_liquido_panaderia: Number(c.total_liquido_panaderia || 0),
        total_gasto_extra: Number(c.total_gasto_extra || 0),
        neto_a_entregar: Number(c.neto_a_entregar || c.total_liquido_panaderia || 0),
        detalles,
        totalDetalleRows: detalles.length
      }
    })
  }))
})

const comisionPorFecha = computed(() => {
  const map = {}
  normalizedComisionGroups.value.forEach(g => {
    if (!g.fecha) return
    if (!map[g.fecha]) map[g.fecha] = []
    map[g.fecha].push(...(g.controles || []))
  })
  return map
})

const ventaSemanalUnificado = computed(() => {
  const weeks = {}
  // ventas
  sortedVentasUnificado.value.forEach(g => {
    if (!g.fecha) return
    const monday = getWeekMonday(g.fecha)
    if (!weeks[monday]) {
      weeks[monday] = {
        semanaKey: monday,
        semanaLabel: getWeekLabelFn(monday),
        fechaInicio: monday,
        diasVentasMap: {},
        comisiones: [],
        comisionesPorDia: [],
        dias: []
      }
    }
    if (!weeks[monday].diasVentasMap[g.fecha]) {
      weeks[monday].diasVentasMap[g.fecha] = { ...g }
    } else {
      weeks[monday].diasVentasMap[g.fecha].ventas.push(...(g.ventas || []))
      weeks[monday].diasVentasMap[g.fecha].totalIngreso += g.totalIngreso || 0
      weeks[monday].diasVentasMap[g.fecha].totalGastoExtra += g.totalGastoExtra || 0
    }
  })
  // comisiones
  normalizedComisionGroups.value.forEach(g => {
    if (!g.fecha) return
    const monday = getWeekMonday(g.fecha)
    if (!weeks[monday]) {
      weeks[monday] = {
        semanaKey: monday,
        semanaLabel: getWeekLabelFn(monday),
        fechaInicio: monday,
        diasVentasMap: {},
        comisiones: [],
        comisionesPorDia: [],
        dias: []
      }
    }
    weeks[monday].comisiones.push(...(g.controles || []))
  })
  Object.values(weeks).forEach(w => {
    // build dias ventas
    w.dias = Object.values(w.diasVentasMap).sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
    // build comisiones por dia
    const cMap = {}
    w.comisiones.forEach(c => {
      const fechaCtrl = c.fecha || c.Fecha || ''
      if (!fechaCtrl) return
      const f = fechaCtrl.split('T')[0]
      if (!cMap[f]) cMap[f] = { fecha: f, controles: [] }
      cMap[f].controles.push(c)
    })
    w.comisionesPorDia = Object.values(cMap).sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
    // totales
    w.totalVentasCount = w.dias.reduce((s,d) => s + (d.ventas?.length || 0), 0)
    w.totalIngresosVentas = w.dias.reduce((s,d) => s + Number(d.totalIngreso || 0), 0)
    w.totalGastoExtraVentas = w.dias.reduce((s,d) => s + Number(d.totalGastoExtra || 0), 0)
    w.totalNetoVentas = w.totalIngresosVentas - w.totalGastoExtraVentas
    w.totalControlesComision = w.comisiones.length
    w.totalComision = w.comisiones.reduce((s,c) => s + Number(c.total_comision || 0), 0)
    w.totalLiquidoPanaderia = w.comisiones.reduce((s,c) => s + Number(c.total_liquido_panaderia || 0), 0)
    w.totalGastoExtraComision = w.comisiones.reduce((s,c) => s + Number(c.total_gasto_extra || 0), 0)
    w.totalNetoEntregar = w.comisiones.reduce((s,c) => s + Number(c.neto_a_entregar || c.total_liquido_panaderia || 0), 0)
  })
  return Object.values(weeks).sort((a,b) => new Date(b.fechaInicio) - new Date(a.fechaInicio))
})

const ventaMensualUnificado = computed(() => {
  const months = {}
  // ventas
  sortedVentasUnificado.value.forEach(g => {
    if (!g.fecha) return
    const f = String(g.fecha).split('T')[0]
    const mk = getMonthKeyLocal(f)
    if (!months[mk]) {
      months[mk] = {
        monthKey: mk,
        monthLabel: getMonthLabelLocal(mk),
        semanasMap: {},
        totalVentasCount: 0,
        totalIngresosVentas: 0,
        totalGastoExtraVentas: 0,
        totalNetoVentas: 0,
        totalControlesComision: 0,
        totalComision: 0,
        totalLiquidoPanaderia: 0,
        totalGastoExtraComision: 0,
        totalNetoEntregar: 0,
        semanas: []
      }
    }
    const month = months[mk]
    const monday = getWeekMonday(f)
    if (!month.semanasMap[monday]) {
      month.semanasMap[monday] = {
        semanaKey: monday,
        semanaLabel: getWeekLabelFn(monday),
        diasVentasMap: {},
        comisiones: [],
        comisionesPorDia: [],
        dias: []
      }
    }
    const sem = month.semanasMap[monday]
    if (!sem.diasVentasMap[g.fecha]) sem.diasVentasMap[g.fecha] = { ...g }
    else {
      sem.diasVentasMap[g.fecha].ventas.push(...(g.ventas || []))
      sem.diasVentasMap[g.fecha].totalIngreso += g.totalIngreso || 0
      sem.diasVentasMap[g.fecha].totalGastoExtra += g.totalGastoExtra || 0
    }
    month.totalVentasCount += (g.ventas || []).length
    month.totalIngresosVentas += Number(g.totalIngreso || 0)
    month.totalGastoExtraVentas += Number(g.totalGastoExtra || 0)
  })
  // comisiones
  normalizedComisionGroups.value.forEach(g => {
    if (!g.fecha) return
    const f = String(g.fecha).split('T')[0]
    const mk = getMonthKeyLocal(f)
    if (!months[mk]) {
      months[mk] = {
        monthKey: mk,
        monthLabel: getMonthLabelLocal(mk),
        semanasMap: {},
        totalVentasCount: 0,
        totalIngresosVentas: 0,
        totalGastoExtraVentas: 0,
        totalNetoVentas: 0,
        totalControlesComision: 0,
        totalComision: 0,
        totalLiquidoPanaderia: 0,
        totalGastoExtraComision: 0,
        totalNetoEntregar: 0,
        semanas: []
      }
    }
    const month = months[mk]
    const monday = getWeekMonday(f)
    if (!month.semanasMap[monday]) {
      month.semanasMap[monday] = {
        semanaKey: monday,
        semanaLabel: getWeekLabelFn(monday),
        diasVentasMap: {},
        comisiones: [],
        comisionesPorDia: [],
        dias: []
      }
    }
    month.semanasMap[monday].comisiones.push(...(g.controles || []))
    month.totalControlesComision += (g.controles || []).length
    ;(g.controles || []).forEach(c => {
      month.totalComision += Number(c.total_comision || 0)
      month.totalLiquidoPanaderia += Number(c.total_liquido_panaderia || 0)
      month.totalGastoExtraComision += Number(c.total_gasto_extra || 0)
      month.totalNetoEntregar += Number(c.neto_a_entregar || c.total_liquido_panaderia || 0)
    })
  })
  Object.values(months).forEach(month => {
    month.totalNetoVentas = month.totalIngresosVentas - month.totalGastoExtraVentas
    month.semanas = Object.values(month.semanasMap).sort((a,b) => new Date(b.semanaKey) - new Date(a.semanaKey))
    month.semanas.forEach(sem => {
      sem.dias = Object.values(sem.diasVentasMap).sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
      const cMap = {}
      sem.comisiones.forEach(c => {
        const fechaCtrl = c.fecha || c.Fecha || ''
        if (!fechaCtrl) return
        const f2 = fechaCtrl.split('T')[0]
        if (!cMap[f2]) cMap[f2] = { fecha: f2, controles: [] }
        cMap[f2].controles.push(c)
      })
      sem.comisionesPorDia = Object.values(cMap).sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
      sem.totalVentasCount = sem.dias.reduce((s,d) => s + (d.ventas?.length || 0), 0)
      sem.totalIngresosVentas = sem.dias.reduce((s,d) => s + Number(d.totalIngreso || 0), 0)
      sem.totalGastoExtraVentas = sem.dias.reduce((s,d) => s + Number(d.totalGastoExtra || 0), 0)
      sem.totalNetoVentas = sem.totalIngresosVentas - sem.totalGastoExtraVentas
      sem.totalControlesComision = sem.comisiones.length
      sem.totalComision = sem.comisiones.reduce((s,c) => s + Number(c.total_comision || 0), 0)
      sem.totalLiquidoPanaderia = sem.comisiones.reduce((s,c) => s + Number(c.total_liquido_panaderia || 0), 0)
      sem.totalGastoExtraComision = sem.comisiones.reduce((s,c) => s + Number(c.total_gasto_extra || 0), 0)
      sem.totalNetoEntregar = sem.comisiones.reduce((s,c) => s + Number(c.neto_a_entregar || c.total_liquido_panaderia || 0), 0)
    })
  })
  return sortMonthsDescLocal(Object.values(months))
})
</script>
