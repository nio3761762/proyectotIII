<template>
  <div class="min-h-screen ">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- VISTA PRINCIPAL (HISTORIAL) -->
    <div v-if="!modoRegistro">
      <!-- Header -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <ShoppingCart class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Gestión de Reservas
              </h1>
              <p class="text-gray-600 text-sm">Administra las reservas y transacciones</p>
            </div>
          </div>    
          
          <div class="hidden md:flex items-center gap-3">
            <button 
              @click="iniciarNuevaReserva" 
              class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span class="font-semibold">Nueva Reserva</span>
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
      <!-- <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="md:hidden mb-6 space-y-3">
          <button 
            @click="iniciarNuevaReserva" 
            class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Plus class="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span class="font-semibold">Nueva Reserva</span>
          </button>
          
          <button 
            class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <FileText class="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span class="font-semibold">Generar Reporte</span>
          </button>
        </div>

        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
          <h3 class="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
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
                class="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400"
              />
            </div>
            <button 
              @click="buscarProductoGlobal" 
              class="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-pink-600 hover:to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <Search class="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span class="font-semibold hidden sm:inline">Buscar</span>
            </button>
          </div>
        </div>
      </div> -->

      <!-- Historial de Reservas -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <History class="h-6 w-6 text-orange-500" />
          Historial de Reservas
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
              <option value="TODOS">Todos</option>
              <option v-for="sucursal in sucursales" :key="sucursal" :value="sucursal.IdSucursal">{{ sucursal.Nombre }}</option>
            </select>
          </div>
            <div class="flex flex-col">
            <label class="text-sm font-semibold text-gray-700 mb-1">Metodo de Pago</label>
            <select
              v-model="filtroPago"
              class="border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:border-orange-500 focus:ring-orange-500/20 outline-none transition-colors"
            >
              <option value="0">Todos</option>
              <option v-for="pago in metodo" :key="pago.IdMetodoPago" :value="pago.IdMetodoPago">
                {{ pago.Nombre }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="reservas.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart class="h-12 w-12 text-orange-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4">No hay reservas registradas</h3>
          <p class="text-gray-600 mb-6">Comienza registrando tu primera reserva.</p>
          <button 
            @click="iniciarNuevaReserva"
            class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
          >
            <Plus class="h-5 w-5" />
            <span class="font-semibold">Registrar Primera Reserva</span>
          </button>
        </div>

     
      </div>
         <div v-if="reservas.length > 0" class="space-y-6 mt-8">
          <!-- Desktop View -->
          <div class="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            <div
              v-for="reserva in reservasPaginadas"
              :key="reserva.IdPedido"
              :class="[
                'group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]',
                reserva.IdPedido === ubicarPedido
                  ? 'border-orange-500 border-2 shadow-2xl ring-4 ring-orange-500/20'
                  : 'border-white/50'
              ]"
              @click="limpiarUbicarPedido"
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
                        Reserva #{{ reserva.IdPedido.substring(reserva.IdPedido.length - 4) }}
                      </h3>
                      <p class="text-gray-600 text-sm">{{ reserva.Venta?.Persona?.Nombre || 'Sin Cliente'}} {{ reserva.Venta?.Persona?.ApellidoPaterno }}</p>
                    </div>
                  </div>

                  <span
                    :class="[
                      'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
                      estadoClase(reserva.Estado.Nombre)
                    ]"
                  >
                    {{ reserva.Estado.Nombre }}
                  </span>
                </div>

                <!-- Reserva Details Preview -->
                <div class="mb-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
                  <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-gray-700">Información Clave</span>
                      <button
                        @click="toggleDetallesReserva(reserva)"
                        class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors"
                      >
                        {{ reservaExpandida === reserva.IdPedido ? 'Ocultar' : 'Ver más' }}
                        <ChevronDown v-if="reservaExpandida !== reserva.IdPedido" class="h-4 w-4" />
                        <ChevronUp v-else class="h-4 w-4" />
                      </button>
                  </div>
                  <div class="space-y-2">
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar class="h-4 w-4 text-orange-500" />
                        <span>{{ new Date(reserva.FechaRegistro + 'T00:00:00').toLocaleDateString() }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign class="h-4 w-4 text-green-500" />
                        <span class="font-bold text-green-600">Bs. {{ CalcularTotal(reserva.Detallepedido)}}</span>
                      </div>
                      <!-- v <div class="flex items-center gap-2 text-sm text-gray-600">
                        <Receipt class="h-4 w-4 text-blue-500" />
                        <span>Factura: {{ reserva.Venta?.IdVenta || 'Sin Factura' }}</span>
                      </div> -->
                  </div>
                </div>

                <!-- Expanded Details -->
                <div v-if="reservaExpandida === reserva.IdPedido" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
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
                          <tr v-for="item in reserva.Detallepedido" :key="item.IdDetallePedido" class="border-b border-gray-100 hover:bg-white/50">
                            <td class="py-2 px-2">
                              <span :class="[
                                'px-2 py-1 rounded-lg text-xs font-semibold',
                                item.Producto  ? 'bg-blue-100 text-blue-700' :
                                item.Promocion  ? 'bg-purple-100 text-purple-700' :
                                'bg-green-100 text-green-700'
                              ]">
                                {{  item.Producto ? 'Prod.' :  item.Promocion ? 'Promo.' : 'Paq.' }}
                              </span>
                            </td>
                            <td class="py-2 px-2 font-medium text-gray-800">{{ item.Producto?.Nombre || item.Promocion?.Nombre || item.Paquete?.Nombre}}</td>
                            <td class="py-2 px-2 text-center font-medium">{{ item.Cantidad }}</td>
                            <td class="py-2 px-2 text-center font-bold text-green-600">{{  (item.Precio * item.Cantidad).toFixed(2) }} Bs. </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div v-if="pagoVenta && pagoVenta.length > 0" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                    <div class="font-semibold text-gray-800 mb-2 text-sm">Información de Pago</div>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <CreditCard class="h-3 w-3 text-blue-500" />
                        <span>Método: {{ pagoVenta[0]?.Nombre || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <DollarSign class="h-3 w-3 text-green-500" />
                        <span>Monto Pagado: Bs. {{ pagoVenta[0]?.Monto || '0.00' }}</span>
                      </div>
                      <div v-if="pagoVenta[0]?.Metodopago === 1" class="flex items-center gap-2 text-xs text-gray-600">
                        <Coins class="h-3 w-3 text-purple-500" />
                        <span>Cambio: Bs. {{ pagoVenta[0]?.Cambio || '0.00' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 mt-4">
                  <button 
                      v-if="reserva.Estado.Nombre !== 'Anulado' && reserva.Estado.Nombre !== 'Enviado' && reserva.Estado.Nombre !== 'Completado'"
                      @click="iniciarEdicionReserva(reserva)"
                      class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Pencil class="h-4 w-4" />
                    Editar
                  </button>
                  
                
                  <!-- <button 
                      v-if="(reserva.Estado.Nombre === 'Listo'  || reserva.Estado.Nombre === 'Enviado') && reserva.Estado.Nombre !== 'Completado'"
                      @click="abrirModalCompletarPago(reserva)" 
                      class=" bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <CreditCard class="h-4 w-4" />
                    Pagar
                  </button> -->
                  <button 
                      v-if="!['anulado', 'pagado','completado'].includes(reserva.Estado.Nombre.toLowerCase().trim())"
                      @click="abrirModalEstado(reserva)" 
                      class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Truck class="h-4 w-4" />
                  </button>
                  <button @click="VerEntrega(reserva.IdPedido)" class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center">
                    <MapPin class="h-4 w-4" />
                  </button>
                    <button
                    v-if="reserva.Estado.Nombre.toLowerCase().trim() !== 'anulado' && reserva.Estado.Nombre !== 'Completado'"
                    @click="abrirModalAnulacion(reserva.IdPedido)"
                    class=" bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile View -->
          <!-- Mobile View -->
          <div class="block md:hidden space-y-4">
            <div
              v-for="reserva in reservasPaginadas"
              :key="reserva.IdPedido"
              :class="[
                'bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border overflow-hidden',
                reserva.IdPedido === ubicarPedido 
                  ? 'border-orange-500 border-2 shadow-2xl ring-4 ring-orange-500/20' 
                  : 'border-white/50'
              ]"
              @click="limpiarUbicarPedido"
            >
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                      <ShoppingCart class="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-gray-800">Reserva #{{ reserva.IdPedido.substring(reserva.IdPedido.length - 4) }}</h3>
                      <p class="text-gray-600 text-sm">{{ reserva.Venta?.Persona?.Nombre || 'Sin Cliente' }} {{ reserva.Venta?.Persona?.ApellidoPaterno }}</p>
                    </div>
                  </div>

                  <span
                    :class="[
                      'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
                      estadoClase(reserva.Estado.Nombre)
                    ]"
                  >
                    {{ reserva.Estado.Nombre }}
                  </span>
                </div>

                <div class="mb-4 p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
                  <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-gray-700">Información Clave</span>
                      <button
                        @click="toggleDetallesReserva(reserva)"
                        class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors"
                      >
                        {{ reservaExpandida === reserva.IdPedido ? 'Ocultar' : 'Ver detalles' }}
                        <ChevronDown v-if="reservaExpandida !== reserva.IdPedido" class="h-4 w-4" />
                        <ChevronUp v-else class="h-4 w-4" />
                      </button>
                  </div>
                  <div v-if="reservaExpandida !== reserva.IdPedido" class="space-y-1 text-sm text-gray-600 animate-fade-in">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar class="h-4 w-4 text-orange-500" />
                      <span>{{ new Date(reserva.FechaRegistro + 'T00:00:00').toLocaleDateString() }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign class="h-4 w-4 text-green-500" />
                      <span class="font-bold text-green-600">Bs. {{ CalcularTotal(reserva.Detallepedido)}}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <Receipt class="h-4 w-4 text-blue-500" />
                      <span>Factura: {{ reserva.Venta?.IdVenta || 'Sin Factura' }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="reservaExpandida === reserva.IdPedido" class="mb-4 space-y-3 animate-fade-in max-h-48 overflow-y-auto p-1">
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
                          <tr v-for="item in reserva.Detallepedido" :key="item.IdDetallePedido" class="border-b border-gray-100 hover:bg-white/50">
                            <td class="py-2 px-2">
                              <span :class="[
                                'px-2 py-1 rounded-lg text-xs font-semibold',
                                item.Producto  ? 'bg-blue-100 text-blue-700' :
                                item.Promocion  ? 'bg-purple-100 text-purple-700' :
                                'bg-green-100 text-green-700'
                              ]">
                                {{  item.Producto ? 'Prod.' :  item.Promocion ? 'Promo.' : 'Paq.' }}
                              </span>
                            </td>
                            <td class="py-2 px-2 font-medium text-gray-800">{{ item.Producto?.Nombre || item.Promocion?.Nombre || item.Paquete?.Nombre}}</td>
                            <td class="py-2 px-2 text-center font-medium">{{ item.Cantidad }}</td>
                            <td class="py-2 px-2 text-center font-bold text-green-600">{{  (item.Precio * item.Cantidad).toFixed(2) }} Bs. </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div v-if="pagoVenta && pagoVenta.length > 0" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
                    <div class="font-semibold text-gray-800 mb-2 text-sm">Información de Pago</div>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <CreditCard class="h-3 w-3 text-blue-500" />
                        <span>Método: {{ pagoVenta[0]?.Nombre || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <DollarSign class="h-3 w-3 text-green-500" />
                        <span>Monto Pagado: Bs. {{ pagoVenta[0]?.Monto || '0.00' }}</span>
                      </div>
                      <div v-if="pagoVenta[0]?.Metodopago === 1" class="flex items-center gap-2 text-xs text-gray-600">
                        <Coins class="h-3 w-3 text-purple-500" />
                        <span>Cambio: Bs. {{ pagoVenta[0]?.Cambio || '0.00' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex gap-2 mt-4">
                  <button 
                      v-if="reserva.Estado.Nombre !== 'Anulado' && reserva.Estado.Nombre !== 'Enviado' && reserva.Estado.Nombre !== 'Completado'"
                      @click="iniciarEdicionReserva(reserva)"
                      class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Pencil class="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    @click="abrirModalFactura(reserva)"
                    class="flex-1 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Receipt class="h-4 w-4" />
                    Factura
                  </button>
                  <button 
                    v-if="reserva.Estado.Nombre.toLowerCase().trim() !== 'anulado' && reserva.Estado.Nombre !== 'Completado'"
                    @click="abrirModalAnulacion(reserva.IdPedido)"
                    class="flex-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 class="h-4 w-4" />
                    Anular
                  </button>
                  <button 
                      v-if="(reserva.Estado.Nombre === 'Listo'  || reserva.Estado.Nombre === 'Enviado') && reserva.Estado.Nombre !== 'Completado'"
                      @click="abrirModalCompletarPago(reserva)" 
                      class="flex-1 border border-green-200 text-green-600 hover:bg-green-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <CreditCard class="h-4 w-4" />
                    Pagar
                  </button>
                  <button 
                      v-if="!['anulado', 'pagado','completado'].includes(reserva.Estado.Nombre.toLowerCase().trim())"
                      @click="abrirModalEstado(reserva)" 
                      class="flex-1 border border-cyan-200 text-cyan-600 hover:bg-cyan-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Truck class="h-4 w-4" />
                    Estado
                  </button>
                  <button @click="VerEntrega(reserva.IdPedido)" class="flex-1 border border-teal-200 text-teal-600 hover:bg-teal-50 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                    <MapPin class="h-4 w-4" />
                    Entrega
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
                {{ modoEdicion ? 'Editar Reserva' : 'Registrar Nueva Reserva' }}
              </h1>
              <p class="text-gray-600 text-sm">{{ modoEdicion ? 'Modifica los datos de la reserva' : 'Completa los datos de la reserva' }}</p>
            </div>
          </div>
          
          <button
            @click="cancelarReserva"
            class="p-3 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <X class="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <!-- Formulario de Reserva -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Columna Izquierda: Cliente e Ítems -->
        <div class="space-y-6">
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <User class="h-6 w-6 text-orange-500" />
                  <span>Cliente</span>
                </div>
                <button @click="abrirModalNuevoCliente" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold transition-all duration-300">
                  Nuevo Cliente
                </button>
              </h3>
            <div class="relative">
              <Combobox v-model="reserva.Cliente">
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
            <div v-if="reserva.Cliente.IdPersona" class="mt-4 bg-green-50 border border-green-200 rounded-2xl p-3 flex justify-between items-center">
              <p class="font-semibold text-green-800">{{ reserva.Cliente.Nombre }}</p>
              <button @click="deseleccionarCliente" class="text-red-500 hover:text-red-700">
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Tag class="h-6 w-6 text-orange-500" />
              Tipo de Registro
            </h3>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1 block">Selecciona el tipo de registro</label>
                <select
                  v-model="selectpedido"
                  class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                   <option v-for="tipo in tpedidos" :key="tipo.IdTipoPedido" :value="tipo.IdTipoPedido">
                {{ tipo.Nombre }}
              </option>
                </select>
              </div>
            </div>
          </div>

          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Truck class="h-6 w-6 text-orange-500" />
              Información de Entrega
            </h3>
            <div class="space-y-4">
              <div>
                <p class="font-semibold mb-2">Tipo de Entrega</p>
                <div class="flex flex-wrap gap-4" v-for="tipo in tEntrega">
                  <label class="flex items-center">
                    <input type="radio" v-model="selectentrega" :value="tipo.IdTipoEntrega" class="text-orange-600 focus:ring-orange-500">
                    <span class="ml-2">{{ tipo.Nombre }}</span>
                  </label>
                </div>
              </div>

              <div v-if="selectentrega === 'TPE-E2'" class="space-y-4">
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Dirección de Entrega</label>
                  <input
                    v-model="reserva.entrega.direccion"
                    type="text"
                    placeholder="Ej: Calle Falsa 123, Ciudad"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-1 block">Fecha de Entrega</label>
                    <input
                      v-model="reserva.entrega.fecha"
                      type="date"
                      class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-1 block">Hora de Entrega</label>
                    <input
                      v-model="reserva.entrega.hora"
                      type="time"
                      class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <!-- <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Nombre del Receptor</label>
                  <input
                    v-model="reserva.entrega.nombreReceptor"
                    type="text"
                    placeholder="Nombre completo del receptor"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Teléfono del Receptor</label>
                  <input
                    v-model="reserva.entrega.telefonoReceptor"
                    type="tel"
                    placeholder="Ej: 777-12345"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div> -->
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Barrio</label>
                  <select
                    v-model="reserva.entrega.barrioId"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecciona un barrio</option>
                    <option v-for="barrio in barrios" :key="barrio.IdBarrio" :value="barrio.IdBarrio">{{ barrio.Nombre }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Referencia</label>
                  <input
                    v-model="reserva.entrega.referencia"
                    type="text"
                    placeholder="Ej: Casa con rejas verdes"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Ubicación (URL o Coordenadas)</label>
                  <input
                    v-model="reserva.entrega.ubicacion"
                    type="text"
                    placeholder="Ej: https://maps.app.goo.gl/xyz"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Costo de Envío</label>
                  <input
                    v-model.number="reserva.entrega.costoEnvio"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 15.00"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div v-else  class="space-y-4"> 
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                    <label class="text-sm font-semibold text-gray-700 mb-1 block">Fecha de Entrega</label>
                    <input
                      v-model="reserva.entrega.fecha"
                      type="date"
                      class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-1 block">Hora de Entrega</label>
                    <input
                      v-model="reserva.entrega.hora"
                      type="time"
                      class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                   </div>   
              
              </div>
            </div>
          </div>

          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package class="h-6 w-6 text-orange-500" />
              Ítems de la Reserva
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
        </div>

        <!-- Columna Derecha: Resumen y Pago -->
        <div class="space-y-6">
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart class="h-6 w-6 text-orange-500" />
              Resumen
            </h3>
            <div class="bg-gray-50 rounded-2xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              <div v-if="itemsEnReserva.length === 0" class="text-center text-gray-500 pt-10">
                <p>El carrito está vacío</p>
              </div>
              <div v-else class="space-y-2">
                <div v-for="(item, index) in itemsEnReserva" :key="index" class="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
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
                  <p class="font-bold text-green-600 w-20 text-right">Bs. {{ redondearPrecio(item.subtotal) }}</p>
                  <button @click="eliminarItemDeReserva(item,index)" class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
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
              <div class="bg-gray-100 rounded-2xl p-4">
                <div class="flex justify-between items-center">
                  <p class="text-lg font-semibold text-gray-800">{{ totalLabel }}</p>
                  <p class="text-2xl font-bold text-gray-600">Bs. {{ redondearPrecio(subtotalReserva) }}</p>
                </div>
                <div v-if="selectpedido === 'ITP-P2'" class="mt-2 flex justify-between items-center border-t pt-2 border-gray-200">
                  <p class="text-lg font-semibold text-green-800">Adelanto Requerido (50%):</p>
                  <p class="text-2xl font-bold text-green-600">Bs. {{ adelantoRequerido.toFixed(2) }}</p>
                </div>
              </div>

              <div v-if="selectpedido === 'ITP-P1'" class="bg-yellow-50 rounded-2xl p-4 text-center">
                <p class="font-semibold text-yellow-800">Pago Pendiente</p>
                <p class="text-sm text-yellow-700">El pago se realizará al confirmar la entrega.</p>
              </div>

              <div v-if="selectpedido !== 'ITP-P1'">
                <div>
                  <p class="font-semibold mb-2">Método de Pago</p>
                  <div class="flex gap-4" v-for="Pagos in pago">
                    
                    <label class="flex items-center"><input type="radio" v-model.number="reserva.MetodoPago" :value="Pagos.IdMetodoPago" class="text-green-600 focus:ring-green-500"> <span class="ml-2">{{ Pagos.Nombre }}</span></label>
                  </div>
                </div>
                <div v-if="reserva.MetodoPago === 1">
                  <input
                    v-model.number="montoRecibido"
                    type="number"
                    placeholder="Monto recibido"
                    class="w-full px-4 py-3 bg-white/60 border border-green-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div v-if="reserva.MetodoPago === 1" class="bg-purple-50 rounded-2xl p-3 flex justify-between items-center">
                  <p class="font-semibold text-purple-800">Cambio:</p>
                  <p class="text-lg font-bold text-purple-600">Bs. {{ cambio.toFixed(2) }}</p>
                </div>
              </div>

              <div class="flex gap-4 pt-4 border-t mt-4">
                <button @click="cancelarReserva" class="w-full bg-gray-500 text-white py-3 rounded-2xl shadow-lg hover:bg-gray-600 font-semibold">
                  Cancelar
                </button>
                <button @click="registrarReserva" :disabled="itemsEnReserva.length === 0" class="w-full bg-green-500 text-white py-3 rounded-2xl shadow-lg hover:bg-green-600 font-semibold disabled:opacity-50">
                  {{ modoEdicion ? 'Actualizar Reserva' : 'Registrar Reserva' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Cliente -->
    <div v-if="mostrarModalNuevoCliente" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
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
            <input v-model="nuevoCliente.Nombre" type="text" placeholder="Ingrese el nombre" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-1 block">Apellido Paterno</label>
              <input v-model="nuevoCliente.ApellidoPaterno" type="text" placeholder="Ingrese el apellido paterno" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-1 block">Apellido Materno</label>
              <input v-model="nuevoCliente.ApellidoMaterno" type="text" placeholder="Ingrese el apellido materno" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Correo Electrónico</label>
            <input v-model="nuevoCliente.Email" type="email" placeholder="ejemplo@correo.com" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="text-sm font-semibold text-gray-700 mb-1 block">Cédula de Identidad (CI)</label>
              <input v-model="nuevoCliente.CI" type="text" placeholder="Ingrese el número de CI" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-1 block">Extensión</label>
              <input v-model="nuevoCliente.ExtensionCI" type="text" placeholder="Ej: SC" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">NIT</label>
            <input v-model="nuevoCliente.NIT" type="text" placeholder="Ingrese el NIT" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-4">
          <button @click="cerrarModalNuevoCliente" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Cancelar</button>
          <button @click="guardarNuevoCliente" class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Guardar Cliente</button>
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
          
          <h2 class="text-2xl font-bold text-gray-800 mb-4">¿Anular Reserva?</h2>
          
          <p class="text-gray-600 mb-8">
            ¿Estás seguro de que deseas anular la reserva 
            <span class="font-semibold text-gray-800">#{{ reservaParaAnular }}</span>? 
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

    <!-- Modal para Cambiar Estado -->
    <div 
      v-if="mostrarModalEstado"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Truck class="h-6 w-6" />
              <h2 class="text-xl font-bold">Cambiar Estado de la Reserva</h2>
            </div>
            <button @click="cerrarModalEstado" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label for="estado-reserva" class="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
            <select 
              id="estado-reserva"
              v-model="nuevoEstado"
              class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
            
              <option value="7">En preparando</option>
              <option value="10">Listo</option>
              <option value="8">Enviado</option>
            </select>
          </div>
          <div>
            <label for="mensaje-correo" class="block text-sm font-medium text-gray-700 mb-1">Mensaje para el Cliente (Opcional)</label>
            <textarea 
              id="mensaje-correo"
              v-model="mensajeCorreo"
              rows="4"
              placeholder="Escribe un mensaje para notificar al cliente por correo..."
              class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>
        </div>

        <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-4">
          <button @click="cerrarModalEstado" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            Cancelar
          </button>
          <button @click="guardarCambioEstado" class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            Guardar Cambios
          </button>
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

    <!-- Modal Ingresar Datos Cliente para Factura -->
   
    <!-- Modal de Factura -->
  

    <!-- Modal para Completar Pago -->
    <div v-if="mostrarModalCompletarPago" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <CreditCard class="h-6 w-6" />
              <h2 class="text-xl font-bold">Completar Pago</h2>
            </div>
            <button @click="cerrarModalCompletarPago" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div v-if="reservaParaCompletarPago">
            <p class="text-sm text-gray-600">Completando el pago para la reserva/pedido </p>
            <div class="mt-4 bg-gray-100 rounded-2xl p-4 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-700">Monto Total:</span>
                <span class="font-bold text-lg text-gray-800">Bs. {{ (reservaParaCompletarPago.MontoTotal || 0)}}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-700">Monto Pagado:</span>
                <span class="font-bold text-lg text-red-600">- Bs. {{ (reservaParaCompletarPago.Monto || 0) }}</span>
              </div>
              <div class="flex justify-between items-center border-t pt-2 mt-2">
                <span class="font-semibold text-green-700 text-lg">Monto Restante:</span>
                <span class="font-bold text-xl text-green-600">Bs. {{ pagoFinal.monto }}</span>
              </div>
            </div>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Método de Pago</label>
            <select v-model="pagoFinal.metodoPagoId" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option v-for="m in metodo" :key="m.IdMetodoPago" :value="m.IdMetodoPago">{{ m.Nombre }}</option>
            </select>
          </div>
          <div v-if="pagoFinal.metodoPagoId === 1">
            <label class="text-sm font-semibold text-gray-700 mb-1 block">Monto Recibido</label>
            <input v-model.number="pagoFinal.montoRecibido" type="number" placeholder="Monto que entrega el cliente" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
           <div v-if="pagoFinal.metodoPagoId === 1" class="bg-purple-50 rounded-2xl p-3 flex justify-between items-center">
              <p class="font-semibold text-purple-800">Cambio:</p>
              <p class="text-lg font-bold text-purple-600">Bs. {{ cambioPagoFinal.toFixed(2) }}</p>
            </div>
        </div>
        <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-4">
          <button @click="cerrarModalCompletarPago" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Cancelar</button>
          <button @click="guardarPagoCompleto" class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Confirmar Pago</button>
        </div>
      </div>
    </div>

    <!-- Modal para Ver Entrega -->
    <!-- <div 
      v-if="mostrarModalEntrega && entregaParaVer"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <MapPin class="h-6 w-6" />
              <h2 class="text-xl font-bold">Información de Entrega</h2>
            </div>
            <button @click="cerrarModalEntrega" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700">Fecha de Entrega</label>
              <p class="mt-1 text-gray-800">{{ new Date(entregaParaVer.FechaEntrega + 'T00:00:00').toLocaleDateString() }}</p>
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700">Hora de Entrega</label>
              <p class="mt-1 text-gray-800">{{ entregaParaVer.HoraEntrega }}</p>
            </div>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700">Dirección</label>
            <p class="mt-1 text-gray-800">{{ entregaParaVer.Direccion }}</p>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700">Barrio</label>
            <p class="mt-1 text-gray-800">{{ entregaParaVer.Barrio.Nombre }}</p>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700">Referencia</label>
            <p class="mt-1 text-gray-800">{{ entregaParaVer.Referencia }}</p>
          </div>
          <div v-if="entregaParaVer.Ubicacion">
            <label class="text-sm font-semibold text-gray-700">Ubicación (Link)</label>
            <a :href="entregaParaVer.Ubicacion" target="_blank" class="mt-1 text-blue-600 hover:underline break-all">{{ entregaParaVer.Ubicacion }}</a>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700">Costo de Envío</label>
            <p class="mt-1 text-gray-800">Bs. {{ entregaParaVer.CostoEnvio.toFixed(2) }}</p>
          </div>
        </div>

        <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex justify-end">
          <button @click="cerrarModalEntrega" class="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            Cerrar
          </button>
        </div>
      </div>
    </div>  -->
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted, reactive, defineProps } from 'vue'
import { useAppStore } from '@/store/order';
import { useRouter } from 'vue-router';
import {
  ShoppingCart, Plus, Search, FileText, History, Eye, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Receipt, Trash2, Package, Tag, User, Hash, Calculator, CreditCard, DollarSign, Coins,
  X, Check, AlertTriangle, CheckCircle, Pencil, Truck, MapPin, Calendar
} from 'lucide-vue-next'
import { anularReserva, RegistrarReserva, listarPedidoSucursal, CompletarPago, updateReserva, listarTipopedido, actualizarEstadoReserva } from '@/Server/Reserva'
import { listarPagoVenta, listarPago, listarMetodo} from '@/Server/Pago'
import { listarProductosSucursal, listarPaquete, listarBuscarProductos, PrecioProducto, ObtenerPresentacion } from '@/Server/Producto'
import { listarPromocionactiva, buscarPromocion} from '@/Server/Promocion'
import { listarCliente, RegistrarCliente } from '@/Server/Cliente'
import { listarSucursales, ObtenerDIreccion } from '@/Server/api'
import { createFactura } from '@/Server/Factura'
import { SucursalUsuario } from '@/Server/Usuario' 
import { listarBarrios } from '@/Server/api';
import { listarTipoEntrega, ObtenerEntrega } from '@/Server/Entrga'
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
import { listarCategorias, ObtenerSubCategorias } from '@/Server/Categoria';
import { useAlertStore } from '@/stores/alertStore';

const alertStore = useAlertStore();

// New data from Venta.vue
const activeTab = ref('productos');
const categorias = ref([]);
const subcategoriasParaFiltro = ref([]);
const filtroCategoria = ref('TODOS');
const filtroSubcategoria = ref('TODOS');
const filtroNombreItem = ref('');

// New computed from Venta.vue
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

// New watchers from Venta.vue
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

// New methods from Venta.vue
const ListarCategoriasPrincipales = async () => {
  try {
    const response = await listarCategorias();
    categorias.value = response;
  } catch (error) {
    console.error('Error al cargar categorias:', error);
  }
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

const agregarProductoDesdeCard = async (producto) => {
  const itemExistente = itemsEnReserva.value.find(i => i.id === producto.IdProducto && i.type === 'producto');
  if (itemExistente) {
    showToastMessage('El producto ya está en la reserva. Puede ajustar la cantidad en el resumen.');
    return;
  }

  const stockDisponible = producto.Productosucursal?.[0]?.Cantidad || 0;
  if (stockDisponible < 1) {
    showToastMessage('Este producto no tiene stock disponible.');
    return;
  }

  const precio = await getPrecioProducto(producto, false);

  const nuevoItem = {
    IdDetallePedido: null,
    id: producto.IdProducto,
    type: 'producto',
    nombre: producto.Nombre,
    Cantidad: 1,
    precioUnitario: precio,
    subtotal: Math.round(precio * 10) / 10,
    Modo: 0,
  };

  reserva.value.detalles.Producto.push(nuevoItem);
  await ajustarStockPorItem(nuevoItem, -1);

  showToastMessage(`${producto.Nombre} agregado a la reserva.`);
};

const agregarPromocionDesdeCard = async (promo) => {
  const itemExistente = itemsEnReserva.value.find(i => i.id === promo.IdPromocion && i.type === 'promocion');
  if (itemExistente) {
    showToastMessage('La promoción ya está en la reserva.');
    return;
  }

  const stockCheck = await checkPromoStock(promo, 1);
  if (!stockCheck.available) {
    showToastMessage(stockCheck.message);
    return;
  }

  const precio = await getPrecioPromocion(promo);

  const nuevoItem = {
    IdDetallePedido: null,
    id: promo.IdPromocion,
    type: 'promocion',
    nombre: promo.Nombre,
    Cantidad: 1,
    precioUnitario: precio,
    subtotal: Math.round(precio * 10) / 10,
    Modo: 0,
  };

  reserva.value.detalles.Promocion.push(nuevoItem);
  await ajustarStockPorItem(nuevoItem, -1);
  showToastMessage(`${promo.Nombre} agregada a la reserva.`);
};

const agregarPaqueteDesdeCard = async (pack) => {
  const itemExistente = itemsEnReserva.value.find(i => i.id === pack.IdPaquete && i.type === 'paquete');
  if (itemExistente) {
    showToastMessage('El paquete ya está en la reserva.');
    return;
  }

  const stockDisponible = pack.CantidadPaquete || 0;
  if (stockDisponible < 1) {
    showToastMessage('Este paquete no tiene stock disponible.');
    return;
  }

  const precio = getPrecioPaquete(pack, false);

  const nuevoItem = {
    IdDetallePedido: null,
    id: pack.IdPaquete,
    type: 'paquete',
    nombre: pack.Nombre,
    Cantidad: 1,
    precioUnitario: precio,
    subtotal: Math.round(precio * 10) / 10,
    Modo: 0,
  };

  reserva.value.detalles.Paquete.push(nuevoItem);
  await ajustarStockPorItem(nuevoItem, -1);
  showToastMessage(`${pack.Nombre} agregado a la reserva.`);
};
// Reactive data
const modoRegistro = ref(false);
const modoEdicion = ref(false);
const reservaIdParaEditar = ref(null);
const terminoBusquedaProducto = ref('');
const mostrarModalBusqueda = ref(false);
const mostrarModalAnulacion = ref(false);
const reservaExpandida = ref(null);
const reservaParaAnular = ref(null);
const reservaDestacadaId = ref(null);
const showToast = ref(false);
const toastMessage = ref('');
const paginaActual = ref(1);
const itemsPorPagina = 5;
const montoRecibido = ref(0);
const sucursales = ref([]);
const TIeneSucursal = ref(false);
const store = useAppStore();
const ubicarPedido = ref(''); 
const router = useRouter();

const cambioPagoFinal = computed(() => {
  if (pagoFinal.value.metodoPagoId === 1 && pagoFinal.value.montoRecibido > 0) {
    const cambio = pagoFinal.value.montoRecibido - pagoFinal.value.monto;
    return Math.max(0, cambio);
  }
  return 0;
});
// Refs for New Client Modal
const mostrarModalNuevoCliente = ref(false);
const nuevoCliente = ref({
  Nombre: '',
  ApellidoPaterno: '',
  ApellidoMaterno: '',
  Email: '',
  CI: '',
  ExtensionCI: '',
  NIT: ''
});

// Refs for State Change Modal
const mostrarModalEstado = ref(false);
const reservaParaCambiarEstado = ref(null);
const nuevoEstado = ref(7); // Default to 'En preparando' ID
const mensajeCorreo = ref('');
const pagoVenta = ref([]);
// Factura
const mostrarModalFactura = ref(false);
const reservaParaFacturar = ref(null);
const mostrarModalDatosCliente = ref(false);
const reservaSeleccionadaParaFactura = ref(null);
const clienteParaFactura = ref(null); // Holds the selected client object from the combobox
const datosClienteManual = ref({ Nombre: '', ApellidoPaterno: '', ApellidoMaterno: '', CI: '' }); // Holds the data for the manual input fields
const queryClienteFactura = ref(''); // Used for the search query in the invoice modal's combobox

// Refs for Payment Modal
const mostrarModalCompletarPago = ref(false);
const reservaParaCompletarPago = ref({IdPedido:null,MontoTotal:0.00,Monto:0.00});
const pagoFinal = ref({
  monto: 0,
  metodoPagoId: 1,
  montoRecibido: 0,
});

// Filtros
const today = new Date();
const formattedDate = today.toISOString().split('T')[0];

  const formattedDateE = today.toISOString().split('T')[0];
  const deliveryTime = new Date(today.getTime() + 60 * 60 * 1000);
  const formattedTime = deliveryTime.toTimeString().slice(0, 5);
const filtroFecha = ref(formattedDate);
const filtroSucursal = ref('TODOS');
const filtroPago = ref(0);
// Formulario de venta
const tpedidos = ref([]);
const tEntrega = ref([]);
const selectedItemType = ref('producto')
const selectedItem = ref(null)
const queryCliente = ref('')
const cantidadItem = ref(1)
const queryProducto = ref('');
const metodo = ref([]);
const BuscraProducto = ref([]);
const reservas = ref([]);
const products = ref([]);
const paquete = ref([]);
const promocion = ref([]);
const cliente = ref([]);
const pago = ref([]);
const pp = ref({});
const cantidadError = ref('');
const promotion = ref({});
const precios = ref({});
const barrios = ref([]); // New reactive data
const selectpedido = ref('');
const selectentrega = ref('');



const reserva = ref({
    IdPedido:'',
    Cliente: {},
    Usuario: {},
    idTipoVenta: 1, // 1 para online, 2 para tienda
    Monto: 0,
    Cambio: 0,
    IdEntrega:'',
    IdDireccion:'',
    IdPago:'',
    MetodoPago: 1,
    detalles: {
      Producto: [],
      Promocion: [],
      Paquete: []
    },
    tipoEntrega: selectentrega.value, // 'recoger' (pickup) or 'domicilio' (delivery)
    entrega: {
        direccion: '',
        fecha: formattedDateE,
        hora: formattedTime,
        nombreReceptor: '',
        telefonoReceptor: '',
        barrioId: '', 
        referencia: '', 
        ubicacion: '', 
        costoEnvio: 0 
    },
    tipoPedido: selectpedido.value
})
const presentacion = ref({});
const productosEncontrados = ref([])

// Computed
const itemsEnReserva = computed(() => {
  const { Producto, Promocion, Paquete } = reserva.value.detalles;
  return [...Producto, ...Promocion, ...Paquete];
});

const transformablePackages = computed(() => {
  const mapping = {};
  if (!paquete.value) return mapping;

  const productItems = itemsEnReserva.value.filter(i => i.type === 'producto');

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
const redondearPrecio = (precio) => {
  // Se asegura que el precio sea un número, lo multiplica por 10, lo redondea, y luego lo divide por 10.
  const redondeado = Math.round(Number(precio) * 10) / 10;
  // Devuelve el número con dos decimales. Ej: 19.9
  return redondeado.toFixed(2);
};

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
const reservasFiltradas = computed(() => {
  // Asegurarse de que value es un array
  if (!Array.isArray(reservas.value)) {
    return [];
  }
  return reservas.value;
});



const totalPaginas = computed(() => {
  return Math.ceil(reservasFiltradas.value.length / itemsPorPagina)
})

const reservasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  return reservasFiltradas.value.slice(inicio, fin)
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

const clientesFiltradosFactura = computed(() => {
  if (queryClienteFactura.value === '') {
    return cliente.value;
  }
  return cliente.value.filter(c =>
    c.Nombre.toLowerCase().includes(queryClienteFactura.value.toLowerCase()) ||
    (c.CI && c.CI.includes(queryClienteFactura.value))
  );
});

const subtotalReserva = computed(() => {
  return itemsEnReserva.value.reduce((total, item) => total + item.subtotal, 0)
})

const adelantoRequerido = computed(() => {
  if (selectpedido.value === 'ITP-P2') {
    return redondearPrecio(subtotalReserva.value) * 0.5;
  }
  return 0;
});

const totalLabel = computed(() => {
  return reserva.value.tipoPedido === 'pedido' ? 'Total del Pedido:' : 'Total de la Reserva:';
});

const cambio = computed(() => {
  if (reserva.value.MetodoPago === 1) {
    let aPagar = subtotalReserva.value;
    if (selectpedido.value === 'ITP-P2') {
      aPagar = adelantoRequerido.value;
    }
    const result = Math.max(0, montoRecibido.value - aPagar);
    reserva.value.Cambio = result;
    return result;
  }
  return 0;
})

const paginacionInfo = computed(() => {
  const total = reservasFiltradas.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPorPagina + 1;
  const fin = Math.min(inicio + itemsPorPagina - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} reservas`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  return pages;
});

// Methods
const toggleDetallesReserva = (reserva) => {
  reservaExpandida.value = reservaExpandida.value === reserva.IdPedido ? null : reserva.IdPedido;
  if (reservaExpandida.value === reserva.IdPedido) {
    obtenetPago(reserva.IdPedido);
  }
};

// const estadoClase = (estadoNombre) => {
//   switch (estadoNombre.toLowerCase().trim()) {
//     case 'pagado':
//       return 'bg-green-500 text-white';
//     case 'anulado':
//       return 'bg-red-500 text-white';
//     case 'pendiente':
//       return 'bg-yellow-500 text-white';
//     case 'en preparacion':
//       return 'bg-blue-500 text-white';
//     case 'listo':
//       return 'bg-purple-500 text-white';
//     case 'enviado':
//       return 'bg-indigo-500 text-white';
//     case 'completado':
//       return 'bg-emerald-500 text-white';
//     default:
//       return 'bg-gray-500 text-white';
//   }
// };

// Watchers
watch(clienteParaFactura, (selectedClient) => {
  if (selectedClient && selectedClient.IdPersona) {
    datosClienteManual.value = { ...selectedClient };
  }
});

watch([filtroFecha, filtroSucursal, filtroPago], ([newFecha, newSucursal, newPago]) => {
  paginaActual.value = 1;
   ListarPedidoSucursal(newSucursal, newFecha, newPago);
  if (newSucursal) {
      Listarproductos(newSucursal);
  }
});

watch(() => pagoFinal.value.metodoPagoId, (newMethod, oldMethod) => {
  // Only act when switching from a non-cash method to cash
  if (newMethod === 1 && oldMethod !== 1) {
    pagoFinal.value.montoRecibido = pagoFinal.value.monto;
  }
});

watch(products, (newProducts) => {
    calcularPrecios(newProducts);
}, { deep: true, immediate: true });

watch(promocion, (newPromos) => {
     calcularPrecios(newPromos);
}, { deep: true, immediate: true });

watch(paquete, (newPaquetes) => {
    calcularPrecios(newPaquetes);
}, { deep: true, immediate: true });

watch(modoRegistro, (isEditing) => {
  if (isEditing) {
    // When opening the edit/detail view, remove the highlight after a short delay
    setTimeout(() => {
      reservaDestacadaId.value = null;
    }, 3000);
  }
});
const obtenerE = ref({});

const obtenerEntrega= async (ventaId) => {
  try {
    const response = await ObtenerEntrega(ventaId);
    obtenerE.value = response;
  } catch (error) {
    console.error('Error al cargar la entrega del pedido:', error);
  } 
    cargandoPago.value = true;
  
};
const VerEntrega = async (PedidoId) =>{
  if (PedidoId) {
    await obtenerEntrega(PedidoId);
    store.setPedido(obtenerE.value.IdEntrega);
    store.setSucursal(filtroSucursal.value);
    store.setFecha(obtenerE.value.FechaEntrega);
    router.push({ name: 'entrega' });
  // , query: { id: entrega.Pedido.IdPedido }
  } else {
    console.error('No se pudo encontrar el IdPedido para la navegación.');
  }


}

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



const   cantidadValida = ref(false);

// Methods
const abrirModalEstado = (reserva) => {
  reservaParaCambiarEstado.value = reserva;
  // Reset fields
  nuevoEstado.value = 7; // Default to 'En preparando'
  mensajeCorreo.value = '';
  mostrarModalEstado.value = true;
};

const cerrarModalEstado = () => {
  mostrarModalEstado.value = false;
  reservaParaCambiarEstado.value = null;
};

const abrirModalNuevoCliente = () => {
  nuevoCliente.value = { Nombre: '', ApellidoPaterno: '', ApellidoMaterno: '', CI: '' };
  mostrarModalNuevoCliente.value = true;
};

const cerrarModalNuevoCliente = () => {
  mostrarModalNuevoCliente.value = false;
};

const guardarNuevoCliente = async () => {
  if (!nuevoCliente.value.Nombre || (!nuevoCliente.value.CI && !nuevoCliente.value.NIT)) {
    showToastMessage('El nombre y al menos un documento (CI o NIT) son obligatorios.');
    return;
  }
  try {
    const dataParaGuardar = {
      Nombre: nuevoCliente.value.Nombre,
      ApellidoPaterno: nuevoCliente.value.ApellidoPaterno,
      ApellidoMaterno: nuevoCliente.value.ApellidoMaterno,
      Email: nuevoCliente.value.Email,
      CI: `${nuevoCliente.value.CI} ${nuevoCliente.value.ExtensionCI}`.trim(),
      NIT: nuevoCliente.value.NIT
    };

    const clienteRegistrado = await RegistrarCliente(dataParaGuardar);
    await ListarCLiente(); // Refresh the client list
    reserva.value.Cliente = clienteRegistrado; // Auto-select the new client
    showToastMessage('Cliente registrado y seleccionado con éxito.');
    cerrarModalNuevoCliente();
  } catch (error) {
    console.error('Error al registrar el cliente:', error);
    showToastMessage('Error al registrar el cliente.');
  }
};

const abrirModalCompletarPago = async (reserva) => {
  await obtenetPago(reserva.Venta.IdVenta);
    reservaParaCompletarPago.value.IdPedido = reserva.IdPedido;
    reservaParaCompletarPago.value.MontoTotal = CalcularTotal(reserva.Detallepedido)|| 0;
    reservaParaCompletarPago.value.Monto = pagoVenta.value[0]?.Monto || 0;
  let montoAPagar = 0;
 
  // Lógica para diferenciar Reserva de Pedido
  if (reserva.Tipopedido?.Nombre === 'Reserva') {
    const montoPagado = parseFloat(pagoVenta.value[0]?.Monto) || 0;
    montoAPagar = reservaParaCompletarPago.value.MontoTotal - montoPagado;
  } else { // Asume que es un 'Pedido' y se paga el total
    montoAPagar = reservaParaCompletarPago.value.MontoTotal;
  }

  pagoFinal.value.monto = montoAPagar > 0 ? montoAPagar : 0;
  pagoFinal.value.metodoPagoId = 1; // Default to cash
  pagoFinal.value.montoRecibido = pagoFinal.value.monto;
  mostrarModalCompletarPago.value = true;
};

const cerrarModalCompletarPago = () => {
  mostrarModalCompletarPago.value = false;
  reservaParaCompletarPago.value = {IdPedido:null,MontoTotal:0.00,Monto:0.00};
};

const guardarPagoCompleto = async () => {
  if (!reservaParaCompletarPago.value || pagoFinal.value.monto <= 0) {
    showToastMessage('El monto a pagar debe ser mayor a cero.');
    return;
  }
  try {
    const pagoData = {
      MetodoPago: pagoFinal.value.metodoPagoId,
      Monto: pagoFinal.value.monto,
      Cambio:cambioPagoFinal.value,
      IdPedido: reservaParaCompletarPago.value.IdPedido
    };
    await CompletarPago(pagoData);
    showToastMessage('Pago completado con éxito.');
    await ListarPedidoSucursal(filtroSucursal.value, filtroFecha.value, filtroPago.value);
    cerrarModalCompletarPago();
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    showToastMessage('Error al registrar el pago.');
  }
};

const guardarCambioEstado = async () => {
  if (!reservaParaCambiarEstado.value) return;

  const reservaId = reservaParaCambiarEstado.value.IdPedido;
  const estadoId = nuevoEstado.value;
  
  try {
    const payload = {
      IdEstado: estadoId,
      mensajeCorreo: mensajeCorreo.value
    };

    await actualizarEstadoReserva(reservaId, payload);
    
    showToastMessage(`Estado de la reserva #${reservaId} actualizado.`);

    // Play sound
   const audio = new Audio('https://www.myinstants.com/media/sounds/spiderman-meme-song.mp3');
audio.play().catch(error => {
  console.error("Error al reproducir el sonido:", error);
});

    // Refresh the list of reservations
    await ListarPedidoSucursal(filtroSucursal.value, filtroFecha.value, filtroPago.value);

  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    showToastMessage('Error al actualizar el estado.');
  }
  cerrarModalEstado();
};

const estadoClase = (nombreEstado) => {
  switch (nombreEstado) {
    case 'Pagado':
      return 'bg-green-500 text-white animate-pulse-green';
    case 'Anulado':
      return 'bg-red-500 text-white animate-shake-red';
    case 'En preparando':
      return 'bg-purple-500 text-white animate-spin-purple';
    case 'Listo':
      return 'bg-teal-500 text-white animate-tada-teal';
    case 'Enviado':
      return 'bg-indigo-500 text-white animate-pulse-indigo';
    case 'Reservado':
      return 'bg-blue-500 text-white animate-pulse-blue';
    default: // Pendiente
      return 'bg-yellow-500 text-white animate-pulse-yellow';
  }
};

const ajustarStockLocal = (productoId, cantidad) => {
  const producto = products.value.find(p => p.IdProducto === productoId);
  if (producto && producto.Productosucursal && producto.Productosucursal.length > 0) {
    producto.Productosucursal[0].Cantidad += cantidad;
    products.value = [...products.value];
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


const limpiarUbicarPedido = () =>{
  ubicarPedido.value = ''; 
}
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

const resetReserva = () => {
 

  reserva.value = {
    IdPedido:'',
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
    },
    tipoEntrega: selectentrega.value,
    entrega: {
        direccion: '',
        fecha: formattedDateE,
        hora: formattedTime,
        nombreReceptor: '',
        telefonoReceptor: '',
        barrioId: '', 
        referencia: '', 
        ubicacion: '', 
        costoEnvio: 0 
    },
    tipoPedido: selectpedido.value
  };
  montoRecibido.value = 0;
  deseleccionarCliente();
  deseleccionarItem();
  modoEdicion.value = false;
  reservaIdParaEditar.value = null;
  // Reset filters
  filtroCategoria.value = 'TODOS';
  filtroSubcategoria.value = 'TODOS';
  filtroNombreItem.value = '';
  activeTab.value = 'productos';
}

const iniciarNuevaReserva = async () => {
 await Listarproductos(filtroSucursal.value);
  await ListarPaquetes();
  modoEdicion.value = false;
  modoRegistro.value = true;
  resetReserva();
}

// const toggleDetallesReserva = async (reservaId) => {
//     await obtenetPago(reservaId.Venta.IdVenta);
//   if (reservaExpandida.value === reservaId.IdPedido) {
//     reservaExpandida.value = null;
//   } else {
//     reservaExpandida.value = reservaId.IdPedido;
//     // obtenetPago(reservaId)
//   }
// };
const direccion = ref({});

const obtenerDIreccion = async (id) => {
    try {
        const response = await ObtenerDIreccion(id);
        direccion.value = response;
    } catch (error) {
        console.error('Error fetching barrios:', error);
    }
};


const iniciarEdicionReserva = async (reservaParaEditar) => {
  // Asegurarse que todos los datos maestros están cargados
  
  await obtenerEntrega(reservaParaEditar.IdPedido);
  // await  obtenerDIreccion(obtenerE.value.Direccion);
  // console.log(obtenerE.value)
  //  console.log(direccion.value)
  await Promise.all([
      Listarproductos(filtroSucursal.value),
      ListarPaquetes(),
      Listarpromocion(),
      ListarCLiente(),
  ]);
  resetReserva();
  modoEdicion.value = true;
  modoRegistro.value = true;
  reserva.value.IdPedido = reservaParaEditar.IdPedido;
  reserva.value.IdVenta = reservaParaEditar.Venta.IdVenta;
  console.log(reservaParaEditar)
  //reserva.value.tipoPedido = reservaParaEditar.Tipopedido?.Nombre.toLowerCase() || 'reserva';
  selectentrega.value = obtenerE.value.Tipoentrega.IdTipoEntrega;
  selectpedido.value = reservaParaEditar.Tipopedido.IdTipoPedido;
  // Asignar cliente
  if (reservaParaEditar.Venta?.Persona) {
    reserva.value.Cliente = cliente.value.find(c => c.IdPersona === reservaParaEditar.Venta.Persona.IdPersona) || {};
  }

  // Asignar sucursal (lugar) para cargar productos correctos
  if (reservaParaEditar.Venta?.Sucursal?.IdSucursal) {
    filtroSucursal.value = reservaParaEditar.Venta.Sucursal.IdSucursal;
  }

  // Asignar método de pago
  if (reservaParaEditar.Venta?.Pago && reservaParaEditar.Venta.Pago.length > 0) {
    const pagoInfo = reservaParaEditar.Venta.Pago[0];
    reserva.value.IdPago = pagoInfo.IdPago;
    reserva.value.MetodoPago = pagoInfo.Metodopago.IdMetodoPago;
    montoRecibido.value = parseFloat(pagoInfo.Monto) || 0;
    reserva.value.Cambio = parseFloat(pagoInfo.Cambio) || 0;
  }
    
 reserva.value.entrega.direccion = obtenerE.value?.Direccion?.Direccion;
 reserva.value.entrega.referencia = obtenerE.value?.Direccion?.Referencia;
 reserva.value.entrega.barrioId = obtenerE.value?.Direccion.Barrio?.IdBarrio;
 reserva.value.entrega.ubicacion = obtenerE.value?.Direccion?.Ubicacion;
 reserva.value.entrega.fecha = obtenerE.value?.FechaEntrega;
 reserva.value.entrega.hora = obtenerE.value?.HoraEntrega;
 reserva.value.entrega.costoEnvio = obtenerE.value.CostoEntrega;
 reserva.value.IdEntrega = obtenerE.value?.IdEntrega;
 reserva.value.IdDireccion = obtenerE.value?.Direccion?.IdDireccion;
  // Mapear detalles de la venta
  if (reservaParaEditar?.Detallepedido) {
    const detallesPromises = reservaParaEditar.Detallepedido.map(async (detalle) => {
      let type, id, itemData, precioUnitario, nombre, Modo;
      
    
      if (detalle.Producto) {
        type = 'producto';
        id = detalle.Producto.IdProducto;
        itemData = products.value.find(p => p.IdProducto === id);
         await fetchPrecioProducto(id);
         precioUnitario = await getPrecioProducto(detalle.Producto, detalle.Modo === 1);
         Modo = detalle.Modo
         nombre = itemData?.Nombre || detalle.Producto.Nombre || 'Producto Desconocido';
        } else if (detalle.Promocion) {
          type = 'promocion';
        id = detalle.Promocion.IdPromocion;
        itemData = promocion.value.find(p => p.IdPromocion === id);
        Modo = detalle.Modo
        nombre = itemData?.Nombre || detalle.Promocion.Nombre || 'Promoción Desconocida';
   
        precioUnitario = await getPrecioPromocion(detalle.Promocion);
      } else if (detalle.Paquete) {
        type = 'paquete';
        id = detalle.Paquete.IdPaquete;
        itemData = paquete.value.find(p => p.IdPaquete === id);
         nombre = itemData?.Nombre || detalle.Paquete.Nombre || 'Paquete Desconocido';
        precioUnitario = getPrecioPaquete(detalle.Paquete, detalle.Modo === 1);
      }

      if (!type) return null;

      return {
        id: id,
        IdDetallePedido: detalle.IdDetallePedido,
        type: type,
        nombre: nombre,
        Cantidad: detalle.Cantidad,
        precioUnitario: precioUnitario,
        subtotal: detalle.Cantidad * precioUnitario,
        Modo: detalle.Modo || 0,
      };
    });

    const mappedDetalles = (await Promise.all(detallesPromises)).filter(Boolean);
    reserva.value.detalles.Producto = mappedDetalles.filter(d => d.type === 'producto');
    reserva.value.detalles.Promocion = mappedDetalles.filter(d => d.type === 'promocion');
    reserva.value.detalles.Paquete = mappedDetalles.filter(d => d.type === 'paquete');
  }
};


const cancelarReserva = async () => {
  modoRegistro.value = false
  resetReserva()
  await ListarPedidoSucursal(filtroSucursal.value, filtroFecha.value, filtroPago.value);
}

const deseleccionarCliente = () => {
  reserva.value.Cliente = {}
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
///r
const actualizarPrecioItem = async (item) => {
    let precio = 0;
    if (item.type === 'producto') {
        precio = await getPrecioProducto({ IdProducto: item.id }, item.Modo === 1);
    } else if (item.type === 'paquete') {
        precio = getPrecioPaquete({ IdPaquete: item.id }, item.Modo === 1);
    } else {
        precio = item.precioUnitario; 
    }
    item.precioUnitario = precio;
    item.subtotal = Math.round((item.Cantidad * (item.precioUnitario + 0.01)) * 10) / 10;
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
        if (!packageDetails?.Precio) return 0;
        precioUnitario = Number(packageDetails.Precio);
      } else if (item.Producto) {
        // Obtener precio normal del producto
        precioUnitario = await getPrecioProducto(item.Producto, false);
      }
      const descuento = (Number(item.Descuento) || 0) / 100;
      const precioConDescuento = precioUnitario * (1 - descuento);
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
const CalcularTotal = (Detallepedido) => {
  if (!Detallepedido) return '0.00';
  let precio = 0;
  for (const detalle of Detallepedido) {
    precio += (detalle.Cantidad * detalle.Precio);
  }
  return precio.toFixed(2);
}




const eliminarItemDeReserva = async (itemToRemove, pos) => {
  const detalles = reserva.value.detalles;
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
  showToastMessage('Ítem eliminado de la reserva');
}


const incrementarCantidad = async (item) => {
  const cantidadAjuste = 1;
  let puedeAjustar = false;
  let stockMessage = `No hay más stock disponible para ${item.nombre}`;

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
    let canIncrement = true;

    if (promoDetails && promoDetails.Productos) {
        for (const promoProduct of promoDetails.Productos) {
            const requiredQty = promoProduct.Cantidad * cantidadAjuste;
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
        canIncrement = false;
    }
    if (canIncrement) {
        puedeAjustar = true;
    }
  }

  if (puedeAjustar) {
    await ajustarStockPorItem(item, -cantidadAjuste);
    item.Cantidad++;
    item.subtotal = Math.round((item.Cantidad * item.precioUnitario) * 10) / 10;
  } else {
    showToastMessage(stockMessage);
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
        event.target.value = oldCantidad;
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
        event.target.value = oldCantidad;
    }
};


const registrarReserva = async () => {
  // Validaciones
  if (!reserva.value.Cliente.IdPersona) {
    showToastMessage('Por favor, selecciona un cliente.');
    return;
  }
  if (itemsEnReserva.value.length === 0) {
    showToastMessage('Añade al menos un ítem a la reserva.');
    return;
  }
  if (selectpedido.value === 'ITP-P2' && montoRecibido.value < adelantoRequerido.value) {
    showToastMessage(`El adelanto debe ser de al menos ${adelantoRequerido.value.toFixed(2)} Bs.`);
    return;
  }
    // <div v-if="mostrarModalNuevoCliente" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    //   <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-fade-in">
    //     <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
    //       <div class="flex items-center justify-between">
    //         <div class="flex items-center gap-3">
    //           <User class="h-6 w-6" />
    //           <h2 class="text-xl font-bold">Registrar Nuevo Cliente</h2>
    //         </div>
    //         <button @click="cerrarModalNuevoCliente" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
    //           <X class="h-6 w-6" />
    //         </button>
    //       </div>
    //     </div>
    //     <div class="p-6 space-y-4">
    //       <div>
    //         <label class="text-sm font-semibold text-gray-700 mb-1 block">Nombre(s)</label>
    //         <input v-model="nuevoCliente.Nombre" type="text" placeholder="Ingrese el nombre" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
    //       </div>
    //       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    //         <div>
    //           <label class="text-sm font-semibold text-gray-700 mb-1 block">Apellido Paterno</label>
    //           <input v-model="nuevoCliente.ApellidoPaterno" type="text" placeholder="Ingrese el apellido paterno" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
    //         </div>
    //         <div>
    //           <label class="text-sm font-semibold text-gray-700 mb-1 block">Apellido Materno</label>
    //           <input v-model="nuevoCliente.ApellidoMaterno" type="text" placeholder="Ingrese el apellido materno" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
    //         </div>
    //       </div>
    //       <div>
    //         <label class="text-sm font-semibold text-gray-700 mb-1 block">Correo Electrónico</label>
    //         <input v-model="nuevoCliente.Email" type="email" placeholder="ejemplo@correo.com" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
    //       </div>
    //       <div>
    //         <label class="text-sm font-semibold text-gray-700 mb-1 block">Tipo de Documento</label>
    //         <div class="flex gap-4 rounded-2xl bg-gray-200/60 p-2">
    //           <button @click="nuevoCliente.tipoDocumento = 'CI'" :class="['flex-1 py-2 rounded-xl font-semibold transition-all', nuevoCliente.tipoDocumento === 'CI' ? 'bg-white shadow text-green-600' : 'text-gray-500']">CI</button>
    //           <button @click="nuevoCliente.tipoDocumento = 'NIT'" :class="['flex-1 py-2 rounded-xl font-semibold transition-all', nuevoCliente.tipoDocumento === 'NIT' ? 'bg-white shadow text-green-600' : 'text-gray-500']">NIT</button>
    //         </div>
    //       </div>
    //       <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    //         <div class="md:col-span-2">
    //           <label class="text-sm font-semibold text-gray-700 mb-1 block">Número de Documento</label>
    //           <input v-model="nuevoCliente.documento" type="text" placeholder="Ingrese el número" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
    //         </div>
    //         <div v-if="nuevoCliente.tipoDocumento === 'CI'">
    //           <label class="text-sm font-semibold text-gray-700 mb-1 block">Extensión</label>
    //           <input v-model="nuevoCliente.extensionCI" type="text" placeholder="Ej: SC" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
    //         </div>
    //       </div>
    //     </div>
    //     <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-4">
    //       <button @click="cerrarModalNuevoCliente" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Cancelar</button>
    //       <button @click="guardarNuevoCliente" class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Guardar Cliente</button>
    //     </div>
    //   </div>
    // </div>

  // Construir el objeto de datos para enviar
  const datosReserva = {
    Nombre: nuevoCliente.value.Nombre,
    ApellidoPaterno: nuevoCliente.value.ApellidoPaterno,
    ApellidoMaterno: nuevoCliente.value.ApellidoMaterno,
    IdPedido: modoEdicion.value ? reserva.value.IdPedido : undefined,
    IdVenta:reserva.value?.IdVenta,
    IdCliente: reserva.value.Cliente.IdPersona,
    IdUsuario: 'USR-1', // Reemplazar con el ID del usuario logueado
    IdTipoPedido: selectpedido.value,
    IdTipoEntrega: selectentrega.value,
    Envio: reserva.value?.IdEntrega,
    DireccionId: reserva.value.IdDireccion,
    IdSucursal: filtroSucursal.value, // Asumiendo que el filtro de sucursal tiene el ID
    Fecha: new Date().toISOString().split('T')[0],
    MontoTotal: subtotalReserva.value,
    detalles: itemsEnReserva.value.map(item => ({
      IdDetallePedido: modoEdicion.value ? item.IdDetallePedido : undefined,
      IdProducto: item.type === 'producto' ? item.id : null,
      IdPromocion: item.type === 'promocion' ? item.id : null,
      IdPaquete: item.type === 'paquete' ? item.id : null,
      Cantidad: item.Cantidad,
      Precio: item.precioUnitario,
      Subtotal: item.subtotal,
      Modo: item.Modo || 0,
    })),
    pago: {
      IdPago:reserva.value?.IdPago,
      IdMetodoPago: reserva.value.MetodoPago,
      Monto: selectpedido.value === 'ITP-P2' ?  montoRecibido.value:subtotalReserva.value ,
      Cambio: cambio.value
    },
    entrega: reserva.value.entrega 
  };

  try {
   console.log(datosReserva)
    let response;
    if (modoEdicion.value) {
     response = await updateReserva(datosReserva);
    } else {
     response =  await RegistrarReserva(datosReserva);
    } 
   
    modoRegistro.value = false;
    showToastMessage(response.message);
    alertStore.fetchAlerts();
    resetReserva();
    await ListarPedidoSucursal(filtroSucursal.value, filtroFecha.value, filtroPago.value);
  } catch (error) {
    console.error('Error al guardar la reserva:', error);
    showToastMessage('Error al guardar la reserva.');
  }
};

const confirmarAnulacion = async () => {
  if (!reservaParaAnular.value) return;
  try {
    const response = await anularReserva(reservaParaAnular.value);
    await ListarPedidoSucursal(filtroSucursal.value, filtroFecha.value, filtroPago.value);
    showToastMessage(response.message);
  } catch (error) {
    console.error('Error al anular:', error);
    showToastMessage('Error al anular la reserva.');
  }
  cerrarModalAnulacion();
};

const abrirModalAnulacion = (reservaId) => {
  reservaParaAnular.value = reservaId;
  mostrarModalAnulacion.value = true;
};

const cerrarModalAnulacion = () => {
  mostrarModalAnulacion.value = false;
  reservaParaAnular.value = null;
};

const buscarProductoGlobal = async () => {
  if (!terminoBusquedaProducto.value.trim()) return;
  try {
    const response = await listarBuscarProductos(terminoBusquedaProducto.value);
    productosEncontrados.value = response;
    // Cache prices for found products
    for (const producto of response) {
      await fetchPrecioProducto(producto.IdProducto);
    }
    mostrarModalBusqueda.value = true;
  } catch (error) {
    console.error('Error al buscar productos:', error);
    productosEncontrados.value = [];
  }
};

const cerrarModalBusqueda = () => {
  mostrarModalBusqueda.value = false;
  terminoBusquedaProducto.value = '';
  productosEncontrados.value = [];
};

// Factura related methods
const abrirModalFactura = (reserva) => {
  if (reserva.Venta && reserva.Venta.IdVenta) {
    // Si ya tiene factura, solo mostrarla
    reservaParaFacturar.value = reserva;
    mostrarModalFactura.value = true;
  } else {
    // Si no tiene, abrir modal para ingresar datos
    reservaSeleccionadaParaFactura.value = reserva;
    // Pre-fill with client data if available
    if (reserva.Venta?.Persona) {
      clienteParaFactura.value = reserva.Venta.Persona;
      datosClienteManual.value = { ...reserva.Venta.Persona };
    } else {
      clienteParaFactura.value = null;
      datosClienteManual.value = { Nombre: '', ApellidoPaterno: '', ApellidoMaterno: '', CI: '' };
    }
    mostrarModalDatosCliente.value = true;
  }
};

const cerrarModalFactura = () => {
  mostrarModalFactura.value = false;
  reservaParaFacturar.value = null;
};

const cerrarModalDatosCliente = () => {
  mostrarModalDatosCliente.value = false;
  reservaSeleccionadaParaFactura.value = null;
  clienteParaFactura.value = null;
  queryClienteFactura.value = '';
};



const transformToPackage = async (item, targetPackage) => {
  if (!item || !targetPackage) return;

  const requiredQty = targetPackage.presentacion.Cantidad;
  const availableQty = item.Cantidad;
  const numPackages = Math.floor(availableQty / requiredQty);
  const remainingQty = availableQty % requiredQty;

  if (numPackages < 1) {
    showToastMessage('No hay suficiente cantidad para convertir a paquete.');
    return;
  }

  // Eliminar el item de producto original
  eliminarItemDeReserva(item);

  // Agregar el nuevo item de paquete
  const precioPaquete = getPrecioPaquete(targetPackage, false);
  const nuevoPaquete = {
    id: targetPackage.IdPaquete,
    type: 'paquete',
    nombre: targetPackage.Nombre,
    Cantidad: numPackages,
    precioUnitario: precioPaquete,
    subtotal: numPackages * precioPaquete,
    Modo: 0,
  };
  reserva.value.detalles.Paquete.push(nuevoPaquete);

  // Si hay sobrante, agregarlo como un nuevo item de producto
  if (remainingQty > 0) {
    const precioProducto = await getPrecioProducto({ IdProducto: item.id }, false);
    const productoSobrante = {
      id: item.id,
      type: 'producto',
      nombre: item.nombre,
      Cantidad: remainingQty,
      precioUnitario: precioProducto,
      subtotal: remainingQty * precioProducto,
      Modo: 0,
    };
    reserva.value.detalles.Producto.push(productoSobrante);
  }

  showToastMessage(`${numPackages} paquete(s) creado(s) exitosamente.`);
};

// Lifecycle hooks
onMounted(async () => {
  if(store.Fecha!=="" && store.IdSucursal !==""){
  filtroFecha.value = store.Fecha;
  filtroSucursal.value = store.IdSucursal;
  ubicarPedido.value = store.IdPEdido;}
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.IdSucursal) {
      filtroSucursal.value = user.IdSucursal;
      TIeneSucursal.value = true;
      await Listarproductos(user.IdSucursal);
    } else {
      sucursales.value = await listarSucursales();
      // Mantener el valor por defecto 'TODOS'
    }
    await ListarPedidoSucursal(filtroSucursal.value, filtroFecha.value, filtroPago.value);
    await ListarPaquetes();
    await Listarpromocion();
    await ListarCLiente();
    await ListarMetodoPago();
    await listarBarriosData();
    await listartEntrega();
    await listartpedido();
    await ListarPago();
    await ListarCategoriasPrincipales();
  } catch (error) {
    console.error('Error al inicializar el componente:', error);
  }
});

const ListarPedidoSucursal = async (id, fecha, pago) => {
  try {
    const response = await listarPedidoSucursal(id, fecha, pago);
    reservas.value = response;
  } catch (error) {
    console.log(error);
  }
}
const ListarPago = async () => {
  try {
    const response = await listarPago();
    pago.value = response;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
};
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

const ListarPaquetes = async () => {
  try {
    const sucursalId = filtroSucursal.value === 'TODOS' ? null : filtroSucursal.value;
    const response = await listarPaquete(sucursalId);
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
    console.log(error);
  }
}

const ListarCLiente = async () => {
  try {
    const response = await listarCliente();
    cliente.value = response;
  } catch (error) {
    console.log(error);
  }
}

const ListarMetodoPago = async () => {
  try {
    const response = await listarMetodo();
    metodo.value = response;
  } catch (error) {
    console.log(error);
  }
}

const listarBarriosData = async () => {
  try {
    const response = await listarBarrios();
    barrios.value = response;
  } catch (error) {
    console.error('Error al obtener los barrios:', error);
  }
};

const listartEntrega = async () => {
  try {
    const response = await listarTipoEntrega();
    tEntrega.value = response;
    if (response.length > 0) {
      selectentrega.value = response[0].IdTipoEntrega;
    }
  } catch (error) {
    console.error('Error al obtener los tipos de entrega:', error);
  }
};

const listartpedido = async () => {
  try {
    const response = await listarTipopedido();
    tpedidos.value = response;
    if (response.length > 0) {
      selectpedido.value = response[0].IdTipoPedido;
    }
  } catch (error) {
    console.error('Error al obtener los tipos de pedido:', error);
  }
};
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
/* Animations for state badges */
.animate-pulse-yellow {
  animation: pulse-yellow 2s infinite;
}
@keyframes pulse-yellow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(234, 179, 8, 0); }
}

.animate-pulse-blue {
  animation: pulse-blue 2s infinite;
}
@keyframes pulse-blue {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
}

.animate-pulse-indigo {
  animation: pulse-indigo 2s infinite;
}
@keyframes pulse-indigo {
  0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
}

.animate-pulse-green {
  animation: pulse-green 2s infinite;
}
@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
}

.animate-spin-purple {
  animation: spin-purple 1.5s linear infinite;
  display: inline-block;
}
@keyframes spin-purple {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-tada-teal {
  animation: tada-teal 2.5s ease-in-out infinite;
}
@keyframes tada-teal {
  0% {transform: scale(1);}
  10%, 20% {transform: scale(0.9) rotate(-3deg);}
  30%, 50%, 70%, 90% {transform: scale(1.1) rotate(3deg);}
  40%, 60%, 80% {transform: scale(1.1) rotate(-3deg);}
  100% {transform: scale(1) rotate(0);}
}

.animate-shake-red {
  animation: shake-red 0.82s cubic-bezier(.36,.07,.19,.97) both;
  transform: translate3d(0, 0, 0);
}
@keyframes shake-red {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>