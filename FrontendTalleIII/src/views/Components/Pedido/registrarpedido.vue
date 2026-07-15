<template>
  <div>
    <!-- Header -->
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-linear-to-br from-orange-50 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
            <Package class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              {{ editingPedido ? 'Editar Pedido #' + editingPedido.idpedido : 'Registrar Nuevo Pedido' }}
            </h1>
            <p class="text-gray-600 text-sm">{{ editingPedido ? 'Modifica los datos del pedido' : 'Completa los datos del pedido' }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Quick Sale Toggle (only when not editing) -->
          <button 
            v-if="!editingPedido"
            @click="isQuickSale = !isQuickSale"
            :class="['px-4 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg', isQuickSale ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']"
          >
            <Zap class="h-5 w-5" />
            {{ isQuickSale ? 'Venta Rápida Activa' : '¿Es Venta Rápida?' }}
          </button>

          <button
            @click="$emit('cancel')"
            class="px-6 py-3 rounded-2xl bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group font-bold"
          >
            <CheckCircle class="h-5 w-5 group-hover:scale-110 transition-transform" />
            Finalizar registros
          </button>

          <button
            @click="$emit('cancel')"
            class="p-3 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <X class="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario de Pedido -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Columna Izquierda: Cliente e Ítems -->
      <div class="space-y-6">
        <!-- Cliente Section -->
        <div class="relative z-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User class="h-6 w-6 text-orange-500" />
              Cliente
            </h3>
            <!-- Mayorista Toggle -->
            <button 
              @click="isMayorista = !isMayorista"
              :class="['px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm', isMayorista ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']"
            >
              <Crown class="h-4 w-4" />
              {{ isMayorista ? 'Cliente Mayorista' : '¿Es Mayorista?' }}
            </button>
          </div>

          <div class="flex justify-between items-center mb-2">
            <label class="text-sm font-semibold text-gray-700">Buscar Cliente</label>
            <button @click="abrirModalNuevoCliente" class="text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors">
              + Nuevo Cliente
            </button>
          </div>
          
          <div class="relative">
            <Combobox v-model="selectedCliente">
              <div class="relative mt-1">
                <div class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500">
                  <ComboboxInput
                    class="w-full border-none outline-none ring-0 focus:ring-0 focus:outline-none bg-transparent text-gray-700 placeholder-gray-400"
                    :displayValue="(cliente) => cliente ? `${cliente.nombre || ''} ${cliente.apellidopaterno || ''} ${cliente.apellidomaterno || ''}`.trim() : ''"
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
                  <ComboboxOptions class="absolute z-50 mt-1 w-full bg-white rounded-2xl shadow-lg border max-h-60 overflow-auto">
                    <div v-if="filteredClientes.length === 0 && queryCliente !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                      No se encontraron clientes.
                    </div>
                    <ComboboxOption
                      v-for="cliente in filteredClientes"
                      :key="cliente.idpersona"
                      :value="cliente"
                      v-slot="{ selected, active }"
                    >
                      <li :class="{
                        'bg-orange-500 text-white': active,
                        'text-gray-900': !active,
                        'relative cursor-default select-none py-3 pl-10 pr-4': true,
                      }">
                        <div :class="{ 'font-medium': selected, 'font-normal': !selected }" class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                            <img v-if="cliente.imagen" :src="cliente.imagen" :alt="cliente.nombre" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold text-xs">
                              {{ cliente.nombre?.charAt(0) }}{{ cliente.apellidopaterno?.charAt(0) }}
                            </div>
                          </div>
                          <div class="flex flex-col min-w-0">
                            <span class="truncate block">{{ cliente.nombre }} {{ cliente.apellidopaterno || '' }}</span>
                            <span :class="['text-xs block', active ? 'text-orange-100' : 'text-gray-500']">CI: {{ cliente.documento || 'S/D' }}</span>
                          </div>
                        </div>
                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3">
                          <CheckIcon :class="[active ? 'text-white' : 'text-orange-600', 'h-5 w-5']" aria-hidden="true" />
                        </span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
          </div>

          <div v-if="selectedCliente?.idpersona" class="mt-4 bg-green-50 border border-green-200 rounded-2xl p-3 flex justify-between items-center">
            <div>
              <p class="font-semibold text-green-800">{{ selectedCliente.nombre }} {{ selectedCliente.apellidopaterno || '' }}</p>
            </div>
            <button @click="selectedCliente = null" class="text-red-500 hover:text-red-700">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Registro y Entrega Info -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 space-y-4">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin v-if="!isQuickSale" class="h-6 w-6 text-orange-500" />
            <Calendar v-else class="h-6 w-6 text-orange-500" />
            {{ isQuickSale ? 'Datos de Registro' : 'Registro y Entrega' }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Registro</label>
              <input v-model="fechaRegistro" type="date" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Hora Registro</label>
              <input v-model="horaRegistro" type="time" step="1" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
            </div>
            
            <template v-if="!isQuickSale">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo Pedido</label>
                <select v-model="idTipoPedido" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all">
                  <option v-for="t in tiposPedido" :key="t.idtipopedido" :value="t.idtipopedido">{{ t.nombre }}</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Link Ubicación</label>
                <input v-model="linkUbicacion" type="text" placeholder="URL Google Maps" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
              </div>
            </template>
          </div>

          <template v-if="!isQuickSale">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Dirección de Entrega</label>
              <textarea v-model="direccionEntrega" rows="2" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" placeholder="Calle, # Casa, Barrio..."></textarea>
            </div>
            
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Referencia</label>
              <input v-model="referenciaEntrega" type="text" placeholder="Ej: Portón café, frente al parque" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
            </div>
          </template>
        </div>

          <!-- Catalog Items -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package class="h-6 w-6 text-orange-500" />
              Catálogo de Productos
            </h3>

            <!-- Sucursal Filter -->
            <div class="mb-4">
              <label class="text-sm font-semibold text-gray-700">Sucursal</label>
              <select v-model="selectedSucursalId" @change="onSucursalChange" :disabled="sucursalFija"
                class="w-full mt-1 px-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md">
                <option value="" disabled>Seleccionar sucursal</option>
                <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">{{ s.nombre }}</option>
              </select>
            </div>
            
            <div class="mb-4">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search class="h-5 w-5 text-gray-400" />
                    </div>
                    <input v-model="filtroNombre" type="text" placeholder="Buscar producto o promoción..." class="w-full pl-10 pr-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              </div>
          </div>

          <div class="mb-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <nav class="flex space-x-4" aria-label="Tabs">
                  <button @click="activeTab = 'productos'"
                      :class="['px-3 py-2 font-medium text-sm rounded-t-lg transition-colors', activeTab === 'productos' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700']">
                      Productos
                  </button>
                  <button @click="activeTab = 'promociones'"
                      :class="['px-3 py-2 font-medium text-sm rounded-t-lg transition-colors', activeTab === 'promociones' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700']">
                      Promociones
                  </button>
              </nav>
          </div>

          <!-- Items Grid -->
          <div v-if="loadingItems" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>

          <div v-else class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto p-1 pr-2">
                <!-- Productos -->
                <template v-if="activeTab === 'productos'">
                  <Productocard 
                    v-for="producto in productosConStockReal" 
                    :key="producto.idproducto || producto.IdProducto"
                    :producto="producto"
                    @select-medida="agregarProducto"
                  />
                </template>

                <!-- Promociones -->
                <template v-if="activeTab === 'promociones'">
                  <PromocionCard 
                    v-for="promo in promocionesConLimiteReal" 
                    :key="promo.idpromocion || promo.IdPromocion"
                    :promo="promo"
                    :hideActions="true"
                    @click="agregarPromocion(promo)"
                  />
                </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Resumen de Pedido -->
      <div class="space-y-6">
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex flex-col h-full max-h-[900px]">
          <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingCart class="h-7 w-7 text-orange-500" />
            Carrito de Pedido
          </h3>
          
          <div class="flex-1 overflow-y-auto bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <div v-if="carrito.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500 py-10 opacity-30">
              <ShoppingCart class="h-16 w-16 mb-4" />
              <p class="text-lg font-bold">Carrito vacío</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="(item, index) in carrito" :key="index" class="bg-white p-4 rounded-2xl shadow-sm border border-orange-50 flex items-center gap-4">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-800 truncate">{{ item.nombre }}</p>
                  <p class="text-[10px] text-gray-500 font-bold uppercase" v-if="item.medidaNombre">{{ item.medidaNombre }}</p>
                  <p class="text-xs text-green-600 font-bold">Bs. {{ item.precioUnitario }}</p>
                </div>
                
                <div class="flex items-center gap-2 bg-orange-50 rounded-xl p-1 shrink-0">
                  <button @click="actualizarCantidad(index, -1)" class="w-8 h-8 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-500 hover:text-white transition-all font-bold">-</button>
                  <input type="number" :value="item.cantidad" @change="onDirectQtyChange(index, $event.target.value)" class="w-10 text-center font-bold text-orange-700 bg-transparent border-none focus:ring-0 text-sm" />
                  <button @click="actualizarCantidad(index, 1)" class="w-8 h-8 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-500 hover:text-white transition-all font-bold">+</button>
                </div>

                <button @click="removerDelCarrito(index)" class="text-red-400 hover:text-red-600 p-2 shrink-0"><Trash2 class="h-5 w-5" /></button>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <span class="text-gray-600 font-medium">Total Pedido</span>
              <span class="text-2xl font-black text-gray-800">Bs. {{ total.toFixed(2) }}</span>
            </div>

            <!-- Vendedor -->
            <div class="mb-4">
              <label class="text-sm font-semibold text-gray-700 block mb-1">Vendedor</label>
              <select v-model="selectedUsuarioId"
                class="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium">
                <option value="" disabled>Seleccionar vendedor</option>
                <option v-for="u in usuariosSucursal" :key="u.IdUsuario" :value="u.IdUsuario">
                  {{ u.Persona?.nombre || u.nombre }} {{ u.Persona?.apellidopaterno || u.apellidopaterno || '' }}
                </option>
              </select>
            </div>

            <!-- Quick Sale Payment Section -->
            <div v-if="isQuickSale" class="bg-green-50 rounded-3xl p-6 mb-4 border border-green-100 space-y-4 animate-fade-in">
              <h4 class="text-sm font-bold text-green-800 uppercase tracking-widest flex items-center gap-2">
                <DollarSign class="h-4 w-4" /> Pago de Venta Rápida
              </h4>
              
              <div class="space-y-2">
                <label class="text-xs font-bold text-green-700">Monto Recibido</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold">Bs.</span>
                  <input 
                    v-model.number="montoRecibido" 
                    type="number" 
                    class="w-full pl-10 pr-4 py-3 bg-white border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-xl font-bold text-green-700" 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div class="flex justify-between items-center bg-white/50 p-3 rounded-2xl border border-green-100">
                <span class="text-sm text-green-800">Cambio:</span>
                <span class="font-black text-green-600">Bs. {{ Math.max(0, montoRecibido - total).toFixed(2) }}</span>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-bold text-green-700">Método de Pago</label>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    v-for="m in metodosPago" :key="m.IdMetodoPago"
                    @click="metodoPagoId = m.IdMetodoPago"
                    type="button"
                    :class="['py-2 rounded-xl border-2 transition-all font-bold text-xs', metodoPagoId === m.IdMetodoPago ? 'border-green-500 bg-white text-green-600 shadow-sm' : 'border-transparent bg-green-100/50 text-green-400']"
                  >
                    {{ m.Nombre }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Adelanto Section (Only if Reserva and NOT Quick Sale) -->
            <div v-if="esReserva && !isQuickSale" class="bg-orange-50 rounded-2xl p-4 border border-orange-100 space-y-4 mb-4">
              <div class="flex items-center gap-2 text-orange-800">
                <AlertTriangle class="h-4 w-4 shrink-0" />
                <span class="text-xs font-bold uppercase">Es una Reserva (50% Adelanto)</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-orange-600">Monto Adelanto</label>
                  <input v-model.number="adelanto" type="number" class="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl outline-none font-bold text-orange-700" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-orange-600">Método Adelanto</label>
                  <select v-model="metodoAdelanto" class="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl outline-none text-xs font-bold">
                    <option v-for="m in metodosPago" :key="m.IdMetodoPago" :value="m.IdMetodoPago">{{ m.Nombre }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex gap-4">
              <button @click="$emit('cancel')" class="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
              <button 
                @click="finalizarPedido" 
                :disabled="carrito.length === 0 || !selectedCliente"
                class="flex-2 bg-linear-to-r from-orange-500 to-red-600 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {{ editingPedido ? 'Guardar Cambios' : (isQuickSale ? 'Realizar Venta Rápida' : 'Registrar Pedido') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pedidos Realizados en esta Sesión -->
    <div v-if="props.pedidosSesion && props.pedidosSesion.length > 0" class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 animate-fade-in mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Receipt class="h-6 w-6 text-orange-500" />
          Pedidos Realizados (Sesión)
        </h3>
        <span class="px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold">
          {{ props.pedidosSesion.length }} registros
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-gray-400 text-sm uppercase tracking-wider">
              <th class="px-4 py-3 font-semibold">ID / Hora</th>
              <th class="px-4 py-3 font-semibold">Cliente</th>
              <th class="px-4 py-3 font-semibold">Monto</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
              <th class="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="ped in props.pedidosSesion" :key="ped.idpedido" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-4 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-gray-700">#{{ ped.idpedido }}</span>
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <Clock class="h-3 w-3" /> {{ ped.hora || 'Ahora' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800">{{ ped.Persona?.Nombre || 'Consumidor Final' }}</span>
                  <span class="text-xs text-gray-500">{{ ped.Persona?.ApellidoPaterno || '' }}</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="font-bold text-green-600">Bs. {{ parseFloat(ped.total).toFixed(2) }}</span>
              </td>
              <td class="px-4 py-4">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase', 
                  ped.estado === 1 ? 'bg-orange-100 text-orange-600' : 
                  ped.estado === 2 ? 'bg-blue-100 text-blue-600' : 
                  ped.estado === 3 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                  {{ ped.estado === 1 ? 'Pendiente' : ped.estado === 2 ? 'Enviado' : ped.estado === 3 ? 'Finalizado' : 'Anulado' }}
                </span>
              </td>
              <td class="px-4 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="$emit('open-comprobante', ped)" class="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors" title="Ver Comprobante"><Eye class="h-4 w-4" /></button>
                  <button @click="$emit('open-comprobante', ped)" class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Imprimir"><Printer class="h-4 w-4" /></button>
                  <button v-if="ped.estado === 1" @click="$emit('editar', ped)" class="p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors" title="Editar"><Pencil class="h-4 w-4" /></button>
                  <button v-if="ped.estado !== 0" @click="$emit('anular', ped.idpedido)" class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Anular"><X class="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Nuevo Cliente -->
    <Transition name="fade-backdrop">
      <div v-if="showNuevoClienteModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
        <div class="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-in">
          <div class="bg-linear-to-r from-orange-600 to-red-700 p-8 text-white relative">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 class="text-2xl font-bold tracking-tight relative z-10">Nuevo Cliente</h3>
            <p class="text-orange-100 text-sm font-medium mt-1 relative z-10">
              Registra un nuevo cliente en el sistema
            </p>
          </div>

          <div class="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Nombre *</label>
                <input v-model="nuevoCliente.nombre" type="text" placeholder="Nombre"
                  @input="nuevoClienteError.nombre = validarCampoCliente('nombre', nuevoCliente.nombre)"
                  @blur="nuevoClienteError.nombre = validarCampoCliente('nombre', nuevoCliente.nombre)"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                <p v-if="nuevoClienteError.nombre" class="text-red-500 text-xs mt-0.5">{{ nuevoClienteError.nombre }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Apellido Paterno *</label>
                <input v-model="nuevoCliente.apellidoPaterno" type="text" placeholder="Apellido Paterno"
                  @input="nuevoClienteError.apellidoPaterno = validarCampoCliente('apellidoPaterno', nuevoCliente.apellidoPaterno)"
                  @blur="nuevoClienteError.apellidoPaterno = validarCampoCliente('apellidoPaterno', nuevoCliente.apellidoPaterno)"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                <p v-if="nuevoClienteError.apellidoPaterno" class="text-red-500 text-xs mt-0.5">{{ nuevoClienteError.apellidoPaterno }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Apellido Materno</label>
                <input v-model="nuevoCliente.apellidoMaterno" type="text" placeholder="Apellido Materno"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Género *</label>
                <div class="flex gap-2">
                  <button type="button" v-for="g in generos" :key="g.value" @click="nuevoCliente.genero = g.value"
                    :class="['flex-1 py-3 rounded-2xl font-semibold text-sm border-2 transition-all', nuevoCliente.genero === g.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300']">
                    {{ g.label }}
                  </button>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Fecha de Nacimiento</label>
                <input v-model="nuevoCliente.fechaNacimiento" type="date"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Celular *</label>
                <input v-model="nuevoCliente.celular" type="text" placeholder="Número de celular"
                  @input="nuevoClienteError.celular = validarCampoCliente('celular', nuevoCliente.celular)"
                  @blur="nuevoClienteError.celular = validarCampoCliente('celular', nuevoCliente.celular)"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                <p v-if="nuevoClienteError.celular" class="text-red-500 text-xs mt-0.5">{{ nuevoClienteError.celular }}</p>
              </div>
              <div class="md:col-span-2 space-y-1">
                <label class="text-sm font-semibold text-gray-700">Cédula de Identidad *</label>
                <div class="flex">
                  <input v-model="nuevoCliente.documento" type="text" placeholder="Número de CI"
                    @input="nuevoClienteError.documento = validarCampoCliente('documento', nuevoCliente.documento)"
                    @blur="nuevoClienteError.documento = validarCampoCliente('documento', nuevoCliente.documento)"
                    class="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-l-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                  <select v-model="nuevoCliente.idComplemento"
                    class="px-3 py-3 bg-gray-50 border-l border-gray-200 rounded-r-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner">
                    <option value="">Sin complemento</option>
                    <option v-for="comp in complementos" :key="comp.idcomplemento ?? comp.IdComplemento" :value="comp.idcomplemento ?? comp.IdComplemento">
                      {{ comp.nombre ?? comp.Nombre ?? comp.descripcion ?? comp.Descripcion }}
                    </option>
                  </select>
                </div>
                <p v-if="nuevoClienteError.documento" class="text-red-500 text-xs mt-0.5">{{ nuevoClienteError.documento }}</p>
              </div>
              <div class="md:col-span-2 space-y-1">
                <label class="text-sm font-semibold text-gray-700">Email *</label>
                <input v-model="nuevoCliente.email" type="email" placeholder="correo@gmail.com"
                  @input="nuevoClienteError.email = validarCampoCliente('email', nuevoCliente.email)"
                  @blur="nuevoClienteError.email = validarCampoCliente('email', nuevoCliente.email)"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                <p v-if="nuevoClienteError.email" class="text-red-500 text-xs mt-0.5">{{ nuevoClienteError.email }}</p>
              </div>
            </div>

            <div class="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-4">
              <div class="space-y-1">
                <label class="text-sm font-semibold text-gray-700">Barrio</label>
                <Combobox v-model="nuevoCliente.barrio" by="idbarrio">
                  <div class="relative">
                    <ComboboxInput
                      class="w-full pl-4 pr-10 py-3 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner"
                      :displayValue="(b) => b?.nombre || ''"
                      @change="queryBarrio = $event.target.value"
                      placeholder="Buscar barrio..."
                    />
                    <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
                    </ComboboxButton>
                    <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryBarrio = ''">
                      <ComboboxOptions class="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5">
                        <div v-if="barriosFiltrados.length === 0 && queryBarrio !== ''" class="px-4 py-3 text-gray-500 select-none">
                          No se encontraron resultados.
                        </div>
                        <ComboboxOption v-for="barrio in barriosFiltrados" :key="barrio.idbarrio" :value="barrio" v-slot="{ selected, active }">
                          <li :class="[active ? 'bg-orange-500 text-white' : 'text-gray-700', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                            <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ barrio.nombre }}</span>
                            <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3">
                              <CheckIcon class="h-5 w-5" :class="active ? 'text-white' : 'text-orange-500'" />
                            </span>
                          </li>
                        </ComboboxOption>
                      </ComboboxOptions>
                    </TransitionRoot>
                  </div>
                </Combobox>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-sm font-semibold text-gray-700">Dirección</label>
                  <input v-model="nuevoCliente.direccion" type="text" placeholder="Calle y número"
                    class="w-full px-4 py-3 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-semibold text-gray-700">Referencia</label>
                  <input v-model="nuevoCliente.referencia" type="text" placeholder="Ej: frente al parque"
                    class="w-full px-4 py-3 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-orange-500/20 text-gray-700 outline-none shadow-inner" />
                </div>
              </div>
            </div>

            <div class="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <label class="text-sm font-semibold text-gray-700 block mb-2">Foto de Perfil</label>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 border-2 border-orange-200">
                  <img v-if="previewImagen" :src="previewImagen" class="w-full h-full object-cover" />
                  <User v-else class="h-6 w-6 text-gray-400" />
                </div>
                <input type="file" accept="image/*" @change="onImagenSeleccionada"
                  class="flex-1 py-2.5 px-4 bg-white border-0 rounded-2xl text-sm text-gray-700 outline-none shadow-inner file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-all" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-sm font-semibold text-gray-700">Tipo de Cliente</label>
              <div class="flex gap-2">
                <button type="button" v-for="t in tiposCliente" :key="t.value" @click="nuevoCliente.tipoCliente = t.value"
                  :class="['flex-1 py-3 rounded-2xl font-semibold text-sm border-2 transition-all', nuevoCliente.tipoCliente === t.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300']">
                  {{ t.label }}
                </button>
              </div>
            </div>

            <div class="pt-4 flex flex-col gap-3">
              <button @click="guardarNuevoCliente" :disabled="!nuevoClienteValido || guardandoNuevoCliente"
                class="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <Loader2 v-if="guardandoNuevoCliente" class="h-5 w-5 animate-spin" />
                <template v-else><UserPlus class="h-5 w-5" /> REGISTRAR CLIENTE</template>
              </button>
              <button @click="showNuevoClienteModal = false" class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-semibold text-sm hover:bg-gray-200">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { 
  Package, X, User, Search, Trash2, ClipboardList, MapPin, ShoppingCart, 
  Crown, CheckCircle, AlertTriangle, Zap, DollarSign, Eye, Printer, Pencil, Receipt, Clock, Calendar,
  UserPlus, Loader2
} from 'lucide-vue-next';
import { 
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, TransitionRoot 
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

// Components
import Productocard from '../Venta/Productocard.vue';
import PromocionCard from '../Promocion/PromocionCard.vue';

// Services
import { ListarProductosOnSucursal, getPrecioProducto } from '@/Server/Producto';
import { listarPromociones } from '@/Server/Promocion';
import { listarCategorias, ObtenerSubCategorias } from '@/Server/Categoria';
import { listarCliente } from '@/Server/persona';
import { listarPago } from '@/Server/Pago';
import { listarTipopedido } from '@/Server/Pedido';
import { Listsucursal } from '@/Server/Sucural';
import { listarUsuarioSucursal, SucursalUsuario } from '@/Server/Usuario';
import { RegistrarPersona } from '@/Server/persona';
import { listarComplemento, listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';
import { SubirFoto, listarBarrios } from '@/Server/api';

const props = defineProps({
  sucursalId: { type: String, default: '' },
  initialItems: { type: Array, default: () => [] },
  editingPedido: { type: Object, default: null },
  pedidosSesion: { type: Array, default: () => [] }
});

const emit = defineEmits(['cancel', 'open-new-client', 'success', 'success-rapido', 'editar', 'anular', 'open-comprobante']);

// State
const activeTab = ref('productos');
const isMayorista = ref(false);
const isQuickSale = ref(false);
const loadingItems = ref(false);
const productos = ref([]);
const promociones = ref([]);
const categorias = ref([]);
const subcategorias = ref([]);
const clientes = ref([]);
const metodosPago = ref([]);
const tiposPedido = ref([]);

const selectedCliente = ref(null);
const queryCliente = ref('');

// Sucursal y Usuario State
const sucursales = ref([]);
const selectedSucursalId = ref('');
const selectedUsuarioId = ref('');
const usuariosSucursal = ref([]);
const sucursalFija = ref(false);
const idTipoPedido = ref('');
const esReserva = computed(() => {
  if (!idTipoPedido.value) return false;
  const id = idTipoPedido.value.toString().toUpperCase();
  if (id === 'ITP-P2') return true;
  
  const tipo = tiposPedido.value.find(t => t.idtipopedido === idTipoPedido.value);
  return tipo?.nombre?.toLowerCase().includes('reserva');
});
const direccionEntrega = ref('');
const referenciaEntrega = ref('');
const linkUbicacion = ref('');
const fechaRegistro = ref(new Date().toISOString().split('T')[0]);
const horaRegistro = ref(new Date().toLocaleTimeString('en-GB', { hour12: false }));
const adelanto = ref(0);
const metodoAdelanto = ref(1);

const montoRecibido = ref(0);
const metodoPagoId = ref(1);

const carrito = ref([]);
const notification = ref(null);
const preciosRangos = ref(new Map());

const total = computed(() => carrito.value.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0));

watch([total, esReserva, isQuickSale], ([newTotal, isRes, isQuick]) => {
  if (isQuick) adelanto.value = 0;
  else if (isRes) adelanto.value = parseFloat((newTotal * 0.5).toFixed(2));
  else adelanto.value = 0;
}, { immediate: true });

watch([total, isQuickSale], ([newTotal, isQuick]) => {
  if (isQuick) montoRecibido.value = newTotal;
});

const filtroCategoria = ref('TODOS');
const filtroSubcategoria = ref('TODOS');
const filtroNombre = ref('');

const paginacionProd = reactive({ paginaActual: 1, totalPaginas: 1, total: 0, limite: 12 });
const paginacionPromo = reactive({ paginaActual: 1, totalPaginas: 1, total: 0, limite: 12 });

let debounceTimer = null;

const cargarSucursales = async () => {
  try { const res = await Listsucursal(); sucursales.value = res?.result || res || []; } catch (e) { console.error(e); }
};

const cargarUsuariosSucursal = async () => {
  if (!selectedSucursalId.value) { usuariosSucursal.value = []; return; }
  try {
    const res = await listarUsuarioSucursal(selectedSucursalId.value);
    usuariosSucursal.value = Array.isArray(res) ? res : (res?.data || res?.result || []);
  } catch (e) { console.error(e); usuariosSucursal.value = []; }
};

const onSucursalChange = () => {
  selectedUsuarioId.value = '';
  cargarUsuariosSucursal();
  fetchItems();
};

// Nuevo Cliente Modal State
const showNuevoClienteModal = ref(false);
const guardandoNuevoCliente = ref(false);
const docsRegistrados = ref([]);
const emailsRegistrados = ref([]);
const numerosRegistrados = ref([]);
const complementos = ref([]);
const barrios = ref([]);
const queryBarrio = ref('');
const barriosFiltrados = computed(() => {
  if (!queryBarrio.value) return barrios.value;
  const q = queryBarrio.value.toLowerCase();
  return barrios.value.filter(b => b.nombre?.toLowerCase().includes(q));
});
const archivoImagen = ref(null);
const previewImagen = ref('');
const generos = [
  { value: 1, label: 'Hombre' },
  { value: 2, label: 'Mujer' },
  { value: 3, label: 'Otro' }
];
const tiposCliente = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'EMPRESA', label: 'Empresa' }
];
const nuevoCliente = reactive({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  celular: '',
  documento: '',
  idComplemento: '',
  email: '',
  fechaNacimiento: '',
  tipoCliente: 'NORMAL',
  genero: 1,
  barrio: null,
  direccion: '',
  referencia: ''
});
const nuevoClienteError = reactive({
  nombre: '',
  apellidoPaterno: '',
  celular: '',
  documento: '',
  email: ''
});
const nuevoClienteValido = computed(() => {
  return nuevoCliente.nombre.trim()
    && nuevoCliente.apellidoPaterno.trim()
    && nuevoCliente.celular.trim()
    && nuevoCliente.documento.trim()
    && nuevoCliente.email.trim()
    && nuevoCliente.genero
    && !Object.values(nuevoClienteError).some(e => e);
});

const onImagenSeleccionada = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  archivoImagen.value = file;
  previewImagen.value = URL.createObjectURL(file);
};

const limpiarErroresCliente = () => {
  Object.keys(nuevoClienteError).forEach(k => nuevoClienteError[k] = '');
};

const validarCampoCliente = (campo, value) => {
  let error = '';
  switch (campo) {
    case 'nombre':
      if (!value?.trim()) error = 'El nombre es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]+$/.test(value)) error = 'Solo letras y espacios.';
      break;
    case 'apellidoPaterno':
      if (!value?.trim()) error = 'El apellido paterno es requerido.';
      else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]+$/.test(value)) error = 'Solo letras y espacios.';
      break;
    case 'email':
      if (!value) error = 'El correo es requerido.';
      else if ((value.match(/@/g) || []).length !== 1) error = 'Debe contener exactamente un @';
      else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = 'El correo no tiene un formato valido.';
      else if (!/^[a-zA-Z0-9._]+@/.test(value)) error = 'Caracteres no válidos en el correo.';
      else if (emailsRegistrados.value.some(e => (e.email || e.Email || '').toLowerCase() === value.toLowerCase())) {
        error = 'Este correo ya está en uso.';
      }
      break;
    case 'documento':
      if (!value?.trim()) error = 'El CI es requerido.';
      else if (!/^\d+$/.test(value)) error = 'Solo números.';
      else if (docsRegistrados.value.some(d => (d.documento || d.Documento) === value)) {
        error = 'Este CI ya está registrado.';
      }
      break;
    case 'celular':
      if (!value?.trim()) error = 'El celular es requerido.';
      else if (/\D/.test(value)) error = 'Solo números.';
      else if (value.length < 7) error = 'Debe tener al menos 7 dígitos.';
      else if (numerosRegistrados.value.some(c => (c.numero || c.Numero) === value)) {
        error = 'Este número ya está registrado.';
      }
      break;
  }
  return error;
};

const validarFormCliente = () => {
  limpiarErroresCliente();
  nuevoClienteError.nombre = validarCampoCliente('nombre', nuevoCliente.nombre);
  nuevoClienteError.apellidoPaterno = validarCampoCliente('apellidoPaterno', nuevoCliente.apellidoPaterno);
  nuevoClienteError.email = validarCampoCliente('email', nuevoCliente.email);
  nuevoClienteError.documento = validarCampoCliente('documento', nuevoCliente.documento);
  nuevoClienteError.celular = validarCampoCliente('celular', nuevoCliente.celular);
  return !Object.values(nuevoClienteError).some(e => e);
};

const abrirModalNuevoCliente = () => {
  nuevoCliente.nombre = '';
  nuevoCliente.apellidoPaterno = '';
  nuevoCliente.apellidoMaterno = '';
  nuevoCliente.celular = '';
  nuevoCliente.documento = '';
  nuevoCliente.idComplemento = '';
  nuevoCliente.email = '';
  nuevoCliente.fechaNacimiento = '';
  nuevoCliente.tipoCliente = 'NORMAL';
  nuevoCliente.genero = 1;
  nuevoCliente.barrio = null;
  nuevoCliente.direccion = '';
  nuevoCliente.referencia = '';
  archivoImagen.value = null;
  previewImagen.value = '';
  limpiarErroresCliente();
  showNuevoClienteModal.value = true;
  if (barrios.value.length === 0) {
    listarBarrios().then(res => {
      barrios.value = res?.data || res?.result || res || [];
    }).catch(() => {});
  }
};

const guardarNuevoCliente = async () => {
  if (!validarFormCliente()) return;
  guardandoNuevoCliente.value = true;
  try {
    let imageUrl = '';
    if (archivoImagen.value) {
      imageUrl = await SubirFoto(archivoImagen.value);
    }

    const personaPayload = {
      Nombre: nuevoCliente.nombre.trim(),
      ApellidoPaterno: nuevoCliente.apellidoPaterno.trim(),
      ApellidoMaterno: nuevoCliente.apellidoMaterno.trim() || null,
      Email: nuevoCliente.email.trim(),
      IdGenero: nuevoCliente.genero,
      FechaNacimiento: nuevoCliente.fechaNacimiento || null,
      Url: imageUrl,
      Celulares: [{ Numero: nuevoCliente.celular.trim() }],
      Documento: [{ Documento: nuevoCliente.documento.trim(), IdTipodocumento: 2, Complemento: nuevoCliente.idComplemento || null }],
      IdBarrio: nuevoCliente.barrio?.idbarrio ?? null,
      Direccion: nuevoCliente.direccion.trim(),
      Referencia: nuevoCliente.referencia.trim(),
      Tipo: nuevoCliente.tipoCliente
    };

    const respPersona = await RegistrarPersona(personaPayload);
    const idPersona = respPersona?.IdPersona || respPersona?.idpersona || respPersona?.data?.IdPersona;

    if (!idPersona) throw new Error('No se pudo obtener el ID de la persona creada');

    showNuevoClienteModal.value = false;
    showNotification('Cliente registrado correctamente', 'success');

    // Refresh clients list
    try {
      const clis = await listarCliente();
      clientes.value = Array.isArray(clis) ? clis : (clis.data || clis.result || []);
    } catch (e) { console.error(e); }

    // Select the new client
    const nuevoClienteObj = clientes.value.find(c => (c.idpersona || c.IdPersona) === idPersona);
    if (nuevoClienteObj) selectedCliente.value = nuevoClienteObj;
  } catch (error) {
    console.error(error);
    showNotification('Error al registrar el cliente', 'error');
  } finally {
    guardandoNuevoCliente.value = false;
  }
};

const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => notification.value = null, 3000);
};

