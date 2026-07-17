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
                  <Package class="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
            Cargando Gestión de Pedidos...
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
                  <Package class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                    Gestión de Pedidos
                  </h1>
                  <p class="text-gray-600 text-sm">Administra los pedidos de clientes</p>
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
                @click="iniciarNuevoPedido" 
                class="bg-linear-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
              >
                <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span class="font-semibold hidden sm:inline">Nuevo Pedido</span>
              </button>
            </div>
          </div>

          <!-- Catalog View -->
          <div v-if="tabActiva === 'catalogo'" class="space-y-6 animate-fade-in">
             <div class="space-y-6">
                <!-- Filtros de Catálogo -->
                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                  <div class="flex flex-col gap-6">
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
                      :disableSucursal="tieneSucursal"
                      @update:limite="onLimiteProductosChange"
                    />
                  </div>
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
                      {{ isAdmin && !tieneSucursal ? 'Selecciona una sucursal para poder crear pedidos.' : 'Solo puedes crear pedidos para tu sucursal asignada.' }}
                    </p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <Productocard 
                      v-for="prod in productosList" 
                      :key="prod.idproducto || prod.IdProducto"
                      :producto="prod"
                      :medidas="prod.medidas || []"
                      :disabled="!puedeVenderEnEstaSucursal"
                      @select-medida="iniciarPedidoConProducto"
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
                        @click="iniciarPedidoConPromo(promo)"
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
          <div v-else-if="tabActiva === 'historial'" class="animate-fade-in space-y-6">
            <Filtrarpedido 
              v-model="filtros"
              v-model:viewMode="vistaTipo"
              :sucursales="sucursales"
              :tiposPedido="tiposPedido"
              :tieneSucursalAsignada="tieneSucursal"
              :isAdmin="isAdmin"
              :disableSucursal="tieneSucursal"
              :limit="limit"
              @update:limit="onLimitChange"
            />

            <!-- Pedidos List with local loader -->
            <div v-if="loadingHistory" class="flex justify-center py-20">
               <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <div v-else>
              <div v-if="pedidos.length === 0" class="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                <div class="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package class="h-12 w-12 text-orange-500 opacity-50" />
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No se encontraron pedidos</h3>
                <p class="text-gray-500 mb-6">Intenta cambiar los filtros o registra un nuevo pedido.</p>
              </div>

              <div v-else class="space-y-6">
                <!-- Vista de Tarjetas -->
                <div v-if="vistaTipo === 'cards'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <PedidoCard 
                    v-for="pedido in pedidos" 
                    :key="pedido.idpedido"
                    :pedido="pedido"
                    :isExpanded="expandedPedidoId === pedido.idpedido"
                    @toggle-expand="togglePedido(pedido.idpedido)"
                    @enviar="onEnviarPedido"
                    @finalizar="prepararFinalizacion"
                    @anular="prepararAnulacion"
                    @editar="prepararEdicion"
                    @open-comprobante="openDetallePedido"
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
                          <th class="px-6 py-4 font-black">Detalle Pedido</th>
                          <th class="px-6 py-4 font-black">Total / Adelanto</th>
                          <th class="px-6 py-4 font-black">Estado</th>
                          <th class="px-6 py-4 font-black text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="pedido in pedidos" :key="pedido.idpedido" 
                            :class="['hover:bg-orange-50/30 transition-colors group', pedido.estado === 0 ? 'opacity-60 grayscale' : '']">
                          <td class="px-6 py-4">
                            <div class="flex flex-col">
                              <span class="font-black text-gray-800">#{{ pedido.idpedido }}</span>
                              <span class="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar class="h-3 w-3" /> {{ pedido.fecharegistro?.split('T')[0] }}
                                <Clock class="h-3 w-3 ml-1" /> {{ pedido.hora }}
                              </span>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                {{ pedido.Persona?.Nombre?.charAt(0) || 'C' }}
                              </div>
                              <div class="flex flex-col">
                                <span class="font-bold text-gray-800">{{ pedido.Persona?.Nombre || 'Consumidor Final' }}</span>
                                <span class="text-xs text-gray-500">{{ pedido.Persona?.ApellidoPaterno || '' }}</span>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex flex-col gap-1 max-w-[250px]">
                              <span class="text-xs font-bold text-gray-600 uppercase">{{ pedido.Tipopedido?.Nombre }}</span>
                              <div class="flex flex-wrap gap-1">
                                <span v-for="det in pedido.Detallepedido?.slice(0, 2)" :key="det.IdDetallePedido" 
                                      class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg text-[10px] truncate max-w-[120px]">
                                  {{ det.Productomedida?.Producto?.Nombre || det.Promocion?.Nombre }}
                                </span>
                                <span v-if="pedido.Detallepedido?.length > 2" class="text-[10px] text-orange-500 font-bold">
                                  +{{ pedido.Detallepedido.length - 2 }} más
                                </span>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex flex-col">
                              <span class="font-black text-gray-800">Bs. {{ parseFloat(pedido.total).toFixed(2) }}</span>
                              <span v-if="parseFloat(pedido.adelanto) > 0" class="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                                <DollarSign class="h-2.5 w-2.5" /> Adelanto: Bs. {{ parseFloat(pedido.adelanto).toFixed(2) }}
                              </span>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase', 
                              pedido.estado === 1 ? 'bg-orange-100 text-orange-600' : 
                              pedido.estado === 2 ? 'bg-blue-100 text-blue-600' : 
                              pedido.estado === 3 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                              {{ pedido.estado === 1 ? 'Pendiente' : 
                                 pedido.estado === 2 ? 'Enviado' : 
                                 pedido.estado === 3 ? 'Finalizado' : 'Anulado' }}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-right">
                            <div class="flex justify-end gap-2 transition-opacity">
                              <!-- Acciones según estado -->
                              <button v-if="pedido.estado === 1" @click="onEnviarPedido(pedido.idpedido)" 
                                      class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Enviar">
                                <Send class="h-4 w-4" />
                              </button>
                              <button v-if="pedido.estado === 2" @click="prepararFinalizacion(pedido)" 
                                      class="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm" title="Finalizar">
                                <CheckCircle class="h-4 w-4" />
                              </button>
                              <button v-if="pedido.estado === 1" @click="prepararEdicion(pedido)" 
                                      class="p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-sm" title="Editar">
                                <Pencil class="h-4 w-4" />
                              </button>
                              <button @click="openDetallePedido(pedido)" 
                                      class="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm" title="Ver Detalle">
                                <Eye class="h-4 w-4" />
                              </button>
                              <button v-if="pedido.estado !== 0 && pedido.estado !== 3" @click="prepararAnulacion(pedido.idpedido)" 
                                      class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Anular">
                                <X class="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <Paginado
                  v-if="paginacion.totalPaginas >= 1"
                  :paginaActual="paginacion.paginaActual"
                  :totalPaginas="paginacion.totalPaginas"
                  :total="paginacion.total"
                  :limite="limit"
                  @update:paginaActual="onCambiarPagina"
                />
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
                    placeholder="Buscar cliente..."
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

        <!-- Order Registration View -->
        <div v-else-if="modoRegistro && !modoPersona">
          <registrarpedido 
            :sucursalId="sellingSucursalId"
            :initialItems="itemsPreseleccionados"
            :editingPedido="pedidoEnEdicion"
            :pedidosSesion="pedidosSesion"
            :isAdmin="isAdmin"
            @cancel="cancelarRegistro"
            @success="onPedidoSuccess"
            @success-rapido="onPedidoRapidoSuccess"
            @open-new-client="abrirFormularioPersonaNuevo"
            @editar="prepararEdicion"
            @anular="prepararAnulacion"
            @open-comprobante="openDetallePedido"
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

    <!-- Finalizar Pedido Modal -->
    <FinalizarPedidoModal
      :show="showFinalizarModal"
      :pedido="selectedPedidoParaFinalizar"
      :metodosPago="metodosPago"
      :guardando="guardandoFinalizacion"
      @cancel="showFinalizarModal = false"
      @confirm="confirmarFinalizacionConDevolucion"
    />

    <!-- Anular Pedido Modal -->
    <AnularVentaModal
      :isOpen="showAnularModal"
      :idVenta="pedidoIdParaAnular"
      :loading="loadingAnulacion"
      title="Confirmar Anulación de Pedido"
      message="¿Estás seguro de que deseas anular este pedido? Esta acción restaurará el stock si el pedido ya fue enviado. Esta acción no se puede deshacer."
      confirmText="Anular Pedido"
      @close="showAnularModal = false"
      @confirm="confirmarAnulacion"
    />

    <!-- Confirmar Enviar Modal -->
    <ConfirmacionModal
      :show="showConfirmarEnviar"
      title="Enviar Pedido"
      message="¿Estás seguro de marcar este pedido como ENVIADO? Esto descontará los productos del inventario."
      confirmText="Sí, Enviar"
      confirmButtonClass="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500"
      @cancel="showConfirmarEnviar = false"
      @confirm="confirmarEnviar"
    />

    <!-- Notification -->
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
  Package, Plus, Search, CheckCircle, AlertTriangle, X, ShoppingCart, Users, UserPlus,
  LayoutGrid, List, Eye, Printer, MapPin, Truck, Activity, Clock, Calendar, DollarSign, Pencil, Receipt, Send
} from 'lucide-vue-next';

