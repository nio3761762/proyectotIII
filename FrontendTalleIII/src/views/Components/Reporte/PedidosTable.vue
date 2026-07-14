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
      <div v-for="sem in pedidosSemanalDetalle" :key="sem.semana" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(sem.semana)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.semana] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
            <span class="text-xs text-gray-400">|</span>
            <span class="text-sm text-gray-500">{{ sem.cantPedidos }} pedidos</span>
          </div>
          <div class="text-right">
            <p class="text-[9px] text-gray-400 uppercase font-black">Monto Total</p>
            <p class="text-sm font-black text-green-600">{{ formatCurrency(sem.montoTotal) }}</p>
          </div>
        </div>
        <div v-if="expandedSemanas[sem.semana]" class="p-6 space-y-6">
          <!-- Distribución por Sucursal -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100/50 flex items-center gap-3">
              <div class="p-2 bg-orange-100 rounded-xl">
                <Store class="h-4 w-4 text-orange-600" />
              </div>
              <h4 class="font-black text-gray-800 uppercase tracking-widest text-xs">Distribución por Sucursal</h4>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr>
                    <th class="px-5 pb-3 pt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sucursal</th>
                    <th class="px-5 pb-3 pt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                    <th class="px-5 pb-3 pt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="suc in weeklyConsolidados[sem.semana]?.pedidosPorSucursal || []" :key="suc.nombre" class="group hover:bg-orange-50/30 transition-colors">
                    <td class="px-5 py-3 text-sm font-bold text-gray-700">{{ suc.nombre }}</td>
                    <td class="px-5 py-3 text-sm text-gray-500 text-center font-medium">{{ suc.cant_pedidos }}</td>
                    <td class="px-5 py-3 text-sm font-black text-orange-600 text-right">{{ Number(suc.total).toFixed(2) }} Bs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Estados de Pedido -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 flex items-center gap-3">
              <div class="p-2 bg-blue-100 rounded-xl">
                <ClipboardList class="h-4 w-4 text-blue-600" />
              </div>
              <h4 class="font-black text-gray-800 uppercase tracking-widest text-xs">Estados de Pedido</h4>
            </div>
            <div class="p-5">
              <div class="space-y-4">
                <div v-for="est in weeklyConsolidados[sem.semana]?.pedidosPorEstado || []" :key="est.estado" class="flex items-center gap-4">
                  <div class="flex-1">
                    <div class="flex justify-between mb-1">
                      <span class="text-xs font-bold text-gray-700">{{ est.estado_nombre }}</span>
                      <span class="text-xs font-black text-blue-600">{{ est.cant_pedidos }} ({{ Number(est.total).toFixed(2) }} Bs.)</span>
                    </div>
                    <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500 rounded-full" :style="{ width: (est.cant_pedidos / Math.max(...(weeklyConsolidados[sem.semana]?.pedidosPorEstado || []).map(e => e.cant_pedidos)) * 100) + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tipos de Pedido -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50 flex items-center gap-3">
              <div class="p-2 bg-emerald-100 rounded-xl">
                <Layers class="h-4 w-4 text-emerald-600" />
              </div>
              <h4 class="font-black text-gray-800 uppercase tracking-widest text-xs">Tipos de Pedido</h4>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr>
                    <th class="px-5 pb-3 pt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                    <th class="px-5 pb-3 pt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                    <th class="px-5 pb-3 pt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="tipo in weeklyConsolidados[sem.semana]?.pedidosPorTipo || []" :key="tipo.nombre" class="group hover:bg-emerald-50/30 transition-colors">
                    <td class="px-5 py-3 text-sm font-bold text-gray-700">{{ tipo.nombre }}</td>
                    <td class="px-5 py-3 text-sm text-gray-500 text-center font-medium">{{ tipo.cant_pedidos }}</td>
                    <td class="px-5 py-3 text-sm font-black text-emerald-600 text-right">{{ Number(tipo.total).toFixed(2) }} Bs.</td>
                  </tr>
                </tbody>
              </table>
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
                  <span class="text-xs text-gray-500">({{ day.pedidos.length }} pedidos)</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/30">
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">ID / Hora</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Cliente / Sucursal</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Ítem</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Precio Unit.</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Financiero</th>
                        <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr v-for="(pedido, pIdx) in day.pedidos" :key="pedido.id" class="hover:bg-gray-50/50 transition-colors group">
                        <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 align-top bg-gray-50/10">
                          <div class="text-[11px] font-black text-blue-600 mb-1">#{{ pedido.idpedido }}</div>
                          <div class="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                            <Clock class="h-3 w-3" />
                            {{ pedido.hora }}
                          </div>
                        </td>
                        <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 align-top bg-gray-50/10">
                          <div class="flex flex-col gap-1">
                            <div class="text-sm font-black text-gray-800 leading-tight">{{ pedido.cliente }}</div>
                            <div class="flex items-center gap-1.5">
                              <Store class="h-3 w-3 text-orange-400" />
                              <span class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{{ pedido.sucursal }}</span>
                            </div>
                          </div>
                        </td>
                        <td v-if="pedido.isFirstInItem" :rowspan="pedido.itemRowspan" class="p-3 align-top">
                          <div class="flex items-center gap-3">
                            <div v-if="pedido.productoImagen" class="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                              <img :src="pedido.productoImagen" class="w-full h-full object-cover" />
                            </div>
                            <div v-else class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-300">
                              <Package class="h-4 w-4" />
                            </div>
                            <div class="flex flex-col">
                              <span class="text-xs font-bold text-gray-700 leading-snug">{{ pedido.productoNombre }}</span>
                              <div v-if="pedido.productos_de_promocion" class="mt-1 space-y-0.5">
                                <div v-for="(pPromo, ppIdx) in pedido.productos_de_promocion" :key="ppIdx" class="text-[9px] text-gray-500 italic bg-gray-50 px-1 rounded">
                                  • {{ pPromo.cantidad_en_promo }} {{ pPromo.presentacion_producto }} {{ pPromo.producto_nombre }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="p-3 text-xs font-medium text-gray-500">{{ pedido.presentacion }}</td>
                        <td class="p-3 text-xs font-black text-gray-800 text-center">{{ pedido.productoCantidad }}</td>
                        <td class="p-3 text-xs font-bold text-gray-600 text-right">{{ parseFloat(pedido.productoPrecio || 0).toFixed(2) }} Bs.</td>
                        <td class="p-3 text-xs font-black text-gray-800 text-right">{{ parseFloat(pedido.subtotal || 0).toFixed(2) }} Bs.</td>
                        <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 align-top text-right bg-gray-50/10">
                          <div class="flex flex-col items-end gap-1">
                            <div class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total: {{ pedido.total.toFixed(2) }} Bs.</div>
                            <div class="text-[9px] font-bold text-emerald-600">Adelanto: {{ pedido.adelanto.toFixed(2) }}</div>
                            <div :class="['text-[9px] font-black p-1 rounded-lg px-2', pedido.saldo > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600']">
                              Saldo: {{ pedido.saldo.toFixed(2) }}
                            </div>
                          </div>
                        </td>
                        <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 align-top text-center bg-gray-50/10">
                          <div class="flex flex-col gap-2">
                            <span :class="['px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-xs', pedido.estado_nombre === 'PENDIENTE' ? 'bg-orange-100 text-orange-600' : pedido.estado_nombre === 'FINALIZADO' ? 'bg-green-100 text-green-700' : pedido.estado_nombre === 'RESERVADO' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600']">
                              {{ pedido.estado_nombre }}
                            </span>
                            <span class="text-[7px] font-black text-gray-400 border border-gray-100 rounded-lg px-2 py-0.5">{{ pedido.tipo_pedido }}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="pedidosSemanalDetalle.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- Resumen Consolidado de Pedidos -->
    <div v-if="consolidado && Object.keys(consolidado).length > 0 && !props.agruparPorSemana" class="animate-fade-in-up space-y-10">
      
      <!-- Charts -->
      <div v-if="chartLabels.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">{{ props.agruparPorSemana ? 'Pedidos por Semana' : 'Pedidos por Día' }}</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="pedidosChartRef"></canvas>
          </div>
        </div>
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Pedidos por Sucursal</h3>
          <div class="relative" style="height: 260px;">
            <canvas ref="sucursalChartRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Fila 1: Sucursales y Estados -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Pedidos por Sucursal -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100/50 flex items-center gap-3">
            <div class="p-2 bg-orange-100 rounded-xl">
              <Store class="h-5 w-5 text-orange-600" />
            </div>
            <h4 class="font-black text-gray-800 uppercase tracking-widest text-xs">Distribución por Sucursal</h4>
          </div>
          <div class="p-6 flex-1 overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr>
                  <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sucursal</th>
                  <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                  <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="suc in consolidado.pedidosPorSucursal" :key="suc.nombre" class="group hover:bg-orange-50/30 transition-colors">
                  <td class="py-4 text-sm font-bold text-gray-700">{{ suc.nombre }}</td>
                  <td class="py-4 text-sm text-gray-500 text-center font-medium">{{ suc.cant_pedidos }}</td>
                  <td class="py-4 text-sm font-black text-orange-600 text-right">{{ parseFloat(suc.total).toFixed(2) }} Bs.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pedidos por Estado -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-xl">
              <ClipboardList class="h-5 w-5 text-blue-600" />
            </div>
            <h4 class="font-black text-gray-800 uppercase tracking-widest text-xs">Estados de Pedido</h4>
          </div>
          <div class="p-6 flex-1">
            <div class="space-y-4">
              <div v-for="est in consolidado.pedidosPorEstado" :key="est.estado" class="flex items-center gap-4">
                <div class="flex-1">
                  <div class="flex justify-between mb-1">
                    <span class="text-xs font-bold text-gray-700">{{ est.estado_nombre }}</span>
                    <span class="text-xs font-black text-blue-600">{{ est.cant_pedidos }} ({{ parseFloat(est.total).toFixed(2) }} Bs.)</span>
                  </div>
                  <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" :style="{ width: (est.cant_pedidos / Math.max(...consolidado.pedidosPorEstado.map(e => e.cant_pedidos)) * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila 2: Tipos y Top Productos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Pedidos por Tipo (Reserva vs Pedido) -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50 flex items-center gap-3">
            <div class="p-2 bg-emerald-100 rounded-xl">
              <Layers class="h-5 w-5 text-emerald-600" />
            </div>
            <h4 class="font-black text-gray-800 uppercase tracking-widest text-xs">Tipos de Pedido</h4>
          </div>
          <div class="p-6 flex-1 overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr>
                  <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                  <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                  <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="tipo in consolidado.pedidosPorTipo" :key="tipo.nombre" class="group hover:bg-emerald-50/30 transition-colors">
                  <td class="py-4 text-sm font-bold text-gray-700">{{ tipo.nombre }}</td>
                  <td class="py-4 text-sm text-gray-500 text-center font-medium">{{ tipo.cant_pedidos }}</td>
                  <td class="py-4 text-sm font-black text-emerald-600 text-right">{{ parseFloat(tipo.total).toFixed(2) }} Bs.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Productos Más Pedidos -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50 flex items-center gap-3">
            <div class="p-2 bg-purple-100 rounded-xl">
              <Trophy class="h-5 w-5 text-purple-600" />
            </div>
            <h4 class="font-black text-gray-800 uppercase tracking-widest text-xs">Productos Más Pedidos</h4>
          </div>
          <div class="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
            <div v-for="prod in consolidado.productosTop" :key="prod.idproducto" class="flex items-center gap-4 p-3 rounded-2xl hover:bg-purple-50/30 transition-all border border-transparent hover:border-purple-100">
              <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                <img v-if="prod.imagen" :src="prod.imagen" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <Package class="h-6 w-6" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h5 class="text-sm font-black text-gray-800 truncate">{{ prod.nombre }}</h5>
                <p class="text-[10px] text-gray-400 font-bold uppercase">{{ prod.total_unidades_vendidas }} unidades pedidas</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-black text-purple-600">{{ parseFloat(prod.ingresos_totales).toFixed(2) }} Bs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detalle Cronológico de Pedidos (Acordeón) -->
    <div v-if="!props.agruparPorSemana" class="animate-fade-in-up" style="animation-delay: 0.1s">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-xl">
            <List class="h-6 w-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">Historial Detallado</h3>
        </div>
        <div class="flex gap-2">
          <button @click="expandAll" class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Expandir todo</button>
          <button @click="collapseAll" class="text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Contraer todo</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="group in processedPedidosGrouped" :key="group.fecha" 
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
                <span class="text-xs text-gray-500">{{ group.totalPedidos }} pedidos registrados</span>
              </div>
            </div>
          </button>

          <div v-show="isExpanded(group.fecha)" class="overflow-x-auto border-t border-gray-100">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/30">
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">ID / Hora</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Cliente / Sucursal</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Ítem</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">Presentación</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Cant.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Precio Unit.</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Subtotal</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Financiero</th>
                  <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-center">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                  <tr v-for="(pedido, pIdx) in group.pedidos" :key="pedido.id" class="hover:bg-gray-50/50 transition-colors group">
                    <!-- Datos de Pedido (Agrupados por Pedido) -->
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-4 align-top bg-gray-50/10">
                      <div class="text-[11px] font-black text-blue-600 mb-1">#{{ pedido.idpedido }}</div>
                      <div class="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                        <Clock class="h-3 w-3" />
                        {{ pedido.hora }}
                      </div>
                    </td>
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-4 align-top bg-gray-50/10">
                      <div class="flex flex-col gap-1">
                        <div class="text-sm font-black text-gray-800 leading-tight">{{ pedido.cliente }}</div>
                        <div class="flex items-center gap-1.5">
                          <Store class="h-3 w-3 text-orange-400" />
                          <span class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{{ pedido.sucursal }}</span>
                        </div>
                      </div>
                    </td>

                    <!-- Datos de Item (Agrupados por Item dentro del pedido) -->
                    <td v-if="pedido.isFirstInItem" :rowspan="pedido.itemRowspan" class="p-4 align-top">
                      <div class="flex items-center gap-3">
                        <div v-if="pedido.productoImagen" class="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                          <img :src="pedido.productoImagen" class="w-full h-full object-cover" />
                        </div>
                        <div v-else class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-300">
                          <Package class="h-4 w-4" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-xs font-bold text-gray-700 leading-snug">{{ pedido.productoNombre }}</span>
                          <!-- Mostrar items de promoción si existen -->
                          <div v-if="pedido.productos_de_promocion" class="mt-1 space-y-0.5">
                            <div v-for="(pPromo, ppIdx) in pedido.productos_de_promocion" :key="ppIdx" class="text-[9px] text-gray-500 italic bg-gray-50 px-1 rounded">
                              • {{ pPromo.cantidad_en_promo }} {{ pPromo.presentacion_producto }} {{ pPromo.producto_nombre }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td class="p-4 text-xs font-medium text-gray-500">{{ pedido.presentacion }}</td>
                    <td class="p-4 text-xs font-black text-gray-800 text-center">{{ pedido.productoCantidad }}</td>
                    <td class="p-4 text-xs font-bold text-gray-600 text-right">{{ parseFloat(pedido.productoPrecio || 0).toFixed(2) }} Bs.</td>
                    <td class="p-4 text-xs font-black text-gray-800 text-right">{{ parseFloat(pedido.subtotal || 0).toFixed(2) }} Bs.</td>
                    
                    <!-- Datos Financieros (Agrupados por Pedido) -->
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-4 align-top text-right bg-gray-50/10">
                      <div class="flex flex-col items-end gap-1">
                        <div class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total: {{ pedido.total.toFixed(2) }} Bs.</div>
                        <div class="text-[9px] font-bold text-emerald-600">Adelanto: {{ pedido.adelanto.toFixed(2) }}</div>
                        <div :class="['text-[9px] font-black p-1 rounded-lg px-2', pedido.saldo > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600']">
                          Saldo: {{ pedido.saldo.toFixed(2) }}
                        </div>
                      </div>
                    </td>
                    
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-4 align-top text-center bg-gray-50/10">
                      <div class="flex flex-col gap-2">
                        <span :class="[
                          'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-xs',
                          pedido.estado_nombre === 'PENDIENTE' ? 'bg-orange-100 text-orange-600' :
                          pedido.estado_nombre === 'FINALIZADO' ? 'bg-green-100 text-green-700' : 
                          pedido.estado_nombre === 'RESERVADO' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
                        ]">
                          {{ pedido.estado_nombre }}
                        </span>
                        <span class="text-[7px] font-black text-gray-400 border border-gray-100 rounded-lg px-2 py-0.5">{{ pedido.tipo_pedido }}</span>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="processedPedidosGrouped.length === 0" class="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
          <div class="flex flex-col items-center gap-3">
            <div class="p-4 bg-gray-50 rounded-full text-gray-300">
              <PackageSearch class="h-10 w-10" />
            </div>
            <h4 class="text-lg font-bold text-gray-800">Sin registros de pedidos</h4>
            <p class="text-gray-500 max-w-xs mx-auto">No se encontraron pedidos en el rango de fechas y filtros seleccionados.</p>
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
  Store, ClipboardList, Package, Trophy, Layers, 
  Calendar, Clock, List, PackageSearch, ChevronDown 
} from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  processedPedidosGrouped: {
    type: Array,
    required: true
  },
  consolidado: {
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

const getWeeklyDays = (weekKey) => {
  if (!props.agruparPorSemana || !props.processedPedidosGrouped) return []
  return props.processedPedidosGrouped.filter(g => getWeekMonday(g.fecha) === weekKey)
}

const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }

const pedidosSemanalDetalle = computed(() => {
  const weeks = {}
  props.processedPedidosGrouped.forEach(group => {
    const monday = getWeekMonday(group.fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantPedidos: 0, montoTotal: 0, pedidos: [] }
    }
    const w = weeks[monday]
    ;(group.pedidos || []).forEach(p => {
      w.pedidos.push({ idpedido: p.idpedido, cliente: p.cliente, total: parseFloat(p.total || 0), estado_nombre: p.estado_nombre })
    })
    w.cantPedidos += group.totalPedidos || group.pedidos?.length || 0
    w.montoTotal += (group.pedidos || []).reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
  })
  return Object.values(weeks).sort((a, b) => new Date(b.semana) - new Date(a.semana))
})

const weeklyConsolidados = computed(() => {
  const weekMap = {}
  const groups = props.processedPedidosGrouped || []
  groups.forEach(group => {
    const weekKey = getWeekMonday(group.fecha)
    if (!weekMap[weekKey]) weekMap[weekKey] = { pedidos: [] }
    ;(group.pedidos || []).forEach(p => {
      weekMap[weekKey].pedidos.push(p)
    })
  })
  const result = {}
  Object.entries(weekMap).forEach(([weekKey, weekData]) => {
    const pedidos = weekData.pedidos
    const sucMap = {}
    const estadoMap = {}
    const tipoMap = {}
    pedidos.forEach(p => {
      const suc = p.sucursal || 'Sin sucursal'
      if (!sucMap[suc]) sucMap[suc] = { nombre: suc, cant_pedidos: 0, total: 0 }
      sucMap[suc].cant_pedidos++
      sucMap[suc].total += Number(p.total || 0)
      const est = p.estado_nombre || 'DESCONOCIDO'
      if (!estadoMap[est]) estadoMap[est] = { estado: est, estado_nombre: est, cant_pedidos: 0, total: 0 }
      estadoMap[est].cant_pedidos++
      estadoMap[est].total += Number(p.total || 0)
      const tipo = p.tipo_nombre || p.tipo || 'General'
      if (!tipoMap[tipo]) tipoMap[tipo] = { nombre: tipo, cant_pedidos: 0, total: 0 }
      tipoMap[tipo].cant_pedidos++
      tipoMap[tipo].total += Number(p.total || 0)
    })
    result[weekKey] = {
      pedidosPorSucursal: Object.values(sucMap),
      pedidosPorEstado: Object.values(estadoMap),
      pedidosPorTipo: Object.values(tipoMap),
      productosTop: []
    }
  })
  return result
})

const pedidosPorSemana = computed(() => {
  const weeks = {}
  props.processedPedidosGrouped.forEach(group => {
    const monday = getWeekMonday(group.fecha)
    if (!weeks[monday]) {
      weeks[monday] = { semana: monday, semanaLabel: getWeekLabel(monday), cantPedidos: 0, montoTotal: 0 }
    }
    const total = (group.pedidos || []).reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
    weeks[monday].cantPedidos += group.totalPedidos || group.pedidos?.length || 0
    weeks[monday].montoTotal += total
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
const expandAll = () => expandedDates.value = props.processedPedidosGrouped.map(g => g.fecha)
const collapseAll = () => expandedDates.value = []

// Charts
const pedidosChartRef = ref(null)
const sucursalChartRef = ref(null)
const generalWeekChartRef = ref(null)
let pedidosChartInstance = null
let sucursalChartInstance = null
let generalWeekChartInstance = null

const chartLabels = computed(() => props.processedPedidosGrouped.map(g => g.semanaLabel || g.fecha))
const chartCantidad = computed(() => props.processedPedidosGrouped.map(g => g.totalPedidos || g.pedidos?.length || 0))

const sucursalLabels = computed(() => (props.consolidado?.pedidosPorSucursal || []).map(s => s.nombre))
const sucursalValues = computed(() => (props.consolidado?.pedidosPorSucursal || []).map(s => parseFloat(s.total || 0)))

const weeklyChartLabels = computed(() => pedidosPorSemana.value.map(w => w.semanaLabel))
const weeklyChartValues = computed(() => pedidosPorSemana.value.map(w => w.montoTotal))

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
  if (!sem || !sem.pedidosPorSucursal) return null
  return {
    labels: sem.pedidosPorSucursal.map(s => s.nombre),
    values: sem.pedidosPorSucursal.map(s => s.total),
    colors: weeklyColors.slice(0, sem.pedidosPorSucursal.length)
  }
}

const renderCharts = () => {
  if (pedidosChartInstance) { pedidosChartInstance.destroy(); pedidosChartInstance = null }
  if (sucursalChartInstance) { sucursalChartInstance.destroy(); sucursalChartInstance = null }

  if (chartLabels.value.length > 0 && pedidosChartRef.value) {
    pedidosChartInstance = new Chart(pedidosChartRef.value, {
      type: 'bar',
      data: {
        labels: chartLabels.value.map(l => props.formatFecha(l)),
        datasets: [{
          label: 'Pedidos (Bs.)',
          data: chartCantidad.value,
          backgroundColor: 'rgba(234, 88, 12, 0.7)',
          borderColor: 'rgba(234, 88, 12, 1)',
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
          label: 'Monto Total (Bs.)',
          data: weeklyChartValues.value,
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
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

watch(() => props.processedPedidosGrouped, () => setTimeout(renderCharts, 100), { deep: true })
watch(() => props.consolidado, () => setTimeout(renderCharts, 100), { deep: true })
watch(pedidosPorSemana, () => setTimeout(renderCharts, 100), { deep: true })
onMounted(() => setTimeout(renderCharts, 200))
onBeforeUnmount(() => {
  if (pedidosChartInstance) pedidosChartInstance.destroy()
  if (sucursalChartInstance) sucursalChartInstance.destroy()
  if (generalWeekChartInstance) generalWeekChartInstance.destroy()
  Object.values(weeklyChartInstances.value).forEach(i => i.destroy())
})

defineExpose({
  expandAllSemanas: () => {
    pedidosSemanalDetalle.value.forEach(sem => { expandedSemanas.value[sem.semana] = true })
  },
  collapseAllSemanas: () => {
    Object.keys(expandedSemanas.value).forEach(k => { expandedSemanas.value[k] = false })
  }
})
</script>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>
