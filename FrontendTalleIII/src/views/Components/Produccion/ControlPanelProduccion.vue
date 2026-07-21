<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Active Production Header -->
    <div class="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 p-8 opacity-10">
        <Factory class="h-32 w-32" />
      </div>
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
              Producción Activa
            </span>
            <span class="text-orange-200 font-bold text-sm">#{{ produccion.IdProduccion }}</span>
          </div>
          <h2 class="text-3xl font-black">{{ produccion.Sucursal?.Nombre }}</h2>
            <div class="flex items-center gap-4 mt-1">
              <p class="text-orange-100 flex items-center gap-2">
                <Clock class="h-4 w-4" />
                Iniciado a las {{ produccion.HoraInicio }}
              </p>
              <div v-if="produccion.Empleados?.length" class="flex items-center gap-2">
                <User class="h-4 w-4 text-orange-100 shrink-0" />
                <input 
                  type="text" 
                  :value="produccion.Empleados[0]?.Empleado?.Nombre || 'Sistema'" 
                  readonly
                  class="bg-white/10 backdrop-blur-sm text-white text-sm font-bold border border-white/20 rounded-xl px-3 py-1.5 w-auto min-w-[140px] outline-none cursor-default"
                />
              </div>
              <button 
                @click="abrirModalInsumos"
                class="text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 font-bold flex items-center gap-2 transition-all"
              >
                <Warehouse class="h-3.5 w-3.5" />
                Ver Insumos
              </button>
            </div>
        </div>
        <div class="flex items-center gap-3">
          <button 
            @click="showFinalizarModal = true"
            class="bg-white text-red-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2"
          >
            <Power class="h-5 w-5" />
            Finalizar Todo
          </button>
          <button 
            @click="$emit('close')"
            class="bg-orange-500/30 text-white p-3 rounded-2xl hover:bg-orange-500/50 transition-all active:scale-95 border border-white/20"
            title="Cerrar Administrador"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Ovens and Employees -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Section: Hornos -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Flame class="h-5 w-5 text-orange-500" />
              Hornos
            </h3>
            <button 
              @click="abrirModalEncender"
              class="p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
            >
              <Plus class="h-5 w-5" />
            </button>
          </div>

          <div v-if="produccion.DetalleHorno?.filter(h => !h.HoraFin).length === 0" class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
            <p class="text-sm font-medium">No hay hornos encendidos</p>
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="h in produccion.DetalleHorno.filter(h => !h.HoraFin)" :key="h.IdProduccionHornoDetalle" class="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-bold text-gray-800">{{ h.Horno?.Nombre }}</p>
                  <p class="text-xs text-orange-600 font-bold uppercase tracking-wider">{{ h.TipoEnergia }}</p>
                </div>
                <div class="flex flex-col gap-1">
                  <button 
                    @click="abrirCambioCombustible(h)"
                    class="text-[10px] bg-white text-gray-600 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 font-bold uppercase"
                  >
                    Cambiar
                  </button>
                  <button 
                    @click="handleApagarHorno(h)"
                    class="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-lg border border-red-100 hover:bg-red-100 font-bold uppercase"
                  >
                    Apagar
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase">
                <span>Desde: {{ h.HoraInicio }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Empleados (hidden) -->
      </div>

      <!-- Right Column: Registration and Details -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 h-full">
          
          <!-- Cost Summary Section (Now at the top) -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p class="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Costo Total</p>
              <p class="text-xl font-black text-gray-800">{{ Number(produccion.CostoTotal || 0).toFixed(2) }}<span class="text-xs ml-1">Bs</span></p>
            </div>
            <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Insumos</p>
              <p class="text-xl font-black text-gray-800">{{ Number(produccion.CostoInsumos || 0).toFixed(2) }}<span class="text-xs ml-1">Bs</span></p>
            </div>
            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Mano Obra</p>
              <p class="text-xl font-black text-gray-800">{{ Number(produccion.CostoManoObra || 0).toFixed(2) }}<span class="text-xs ml-1">Bs</span></p>
            </div>
            <div class="p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <p class="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Indirectos</p>
              <p class="text-xl font-black text-gray-800">{{ Number(produccion.CostoIndirecto || 0).toFixed(2) }}<span class="text-xs ml-1">Bs</span></p>
            </div>
          </div>

          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              <PackagePlus class="h-6 w-6 text-green-500" />
              Registrar Salida de Producto
            </h3>
            <div class="flex items-center gap-2">
              <button 
                @click="agregarFila"
                class="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-green-100 transition-all flex items-center gap-2"
              >
                <Plus class="h-4 w-4" />
                Agregar Fila
              </button>
              <button 
                @click="abrirModalDescartar"
                class="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <Trash2 class="h-4 w-4" />
                Descartar Dañados
              </button>
            </div>
          </div>

          <!-- Bulk Registration Table -->
          <div v-if="salidasMasivas.length > 0" class="space-y-4 mb-6">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th class="py-3 pr-2">Producto</th>
                    <th class="py-3 px-2">Cantidad</th>
                    <th class="py-3 px-2">Horno</th>
                    <th class="py-3 px-2">Responsable</th>
                    <th class="py-3 px-2">Hora</th>
                    <th class="py-3 pl-2 w-10"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="(fila, idx) in salidasMasivas" :key="idx" class="hover:bg-orange-50/20 transition-colors">
                    <td class="py-2 pr-2">
                      <select 
                        v-model="fila.IdProducto"
                        required
                        class="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-700 text-xs"
                      >
                        <option value="" disabled>Producto</option>
                        <option v-for="p in productos" :key="p.idproducto" :value="p.idproducto">{{ p.nombre }}</option>
                      </select>
                    </td>
                    <td class="py-2 px-2">
                      <input 
                        v-model.number="fila.Cantidad"
                        type="number"
                        min="1"
                        class="w-20 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-gray-800 text-center text-sm"
                      />
                    </td>
                    <td class="py-2 px-2">
                      <select 
                        v-model="fila.IdHorno"
                        required
                        class="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-700 text-xs"
                      >
                        <option value="" disabled>Horno</option>
                        <option v-for="h in produccion.DetalleHorno?.filter(h => !h.HoraFin)" :key="h.Horno?.IdHorno" :value="h.Horno?.IdHorno">
                          {{ h.Horno?.Nombre }}
                        </option>
                      </select>
                    </td>
                    <td class="py-2 px-2">
                      <select 
                        v-model="fila.IdEmpleado"
                        class="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-700 text-xs"
                      >
                        <option value="">Seleccionar</option>
                        <option v-for="emp in produccion.Empleados?.filter(e => !e.HoraFin)" :key="emp.Empleado?.IdEmpleado" :value="emp.Empleado?.IdEmpleado">
                          {{ emp.Empleado?.Nombre }}
                        </option>
                      </select>
                    </td>
                    <td class="py-2 px-2">
                      <input 
                        type="time"
                        v-model="fila.HoraRegistro"
                        class="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-700 text-xs"
                      />
                    </td>
                    <td class="py-2 pl-2">
                      <button @click="removerFila(idx)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <X class="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl mb-6">
            <p class="text-sm font-medium">Agregue filas para registrar salidas masivas</p>
          </div>

          <div class="pt-2">
            <button 
              @click="handleRegistrarMasivo"
              :disabled="submittingSalida || !tieneHornosActivos || salidasMasivas.length === 0"
              class="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[2rem] font-black text-lg tracking-[0.2em] shadow-xl hover:shadow-green-200 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <component :is="submittingSalida ? Loader2 : CheckCircle" :class="['h-6 w-6', { 'animate-spin': submittingSalida }]" />
              {{ submittingSalida ? 'PROCESANDO...' : `REGISTRAR ${salidasMasivas.length} SALIDA(S)` }}
            </button>
            <p v-if="!tieneHornosActivos" class="text-center text-xs text-red-500 font-bold mt-2 uppercase">
              Debes encender al menos un horno para registrar productos
            </p>
          </div>

          <!-- Detalle de Producción por Empleado (Now at the bottom) -->
          <div class="mt-12 border-t border-gray-100 pt-8">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Detalle de Producción por Personal</h4>
            
            <div v-if="Object.keys(salidasPorEmpleado).length === 0" class="text-center py-12 text-gray-300 italic bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
              Aún no se han registrado salidas
            </div>
            
            <div v-else class="space-y-8">
              <div v-for="(logs, empleado) in salidasPorEmpleado" :key="empleado" class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h5 class="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <User class="h-4 w-4 text-orange-500" />
                    {{ empleado }}
                  </h5>
                  <span class="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase">
                    {{ logs.length }} registros
                  </span>
                </div>
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                        <th class="px-6 py-3">Hora Registro</th>
                        <th class="px-6 py-3">Producto</th>
                        <th class="px-6 py-3 text-center">Cantidad</th>
                        <th class="px-6 py-3">Horno</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr v-for="log in logs" :key="log.IdHornoProducto" class="hover:bg-orange-50/20 transition-colors">
                        <td class="px-6 py-3">
                          <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            {{ formatTime(log.Hora) }}
                          </span>
                        </td>
                        <td class="px-6 py-3">
                          <p class="text-sm font-bold text-gray-800">{{ log.Producto }}</p>
                        </td>
                        <td class="px-6 py-3 text-center">
                          <span class="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-xl">
                            {{ log.Cantidad }}
                          </span>
                        </td>
                        <td class="px-6 py-3">
                          <div class="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <Flame class="h-3.5 w-3.5 text-orange-400" />
                            {{ log.Horno }}
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
    </div>

    <!-- Modal: Agregar Empleado -->
    <div v-if="showAddEmpleadoModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        <div class="p-8">
          <h3 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
             <div class="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-200">
                <Users class="h-6 w-6 text-white" />
             </div>
             Agregar Personal
          </h3>
          
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Empleado</label>
              <select v-model="selectedEmpleadoToAdd" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700">
                <option value="" disabled>Elegir Empleado</option>
                <option v-for="e in filteredEmpleadosParaAgregar" :key="e.idempleado" :value="e.idempleado">
                  {{ e.nombre }} {{ e.apellidopaterno }} ({{ e.cargo }})
                </option>
              </select>
              <p v-if="filteredEmpleadosParaAgregar.length === 0" class="text-[10px] text-red-500 font-bold px-1 uppercase">
                No hay más empleados disponibles en esta sucursal
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hora de Ingreso</label>
              <input type="time" v-model="horaInicioEmpleado" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700" required />
            </div>
          </div>

          <div class="flex gap-4 mt-10">
            <button @click="showAddEmpleadoModal = false" class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
            <button 
              @click="handleAddEmpleado"
              :disabled="!selectedEmpleadoToAdd || submittingAddEmpleado"
              class="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
               <Loader2 v-if="submittingAddEmpleado" class="h-4 w-4 animate-spin" />
               {{ submittingAddEmpleado ? 'AGREGANDO...' : 'AGREGAR' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Consultar Insumos -->
    <div v-if="showInsumosModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
        <div class="p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-black text-gray-800 flex items-center gap-3">
               <div class="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200">
                  <Warehouse class="h-6 w-6 text-white" />
               </div>
               Stock de Insumos
            </h3>
            <button @click="showInsumosModal = false" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X class="h-6 w-6 text-gray-400" />
            </button>
          </div>
          
          <div v-if="loadingInsumos" class="flex justify-center py-20">
             <Loader2 class="h-10 w-10 text-orange-500 animate-spin" />
          </div>
          <div v-else-if="insumosStock.length === 0" class="text-center py-20 text-gray-400 italic">
            No se encontraron insumos para esta sucursal
          </div>
          <div v-else class="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="ins in insumosStock" :key="ins.idinsumo" class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 border border-gray-100 overflow-hidden">
                    <img v-if="ins.Imagen" :src="ins.Imagen" class="w-full h-full object-cover" />
                    <Package v-else class="h-6 w-6 opacity-20" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-gray-800">{{ ins.Nombre }}</p>
                    <p class="text-[10px] text-gray-500 font-bold italic uppercase">{{ ins.UnidadNombre || 'Insumo' }}</p>
                  </div>
                </div>
                
                <div class="bg-white rounded-xl p-3 border border-orange-100/50">
                   <div class="flex justify-between items-center mb-1">
                      <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Existencia Total</span>
                      <span class="text-xs font-black text-orange-600">{{ ins.StockGramos }} g</span>
                   </div>
                   <div v-if="ins.UnidadNombre" class="pt-2 border-t border-gray-50 flex justify-between items-center">
                      <span class="text-[10px] font-bold text-gray-500">En {{ ins.UnidadNombre }}</span>
                      <span class="text-xs font-black text-gray-800">
                        {{ (ins.StockGramos / (ins.CantidadUnidad || 1)).toFixed(2) }} {{ ins.AbreviaturaUnidad || '' }}
                      </span>
                   </div>
                </div>
              </div>
            </div>
          </div> 

          <div class="mt-8 pt-6 border-t border-gray-100 text-center">
            <button @click="showInsumosModal = false" class="px-10 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Encender Horno -->
    <div v-if="showEncenderModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        <div class="p-8">
          <h3 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
             <div class="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200">
                <Flame class="h-6 w-6 text-white" />
             </div>
             Encender Horno
          </h3>
          
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Horno</label>
              <select v-model="hornoForm.IdHorno" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-gray-700">
                <option value="" disabled>Elegir Horno</option>
                <option v-for="h in hornosDisponibles" :key="h.IdHorno" :value="h.IdHorno">{{ h.Nombre }}</option>
              </select>
            </div>

            <div v-if="selectedHorno" class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Energía</label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  v-for="e in selectedHorno.Energia" 
                  :key="e.Tipo"
                  type="button"
                  @click="hornoForm.TipoEnergia = e.Tipo"
                  :class="['px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all border-2', 
                    hornoForm.TipoEnergia === e.Tipo ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200']"
                >
                  {{ e.Tipo }}
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hora de Encendido</label>
              <input type="time" v-model="hornoForm.HoraInicio" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-gray-700" required />
            </div>
          </div>

          <div class="flex gap-4 mt-10">
            <button @click="showEncenderModal = false" class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
            <button 
              @click="handleEncenderHorno"
              :disabled="!hornoForm.IdHorno || !hornoForm.TipoEnergia || submittingHorno"
              class="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
               <Loader2 v-if="submittingHorno" class="h-4 w-4 animate-spin" />
               {{ submittingHorno ? 'ENCENDIENDO...' : 'ENCENDER' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Cambiar Combustible -->
    <div v-if="showCambioModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        <div class="p-8">
          <h3 class="text-2xl font-black text-gray-800 mb-2">Cambiar Energía</h3>
          <p class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-8">{{ selectedDetalleHorno?.Horno?.Nombre }}</p>
          
          <div class="space-y-4">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nueva Energía</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                v-for="e in hornosDisponibles.find(h => h.IdHorno === selectedDetalleHorno?.Horno?.IdHorno)?.Energia" 
                :key="e.Tipo"
                type="button"
                @click="nuevoTipoEnergia = e.Tipo"
                :class="['px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all border-2', 
                  nuevoTipoEnergia === e.Tipo ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200']"
              >
                {{ e.Tipo }}
              </button>
            </div>

            <div class="space-y-2 mt-4">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hora del Cambio</label>
              <input type="time" v-model="horaCambioCombustible" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-gray-700" required />
            </div>
          </div>

          <div class="flex gap-4 mt-10">
            <button @click="showCambioModal = false" class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
            <button 
              @click="handleCambiarCombustible"
              :disabled="!nuevoTipoEnergia || submittingCambio"
              class="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
               <Loader2 v-if="submittingCambio" class="h-4 w-4 animate-spin" />
               {{ submittingCambio ? 'CAMBIANDO...' : 'CONFIRMAR' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Finalizar Producción -->
    <div v-if="showFinalizarModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in text-center">
        <div class="p-8">
          <div class="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle class="h-10 w-10" />
          </div>
          <h3 class="text-2xl font-black text-gray-800 mb-2">¿Finalizar Producción?</h3>
          <p class="text-gray-500 text-sm mb-6">Esto cerrará todos los turnos de empleados y el consumo de hornos.</p>
          
          <div class="space-y-2 mb-8 text-left">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hora de Cierre Total</label>
            <input type="time" v-model="horaFinProduccion" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-700" required />
          </div>

          <div class="flex flex-col gap-3">
             <button 
              @click="handleFinalizarTodo"
              :disabled="submittingFinalizar || !horaFinProduccion"
              class="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-100 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
               <Loader2 v-if="submittingFinalizar" class="h-4 w-4 animate-spin" />
               SÍ, FINALIZAR TODO
            </button>
            <button @click="showFinalizarModal = false" class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
              VOLVER AL PANEL
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Finalizar Turno Empleado -->
    <div v-if="showFinTurnoModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in text-center">
        <div class="p-8">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogOut class="h-8 w-8" />
          </div>
          <h3 class="text-xl font-black text-gray-800 mb-2">Finalizar Turno</h3>
          <p class="text-gray-500 text-xs font-bold uppercase mb-6">{{ selectedPeToFinalize?.Empleado?.Nombre }}</p>
          
          <div class="space-y-2 mb-8 text-left">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hora de Salida</label>
            <input type="time" v-model="horaFinTurno" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-700" required />
          </div>
          
          <div class="flex flex-col gap-3">
             <button @click="handleFinTurno" class="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-all">
               CONFIRMAR SALIDA
            </button>
            <button @click="showFinTurnoModal = false" class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Descartar Producto -->
    <div v-if="showDescartarModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        <div class="p-8">
          <h3 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
             <div class="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-200">
                <Trash2 class="h-6 w-6 text-white" />
             </div>
             Descartar Producto
          </h3>
          
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Producto</label>
              <select v-model="descarteForm.IdProducto" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-700">
                <option value="" disabled>Elegir Producto</option>
                <option v-for="p in productos" :key="p.idproducto" :value="p.idproducto">{{ p.nombre }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad a Descartar</label>
              <input type="number" v-model.number="descarteForm.Cantidad" min="1" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-700" required />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivo del Descarte</label>
              <textarea v-model="descarteForm.Motivo" rows="3" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-700 resize-none" placeholder="Ej: Se quemó, se cayó..." required></textarea>
            </div>
          </div>

          <div class="flex gap-4 mt-10">
            <button @click="showDescartarModal = false" class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
            <button 
              @click="handleDescartarProducto"
              :disabled="!descarteForm.IdProducto || submittingDescarte"
              class="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
               <Loader2 v-if="submittingDescarte" class="h-4 w-4 animate-spin" />
               {{ submittingDescarte ? 'DESCARTANDO...' : 'DESCARTAR' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { 
  Factory, Clock, Plus, Flame, Users, User, LogOut, PackagePlus, 
  Package, CheckCircle, Loader2, AlertTriangle, Power, X, Warehouse, Trash2
} from 'lucide-vue-next';

import { 
  encenderHorno, cambiarCombustibleHorno, finalizarTurnoEmpleado, 
  registrarSalidaProducto, finalizarProduccionTotal, Agregarempleado, getInsumosSucursal,
  descartarProducto, apagarHorno, registrarSalidaProductoMasiva
} from '@/Server/Produccion';
import { ListHornos } from '@/Server/Sucural';
import { listProduct } from '@/Server/Producto';
import { ListEmpleado } from '@/Server/Empleado';

const props = defineProps({
  produccion: { type: Object, required: true }
});

const emit = defineEmits(['updated', 'toast', 'close']);

// State
const hornosDisponibles = ref([]); 
const productos = ref([]);
const empleadosDisponibles = ref([]);
const insumosStock = ref([]);
const loadingInsumos = ref(false);

const submittingHorno = ref(false);
const submittingCambio = ref(false);
const submittingSalida = ref(false);
const submittingFinalizar = ref(false);
const submittingAddEmpleado = ref(false);
const submittingDescarte = ref(false);
const submittingApagarHorno = ref(false);

// Modals
const showEncenderModal = ref(false);
const showCambioModal = ref(false);
const showFinalizarModal = ref(false);
const showAddEmpleadoModal = ref(false);
const showInsumosModal = ref(false);
const showDescartarModal = ref(false);

// Forms
const hornoForm = reactive({
  IdHorno: '',
  TipoEnergia: '',
  HoraInicio: ''
});

const selectedDetalleHorno = ref(null);
const nuevoTipoEnergia = ref('');
const horaCambioCombustible = ref('');

const salidaForm = reactive({
  IdProducto: '',
  Cantidad: 1,
  IdHorno: '',
  IdEmpleado: '',
  HoraRegistro: ''
});

// Bulk Registration
const salidasMasivas = ref([]);

const agregarFila = () => {
  const primerEmp = props.produccion.Empleados?.find(e => !e.HoraFin);
  salidasMasivas.value.push({
    IdProducto: '',
    Cantidad: 1,
    IdHorno: '',
    IdEmpleado: primerEmp?.Empleado?.IdEmpleado || '',
    HoraRegistro: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  });
};

const removerFila = (idx) => {
  salidasMasivas.value.splice(idx, 1);
};

const tieneHornosActivos = computed(() => {
  return props.produccion.DetalleHorno?.some(h => !h.HoraFin) || false;
});

const descarteForm = reactive({
  IdProducto: '',
  Cantidad: 1,
  Motivo: ''
});

const selectedEmpleadoToAdd = ref('');
const horaInicioEmpleado = ref('');

const selectedPeToFinalize = ref(null);
const horaFinTurno = ref('');
const showFinTurnoModal = ref(false);

const horaFinProduccion = ref('');

const horaActual = ref(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

// Computed
const selectedHorno = computed(() => {
  return hornosDisponibles.value.find(h => h.IdHorno === hornoForm.IdHorno);
});

const filteredEmpleadosParaAgregar = computed(() => {
  const idsAsignados = props.produccion.Empleados?.map(pe => pe.Empleado?.IdEmpleado) || [];
  return empleadosDisponibles.value.filter(e => !idsAsignados.includes(e.idempleado));
});

const salidasPorEmpleado = computed(() => {
  const salidas = props.produccion.SalidasDetalladas || [];
  const grouped = {};
  
  salidas.forEach(s => {
    const empName = s.Empleado || 'Sin asignar';
    if (!grouped[empName]) {
      grouped[empName] = [];
    }
    grouped[empName].push(s);
  });
  
  return grouped;
});

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  const match = timeStr.match(/(\d{2}:\d{2})/);
  return match ? match[1] : timeStr;
};

// Data Loading
const loadInitialData = async () => {
  try {
    const [h, p, e] = await Promise.all([
      ListHornos(props.produccion.Sucursal.IdSucursal),
      listProduct(),
      ListEmpleado(props.produccion.Sucursal.IdSucursal)
    ]);
    
    // Transform Hornos
    const listH = h.result || h;
    hornosDisponibles.value = listH.map(item => ({
      IdHorno: item.idhorno,
      Nombre: item.nombre,
      Energia: (item.energias || []).map(e => ({ Tipo: e.tipoEnergia }))
    }));

    productos.value = p.result || p;
    empleadosDisponibles.value = e.result || e;
  } catch (error) {
    console.error("Error loading panel data:", error);
  }
};

const loadInsumosStock = async () => {
  loadingInsumos.value = true;
  try {
    const res = await getInsumosSucursal(props.produccion.Sucursal.IdSucursal, '', 50, 1);
    insumosStock.value = res.data || [];
  } catch (error) {
    console.error("Error loading insumos:", error);
    emit('toast', 'Error al cargar stock de insumos', 'error');
  } finally {
    loadingInsumos.value = false;
  }
};

onMounted(() => {
  loadInitialData();
  const emp = props.produccion.Empleados?.find(e => !e.HoraFin);
  if (emp?.Empleado?.IdEmpleado) {
    salidaForm.IdEmpleado = emp.Empleado.IdEmpleado;
  }
  agregarFila();
});

// Handlers
const abrirModalEncender = () => {
  hornoForm.IdHorno = '';
  hornoForm.TipoEnergia = '';
  hornoForm.HoraInicio = '';
  showEncenderModal.value = true;
};

const handleEncenderHorno = async () => {
  if (!hornoForm.HoraInicio) {
    emit('toast', 'Debe ingresar la hora de inicio', 'error');
    return;
  }
  submittingHorno.value = true;
  try {
     await encenderHorno(props.produccion.IdProduccion, hornoForm.IdHorno, hornoForm.TipoEnergia, hornoForm.HoraInicio);
    emit('toast', 'Horno encendido correctamente', 'success');
    showEncenderModal.value = false;
    emit('updated');
  } catch (error) {
    emit('toast', 'Error al encender horno', 'error');
  } finally {
    submittingHorno.value = false;
  }
};

const handleApagarHorno = async (h) => {
  const horaFin = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (!confirm(`¿Desea apagar el horno ${h.Horno?.Nombre}?`)) return;
  
  submittingApagarHorno.value = true;
  try {
    await apagarHorno(props.produccion.IdProduccion, h.Horno.IdHorno, horaFin);
    emit('toast', 'Horno apagado con éxito', 'success');
    emit('updated');
  } catch (error) {
    emit('toast', 'Error al apagar horno', 'error');
  } finally {
    submittingApagarHorno.value = false;
  }
};

const abrirModalAddEmpleado = () => {
  selectedEmpleadoToAdd.value = '';
  horaInicioEmpleado.value = '';
  showAddEmpleadoModal.value = true;
};

const handleAddEmpleado = async () => {
  if (!selectedEmpleadoToAdd.value || !horaInicioEmpleado.value) return;
  submittingAddEmpleado.value = true;
  try {
    await Agregarempleado(props.produccion.IdProduccion, selectedEmpleadoToAdd.value, horaInicioEmpleado.value);
    emit('toast', 'Empleado agregado a la producción', 'success');
    showAddEmpleadoModal.value = false;
    emit('updated');
  } catch (error) {
    emit('toast', 'Error al agregar empleado', 'error');
  } finally {
    submittingAddEmpleado.value = false;
  }
};

const abrirModalInsumos = () => {
  loadInsumosStock();
  showInsumosModal.value = true;
};

const abrirCambioCombustible = (h) => {
  selectedDetalleHorno.value = h;
  nuevoTipoEnergia.value = '';
  horaCambioCombustible.value = '';
  showCambioModal.value = true;
};

const handleCambiarCombustible = async () => {
  if (!horaCambioCombustible.value) {
    emit('toast', 'Debe ingresar la hora de cambio', 'error');
    return;
  }
  submittingCambio.value = true;
  try {
      await cambiarCombustibleHorno(
      props.produccion.IdProduccion, 
      selectedDetalleHorno.value.Horno.IdHorno, 
      nuevoTipoEnergia.value,
      props.produccion.Sucursal.IdSucursal,
      horaCambioCombustible.value
    );
    emit('toast', 'Combustible cambiado', 'success');
    showCambioModal.value = false;
    emit('updated');
  } catch (error) {
    emit('toast', 'Error al cambiar combustible', 'error');
  } finally {
    submittingCambio.value = false;
  }
};

const confirmarFinTurno = (pe) => {
  selectedPeToFinalize.value = pe;
  horaFinTurno.value = '';
  showFinTurnoModal.value = true;
};

const handleFinTurno = async () => {
  if (!horaFinTurno.value) return;
  try {
    await finalizarTurnoEmpleado(props.produccion.IdProduccion, selectedPeToFinalize.value.Empleado.IdEmpleado, horaFinTurno.value);
    emit('toast', 'Turno finalizado', 'success');
    showFinTurnoModal.value = false;
    emit('updated');
  } catch (error) {
    emit('toast', 'Error al finalizar turno', 'error');
  }
};

const handleRegistrarMasivo = async () => {
  const incompletas = salidasMasivas.value.filter(f => !f.IdProducto || !f.Cantidad || !f.IdHorno);
  if (incompletas.length > 0) {
    emit('toast', 'Complete todas las filas antes de registrar', 'error');
    return;
  }

  submittingSalida.value = true;
  try {
    await registrarSalidaProductoMasiva(props.produccion.IdProduccion, salidasMasivas.value);
    emit('toast', `${salidasMasivas.value.length} salida(s) registrada(s) con éxito`, 'success');
    salidasMasivas.value = [];
    emit('updated');
  } catch (error) {
    emit('toast', error.message || 'Error al registrar salidas', 'error');
  } finally {
    submittingSalida.value = false;
  }
};

const abrirModalDescartar = () => {
  descarteForm.IdProducto = '';
  descarteForm.Cantidad = 1;
  descarteForm.Motivo = '';
  showDescartarModal.value = true;
};

const handleDescartarProducto = async () => {
  if (!descarteForm.IdProducto || !descarteForm.Cantidad || !descarteForm.Motivo) {
    emit('toast', 'Complete todos los campos de descarte', 'error');
    return;
  }
  submittingDescarte.value = true;
  try {
    await descartarProducto(props.produccion.IdProduccion, descarteForm.IdProducto, descarteForm.Cantidad, descarteForm.Motivo);
    emit('toast', 'Producto descartado correctamente', 'success');
    showDescartarModal.value = false;
    emit('updated');
  } catch (error) {
    emit('toast', error.response?.data?.message || 'Error al descartar producto', 'error');
  } finally {
    submittingDescarte.value = false;
  }
};

const handleFinalizarTodo = async () => {
  if (!horaFinProduccion.value) {
    emit('toast', 'Debe ingresar la hora de fin', 'error');
    return;
  }
  submittingFinalizar.value = true;
  try {
    await finalizarProduccionTotal(props.produccion.IdProduccion, props.produccion.Sucursal.IdSucursal, horaFinProduccion.value);
    emit('toast', 'Producción finalizada totalmente', 'success');
    showFinalizarModal.value = false;
    emit('updated');
  } catch (error) {
    emit('toast', 'Error al finalizar producción', 'error');
  } finally {
    submittingFinalizar.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
