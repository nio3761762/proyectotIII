<template>
  <div class="min-h-screen">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- VISTA PRINCIPAL (HISTORIAL) -->
    <div v-if="!modoRegistro">
      <!-- Header  -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <ShoppingCart class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Gestión de Ventas
              </h1>
              <p class="text-gray-600 text-sm">Administra las ventas y transacciones</p>
            </div>
          </div>
          
          <div class="hidden md:flex items-center gap-3">
            <button 
              @click="iniciarNuevaVenta" 
              class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span class="font-semibold">Nueva Venta</span>
            </button>
            
            <button 
              class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <FileText class="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span class="font-semibold">Reporte</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Buscador de Productos -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="md:hidden mb-6 space-y-3">
          <button 
            @click="iniciarNuevaVenta" 
            class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span class="font-semibold">Nueva Venta</span>
          </button>
          
          <button 
            class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <FileText class="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span class="font-semibold">Generar Reporte</span>
          </button>
        </div>

        <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
          <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
            <Search class="h-5 w-5" />
            Consultar Producto en Sucursales 
          </h3>
          
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="terminoBusquedaProducto"
                type="text"
                placeholder="Escribe el nombre del producto..."
                @keyup.enter="buscarProductoGlobal"
                class="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400"
              />
            </div>
            <button 
              @click="buscarProductoGlobal" 
              class="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <Search class="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span class="font-semibold hidden sm:inline">Buscar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Historial de Ventas -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <History class="h-6 w-6 text-orange-500" />
          Historial de Ventas
        </h3>
        <!-- Filtros -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1">
            <label for="filtro-fecha" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Fecha</label>
            <input 
              type="date" 
              id="filtro-fecha"
              v-model="filtroFecha"
              class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div v-if="!TIeneSucursal" class="flex-1">
            <label for="filtro-sucursal" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Sucursal</label>
            <select 
              id="filtro-sucursal"
              v-model="filtroSucursal"
              class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option v-for="sucursal in sucursales" :key="sucursal" :value="sucursal.IdSucursal">{{ sucursal.Nombre }}</option>
            </select>
          </div>
          <div class="flex-1">
            <label for="filtro-producto" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Producto</label>
            <select 
              id="filtro-producto"
              v-model="filtroProducto"
              class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="TODOS">Todos los productos</option>
              <option v-for="producto in products" :key="producto.IdProducto" :value="producto.IdProducto">{{ producto.Nombre }}</option>
            </select>
          </div>
            <div class="flex flex-col">
            <label class="text-sm font-semibold text-gray-700 mb-1">Metodo de Pago</label>
            <select
              v-model="filtroPago"
              class="border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:border-orange-500 focus:ring-orange-500/20 outline-none transition-colors"
            >
              <option v-for="pago in metodo" :key="pago.IdMetodoPago" :value="pago.IdMetodoPago">
                {{ pago.Nombre }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="ventas.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart class="h-12 w-12 text-orange-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4">No hay ventas registradas</h3>
          <p class="text-gray-600 mb-6">Comienza registrando tu primera venta.</p>
          <button 
            @click="iniciarNuevaVenta"
            class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
          >
            <Plus class="h-5 w-5" />
            <span class="font-semibold">Registrar Primera Venta</span>
          </button>
        </div>

     
      </div>
         <div v-if="ventas.length > 0" class="space-y-6 mt-8">
          <!-- Desktop View -->
          <div class="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            <div
              v-for="venta in ventasPaginadas"
              :key="venta.IdVenta"
              class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
            >
              <!-- Background decoration -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div class="relative p-6">
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                      <ShoppingCart class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        Venta #{{ venta.IdVenta.substring(venta.IdVenta.length - 4) }}
                      </h3>
                      <p class="text-gray-600 text-sm">{{TieneFactura[venta.IdVenta]?.Persona?.Nombre || 'Sin Cliente' }} {{TieneFactura[venta.IdVenta]?.Persona?.ApellidoPaterno }}</p>
                    </div>
                  </div>

                  <span
                    :class="[
                      'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
                      venta.Estado.Nombre === 'Pagado'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : venta.Estado.Nombre === 'Anulado'
                          ? 'bg-gradient-to-r from-red-500 to-rose-600'
                          : 'bg-gradient-to-r from-yellow-500 to-amber-600'
                    ]"
                  >
                    {{ venta.Estado.Nombre }}
                  </span>
                </div>

                <!-- Venta Details Preview -->
                <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
                  <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-gray-700">Información Clave</span>
                      <button
                        @click="toggleDetallesVenta(venta.IdVenta)"
                        class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors"
                      >
                        {{ ventaExpandida === venta.IdVenta ? 'Ocultar' : 'Ver más' }}
                        <ChevronDown v-if="ventaExpandida !== venta.IdVenta" class="h-4 w-4" />
                        <ChevronUp v-else class="h-4 w-4" />
                      </button>
                  </div>
                  <div class="space-y-2">
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar class="h-4 w-4 text-orange-500" />
                        <span>{{ new Date(venta.FechaVenta + 'T00:00:00').toLocaleDateString() }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign class="h-4 w-4 text-green-500" />
                        <span class="font-bold text-green-600">Bs. {{ CalcularTotal(venta.Detalleventa)}}</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <Receipt class="h-4 w-4 text-blue-500" />
                        <span>Comprobante:<a href="#" @click.prevent="abrirModalComprobante(venta)">
                         {{ TieneFactura[venta.IdVenta]?.Factura?.NroFactura || 'Sin Comprobante' }}
                         </a></span>
                      </div>
                  </div>
                </div>

                <!-- Expanded Details -->
                <div v-if="ventaExpandida === venta.IdVenta" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
                  <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                    <div class="font-semibold text-gray-800 mb-2 text-sm">Detalles de Ítems</div>
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-gray-200">
                            <th class="text-left py-2 px-2 font-semibold text-gray-700">Tipo</th>
                            <th class="text-left py-2 px-2 font-semibold text-gray-700">Nombre</th>
                            <th class="text-center py-2 px-2 font-semibold text-gray-700">Cant.</th>
                            <th class="text-center py-2 px-2 font-semibold text-gray-700">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in venta.Detalleventa" :key="item.IdDetalleVenta" class="border-b border-gray-100 hover:bg-white/50">
                            <td class="py-2 px-2">
                              <span :class="[
                                'px-2 py-1 rounded-lg text-xs font-semibold',
                                item.Producto ? 'bg-blue-100 text-blue-700' :
                                item.Promocion ? 'bg-purple-100 text-purple-700' :
                                'bg-green-100 text-green-700'
                              ]">
                                {{  item.Producto ? 'Prod.' :  item.Promocion ? 'Promo.' : 'Paq.' }}
                              </span>
                            </td>
                            <td class="py-2 px-2 font-medium text-gray-800">{{ item.Producto?.Nombre || item.Promocion?.Nombre || item.Paquete?.Nombre }}</td>
                            <td class="py-2 px-2 text-center font-medium">{{ item.Cantidad }}</td>
                            <td class="py-2 px-2 text-center font-bold text-green-600">{{ redondearPrecio(item.Precio * item.Cantidad) }} Bs. </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100" v-for="pagos in pagoVenta">
                    <div class="font-semibold text-gray-800 mb-2 text-sm">Información de Pago</div>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <CreditCard class="h-3 w-3 text-blue-500" />
                        <span>Método: {{ pagos.Nombre || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <DollarSign class="h-3 w-3 text-green-500" />
                        <span>Monto Pagado: Bs. {{ pagos.Monto || '0.00' }}</span>
                      </div>
                      <div v-if="pagos.Metodopago === 1" class="flex items-center gap-2 text-xs text-gray-600">
                        <Coins class="h-3 w-3 text-purple-500" />
                        <span>Cambio: Bs. {{ pagos.Cambio || '0.00' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 mt-4">
                  <button
                    @click="iniciarEdicionVenta(venta)"
                    class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Pencil class="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    @click="abrirModalComprobante(venta)"
                    class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl p-2 text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Receipt class="h-4 w-4" />
                  </button>

                  <button
                    v-if="venta.Estado.Nombre !== 'Anulado'"
                    @click="abrirModalAnulacion(venta.IdVenta)"
                    class="bg-red-500 text-white hover:bg-red-600 rounded-xl p-2 text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile View -->
          <div class="block md:hidden space-y-4">
            <div
              v-for="venta in ventasPaginadas"
              :key="venta.IdVenta"
              class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
            >
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                      <ShoppingCart class="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-gray-800">Venta #{{ venta.IdVenta.substring(venta.IdVenta.length - 4) }}</h3>
                      <p class="text-gray-600 text-sm">{{TieneFactura[venta.IdVenta]?.Persona?.Nombre || 'Sin Cliente' }} {{TieneFactura[venta.IdVenta]?.Persona?.ApellidoPaterno }}</p>
                    </div>
                  </div>

                  <span
                    :class="[
                      'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
                      venta.Estado.Nombre === 'Pagado'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : venta.Estado.Nombre === 'Anulado'
                          ? 'bg-gradient-to-r from-red-500 to-rose-600'
                          : 'bg-gradient-to-r from-yellow-500 to-amber-600'
                    ]"
                  >
                    {{ venta.Estado.Nombre }}
                  </span>
                </div>

                <div class="mb-4 p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
                  <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-gray-700">Información Clave</span>
                      <button
                        @click="toggleDetallesVenta(venta.IdVenta)"
                        class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors"
                      >
                        {{ ventaExpandida === venta.IdVenta ? 'Ocultar' : 'Ver detalles' }}
                        <ChevronDown v-if="ventaExpandida !== venta.IdVenta" class="h-4 w-4" />
                        <ChevronUp v-else class="h-4 w-4" />
                      </button>
                  </div>
                  <div v-if="ventaExpandida !== venta.IdVenta" class="space-y-1 text-sm text-gray-600 animate-fade-in">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar class="h-4 w-4 text-orange-500" />
                      <span>{{ new Date(venta.FechaVenta + 'T00:00:00').toLocaleDateString() }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign class="h-4 w-4 text-green-500" />
                      <span class="font-bold text-green-600">Bs. {{ CalcularTotal(venta.Detalleventa)}}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <Receipt class="h-4 w-4 text-blue-500" />
                      <span>Comprobante: <a href="#" @click.prevent="abrirModalComprobante(venta)">
                         {{ TieneFactura[venta.IdVenta]?.Factura?.NroFactura || 'Sin Comprobante' }}
                         </a></span>
                    </div>
                  </div>
                </div>

                <div v-if="ventaExpandida === venta.IdVenta" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
                  <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                    <div class="font-semibold text-gray-800 mb-2 text-sm">Detalles de Ítems</div>
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-gray-200">
                            <th class="text-left py-2 px-2 font-semibold text-gray-700">Tipo</th>
                            <th class="text-left py-2 px-2 font-semibold text-gray-700">Nombre</th>
                            <th class="text-center py-2 px-2 font-semibold text-gray-700">Cant.</th>
                            <th class="text-center py-2 px-2 font-semibold text-gray-700">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in venta.Detalleventa" :key="item.IdDetalleVenta" class="border-b border-gray-100 hover:bg-white/50">
                            <td class="py-2 px-2">
                              <span :class="[
                                'px-2 py-1 rounded-lg text-xs font-semibold',
                                item.Producto ? 'bg-blue-100 text-blue-700' :
                                item.Promocion ? 'bg-purple-100 text-purple-700' :
                                'bg-green-100 text-green-700'
                              ]">
                                {{  item.Producto ? 'Prod.' :  item.Promocion ? 'Promo.' : 'Paq.' }}
                              </span>
                            </td>
                            <td class="py-2 px-2 font-medium text-gray-800">{{ item.Producto?.Nombre || item.Promocion?.Nombre || item.Paquete?.Nombre }}</td>
                            <td class="py-2 px-2 text-center font-medium">{{ item.Cantidad }}</td>
                            <td class="py-2 px-2 text-center font-bold text-green-600">{{  redondearPrecio(item.Precio * item.Cantidad) }} Bs. </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100" v-for="pagos in pagoVenta">
                    <div class="font-semibold text-gray-800 mb-2 text-sm">Información de Pago</div>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <CreditCard class="h-3 w-3 text-blue-500" />
                        <span>Método: {{ pagos.Nombre || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <DollarSign class="h-3 w-3 text-green-500" />
                        <span>Monto Pagado: Bs. {{ pagos.Monto || '0.00' }}</span>
                      </div>
                      <div v-if="pagos.Metodopago === 1" class="flex items-center gap-2 text-xs text-gray-600">
                        <Coins class="h-3 w-3 text-purple-500" />
                        <span>Cambio: Bs. {{ pagos.Cambio || '0.00' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex gap-2 mt-4">
                  <button
                    @click="iniciarEdicionVenta(venta)"
                    class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Pencil class="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    @click="abrirModalComprobante(venta)"
                    class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl p-2 text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Receipt class="h-4 w-4" />
                  </button>

                  <button
                    v-if="venta.Estado.Nombre !== 'Anulado'"
                    @click="abrirModalAnulacion(venta.IdVenta)"
                    class="bg-red-500 text-white hover:bg-red-600 rounded-xl p-2 text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="totalPaginas > 0" class="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
            <div class="text-gray-600 text-sm font-medium">
              {{ paginacionInfo }}
            </div>
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-2">
              <div class="flex items-center gap-1">
                <button
                  @click="paginaActual--"
                  :disabled="paginaActual === 1"
                  class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft class="h-4 w-4" />
                </button>

                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="paginaActual = page"
                  :class="[
                    'rounded-2xl min-w-[40px] px-3 py-2 text-sm font-medium transition-colors',
                    paginaActual === page
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'hover:bg-orange-50 text-gray-600'
                  ]"
                >
                  {{ page }}
                </button>

                <button
                  @click="paginaActual++"
                  :disabled="paginaActual === totalPaginas"
                  class="rounded-2xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 transition-colors flex items-center gap-1"
                >
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>

    <!-- VISTA DE REGISTRO -->
    <div v-else>
      <!-- Header -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <ShoppingCart class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                {{ modoEdicion ? 'Editar Venta' : 'Registrar Nueva Venta' }}
              </h1>
              <p class="text-gray-600 text-sm">{{ modoEdicion ? 'Modifica los datos de la venta' : 'Completa los datos de la venta' }}</p>
            </div>
          </div>
          
          <button
            @click="cancelarVenta"
            class="p-3 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <X class="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <!-- Formulario de Venta -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Columna Izquierda: Cliente e Ítems -->
        <div class="space-y-6">
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User class="h-6 w-6 text-orange-500" />
              Cliente
            </h3>
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm font-semibold text-gray-700">Buscar Cliente</label>
              <button @click="abrirModalNuevoCliente" class="text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors">
                + Nuevo Cliente
              </button>
            </div>
            <div class="relative">
              <Combobox v-model="venta.Cliente">
                <div class="relative mt-1">
                  <div class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500">
                    <ComboboxInput
                      class="w-full border-none outline-none ring-0 focus:ring-0 focus:outline-none bg-transparent text-gray-700 placeholder-gray-400"
                      :displayValue="(cliente) => cliente?.Nombre || ''"
                      @change="queryCliente = $event.target.value"
                      placeholder="Buscar cliente por nombre o CI..."
                    />
                    <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </ComboboxButton>
                  </div>
                  <TransitionRoot
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    @after-leave="queryCliente = ''"
                  >
                    <ComboboxOptions class="absolute z-30 mt-1 w-full bg-white rounded-2xl shadow-lg border max-h-60 overflow-auto">
                      <div v-if="filteredClientes.length === 0 && queryCliente !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                        No se encontraron clientes.
                      </div>
                      <ComboboxOption
                        v-for="cliente in filteredClientes"
                        :key="cliente.IdPersona"
                        :value="cliente"
                        v-slot="{ selected, active }"
                      >
                        <li :class="{
                          'bg-orange-500 text-white': active,
                          'text-gray-900': !active,
                          'relative cursor-default select-none py-2 pl-10 pr-4': true,
                        }">
                          <span :class="{
                            'font-medium': selected,
                            'font-normal': !selected,
                            'block truncate': true,
                          }">
                            {{ cliente.Nombre }}
                          </span>
                          <span
                            v-if="selected"
                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-600"
                          >
                            <CheckIcon class="h-5 w-5" aria-hidden="true" />
                          </span>
                        </li>
                      </ComboboxOption>
                    </ComboboxOptions>
                  </TransitionRoot>
                </div>
              </Combobox>
            </div>
            <div v-if="venta.Cliente.IdPersona" class="mt-4 bg-green-50 border border-green-200 rounded-2xl p-3 flex justify-between items-center">
              <p class="font-semibold text-green-800">{{ venta.Cliente.Nombre }}</p>
              <button @click="deseleccionarCliente" class="text-red-500 hover:text-red-700">
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package class="h-6 w-6 text-orange-500" />
              Ítems de la Venta
            </h3>
            <div class="mb-4">
                <label for="filtro-nombre-item" class="text-sm font-semibold text-gray-700 mb-1 block">Buscar por Nombre</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search class="h-5 w-5 text-gray-400" />
                    </div>
                    <input v-model="filtroNombreItem" id="filtro-nombre-item" type="text" placeholder="Buscar producto, promoción o paquete..." class="w-full pl-10 pr-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                </div>
            </div>
            <div>
            <div class="mb-4 border-b border-gray-200">
                <nav class="flex space-x-4" aria-label="Tabs">
                    <button @click="activeTab = 'productos'"
                        :class="['px-3 py-2 font-medium text-sm rounded-t-lg', activeTab === 'productos' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700']">
                        Productos
                    </button>
                    <button @click="activeTab = 'promociones'"
                        :class="['px-3 py-2 font-medium text-sm rounded-t-lg', activeTab === 'promociones' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700']">
                        Promociones
                    </button>
                    <button @click="activeTab = 'paquetes'"
                        :class="['px-3 py-2 font-medium text-sm rounded-t-lg', activeTab === 'paquetes' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700']">
                        Paquetes
                    </button>
                </nav>
            </div>

            <!-- Contenido de los tabs -->
            <div v-show="activeTab === 'productos'">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="text-sm font-semibold text-gray-700">Categoría</label>
                        <select v-model="filtroCategoria" class="w-full mt-1 px-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md">
                            <option value="TODOS">Todas las categorias </option>
                            <option v-for="cat in categorias" :key="cat.IdCategoria" :value="cat.IdCategoria">{{ cat.Nombre }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-sm font-semibold text-gray-700">Subcategoría</label>
                        <select v-model="filtroSubcategoria" :disabled="filtroCategoria === 'TODOS'" class="w-full mt-1 px-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md disabled:bg-gray-100">
                            <option value="TODOS">Todas las subcategorias</option>
                            <option v-for="subcat in subcategoriasParaFiltro" :key="subcat.IdSubCategoria" :value="subcat.IdSubCategoria">{{ subcat.Nombre }}</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    <div v-for="producto in productosFiltradosPorNombre" :key="producto.IdProducto"
                        @click="agregarProductoDesdeCard(producto)"
                        class="bg-white/60 rounded-2xl p-3 border border-white/50 hover:shadow-md transition-all duration-300 cursor-pointer group">
                        <div class="h-24 mb-2 rounded-xl overflow-hidden">
                            <img :src="producto.Imagen?.Url || 'https://via.placeholder.com/150'"
                                :alt="producto.Nombre"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h4 class="font-semibold text-sm text-gray-800 truncate">{{ producto.Nombre }}</h4>
                        <p class="text-xs text-gray-500">Stock: {{ producto.Productosucursal?.[0]?.Cantidad || 0 }}</p>
                        <div class="mt-1">
                            <p class="text-lg font-bold text-green-600">{{ precios[producto.IdProducto] || '...' }}</p>
                            <p v-if="precios[`${producto.IdProducto}-mayor`]" class="text-sm text-gray-500">Mayor: {{ precios[`${producto.IdProducto}-mayor`] }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-show="activeTab === 'promociones'">
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    <div v-for="promo in promocionesFiltradasPorNombre" :key="promo.IdPromocion"
                        @click="agregarPromocionDesdeCard(promo)"
                        class="bg-white/60 rounded-2xl p-3 border border-white/50 hover:shadow-md transition-all duration-300 cursor-pointer group">
                        <div class="h-24 mb-2 rounded-xl overflow-hidden">
                            <img :src="promo.Imagen?.Url || 'https://via.placeholder.com/150'"
                                :alt="promo.Nombre"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h4 class="font-semibold text-sm text-gray-800 truncate">{{ promo.Nombre }}</h4>
                        <p v-if="promo.Promocionproducto && promo.Promocionproducto.length" class="text-xs text-gray-500 truncate">
                            Contiene: {{ promo.Promocionproducto.map(p => `${p.Cantidad}x ${p.Producto?.Nombre || p.Paquete?.Nombre}`).join(', ') }}
                        </p>
                        <p class="text-lg font-bold text-purple-600 mt-1">{{ precios[promo.IdPromocion] || '...' }}</p>
                    </div>
                </div>
            </div>
            <div v-show="activeTab === 'paquetes'">
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    <div v-for="pack in paquetesFiltradosPorNombre" :key="pack.IdPaquete"
                        @click="agregarPaqueteDesdeCard(pack)"
                        class="bg-white/60 rounded-2xl p-3 border border-white/50 hover:shadow-md transition-all duration-300 cursor-pointer group">
                        <div class="h-24 mb-2 rounded-xl overflow-hidden">
                            <img :src="pack.Imagen?.Url || 'https://via.placeholder.com/150'"
                                :alt="pack.Nombre"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h4 class="font-semibold text-sm text-gray-800 truncate">{{ pack.Nombre }}</h4>
                        <p class="text-xs text-gray-500">Contiene: {{ pack.Cantidad }} x {{ pack.Producto?.Nombre }}</p>
                         <p class="text-xs text-gray-500">Stock: {{ pack.CantidadPaquete || 0 }}</p>
                        <div class="mt-1">
                            <p class="text-lg font-bold text-green-600">{{ precios[pack.IdPaquete] || '...' }}</p>
                            <p v-if="precios[`${pack.IdPaquete}-mayor`]" class="text-sm text-gray-500">Mayor: {{ precios[`${pack.IdPaquete}-mayor`] }}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          </div>

          <!-- Tabs para seleccionar tipo de item -->
        
        </div>

        <!-- Columna Derecha: Resumen y Pago -->
        <div class="space-y-6">
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart class="h-6 w-6 text-orange-500" />
              Resumen
            </h3>
            <div class="bg-gray-50 rounded-2xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              <div v-if="itemsEnVenta.length === 0" class="text-center text-gray-500 pt-10">
                <p>El carrito está vacío</p>
              </div>
              <div v-else class="space-y-2">
                <div v-for="(item, index) in itemsEnVenta" :key="index" class="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                  <div class="flex-1">
                    <p class="font-semibold">{{ item.nombre }}</p>
                   <p class="text-sm text-gray-500">
                      @ {{
                      item.type === "promocion"
                      ? redondearPrecio(item.precioUnitario)
                      : item.precioUnitario
                        }} Bs. 
                    </p>

                  </div>
                  
                  <div v-if="item.type !== 'promocion'" class="flex items-center gap-2">
                    <label :for="`wholesale-toggle-${index}`" class="text-xs text-gray-600 cursor-pointer">P. Mayor</label>
                    <input 
                      type="checkbox" 
                      :id="`wholesale-toggle-${index}`" 
                      v-model="item.Modo" 
                      :true-value="1"
                      :false-value="0"
                      @change="actualizarPrecioItem(item)" 
                      class="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <!-- Boton de Transformacion -->
                  <div v-if="item.type === 'producto' && transformablePackages[item.id]">
                    <button @click="transformToPackage(item, transformablePackages[item.id])" title="Convertir a Paquete" class="p-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box-select"><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M9 3h6"/><path d="M9 21h6"/></svg>
                    </button>
                  </div>

                  <div class="flex items-center gap-2">
                    <button @click="decrementarCantidad(item)" class="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors">-</button>
                    <!-- <span class="w-10 text-center font-semibold">{{ item.Cantidad }}</span> -->
                    <input :value="item.Cantidad" @change="handleCantidadChange(item, $event)" type="number" min="1"
                    class="w-16 h-10 text-center border border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all duration-300"/>
                    <button @click="incrementarCantidad(item)" class="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors">+</button>
                  </div>
                  <p class="font-bold text-green-600 w-20 text-right">Bs. {{ redondearPrecio(item.subtotal)}}</p>
                  <button @click="eliminarItemDeVenta(item,index)" class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calculator class="h-6 w-6 text-orange-500" />
              Pago
            </h3>
            <div class="space-y-4">
              <div class="bg-green-50 rounded-2xl p-4 flex justify-between items-center">
                <p class="text-lg font-semibold text-green-800">Total a Pagar:</p>
                <p class="text-2xl font-bold text-green-600">Bs. {{ redondearPrecio(subtotalVenta) }}</p>
              </div>
              <div>
                <p class="font-semibold mb-2">Método de Pago</p>
                <div class="flex gap-4" v-for="Pagos in pago">
                  <label class="flex items-center"><input type="radio" v-model.number="venta.MetodoPago" :value="Pagos.IdMetodoPago" class="text-green-600 focus:ring-green-500"> <span class="ml-2">{{ Pagos.Nombre }}</span></label>
              </div>
              </div>
              <div v-if="venta.MetodoPago === 1 ">
                <input
                  v-model.number="montoRecibido"
                  type="number"
                  placeholder="Monto recibido"
                  class="w-full px-4 py-3 bg-white/60 border border-green-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div v-if="venta.MetodoPago === 1" class="bg-purple-50 rounded-2xl p-3 flex justify-between items-center">
                <p class="font-semibold text-purple-800">Cambio:</p>
                <p class="text-lg font-bold text-purple-600">Bs. {{ (cambio) }}</p>
              </div>
              <div class="flex gap-4 pt-4 border-t mt-4">
                <button @click="cancelarVenta" class="w-full bg-gray-500 text-white py-3 rounded-2xl shadow-lg hover:bg-gray-600 font-semibold">
                  Cancelar
                </button>
                <button @click="registrarVenta" :disabled="itemsEnVenta.length === 0" class="w-full bg-green-500 text-white py-3 rounded-2xl shadow-lg hover:bg-green-600 font-semibold disabled:opacity-50">
                  {{ modoEdicion ? 'Actualizar Venta' : 'Registrar Venta' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Cliente -->
    <div v-if="mostrarModalNuevoCliente" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden">
        <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <User class="h-6 w-6" />
              <h2 class="text-xl font-bold">Registrar Nuevo Cliente</h2>
            </div>
            <button @click="cerrarModalNuevoCliente" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Nombre(s)</label>
            <input 
              v-model="nuevoCliente.Nombre" 
              type="text" 
              placeholder="Ingrese el nombre" 
              @input="clientErrors.Nombre = validateClientField('Nombre', nuevoCliente.Nombre)"
              @blur="clientErrors.Nombre = validateClientField('Nombre', nuevoCliente.Nombre)"
              :class="['w-full px-4 py-3 bg-white/60 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500', clientErrors.Nombre ? 'border-red-500' : 'border-gray-300']" 
            />
            <p v-if="clientErrors.Nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ clientErrors.Nombre }}
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-1 block">Apellido Paterno</label>
              <input v-model="nuevoCliente.ApellidoPaterno" type="text" placeholder="Ingrese el apellido paterno" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-1 block">Apellido Materno</label>
              <input v-model="nuevoCliente.ApellidoMaterno" type="text" placeholder="Ingrese el apellido materno" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div class="md:col-span-2">
                    <label class="block text-gray-700 font-semibold mb-2">Género</label>
                    <div class="flex gap-6">
                      <label class="inline-flex items-center">
                        <input v-model.number="nuevoCliente.IdGenero" type="radio" :value="1" class="text-orange-600" />
                        <span class="ml-2 text-gray-700">Masculino</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input v-model.number="nuevoCliente.IdGenero" type="radio" :value="2" class="text-orange-600" />
                        <span class="ml-2 text-gray-700">Femenino</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input v-model.number="nuevoCliente.IdGenero" type="radio" :value="3" class="text-orange-600" />
                        <span class="ml-2 text-gray-700">Otro</span>
                      </label>
                    </div>
                  </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Correo Electrónico</label>
            <input v-model="nuevoCliente.Email" type="email" placeholder="ejemplo@correo.com" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Número Telefónico</label>
            <input v-model="nuevoCliente.Telefono[0].Numero" type="tel" placeholder="Ingrese el número de teléfono" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
           </div> 
         <!-- class="grid grid-cols-1 md:grid-cols-3 gap-4" -->
           <div >
                    <label class="block text-gray-700 font-semibold mb-2">Cédula de Identidad (CI)</label>
                    <div class="flex">
                      <input
                        v-model="nuevoCliente.Documento[0].Documento"
                        required
                        class="flex-1  border border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 rounded-l-2xl px-4 py-3 outline-none transition-colors bg-white"
                        placeholder="Cédula de Identidad"
                      />
                      <select v-model="nuevoCliente.Documento[0].IdComplemento" class=" border border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 rounded-r-2xl px-4 py-3 outline-none transition-colors bg-white">
                        <option v-for="comp in complementos" :key="comp.IdComplemento" :value="comp.IdComplemento">{{ comp.Nombre }}</option>
                      </select>
                    </div>
                  </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">NIT</label>
            <input v-model="nuevoCliente.Documento[1].Documento" type="text" placeholder="Ingrese el NIT" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
        <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-4">
          <button @click="cerrarModalNuevoCliente" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Cancelar</button>
          <button @click="guardarNuevoCliente" class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Guardar Cliente</button>
        </div>
      </div>
    </div>

    <!-- Modal de Búsqueda de Productos -->
    <div 
      v-if="mostrarModalBusqueda"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-2xl overflow-hidden animate-fade-in">
        <div class="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Search class="h-6 w-6" />
              <h2 class="text-xl font-bold">Resultados de la Búsqueda</h2>
            </div>
            <button
              @click="cerrarModalBusqueda"
              class="p-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="p-6">
          <div v-if="productosEncontrados.length > 0" class="max-h-96 overflow-y-auto space-y-3">
        <!-- c{{ productosEncontrados }} -->
      
            <div 
              v-for="producto in productosEncontrados" 
              :key="producto.IdProducto"
              class="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 hover:shadow-md transition-all duration-300"
            >
              <div class="flex justify-between items-center" v-for="prdoductoSucursal in producto.Productosucursal"  :key="prdoductoSucursal.IdProducto">
                <div >
                  <h4 class="font-semibold text-gray-800">{{ producto.Nombre }}</h4>
                  <p class="text-sm text-gray-600">{{ prdoductoSucursal.Sucursal?.Nombre }}</p>
                   <p class="text-sm text-gray-600">{{ prdoductoSucursal.Cantidad }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-green-600">Bs. {{ pp[producto.IdProducto]?.Precio || '0.00' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-12">
            <Search class="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No se encontraron productos</h3>
            <p class="text-gray-600">
              No hay productos que coincidan con "<span class="font-semibold">{{ terminoBusquedaProducto }}</span>".
            </p>
          </div>
        </div>

        <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex justify-end">
          <button
            @click="cerrarModalBusqueda"
            class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-pink-600 hover:to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Anulación -->
    <div 
      v-if="mostrarModalAnulacion"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden animate-fade-in">
        <div class="p-8 text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center">
            <AlertTriangle class="h-10 w-10 text-red-500" />
          </div>
          
          <h2 class="text-2xl font-bold text-gray-800 mb-4">¿Anular Venta?</h2>
          
          <p class="text-gray-600 mb-8">
            ¿Estás seguro de que deseas anular la venta 
            <span class="font-semibold text-gray-800">#{{ ventaParaAnular }}</span>? 
            Esta acción no se puede deshacer.
          </p>

          <div class="flex gap-4">
            <button
              @click="confirmarAnulacion"
              class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <Check class="h-5 w-5" />
              Sí, Anular
            </button>
            
            <button
              @click="cerrarModalAnulacion"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <X class="h-5 w-5" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="showToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>

    <!-- Modal Ingresar Datos Cliente para Comprobante -->
    <div 
      v-if="mostrarModalDatosCliente"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <User class="h-6 w-6" />
              <h2 class="text-xl font-bold">Datos del Cliente para el Comprobante</h2>
            </div>
            <button @click="cerrarModalDatosCliente" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-2 block">Buscar Cliente Existente</label>
            <Combobox v-model="clienteParaComprobante">
              <div class="relative mt-1">
                <div class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500">
                  <ComboboxInput
                    class="w-full border-none outline-none ring-0 focus:ring-0 focus:outline-none bg-transparent text-gray-700 placeholder-gray-400"
                    :displayValue="(c) => c ? `${c.Nombre} ${c.ApellidoPaterno || ''}`.trim() : ''"
                    @change="queryClienteComprobante = $event.target.value"
                    placeholder="Buscar cliente por nombre o CI..."
                  />
                  <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </ComboboxButton>
                </div>
                <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryClienteComprobante = ''">
                  <ComboboxOptions class="absolute z-30 mt-1 w-full bg-white rounded-2xl shadow-lg border max-h-60 overflow-auto">
                    <div v-if="clientesFiltradosComprobante.length === 0 && queryClienteComprobante !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                      No se encontraron clientes.
                    </div>
                    <ComboboxOption
                      v-for="c in clientesFiltradosComprobante"
                      :key="c.IdPersona"
                      :value="c"
                      v-slot="{ selected, active }"
                    >
                      <li :class="{'bg-orange-500 text-white': active, 'text-gray-900': !active, 'relative cursor-default select-none py-2 pl-10 pr-4': true}">
                        <span :class="{'font-medium': selected, 'font-normal': !selected, 'block truncate': true}">
                          {{ c.Nombre }} {{ c.ApellidoPaterno }}
                        </span>
                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-600">
                          <CheckIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
          </div>

          <hr class="my-4 border-gray-200" />

         <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Nombre(s)</label>
            <input 
              v-model="nuevoCliente.Nombre" 
              type="text" 
              placeholder="Ingrese el nombre" 
              @input="clientErrors.Nombre = validateClientField('Nombre', nuevoCliente.Nombre)"
              @blur="clientErrors.Nombre = validateClientField('Nombre', nuevoCliente.Nombre)"
              :class="['w-full px-4 py-3 bg-white/60 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500', clientErrors.Nombre ? 'border-red-500' : 'border-gray-300']" 
            />
            <p v-if="clientErrors.Nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ clientErrors.Nombre }}
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-1 block">Apellido Paterno</label>
              <input 
                v-model="nuevoCliente.ApellidoPaterno" 
                type="text" 
                placeholder="Ingrese el apellido paterno" 
                @input="clientErrors.ApellidoPaterno = validateClientField('ApellidoPaterno', nuevoCliente.ApellidoPaterno)"
                @blur="clientErrors.ApellidoPaterno = validateClientField('ApellidoPaterno', nuevoCliente.ApellidoPaterno)"
                :class="['w-full px-4 py-3 bg-white/60 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500', clientErrors.ApellidoPaterno ? 'border-red-500' : 'border-gray-300']" 
              />
              <p v-if="clientErrors.ApellidoPaterno" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ clientErrors.ApellidoPaterno }}
              </p>
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-1 block">Apellido Materno</label>
              <input v-model="nuevoCliente.ApellidoMaterno" type="text" placeholder="Ingrese el apellido materno" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div class="md:col-span-2">
                    <label class="block text-gray-700 font-semibold mb-2">Género</label>
                    <div class="flex gap-6">
                      <label class="inline-flex items-center">
                        <input 
                          v-model.number="nuevoCliente.IdGenero" 
                          type="radio" 
                          :value="1" 
                          class="text-orange-600" 
                          @change="clientErrors.IdGenero = validateClientField('IdGenero', nuevoCliente.IdGenero)"
                        />
                        <span class="ml-2 text-gray-700">Masculino</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input 
                          v-model.number="nuevoCliente.IdGenero" 
                          type="radio" 
                          :value="2" 
                          class="text-orange-600" 
                          @change="clientErrors.IdGenero = validateClientField('IdGenero', nuevoCliente.IdGenero)"
                        />
                        <span class="ml-2 text-gray-700">Femenino</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input 
                          v-model.number="nuevoCliente.IdGenero" 
                          type="radio" 
                          :value="3" 
                          class="text-orange-600" 
                          @change="clientErrors.IdGenero = validateClientField('IdGenero', nuevoCliente.IdGenero)"
                        />
                        <span class="ml-2 text-gray-700">Otro</span>
                      </label>
                    </div>
                    <p v-if="clientErrors.IdGenero" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                      <AlertCircle class="h-3 w-3" />
                      {{ clientErrors.IdGenero }}
                    </p>
                  </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Correo Electrónico</label>
            <input 
              v-model="nuevoCliente.Email" 
              type="email" 
              placeholder="ejemplo@correo.com" 
              @input="clientErrors.Email = validateClientField('Email', nuevoCliente.Email)"
              @blur="clientErrors.Email = validateClientField('Email', nuevoCliente.Email)"
              :class="['w-full px-4 py-3 bg-white/60 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500', clientErrors.Email ? 'border-red-500' : 'border-gray-300']" 
            />
            <p v-if="clientErrors.Email" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ clientErrors.Email }}
            </p>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Número Telefónico</label>
            <input 
              v-model="nuevoCliente.Telefono[0].Numero" 
              type="tel" 
              placeholder="Ingrese el número de teléfono" 
              @input="clientErrors.Telefono = validateClientField('Telefono', nuevoCliente.Telefono[0].Numero)"
              @blur="clientErrors.Telefono = validateClientField('Telefono', nuevoCliente.Telefono[0].Numero)"
              :class="['w-full px-4 py-3 bg-white/60 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500', clientErrors.Telefono ? 'border-red-500' : 'border-gray-300']" 
            />
            <p v-if="clientErrors.Telefono" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
              <AlertCircle class="h-3 w-3" />
              {{ clientErrors.Telefono }}
            </p>
           </div> 
         <!-- class="grid grid-cols-1 md:grid-cols-3 gap-4" -->
           <div >
                    <label class="block text-gray-700 font-semibold mb-2">Cédula de Identidad (CI)</label>
                    <div class="flex">
                      <input
                        v-model="nuevoCliente.Documento[0].Documento"
                        @input="clientErrors.Documento = validateClientField('Documento', nuevoCliente.Documento[0].Documento, cliente, modoEdicion, nuevoCliente.IdPersona)"
                        @blur="clientErrors.Documento = validateClientField('Documento', nuevoCliente.Documento[0].Documento, cliente, modoEdicion, nuevoCliente.IdPersona)"
                        :class="['flex-1  border focus:border-orange-500 focus:ring-orange-500/20 rounded-l-2xl px-4 py-3 outline-none transition-colors bg-white', clientErrors.Documento ? 'border-red-500' : 'border-gray-300']"
                        placeholder="Cédula de Identidad"
                      />
                      <select v-model="nuevoCliente.Documento[0].IdComplemento" class=" border border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 rounded-r-2xl px-4 py-3 outline-none transition-colors bg-white">
                        <option v-for="comp in complementos" :key="comp.IdComplemento" :value="comp.IdComplemento">{{ comp.Nombre }}</option>
                      </select>
                    </div>
                    <p v-if="clientErrors.Documento" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                      <AlertCircle class="h-3 w-3" />
                      {{ clientErrors.Documento }}
                    </p>
                  </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">NIT</label>
            <input v-model="nuevoCliente.Documento[1].Documento" type="text" placeholder="Ingrese el NIT" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
        </div>

        <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-4">
          <button @click="cerrarModalDatosCliente" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            Cancelar
          </button>
          <button @click="generarComprobanteFinal" class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            Generar Comprobante
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Comprobante -->
    <Comprobante 
      v-if="mostrarModalComprobante" 
      :venta="ventaParaComprobante" 
      :products="products"
      :paquete="paquete"
      :promocion="promocion"
      @close="cerrarModalComprobante" 
    />
  </div>
</template>
<!--  -->

<script setup>
import { ref, computed, watch, onMounted, reactive, defineProps } from 'vue'
import Comprobante from './Comprobante.vue'
import {
  ShoppingCart, Plus, Search, FileText, History, Eye, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Receipt, Trash2, Package, Tag, User, Hash, Calculator, CreditCard, DollarSign, Coins,
  X, Check, AlertTriangle, CheckCircle, Pencil, Calendar, AlertCircle
} from 'lucide-vue-next'
import { agregarClienteVenta, anularVenta, RegistrarVenta, listarVentaSucursal, listarVentaUsuario, updateVenta } from '@/Server/Venta'
import { listarPagoVenta, listarPago, listarMetodo} from '@/Server/Pago'
import { listarProductosSucursal, listarPaquete, listarBuscarProductos, PrecioProducto, ObtenerPresentacion, ObtenerPaqueteSucursal } from '@/Server/Producto'
import { listarPromocionactiva, buscarPromocion} from '@/Server/Promocion'
import { listarCategorias, ObtenerSubCategorias } from '@/Server/Categoria'
import { listarCliente, RegistrarCliente } from '@/Server/Cliente'
import { listarSucursales } from '@/Server/api'
import { createFactura, ObtenerFactura } from '@/Server/Factura'
import { SucursalUsuario } from '@/Server/Usuario' 
import { listarComplemento } from '@/Server/Complemento'; 
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import { useAlertStore } from '@/stores/alertStore';

const alertStore = useAlertStore();

// Reactive data
const modoRegistro = ref(false)
const modoEdicion = ref(false)
const ventaIdParaEditar = ref(null)
const terminoBusquedaProducto = ref('')
const mostrarModalBusqueda = ref(false)
const mostrarModalAnulacion = ref(false)
const ventaExpandida = ref(null)
const ventaParaAnular = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
const paginaActual = ref(1)
const itemsPorPagina = 5
const montoRecibido = ref(0);
const sucursales = ref([]);
const TIeneSucursal = ref(false)
const activeTab = ref('productos');
const categorias = ref([]);
const subcategoriasParaFiltro = ref([]);
const filtroCategoria = ref('TODOS');
const filtroSubcategoria = ref('TODOS');
const filtroNombreItem = ref('');
const TieneFactura = ref({});

const mostrarModalNuevoCliente = ref(false);
const complementos = ref([]);
const nuevoCliente = ref({
  IdPersona: '',
  Nombre: '',
  ApellidoPaterno: '',
  ApellidoMaterno: '',
  Email: '',
  Telefono: [ { Numero:'' } ],
  IdGenero: 1 ,
      Documento: [
        { 
          IdDocumento: '',
          Documento: '',
          IdComplemento: 'C-1',
          IdTipoDocumento: 2 
        },
        {
          IdDocumento: '',
          Documento: '',
          IdComplemento: null,
          IdTipoDocumento: 1 
        }
      ],
});

const abrirModalNuevoCliente = () => {
  mostrarModalNuevoCliente.value = true;
  Object.keys(clientErrors).forEach(key => clientErrors[key] = '');
};

const cerrarModalNuevoCliente = () => {
  mostrarModalNuevoCliente.value = false;
  nuevoCliente.value = {
    IdPersona:'',
  Nombre: '',
  ApellidoPaterno: '',
  ApellidoMaterno: '',
  Email: '',
  Telefono: [ { Numero:'' } ],
   IdGenero: 1 ,
      Documento: [
        { 
          IdDocumento: '',
          Documento: '',
           IdComplemento: 'C-1',
           IdTipoDocumento: 2 
        },
        {
          IdDocumento: '',
          Documento: '',
          IdComplemento: null,
          IdTipoDocumento: 1 
        }
      ],
};
  Object.keys(clientErrors).forEach(key => clientErrors[key] = '');
};
////  en la parte d
const guardarNuevoCliente = async () => {
  if (!validateClientForm()) {
    return;
  }
  console.log(nuevoCliente.value)
  mostrarModalNuevoCliente.value = false;
 
};

const ListarCategoriasPrincipales = async () => {
  try {
    const response = await listarCategorias();
    categorias.value = response;
  } catch (error) {
    console.error('Error al cargar categorias:', error);
  }
};

watch(filtroCategoria, async (newVal) => {
  filtroSubcategoria.value = 'TODOS';
  if (newVal && newVal !== 'TODOS') {
    try {
        const response = await ObtenerSubCategorias(newVal);
        subcategoriasParaFiltro.value = response;
    } catch (error) {
        console.error('Error al cargar subcategorias:', error);
        subcategoriasParaFiltro.value = [];
    }
  } else {
    subcategoriasParaFiltro.value = [];
  }
  await Listarproductos(filtroSucursal.value);
});

watch(filtroSubcategoria, async () => {
  await Listarproductos(filtroSucursal.value);
});
// Comprobante
const mostrarModalComprobante = ref(false)
const ventaParaComprobante = ref(null)
const mostrarModalDatosCliente = ref(false)
const ventaSeleccionadaParaComprobante = ref(null)
const clienteParaComprobante = ref(null) // Holds the selected client object from the combobox
const datosClienteManual = ref({ Nombre: '', ApellidoPaterno: '', ApellidoMaterno: '', CI: '' }) // Holds the data for the manual input fields
const queryClienteComprobante = ref('') // Used for the search query in the invoice modal's combobox

// Filtros
const today = new Date();
const formattedDate = today.toISOString().split('T')[0];
const filtroFecha = ref(formattedDate);
const filtroSucursal = ref('TODOS');
const filtroPago = ref(0);
const filtroProducto = ref('TODOS');
// Formulario de venta
const selectedItemType = ref('producto')
const selectedItem = ref(null)
const queryCliente = ref('')
const cantidadItem = ref(1)
const queryProducto = ref('');
const metodo = ref([]);
const BuscraProducto = ref([]);
const ventas = ref([]);
const products = ref([]);
const paquete = ref([]);
const promocion = ref([]);
const cliente = ref([]);
const pago = ref([]);
const pp = ref({});
const cantidadError = ref('');
const promotion = ref({});
const precios = ref({});

// Validation errors for new client modal
const clientErrors = reactive({
  Nombre: '',
  ApellidoPaterno: '',
  Email: '',
  Telefono: '',
  Documento: '',
  IdGenero: '',
});

const validateClientField = (field, value, allClients = [], isEditing = false, currentClientId = null) => {
  let error = '';
  switch (field) {
    case 'Nombre':
      if (!value) error = 'El nombre es requerido.';
      else if (value.length > 50) error = 'El nombre no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z\s]*$/.test(value)) error = 'El nombre solo puede contener letras y espacios.';
      break;
    case 'ApellidoPaterno':
      if (!value) error = 'El apellido paterno es requerido.';
      else if (value.length > 50) error = 'El apellido paterno no puede tener más de 50 caracteres.';
      else if (!/^[a-zA-Z\s]*$/.test(value)) error = 'El apellido paterno solo puede contener letras y espacios.';
      break;
    case 'Email':
      if (!value) error = 'El correo electrónico es requerido.';
      else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(value)) error = 'Formato de correo electrónico inválido.';
      break;
    case 'Telefono':
      if (!value) error = 'El número de teléfono es requerido.';
      else if (!/^[0-9]{8}$/.test(value)) error = 'El número de teléfono debe tener 8 dígitos numéricos.';
      break;
    case 'Documento':
      if (!value) error = 'El CI es requerido.';
      else if (!/^[0-9]+$/.test(value)) error = 'El CI solo puede contener números.';
      else if (value.length < 4 || value.length > 10) error = 'El CI debe tener entre 4 y 10 dígitos.';
      else {
        const isDuplicate = allClients.some(client => {
          if (isEditing && client.IdPersona === currentClientId) {
            return false;
          }
          return client.Documento.some(doc => doc.Documento === value);
        });
        if (isDuplicate) error = 'Ya existe un cliente con este CI.';
      }
      break;
    case 'IdGenero':
      if (!value) error = 'El género es requerido.';
      break;
    default:
      break;
  }
  return error;
};

const validateClientForm = () => {
  clientErrors.Nombre = validateClientField('Nombre', nuevoCliente.value.Nombre);
  clientErrors.ApellidoPaterno = validateClientField('ApellidoPaterno', nuevoCliente.value.ApellidoPaterno);
  clientErrors.Email = validateClientField('Email', nuevoCliente.value.Email);
  clientErrors.Telefono = validateClientField('Telefono', nuevoCliente.value.Telefono[0].Numero);
  clientErrors.Documento = validateClientField('Documento', nuevoCliente.value.Documento[0].Documento, cliente.value, modoEdicion.value, nuevoCliente.value.IdPersona);
  clientErrors.IdGenero = validateClientField('IdGenero', nuevoCliente.value.IdGenero);

  return Object.values(clientErrors).every(error => !error);
};

const isCantidadInvalid = computed(() => {
  if (selectedItem.value && selectedItemType.value === 'producto') {
    if (!cantidadItem.value || cantidadItem.value <= 0) {
      return true; // Es inválido si es cero o negativo
    }
    const maxQuantity = selectedItem.value.Productosucursal?.[0]?.Cantidad;
    if (typeof maxQuantity === 'number' && cantidadItem.value > maxQuantity) {
      return true; // Es inválido si excede el stock
    }
  }
  return false; // Es válido en los demás casos
});
const redondearPrecio = (precio) => {
  const base = Math.floor(precio * 10) / 10; // redondea hacia abajo a la décima
  const diff = precio - base;

  if (diff < 0.05) {
    return base.toFixed(2); // baja
  } else {
    return (base + 0.1).toFixed(2); // sube
  }
};

const venta = ref({
    IdVenta:'',
    Cliente: {},
    Usuario: {},
    idTipoVenta: 1, // 1 para online, 2 para tienda
    Monto: 0,
    Cambio: 0,
    MetodoPago: 1,
    detalles: {
      Producto: [],
      Promocion: [],
      Paquete: []
    }
  
})
const presentacion = ref({});
const productosEncontrados = ref([])

// Computed
const itemsEnVenta = computed(() => {
  const { Producto, Promocion, Paquete } = venta.value.detalles;
  return [...Producto, ...Promocion, ...Paquete];
});

const transformablePackages = computed(() => {
  const mapping = {};
  if (!paquete.value) return mapping;

  const productItems = itemsEnVenta.value.filter(i => i.type === 'producto');

  for (const item of productItems) {
    const foundPackage = paquete.value.find(p =>
      p.presentacion &&
      p.presentacion.IdProducto === item.id &&
      item.Cantidad >= p.presentacion.Cantidad
    );
    if (foundPackage) {
      mapping[item.id] = foundPackage;
    }
  }
  return mapping;
});

const ventasFiltradas = computed(() => {
  if (!Array.isArray(ventas.value)) {
    return [];
  }

  if (filtroProducto.value && filtroProducto.value !== 'TODOS') {
    return ventas.value.filter(venta =>
      venta.Detalleventa && venta.Detalleventa.some(detalle => detalle.Producto && detalle.Producto.IdProducto === filtroProducto.value)
    );
  }

  return ventas.value;
});
// como puedo poner esto en cada IdDetalleVenta producto, promocion y paquete, eso es para poder actualizar 
const filteredItemsForCombobox = computed(() => {
  const query = queryProducto.value.toLowerCase();
  const currentItemIds = itemsEnVenta.value.map(item => item.id);

  let items = [];
  if (selectedItemType.value === 'producto') {
    items = products.value;
  } else if (selectedItemType.value === 'promocion') {
    items = promocion.value;
  } else if (selectedItemType.value === 'paquete') {
    items = paquete.value;
  }

  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(item => {
    const isNotAdded = !currentItemIds.includes(item.IdProducto || item.IdPromocion || item.IdPaquete);
    const matchesQuery = item.Nombre.toLowerCase().includes(query);
    return isNotAdded && matchesQuery;
  });
});


const totalPaginas = computed(() => {
  return Math.ceil(ventasFiltradas.value.length / itemsPorPagina)
})

const ventasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  return ventasFiltradas.value.slice(inicio, fin)
})

const filteredClientes = computed(() => {
  if (queryCliente.value === '') {
    return cliente.value;
  }
  return cliente.value.filter(c =>
    c.Nombre.toLowerCase().includes(queryCliente.value.toLowerCase()) ||
    (c.CI && c.CI.includes(queryCliente.value))
  );
});

const clientesFiltradosComprobante = computed(() => {
  if (queryClienteComprobante.value === '') {
    return cliente.value;
  }
  return cliente.value.filter(c =>
    c.Nombre.toLowerCase().includes(queryClienteComprobante.value.toLowerCase()) ||
    (c.CI && c.CI.includes(queryClienteComprobante.value))
  );
});

const subtotalVenta = computed(() => {
  return itemsEnVenta.value.reduce((total, item) => total + item.subtotal, 0)
})

const cambio = computed(() => {
  if (venta.value.MetodoPago === 1) {
    const result = Math.max(0, montoRecibido.value - redondearPrecio(subtotalVenta.value));
    venta.value.Cambio = result;
    return result;
  }
  return 0
})

const paginacionInfo = computed(() => {
  const total = ventasFiltradas.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPorPagina + 1;
  const fin = Math.min(inicio + itemsPorPagina - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} ventas`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

const productosFiltradosPorNombre = computed(() => {
    if (!filtroNombreItem.value) {
        return products.value;
    }
    return products.value.filter(p =>
        p.Nombre.toLowerCase().includes(filtroNombreItem.value.toLowerCase())
    );
});

const promocionesFiltradasPorNombre = computed(() => {
    if (!filtroNombreItem.value) {
        return promocion.value;
    }
    return promocion.value.filter(p =>
        p.Nombre.toLowerCase().includes(filtroNombreItem.value.toLowerCase())
    );
});

const paquetesFiltradosPorNombre = computed(() => {
    if (!filtroNombreItem.value) {
        return paquete.value;
    }
    return paquete.value.filter(p =>
        p.Nombre.toLowerCase().includes(filtroNombreItem.value.toLowerCase())
    );
});

// Watchers
watch(clienteParaComprobante, (selectedClient) => {
  if (selectedClient && selectedClient.IdPersona) {
    console.log(selectedClient)
    nuevoCliente.value.IdPersona = selectedClient?.IdPersona || "";
    nuevoCliente.value.Nombre = selectedClient?.Nombre || "";
    nuevoCliente.value.ApellidoPaterno =selectedClient?.ApellidoPaterno || "";
    nuevoCliente.value.ApellidoMaterno = selectedClient?.ApellidoMaterno || "";
    nuevoCliente.value.FechaDeNacimiento = selectedClient?.FechaDeNacimiento || null;
    nuevoCliente.value.Email =selectedClient?.Email?.Email || "";
    nuevoCliente.value.IdGenero = selectedClient?.Genero?.IdGenero;
    nuevoCliente.value.Telefono = selectedClient?.Celulares; // Handle multiple phones
    nuevoCliente.value.Documento = [
  { IdDocumento: null, Documento: '', IdComplemento: 'C-1' , IdTipoDocumento: 2  }, // CI
  { IdDocumento: null, Documento: '', IDComplemento: null,  IdTipoDocumento: 1  } // Otro documento (ej. NIT)
];
  if (selectedClient?.Documento?.length > 0) {
  for (const doc of selectedClient.Documento) {
    const tipo = doc.Tipodocumento?.IdTipoDocumento;
    if (tipo === '2') { // CI
      nuevoCliente.value.Documento[0] = {
        IdDocumento: doc.IdDocumento,
        Documento: doc.Documento,
        IdComplemento:  doc.Complemento.IdComplemento,
        IdTipoDocumento: tipo 
      };
    } else { // Otro documento
      nuevoCliente.value.Documento[1] = {
        IdDocumento: doc.IdDocumento,
        Documento: doc.Documento,
        IdComplemento: null,
        IdTipoDocumento: tipo 
      };
    }
  }
} 
 //   nuevoCliente.value = { ...selectedClient };
  }
});

watch([filtroFecha, filtroSucursal, filtroPago], ([newFecha, newSucursal, newPago]) => {
  paginaActual.value = 1;
  ListarVenta(newSucursal, newFecha, newPago);
  if (newSucursal) {
      Listarproductos(newSucursal);
  }
});


watch(selectedItemType, () => {
  selectedItem.value = null;
  queryProducto.value = '';
  cantidadItem.value = 1;
  cantidadError.value = '';
});

watch(selectedItem, () => {
  validarCantidad();
});

const calcularPrecios = (items) => {
    if (!items || !Array.isArray(items)) return;
    items.forEach(item => {
        const id = item.IdProducto || item.IdPromocion || item.IdPaquete;
        if (!id) return;

        const isPromo = !!item.IdPromocion;

        // Calculate normal price
        if (precios.value[id] === undefined) {
            precios.value[id] = '...';
            CalcularPrecio(
                item.IdProducto ? item : null,
                item.IdPromocion ? item : null,
                item.IdPaquete ? item : null,
                false
            ).then(precio => {
                precios.value[id] = precio.toFixed(2) + ' Bs.';
            });
        }

        // Calculate wholesale price (if not a promotion)
        if (!isPromo && precios.value[`${id}-mayor`] === undefined) {
            precios.value[`${id}-mayor`] = '...';
            CalcularPrecio(
                item.IdProducto ? item : null,
                null,
                item.IdPaquete ? item : null,
                true
            ).then(precio => {
                precios.value[`${id}-mayor`] = precio.toFixed(2) + ' Bs.';
            });
        }
    });
};

watch(filteredItemsForCombobox, (newItems) => {
    calcularPrecios(newItems);
}, { deep: true });

watch(products, (newProducts) => {
    calcularPrecios(newProducts);
}, { deep: true, immediate: true });

watch(promocion, (newPromos) => {
    calcularPrecios(newPromos);
}, { deep: true, immediate: true });

watch(paquete, (newPaquetes) => {
    calcularPrecios(newPaquetes);
}, { deep: true, immediate: true });

const   cantidadValida = ref(false);

// Methods
const toggleDetallesVenta =async (ventaId) => {
  ventaExpandida.value = ventaExpandida.value === ventaId ? null : ventaId;

  await obtenetPago(ventaId);
};
const checkPromoStock = async (promo, quantity) => {
  await existPromocion(promo.IdPromocion);
  const promoDetails = promotion.value;

  if (!promoDetails || !promoDetails.Productos || promoDetails.Productos.length === 0) {
    return { available: false, message: 'No se pudo obtener la información de la promoción.' };
  }

  let minAvailablePromos = Infinity;
  let limitingProduct = '';

  for (const promoProduct of promoDetails.Productos) {
    const requiredQuantityPerPromo = promoProduct.Cantidad;

    if (promoProduct.IdProducto) { // It's a direct product
      const productInStock = products.value.find(p => p.IdProducto === promoProduct.IdProducto);
      if (productInStock && productInStock.Productosucursal && productInStock.Productosucursal.length > 0) {
        const stockDisponible = productInStock.Productosucursal[0].Cantidad;
        const availablePromos = Math.floor(stockDisponible / requiredQuantityPerPromo);
        if (availablePromos < minAvailablePromos) {
          minAvailablePromos = availablePromos;
          limitingProduct = productInStock.Nombre;
        }
      } else {
        minAvailablePromos = 0;
        limitingProduct = promoProduct.Nombre || 'Producto desconocido';
        break;
      }
    } else if (promoProduct.IdPaquete) { // It's a package
      const packageInStock = paquete.value.find(p => p.IdPaquete === promoProduct.IdPaquete);
      if (packageInStock) {
        const stockDisponible = packageInStock.CantidadPaquete || 0;
        const availablePromos = Math.floor(stockDisponible / requiredQuantityPerPromo);
        if (availablePromos < minAvailablePromos) {
          minAvailablePromos = availablePromos;
          limitingProduct = packageInStock.Nombre;
        }
      } else {
        minAvailablePromos = 0;
        limitingProduct = promoProduct.Nombre || 'Paquete desconocido';
        break;
      }
    }
  }

  if (quantity > minAvailablePromos) {
    if (minAvailablePromos === Infinity) {
      return { available: false, message: 'No se pudo verificar el stock para la promoción.' };
    } else if (minAvailablePromos === 0) {
      return { available: false, message: `No hay stock suficiente del ítem "${limitingProduct}" para esta promoción.` };
    } else {
      return { available: false, message: `Stock insuficiente. Solo se pueden vender ${minAvailablePromos} promociones debido al ítem "${limitingProduct}".` };
    }
  }

  return { available: true };
};

const ajustarStockLocal = (productoId, cantidad) => {
  const producto = products.value.find(p => p.IdProducto === productoId);
  if (producto && producto.Productosucursal && producto.Productosucursal.length > 0) {
    producto.Productosucursal[0].Cantidad += cantidad;
    products.value = [...products.value];
  }
};

const ajustarStockPaqueteLocal = (paqueteId, cantidad) => {
  const pack = paquete.value.find(p => p.IdPaquete === paqueteId);
  if (pack) {
    if (typeof pack.CantidadPaquete !== 'number') {
        pack.CantidadPaquete = 0;
    }
    pack.CantidadPaquete += cantidad;
    paquete.value = [...paquete.value];
  }
};

const ajustarStockPorItem = async (item, cantidad) => {
  if (item.type === 'producto') {
    ajustarStockLocal(item.id, cantidad);
  } else if (item.type === 'paquete') {
    ajustarStockPaqueteLocal(item.id, cantidad);
  } else if (item.type === 'promocion') {
    await existPromocion(item.id);
    const promoDetails = promotion.value;
    if (promoDetails && promoDetails.Productos) {
      for (const promoProduct of promoDetails.Productos) {
        const quantityToAdjust = cantidad * promoProduct.Cantidad;
        if (promoProduct.IdProducto) { // It's a direct product
          ajustarStockLocal(promoProduct.IdProducto, quantityToAdjust);
        } else if (promoProduct.IdPaquete) { // It's a package
          ajustarStockPaqueteLocal(promoProduct.IdPaquete, quantityToAdjust);
        }
      }
    }
  }
};

const validarCantidad = async () => {
  cantidadError.value = '';
  cantidadValida.value = false; // Default to false

  if (!cantidadItem.value || cantidadItem.value <= 0) {
    cantidadError.value = 'La cantidad debe ser mayor a cero.';
    return;
  }

  if (!selectedItem.value) {
    return;
  }

  // Lógica para productos
  if (selectedItemType.value === 'producto') {
    const maxQuantity = selectedItem.value.Productosucursal?.[0]?.Cantidad;
    if (typeof maxQuantity === 'number' && cantidadItem.value > maxQuantity) {
      cantidadError.value = `Stock disponible: ${maxQuantity}.`;
    } else {
      cantidadValida.value = true;
    }
  }
  // Lógica para paquetes
  else if (selectedItemType.value === 'paquete') {
    const maxQuantity = selectedItem.value.CantidadPaquete;
    if (typeof maxQuantity === 'number' && cantidadItem.value > maxQuantity) {
      cantidadError.value = `Stock de paquetes disponible: ${maxQuantity}.`;
      cantidadValida.value = false;
    } else {
      cantidadValida.value = true;
    }
  } else if (selectedItemType.value === 'promocion') {
    if (!selectedItem.value) {
        cantidadValida.value = false;
        return;
    }
    const stockCheck = await checkPromoStock(selectedItem.value, cantidadItem.value);
    if (!stockCheck.available) {
        cantidadError.value = stockCheck.message;
        cantidadValida.value = false;
    } else {
        cantidadError.value = '';
        cantidadValida.value = true;
    }
  }
};

const tienePqaquete = async(id)=> {
 if (!id) return;
    try {
      const response = await ObtenerPresentacion(id);
    presentacion.value = response;
    } catch (error) {
      console.error(`Error fetching price for present ${id}:`, error);
    }
}

const existPromocion = async(id)=> {
 if (!id) return;
    try {
      const response = await buscarPromocion(id);
    promotion.value = response;
    } catch (error) {
      console.error(`Error fetching price for ptomotion ${id}:`, error);
    }
}

const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const resetVenta = () => {
  venta.value = {
    IdVenta:'',
      Cliente: {},
      Usuario: {},
      idTipoVenta: 1,
      Monto: 0,
      Cambio: 0,
      MetodoPago: 1,
      detalles: {
        Producto: [],
        Promocion: [],
        Paquete: []
    }
  };
  montoRecibido.value = 0;
  deseleccionarCliente();
  deseleccionarItem();
  cantidadItem.value = 1;
  modoEdicion.value = false;
  ventaIdParaEditar.value = null;
}

const iniciarNuevaVenta = async () => {
 await  Listarproductos(filtroSucursal.value);
  await ListarPaquetes();
  modoEdicion.value = false;
  modoRegistro.value = true
  resetVenta()
}

const iniciarEdicionVenta = async (ventaParaEditar) => {
  // Asegurarse que todos los datos maestros están cargados
  console.log(ventaParaEditar)

  await Promise.all([
      Listarproductos(filtroSucursal.value),
      ListarPaquetes(),
      Listarpromocion(),
      ListarCLiente(),
  ]);

  resetVenta();
  modoEdicion.value = true;
  modoRegistro.value = true;
  venta.value.IdVenta = ventaParaEditar.IdVenta;

  // Asignar cliente
  if (ventaParaEditar.Persona) {
    venta.value.Cliente = cliente.value.find(c => c.IdPersona === ventaParaEditar.Persona.IdPersona) || {};
  }

  // Asignar tipo de venta (registro)
  if (ventaParaEditar.IdTipoVenta) {
    venta.value.idTipoVenta = ventaParaEditar.IdTipoVenta;
  }

  // Asignar sucursal (lugar)
  if (ventaParaEditar.IdSucursal) {
    filtroSucursal.value = ventaParaEditar.IdSucursal;
  }

  // Asignar método de pago
  try {
       await obtenetPago(ventaParaEditar.IdVenta);
      if (pagoVenta.value && pagoVenta.value) {
          venta.value.MetodoPago = pagoVenta.value[0].Metodopago;
          venta.value.IdPago = pagoVenta.value[0].IdPago;
              montoRecibido.value = pagoVenta.value[0].Monto || 0.00;
              cambio.value = pagoVenta.value[0].Cambio || 0.00;
          
      }
  } catch (error) {
      console.error("Error al cargar datos de pago para edición:", error);
  }

  // Mapear detalles de la venta
  const detallesPromises = ventaParaEditar.Detalleventa.map(async (detalle) => {
    let type, id, IdDetalleVenta, itemData, precioUnitario, nombre, Modo;

    if (detalle.Producto) {
      type = 'producto';
      IdDetalleVenta = detalle.IdDetalleVenta;
      id = detalle.Producto.IdProducto;
      itemData = products.value.find(p => p.IdProducto === id);
      Modo = detalle.Modo;
      nombre = itemData?.Nombre || detalle.Producto.Nombre || 'Producto Desconocido';
      await fetchPrecioProducto(id);
      precioUnitario = await getPrecioProducto(detalle.Producto, detalle.Modo === 1);
    } else if (detalle.Promocion) {
      type = 'promocion';
      IdDetalleVenta = detalle.IdDetalleVenta;
      id = detalle.Promocion.IdPromocion;
      itemData = promocion.value.find(p => p.IdPromocion === id);
      Modo = detalle.Modo
      nombre = itemData?.Nombre || detalle.Promocion.Nombre || 'Promoción Desconocida';
      precioUnitario = await getPrecioPromocion(detalle.Promocion);
    } else if (detalle.Paquete) {
      type = 'paquete';
      IdDetalleVenta = detalle.IdDetalleVenta;
      id = detalle.Paquete.IdPaquete;
      Modo = detalle.Modo
      itemData = paquete.value.find(p => p.IdPaquete === id);
      nombre = itemData?.Nombre || detalle.Paquete.Nombre || 'Paquete Desconocido';
      precioUnitario = getPrecioPaquete(detalle.Paquete, detalle.Modo === 1);
    }

    if (!type) return null;

    return {
      id: id,
      IdDetalleVenta:IdDetalleVenta,
      type: type,
      nombre: nombre,
      Modo:Modo,
      Cantidad: detalle.Cantidad,
      precioUnitario: precioUnitario,
      subtotal: detalle.Cantidad * precioUnitario,
      Modo: detalle.Modo || 0,
    };
  });

  const mappedDetalles = (await Promise.all(detallesPromises)).filter(Boolean); // filter(Boolean) removes nulls
  venta.value.detalles.Producto = mappedDetalles.filter(d => d.type === 'producto');
  venta.value.detalles.Promocion = mappedDetalles.filter(d => d.type === 'promocion');
  venta.value.detalles.Paquete = mappedDetalles.filter(d => d.type === 'paquete');
};


const cancelarVenta = async () => {
  // No ajustar stock al cancelar, se re-lista la data fresca
  modoRegistro.value = false
  resetVenta()
  await ListarCLiente();
  await ListarVenta(filtroSucursal.value, filtroFecha.value, filtroPago.value);
}

const deseleccionarCliente = () => {
  venta.value.Cliente = {}
  queryCliente.value = ''
}

const deseleccionarItem = () => {
  selectedItem.value = null;
  queryProducto.value = '';
};

const fetchPrecioProducto = async (id) => {
  if (!id) return;
  if (!pp.value[id]) {
    try {
      const response = await PrecioProducto(id);
      pp.value[id] = response;
    } catch (error) {
      console.error(`Error fetching price for product ${id}:`, error);
      pp.value[id] = { Precio: 0 }; // Cache failure
    }
  }
};

const actualizarPrecioItem = async (item) => {
    let precio = 0;
    if (item.type === 'producto') {
        precio = await getPrecioProducto({ IdProducto: item.id }, item.Modo === 1);
    } else if (item.type === 'paquete') {
        precio = await  getPrecioPaquete({ IdPaquete: item.id }, item.Modo === 1);
    } else {
        precio = item.precioUnitario; 
    }
    item.precioUnitario = precio;
    item.subtotal = Math.round((item.Cantidad * item.precioUnitario) * 10) / 10;
};

// Obtiene el precio de un producto específico
const getPrecioProducto = async (producto, usarMayor) => {
    if (!producto || !producto.IdProducto) return 0;
    await fetchPrecioProducto(producto.IdProducto);
    const priceInfo = pp.value[producto.IdProducto];
    if (!priceInfo) return 0;
    if (usarMayor && priceInfo.PrecioMayor > 0) {
        return Number(priceInfo.PrecioMayor);
    }
    return Number(priceInfo.Precio) || 0;
};

// Obtiene el precio de un paquete específico
const getPrecioPaquete = (paqueteItem, usarMayor) => {
    if (!paqueteItem) return 0;
    const pack = paquete.value.find(pk => pk.IdPaquete === paqueteItem.IdPaquete);
    if (!pack) return 0;
    if (usarMayor && pack.PrecioMayor > 0) {
        return Number(pack.PrecioMayor);
    }
    return Number(pack.PrecioVenta) || 0;
};

// Calcula el precio total de una promoción
const getPrecioPromocion = async (Promocion) => {
  if (!Promocion) return 0;

  const promo = promocion.value.find(pr => pr.IdPromocion === Promocion.IdPromocion);
  if (!promo) return 0;

  const precios = await Promise.all(
    promo.Promocionproducto.map(async (item) => {
      let precioUnitario = 0;

      if (item.Paquete) {
        // Obtener precio del paquete
        const packageDetails = await ObtenerPresentacion(item.Paquete.IdPaquete);
        // esto es lo que devuelve el metodo de ObtenerPresentacion 
//         {
//     "IdPaquete": "08172025PQ-1",
//     "Estado": 1,
//     "Nombre": "Bolsa de Cunape",
//     "Cantidad": 5,
//     "Precio": "5.00",
//     "Presentacion": "08152025PREN-5",
//     "Unidadmedida": 6,
//     "IdProducto": "08132025PROD-1"
// }
        if (!packageDetails?.Precio) return 0;
        precioUnitario = Number(packageDetails.Precio);
      } else if (item.Producto) {
        // Obtener precio normal del producto
        precioUnitario = await getPrecioProducto(item.Producto, false);
      }

      const descuento = (Number(item.Descuento) || 0) / 100;
      const precioConDescuento = precioUnitario * (1 - descuento);
    console.log(precioConDescuento * Number(item.Cantidad))
      return precioConDescuento * Number(item.Cantidad);
    })
  );

  // Sumar todos los precios calculados
  return precios.reduce((acc, val) => acc + val, 0);
};


// Método principal
const CalcularPrecio = async (Producto, Promocion, Paquete, usarMayor = false) => {
  if (Promocion?.IdPromocion) return await getPrecioPromocion(Promocion);
  if (Paquete?.IdPaquete) return await getPrecioPaquete(Paquete, usarMayor);
  if (Producto?.IdProducto) return await getPrecioProducto(Producto, usarMayor);
  return 0;
};
const CalcularTotal = (Detalleventa) => {
  let precio = 0;
  for (const detalle of Detalleventa) {
   const cantidad = Number(detalle.Cantidad) || 0;
    const unitario = Number(detalle.Precio) || 0;
    precio = Number(precio) + Number(redondearPrecio(cantidad * unitario));
  }
  return precio;
}

// const cargarPrecios = async (items) => {
//   const temp = {};
//   for (const item of items) {
//     const id = item.IdPromocion || item.IdProducto || item.IdPaquete;
//     temp[id] = {
//       normal: await CalcularPrecio(item, item, item, false),
//       mayor: await CalcularPrecio(item, item, item, true),
//     };
//   }
//   precios.value = temp;
// };

const agregarItemAVenta = async () => {
  await validarCantidad();
  if (!cantidadValida.value) {
    showToastMessage('Por favor, corrige los errores antes de agregar.');
    return;
  }

  if (!selectedItem.value || cantidadItem.value <= 0) {
    showToastMessage('Selecciona un ítem y una cantidad válida');
    return;
  }
  
  const item = selectedItem.value;
  let precio = 0;
  //precios[item.IdProducto || item.IdPromocion || item.IdPaquete] (precios[`${item.IdProducto || item.IdPaquete}-mayor`] || '')

  if (selectedItemType.value === 'producto') {
    precio = await getPrecioProducto(item, false); // Add with normal price by default
  } else if (selectedItemType.value === 'promocion') {
    // The getPrecioPromocion function already handles fetching prices for products and packages within the promotion.
    // No need to pre-fetch here.
    precio = await getPrecioPromocion(item);
  } else if (selectedItemType.value === 'paquete') {
    precio = getPrecioPaquete(item, false); // Add with normal price by default
  }

  const nuevoItem = {
    IdDetalleVenta: null, // New items won't have an IdDetalleVenta yet
    id: item.IdProducto || item.IdPromocion || item.IdPaquete,
    type: selectedItemType.value,
    nombre: item.Nombre,
    Cantidad: cantidadItem.value,
    precioUnitario: precio,
      subtotal: Math.round((cantidadItem.value * precio) * 10) / 10,
      Modo: 0, // Default to normal price (0)
  };

  switch (selectedItemType.value) {
    case 'producto':
      venta.value.detalles.Producto.push(nuevoItem);
      break;
    case 'promocion':
      venta.value.detalles.Promocion.push(nuevoItem);
      break;
    case 'paquete':
      venta.value.detalles.Paquete.push(nuevoItem);
      break;
  }

  await ajustarStockPorItem(nuevoItem, -nuevoItem.Cantidad);

  deseleccionarItem();
  cantidadItem.value = 1;
  validarCantidad();
  showToastMessage('Ítem agregado a la venta');
};

const agregarProductoDesdeCard = async (producto) => {
  // Check if product is already in the cart
  const itemExistente = itemsEnVenta.value.find(i => i.id === producto.IdProducto && i.type === 'producto');
  if (itemExistente) {
    showToastMessage('El producto ya está en la venta. Puede ajustar la cantidad en el resumen.');
    return;
  }

  // Check stock
  const stockDisponible = producto.Productosucursal?.[0]?.Cantidad || 0;
  if (stockDisponible < 1) {
    showToastMessage('Este producto no tiene stock disponible.');
    return;
  }

  const precio = await getPrecioProducto(producto, false); // false for normal price

  const nuevoItem = {
    IdDetalleVenta: null,
    id: producto.IdProducto,
    type: 'producto',
    nombre: producto.Nombre,
    Cantidad: 1, // Add one unit by default
    precioUnitario: precio,
    subtotal: Math.round(precio * 10) / 10,
    Modo: 0, // Default to normal price
  };

  venta.value.detalles.Producto.push(nuevoItem);
  await ajustarStockPorItem(nuevoItem, -1); // Decrement stock by 1

  showToastMessage(`${producto.Nombre} agregado a la venta.`);
};

const agregarPromocionDesdeCard = async (promo) => {
  const itemExistente = itemsEnVenta.value.find(i => i.id === promo.IdPromocion && i.type === 'promocion');
  if (itemExistente) {
    showToastMessage('La promoción ya está en la venta.');
    return;
  }

  const stockCheck = await checkPromoStock(promo, 1); // Check for 1 unit
  if (!stockCheck.available) {
    showToastMessage(stockCheck.message);
    return;
  }

  const precio = await getPrecioPromocion(promo);

  const nuevoItem = {
    IdDetalleVenta: null,
    id: promo.IdPromocion,
    type: 'promocion',
    nombre: promo.Nombre,
    Cantidad: 1,
    precioUnitario: precio,
    subtotal: Math.round(precio * 10) / 10,
    Modo: 0,
  };

  venta.value.detalles.Promocion.push(nuevoItem);
  await ajustarStockPorItem(nuevoItem, -1);
  showToastMessage(`${promo.Nombre} agregada a la venta.`);
};

const agregarPaqueteDesdeCard = async (pack) => {
  const itemExistente = itemsEnVenta.value.find(i => i.id === pack.IdPaquete && i.type === 'paquete');
  if (itemExistente) {
    showToastMessage('El paquete ya está en la venta.');
    return;
  }

  const stockDisponible = pack.CantidadPaquete || 0;
  if (stockDisponible < 1) {
    showToastMessage('Este paquete no tiene stock disponible.');
    return;
  }

  const precio = getPrecioPaquete(pack, false);

  const nuevoItem = {
    IdDetalleVenta: null,
    id: pack.IdPaquete,
    type: 'paquete',
    nombre: pack.Nombre,
    Cantidad: 1,
    precioUnitario: precio,
    subtotal: Math.round(precio * 10) / 10,
    Modo: 0,
  };

  venta.value.detalles.Paquete.push(nuevoItem);
  await ajustarStockPorItem(nuevoItem, -1);
  showToastMessage(`${pack.Nombre} agregado a la venta.`);
};

const eliminarItemDeVenta = async (itemToRemove, pos) => {
  const detalles = venta.value.detalles;
  const lenProductos = detalles.Producto.length;
  const lenPromociones = detalles.Promocion.length;

  if (pos < lenProductos) {
    detalles.Producto.splice(pos, 1);
  } else if (pos < lenProductos + lenPromociones) {
    detalles.Promocion.splice(pos - lenProductos, 1);
  } else {
    detalles.Paquete.splice(pos - lenProductos - lenPromociones, 1);
  }

  await ajustarStockPorItem(itemToRemove, itemToRemove.Cantidad);
  showToastMessage('Ítem eliminado de la venta');
  validarCantidad(); // Re-validate after item removal
}

 const incrementarCantidad = async (item) => {
  const cantidadAjuste = 1;
  let puedeAjustar = false;

  if (item.type === 'producto') {
    const productoOriginal = products.value.find(p => p.IdProducto === item.id);
    if (productoOriginal && productoOriginal.Productosucursal?.[0]?.Cantidad >= cantidadAjuste) {
      puedeAjustar = true;
    }
  } else if (item.type === 'paquete') {
    const pack = paquete.value.find(p => p.IdPaquete === item.id);
    if (pack && pack.CantidadPaquete >= cantidadAjuste) {
      puedeAjustar = true;
    }
  } else if (item.type === 'promocion') {
    await existPromocion(item.id);
    const promoDetails = promotion.value;
    let canIncrement = true; // Assume true initially

    if (promoDetails && promoDetails.Productos) {
        for (const promoProduct of promoDetails.Productos) {
            const requiredQty = promoProduct.Cantidad * cantidadAjuste; // quantity needed for this increment

            if (promoProduct.IdProducto) {
                const productInStock = products.value.find(p => p.IdProducto === promoProduct.IdProducto);
                if (!productInStock || !productInStock.Productosucursal || productInStock.Productosucursal[0].Cantidad < requiredQty) {
                    canIncrement = false;
                    break;
                }
            } else if (promoProduct.IdPaquete) {
                const packageInStock = paquete.value.find(p => p.IdPaquete === promoProduct.IdPaquete);
                if (!packageInStock || packageInStock.CantidadPaquete < requiredQty) {
                    canIncrement = false;
                    break;
                }
            }
        }
    } else {
        canIncrement = false; // No details, can't increment
    }

    if (canIncrement) {
        puedeAjustar = true;
    }
  }

  if (puedeAjustar) {
    await ajustarStockPorItem(item, -cantidadAjuste);
    item.Cantidad++;
    item.subtotal = Math.round((item.Cantidad * item.precioUnitario) * 10) / 10;
    if (selectedItem.value && selectedItem.value.id === item.id) {
      validarCantidad();
    }
  } else {
    showToastMessage(`No hay más stock disponible para ${item.nombre}`);
  }
};

const decrementarCantidad = async (item) => {
  if (item.Cantidad > 1) {
    await ajustarStockPorItem(item, 1);
    item.Cantidad--;
    item.subtotal = Math.round((item.Cantidad * item.precioUnitario) * 10) / 10;
  }
};

const handleCantidadChange = async (item, event) => {
    const oldCantidad = item.Cantidad;
    const newCantidad = parseInt(event.target.value, 10);

    if (isNaN(newCantidad) || newCantidad < 1) {
        event.target.value = oldCantidad; // revert visually
        showToastMessage('La cantidad debe ser un número positivo.');
        return;
    }

    const diferencia = newCantidad - oldCantidad;
    if (diferencia === 0) return;

    if (diferencia < 0) {
        await ajustarStockPorItem(item, -diferencia);
        item.Cantidad = newCantidad;
        item.subtotal = Math.round((newCantidad * item.precioUnitario) * 10) / 10;
        return;
    }

    // Check stock logic...
    let puedeAjustar = false;
    let stockMessage = `No hay suficiente stock para ${item.nombre}.`;

    if (item.type === 'producto') {
        const productoOriginal = products.value.find(p => p.IdProducto === item.id);
        if (productoOriginal && productoOriginal.Productosucursal?.[0]?.Cantidad >= diferencia) {
            puedeAjustar = true;
        } else {
            const stockDisponible = productoOriginal.Productosucursal?.[0]?.Cantidad || 0;
            stockMessage = `Solo puedes agregar ${stockDisponible} más. Stock restante: ${stockDisponible}.`;
        }
    } else if (item.type === 'paquete') {
        const pack = paquete.value.find(p => p.IdPaquete === item.id);
        if (pack && pack.CantidadPaquete >= diferencia) {
            puedeAjustar = true;
        } else {
            const stockDisponible = pack ? pack.CantidadPaquete : 0;
            stockMessage = `Solo puedes agregar ${stockDisponible} más. Stock restante: ${stockDisponible}.`;
        }
    } else if (item.type === 'promocion') {
        await existPromocion(item.id);
        const promoDetails = promotion.value;
        let canAdjust = true;
        let limitingItemName = '';

        if (promoDetails && promoDetails.Productos) {
            for (const promoProduct of promoDetails.Productos) {
                const requiredQty = promoProduct.Cantidad * diferencia;

                if (promoProduct.IdProducto) {
                    const productInStock = products.value.find(p => p.IdProducto === promoProduct.IdProducto);
                    if (!productInStock || !productInStock.Productosucursal || productInStock.Productosucursal[0].Cantidad < requiredQty) {
                        canAdjust = false;
                        limitingItemName = productInStock?.Nombre || 'un producto';
                        const availableFor = Math.floor((productInStock?.Productosucursal[0].Cantidad || 0) / promoProduct.Cantidad);
                        stockMessage = `Stock insuficiente de ${limitingItemName}. Solo puedes agregar ${availableFor} promocion(es) más.`;
                        break;
                    }
                } else if (promoProduct.IdPaquete) {
                    const packageInStock = paquete.value.find(p => p.IdPaquete === promoProduct.IdPaquete);
                    if (!packageInStock || packageInStock.CantidadPaquete < requiredQty) {
                        canAdjust = false;
                        limitingItemName = packageInStock?.Nombre || 'un paquete';
                        const availableFor = Math.floor((packageInStock?.CantidadPaquete || 0) / promoProduct.Cantidad);
                        stockMessage = `Stock insuficiente de ${limitingItemName}. Solo puedes agregar ${availableFor} promocion(es) más.`;
                        break;
                    }
                }
            }
        } else {
            canAdjust = false;
            stockMessage = 'No se pudieron obtener los detalles de la promoción.';
        }

        if (canAdjust) {
            puedeAjustar = true;
        }
    }

    if (puedeAjustar) {
        await ajustarStockPorItem(item, -diferencia);
        item.Cantidad = newCantidad;
        item.subtotal = Math.round((newCantidad * item.precioUnitario) * 10) / 10;
    } else {
        showToastMessage(stockMessage);
        event.target.value = oldCantidad; // revert visually
    }
};

const transformToPackage = (productItem, packageInfo) => {
  const pres = packageInfo.presentacion;
  if (!pres || !pres.Cantidad || pres.Cantidad <= 0) {
    showToastMessage('Error: No se pudo obtener la información del paquete.');
    return;
  }

  const numPackagesToCreate = Math.floor(productItem.Cantidad / pres.Cantidad);
  const remainingProductQty = productItem.Cantidad % pres.Cantidad;

  const prodIndex = venta.value.detalles.Producto.findIndex(p => p.id === productItem.id);
  if (prodIndex === -1) return;

  if (remainingProductQty > 0) {
    venta.value.detalles.Producto[prodIndex].Cantidad = remainingProductQty;
    venta.value.detalles.Producto[prodIndex].subtotal = Math.round((remainingProductQty * venta.value.detalles.Producto[prodIndex].precioUnitario) * 10) / 10;
  } else {
    venta.value.detalles.Producto.splice(prodIndex, 1);
  }

  const existingPackageItem = venta.value.detalles.Paquete.find(i => i.id === packageInfo.IdPaquete);

  if (existingPackageItem) {
    existingPackageItem.Cantidad += numPackagesToCreate;
    existingPackageItem.subtotal = Math.round((existingPackageItem.Cantidad * existingPackageItem.precioUnitario) * 10) / 10;
  } else {
    const precioPaquete = getPrecioPaquete(packageInfo, false);
    const newPackageItem = {
      id: packageInfo.IdPaquete,
      type: 'paquete',
      nombre: packageInfo.Nombre,
      Cantidad: numPackagesToCreate,
      precioUnitario: precioPaquete,
      subtotal: Math.round((numPackagesToCreate * precioPaquete) * 10) / 10,
      Modo: 0,
    };
    venta.value.detalles.Paquete.push(newPackageItem);
  }

  showToastMessage(`'${productItem.nombre}' convertido a '${packageInfo.Nombre}'.`);
};

const registrarVenta = async () => {
  // if (modoEdicion.value) {
  //   // Lógica para actualizar la venta
  //   showToastMessage(`Venta #${ventaIdParaEditar.value} actualizada con éxito (simulado).`);
  //   await cancelarVenta();
  //   return;
  // }

  // Lógica para registrar nueva venta
  if (venta.value.MetodoPago === 1 && montoRecibido.value < subtotalVenta.value) {
    showToastMessage('El monto recibido debe ser mayor o igual al total')
    return
  }
  venta.value.Monto = subtotalVenta.value;
   console.log(venta.value)
  try{
    const nuevaVenta = {
    id:venta.value.IdVenta,
    IdCliente: venta?.value?.Cliente?.IdPersona,
    Nombre : nuevoCliente?.value?.Nombre,
    ApellidoPaterno: nuevoCliente?.value?.ApellidoPaterno,
    ApellidoMaterno: nuevoCliente?.value?.ApellidoMaterno,
    IdGenero:nuevoCliente?.value?.IdGenero,
    email: nuevoCliente?.value?.Email ,
    Celulares : nuevoCliente.value?.Telefono,
    Documento : nuevoCliente.value?.Documento,
    IdUsuario:'USR-1',
    IdSucursal:filtroSucursal.value,
    IdPago:venta.value?.IdPago,
    IdMetodoPago: venta.value.MetodoPago,
    Monto:venta.value.MetodoPago ===1?   (montoRecibido.value):(venta.value.Monto).toFixed(2),
    Cambio: (cambio.value).toFixed(2),
    detalles: venta.value.detalles
  }
   console.log(nuevaVenta)
  let response = null;
  if(!modoEdicion.value)
   response = await RegistrarVenta(nuevaVenta);
  else
   response = await updateVenta(nuevaVenta);   
  await ListarVenta(filtroSucursal.value, filtroFecha.value, filtroPago.value)
  showToastMessage(response.message)
  alertStore.fetchAlerts();
  cancelarVenta()
  } catch(error){
     console.error('Error al guardar la venta:', error);
  }
}
const pagoVenta = ref([]);

const cargandoPago = ref(false);

const obtenetPago = async (ventaId) => {
  try {
    const response = await listarPagoVenta(ventaId);
    pagoVenta.value = response;
  } catch (error) {
    console.error('Error al cargar el pago de la venta:', error);
  } 
    cargandoPago.value = true;
  
};

const buscarProductoGlobal = async () => {
  if (!terminoBusquedaProducto.value.trim()) {
    showToastMessage('Ingresa un término de búsqueda')
    return
  }

  const resultados = BuscraProducto.value.filter(producto =>
    producto.Nombre.toLowerCase().includes(terminoBusquedaProducto.value.toLowerCase())
  )

  for (const producto of resultados) {
      await fetchPrecioProducto(producto.IdProducto);
  }

  productosEncontrados.value = resultados;
  mostrarModalBusqueda.value = true
}

const cerrarModalBusqueda = () => {
  mostrarModalBusqueda.value = false
  productosEncontrados.value = []
}

const abrirModalAnulacion = (ventaId) => {
  ventaParaAnular.value = ventaId
  mostrarModalAnulacion.value = true
}

const cerrarModalAnulacion = () => {
  mostrarModalAnulacion.value = false
  ventaParaAnular.value = null
}

const confirmarAnulacion = async () => {
try{
  const response = await anularVenta(ventaParaAnular.value,'SUC-1')
  cerrarModalAnulacion();
  await ListarVenta(filtroSucursal.value, filtroFecha.value, filtroPago.value)
  showToastMessage(response.message)
}catch(error){
 console.error('Error al anular la venta:', error);
}
  
}

const cerrarModalDatosCliente = () => {
  mostrarModalDatosCliente.value = false;
  ventaSeleccionadaParaComprobante.value = null;
  clienteParaComprobante.value = null;
   nuevoCliente.value = {
  Nombre: '',
  ApellidoPaterno: '',
  ApellidoMaterno: '',
  Email: '',
  Telefono: [ { Numero:'' } ],
   IdGenero: 1 ,
      Documento: [
        { 
          IdDocumento: '',
          Documento: '',
        IdComplemento: 'C-1',
          IdTipoDocumento: 2 
        },
        {
          IdDocumento: '',
          Documento: '',
          Complemento: null,
         IdTipoDocumento: 1 
        }
      ],
};
  queryClienteComprobante.value = '';
};
const guardarFactura = async (comprobante) => {
  let response;
  try {
 
     response = await createFactura(comprobante); 
     console.log(response);
  }   catch (error) {
    console.error('Error al guardar la compra:', error);
    showToastMessage('Error al guardar la compra', 'error');
  }
  return response;
};
const AgregarCliente = async (comprobante) => {
  let response;
  try {
     response = await agregarClienteVenta(comprobante); 
   
  }   catch (error) {
    console.error('Error al guardar la compra:', error);
    showToastMessage('Error al guardar la compra', 'error');
  }
};
const obtenerFactura = async (id) => {
  let response;
  try {
    console.log(id);
     response = await ObtenerFactura(id); 
     console.log(response);
  }   catch (error) {
    console.error('Error al guardar la compra:', error);
    showToastMessage('Error al guardar la compra', 'error');
  }
  return response;
};


const generarComprobanteFinal = async () => {
  const venta = ventaSeleccionadaParaComprobante.value;
  if (!venta) return;

  // Ensure there's a client selected or entered
  if (!nuevoCliente.value || !nuevoCliente.value.Nombre) {
    showToastMessage('Por favor, ingrese al menos el nombre del cliente.');
    return;
  }
   
  const ventaCopia = JSON.parse(JSON.stringify(venta));
  const comprobante = {
    IdVenta: ventaCopia.IdVenta,
  }
 const response = await guardarFactura(comprobante)
  
  
  const cliente = {
    IdCliente: nuevoCliente?.value?.IdPersona,
    IdVenta : ventaCopia.IdVenta,
    Nombre : nuevoCliente?.value?.Nombre,
    ApellidoPaterno: nuevoCliente?.value?.ApellidoPaterno,
    ApellidoMaterno: nuevoCliente?.value?.ApellidoMaterno,
    IdGenero:nuevoCliente?.value?.IdGenero,
    email: nuevoCliente?.value?.Email,
    Celulares : nuevoCliente.value?.Telefono,
    Documento : nuevoCliente.value?.Documento,
  }
    
   await AgregarCliente(cliente);

  ventaCopia.Persona = nuevoCliente.value;

  ventaCopia.Detalleventa.forEach(item => {
    item.precioCalculado = CalcularPrecio(item.Producto, item.Promocion, item.Paquete);
  });
  console.log(response)
  ventaCopia.IdFactura = response.nuevaFactura.IdFactura; 
  ventaCopia.NroFactura = response.nuevaFactura.NroFactura; 
  ventaCopia.FechaVenta = response.nuevaFactura.FechaEmicion;
  ventaCopia.HorsEmicion = response.nuevaFactura.HorsEmicion;
  console.log(ventaCopia.NroFactura)

  ventaParaComprobante.value = ventaCopia;
  console.log(ventaParaComprobante.value)
  cerrarModalDatosCliente(); 
  mostrarModalComprobante.value = true;    
};

const abrirComprobante = async () =>{
   const venta = ventaSeleccionadaParaComprobante.value;
  if (!venta) return;

  // Ensure there's a client selected or entered
  if (!nuevoCliente.value || !nuevoCliente.value.Nombre) {
    showToastMessage('Por favor, ingrese al menos el nombre del cliente.');
    return;
  }
   
  const ventaCopia = JSON.parse(JSON.stringify(venta));
 
  ventaCopia.Persona = datosClienteManual.value;

  ventaCopia.Detalleventa.forEach(item => {
    item.precioCalculado = CalcularPrecio(item.Producto, item.Promocion, item.Paquete);
  });
  ventaCopia.IdFactura = TieneFactura.value[ventaCopia.IdVenta].IdFactura; 
  ventaCopia.NroFactura = TieneFactura.value[ventaCopia.IdVenta].NroFactura; 

  ventaParaComprobante.value = ventaCopia;


  mostrarModalComprobante.value = true;
}


const buscarPaquete = async (id) => {
  let salida = null;
  try {
    const response = await ObtenerPaqueteSucursal(filtroSucursal.value,id);
    if (response) {
      salida = response; // Aquí asumo que response ya trae un objeto con el paquete
    }
  } catch (error) {
    console.log('Error en buscarPaquete:', error);
  }
  return salida;
};

const abrirModalComprobante = async (venta) => {
  ventaSeleccionadaParaComprobante.value = venta;

  // Check if an invoice number exists for this sale
  const comprobanteExistente = TieneFactura.value[venta.IdVenta]?.Factura;

  if (comprobanteExistente?.NroFactura) {
    // If an invoice number exists, but no external link, open the internal Factura modal
    if (!comprobanteExistente?.Enlace?.Enlace) {
      // Set the necessary data for the Factura component
      const ventaCopia = JSON.parse(JSON.stringify(venta));
      ventaCopia.IdFactura = comprobanteExistente.IdFactura;
      ventaCopia.NroFactura = comprobanteExistente.NroFactura;
      ventaCopia.FechaVenta = comprobanteExistente.FechaEmicion;
      ventaCopia.HorsEmicion = comprobanteExistente.HorsEmicion;
      ventaParaComprobante.value = ventaCopia;
      mostrarModalComprobante.value = true;
      return; // Exit the function after opening the Factura modal
    }
    // If an invoice number and external link exist, open the external link
    else {
      window.open(comprobanteExistente.Enlace.Enlace, '_blank');
      return; // Exit the function after opening the external link
    }
  }
  
  // If no invoice number exists, proceed with showing the client data modal
  if (venta.Persona && venta.Persona.IdPersona) {
      const clienteEncontrado = cliente.value.find(c => c.IdPersona === venta.Persona.IdPersona);
   
    clienteParaComprobante.value = clienteEncontrado;
        nuevoCliente.value.IdPersona = clienteEncontrado?.IdPersona || "";
    nuevoCliente.value.Nombre = clienteEncontrado?.Nombre || "";
    nuevoCliente.value.ApellidoPaterno =clienteEncontrado?.ApellidoPaterno || "";
    nuevoCliente.value.ApellidoMaterno = clienteEncontrado?.ApellidoMaterno || "";
    nuevoCliente.value.FechaDeNacimiento = clienteEncontrado?.FechaDeNacimiento || null;
    nuevoCliente.value.Email =clienteEncontrado?.Email?.Email || "";
    nuevoCliente.value.IdGenero = clienteEncontrado?.Genero?.IdGenero;
    nuevoCliente.value.Telefono = clienteEncontrado?.Celulares; // Handle multiple phones
    nuevoCliente.value.Documento = [
  { IdDocumento: null, Documento: '',  IdComplemento: 'C-1' , IdTipoDocumento: 2  }, // CI
  { IdDocumento: null, Documento: '', IdComplemento: null,  IdTipoDocumento: 1  } // Otro documento (ej. NIT)
];
  if (clienteEncontrado?.Documento?.length > 0) {
  for (const doc of clienteEncontrado.Documento) {
    const tipo = doc.Tipodocumento?.IdTipoDocumento;
    if (tipo === '2') { // CI
      nuevoCliente.value.Documento[0] = {
        IdDocumento: doc.IdDocumento,
        Documento: doc.Documento,
        IdComplemento:  doc.Complemento.IdComplemento,
        IdTipoDocumento: tipo 
      };
    } else { // Otro documento
      nuevoCliente.value.Documento[1] = {
        IdDocumento: doc.IdDocumento,
        Documento: doc.Documento,
        IdComplemento: null,
        IdTipoDocumento: tipo 
      };
    }
  }
} 
  } else {
    // Otherwise, prepare empty objects for the new client form.
    clienteParaComprobante.value = null;
    datosClienteManual.value = {
      Nombre: '',
      ApellidoPaterno: '',
      ApellidoMaterno: '',
      CI: ''
    };
  } 
  
  mostrarModalDatosCliente.value = true;
};

const cerrarModalComprobante = () => {
  mostrarModalComprobante.value = false
  ventaParaComprobante.value = null
}

const Listarproductos = async (id) => {
  try {
    const response = await listarProductosSucursal(id,filtroCategoria.value,filtroSubcategoria.value);
    products.value = response;
    for(const prod of products.value)
    await fetchPrecioProducto(prod.IdProducto);
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
};
const ListarVenta = async (id, Fecha, pago) => {
  try {
  
      const response = await listarVentaSucursal(id, Fecha, pago);
    const loadedVentas = response || [];
    console.log(loadedVentas)
    // Pre-calculate prices and subtotals for each detail item
    for (const venta of loadedVentas) {
    TieneFactura.value[venta.IdVenta] = await obtenerFactura(venta.IdVenta);
    console.log(TieneFactura.value[venta.IdVenta])  
  }
    ventas.value = loadedVentas;

    
  } catch (error) {
    console.error('Error al cargar ventas:', error);
    ventas.value = [];
  }
};
const ListarComplemento = async () => {
  try {
    const response = await listarComplemento();
    complementos.value = response;
  } catch (error) {
    console.error('Error al cargar paquetes y sus presentaciones:', error);
  }
};

const ListarPaquetes = async () => {
  try {
    const response = await listarPaquete(filtroSucursal.value);
    paquete.value = response;
  } catch (error) {
    console.error('Error al cargar paquetes y sus presentaciones:', error);
  }
};
const Listarpromocion = async () => {
  try {
    const response = await listarPromocionactiva();
    promocion.value = response;
  } catch (error) {
    console.error('Error al cargar promociones:', error);
  }
};

const ListarCLiente = async () => {
  try {
    const response = await listarCliente();
    cliente.value = response;
    console.log(cliente.value)
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
};
const ListarPago = async () => {
  try {
    const response = await listarPago();
    pago.value = response;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
};
const ListarSucursal = async () => {
  try {
    const response = await listarSucursales();
    sucursales.value = [{IdSucursal: 'TODOS', Nombre: 'Todas las Tiendas'},...response];
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const ListasProductoBuscar = async () => {
  try {
    const response = await listarBuscarProductos();
    BuscraProducto.value = response;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};

const ListarMetodo = async () => {
  try {
    const response = await listarMetodo();
     metodo.value = [{IdMetodoPago:  0 , Nombre: 'Todos'},...response];
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
};
const usuario = ref([])
const obtenerSucursal = async (id) =>{
   try {
    const response = await SucursalUsuario(id);
    usuario.value = response;
    if(usuario.value.usuario?.Usuariosucursal.length > 0){
      TIeneSucursal.value = true;
      filtroSucursal.value = usuario.value.usuario.Usuariosucursal[0].Sucursal.IdSucursal;
       
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
}



onMounted(async () => {
  await ListarSucursal();
     const usuarioStr = localStorage.getItem('usuario');
   if (usuarioStr) {
    const usuarios = JSON.parse(usuarioStr); 
    obtenerSucursal(usuarios.IdUsuario); 
  } 
  await Promise.all([
    ListarPaquetes(),
    ListarCategoriasPrincipales(),
    Listarpromocion(),
    ListarCLiente(),
    ListarPago(),
    ListasProductoBuscar(),
    ListarComplemento(),
    ListarMetodo(),
    ListarVenta(filtroSucursal.value, filtroFecha.value, filtroPago.value),
    Listarproductos(filtroSucursal.value)
  ]);
});
</script>



<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fdba74, #f97316);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {

  background: linear-gradient(to bottom, #f97316, #ea580c);
}
</style>