const getProdId = (obj) => obj?.idproducto || obj?.IdProducto;
const getPromoId = (obj) => obj?.idpromocion || obj?.IdPromocion;
const getCantidadProp = (obj) => parseFloat(obj?.Cantidad || obj?.cantidad || 0);

const calcularPrecioDinamico = (idPaquete, cantidad, precioBase) => {
  if (!isMayorista.value) return precioBase;
  const rangos = preciosRangos.value.get(idPaquete);
  if (!rangos || rangos.length === 0) return precioBase;
  let precioAplicable = precioBase;
  const rangosOrdenados = [...rangos].sort((a, b) => b.cantidadminima - a.cantidadminima);
  for (const r of rangosOrdenados) {
    if (cantidad >= r.cantidadminima) {
      precioAplicable = parseFloat(r.precio);
      break;
    }
  }
  return precioAplicable;
};

const actualizarTodosLosPrecios = () => {
  carrito.value.forEach(item => {
    if (item.type === 'producto') {
      const prod = productos.value.find(p => getProdId(p) === item.id);
      if (prod) {
        const med = prod.medidas?.find(m => m.idproductomedida === item.idPaquete);
        if (med) {
          const base = med.precioventa || med.Precio;
          item.precioUnitario = calcularPrecioDinamico(item.idPaquete, item.cantidad, parseFloat(base || 0));
        }
      }
    }
  });
};

