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
      <div v-for="sem in sortedEvolucion" :key="sem.fecha" class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" @click="toggleSemana(sem.fecha)">
          <div class="flex items-center gap-3">
            <svg :class="['w-4 h-4 text-gray-400 transition-transform', expandedSemanas[sem.fecha] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ sem.semanaLabel }}</h3>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Ingresos</p>
              <p class="text-sm font-black text-green-600">{{ formatCurrency(parseFloat(sem.ingresos?.totalIngresosBakery || 0)) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Egresos</p>
              <p class="text-sm font-black text-red-600">{{ formatCurrency(parseFloat(sem.egresos?.totalEgresos || 0)) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400 uppercase font-black">Utilidad</p>
              <p :class="['text-sm font-black', parseFloat(sem.utilidadLimpiaDia || 0) >= 0 ? 'text-blue-600' : 'text-purple-600']">{{ formatCurrency(parseFloat(sem.utilidadLimpiaDia || 0)) }}</p>
            </div>
          </div>
        </div>
        <div v-if="expandedSemanas[sem.fecha]" class="p-6 space-y-6">
          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="bg-gradient-to-br from-green-50 to-white p-5 rounded-2xl border border-green-100 shadow-sm">
              <p class="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Total Ingresos</p>
              <p class="text-xl font-black text-green-700">{{ Number(sem.ingresos?.totalIngresosBakery || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
            </div>
            <div class="bg-gradient-to-br from-red-50 to-white p-5 rounded-2xl border border-red-100 shadow-sm">
              <p class="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Gastos Operativos</p>
              <p class="text-xl font-black text-red-700">{{ Number(sem.egresos?.gastosOperativos || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl border border-orange-100 shadow-sm">
              <p class="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Gastos Generales</p>
              <p class="text-xl font-black text-orange-700">0.00 <span class="text-xs">Bs.</span></p>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100 shadow-sm">
              <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Compras Insumos</p>
              <p class="text-xl font-black text-amber-700">{{ Number(sem.egresos?.comprasInsumos || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
            </div>
            <div :class="['p-5 rounded-2xl border shadow-sm', (sem.utilidadLimpiaDia || 0) >= 0 ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100']">
              <p class="text-[10px] font-black uppercase tracking-widest mb-1" :class="(sem.utilidadLimpiaDia || 0) >= 0 ? 'text-blue-600' : 'text-purple-600'">Ganancia Neta</p>
              <p class="text-xl font-black" :class="(sem.utilidadLimpiaDia || 0) >= 0 ? 'text-blue-700' : 'text-purple-700'">{{ Number(sem.utilidadLimpiaDia || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
            </div>
          </div>

          <!-- Rendimiento por Sucursal -->
          <div v-if="sucursalesGlobales.length > 0">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-indigo-100 rounded-xl">
                <Store class="h-5 w-5 text-indigo-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Rendimiento por Sucursal</h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="suc in sucursalesGlobales" :key="suc.idsucursal"
                   class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-4">
                  <div class="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <Building2 class="h-4 w-4 text-gray-400" />
                  </div>
                  <h5 class="font-black text-gray-800 truncate text-sm">{{ suc.sucursal }}</h5>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center text-xs p-2 bg-green-50/50 rounded-xl">
                    <span class="text-gray-500 font-bold">Ingresos</span>
                    <span class="font-black text-green-600">{{ Number(suc.ingresos?.totalGananciaBakery || 0).toFixed(2) }} Bs.</span>
                  </div>
                  <div class="flex justify-between items-center text-xs p-2 bg-red-50/50 rounded-xl">
                    <span class="text-gray-500 font-bold">Egresos</span>
                    <span class="font-black text-red-600">{{ Number(suc.egresos?.totalGastos || 0).toFixed(2) }} Bs.</span>
                  </div>
                  <div class="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-xl border border-gray-100 mt-1">
                    <span class="text-gray-600 font-black">Utilidad</span>
                    <span :class="['font-black', (suc.utilidadOperativa || 0) >= 0 ? 'text-blue-600' : 'text-purple-600']">
                      {{ Number(suc.utilidadOperativa || 0).toFixed(2) }} Bs.
                    </span>
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
                <CalendarIcon class="h-5 w-5 text-blue-600" />
              </div>
              <h4 class="text-lg font-bold text-gray-800">Detallado por Día</h4>
            </div>
            <div class="space-y-4">
              <div v-for="dia in getWeeklyDays(sem.fecha)" :key="dia.fecha" class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <CalendarIcon class="h-4 w-4 text-blue-500" />
                    <span class="font-bold text-gray-700 text-sm">{{ formatFecha(dia.fecha) }}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-xs text-green-600 font-black">{{ parseFloat(dia.ingresos?.totalIngresosBakery || 0).toFixed(2) }} Bs.</span>
                    <span class="text-xs text-red-600 font-black">{{ parseFloat(dia.egresos?.totalEgresos || 0).toFixed(2) }} Bs.</span>
                    <span :class="['text-xs font-black', (dia.utilidadLimpiaDia || 0) >= 0 ? 'text-blue-600' : 'text-purple-600']">
                      {{ parseFloat(dia.utilidadLimpiaDia || 0).toFixed(2) }} Bs.
                    </span>
                  </div>
                </div>
                <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                  <!-- Desglose Ingresos Día -->
                  <div>
                    <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <TrendingUp class="h-3 w-3 text-green-500" /> Desglose de Ingresos
                    </h5>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-gray-600">Ganancia Venta Tienda</span>
                        <span class="font-bold text-gray-800">{{ parseFloat(dia.ingresos?.gananciaVentaTienda || 0).toFixed(2) }} Bs.</span>
                      </div>
                      <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-gray-600">Ganancia Panadería/Ambulantes</span>
                        <span class="font-bold text-gray-800">{{ parseFloat(dia.ingresos?.gananciaPanaderiaAmbulantes || 0).toFixed(2) }} Bs.</span>
                      </div>
                      <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors border-t border-dashed border-gray-100 mt-2 pt-2">
                        <span class="text-gray-500 italic">Comisiones Pagadas (-)</span>
                        <span class="font-bold text-red-400">{{ parseFloat(dia.ingresos?.comisionesPagadasAEmpleados || 0).toFixed(2) }} Bs.</span>
                      </div>
                    </div>
                  </div>
                  <!-- Desglose Egresos Día -->
                  <div>
                    <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <TrendingDown class="h-3 w-3 text-red-500" /> Desglose de Egresos
                    </h5>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-gray-600">Compras de Insumos</span>
                        <span class="font-bold text-gray-800">{{ parseFloat(dia.egresos?.comprasInsumos || 0).toFixed(2) }} Bs.</span>
                      </div>
                      <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-gray-600">Gastos Operativos (Fijos/Variables)</span>
                        <span class="font-bold text-gray-800">{{ parseFloat(dia.egresos?.gastosOperativos || 0).toFixed(2) }} Bs.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="sortedEvolucion.length === 0" class="text-center py-12 text-gray-400">No hay datos en este período</div>
    </div>

    <!-- Resumen General -->
    <section v-if="reporte && reporte.resumenGeneral && !props.agruparPorSemana" class="animate-fade-in-up">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="bg-gradient-to-br from-green-50 to-white p-6 rounded-3xl border border-green-100 shadow-sm">
          <p class="text-xs font-black text-green-600 uppercase tracking-widest mb-1">Total Ingresos</p>
          <p class="text-2xl font-black text-green-700">{{ parseFloat(reporte.resumenGeneral.totalIngresos || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
        </div>
        <div class="bg-gradient-to-br from-red-50 to-white p-6 rounded-3xl border border-red-100 shadow-sm">
          <p class="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Gastos Operativos</p>
          <p class="text-2xl font-black text-red-700">{{ parseFloat(reporte.resumenGeneral.totalEgresosOperativos || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
        </div>
        <div class="bg-gradient-to-br from-orange-50 to-white p-6 rounded-3xl border border-orange-100 shadow-sm">
          <p class="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Gastos Generales</p>
          <p class="text-2xl font-black text-orange-700">{{ parseFloat(reporte.resumenGeneral.totalGastosGenerales || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
        </div>
        <div class="bg-gradient-to-br from-amber-50 to-white p-6 rounded-3xl border border-amber-100 shadow-sm">
          <p class="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Compras Central</p>
          <p class="text-2xl font-black text-amber-700">{{ parseFloat(reporte.resumenGeneral.totalComprasCentral || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
        </div>
        <div :class="['p-6 rounded-3xl border shadow-sm', (reporte.resumenGeneral.gananciaNetaFinal || 0) >= 0 ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100']">
          <p class="text-xs font-black uppercase tracking-widest mb-1" :class="(reporte.resumenGeneral.gananciaNetaFinal || 0) >= 0 ? 'text-blue-600' : 'text-purple-600'">Ganancia Neta Final</p>
          <p class="text-2xl font-black" :class="(reporte.resumenGeneral.gananciaNetaFinal || 0) >= 0 ? 'text-blue-700' : 'text-purple-700'">{{ parseFloat(reporte.resumenGeneral.gananciaNetaFinal || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
        </div>
      </div>
    </section>

    <!-- Gastos Generales -->
  
    <!-- Charts -->
    <section v-if="chartData.labels.length > 0 && !props.agruparPorSemana" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style="animation-delay: 0.03s">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Evolución Diaria de Ingresos, Egresos y Utilidad</h3>
        <div class="relative" style="height: 280px;">
          <canvas ref="lineChartRef"></canvas>
        </div>
      </div>
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Distribución de Ingresos por Sucursal</h3>
        <div class="relative" style="height: 280px;">
          <canvas ref="doughnutChartRef"></canvas>
        </div>
      </div>
    </section>

    <!-- Resumen Hoy por Sucursal -->
    <section v-if="reporte && reporte.resumenHoy && reporte.resumenHoy.length > 0 && !props.agruparPorSemana" class="animate-fade-in-up" style="animation-delay: 0.05s">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-amber-100 rounded-xl">
          <Clock class="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-800">Resumen del Día por Sucursal</h3>
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Fecha: {{ formatFecha(reporte.resumenHoy[0].fechaActual) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="sucHoy in reporte.resumenHoy" :key="sucHoy.idsucursal" 
             class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-gray-50 rounded-xl border border-gray-100">
              <Building2 class="h-5 w-5 text-gray-400" />
            </div>
            <h4 class="font-black text-gray-800 truncate">{{ sucHoy.sucursal }}</h4>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-center text-sm p-2 bg-green-50/50 rounded-xl">
              <span class="text-gray-500 font-bold">Ingresos</span>
              <span class="font-black text-green-600">{{ parseFloat(sucHoy.ingresos.totalIngresosBakery || 0).toFixed(2) }} Bs.</span>
            </div>
            <div class="flex justify-between items-center text-sm p-2 bg-red-50/50 rounded-xl">
              <span class="text-gray-500 font-bold">Egresos</span>
              <span class="font-black text-red-600">{{ parseFloat(sucHoy.egresos.totalEgresos || 0).toFixed(2) }} Bs.</span>
            </div>
            <div class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-xl border border-gray-100 mt-2">
              <span class="text-gray-600 font-black">Utilidad Hoy</span>
              <span :class="['font-black', (sucHoy.utilidadLimpiaDelDia || 0) >= 0 ? 'text-blue-600' : 'text-purple-600']">
                {{ parseFloat(sucHoy.utilidadLimpiaDelDia || 0).toFixed(2) }} Bs.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reporte por Sucursal -->
    <section v-if="reporte && reporte.reportePorSucursal && !props.agruparPorSemana" class="animate-fade-in-up" style="animation-delay: 0.1s">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-indigo-100 rounded-xl">
          <Store class="h-6 w-6 text-indigo-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-800">Rendimiento por Sucursal</h3>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div v-for="suc in reporte.reportePorSucursal" :key="suc.idsucursal" class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Building2 class="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h4 class="text-lg font-black text-gray-800">{{ suc.sucursal }}</h4>
                <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">{{ suc.idsucursal }}</p>
              </div>
            </div>
            <div class="flex gap-8">
              <div class="text-right">
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Ingresos</p>
                <p class="text-lg font-black text-green-600">{{ parseFloat(suc.ingresos.totalGananciaBakery || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Egresos</p>
                <p class="text-lg font-black text-red-600">{{ parseFloat(suc.egresos.totalGastos || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Utilidad</p>
                <p :class="['text-lg font-black', (suc.utilidadOperativa || 0) >= 0 ? 'text-blue-600' : 'text-purple-600']">
                  {{ parseFloat(suc.utilidadOperativa || 0).toFixed(2) }} <span class="text-xs">Bs.</span>
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-50">
            <!-- Detalle Ingresos -->
            <div>
              <h5 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp class="h-3 w-3 text-green-500" /> Detalle de Ingresos
              </h5>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                  <span class="text-sm text-gray-600 font-medium">Venta en Tienda</span>
                  <span class="text-sm font-black text-gray-800">{{ parseFloat(suc.ingresos.detalle.ingresosVentaTienda || 0).toFixed(2) }} Bs.</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                  <span class="text-sm text-gray-600 font-medium">Venta Ambulante (Bruta)</span>
                  <span class="text-sm font-black text-gray-800">{{ parseFloat(suc.ingresos.detalle.ventaAmbulanteBruta || 0).toFixed(2) }} Bs.</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-green-50 rounded-2xl border border-green-100">
                  <span class="text-sm text-green-700 font-bold">Ganancia Limpia Panadería</span>
                  <span class="text-sm font-black text-green-700">{{ parseFloat(suc.ingresos.detalle.gananciaLimpiaPanaderia || 0).toFixed(2) }} Bs.</span>
                </div>
              </div>
            </div>

            <!-- Detalle Egresos -->
            <div>
              <h5 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingDown class="h-3 w-3 text-red-500" /> Detalle de Egresos
              </h5>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 bg-gray-50 rounded-2xl">
                    <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Gastos Op.</p>
                    <p class="text-sm font-black text-gray-800">{{ parseFloat(suc.egresos.detalle.gastosOperativos || 0).toFixed(2) }} Bs.</p>
                  </div>
                  <div class="p-3 bg-gray-50 rounded-2xl">
                    <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Salarios</p>
                    <p class="text-sm font-black text-gray-800">{{ parseFloat(suc.egresos.detalle.salarios || 0).toFixed(2) }} Bs.</p>
                  </div>
                </div>

                <div v-if="suc.egresos.detalle.planilla && suc.egresos.detalle.planilla.length > 0" class="bg-gray-50 rounded-2xl p-4 shadow-inner">
                  <p class="text-[10px] text-gray-400 font-black uppercase mb-3">Planilla de Empleados</p>
                  <div class="space-y-2">
                    <div v-for="emp in suc.egresos.detalle.planilla" :key="emp.empleado" class="flex justify-between text-xs">
                      <span class="text-gray-600">{{ emp.empleado }}</span>
                      <span class="font-bold text-gray-800">{{ parseFloat(emp.monto).toFixed(2) }} Bs.</span>
                    </div>
                  </div>
                </div>

                <div v-if="suc.egresos.detalle.listaGastos && suc.egresos.detalle.listaGastos.length > 0" class="bg-gray-50 rounded-2xl p-4 shadow-inner">
                  <p class="text-[10px] text-gray-400 font-black uppercase mb-3">Gastos Variables</p>
                  <div class="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    <div v-for="(gasto, idx) in suc.egresos.detalle.listaGastos" :key="idx" class="flex justify-between text-xs border-b border-gray-100 pb-2 last:border-0">
                      <div>
                        <p class="font-bold text-gray-700">{{ gasto.servicio }}</p>
                        <p class="text-[9px] text-gray-400">{{ formatFecha(gasto.fecha) }}</p>
                      </div>
                      <span class="font-black text-red-600">{{ parseFloat(gasto.monto).toFixed(2) }} Bs.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Evolución Diaria -->
    <section v-if="reporte && reporte.evolucionDiaria && reporte.evolucionDiaria.length > 0 && !props.agruparPorSemana" class="animate-fade-in-up" style="animation-delay: 0.2s">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-xl">
            <Calendar class="h-6 w-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">{{ props.agruparPorSemana ? 'Evolución Financiera Semanal' : 'Evolución Financiera Diaria' }}</h3>
        </div>
        <div class="flex gap-2">
          <button @click="expandAll" class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Expandir todo</button>
          <button @click="collapseAll" class="text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Contraer todo</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="dia in sortedEvolucion" :key="dia.fecha" 
             class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300">
          
          <button @click="toggleDate(dia.fecha)" 
                  class="w-full p-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30 hover:bg-gray-50 transition-colors text-left">
            <div class="flex items-center gap-4">
              <div :class="['p-2 rounded-xl transition-all duration-300', isExpanded(dia.fecha) ? 'rotate-180 bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100']">
                <ChevronDown class="h-5 w-5" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <CalendarIcon class="h-4 w-4 text-gray-400" />
                  <span class="font-black text-gray-800">{{ dia.semanaLabel || formatFecha(dia.fecha) }}</span>
                </div>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{{ props.agruparPorSemana ? 'Balance de la Semana' : 'Balance del Día' }}</p>
              </div>
            </div>

            <div class="flex gap-8">
              <div class="text-right">
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Ingresos</p>
                <p class="text-lg font-black text-green-600">{{ parseFloat(dia.ingresos.totalIngresosBakery || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Egresos</p>
                <p class="text-lg font-black text-red-600">{{ parseFloat(dia.egresos.totalEgresos || 0).toFixed(2) }} <span class="text-xs">Bs.</span></p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Utilidad</p>
                <p :class="['text-lg font-black', (dia.utilidadLimpiaDia || 0) >= 0 ? 'text-blue-600' : 'text-purple-600']">
                  {{ parseFloat(dia.utilidadLimpiaDia || 0).toFixed(2) }} <span class="text-xs">Bs.</span>
                </p>
              </div>
            </div>
          </button>

          <div v-show="isExpanded(dia.fecha)" class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-50 bg-white">
            <!-- Desglose Ingresos Día -->
            <div>
              <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp class="h-3 w-3 text-green-500" /> Desglose de Ingresos
              </h5>
              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <span class="text-gray-600">Ganancia Venta Tienda</span>
                  <span class="font-bold text-gray-800">{{ parseFloat(dia.ingresos.gananciaVentaTienda || 0).toFixed(2) }} Bs.</span>
                </div>
                <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <span class="text-gray-600">Ganancia Panadería/Ambulantes</span>
                  <span class="font-bold text-gray-800">{{ parseFloat(dia.ingresos.gananciaPanaderiaAmbulantes || 0).toFixed(2) }} Bs.</span>
                </div>
                <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors border-t border-dashed border-gray-100 mt-2 pt-2">
                  <span class="text-gray-500 italic">Comisiones Pagadas (-)</span>
                  <span class="font-bold text-red-400">{{ parseFloat(dia.ingresos.comisionesPagadasAEmpleados || 0).toFixed(2) }} Bs.</span>
                </div>
              </div>
            </div>

            <!-- Desglose Egresos Día -->
            <div>
              <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingDown class="h-3 w-3 text-red-500" /> Desglose de Egresos
              </h5>
              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <span class="text-gray-600">Compras de Insumos</span>
                  <span class="font-bold text-gray-800">{{ parseFloat(dia.egresos.comprasInsumos || 0).toFixed(2) }} Bs.</span>
                </div>
                <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <span class="text-gray-600">Gastos Operativos (Fijos/Variables)</span>
                  <span class="font-bold text-gray-800">{{ parseFloat(dia.egresos.gastosOperativos || 0).toFixed(2) }} Bs.</span>
                </div>
              </div>
            </div>
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
  Store, Building2, TrendingUp, TrendingDown, 
  Calendar, ChevronDown, Calendar as CalendarIcon, Clock, DollarSign
} from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps({
  reporte: {
    type: Object,
    required: true
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

const financieroPorSemana = computed(() => {
  return sortedEvolucion.value.map(w => ({
    semana: w.fecha,
    semanaLabel: w.semanaLabel,
    ingresos: parseFloat(w.ingresos?.totalIngresosBakery || 0),
    egresos: parseFloat(w.egresos?.totalEgresos || 0),
    gastosGrales: parseFloat(w.egresos?.gastosOperativos || 0),
    compras: parseFloat(w.egresos?.comprasInsumos || 0),
    utilidad: parseFloat(w.utilidadLimpiaDia || 0)
  }))
})

const getWeeklyDays = (weekKey) => {
  if (!props.agruparPorSemana || !props.reporte?.evolucionDiaria) return []
  return [...props.reporte.evolucionDiaria].filter(d => getWeekMonday(d.fecha) === weekKey)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

// Lógica de Acordeón Semanal
const expandedSemanas = ref({})
const toggleSemana = (key) => { expandedSemanas.value[key] = !expandedSemanas.value[key] }
const sucursalesGlobales = computed(() => props.reporte?.reportePorSucursal || [])

// Lógica de Acordeón
const expandedDates = ref([])
const toggleDate = (fecha) => {
  const index = expandedDates.value.indexOf(fecha)
  if (index > -1) expandedDates.value.splice(index, 1)
  else expandedDates.value.push(fecha)
}
const isExpanded = (fecha) => expandedDates.value.includes(fecha)
const expandAll = () => {
  expandedDates.value = sortedEvolucion.value.map(d => d.fecha)
}
const collapseAll = () => expandedDates.value = []

const sortedEvolucion = computed(() => {
  if (!props.reporte?.evolucionDiaria) return []
  let days = [...props.reporte.evolucionDiaria].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  if (!props.agruparPorSemana) return days

  const weeks = {}
  days.forEach(d => {
    const monday = getWeekMonday(d.fecha)
    if (!weeks[monday]) {
      weeks[monday] = {
        fecha: monday,
        semanaLabel: getWeekLabel(monday),
        ingresos: { totalIngresosBakery: 0, gananciaVentaTienda: 0, gananciaPanaderiaAmbulantes: 0, comisionesPagadasAEmpleados: 0 },
        egresos: { totalEgresos: 0, comprasInsumos: 0, gastosOperativos: 0 },
        utilidadLimpiaDia: 0
      }
    }
    const w = weeks[monday]
    w.ingresos.totalIngresosBakery += parseFloat(d.ingresos?.totalIngresosBakery || 0)
    w.ingresos.gananciaVentaTienda += parseFloat(d.ingresos?.gananciaVentaTienda || 0)
    w.ingresos.gananciaPanaderiaAmbulantes += parseFloat(d.ingresos?.gananciaPanaderiaAmbulantes || 0)
    w.ingresos.comisionesPagadasAEmpleados += parseFloat(d.ingresos?.comisionesPagadasAEmpleados || 0)
    w.egresos.totalEgresos += parseFloat(d.egresos?.totalEgresos || 0)
    w.egresos.comprasInsumos += parseFloat(d.egresos?.comprasInsumos || 0)
    w.egresos.gastosOperativos += parseFloat(d.egresos?.gastosOperativos || 0)
    w.utilidadLimpiaDia += parseFloat(d.utilidadLimpiaDia || 0)
  })
  return Object.values(weeks).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Chart refs and data
const lineChartRef = ref(null)
const doughnutChartRef = ref(null)
const generalWeekChartRef = ref(null)
let lineChartInstance = null
let doughnutChartInstance = null
let generalWeekChartInstance = null

const chartData = computed(() => {
  const sorted = [...sortedEvolucion.value].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  return {
    labels: sorted.map(d => d.semanaLabel || d.fecha),
    ingresos: sorted.map(d => parseFloat(d.ingresos?.totalIngresosBakery || 0)),
    egresos: sorted.map(d => parseFloat(d.egresos?.totalEgresos || 0)),
    utilidad: sorted.map(d => parseFloat(d.utilidadLimpiaDia || 0))
  }
})

const sucursalChartData = computed(() => {
  const sucs = props.reporte?.reportePorSucursal || []
  return {
    labels: sucs.map(s => s.sucursal),
    values: sucs.map(s => parseFloat(s.utilidadOperativa || 0))
  }
})

const weeklyChartLabels = computed(() => financieroPorSemana.value.map(w => w.semanaLabel))
const weeklyChartIngresos = computed(() => financieroPorSemana.value.map(w => w.ingresos))
const weeklyChartEgresos = computed(() => financieroPorSemana.value.map(w => w.egresos))
const weeklyChartUtilidad = computed(() => financieroPorSemana.value.map(w => w.utilidad))

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
  const sucs = sucursalesGlobales.value
  if (!sucs || sucs.length === 0) return null
  return {
    labels: sucs.map(s => s.sucursal),
    values: sucs.map(s => parseFloat(s.utilidadOperativa || 0)),
    colors: weeklyColors.slice(0, sucs.length)
  }
}

const renderCharts = () => {
  // Destroy previous instances
  if (lineChartInstance) { lineChartInstance.destroy(); lineChartInstance = null }
  if (doughnutChartInstance) { doughnutChartInstance.destroy(); doughnutChartInstance = null }

  const cd = chartData.value
  if (cd.labels.length > 0 && lineChartRef.value) {
    lineChartInstance = new Chart(lineChartRef.value, {
      type: 'line',
      data: {
        labels: cd.labels.map(l => props.formatFecha(l)),
        datasets: [
          {
            label: 'Ingresos',
            data: cd.ingresos,
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4
          },
          {
            label: 'Egresos',
            data: cd.egresos,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4
          },
          {
            label: 'Utilidad',
            data: cd.utilidad,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4
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
          y: { beginAtZero: true, ticks: { callback: (v) => v + ' Bs.' } }
        }
      }
    })
  }

  const scd = sucursalChartData.value
  if (scd.labels.length > 0 && doughnutChartRef.value) {
    const colors = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444', '#eab308', '#ec4899', '#6366f1']
    doughnutChartInstance = new Chart(doughnutChartRef.value, {
      type: 'doughnut',
      data: {
        labels: scd.labels,
        datasets: [{
          data: scd.values,
          backgroundColor: colors.slice(0, scd.labels.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
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
        datasets: [
          {
            label: 'Ingresos',
            data: weeklyChartIngresos.value,
            backgroundColor: 'rgba(22, 163, 74, 0.7)',
            borderColor: 'rgba(22, 163, 74, 1)',
            borderWidth: 2, borderRadius: 4
          },
          {
            label: 'Egresos',
            data: weeklyChartEgresos.value,
            backgroundColor: 'rgba(220, 38, 38, 0.7)',
            borderColor: 'rgba(220, 38, 38, 1)',
            borderWidth: 2, borderRadius: 4
          },
          {
            label: 'Utilidad',
            data: weeklyChartUtilidad.value,
            backgroundColor: 'rgba(37, 99, 235, 0.7)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 2, borderRadius: 4
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
}

watch(() => props.reporte, () => {
  setTimeout(renderCharts, 100)
}, { deep: true })

watch(financieroPorSemana, () => setTimeout(renderCharts, 100), { deep: true })

onMounted(() => {
  setTimeout(renderCharts, 200)
})

onBeforeUnmount(() => {
  if (lineChartInstance) lineChartInstance.destroy()
  if (doughnutChartInstance) doughnutChartInstance.destroy()
  if (generalWeekChartInstance) generalWeekChartInstance.destroy()
  Object.values(weeklyChartInstances.value).forEach(i => i.destroy())
})

defineExpose({
  expandAllSemanas: () => {
    financieroPorSemana.value.forEach(sem => { expandedSemanas.value[sem.fecha] = true })
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