// Components
import PedidoCard from './PedidoCard.vue';
import Filtrarpedido from './Filtrarpedido.vue';
import registrarpedido from './registrarpedido.vue';
import Paginado from '@/views/Components/Modals/Paginado.vue';
import ClienteCard from '../Venta/ClienteCard.vue';
import PersonaRegistrar from '../Persona/Registrar.vue';
import Productocard from '../Venta/Productocard.vue';
import FiltrosProducto from '../Venta/FiltrosProducto.vue';
import PromocionCard from '../Promocion/PromocionCard.vue';
import FiltrosPromocion from '../Promocion/FiltrosPromocion.vue';
import AnularVentaModal from '../Venta/AnularVentaModal.vue';
import ConfirmacionModal from '@/views/Components/Modals/ConfirmacionModal.vue';
import FinalizarPedidoModal from './FinalizarPedidoModal.vue';

// Stores
import { useSessionStore } from '@/stores/sessionStore';

// Services
import { 
  listarPedidoSucursal, anularPedido, enviarPedido, FinalizarPedido, RegistrarPedido, listarTipopedido, devolverProducto, AtualizarPedido, Registrorapido 
} from '@/Server/Pedido';
import { Listsucursal } from '@/Server/Sucural';
import { listarPago } from '@/Server/Pago';
import { SucursalUsuario } from '@/Server/Usuario';
import { listarPersonas, RegistrarPersona, UpdatePersona } from '@/Server/persona';
import { listarComplemento } from '@/Server/Complemento';
import { listarBarrios, SubirFoto } from '@/Server/api';
import { ListarProductosOnSucursal, listProduct, getPrecioProducto } from '@/Server/Producto';
import { listarPromociones } from '@/Server/Promocion';
import { listarTipoPromocion } from '@/Server/TipoPromocion';
import { listCategorias } from '@/Server/Categoria';