const productosConStockReal = computed(() => {
  return productos.value.map(p => {
    const productId = getProdId(p);
    const usadoDirecto = carrito.value
      .filter(i => i.type === 'producto' && i.id === productId)
      .reduce((acc, i) => acc + (i.cantidad * (parseFloat(i.multiplicador) || 1)), 0);
    const usadoEnPromos = carrito.value
      .filter(i => i.type === 'promocion')
      .reduce((acc, cartItem) => {
        const promoData = promociones.value.find(pr => getPromoId(pr) === cartItem.id);
        const componentes = promoData?.Productos || promoData?.Promocionproducto || [];
        const consumption = componentes
          .filter(pp => {
             const innerProdId = getProdId(pp.Productomedida?.Producto) || getProdId(pp.Productomedida) || getProdId(pp);
             return innerProdId === productId;
          })
          .reduce((sum, pp) => {
            const unidadesFisicasPorPaquete = getCantidadProp(pp.Productomedida);
            const paquetesEnCombo = getCantidadProp(pp);
            return sum + (cartItem.cantidad * paquetesEnCombo * unidadesFisicasPorPaquete);
          }, 0);
        return acc + consumption;
      }, 0);
    return { ...p, cantidad: Math.max(0, (parseFloat(p.cantidad) || 0) - usadoDirecto - usadoEnPromos) };
  });
});

