<template>
  <div class="min-h-screen p-4 md:p-6 lg:p-8">
    <!-- Background decorations -->
    <div class="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Loading State Initial -->
    <Transition name="fade" mode="out-in">
      <div v-if="initializing" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative mb-6">
            <div class="w-20 h-20 mx-auto relative">
              <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg animate-bounce-slow">
                  <ShoppingCart class="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
            Cargando Punto de Venta...
          </h3>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- History / Catalog View -->
        <div v-if="!modoRegistro && !modoPersona">
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <ShoppingCart class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                    Gestión de Ventas
                  </h1>
                  <p class="text-gray-600 text-sm">Administra las ventas y transacciones</p>
                </div>
              </div>

              <!-- Tabs Navigation -->
              <div class="flex bg-gray-100 p-1 rounded-2xl">
                <button 
                  @click="tabActiva = 'catalogo'"
                  :class="['px-6 py-2 rounded-xl font-semibold transition-all', tabActiva === 'catalogo' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                  Catálogo
                </button>
                <button 
                  @click="tabActiva = 'historial'"
                  :class="['px-6 py-2 rounded-xl font-semibold transition-all', tabActiva === 'historial' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                  Historial
                </button>
                <button 
                  @click="tabActiva = 'clientes'"
                  :class="['px-6 py-2 rounded-xl font-semibold transition-all', tabActiva === 'clientes' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                  Clientes
                </button>
              </div>
              
              <button 
                @click="iniciarNuevaVenta" 
                class="bg-linear-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
              >
                <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span class="font-semibold hidden sm:inline">Nueva Venta</span>
              </button>
            </div>
          </div>

          <!-- Catalog View -->
          <div v-if="tabActiva === 'catalogo'" class="space-y-6 animate-fade-in">
            <div class="space-y-6">
              <!-- Filtros de Catálogo -->
              <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                <div class="flex flex-col gap-6">
                  <!-- Nav Tabs Internas -->
                  <div class="flex border-b border-gray-200">
                    <button @click="catalogTab = 'productos'" 
                      :class="['px-6 py-3 font-bold text-sm transition-all border-b-2', catalogTab === 'productos' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
                      Productos
                    </button>
                    <button @click="catalogTab = 'promociones'" 
                      :class="['px-6 py-3 font-bold text-sm transition-all border-b-2', catalogTab === 'promociones' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
                      Promociones
                    </button>
                  </div>

                  <!-- Filtros Productos -->
                  <div v-if="catalogTab === 'productos'">
                    <FiltrosProducto
                      v-model:search="busquedaCatalogo"
                      v-model:sucursal="filtrosCatalogo.sucursal"
                      v-model:categoria="filtrosCatalogo.categoria"
                      v-model:subcategoria="filtrosCatalogo.subcategoria"
                      v-model:limite="limiteProductos"
                      :sucursales="sucursales"
                      :categorias="categoriasCatalogo"
                      :isAdmin="isAdmin"
                      :disableSucursal="false"
                      @update:limite="onLimiteProductosChange"
                    />
                  </div>

                  <!-- Filtros Promociones -->
                  <div v-else>
                    <FiltrosPromocion
                      v-model:search="filtrosPromo.search"
                      v-model:tipopromocion="filtrosPromo.tipopromocion"
                      v-model:idproducto="filtrosPromo.idproducto"
                      v-model:limite="filtrosPromo.limite"
                      :productos="productosSimples"
                      :tiposPromocion="tiposPromocion"
                      :hideEstado="true"
                      @update:search="onSearchPromoChange"
                      @update:tipopromocion="onFiltroPromoChange"
                      @update:idproducto="onFiltroPromoChange"
                      @update:limite="onLimitePromoChange"
                    />
                  </div>
                </div>
              </div>

              <!-- Listado with local loader -->
              <div v-if="loadingCatalog" class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
              <div v-else>
                <!-- Productos Grid -->
                <div v-if="catalogTab === 'productos'">
                  <!-- Selling Warning -->
                  <div v-if="!puedeVenderEnEstaSucursal" class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3 text-orange-800 animate-fade-in">
                    <AlertTriangle class="h-5 w-5 shrink-0" />
                    <p class="text-sm font-medium">
                      {{ isAdmin && !tieneSucursal ? 'Selecciona una sucursal para poder vender.' : 'Solo puedes vender productos de tu sucursal asignada.' }}
                    </p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <Productocard 
                      v-for="prod in productosList" 
                      :key="prod.idproducto || prod.IdProducto"
                      :producto="prod"
                      :medidas="prod.medidas || []"
                      :disabled="!puedeVenderEnEstaSucursal"
                      @select-medida="iniciarVentaConProducto"
                    />
                  </div>
                  <div v-if="productosList.length === 0" class="text-center py-10 text-gray-500">
                    No se encontraron productos en esta sucursal.
                  </div>
                  
                  <div class="pt-6 border-t border-gray-100 mt-8">
                    <Paginado
                      v-if="paginacionProductos.totalPaginas >= 1"
                      :paginaActual="paginacionProductos.paginaActual"
                      :totalPaginas="paginacionProductos.totalPaginas"
                      :total="paginacionProductos.total"
                      :limite="limiteProductos"
                      @update:paginaActual="onCambiarPaginaProductos"
                    />
                  </div>
                </div>

                <!-- Promociones Grid -->
                <div v-else>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <PromocionCard 
                      v-for="promo in promocionesList" 
                      :key="promo.idpromocion || promo.IdPromocion"
                      :promo="promo"
                      :hideActions="true"
                      @click="iniciarVentaConPromo(promo)"
                    />
                  </div>
                  <div v-if="promocionesList.length === 0" class="text-center py-10 text-gray-500">
                    No se encontraron promociones activas.
                  </div>
                  
                  <div class="pt-6 border-t border-gray-100 mt-8">
                    <Paginado
                      v-if="paginacionPromo.totalPaginas >= 1"
                      :paginaActual="paginacionPromo.paginaActual"
                      :totalPaginas="paginacionPromo.totalPaginas"
                      :total="paginacionPromo.total"
                      :limite="filtrosPromo.limite"
                      @update:paginaActual="onCambiarPaginaPromo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- History View -->
          <div v-else-if="tabActiva === 'historial'" class="animate-slide-in space-y-6">
            <Filtrarventa 
              v-model="filtros"
              v-model:viewMode="vistaTipo"
              :sucursales="sucursales"
              :productos="productosSimples"
              :promociones="promocionesList"
              :metodosPago="metodosPago"
              :tieneSucursalAsignada="tieneSucursal"
              :isAdmin="isAdmin"
              :disableSucursal="tieneSucursal"
              :limit="limit"
              @update:limit="onLimitChange"
            />

            <!-- Sales List with local loader -->
            <div v-if="loadingHistory" class="flex justify-center py-20">
               <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <div v-else>
              <div v-if="ventas.length === 0" class="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                <div class="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart class="h-12 w-12 text-orange-500 opacity-50" />
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron ventas</h3>
                <p class="text-gray-500 mb-6">Intenta cambiar los filtros o registra una nueva venta.</p>
                <button @click="modoRegistro = true" class="text-orange-600 font-semibold hover:underline">
                  Registrar Primera Venta
                </button>
              </div>

              <!-- Vista de Tarjetas -->
              <div v-else-if="vistaTipo === 'cards'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <VentaCard 
                    v-for="venta in ventas" 
                    :key="venta.idventa"
                    :venta="venta"
                    :isExpanded="expandedVentaId === venta.idventa"
                    :pagosVenta="pagosPorVenta[venta.idventa]"
                    @toggle-expand="toggleVenta(venta.idventa)"
                    @open-comprobante="openComprobante"
                    @anular="prepararAnulacion"
                    @editar="abrirEditarVenta"
                  />
                </div>

                <Paginado
                  v-if="paginacionVentas.totalPaginas >= 1"
                  :paginaActual="paginacionVentas.paginaActual"
                  :totalPaginas="paginacionVentas.totalPaginas"
                  :total="paginacionVentas.total"
                  :limite="limit"
                  @update:paginaActual="onCambiarPaginaVentas"
                />
              </div>

              <!-- Vista de Tabla Detallada -->
              <div v-else class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="bg-linear-to-r from-orange-50 to-red-50 text-gray-600 text-sm uppercase tracking-wider">
                        <th class="px-6 py-4 font-black">ID / Fecha</th>
                        <th class="px-6 py-4 font-black">Cliente</th>
                        <th class="px-6 py-4 font-black">Productos / Detalle</th>
                        <th class="px-6 py-4 font-black">Total</th>
                        <th class="px-6 py-4 font-black">Método Pago</th>
                        <th class="px-6 py-4 font-black">Estado</th>
                        <th class="px-6 py-4 font-black text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="venta in ventas" :key="venta.idventa" 
                          :class="['hover:bg-orange-50/30 transition-colors group', venta.estado === 0 ? 'opacity-60 grayscale' : '']">
                        <td class="px-6 py-4">
                          <div class="flex flex-col">
                            <span class="font-black text-gray-800">#{{ venta.idventa }}</span>
                            <span class="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar class="h-3 w-3" /> {{ venta.fechaventa }}
                              <Clock class="h-3 w-3 ml-1" /> {{ venta.horaventa }}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                              {{ venta.Persona?.Nombre?.charAt(0) || 'C' }}
                            </div>
                            <div class="flex flex-col">
                              <span class="font-bold text-gray-800">{{ venta.Persona?.Nombre || 'Consumidor Final' }}</span>
                              <span class="text-xs text-gray-500">{{ venta.Persona?.ApellidoPaterno || '' }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex flex-col gap-2 max-w-[300px]">
                            <div v-for="item in (venta.Detalle || venta.Detalleventa)" :key="item.IdDetalleVenta" 
                                 class="flex flex-col bg-gray-50/80 p-2 rounded-xl border border-gray-200/50 shadow-xs">
                              <div class="flex justify-between items-start gap-2">
                                <span class="font-black text-gray-800 text-[11px] truncate flex-1">
                                  {{ item.Productomedida?.Producto?.Nombre || item.Promocion?.Nombre || 'Ítem' }}
                                </span>
                                <span class="px-2 py-0.5 bg-orange-500 text-white rounded-lg font-black text-[10px] shadow-sm">
                                  x{{ item.Cantidad }}
                                </span>
                              </div>
                              <div class="flex justify-between items-center mt-1 text-[10px]">
                                <span class="text-gray-500 font-medium">
                                  {{ item.Productomedida?.Presentacion?.Nombre || (item.Promocion ? 'Promoción / Combo' : 'S/D') }}
                                </span>
                                <span class="font-bold text-orange-600 bg-white px-1.5 rounded-md border border-orange-100">
                                  Bs. {{ parseFloat(item.Precio).toFixed(2) }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="text-lg font-black text-green-600">Bs. {{ parseFloat(venta.preciototal).toFixed(2) }}</span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex flex-wrap gap-1">
                            <span v-for="p in venta.Pago" :key="p.IdPago" 
                                  class="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase">
                              {{ p.Metodopago?.Nombre }}
                            </span>
                            <span v-if="!venta.Pago || venta.Pago.length === 0" class="text-xs text-gray-400 italic">No registrado</span>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase', 
                            venta.estado === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                            {{ venta.estado === 1 ? 'Activa' : 'Anulada' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              @click="openComprobante(venta)"
                              class="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                              title="Ver / Facturar"
                            >
                              <Eye class="h-4 w-4" />
                            </button>
                            <button 
                              @click="openComprobante(venta)"
                              class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                              title="Imprimir"
                            >
                              <Printer class="h-4 w-4" />
                            </button>
                            <button 
                              v-if="venta.estado !== 0"
                              @click="abrirEditarVenta(venta)"
                              class="p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                              title="Editar"
                            >
                              <Pencil class="h-4 w-4" />
                            </button>
                            <button 
                              v-if="venta.estado !== 0"
                              @click="prepararAnulacion(venta.idventa)"
                              class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              title="Anular"
                            >
                              <X class="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="p-6 border-t border-gray-100">
                  <Paginado
                    v-if="paginacionVentas.totalPaginas >= 1"
                    :paginaActual="paginacionVentas.paginaActual"
                    :totalPaginas="paginacionVentas.totalPaginas"
                    :total="paginacionVentas.total"
                    :limite="limit"
                    @update:paginaActual="onCambiarPaginaVentas"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Clientes View -->
          <div v-else-if="tabActiva === 'clientes'" class="animate-fade-in space-y-6">
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
              <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div class="flex-1 w-full relative group">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-orange-500 transition-colors pointer-events-none" />
                  <input
                    :value="filtrosPersonas.search"
                    @input="onSearchPersonasChange($event.target.value)"
                    placeholder="Buscar por nombre o apellidos..."
                    class="w-full pl-10 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-gray-700 placeholder:text-gray-400 outline-none"
                  />
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex bg-gray-100 p-1 rounded-2xl">
                    <button 
                      v-for="lim in [5, 8, 12, 20]" 
                      :key="lim"
                      @click="onLimitePersonasChange(lim)"
                      :class="['px-4 py-1.5 rounded-xl text-sm font-semibold transition-all', filtrosPersonas.limite === lim ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                    >
                      {{ lim }}
                    </button>
                  </div>
                  <button 
                    @click="abrirFormularioPersonaNuevo"
                    class="bg-linear-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
                  >
                    <UserPlus class="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span class="font-semibold">Nuevo Cliente</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="loadingPersonas" class="flex justify-center py-20">
               <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <div v-else>
              <div v-if="personasList.length === 0" class="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                <div class="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users class="h-12 w-12 text-orange-500 opacity-50" />
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron clientes</h3>
                <p class="text-gray-500">Intenta cambiar los filtros o registra un nuevo cliente.</p>
              </div>

              <div v-else class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <ClienteCard 
                    v-for="persona in personasList" 
                    :key="persona.idpersona"
                    :persona="persona"
                    @editar="abrirFormularioPersonaEditar"
                  />
                </div>

                <Paginado
                  v-if="paginacionPersonas.totalPaginas >= 1"
                  :paginaActual="paginacionPersonas.paginaActual"
                  :totalPaginas="paginacionPersonas.totalPaginas"
                  :total="paginacionPersonas.total"
                  :limite="filtrosPersonas.limite"
                  @update:paginaActual="onCambiarPaginaPersonas"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sale Registration View -->
        <div v-else-if="modoRegistro && !modoPersona">
          <registrarventa 
            :sucursalId="sellingSucursalId"
            :initialItems="itemsPreseleccionados"
            :pendingPersona="pendingPersona"
            :ventaParaEditar="ventaParaEditar"
            :ventasRecientes="ventasSesion"
            @cancel="cancelarRegistro"
            @success="onVentaSuccess"
            @open-new-client="openNewClientModal"
            @anular="prepararAnulacion"
            @editar="abrirEditarVenta"
            @open-comprobante="openComprobante"
          />
        </div>

        <!-- Persona Registration View -->
        <div v-else-if="modoPersona">
          <PersonaRegistrar 
             :persona="personaSeleccionada"
             :guardando="guardandoPersona"
             :complementos="complementos"
             :barrios="barrios"
             @guardar="onGuardarPersona"
             @cancelar="cerrarFormularioPersona"
          />
        </div>
      </div>
    </Transition>

    <!-- Modals -->
    <!-- Comprobante Modal -->
    <Comprobante 
      v-if="showComprobante" 
      :venta="selectedVenta" 
      @close="showComprobante = false" 
    />

    <!-- Anular Venta Modal -->
    <AnularVentaModal
      :isOpen="showAnularModal"
      :idVenta="idVentaParaAnular"
      :loading="loadingAnulacion"
      @close="showAnularModal = false"
      @confirm="confirmarAnulacion"
    />

    <!-- Factura Data Modal -->
    <div v-if="showModalFactura" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div class="bg-linear-to-r from-orange-500 to-red-600 p-6 text-white">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg">
              <Receipt class="h-6 w-6" />
            </div>
            <div>
              <h2 class="text-xl font-bold">Datos de Facturación</h2>
              <p class="text-orange-100 text-sm">Venta #{{ selectedVentaParaFactura?.idventa || selectedVentaParaFactura?.IdVenta }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User class="h-4 w-4 text-orange-500" />
              Nombre / Razón Social
            </label>
            <input 
              v-model="datosFacturacion.nombre"
              type="text"
              placeholder="Ej. Juan Perez (Consumidor Final si vacío)"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Hash class="h-4 w-4 text-orange-500" />
              NIT / CI
            </label>
            <input 
              v-model="datosFacturacion.documento"
              type="text"
              placeholder="Ej. 12345678 (0000000000 si vacío)"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
            />
          </div>

          <div class="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3">
            <AlertCircle class="h-5 w-5 text-orange-500 shrink-0" />
            <p class="text-xs text-orange-800">
              Si deja los campos vacíos, se generará a nombre de <strong>Consumidor Final</strong> con CI <strong>0000000000</strong>.
            </p>
          </div>
        </div>

        <div class="p-6 bg-gray-50 flex gap-3">
          <button 
            @click="showModalFactura = false"
            class="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="confirmarGenerarFactura"
            :disabled="generandoFactura"
            class="flex-2 px-6 py-3 bg-linear-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="generandoFactura" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <Check v-else class="h-5 w-5" />
            Generar Factura
          </button>
        </div>
      </div>
    </div>

    <!-- Toasts / Notifications -->
    <div v-if="notification" class="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div :class="['px-6 py-4 rounded-2xl shadow-xl text-white font-bold flex items-center gap-3', notification.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5" />
        <AlertTriangle v-else class="h-5 w-5" />
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { 
  ShoppingCart, Plus, CheckCircle, AlertTriangle, Search, Users, UserPlus, 
  Pencil, ArrowLeft, Receipt, User, Hash, AlertCircle, Check, LayoutGrid, List, X, Eye, Printer,
  Calendar, Clock
} from 'lucide-vue-next';

// Components
import Filtrarventa from './Filtrarventa.vue';
import VentaCard from './VentaCard.vue';
import registrarventa from './registrarventa.vue';
import Productocard from './Productocard.vue';
import FiltrosProducto from './FiltrosProducto.vue'; 
import PromocionCard from '../Promocion/PromocionCard.vue';
import Comprobante from '../Comprobante.vue'; 
import FiltrosPromocion from '../Promocion/FiltrosPromocion.vue';
import Paginado from '@/views/Components/Modals/Paginado.vue';
import AnularVentaModal from './AnularVentaModal.vue';
import PersonaRegistrar from '../Persona/Registrar.vue';
import ClienteCard from './ClienteCard.vue';

// Stores
import { useSessionStore } from '@/stores/sessionStore';

// Services  
import { listarVentaSucursal, anularVenta, RegistrarVenta, actualizarventa } from '@/Server/Venta';
import { listarPago } from '@/Server/Pago';
import { Listsucursal } from '@/Server/Sucural';
import { listCategorias } from '@/Server/Categoria';
import { ListarProductosOnSucursal, listProduct } from '@/Server/Producto';
import { listarPromociones } from '@/Server/Promocion';
import { listarTipoPromocion } from '@/Server/TipoPromocion';
import { createFactura } from '@/Server/Factura';
import { SucursalUsuario } from '@/Server/Usuario';
import { listarPersonas, RegistrarPersona, UpdatePersona } from '@/Server/persona.js';
import { listarComplemento } from '@/Server/Complemento';
import { listarBarrios, SubirFoto } from '@/Server/api';

const sessionStore = useSessionStore();

// Loading states
const initializing = ref(true);
const loadingHistory = ref(false); 
const loadingCatalog = ref(false);
const vistaTipo = ref('cards'); // 'cards' o 'tabla'
 
// View state  
const modoRegistro = ref(false); 
const tabActiva = ref('catalogo');
const catalogTab = ref('productos');
const busquedaCatalogo = ref('');

// User & Branch info
const currentSucursalId = ref(null);
const tieneSucursal = ref(false);
const usuarioId = ref('');
const itemsPreseleccionados = ref([]);
const ventaParaEditar = ref(null);
const ventasSesion = ref([]);


const isAdmin = computed(() => {
  return sessionStore.rolSeleccionado?.Nombre?.toUpperCase() === 'ADMINISTRADOR';
});

// Data refs
const ventas = ref([]);
const pagosPorVenta = ref({});
const expandedVentaId = ref(null);

const sucursales = ref([]);
const productosList = ref([]);
const promocionesList = ref([]);
const metodosPago = ref([]);

const tiposPromocion = ref([]);
const productosSimples = ref([]);
const categoriasCatalogo = ref([]);

// Anulacion Logic State
const showAnularModal = ref(false);
const idVentaParaAnular = ref('');
const loadingAnulacion = ref(false);

// Filter reactive states
const filtros = ref({
  fecha: new Date().toLocaleDateString('en-CA'),
  sucursal: 'TODOS',
  producto: 'TODOS',
  promocion: 'TODOS',
  pago: 0,
  factura: 'TODOS'
});

const filtrosCatalogo = reactive({ 
  categoria: 'TODOS', 
  subcategoria: 'TODOS',
  sucursal: 'TODOS' 
});

const puedeVenderEnEstaSucursal = computed(() => {
  if (filtrosCatalogo.sucursal === 'TODOS') return false;
  if (tieneSucursal.value) {
    return filtrosCatalogo.sucursal === currentSucursalId.value;
  }
  return isAdmin.value;
});

const sellingSucursalId = computed(() => {
  if (tieneSucursal.value) return currentSucursalId.value;
  if (isAdmin.value) return filtrosCatalogo.sucursal;
  return null;
});

const filtrosPromo = reactive({ search: '', tipopromocion: -1, idproducto: '', limite: 8 });

// Pagination states
const paginacionPromo = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const paginacionProductos = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const limiteProductos = ref(12);
const paginacionVentas = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const limit = ref(12);

// Persona/Client state
const modoPersona = ref(false);
const personaSeleccionada = ref(null);
const pendingPersona = ref(null);
const personasList = ref([]);
const paginacionPersonas = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const filtrosPersonas = reactive({ search: '', limite: 8 });
const complementos = ref([]);
const barrios = ref([]);
const guardandoPersona = ref(false);
const loadingPersonas = ref(false);

const selectedVenta = ref(null);
const showComprobante = ref(false);
const notification = ref(null);

// Factura logic state
const showModalFactura = ref(false);
const selectedVentaParaFactura = ref(null);
const datosFacturacion = reactive({
  nombre: '',
  documento: ''
});
const generandoFactura = ref(false);

let debounceTimer = null;

// --- METHODS ---

const cargarPersonasVenta = async () => {
  loadingPersonas.value = true;
  try {
    const resp = await listarPersonas(
      filtrosPersonas.search || undefined,
      '1', // Solo activos
      paginacionPersonas.paginaActual,
      filtrosPersonas.limite
    );
    personasList.value = resp.data || [];
    paginacionPersonas.total = parseInt(resp.total) || 0;
    paginacionPersonas.totalPaginas = resp.totalPages || Math.ceil(paginacionPersonas.total / filtrosPersonas.limite) || 1;
  } catch (err) {
    console.error('Error al cargar clientes:', err);
  } finally {
    loadingPersonas.value = false;
  }
};

const onSearchPersonasChange = (val) => {
  filtrosPersonas.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacionPersonas.paginaActual = 1; cargarPersonasVenta(); }, 400);
};

const onCambiarPaginaPersonas = (page) => { paginacionPersonas.paginaActual = page; cargarPersonasVenta(); };
const onLimitePersonasChange = (val) => { filtrosPersonas.limite = val; paginacionPersonas.paginaActual = 1; cargarPersonasVenta(); };

const abrirFormularioPersonaNuevo = () => { personaSeleccionada.value = null; modoPersona.value = true; };
const openNewClientModal = abrirFormularioPersonaNuevo;
const abrirFormularioPersonaEditar = (p) => { personaSeleccionada.value = { ...p }; modoPersona.value = true; };
const cerrarFormularioPersona = () => { modoPersona.value = false; personaSeleccionada.value = null; };

const onGuardarPersona = async (data) => {
  // If we are in the middle of a sale, we store the data temporarily
  if (modoRegistro.value) {
    pendingPersona.value = {
      ...data,
      isTemporary: true,
      idpersona: 'TEMP-' + Date.now(), // Unique temp ID
      nombre: data.Nombre,
      apellidopaterno: data.ApellidoPaterno,
      apellidomaterno: data.ApellidoMaterno,
      ci: data.Documento?.[0]?.documento || ''
    };
    showNotification('Cliente agregado temporalmente a la venta', 'success');
    cerrarFormularioPersona();
    return;
  }

  guardandoPersona.value = true;
  try {
    let imageUrl = data.Url ?? '';
    if (data.archivo) {
      imageUrl = await SubirFoto(data.archivo);
    }

    const payload = {
      IdPersona: data.IdPersona,
      Nombre: data.Nombre,
      ApellidoPaterno: data.ApellidoPaterno,
      ApellidoMaterno: data.ApellidoMaterno,
      FechaDeNacimiento: data.FechaDeNacimiento,
      IdGenero: data.IdGenero,
      Email: data.Email,
      Url: imageUrl,
      IdDireccion: data.Direccion?.IdDireccion ?? null,
      IdBarrio: data.Direccion?.IdBarrio ?? null,
      Direccion: data.Direccion?.Direccion ?? '',
      Referencia: data.Direccion?.Referencia ?? '',
      Celulares: data.Celulares ?? [],
      Documento: data.Documento ?? [],
      Estado: 1
    };

    const respuesta = data.IdPersona
      ? await UpdatePersona(payload)
      : await RegistrarPersona(payload);

    showNotification(respuesta?.message ?? (data.IdPersona ? 'Cliente actualizado' : 'Cliente registrado'), 'success');
    cerrarFormularioPersona();
    await cargarPersonasVenta();
  } catch (err) {
    console.error(err);
    showNotification('Error al guardar cliente', 'error');
  } finally {
    guardandoPersona.value = false;
  }
};

const obtenerSucursalUsuario = async (id) => {
  try {
    const response = await SucursalUsuario(id);
    if (response && response.idsucursal) {
      currentSucursalId.value = response.idsucursal;
      filtros.value.sucursal = response.idsucursal;
      filtrosCatalogo.sucursal = response.idsucursal;
      tieneSucursal.value = true;
    }
  } catch (e) { console.error('Error al obtener sucursal del usuario:', e); }
};

const fetchVentas = async () => {
  loadingHistory.value = true;
  try {
    let branchToSearch = filtros.value.sucursal;
    if (branchToSearch === 'TODOS') {
      branchToSearch = isAdmin.value ? null : (currentSucursalId.value);
    }

    const res = await listarVentaSucursal(
      filtros.value.producto === 'TODOS' ? null : filtros.value.producto,
      filtros.value.promocion === 'TODOS' ? null : filtros.value.promocion,
      branchToSearch,
      filtros.value.fecha,
      filtros.value.pago === 0 ? null : filtros.value.pago,
      paginacionVentas.paginaActual,
      limit.value,
      filtros.value.factura
    );
   
    ventas.value = res.data || [];
    paginacionVentas.total = parseInt(res.total) || 0;
    paginacionVentas.totalPaginas = Math.ceil(paginacionVentas.total / limit.value);
  } catch (e) { 
    console.error(e); 
  } finally { 
    loadingHistory.value = false; 
  }
};

const onCambiarPaginaVentas = (page) => { paginacionVentas.paginaActual = page; fetchVentas(); };
const onLimitChange = (newLimit) => { limit.value = newLimit; paginacionVentas.paginaActual = 1; fetchVentas(); };

const cargarProductosCatalogo = async () => {
  const branchToSearch = filtrosCatalogo.sucursal;
  if (!branchToSearch || branchToSearch === 'TODOS') {
    productosList.value = [];
    return;
  }

  loadingCatalog.value = true;
  try {
    const res = await ListarProductosOnSucursal(
      branchToSearch,
      busquedaCatalogo.value,
      limiteProductos.value,
      paginacionProductos.paginaActual,
      filtrosCatalogo.categoria === 'TODOS' ? null : filtrosCatalogo.categoria,
      filtrosCatalogo.subcategoria === 'TODOS' ? null : filtrosCatalogo.subcategoria
    );
    productosList.value = res.result || [];
    paginacionProductos.total = parseInt(res.total) || productosList.value.length;
    paginacionProductos.totalPaginas = Math.ceil(paginacionProductos.total / limiteProductos.value) || 1;
  } catch (e) { console.error('Error cargarProductosCatalogo:', e); } finally { loadingCatalog.value = false; }
};

const cargarPromocionesCatalogo = async () => {
  loadingCatalog.value = true;
  try {
    const resp = await listarPromociones(
      filtrosPromo.search       || undefined,
      filtrosPromo.idproducto   || undefined,
      1, filtrosPromo.tipopromocion,
      paginacionPromo.paginaActual, filtrosPromo.limite,
    );
    promocionesList.value   = resp.data      ?? resp.result ?? [];
    paginacionPromo.total        = parseInt(resp.total) || promocionesList.value.length;
    paginacionPromo.totalPaginas = Math.ceil(paginacionPromo.total / filtrosPromo.limite) || 1;
  } catch (err) { console.error(err); } finally { loadingCatalog.value = false; }
};

const prepararAnulacion = (id) => {
  idVentaParaAnular.value = id;
  showAnularModal.value = true;
};

const abrirEditarVenta = (venta) => {
  ventaParaEditar.value = venta;
  itemsPreseleccionados.value = []; 
  modoRegistro.value = true;
};

const confirmarAnulacion = async (id) => {
  loadingAnulacion.value = true;
  try {
    await anularVenta(id);
    showNotification('Venta anulada correctamente', 'success');
    showAnularModal.value = false;
    fetchVentas();
    cargarProductosCatalogo();
    cargarPromocionesCatalogo();
  } catch (e) {
    showNotification('Error al anular venta', 'error');
  } finally {
    loadingAnulacion.value = false;
  }
};

const onVentaSuccess = async (payload) => {
  try {
    // If there is a pending persona, register it first
    if (pendingPersona.value) {
      const data = pendingPersona.value;
      let imageUrl = data.Url ?? '';
      if (data.archivo) {
        imageUrl = await SubirFoto(data.archivo);
      }

      const personaPayload = {
        Nombre: data.Nombre,
        ApellidoPaterno: data.ApellidoPaterno,
        ApellidoMaterno: data.ApellidoMaterno,
        FechaDeNacimiento: data.FechaDeNacimiento,
        IdGenero: data.IdGenero,
        Email: data.Email,
        Url: imageUrl,
        IdDireccion: data.Direccion?.IdDireccion ?? null,
        IdBarrio: data.Direccion?.IdBarrio ?? null,
        Direccion: data.Direccion?.Direccion ?? '',
        Referencia: data.Direccion?.Referencia ?? '',
        Celulares: data.Celulares ?? [],
        Documento: data.Documento ?? [],
        Estado: 1
      };

      const respPersona = await RegistrarPersona(personaPayload);
      if (respPersona && respPersona.idpersona) {
        payload.IdPersona = respPersona.idpersona;
      } else {
        throw new Error('No se pudo registrar al cliente');
      }
      pendingPersona.value = null;
    }

    if (ventaParaEditar.value) {
      await actualizarventa(ventaParaEditar.value.idventa || ventaParaEditar.value.IdVenta, { ...payload, IdUsuario: usuarioId.value });
      showNotification('Venta actualizada con éxito', 'success');
      modoRegistro.value = false;
      ventaParaEditar.value = null;
    } else {
      const res = await RegistrarVenta({ ...payload, IdUsuario: usuarioId.value });
      showNotification('Venta registrada con éxito', 'success');
      
      // Fetch full sale object to show in session history
      if (res && res.idVenta) {
        try {
          const branchId = sellingSucursalId.value;
          const today = new Date().toLocaleDateString('en-CA');
          const detailRes = await listarVentaSucursal(null, null, branchId, today, null, 1, 1, 'TODOS');
          if (detailRes && detailRes.data?.length > 0) {
            // Find the one we just created or just take the most recent
            ventasSesion.value.unshift(detailRes.data[0]);
          }
        } catch (e) { console.error("Error fetching detail:", e); }
      }
      
      // Clear the form in the child component
      if (registrarVentaRef.value) registrarVentaRef.value.clearForm();
      
      // Stay in modoRegistro for continuous input
    }
    
    await Promise.all([fetchVentas(), cargarProductosCatalogo(), cargarPromocionesCatalogo()]);
  } catch (e) { 
    console.error(e);
    showNotification('Error al procesar la venta', 'error'); 
  }
};

const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => notification.value = null, 3000);
};

const registrarVentaRef = ref(null);

const iniciarNuevaVenta = () => { 
  itemsPreseleccionados.value = []; 
  pendingPersona.value = null; 
  ventasSesion.value = [];
  modoRegistro.value = true; 
};
const iniciarVentaConProducto = ({ producto, medida }) => {
  if (!puedeVenderEnEstaSucursal.value) {
    showNotification('No tienes permiso para vender en esta sucursal', 'error');
    return;
  }
  itemsPreseleccionados.value = [{
    type: 'producto',
    id: producto.idproducto || producto.IdProducto,
    idMedida: medida.idproductomedida || medida.IdPresentacion,
    nombre: producto.nombre || producto.Nombre,
    medidaNombre: (typeof medida.presentacion === 'object' ? medida.presentacion.nombre : medida.presentacion) || medida.Nombre,
    precioUnitario: parseFloat(medida.precioventa || medida.Precio || 0),
    cantidad: 1,
    multiplicador: parseFloat(medida.cantidad || medida.Cantidad) || 1,
    stockMax: parseFloat(producto.cantidad || 0)
  }];
  modoRegistro.value = true;
};

const iniciarVentaConPromo = (promo) => {
  if (!puedeVenderEnEstaSucursal.value) {
     showNotification('No tienes permiso para vender en esta sucursal', 'error');
     return;
  }
  itemsPreseleccionados.value = [{ 
    type: 'promocion',
    id: promo.idpromocion || promo.IdPromocion,
    nombre: promo.nombre || promo.Nombre,
    precioUnitario: parseFloat(promo.preciopromocion || promo.precio || 0),
    cantidad: 1, 
    limiteUso: parseInt(promo.limiteuso || promo.LimiteUso)
  }];
  modoRegistro.value = true;
};

const cancelarRegistro = () => { modoRegistro.value = false; itemsPreseleccionados.value = []; };

const toggleVenta = (id) => { expandedVentaId.value = expandedVentaId.value === id ? null : id; };

const openComprobante = (venta) => {
  if (venta.Factura) {
    selectedVenta.value = venta;
    showComprobante.value = true;
  } else {
    selectedVentaParaFactura.value = venta;
    // Pre-fill data from persona if available
    const persona = venta.Persona || venta.persona;
    if (persona) {
      datosFacturacion.nombre = `${persona.nombre || persona.Nombre || ''} ${persona.apellidopaterno || persona.ApellidoPaterno || ''} ${persona.apellidomaterno || persona.ApellidoMaterno || ''}`.trim();
      // Try to find a document (CI/NIT)
      let docNum = '';
      if (persona.Documento) {
        docNum = persona.Documento.documento || persona.Documento.Documento || '';
      } else if (persona.ci) {
        docNum = persona.ci;
      }
      datosFacturacion.documento = docNum;
    } else {
      datosFacturacion.nombre = '';
      datosFacturacion.documento = '';
    }
    showModalFactura.value = true;
  }
};

const confirmarGenerarFactura = async () => {
  if (!selectedVentaParaFactura.value) return;

  generandoFactura.value = true;
  try {
    const payload = {
      IdVenta: selectedVentaParaFactura.value.idventa || selectedVentaParaFactura.value.IdVenta,
      Cliente: datosFacturacion.nombre.trim() || 'Consumidor Final',
      documento: datosFacturacion.documento.trim() || '0000000000'
    };

    const response = await createFactura(payload);
    showNotification('Factura generada exitosamente', 'success');
    showModalFactura.value = false;
    
    // Refresh the list to get the updated sale with Factura object
    await fetchVentas();
    
    // Find the updated sale in the new list to show the comprobante
    const id = selectedVentaParaFactura.value.idventa || selectedVentaParaFactura.value.IdVenta;
    const ventaActualizada = ventas.value.find(v => (v.idventa || v.IdVenta) === id);
    
    if (ventaActualizada) {
      selectedVenta.value = ventaActualizada;
      showComprobante.value = true;
    }
  } catch (error) {
    console.error('Error al generar factura:', error);
    showNotification('Error al generar la factura', 'error');
  } finally {
    generandoFactura.value = false;
  }
};

// Shared Catalog Handlers
const onLimiteProductosChange = () => { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); };
const onCambiarPaginaProductos = (page) => { paginacionProductos.paginaActual = page; cargarProductosCatalogo(); };
const onSearchPromoChange = (val) => {
  filtrosPromo.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacionPromo.paginaActual = 1; cargarPromocionesCatalogo(); }, 400);
};
const onFiltroPromoChange = () => { paginacionPromo.paginaActual = 1; cargarPromocionesCatalogo(); };
const onLimitePromoChange = (val) => { filtrosPromo.limite = val; paginacionPromo.paginaActual = 1; cargarPromocionesCatalogo(); };
const onCambiarPaginaPromo = (page) => { paginacionPromo.paginaActual = page; cargarPromocionesCatalogo(); };