const sessionStore = useSessionStore();

// State
const initializing = ref(true);
const loadingHistory = ref(false);
const loadingPersonas = ref(false); 
const loadingCatalog = ref(false);
const vistaTipo = ref('cards'); // 'cards' o 'tabla'

const modoRegistro = ref(false);
const tabActiva = ref('catalogo');
const catalogTab = ref('productos'); 
const busquedaCatalogo = ref('');

const currentSucursalId = ref(null); 
const tieneSucursal = ref(false);
const usuarioId = ref('');
const itemsPreseleccionados = ref([]);
const pedidosSesion = ref([]);

const isAdmin = computed(() => {
  return sessionStore.rolSeleccionado?.Nombre?.toUpperCase() === 'ADMINISTRADOR';
});

const pedidos = ref([]);
const expandedPedidoId = ref(null);
const sucursales = ref([]);
const tiposPedido = ref([]);
const metodosPago = ref([]);
const personasList = ref([]);

// Catalog Data
const productosList = ref([]);
const promocionesList = ref([]);
const tiposPromocion = ref([]);
const productosSimples = ref([]);
const categoriasCatalogo = ref([]);

const filtros = ref({
  fecha: new Date().toLocaleDateString('en-CA'),
  sucursal: 'TODOS',
  tipopedido: 'TODOS',
  estado: 'TODOS',
  search: ''
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

const paginacion = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const paginacionPromo = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const paginacionProductos = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });
const paginacionPersonas = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });

const limit = ref(12);
const limiteProductos = ref(12);
const filtrosPersonas = reactive({ search: '', limite: 12 });

const notification = ref(null);

// Persona/Client state
const modoPersona = ref(false);
const personaSeleccionada = ref(null);
const complementos = ref([]);
const barrios = ref([]);
const guardandoPersona = ref(false);

// Finalizacion
const showFinalizarModal = ref(false);
const selectedPedidoParaFinalizar = ref(null);
const montoFinalRecibido = ref(0);
const metodoPagoFinal = ref(1);
const guardandoFinalizacion = ref(false);