const promocionesConLimiteReal = computed(() => {
  return promociones.value.map(p => {
    const id = getPromoId(p);
    const limiteOriginal = parseInt(p.limiteuso || p.LimiteUso);
    const usado = carrito.value.filter(i => i.type === 'promocion' && i.id === id).reduce((acc, i) => acc + i.cantidad, 0);
    let limiteRestante = null;
    if (!isNaN(limiteOriginal) && limiteOriginal !== null && limiteOriginal > 0) limiteRestante = Math.max(0, limiteOriginal - usado);
    return { ...p, limiteuso: limiteRestante };
  });
});

const validatePromotionStock = (promo, additionalQty = 1) => {
  const componentes = promo.Productos || promo.Promocionproducto || [];
  for (const pp of componentes) {
    const prodId = getProdId(pp.Productomedida?.Producto) || getProdId(pp.Productomedida) || getProdId(pp);
    const productInStock = productosConStockReal.value.find(p => getProdId(p) === prodId);
    if (!productInStock) return false;
    const unidadesFisicasPorPaquete = getCantidadProp(pp.Productomedida);
    const paquetesEnCombo = getCantidadProp(pp);
    if ((additionalQty * paquetesEnCombo * unidadesFisicasPorPaquete) > productInStock.cantidad) return false;
  }
  return true;
};