// --- LIFECYCLE ---
onMounted(async () => {
  initializing.value = true;
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const u = JSON.parse(usuarioStr);
      usuarioId.value = u.IdUsuario;
      await obtenerSucursalUsuario(u.IdUsuario);
    }
    const [sucRes, pagRes, tiposRes, prodSimplesRes, catsRes, compRes, barRes] = await Promise.all([
      Listsucursal(), listarPago(),
      listarTipoPromocion().catch(() => []),
      listProduct().catch(() => []),
      listCategorias().catch(() => []),
      listarComplemento().catch(() => []),
      listarBarrios().catch(() => [])
    ]);
    sucursales.value = sucRes.result || sucRes ||  [];
    metodosPago.value = [{ IdMetodoPago: 0, Nombre: 'Todos' }, ...pagRes];
    tiposPromocion.value = tiposRes?.result ?? tiposRes ?? [];
    productosSimples.value = Array.isArray(prodSimplesRes) ? prodSimplesRes : (prodSimplesRes?.result ?? prodSimplesRes?.data ?? []);
    categoriasCatalogo.value = catsRes.result || catsRes || [];
    complementos.value = compRes?.data || compRes || [];
    barrios.value = barRes?.data || barRes || [];
    
    await Promise.all([cargarPromocionesCatalogo(), cargarProductosCatalogo(), fetchVentas(), cargarPersonasVenta()]);
  } catch (e) { console.error('Error onMounted:', e); } finally { initializing.value = false; }
});

// --- WATCHERS ---
watch(tabActiva, (newTab) => {
  if (newTab === 'clientes') {
    cargarPersonasVenta();
  }
});
watch(() => filtrosCatalogo.categoria, () => { filtrosCatalogo.subcategoria = 'TODOS'; paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); });
watch(() => filtrosCatalogo.subcategoria, () => { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); });
watch(() => filtrosCatalogo.sucursal, () => { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); });

watch(filtros, () => {
  if (tabActiva.value === 'historial') { paginacionVentas.paginaActual = 1; fetchVentas(); }
  else { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); }
}, { deep: true });
watch(busquedaCatalogo, () => {
  if (catalogTab.value === 'productos') {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); }, 400);
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
.animate-bounce-slow { animation: bounce 2s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