// Modals State
const showAnularModal = ref(false);
const pedidoIdParaAnular = ref(null);
const loadingAnulacion = ref(false);

const showConfirmarEnviar = ref(false);
const pedidoIdParaEnviar = ref(null);
const loadingEnviar = ref(false);

const pedidoEnEdicion = ref(null);

let debounceTimer = null;

const saldoPendiente = computed(() => {
  if (!selectedPedidoParaFinalizar.value) return 0;
  return Math.max(0, parseFloat(selectedPedidoParaFinalizar.value.total) - parseFloat(selectedPedidoParaFinalizar.value.adelanto));
});

// Methods
const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => notification.value = null, 3000);
};

const fetchPedidos = async () => {
  loadingHistory.value = true;
  try {
    let branchToSearch = filtros.value.sucursal;
    if (branchToSearch === 'TODOS') {
      branchToSearch = isAdmin.value ? null : (currentSucursalId.value || '12162025SUC-2');
    }

    const res = await listarPedidoSucursal(
      filtros.value.estado === 'TODOS' ? null : filtros.value.estado,
      filtros.value.tipopedido === 'TODOS' ? null : filtros.value.tipopedido,
      branchToSearch,
      null, null, filtros.value.fecha,
      paginacion.paginaActual, limit.value, filtros.value.search
    );
    pedidos.value = res.data || [];
    paginacion.total = parseInt(res.total) || 0;
    paginacion.totalPaginas = Math.ceil(paginacion.total / limit.value) || 1;
  } catch (e) { console.error(e); } finally { loadingHistory.value = false; }
};

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
      filtrosPromo.search || undefined,
      filtrosPromo.idproducto || undefined,
      1, filtrosPromo.tipopromocion,
      paginacionPromo.paginaActual, filtrosPromo.limite
    );
    promocionesList.value = resp.data || resp.result || [];
    paginacionPromo.total = parseInt(resp.total) || promocionesList.value.length;
    paginacionPromo.totalPaginas = Math.ceil(paginacionPromo.total / filtrosPromo.limite) || 1;
  } catch (err) { console.error(err); } finally { loadingCatalog.value = false; }
};

const onEnviarPedido = (id) => {
  pedidoIdParaEnviar.value = id;
  showConfirmarEnviar.value = true;
};

const confirmarEnviar = async () => {
  loadingEnviar.value = true;
  try {
    await enviarPedido(pedidoIdParaEnviar.value);
    showNotification('Pedido enviado correctamente', 'success');
    showConfirmarEnviar.value = false;
    fetchPedidos();
  } catch (e) { 
    showNotification('Error al enviar pedido', 'error'); 
  } finally {
    loadingEnviar.value = false;
  }
};

const prepararFinalizacion = (pedido) => {
  selectedPedidoParaFinalizar.value = pedido;
  showFinalizarModal.value = true;
};

const confirmarFinalizacionConDevolucion = async (idPedido, data) => {
  guardandoFinalizacion.value = true;
  try {
    // 1. Procesar Devoluciones si existen
    if (data.devoluciones && data.devoluciones.length > 0) {
      for (const dev of data.devoluciones) {
        await devolverProducto(idPedido, dev.IdDetallePedido, dev.Cantidad, data.comentario);
      }
    }

    // 2. Finalizar Pedido
    await FinalizarPedido(idPedido, data.pago);
    
    showNotification('Pedido finalizado y venta registrada', 'success');
    showFinalizarModal.value = false;
    fetchPedidos();
  } catch (e) { 
    console.error(e);
    showNotification('Error al finalizar pedido', 'error'); 
  } finally {
    guardandoFinalizacion.value = false;
  }
};

const prepararAnulacion = (id) => {
  pedidoIdParaAnular.value = id;
  showAnularModal.value = true;
};

const confirmarAnulacion = async (id) => {
  loadingAnulacion.value = true;
  try {
    await anularPedido(id);
    showNotification('Pedido anulado', 'success');
    showAnularModal.value = false;
    fetchPedidos();
  } catch (e) { 
    showNotification('Error al anular pedido', 'error'); 
  } finally {
    loadingAnulacion.value = false;
  }
};

const prepararEdicion = (pedido) => {
  pedidoEnEdicion.value = pedido;
  itemsPreseleccionados.value = [];
  modoRegistro.value = true;
};

const cancelarRegistro = () => {
  modoRegistro.value = false;
  pedidoEnEdicion.value = null;
  itemsPreseleccionados.value = [];
};