const fetchItems = async () => {
  if (!selectedSucursalId.value) return;
  loadingItems.value = true;
  try {
    if (activeTab.value === 'productos') {
      const res = await ListarProductosOnSucursal(selectedSucursalId.value, filtroNombre.value, paginacionProd.limite, paginacionProd.paginaActual, filtroCategoria.value === 'TODOS' ? null : filtroCategoria.value, filtroSubcategoria.value === 'TODOS' ? null : filtroSubcategoria.value);
      productos.value = res.result || [];
      paginacionProd.total = parseInt(res.total) || productos.value.length;
      paginacionProd.totalPaginas = Math.ceil(paginacionProd.total / paginacionProd.limite) || 1;
    } else {
      const res = await listarPromociones(filtroNombre.value || undefined, undefined, 1, undefined, paginacionPromo.paginaActual, paginacionPromo.limite);
      promociones.value = res.data || res.result || [];
      paginacionPromo.total = parseInt(res.total) || promociones.value.length;
      paginacionPromo.totalPaginas = Math.ceil(paginacionPromo.total / paginacionPromo.limite) || 1;
    }
  } catch (e) { console.error(e); } finally { loadingItems.value = false; }
};

const agregarProducto = async ({ producto, medida }) => {
  const productId = getProdId(producto);
  const multiplicador = parseFloat(medida.cantidad || medida.Cantidad) || 1;
  const idPaquete = medida.idproductomedida || medida.IdPresentacion;
  if (isMayorista.value && !preciosRangos.value.has(idPaquete)) {
    try { const rangos = await getPrecioProducto(idPaquete); preciosRangos.value.set(idPaquete, rangos); } catch (e) {}
  }
  const existing = carrito.value.find(i => i.type === 'producto' && i.id === productId && i.idPaquete === idPaquete);
  if (existing) {
    existing.cantidad++;
    existing.precioUnitario = calcularPrecioDinamico(idPaquete, existing.cantidad, parseFloat(medida.precioventa || medida.Precio || 0));
  } else {
    carrito.value.push({ type: 'producto', id: productId, idPaquete, nombre: producto.nombre || producto.Nombre, medidaNombre: (typeof medida.presentacion === 'object' ? medida.presentacion.nombre : medida.presentacion) || medida.Nombre, precioUnitario: calcularPrecioDinamico(idPaquete, 1, parseFloat(medida.precioventa || medida.Precio || 0)), cantidad: 1, multiplicador });
  }
};

