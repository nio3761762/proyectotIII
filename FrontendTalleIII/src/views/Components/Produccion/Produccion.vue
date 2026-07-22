<template>
  <div class="min-h-screen p-4 md:p-8 relative">
    <!-- Background decorations -->
    <div class="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl -z-10"></div>
    <div class="fixed bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl -z-10"></div>

    <!-- Header -->
    <div v-if="!activeProduction" class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8 animate-fade-in">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
            <Factory class="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              Gestión de Producción
            </h1>
            <p class="text-gray-500 font-medium">Panel de control de elaboración de productos</p>
          </div>
        </div>
        
          <div class="flex items-center gap-4">
          <div class="hidden lg:flex items-center space-x-6 mr-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-800">{{ totalItems }}</div>
              <div class="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Registros</div>
            </div>
            <div class="w-px h-10 bg-gray-200"></div>
          <div class="p-3 bg-orange-100 rounded-2xl text-orange-600">
              <TrendingUp class="h-6 w-6" />
            </div>
          </div>
          
          <div class="flex bg-gray-100 p-1 rounded-2xl">
            <button 
              @click="abrirModalBaja"
              class="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-white transition-all"
              title="Dar de Baja"
            >
              <Trash2 class="h-5 w-5" />
            </button>
            <button 
              @click="abrirModalVerDescarte"
              class="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-white transition-all"
              title="Ver Descarte"
            >
              <Eye class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Filters -->
      <FiltrosProduccion 
        v-if="!loadingSucursal && (!activeProduction || !showActivePanel)"
        v-model:viewMode="vistaModo"
        @filter="handleFilter" 
        @add="showRegistration = true" 
        :initialLimit="limit" 
        :disableAdd="!!activeProduction"
        :tieneSucursal="tieneSucursal"
        :initialSucursal="currentFilters.idsucursal"
      />

      <!-- Active Production View -->
      <ControlPanelProduccion 
        v-if="activeProduction && currentFilters.idsucursal !== '-1' && showActivePanel"
        :produccion="activeProduction"
        @updated="fetchProducciones"
        @toast="mostrarNotificacion"
        @close="handleClosePanel"
      />

      <template v-else>
        <!-- Banner if panel is hidden but production is active -->
        <div v-if="activeProduction && currentFilters.idsucursal !== '-1' && !showActivePanel" class="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200 rounded-3xl p-4 mb-6 flex items-center justify-between animate-fade-in">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Factory class="h-5 w-5 text-white" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800">Hay una producción activa en esta sucursal</p>
              <p class="text-xs text-gray-500 font-medium tracking-wide uppercase">Puedes volver al panel de control en cualquier momento</p>
            </div>
          </div>
          <button @click="showActivePanel = true" class="px-5 py-2.5 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
            Gestionar Ahora
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p class="text-gray-500 font-medium animate-pulse">Obteniendo registros...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="producciones.length === 0" class="bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Search class="h-10 w-10" />
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron registros</h3>
          <p class="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>

        <!-- Grid o Tabla -->
        <div v-else>
          <!-- Vista Card -->
          <div v-if="vistaModo === 'card'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ProduccionCard 
              v-for="p in producciones" 
              :key="p.IdProduccion" 
              :produccion="transformProduccion(p)" 
              @anular="prepareAnular"
              @gestionar="handleGestionar"
              @editar="handleEditar"
            />
          </div>

          <!-- Vista Tabla (Excel-like) -->
          <div v-else class="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-xl border border-white/50 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <th class="px-4 py-4 w-10"></th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha/Sucursal</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inversión</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total producido</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <template v-for="p in producciones.map(transformProduccion)" :key="p.idproduccion">
                    <!-- Fila Principal -->
                    <tr 
                      @click="toggleRow(p.idproduccion)"
                      class="bg-white hover:bg-orange-50/20 transition-colors cursor-pointer"
                    >
                      <td class="px-4 py-4 text-center">
                        <ChevronDown 
                          class="h-5 w-5 text-gray-400 transition-transform duration-300" 
                          :class="{'rotate-180 text-orange-500': expandedRows.has(p.idproduccion)}" 
                        />
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-xs font-black text-orange-600">#{{ p.idproduccion }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex flex-col">
                          <span class="text-sm font-bold text-gray-800">{{ p.sucursal?.Nombre }}</span>
                          <div class="flex items-center gap-2 mt-0.5">
                             <span class="text-[10px] text-gray-400 font-bold uppercase">{{ formatDate(p.fecha) }}</span>
                             <span class="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-md font-black">
                               {{ p.horaInicio || '--:--' }} - {{ p.horaFin || '...' }}
                             </span>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span :class="['px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white', 
                          p.estado === 1 ? 'bg-emerald-500' : p.estado === 2 ? 'bg-orange-500' : 'bg-red-500']">
                          {{ p.estado === 1 ? 'Completada' : p.estado === 2 ? 'En Proceso' : 'Anulada' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-2">
                          <div class="px-2 py-1 bg-orange-50 rounded-lg border border-orange-100 text-center min-w-[60px]">
                            <p class="text-[6px] font-black text-orange-500 uppercase leading-none mb-1">Total</p>
                            <p class="text-[10px] font-black text-gray-700 leading-none">{{ Number(p.costoTotal || 0).toFixed(2) }}</p>
                          </div>
                          <div class="px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 text-center min-w-[60px]">
                            <p class="text-[6px] font-black text-blue-500 uppercase leading-none mb-1">Insumos</p>
                            <p class="text-[10px] font-black text-gray-700 leading-none">{{ Number(p.costoInsumos || 0).toFixed(2) }}</p>
                          </div>
                          <div class="px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100 text-center min-w-[60px]">
                            <p class="text-[6px] font-black text-emerald-500 uppercase leading-none mb-1">M. Obra</p>
                            <p class="text-[10px] font-black text-gray-700 leading-none">{{ Number(p.costoManoObra || 0).toFixed(2) }}</p>
                          </div>
                          <div class="px-2 py-1 bg-purple-50 rounded-lg border border-purple-100 text-center min-w-[60px]">
                            <p class="text-[6px] font-black text-purple-500 uppercase leading-none mb-1">Indir.</p>
                            <p class="text-[10px] font-black text-gray-700 leading-none">{{ Number(p.costoIndirecto || 0).toFixed(2) }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <div class="inline-flex flex-col items-center justify-center px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
                         
                           <p class="text-lg font-black text-indigo-700 leading-none">{{ p.cantidad }} <small class="text-[10px]">UDS</small></p>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2" @click.stop>
                          <button v-if="p.estado === 1 || p.estado === 2" @click="handleEditar(p)" 
                            class="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Editar">
                            <Pencil class="h-4 w-4" />
                          </button>
                          <button v-if="p.estado === 2" @click="handleGestionar(p)" 
                            class="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors" title="Gestionar">
                            <Activity class="h-4 w-4" />
                          </button>
                          <button v-if="p.estado === 1" @click="prepareAnular(p)" 
                            class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Anular">
                            <Trash2 class="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <!-- Fila de Detalle (Abajo) -->
                    <tr v-if="expandedRows.has(p.idproduccion)" class="bg-gray-50/50">
                      <td colspan="6" class="px-6 py-6 border-b border-orange-100/50 shadow-inner">
                        <div class="space-y-8 animate-fade-in">
                          <!-- 1. Detalle por Empleado -->
                          <div>
                            <div class="flex items-center justify-between mb-4">
                              <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Users class="h-4 w-4 text-orange-500" />
                                Desglose Operativo por Personal
                              </p>
                              <div class="h-px flex-1 bg-gradient-to-r from-orange-100 to-transparent ml-4"></div>
                            </div>
                            
                            <div v-if="Object.keys(getSalidasPorEmpleado(p.salidas)).length" class="space-y-4">
                              <div v-for="(logs, empleado) in getSalidasPorEmpleado(p.salidas)" :key="empleado" 
                                class="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden border-l-4 border-l-orange-500">
                                <div class="bg-gray-50/30 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                  <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                       <User class="h-5 w-5" />
                                    </div>
                                    <span class="text-xs font-black text-gray-800 uppercase tracking-wider">
                                      {{ empleado }}
                                    </span>
                                  </div>
                                  <span class="text-[9px] font-black bg-orange-500 text-white px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                    {{ logs.length }} registros
                                  </span>
                                </div>
                                <div class="overflow-x-auto">
                                  <table class="w-full">
                                    <thead>
                                      <tr class="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/20 border-b border-gray-50">
                                        <th class="px-6 py-3">Hora Registro</th>
                                        <th class="px-6 py-3 text-center">Horno Utilizado</th>
                                        <th class="px-6 py-3">Producto Elaborado</th>
                                        <th class="px-6 py-3 text-right">Cantidad</th>
                                      </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-50">
                                      <tr v-for="s in logs" :key="s.IdHornoProducto" class="hover:bg-orange-50/5 transition-colors">
                                        <td class="px-6 py-3">
                                          <span class="text-[11px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                            {{ formatTime(s.Hora) }}
                                          </span>
                                        </td>
                                        <td class="px-6 py-3">
                                          <div class="flex items-center justify-center gap-2 text-xs font-bold text-gray-600">
                                            <Flame class="h-3.5 w-3.5 text-orange-400" />
                                            {{ s.Horno }}
                                          </div>
                                        </td>
                                        <td class="px-6 py-3">
                                          <p class="text-xs font-black text-gray-800">{{ s.Producto }}</p>
                                        </td>
                                        <td class="px-6 py-3 text-right">
                                          <span class="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-xl border border-orange-100">
                                            {{ s.Cantidad }} <small class="text-[8px] ml-0.5 uppercase">unidades</small>
                                          </span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                            <div v-else class="text-center py-10 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                               <p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">No se encontraron registros de salida detallados</p>
                            </div>
                          </div>

                          <!-- 2. Resumen de Productos -->
                          <div v-if="p.detalles?.length" class="pt-8 border-t border-gray-100">
                            <div class="flex items-center justify-between mb-6">
                               <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Package class="h-4 w-4 text-blue-500" />
                                Resumen Final de Producción Acumulada
                              </p>
                              <div class="h-px flex-1 bg-gradient-to-r from-blue-100 to-transparent ml-4"></div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div v-for="d in p.detalles" :key="d.id" class="flex items-center gap-3 bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                   <Package class="h-5 w-5" />
                                </div>
                                <div class="flex flex-col">
                                  <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">{{ d.producto?.Nombre }}</span>
                                  <div class="flex items-center gap-2">
                                    <span class="text-sm font-black text-gray-800 leading-tight">{{ d.cantidad }} <small class="text-[8px] text-blue-500 uppercase tracking-tighter">uds</small></span>
                                    <span v-if="Number(d.cantidadMala) > 0" class="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase flex items-center gap-1" :title="d.motivo">
                                      <Trash2 class="h-2.5 w-2.5" />
                                      {{ d.cantidadMala }}
                                    </span>
                                  </div>
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

        <!-- Pagination -->
        <Paginado 
          v-if="totalPaginas > 0"
          v-model:paginaActual="currentPage"
          :totalPaginas="totalPaginas"
          :total="totalItems"
          :limite="limit"
        />
      </template>
    </div>

    <!-- Shared Modals -->
    <Transition name="page">
      <RegistrarProduccion 
        v-if="showRegistration"
        :tieneSucursal="tieneSucursal"
        :sucursalId="currentFilters.idsucursal"
        @saved="handleSaved" 
        @cancel="showRegistration = false" 
      />
    </Transition>

    <AnularVentaModal 
      :isOpen="showAnularModal"
      :idVenta="selectedProduccionId"
      :loading="anularLoading"
      title="¿Anular Registro de Producción?"
      message="Esta acción revertirá los cambios en el inventario y marcará la producción como anulada. Esta acción no se puede deshacer."
      confirmText="Sí, Anular Producción"
      @close="showAnularModal = false"
      @confirm="confirmAnular"
    />

    <!-- Edit Modal -->
    <EditarProduccion 
      v-if="showEditModal"
      :produccion="editProduccionData"
      @saved="handleEditSaved"
      @cancel="showEditModal = false"
    />

    <!-- Modal: Dar de Baja Productos -->
    <div v-if="showBajaModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4" @click.self="showBajaModal = false">
      <div class="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">
        <div class="p-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gray-700 rounded-2xl">
              <Trash2 class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-black text-gray-800">Dar de Baja Productos</h3>
              <p class="text-sm text-gray-500 font-medium">Selecciona productos para dar de baja del inventario</p>
            </div>
          </div>
          <button @click="showBajaModal = false" class="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <X class="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="mb-4">
            <label class="text-sm font-bold text-gray-700 mb-1 block">Sucursal</label>
            <select v-model="bajaSucursalId" @change="cargarProductosBaja"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-gray-700 font-medium">
              <option value="" disabled>Seleccionar sucursal</option>
              <option v-for="s in sucursalesBaja" :key="s.idsucursal" :value="s.idsucursal">{{ s.nombre }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="text-sm font-bold text-gray-700 mb-1 block">Fecha de Baja</label>
            <input type="date" v-model="bajaFecha"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-gray-700 font-medium" />
          </div>

          <div v-if="!bajaSucursalId" class="text-center py-10 text-gray-500 font-medium">
            Selecciona una sucursal para ver sus productos.
          </div>
          <div v-else-if="loadingBajaProductos" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-700"></div>
          </div>
          <div v-else-if="productosBaja.length === 0" class="text-center py-10 text-gray-500 font-medium">
            No hay productos con stock disponible en esta sucursal.
          </div>

          <table v-else class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 rounded-2xl">
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cantidad a dar de baja</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Motivo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in productosBaja" :key="item.id" class="hover:bg-gray-50/30">
                <td class="p-3 text-sm font-bold text-gray-700">{{ item.nombre }}</td>
                <td class="p-3 text-center text-sm font-black text-gray-800">{{ item.stock }}</td>
                <td class="p-3 text-center">
                  <input v-model.number="item.cantidad" type="number" :min="0" :max="item.stock" class="w-24 px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-center font-black text-sm outline-none focus:ring-2 focus:ring-gray-700" />
                </td>
                <td class="p-3">
                  <input v-model="item.motivo" type="text" class="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gray-700" placeholder="Ej: No se vendió" :disabled="!item.cantidad" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-6 pt-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <span class="text-sm font-bold text-gray-500">
            {{ itemsBajaCount }} producto(s) seleccionados
          </span>
          <div class="flex gap-3">
            <button @click="showBajaModal = false" class="px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button @click="confirmarBaja" :disabled="itemsBajaCount === 0 || enviandoBaja" class="px-8 py-3 bg-gray-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center gap-2">
              <Loader2 v-if="enviandoBaja" class="h-4 w-4 animate-spin" />
              {{ enviandoBaja ? 'ENVIANDO...' : 'DAR DE BAJA' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Ver Descarte -->
    <div v-if="showDescarteModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4" @click.self="showDescarteModal = false">
      <div class="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">
        <div class="p-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-blue-600 rounded-2xl">
              <Eye class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-black text-gray-800">Historial de Descarte</h3>
              <p class="text-sm text-gray-500 font-medium">Productos dados de baja del inventario</p>
            </div>
          </div>
          <button @click="showDescarteModal = false" class="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <X class="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div class="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4 items-end shrink-0">
          <div class="flex-1">
            <label class="text-xs font-bold text-gray-600 mb-1 block">Sucursal</label>
            <select v-model="descarteFiltroSucursal" @change="cargarDescartes"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium">
              <option value="TODOS">Todas las sucursales</option>
              <option v-for="s in sucursalesBaja" :key="s.idsucursal" :value="s.idsucursal">{{ s.nombre }}</option>
            </select>
          </div>
          <div class="w-full md:w-48">
            <label class="text-xs font-bold text-gray-600 mb-1 block">Fecha</label>
            <input type="date" v-model="descarteFiltroFecha" @change="cargarDescartes"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="loadingDescartes" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="descartesList.length === 0" class="text-center py-16 text-gray-500 font-medium">
            <Eye class="h-12 w-12 mx-auto mb-4 opacity-30" />
            No se encontraron registros de descarte.
          </div>
          <table v-else class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 rounded-2xl">
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sucursal</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cantidad</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Motivo</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                <th class="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="baja in descartesList" :key="baja.IdBaja" class="hover:bg-blue-50/20 transition-colors">
                <td class="p-3 text-xs font-black text-blue-600">{{ baja.IdBaja }}</td>
                <td class="p-3 text-sm font-bold text-gray-700">{{ baja.Producto?.Nombre }}</td>
                <td class="p-3 text-sm text-gray-600">{{ baja.Sucursal?.Nombre }}</td>
                <td class="p-3 text-center text-sm font-black text-red-600">{{ baja.Cantidad }}</td>
                <td class="p-3 text-sm text-gray-600 max-w-[200px] truncate">{{ baja.Motivo }}</td>
                <td class="p-3 text-sm text-gray-600">{{ baja.Fecha }}</td>
                <td class="p-3 text-sm text-gray-600">{{ baja.Hora }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-6 pt-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <span class="text-sm font-bold text-gray-500">{{ descartesList.length }} registro(s)</span>
          <Paginado
            v-if="descarteTotalPaginas > 0"
            :paginaActual="descartePaginaActual"
            :totalPaginas="descarteTotalPaginas"
            :total="descarteTotalItems"
            :limite="descarteLimite"
            @update:paginaActual="onCambiarPaginaDescarte"
          />
        </div>
      </div>
    </div>

    <!-- Notificacion (Similar a Insumo.vue) -->
    <Transition name="slide-up">
      <div v-if="notificacion.visible"
        class="fixed bottom-6 right-6 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 font-bold"
        :class="notificacion.error ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-orange-500 to-red-600'">
        <CheckCircle class="h-5 w-5" />
        {{ notificacion.mensaje }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { Factory, Search, TrendingUp, CheckCircle, AlertCircle, AlertTriangle, LayoutGrid, List as ListIcon, Pencil, Trash2, Flame, User, Users, Package, ChevronDown, Activity, Loader2, X, Calendar, Eye } from 'lucide-vue-next';

import { getProducciones, anularProduccion } from '@/Server/Produccion';
import { SucursalUsuario } from '@/Server/Usuario';
import { registrarBajaInventario, listarBajas } from '@/Server/Inventario';
import { ListarProductosOnSucursal } from '@/Server/Producto';
import { Listsucursal } from '@/Server/Sucural';
import FiltrosProduccion from './FiltrosProduccion.vue';
import ProduccionCard from './ProduccionCard.vue';
import RegistrarProduccion from './RegistrarProduccion.vue';
import ControlPanelProduccion from './ControlPanelProduccion.vue';
import EditarProduccion from './EditarProduccion.vue';
import Paginado from '../Modals/Paginado.vue';
import AnularVentaModal from '../Venta/AnularVentaModal.vue';

// State
const showRegistration = ref(false);  
const loading = ref(false);
const producciones = ref([]);
const activeProduction = ref(null);
const showActivePanel = ref(true);
const vistaModo = ref('card'); // 'card' o 'table'
const totalItems = ref(0);
const totalPaginas = ref(0);
const currentPage = ref(1);
const limit = ref(8);
const tieneSucursal = ref(false);
const loadingSucursal = ref(true);

// Expandable Rows State
const expandedRows = ref(new Set());
const toggleRow = (id) => {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id);
  } else {
    expandedRows.value.add(id);
  }
};

// Filters State
const currentFilters = ref({
  search: '',
  idsucursal: '-1',
  fecha: '',
});

// Modal State
const showAnularModal = ref(false);
const selectedProduccionId = ref(null);
const anularLoading = ref(false);
const showEditModal = ref(false);
const editProduccionData = ref(null);

// Baja de productos
const showBajaModal = ref(false);
const enviandoBaja = ref(false);
const bajaSucursalId = ref('');
const bajaFecha = ref(new Date().toLocaleDateString('en-CA'));
const productosBaja = ref([]);
const loadingBajaProductos = ref(false);
const sucursalesBaja = ref([]);
const itemsBajaCount = computed(() => {
  return productosBaja.value.filter(i => i.cantidad > 0).length;
});

const obtenerStockProducto = (p) => {
  if (p.cantidad !== undefined && p.cantidad !== null) return Number(p.cantidad);
  if (p.Cantidad !== undefined && p.Cantidad !== null) return Number(p.Cantidad);
  if (p.Productosucursal?.[0]?.Cantidad) return Number(p.Productosucursal[0].Cantidad);
  return 0;
};

const cargarProductosBaja = async () => {
  if (!bajaSucursalId.value) return;
  loadingBajaProductos.value = true;
  try {
    const res = await ListarProductosOnSucursal(bajaSucursalId.value, '', 9999, 1);
    const lista = res.result || [];
    productosBaja.value = lista
      .filter(p => obtenerStockProducto(p) > 0)
      .map(p => {
        const medida = (p.medidas && p.medidas[0]) ? p.medidas[0] : null;
        return {
          id: p.idproducto || p.IdProducto,
          nombre: p.nombre || p.Nombre,
          stock: obtenerStockProducto(p),
          cantidad: 0,
          motivo: '',
          presentacion: medida,
          idProductoMedida: medida?.idproductomedida || null
        };
      });
  } catch (e) {
    console.error('Error cargarProductosBaja:', e);
    const msg = e.code === 'ECONNABORTED' ? 'La consulta tardó demasiado. Intente de nuevo.' : 'Error al cargar productos';
    mostrarNotificacion(msg, true);
  } finally {
    loadingBajaProductos.value = false;
  }
};

const abrirModalBaja = () => {
  bajaSucursalId.value = '';
  bajaFecha.value = new Date().toLocaleDateString('en-CA');
  productosBaja.value = [];
  showBajaModal.value = true;
};

const confirmarBaja = async () => {
  const items = productosBaja.value
    .filter(i => i.cantidad > 0 && i.idProductoMedida)
    .map(i => ({
      IdProductoMedida: i.idProductoMedida,
      Cantidad: i.cantidad,
      Motivo: i.motivo || 'Sin venta'
    }));

  if (items.length === 0) {
    mostrarNotificacion('Seleccione al menos un producto con cantidad mayor a 0', true);
    return;
  }

  enviandoBaja.value = true;
  try {
    await registrarBajaInventario(bajaSucursalId.value, items, bajaFecha.value);
    mostrarNotificacion(`${items.length} producto(s) dado(s) de baja correctamente`);
    showBajaModal.value = false;
  } catch (err) {
    mostrarNotificacion(err.response?.data?.message || err.message || 'Error al dar de baja', true);
  } finally {
    enviandoBaja.value = false;
  }
};

// Ver Descarte
const showDescarteModal = ref(false);
const descarteFiltroSucursal = ref('TODOS');
const descarteFiltroFecha = ref('');
const descartesList = ref([]);
const loadingDescartes = ref(false);
const descartePaginaActual = ref(1);
const descarteTotalPaginas = ref(0);
const descarteTotalItems = ref(0);
const descarteLimite = ref(20);

const abrirModalVerDescarte = () => {
  descarteFiltroSucursal.value = currentFilters.value.idsucursal !== '-1' ? currentFilters.value.idsucursal : 'TODOS';
  descarteFiltroFecha.value = new Date().toLocaleDateString('en-CA');
  descartePaginaActual.value = 1;
  showDescarteModal.value = true;
  cargarDescartes();
};

const cargarDescartes = async () => {
  loadingDescartes.value = true;
  try {
    const res = await listarBajas(
      descarteFiltroSucursal.value,
      descarteFiltroFecha.value || undefined,
      descartePaginaActual.value,
      descarteLimite.value
    );
    descartesList.value = res.data || [];
    descarteTotalItems.value = parseInt(res.total) || 0;
    descarteTotalPaginas.value = Math.ceil(descarteTotalItems.value / descarteLimite.value);
  } catch (e) {
    console.error('Error cargarDescartes:', e);
    mostrarNotificacion('Error al cargar descartes', true);
  } finally {
    loadingDescartes.value = false;
  }
};

const onCambiarPaginaDescarte = (page) => {
  descartePaginaActual.value = page;
  cargarDescartes();
};

// Notificacion State (Similar to Insumo.vue)
const notificacion = reactive({ visible: false, mensaje: '', error: false });

const mostrarNotificacion = (mensaje, error = false) => {
  notificacion.mensaje = mensaje;
  notificacion.error   = (error === true || error === 'error');
  notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};

const obtenerSucursalUsuario = async (id) => {
  try {
    const response = await SucursalUsuario(id);
    
    if (response && response.idsucursal) {
      currentFilters.value.idsucursal = response.idsucursal;
      tieneSucursal.value = true;
    } 
  } catch (e) { 
    mostrarNotificacion('Error al obtener sucursal del usuario', true);
  }
};

const fetchProducciones = async () => {
  loading.value = true;
  try {
    const sucursalId = currentFilters.value.idsucursal === '-1' ? null : currentFilters.value.idsucursal;
    const response = await getProducciones(sucursalId, currentFilters.value.fecha, currentFilters.value.search, currentPage.value, limit.value);
    const data = response.data || [];
    if (sucursalId) {
      activeProduction.value = data.find(p => !p.HoraFin) || null;
      producciones.value = activeProduction.value ? data.filter(p => p.HoraFin) : data;
    } else {
      activeProduction.value = null;
      producciones.value = data;
    }

    totalItems.value = Number(response.total || data.length);
    totalPaginas.value = Number(response.totalPages || 0);
    loading.value = false;
  } catch (error) {
    mostrarNotificacion('Error al cargar producciones', true);
    loading.value = false;
  }
};

// Formatting Helpers
const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  const match = timeStr.match(/(\d{2}:\d{2})/);
  return match ? match[1] : timeStr;
};

const getSalidasPorEmpleado = (salidas) => {
  if (!salidas) return {};
  const grouped = {};
  salidas.forEach(s => {
    const empName = s.Empleado || 'Sin asignar';
    if (!grouped[empName]) {
      grouped[empName] = [];
    }
    grouped[empName].push(s);
  });
  return grouped;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date; // Return raw if invalid
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) { return date; }
};

// Transform backend data to card format
const transformProduccion = (p) => {
  return {
    idproduccion: p.IdProduccion,
    sucursal: p.Sucursal,
    cantidad: p.Detalle?.reduce((acc, det) => acc + Number(det.Cantidad), 0) || 0,
    fecha: p.FechaProduccion,
    horaInicio: p.HoraInicio,
    horaFin: p.HoraFin,
    costoTotal: p.CostoTotal,
    costoInsumos: p.CostoInsumos,
    costoManoObra: p.CostoManoObra,
    costoIndirecto: p.CostoIndirecto,
    empleados: p.Empleados?.map(pe => ({
      id: pe.Empleado?.IdEmpleado,
      nombre: pe.Empleado?.Nombre,
      imagen: pe.Empleado?.Imagen,
      cargo: pe.Empleado?.Cargo
    })) || [],
    responsable: p.Empleados?.[0]?.Empleado?.Nombre || 'Sistema',
    estado: p.HoraFin ? 1 : 2, // 1: Completada, 2: En Proceso
    detalles: p.Detalle?.map(d => ({
      id: d.IdDetalleProduccion,
      producto: d.Producto,
      cantidad: d.Cantidad,
      cantidadMala: d.CantidadMala,
      motivo: d.Motivo,
      costoUnitario: d.CostoUnitario,
      costoTotal: d.CostoTotal
    })),
    salidas: p.SalidasDetalladas || [], // Nueva lista detallada
    observaciones: p.Observacion
  };
};

const handleFilter = (filtersData) => {
  const { limit: newLimit, ...otherFilters } = filtersData;
  limit.value = newLimit;
  
  currentFilters.value = { ...otherFilters };

  currentPage.value = 1;
  fetchProducciones();
};

const prepareAnular = (p) => {
  selectedProduccionId.value = p.idproduccion;
  showAnularModal.value = true;
};

const confirmAnular = async (id) => {
  anularLoading.value = true;
  try {
    await anularProduccion(id);
    mostrarNotificacion('Producción anulada con éxito');
    showAnularModal.value = false;
    fetchProducciones();
  } catch (error) {
    mostrarNotificacion('Error al anular producción', true);
  } finally {
    anularLoading.value = false;
  }
};

const handleSaved = async (sucursalId) => {
  showRegistration.value = false;
  if (sucursalId && sucursalId !== '-1') {
    currentFilters.value.idsucursal = sucursalId;
  }
  currentPage.value = 1;
  showActivePanel.value = true;
  await fetchProducciones();
  mostrarNotificacion('Producción iniciada con éxito');
};

const handleGestionar = async (p) => {
  if (p.sucursal?.IdSucursal) {
    currentFilters.value.idsucursal = p.sucursal.IdSucursal;
    showActivePanel.value = true;
    await fetchProducciones();
  }
};

const handleClosePanel = () => {
  showActivePanel.value = false;
};

const handleEditar = (p) => {
  editProduccionData.value = p;
  showEditModal.value = true;
};

const handleEditSaved = () => {
  showEditModal.value = false;
  editProduccionData.value = null;
  fetchProducciones();
  mostrarNotificacion('Producción actualizada con éxito');
};

// Watchers
watch(() => currentFilters.value.idsucursal, () => {
  showActivePanel.value = true;
});

watch(currentPage, () => {
  fetchProducciones();
});

// Initial load
onMounted(async () => {
  const usuarioStr = localStorage.getItem('usuario');
  if (usuarioStr) {
    const u = JSON.parse(usuarioStr);
    await obtenerSucursalUsuario(u.IdUsuario);
  }
  
  loadingSucursal.value = false;
  fetchProducciones();
  
  try {
    const sRes = await Listsucursal();
    sucursalesBaja.value = sRes.result || sRes || [];
  } catch (e) { console.error('Error cargando sucursales:', e); }
});
</script>

<style scoped>
.page-enter-active,
.page-leave-active { 
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-up-enter-active, .slide-up-leave-active { 
  transition: all 0.3s ease; 
}
.slide-up-enter-from, .slide-up-leave-to { 
  opacity: 0; 
  transform: translateY(16px); 
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