const onPedidoSuccess = async (payload, detalles) => {
  try {
    payload.IdUsuario = usuarioId.value;
    
    let res;
    if (pedidoEnEdicion.value) {
      await AtualizarPedido(pedidoEnEdicion.value.idpedido, payload, detalles);
      showNotification('Pedido actualizado con éxito', 'success');
    } else {
      res = await RegistrarPedido(payload, detalles);
      showNotification('Pedido registrado con éxito', 'success');
      
      // Fetch full order object to show in session history
      if (res && res.idVenta) { // Note: RegistrarPedido returns { idVenta: nuevoIdVenta } but it's actually idPedido
        try {
          const branchId = sellingSucursalId.value;
          const today = new Date().toLocaleDateString('en-CA');
          const detailRes = await listarPedidoSucursal(null, null, branchId, null, null, today, 1, 1, res.idVenta);
          if (detailRes && detailRes.data?.length > 0) {
            pedidosSesion.value.unshift(detailRes.data[0]);
          }
        } catch (e) { console.error("Error fetching detail:", e); }
      }
    }
    
    if (pedidoEnEdicion.value) {
      cancelarRegistro();
    }
    fetchPedidos();
  } catch (e) { 
    showNotification('Error al procesar el pedido', 'error'); 
  }
};

const onPedidoRapidoSuccess = async (payload, detalles, pagoFinal) => {
  try {
    payload.IdUsuario = usuarioId.value;
    const res = await Registrorapido(payload, detalles, pagoFinal);
    showNotification('Venta rápida registrada con éxito', 'success');
    
    // Fetch full order object to show in session history
    if (res && res.idPedido) {
      try {
        const branchId = sellingSucursalId.value;
        const today = new Date().toLocaleDateString('en-CA');
        const detailRes = await listarPedidoSucursal(null, null, branchId, null, null, today, 1, 1, res.idPedido);
        if (detailRes && detailRes.data?.length > 0) {
          pedidosSesion.value.unshift(detailRes.data[0]);
        }
      } catch (e) { console.error("Error fetching detail:", e); }
    }
    
    fetchPedidos();
  } catch (e) {
    showNotification('Error al realizar la venta rápida', 'error');
  }
};

const onSearchPersonasChange = (val) => {
  filtrosPersonas.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacionPersonas.paginaActual = 1; cargarPersonas(); }, 400);
};

const onCambiarPaginaPersonas = (page) => { paginacionPersonas.paginaActual = page; cargarPersonas(); };
const onLimitePersonasChange = (val) => { filtrosPersonas.limite = val; paginacionPersonas.paginaActual = 1; cargarPersonas(); };

const cargarPersonas = async () => {
  loadingPersonas.value = true;
  try {
    const res = await listarPersonas(filtrosPersonas.search || undefined, '1', paginacionPersonas.paginaActual, filtrosPersonas.limite);
    personasList.value = res.data || [];
    paginacionPersonas.total = parseInt(res.total) || 0;
    paginacionPersonas.totalPaginas = Math.ceil(paginacionPersonas.total / filtrosPersonas.limite) || 1;
  } catch (e) { console.error(e); } finally { loadingPersonas.value = false; }
};

// Client registration methods
const abrirFormularioPersonaNuevo = () => { personaSeleccionada.value = null; modoPersona.value = true; };
const abrirFormularioPersonaEditar = (p) => { personaSeleccionada.value = { ...p }; modoPersona.value = true; };
const cerrarFormularioPersona = () => { modoPersona.value = false; personaSeleccionada.value = null; };

const onGuardarPersona = async (data) => {
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
    await cargarPersonas();
  } catch (err) {
    console.error(err);
    showNotification('Error al guardar cliente', 'error');
  } finally {
    guardandoPersona.value = false;
  }
};

const iniciarNuevoPedido = () => { itemsPreseleccionados.value = []; modoRegistro.value = true; };

const iniciarPedidoConProducto = ({ producto, medida }) => {
  if (!puedeVenderEnEstaSucursal.value) {
    showNotification('No tienes permiso para crear pedidos en esta sucursal', 'error');
    return;
  }
  itemsPreseleccionados.value = [{
    type: 'producto',
    id: producto.idproducto || producto.IdProducto,
    idPaquete: medida.idproductomedida || medida.IdPresentacion,
    nombre: producto.nombre || producto.Nombre,
    medidaNombre: (typeof medida.presentacion === 'object' ? medida.presentacion.nombre : medida.presentacion) || medida.Nombre,
    precioUnitario: parseFloat(medida.precioventa || medida.Precio || 0),
    cantidad: 1
  }];
  modoRegistro.value = true;
};