const agregarPromocion = (promo) => {
  const id = getPromoId(promo);
  const existing = carrito.value.find(i => i.type === 'promocion' && i.id === id);
  if (existing) existing.cantidad++;
  else carrito.value.push({ type: 'promocion', id, nombre: promo.nombre || promo.Nombre, precioUnitario: parseFloat(promo.preciopromocion || promo.precio || 0), cantidad: 1, limiteUso: parseInt(promo.limiteuso || promo.LimiteUso) });
};

const onDirectQtyChange = (index, val) => {
  const item = carrito.value[index];
  const newQty = Math.max(1, parseInt(val) || 1);
  item.cantidad = newQty;
  if (item.type === 'producto') {
    const prod = productos.value.find(p => getProdId(p) === item.id);
    if (prod) {
      const med = prod.medidas?.find(m => m.idproductomedida === item.idPaquete);
      if (med) item.precioUnitario = calcularPrecioDinamico(item.idPaquete, item.cantidad, parseFloat(med.precioventa || med.Precio || 0));
    }
  }
};

const actualizarCantidad = (index, delta) => onDirectQtyChange(index, carrito.value[index].cantidad + delta);
const removerDelCarrito = (idx) => carrito.value.splice(idx, 1);

const clearForm = () => {
  carrito.value = [];
  selectedCliente.value = null;
  queryCliente.value = '';
  direccionEntrega.value = '';
  referenciaEntrega.value = '';
  linkUbicacion.value = '';
  fechaRegistro.value = new Date().toISOString().split('T')[0];
  horaRegistro.value = new Date().toLocaleTimeString('en-GB', { hour12: false });
  adelanto.value = 0;
  isQuickSale.value = false;
  montoRecibido.value = 0;
};

const finalizarPedido = () => {
  const payload = {
    IdPersona: selectedCliente.value?.idpersona || selectedCliente.value?.IdPersona,
    IdSucursal: selectedSucursalId.value,
    IdUsuario: selectedUsuarioId.value || null,
    IdTipo: idTipoPedido.value,
    Direccion: direccionEntrega.value,
    Referencia: referenciaEntrega.value,
    Link: linkUbicacion.value,
    Tota: total.value,
    Detalle: isMayorista.value ? 'MAYORISTA' : 'NORMAL',
    Adelanto: esReserva.value ? adelanto.value : 0,
    IdMetodoPagoAdelanto: (esReserva.value && adelanto.value > 0) ? metodoAdelanto.value : null,
    FechaRegistro: fechaRegistro.value,
    Hora: horaRegistro.value,
  };
  const detalles = { Producto: carrito.value.map(i => ({ idPaquete: i.idPaquete || null, idPromocion: i.type === 'promocion' ? i.id : null, Cantidad: i.cantidad, Precio: i.precioUnitario })) };
  if (isQuickSale.value) {
    emit('success-rapido', payload, detalles, { Monto: montoRecibido.value, Cambio: Math.max(0, montoRecibido.value - total.value), IdMetodoPago: metodoPagoId.value });
  } else {
    emit('success', payload, detalles);
  }
  clearForm();
};