const iniciarPedidoConPromo = (promo) => {
  if (!puedeVenderEnEstaSucursal.value) {
    showNotification('No tienes permiso para crear pedidos en esta sucursal', 'error');
    return;
  }
  itemsPreseleccionados.value = [{
    type: 'promocion',
    id: promo.idpromocion || promo.IdPromocion,
    nombre: promo.nombre || promo.Nombre,
    precioUnitario: parseFloat(promo.preciopromocion || promo.precio || 0),
    cantidad: 1
  }];
  modoRegistro.value = true;
};

const openDetallePedido = (pedido) => {
  togglePedido(pedido.idpedido);
};

const togglePedido = (id) => expandedPedidoId.value = expandedPedidoId.value === id ? null : id;
const onLimitChange = (l) => { limit.value = l; paginacion.paginaActual = 1; fetchPedidos(); };
const onCambiarPagina = (p) => { paginacion.paginaActual = p; fetchPedidos(); };

const onLimiteProductosChange = () => { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); };
const onCambiarPaginaProductos = (p) => { paginacionProductos.paginaActual = p; cargarProductosCatalogo(); };
const onCambiarPaginaPromo = (p) => { paginacionPromo.paginaActual = p; cargarPromocionesCatalogo(); };
const onSearchPromoChange = (v) => { filtrosPromo.search = v; paginacionPromo.paginaActual = 1; cargarPromocionesCatalogo(); };
const onFiltroPromoChange = () => { paginacionPromo.paginaActual = 1; cargarPromocionesCatalogo(); };
const onLimitePromoChange = (v) => { filtrosPromo.limite = v; paginacionPromo.paginaActual = 1; cargarPromocionesCatalogo(); };

onMounted(async () => {
  initializing.value = true;
  try {
    const uStr = localStorage.getItem('usuario');
    if (uStr) {
      const u = JSON.parse(uStr);
      usuarioId.value = u.IdUsuario;
      const suc = await SucursalUsuario(u.IdUsuario);
      if (suc?.idsucursal) {
        currentSucursalId.value = suc.idsucursal;
        filtros.value.sucursal = suc.idsucursal;
        filtrosCatalogo.sucursal = suc.idsucursal;
        tieneSucursal.value = true;
      }
    }
    const [sucRes, tiposRes, pagosRes, compRes, barRes, catsRes, typesPromoRes, prodSimpRes] = await Promise.all([
      Listsucursal(), listarTipopedido(), listarPago(),
      listarComplemento().catch(() => []),
      listarBarrios().catch(() => []),
      listCategorias().catch(() => []),
      listarTipoPromocion().catch(() => []),
      listProduct().catch(() => [])
    ]);
    sucursales.value = sucRes.result || sucRes || [];
    tiposPedido.value = tiposRes || [];
    metodosPago.value = pagosRes || [];
    complementos.value = compRes?.data || compRes || [];
    barrios.value = barRes?.data || barRes || [];
    categoriasCatalogo.value = catsRes.result || catsRes || [];
    tiposPromocion.value = typesPromoRes?.result ?? typesPromoRes ?? [];
    productosSimples.value = Array.isArray(prodSimpRes) ? prodSimpRes : (prodSimpRes?.result ?? prodSimpRes?.data ?? []);
    
    await Promise.all([cargarProductosCatalogo(), cargarPromocionesCatalogo(), fetchPedidos(), cargarPersonas()]);
  } catch (e) { console.error(e); } finally { initializing.value = false; }
});

watch(tabActiva, (newTab) => {
  if (newTab === 'catalogo') { cargarProductosCatalogo(); cargarPromocionesCatalogo(); }
  else if (newTab === 'clientes') { cargarPersonas(); }
});

watch(busquedaCatalogo, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); }, 400);
});

watch(() => filtrosCatalogo.categoria, () => { filtrosCatalogo.subcategoria = 'TODOS'; paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); });
watch(() => filtrosCatalogo.subcategoria, () => { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); });
watch(() => filtrosCatalogo.sucursal, () => { paginacionProductos.paginaActual = 1; cargarProductosCatalogo(); });

watch(filtros, () => { paginacion.paginaActual = 1; fetchPedidos(); }, { deep: true });
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-bounce-slow { animation: bounce 2s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
</style>