const filteredClientes = computed(() => {
  if (queryCliente.value === '') return clientes.value;
  const q = queryCliente.value.toLowerCase();
  return clientes.value.filter(c => `${c.nombre} ${c.apellidopaterno}`.toLowerCase().includes(q) || (c.documento && c.documento.toString().includes(q)));
});

onMounted(async () => {
  try {
    await cargarSucursales();
    const [cats, clis, pagos, tipos, docs, emails, nums, comps] = await Promise.all([
      listarCategorias(), listarCliente(), listarPago(), listarTipopedido(),
      listarDocumento(), listarEmail(), listarNumero(), listarComplemento()
    ]);
    categorias.value = cats.result || cats || [];
    clientes.value = Array.isArray(clis) ? clis : (clis.data || clis.result || []);
    metodosPago.value = pagos || [];
    tiposPedido.value = tipos || [];
    docsRegistrados.value = docs?.result || docs?.data || docs || [];
    emailsRegistrados.value = emails?.result || emails?.data || emails || [];
    numerosRegistrados.value = nums?.result || nums?.data || nums || [];
    complementos.value = comps?.result || comps?.data || comps || [];

    if (props.editingPedido) {
      const p = props.editingPedido;
      if (p.idsucursal || p.IdSucursal) {
        selectedSucursalId.value = p.idsucursal || p.IdSucursal;
        sucursalFija.value = false;
      }
      if (p.idusuario || p.IdUsuario) {
        selectedUsuarioId.value = p.idusuario || p.IdUsuario;
      }
      if (selectedSucursalId.value) await cargarUsuariosSucursal();
      idTipoPedido.value = p.Tipopedido?.IdTipoPedido || p.idtipopedido;
      direccionEntrega.value = p.direccionentrega || '';
      referenciaEntrega.value = p.referenciaentrega || '';
      linkUbicacion.value = p.linkubicacion || '';
      fechaRegistro.value = p.fecharegistro ? p.fecharegistro.split('T')[0] : new Date().toISOString().split('T')[0];
      horaRegistro.value = p.hora || new Date().toLocaleTimeString('en-GB', { hour12: false });
      isMayorista.value = p.detalle === 'MAYORISTA';
      adelanto.value = parseFloat(p.adelanto || 0);
      if (p.Persona) selectedCliente.value = clientes.value.find(c => (c.idpersona || c.IdPersona) === (p.Persona.IdPersona || p.Persona.idpersona));
      if (p.Detallepedido) {
        for (const det of p.Detallepedido) {
          if (det.Productomedida) {
            carrito.value.push({ type: 'producto', id: det.Productomedida.Producto?.IdProducto || det.Productomedida.Producto?.idproducto, idPaquete: det.Productomedida.IdProductoMedida || det.Productomedida.idproductomedida, nombre: det.Productomedida.Producto?.Nombre || det.Productomedida.Producto?.nombre, medidaNombre: det.Productomedida.Presentacion?.Nombre, precioUnitario: parseFloat(det.Precio), cantidad: det.Cantidad, multiplicador: parseFloat(det.Productomedida.Cantidad || 1) });
          } else if (det.Promocion) {
            carrito.value.push({ type: 'promocion', id: det.Promocion.IdPromocion || det.Promocion.idpromocion, nombre: det.Promocion.Nombre, precioUnitario: parseFloat(det.Precio), cantidad: det.Cantidad, limiteUso: det.Promocion.LimiteUso });
          }
        }
      }
    } else {
      if (tiposPedido.value.length > 0) idTipoPedido.value = tiposPedido.value[0].idtipopedido;
    }

    // Auto-select user's branch if not editing
    if (!props.editingPedido) {
      const u = JSON.parse(localStorage.getItem('usuario'));
      if (u?.IdUsuario) {
        try {
          const sucResp = await SucursalUsuario(u.IdUsuario);
          if (sucResp?.idsucursal) {
            selectedSucursalId.value = sucResp.idsucursal;
            sucursalFija.value = true;
          }
        } catch (e) { console.error(e); }
      }
      if (!selectedSucursalId.value && sucursales.value.length > 0) {
        selectedSucursalId.value = sucursales.value[0].idsucursal;
      }
      if (selectedSucursalId.value) {
        await cargarUsuariosSucursal();
        if (!selectedUsuarioId.value && u?.IdUsuario) {
          selectedUsuarioId.value = u.IdUsuario;
        }
      }
    }
  } catch (e) { console.error(e); }
  fetchItems();
});

watch(isMayorista, actualizarTodosLosPrecios);
watch(filtroCategoria, async (v) => { filtroSubcategoria.value = 'TODOS'; subcategorias.value = v !== 'TODOS' ? await ObtenerSubCategorias(v) : []; paginacionProd.paginaActual = 1; fetchItems(); });
watch([filtroSubcategoria, filtroNombre], () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { paginacionProd.paginaActual = 1; fetchItems(); }, 400); });
watch(() => props.sucursalId, (id) => {
  if (id && !selectedSucursalId.value) {
    selectedSucursalId.value = id;
    cargarUsuariosSucursal();
    fetchItems();
  }
});
</script>

<style scoped>
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
.fade-backdrop-enter-active,
.fade-backdrop-leave-active { transition: opacity 0.3s ease; }
.fade-backdrop-enter-from,
.fade-backdrop-leave-to { opacity: 0; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>