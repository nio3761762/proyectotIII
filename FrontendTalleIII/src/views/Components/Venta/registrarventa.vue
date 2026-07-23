<template>
  <div>
    <!-- Header -->
    <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-linear-to-br from-orange-50 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
            <ShoppingCart class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              {{ ventaParaEditar ? 'Editar Venta #' + (ventaParaEditar.idventa || ventaParaEditar.IdVenta) : 'Registrar Nueva Venta' }}
            </h1>
            <p class="text-gray-600 text-sm">
              {{ ventaParaEditar ? 'Modifica los datos de la venta existente' : 'Completa los datos de la venta' }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button
            @click="$emit('cancel')"
            class="px-6 py-3 rounded-2xl bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group font-bold"
          >
            <CheckCircle class="h-5 w-5 group-hover:scale-110 transition-transform" />
            Finalizar registros
          </button>
          
          <button
            @click="$emit('cancel')"
            class="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <X class="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario de Venta -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Columna Izquierda: Cliente e Ítems -->
      <div class="space-y-6">
        <!-- Cliente Section -->
        <div class="relative z-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
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
            <Combobox v-model="selectedCliente">
              <div class="relative mt-1">
                <div class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500">
                  <ComboboxInput
                    class="w-full border-none outline-none ring-0 focus:ring-0 focus:outline-none bg-transparent text-gray-700 placeholder-gray-400"
                    :displayValue="(cliente) => cliente ? `${cliente.nombre || ''} ${cliente.apellidopaterno || ''} ${cliente.apellidomaterno || ''}`.trim() : ''"
                    @change="queryCliente = $event.target.value"
                    placeholder="Buscar cliente por nombre, apellido o CI..."
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
                          <!-- Imagen del cliente -->
                          <div class="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                            <img v-if="cliente.imagen" :src="cliente.imagen" :alt="cliente.nombre" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold text-xs">
                              {{ cliente.nombre?.charAt(0) }}{{ cliente.apellidopaterno?.charAt(0) }}
                            </div>
                          </div>
                          
                          <div class="flex flex-col min-w-0">
                            <span class="truncate block">
                              {{ cliente.nombre }} {{ cliente.apellidopaterno || '' }} {{ cliente.apellidomaterno || '' }}
                            </span>
                            <span :class="['text-xs block', active ? 'text-orange-100' : 'text-gray-500']">
                              CI: {{ cliente.documento || 'S/D' }} {{ cliente.complemento ? `- ${cliente.complemento}` : '' }}
                            </span>
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

        <!-- Ítems Section -->
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
                  <input v-model="filtroNombre" id="filtro-nombre-item" type="text" placeholder="Buscar producto o promoción..." class="w-full pl-10 pr-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500">
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

              <div class="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span>Mostrar:</span>
                <select 
                  :value="activeTab === 'productos' ? paginacionProd.limite : paginacionPromo.limite"
                  @change="onLimiteChange(parseInt($event.target.value))"
                  class="bg-white/60 border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option :value="8">8</option>
                  <option :value="12">12</option>
                  <option :value="24">24</option>
                  <option :value="48">48</option>
                </select>
              </div>
          </div>

          <!-- Productos Tab -->
          <div v-show="activeTab === 'productos'">
              <div class="mb-4">
                  <label class="text-sm font-semibold text-gray-700">Sucursal</label>
                  <select v-model="selectedSucursalId" @change="onSucursalChange" :disabled="sucursalFija"
                    class="w-full mt-1 px-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md">
                    <option value="" disabled>Seleccionar sucursal</option>
                    <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">{{ s.nombre }}</option>
                  </select>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                      <label class="text-sm font-semibold text-gray-700">Categoría</label>
                      <select v-model="filtroCategoria" class="w-full mt-1 px-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md">
                          <option value="TODOS">Todas las categorias </option>
                          <option v-for="cat in categorias" :key="cat.idcategoria" :value="cat.idcategoria">{{ cat.nombre }}</option>
                      </select>
                  </div>
                  <div>
                      <label class="text-sm font-semibold text-gray-700">Subcategoría</label>
                      <select v-model="filtroSubcategoria" :disabled="filtroCategoria === 'TODOS'" class="w-full mt-1 px-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md disabled:bg-gray-100">
                          <option value="TODOS">Todas las subcategorias</option>
                          <option v-for="subcat in subcategorias" :key="subcat.idsubcategoria" :value="subcat.idsubcategoria">{{ subcat.nombre }}</option>
                      </select>
                  </div>
              </div>
              
              <div v-if="loadingItems" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>

              <div v-else class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto p-1">
                    <Productocard 
                      v-for="producto in productosConStockReal" 
                      :key="producto.idproducto || producto.IdProducto"
                      :producto="producto"
                      :medidas="producto.medidas || []"
                      @select-medida="agregarProducto"
                    />
                    <div v-if="productosConStockReal.length === 0" class="col-span-full text-center py-8 text-gray-500">
                      No se encontraron productos
                    </div>
                </div>

                <div class="pt-4 border-t border-gray-100">
                  <Paginado
                    :paginaActual="paginacionProd.paginaActual"
                    :totalPaginas="paginacionProd.totalPaginas"
                    :total="paginacionProd.total"
                    :limite="paginacionProd.limite"
                    @update:paginaActual="onCambiarPaginaProd"
                  />
                </div>
              </div>
          </div>

          <!-- Promociones Tab -->
          <div v-show="activeTab === 'promociones'">
              <div v-if="loadingItems" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>

              <div v-else class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto p-1">
                    <PromocionCard 
                      v-for="promo in promocionesConLimiteReal" 
                      :key="promo.idpromocion || promo.IdPromocion"
                      :promo="promo"
                      :hideActions="true"
                      @click="agregarPromocion(promo)"
                    />
                    <div v-if="promocionesConLimiteReal.length === 0" class="col-span-full text-center py-8 text-gray-500">
                      No se encontraron promociones
                    </div>
                </div>

                <div class="pt-4 border-t border-gray-100">
                  <Paginado
                    :paginaActual="paginacionPromo.paginaActual"
                    :totalPaginas="paginacionPromo.totalPaginas"
                    :total="paginacionPromo.total"
                    :limite="paginacionPromo.limite"
                    @update:paginaActual="onCambiarPaginaPromo"
                  />
                </div>
              </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Resumen y Pago -->
      <div class="space-y-6">
        <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
          <h3 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart class="h-7 w-7 text-orange-500" />
            Resumen de Venta
          </h3>

          <div class="overflow-y-auto bg-gray-50/50 rounded-2xl p-4 border border-gray-100 min-h-[400px] max-h-[600px] mb-4">
            <div v-if="carrito.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500 py-10">
              <ShoppingCart class="h-16 w-16 mb-4 opacity-20" />
              <p class="text-lg">El carrito está vacío</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(item, index) in carrito" :key="index" class="bg-white p-4 rounded-2xl shadow-sm border border-orange-50 flex flex-col gap-2">
                <div class="flex justify-between items-start">
                  <div class="flex-1 min-w-0">
                    <p class="text-base font-bold text-gray-800 truncate">{{ item.nombre }}</p>
                    <p class="text-xs text-gray-500 truncate" v-if="item.medidaNombre">{{ item.medidaNombre }}</p>
                    <div class="flex gap-2 mt-1 flex-wrap items-center" v-if="item.type === 'producto'">
                      <span class="text-[10px] font-bold text-gray-400">P.Venta: <b class="text-gray-600">Bs {{ item.precioVentaOriginal }}</b></span>
                      <span v-if="item.precioMayorOriginal" class="text-[10px] font-bold text-orange-400">P.Mayor: <b class="text-orange-600">Bs {{ item.precioMayorOriginal }}</b></span>
                    </div>
                    <div class="flex gap-2 mt-1 flex-wrap items-center" v-else>
                      <span class="text-[10px] font-bold text-orange-400">Precio: <b class="text-orange-600">Bs {{ item.precioUnitario }}</b></span>
                    </div>
                  </div>
                  <button @click="removerDelCarrito(index)" class="text-red-400 hover:text-red-600 p-1.5 bg-red-50 rounded-xl transition-colors shrink-0">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
                
                <!-- Producto: controles separados para Menor y Mayor -->
                <div v-if="item.type === 'producto'" class="flex flex-col gap-2 mt-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-gray-500">Al por menor</span>
                    <div class="flex items-center gap-2 bg-orange-50 rounded-xl p-1">
                      <button @click="cambiarCantidadMenor(index, -1)" class="w-7 h-7 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-500 hover:text-white transition-all font-bold text-sm">-</button>
                      <input 
                        type="number"
                        :value="item.cantidadMenor"
                        @change="onDirectCantidadMenor(index, $event.target.value)"
                        class="w-14 text-center font-bold text-orange-700 bg-transparent border-none focus:ring-0 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button @click="cambiarCantidadMenor(index, 1)" class="w-7 h-7 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-500 hover:text-white transition-all font-bold text-sm">+</button>
                    </div>
                    <span class="text-sm font-bold text-gray-700">Bs {{ (item.cantidadMenor * item.precioVentaOriginal).toFixed(2) }}</span>
                  </div>
                  <div v-if="item.precioMayorOriginal" class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-orange-500">Al por mayor</span>
                    <div class="flex items-center gap-2 bg-orange-50 rounded-xl p-1">
                      <button @click="cambiarCantidadMayor(index, -1)" class="w-7 h-7 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-500 hover:text-white transition-all font-bold text-sm">-</button>
                      <input 
                        type="number"
                        :value="item.cantidadMayor"
                        @change="onDirectCantidadMayor(index, $event.target.value)"
                        class="w-14 text-center font-bold text-orange-700 bg-transparent border-none focus:ring-0 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button @click="cambiarCantidadMayor(index, 1)" class="w-7 h-7 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-500 hover:text-white transition-all font-bold text-sm">+</button>
                    </div>
                    <span class="text-sm font-bold text-orange-600">Bs {{ (item.cantidadMayor * item.precioMayorOriginal).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between items-center pt-1 border-t border-gray-100">
                    <span class="text-xs font-bold text-gray-500">Total item</span>
                    <span class="text-base font-black text-gray-900">Bs {{ ((item.cantidadMenor * item.precioVentaOriginal) + (item.cantidadMayor * (item.precioMayorOriginal || item.precioVentaOriginal))).toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Promocion: control simple -->
                <div v-else class="flex items-center justify-between mt-1">
                  <div class="flex items-center gap-2 bg-orange-50 rounded-xl p-1">
                    <button @click="actualizarCantidad(index, -1)" class="w-8 h-8 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-500 hover:text-white transition-all font-bold text-lg">-</button>
                    <input 
                      type="number" 
                      :value="item.cantidad"
                      @change="onDirectQtyChange(index, $event.target.value)"
                      class="w-14 text-center font-bold text-orange-700 bg-transparent border-none focus:ring-0 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button @click="actualizarCantidad(index, 1)" class="w-8 h-8 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-500 hover:text-white transition-all font-bold text-lg">+</button>
                  </div>
                  <p class="text-lg font-black text-gray-900">Bs. {{ (item.precioUnitario * item.cantidad).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 space-y-4 pt-4">
            <!-- Date and Time Selection -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Calendar class="h-5 w-5 text-orange-500" />
                  Fecha de Venta
                </label>
                <input 
                  v-model="fechaVenta"
                  type="date"
                  class="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none text-lg font-semibold"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Clock class="h-5 w-5 text-orange-500" />
                  Hora de Venta
                </label>
                <input 
                  v-model="horaVenta"
                  type="time"
                  class="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none text-lg font-semibold"
                />
              </div>
            </div>

            <!-- Vendedor -->
            <div>
              <label class="text-sm font-semibold text-gray-700 block mb-1">Vendedor</label>
              <select v-model="selectedUsuarioId"
                class="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium">
                <option value="" disabled>Seleccionar vendedor</option>
                <option v-for="u in usuariosSucursal" :key="u.IdUsuario" :value="u.IdUsuario">
                  {{ u.Persona?.nombre || u.nombre }} {{ u.Persona?.apellidopaterno || u.apellidopaterno || '' }}
                </option>
              </select>
            </div>

            <!-- Gasto Extra -->
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                <DollarSign class="h-4 w-4 text-orange-500" />
                Gasto Extra (Bs.)
              </label>
              <input 
                v-model.number="gastoExtra"
                type="number"
                step="0.10"
                min="0"
                class="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="0.00"
              />
            </div>

            <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
              <span class="text-gray-600 font-bold text-lg">TOTAL A PAGAR</span>
              <span class="text-4xl font-black text-orange-600">Bs. {{ subtotal.toFixed(2) }}</span>
            </div>
          </div>

            <div class="space-y-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Método de Pago</label>
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    v-for="m in metodosPago" 
                    :key="m.IdMetodoPago"
                    @click="metodoPagoSeleccionado = m.IdMetodoPago"
                    :class="[
                      'py-3 rounded-2xl border-2 transition-all font-semibold',
                      metodoPagoSeleccionado === m.IdMetodoPago 
                        ? 'border-orange-500 bg-orange-50 text-orange-600' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-orange-200'
                    ]"
                  >
                    {{ m.Nombre }}
                  </button>
                </div>
              </div>

              <div v-if="metodoPagoSeleccionado === 1" class="animate-fade-in">
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Monto Recibido</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs.</span>
                  <input 
                    v-model.number="montoRecibido"
                    type="number"
                    step="0.10"
                    class="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div v-if="montoRecibido > subtotal" class="mt-3 bg-purple-50 rounded-2xl p-3 flex justify-between items-center border border-purple-100">
                  <span class="text-purple-700 font-medium">Cambio</span>
                  <span class="text-lg font-bold text-purple-600">Bs. {{ (montoRecibido - subtotal).toFixed(2) }}</span>
                </div>
              </div>

              <div class="flex gap-4 pt-4">
                <button 
                  @click="$emit('cancel')" 
                  class="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  @click="finalizarVenta" 
                  :disabled="carrito.length === 0 || (metodoPagoSeleccionado === 1 && montoRecibido < subtotal)"
                  class="flex-1 bg-linear-to-r from-orange-500 to-red-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Finalizar Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ventas Realizadas en esta Sesión -->
    <div v-if="props.ventasRecientes && props.ventasRecientes.length > 0" class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 animate-fade-in mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Receipt class="h-6 w-6 text-orange-500" />
          Ventas Realizadas (Sesión)
        </h3>
        <span class="px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold">
          {{ props.ventasRecientes.length }} ventas
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-gray-400 text-sm uppercase tracking-wider">
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Cliente</th>
              <th class="px-4 py-3 font-semibold">Monto</th>
              <th class="px-4 py-3 font-semibold">Método Pago</th>
              <th class="px-4 py-3 font-semibold">Hora</th>
              <th class="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="venta in props.ventasRecientes" :key="venta.idventa" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-4 py-4">
                <span class="font-bold text-gray-700">#{{ venta.idventa }}</span>
              </td>
              <td class="px-4 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800">{{ venta.Persona?.nombre || 'Consumidor Final' }}</span>
                  <span class="text-xs text-gray-500">{{ venta.Persona?.apellidopaterno || '' }}</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="font-bold text-green-600">Bs. {{ parseFloat(venta.preciototal).toFixed(2) }}</span>
              </td>
              <td class="px-4 py-4">
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                  {{ venta.Pago?.[0]?.Metodopago?.Nombre || 'Efectivo' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="text-gray-600 text-sm">
                  {{ venta.horaventa || venta.HoraVenta || '' }}
                </span>
              </td>
              <td class="px-4 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button 
                    @click="$emit('open-comprobante', venta)"
                    class="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
                    title="Ver Comprobante"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button 
                    @click="$emit('open-comprobante', venta)"
                    class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    title="Imprimir"
                  >
                    <Printer class="h-4 w-4" />
                  </button>
                  <!-- Edit Button -->
                  <button 
                    v-if="venta.estado !== 0"
                    @click="$emit('editar', venta)"
                    class="p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <!-- Anular Button -->
                  <button 
                    v-if="venta.estado !== 0"
                    @click="$emit('anular', venta.idventa)"
                    class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
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

    <!-- Toasts / Notifications -->
    <div v-if="notification" class="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div :class="['px-6 py-4 rounded-2xl shadow-xl text-white font-bold flex items-center gap-3', notification.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5" />
        <AlertTriangle v-else class="h-5 w-5" />
        {{ notification.message }}
      </div>
    </div>

</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { 
  ShoppingCart, X, User, Package, Search, Trash2, Plus, CheckCircle, AlertTriangle, Calendar, Clock, DollarSign, Eye, Printer, Receipt, Pencil, UserPlus, Loader2
} from 'lucide-vue-next';
import { 
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle 
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import Productocard from './Productocard.vue';
import PromocionCard from '../Promocion/PromocionCard.vue';
import Paginado from '@/views/Components/Modals/Paginado.vue';

// Services
import { ListarProductosOnSucursal } from '@/Server/Producto';
import { listarPromociones } from '@/Server/Promocion';
import { listarCategorias, ObtenerSubCategorias } from '@/Server/Categoria';
import { listarCliente } from '@/Server/persona';
import { listarPago } from '@/Server/Pago';
import { SucursalUsuario, listarUsuarioSucursal } from '@/Server/Usuario';
import { Listsucursal } from '@/Server/Sucural';
import { RegistrarPersona } from '@/Server/persona';
import { listarComplemento, listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';
import { SubirFoto, listarBarrios } from '@/Server/api';
import { useSessionStore } from '@/stores/sessionStore';

const props = defineProps({
  sucursalId: {
    type: String,
    default: ''
  },
  initialItems: {
    type: Array,
    default: () => []
  },
  pendingPersona: {
    type: Object,
    default: null
  },
  ventaParaEditar: {
    type: Object,
    default: null
  },
  ventasRecientes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['cancel', 'open-new-client', 'success', 'open-comprobante', 'anular', 'editar']);

// State
const activeTab = ref('productos');
const loadingItems = ref(false);
const productos = ref([]);
const promociones = ref([]);
const categorias = ref([]);
const subcategorias = ref([]);
const clientes = ref([]);
const metodosPago = ref([]);

const filtroCategoria = ref('TODOS');
const filtroSubcategoria = ref('TODOS');
const filtroNombre = ref('');

// Paginacion
const paginacionProd = reactive({ paginaActual: 1, totalPaginas: 1, total: 0, limite: 12 });
const paginacionPromo = reactive({ paginaActual: 1, totalPaginas: 1, total: 0, limite: 12 });

const selectedCliente = ref(null);
const queryCliente = ref('');

const carrito = ref([]);
const metodoPagoSeleccionado = ref(1);
const montoRecibido = ref(0);
const notification = ref(null);
const gastoExtra = ref(0);

const fechaVenta = ref(new Date().toLocaleDateString('en-CA'));
const horaVenta = ref(new Date().toTimeString().split(' ')[0].substring(0, 5));

// Sucursal y Usuario State
const sucursales = ref([]);
const selectedSucursalId = ref('');
const selectedUsuarioId = ref('');
const usuariosSucursal = ref([]);
const sucursalFija = ref(false);

let debounceTimer = null;

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

// Methods
const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => notification.value = null, 3000);
};

// --- HELPERS ---
const getProdId = (obj) => obj?.idproducto || obj?.IdProducto;
const getPromoId = (obj) => obj?.idpromocion || obj?.IdPromocion;
const getCantidadProp = (obj) => parseFloat(obj?.Cantidad || obj?.cantidad || 0);

// --- COMMITTED (original sale) QUANTITIES FOR EDIT MODE ---
// These track how many units each product already has "committed" in the original sale.
// During editing, DB stock already reflects this commitment, so we must add it back
// before subtracting the new cart quantities to avoid double-counting.

const commitidoProductos = computed(() => {
  if (!props.ventaParaEditar) return {};
  const detalles = props.ventaParaEditar.Detalle || props.ventaParaEditar.Detalleventa || [];
  const map = {};
  for (const d of detalles) {
    if (!d.Promocion && !d.idpromocion) {
      const prodId = d.Productomedida?.Producto?.IdProducto || d.Productomedida?.Producto?.idproducto || d.Productomedida?.IdProducto || d.idproducto;
      if (prodId) {
        const medidaQty = parseFloat(d.Productomedida?.Cantidad || d.Productomedida?.cantidad || 1);
        const commitido = parseInt(d.Cantidad || d.cantidad || 0) * medidaQty;
        map[prodId] = (map[prodId] || 0) + commitido;
      }
    }
  }
  return map;
});

const commitidoEnPromosProductos = computed(() => {
  if (!props.ventaParaEditar) return {};
  const detalles = props.ventaParaEditar.Detalle || props.ventaParaEditar.Detalleventa || [];
  const map = {};
  for (const d of detalles) {
    if (d.Promocion || d.idpromocion) {
      const promo = d.Promocion || {};
      const componentes = promo.Productos || promo.Promocionproducto || [];
      const cantPromo = parseInt(d.Cantidad || d.cantidad || 0);
      for (const pp of componentes) {
        const innerProdId = getProdId(pp.Productomedida?.Producto) || getProdId(pp.Productomedida) || getProdId(pp);
        if (innerProdId) {
          const unidadesFisicasPorPaquete = getCantidadProp(pp.Productomedida);
          const paquetesEnCombo = getCantidadProp(pp);
          const commitido = cantPromo * paquetesEnCombo * unidadesFisicasPorPaquete;
          map[innerProdId] = (map[innerProdId] || 0) + commitido;
        }
      }
    }
  }
  return map;
});

const productosConStockReal = computed(() => {
  return productos.value.map(p => {
    const productId = getProdId(p);
    
    // Quantities already committed to the original sale (only relevant in edit mode)
    const commitido = (commitidoProductos.value[productId] || 0) + (commitidoEnPromosProductos.value[productId] || 0);
    
    // 1. Consumption from direct product additions in the NEW cart
    const usadoDirecto = carrito.value
      .filter(i => i.type === 'producto' && i.id === productId)
      .reduce((acc, i) => acc + (i.cantidad * (parseFloat(i.multiplicador) || 1)), 0);
    
    // 2. Consumption from bundled products inside promos in the NEW cart
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
            // Factor de medida: Cuántas unidades físicas tiene el paquete (ej: 5 cuñapés por bolsa)
            const unidadesFisicasPorPaquete = getCantidadProp(pp.Productomedida);
            // Cuántos paquetes tiene el combo (ej: 2 bolsas)
            const paquetesEnCombo = getCantidadProp(pp);
            
            // Consumo = Combos en carrito * Bolsas por combo * Cuñapés por bolsa
            return sum + (cartItem.cantidad * paquetesEnCombo * unidadesFisicasPorPaquete);
          }, 0);
        
        return acc + consumption;
      }, 0);
    
    return {
      ...p,
      cantidad: Math.max(0, (parseFloat(p.cantidad) || 0) + commitido - usadoDirecto - usadoEnPromos)
    };
  });
});

const promocionesConLimiteReal = computed(() => {
  return promociones.value.map(p => {
    const id = getPromoId(p);
    const limiteOriginal = parseInt(p.limiteuso || p.LimiteUso);
    const usado = carrito.value
      .filter(i => i.type === 'promocion' && i.id === id)
      .reduce((acc, i) => acc + i.cantidad, 0);

    let limiteRestante = null;
    if (!isNaN(limiteOriginal) && limiteOriginal !== null && limiteOriginal > 0) {
      limiteRestante = Math.max(0, limiteOriginal - usado);
    }
    return { ...p, limiteuso: limiteRestante };
  });
});

const validatePromotionStock = (promo, additionalQty = 1) => {
  const componentes = promo.Productos || promo.Promocionproducto || [];
  if (componentes.length === 0) return true;

  for (const pp of componentes) {
    const prodId = getProdId(pp.Productomedida?.Producto) || getProdId(pp.Productomedida) || getProdId(pp);
    const productInStock = productosConStockReal.value.find(p => getProdId(p) === prodId);
    
    if (!productInStock) {
      showNotification(`Un componente requerido no está disponible`, 'error');
      return false;
    }

    const unidadesFisicasPorPaquete = getCantidadProp(pp.Productomedida);
    const paquetesEnCombo = getCantidadProp(pp);
    
    const requerimientoFisico = additionalQty * paquetesEnCombo * unidadesFisicasPorPaquete;
    
    if (requerimientoFisico > productInStock.cantidad) {
      showNotification(`Stock insuficiente de ${pp.Productomedida?.Producto?.Nombre || 'un componente'}`, 'error');
      return false;
    }
  }
  return true;
};

// --- EVENT HANDLERS ---

const onDirectQtyChange = (index, val) => {
  const item = carrito.value[index];
  const newQty = parseInt(val) || 1;
  const delta = newQty - item.cantidad;

  if (delta === 0) return;
  if (newQty <= 0) { removerDelCarrito(index); return; }

  if (delta > 0) {
    if (item.type === 'producto') {
      const productInStock = productosConStockReal.value.find(p => getProdId(p) === item.id);
      if (delta * (parseFloat(item.multiplicador) || 1) > productInStock.cantidad) {
        showNotification('Stock insuficiente', 'error');
        return;
      }
    } else if (item.type === 'promocion') {
      const promoData = promociones.value.find(p => getPromoId(p) === item.id);
      if (!validatePromotionStock(promoData, delta)) return;
      
      if (!isNaN(item.limiteUso) && item.limiteUso > 0 && newQty > item.limiteUso) {
        showNotification('Límite de uso alcanzado', 'error');
        return;
      }
    }
  }
  item.cantidad = newQty;
};

const sessionStore = useSessionStore();

const esAdmin = computed(() => {
  return sessionStore.rolSeleccionado?.Nombre?.toUpperCase() === 'ADMINISTRADOR';
});

const cargarUsuariosSucursal = async () => {
  if (!selectedSucursalId.value) {
    usuariosSucursal.value = [];
    return;
  }
  try {
    const res = await listarUsuarioSucursal(selectedSucursalId.value);
    usuariosSucursal.value = Array.isArray(res) ? res : (res.data || res.result || []);

    if (esAdmin.value) {
      const u = JSON.parse(localStorage.getItem('usuario'));
      if (u?.IdUsuario && !usuariosSucursal.value.find(us => us.IdUsuario === u.IdUsuario)) {
        usuariosSucursal.value.push({
          IdUsuario: u.IdUsuario,
          Persona: {
            nombre: u.Persona?.Nombre || u.nombre || '',
            apellidopaterno: u.Persona?.ApellidoPaterno || u.apellidopaterno || ''
          },
          nombre: u.Persona?.Nombre || u.nombre || '',
          apellidopaterno: u.Persona?.ApellidoPaterno || u.apellidopaterno || ''
        });
      }
    }

    const u = JSON.parse(localStorage.getItem('usuario'));
    if (u?.IdUsuario) {
      const encontrado = usuariosSucursal.value.find(us => us.IdUsuario === u.IdUsuario);
      if (encontrado) selectedUsuarioId.value = u.IdUsuario;
      else if (usuariosSucursal.value.length > 0) selectedUsuarioId.value = usuariosSucursal.value[0].IdUsuario;
    }
  } catch (e) {
    console.error('Error al cargar usuarios de sucursal:', e);
  }
};

const cargarSucursales = async () => {
  try {
    const res = await Listsucursal();
    sucursales.value = res.result || res.data || res || [];
  } catch (e) { console.error(e); }
};

const onSucursalChange = () => {
  cargarUsuariosSucursal();
  if (selectedSucursalId.value) fetchItems();
};

const obtenerSucursalUsuario = async (idUsuario) => {
  try {
    const resp = await SucursalUsuario(idUsuario);
    if (resp?.idsucursal) {
      selectedSucursalId.value = resp.idsucursal;
      sucursalFija.value = true;
    }
  } catch (e) {
    console.error('Error al obtener sucursal del usuario:', e);
  }
};

const fetchItems = async () => {
  if (!selectedSucursalId.value) return;
  loadingItems.value = true;
  try {
    if (activeTab.value === 'productos') {
      const res = await ListarProductosOnSucursal(
        selectedSucursalId.value,
        filtroNombre.value,
        paginacionProd.limite,
        paginacionProd.paginaActual,
        filtroCategoria.value === 'TODOS' ? null : filtroCategoria.value,
        filtroSubcategoria.value === 'TODOS' ? null : filtroSubcategoria.value
      );
      productos.value = res.result || [];
      paginacionProd.total = parseInt(res.total) || productos.value.length;
      paginacionProd.totalPaginas = Math.ceil(paginacionProd.total / paginacionProd.limite) || 1;
    } else if (activeTab.value === 'promociones') {
      const res = await listarPromociones(
        filtroNombre.value || undefined, 
        undefined, 1, undefined,
        paginacionPromo.paginaActual, paginacionPromo.limite
      );
      promociones.value = res.data || res.result || [];
      paginacionPromo.total = parseInt(res.total) || promociones.value.length;
      paginacionPromo.totalPaginas = Math.ceil(paginacionPromo.total / paginacionPromo.limite) || 1;
    }
  } catch (e) { console.error(e); } finally { loadingItems.value = false; }
};

const agregarProducto = ({ producto, medida }) => {
  const productId = getProdId(producto);
  const productData = productosConStockReal.value.find(p => getProdId(p) === productId);
  const multiplicador = parseFloat(medida.cantidad || medida.Cantidad) || 1;

  if (multiplicador > productData.cantidad) {
    showNotification(`Stock insuficiente`, 'error');
    return;
  }

  const precioVentaOriginal = parseFloat(medida.precioventa || medida.Precio || 0);
  const precioMayorOriginal = parseFloat(medida.preciomayor || medida.PrecioMayor || 0);

  const existing = carrito.value.find(i => i.id === productId && i.idMedida === (medida.idproductomedida || medida.IdPresentacion));
  if (existing) { existing.cantidad++; existing.cantidadMenor++; } 
  else {
    carrito.value.push({
      type: 'producto', id: productId, idMedida: medida.idproductomedida || medida.IdPresentacion,
      nombre: producto.nombre || producto.Nombre,
      medidaNombre: (typeof medida.presentacion === 'object' ? medida.presentacion.nombre : medida.presentacion) || medida.Nombre,
      precioVentaOriginal: precioVentaOriginal,
      precioMayorOriginal: precioMayorOriginal,
      cantidad: 1, cantidadMenor: 1, cantidadMayor: 0, multiplicador: multiplicador
    });
  }
};

const agregarPromocion = (promo) => {
  const id = getPromoId(promo);
  const existing = carrito.value.find(i => i.id === id && i.type === 'promocion');
  const cantActual = existing ? existing.cantidad : 0;
  const limite = parseInt(promo.limiteuso || promo.LimiteUso);

  if (!isNaN(limite) && limite > 0 && cantActual + 1 > limite) {
    showNotification(`Límite alcanzado`, 'error');
    return;
  }

  if (!validatePromotionStock(promo, 1)) return;

  if (existing) { existing.cantidad++; } 
  else {
    carrito.value.push({
      type: 'promocion', id: id, nombre: promo.nombre || promo.Nombre,
      precioUnitario: parseFloat(promo.preciopromocion || promo.precio || 0),
      cantidad: 1, limiteUso: limite
    });
  }
};

const verificarStockProducto = (item, deltaTotal) => {
  if (deltaTotal <= 0) return true;
  const productInStock = productosConStockReal.value.find(p => getProdId(p) === item.id);
  if (!productInStock) return false;
  if (deltaTotal * (parseFloat(item.multiplicador) || 1) > productInStock.cantidad) {
    showNotification('Stock insuficiente', 'error');
    return false;
  }
  return true;
};

const cambiarCantidadMenor = (index, delta) => {
  const item = carrito.value[index];
  if (item.type !== 'producto') return;
  const nueva = item.cantidadMenor + delta;
  if (nueva < 0 || item.cantidadMayor + nueva < 1) return;
  if (!verificarStockProducto(item, delta)) return;
  item.cantidadMenor = nueva;
  item.cantidad = item.cantidadMenor + item.cantidadMayor;
};

const onDirectCantidadMenor = (index, value) => {
  const item = carrito.value[index];
  if (item.type !== 'producto') return;
  const intVal = parseInt(value);
  if (isNaN(intVal) || intVal < 0) { showNotification('Cantidad inválida', 'error'); return; }
  if (item.cantidadMayor + intVal < 1) { showNotification('Debe haber al menos 1 unidad', 'error'); return; }
  const delta = intVal - item.cantidadMenor;
  if (!verificarStockProducto(item, delta)) return;
  item.cantidadMenor = intVal;
  item.cantidad = item.cantidadMenor + item.cantidadMayor;
};

const cambiarCantidadMayor = (index, delta) => {
  const item = carrito.value[index];
  if (item.type !== 'producto') return;
  const nueva = item.cantidadMayor + delta;
  if (nueva < 0 || item.cantidadMenor + nueva < 1) return;
  if (!verificarStockProducto(item, delta)) return;
  item.cantidadMayor = nueva;
  item.cantidad = item.cantidadMenor + item.cantidadMayor;
};

const onDirectCantidadMayor = (index, value) => {
  const item = carrito.value[index];
  if (item.type !== 'producto') return;
  const intVal = parseInt(value);
  if (isNaN(intVal) || intVal < 0) { showNotification('Cantidad inválida', 'error'); return; }
  if (item.cantidadMenor + intVal < 1) { showNotification('Debe haber al menos 1 unidad', 'error'); return; }
  const delta = intVal - item.cantidadMayor;
  if (!verificarStockProducto(item, delta)) return;
  item.cantidadMayor = intVal;
  item.cantidad = item.cantidadMenor + item.cantidadMayor;
};

const actualizarCantidad = (index, delta) => {
  const item = carrito.value[index];
  onDirectQtyChange(index, item.cantidad + delta);
};

const removerDelCarrito = (index) => { carrito.value.splice(index, 1); };

const clearForm = () => {
  carrito.value = [];
  selectedCliente.value = null;
  montoRecibido.value = 0;
  queryCliente.value = '';
  fechaVenta.value = new Date().toLocaleDateString('en-CA');
  horaVenta.value = new Date().toTimeString().split(' ')[0].substring(0, 5);
  filtroNombre.value = '';
  gastoExtra.value = 0;
};

defineExpose({ clearForm });

const finalizarVenta = () => {
  // Datos por defecto o del cliente seleccionado
  const nombre = selectedCliente.value ? selectedCliente.value.nombre : 'Consumidor Final';
  const apellidos = selectedCliente.value ? `${selectedCliente.value.apellidopaterno || ''} ${selectedCliente.value.apellidomaterno || ''}`.trim() : '';
  const ci = selectedCliente.value ? (selectedCliente.value.ci || selectedCliente.value.documento || '0000000000') : '0000000000';

  const payload = {
    IdPersona: selectedCliente.value?.idpersona || null,
    Nombre: nombre,
    Apellidos: apellidos,
    CI: ci,
    IdSucursal: selectedSucursalId.value,
    IdUsuario: selectedUsuarioId.value || null,
    IdMetodoPago: metodoPagoSeleccionado.value,
    Monto: subtotal.value,
    Cambio: Math.max(0, montoRecibido.value - subtotal.value),
    FechaVenta: fechaVenta.value,
    HoraVenta: horaVenta.value,
    GastoExtra: Number(gastoExtra.value) || 0,
    detalles: {
      Producto: carrito.value.flatMap(i => {
        if (i.type === 'promocion') {
          return [{
            idPaquete: null,
            idPromocion: i.id,
            Cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            precioMayor: null
          }];
        }
        const entradas = [];
        if (i.cantidadMenor > 0) {
          entradas.push({
            idPaquete: i.idMedida,
            idPromocion: null,
            Cantidad: i.cantidadMenor,
            precioUnitario: i.precioVentaOriginal,
            precioMayor: null
          });
        }
        if (i.cantidadMayor > 0) {
          entradas.push({
            idPaquete: i.idMedida,
            idPromocion: null,
            Cantidad: i.cantidadMayor,
            precioUnitario: i.precioMayorOriginal,
            precioMayor: i.precioMayorOriginal
          });
        }
        return entradas;
      })
    }
  };
  emit('success', payload);
};

// --- UI DATA ---
const filteredClientes = computed(() => {
  if (queryCliente.value === '') return clientes.value;
  const q = queryCliente.value.toLowerCase();
  return clientes.value.filter(c => 
    `${c.nombre} ${c.apellidopaterno} ${c.apellidomaterno}`.toLowerCase().includes(q) ||
    (c.documento && c.documento.toString().toLowerCase().includes(q))
  );
});

const subtotal = computed(() => carrito.value.reduce((acc, item) => {
  if (item.type === 'promocion') return acc + (item.precioUnitario * item.cantidad);
  return acc + (item.cantidadMenor * item.precioVentaOriginal) + (item.cantidadMayor * (item.precioMayorOriginal || item.precioVentaOriginal));
}, 0));

const totalConGasto = computed(() => {
  const neto = subtotal.value;
  return neto;
});

const onCambiarPaginaProd = (page) => { paginacionProd.paginaActual = page; fetchItems(); };
const onCambiarPaginaPromo = (page) => { paginacionPromo.paginaActual = page; fetchItems(); };
const onLimiteChange = (l) => { 
  if (activeTab.value === 'productos') { paginacionProd.limite = l; paginacionProd.paginaActual = 1; }
  else { paginacionPromo.limite = l; paginacionPromo.paginaActual = 1; }
  fetchItems();
};

onMounted(async () => {
  try {
    const [cats, clis, pagos, sucs, docs, emails, nums, comps] = await Promise.all([
      listarCategorias(),
      listarCliente(),
      listarPago(),
      cargarSucursales(),
      listarDocumento(),
      listarEmail(),
      listarNumero(),
      listarComplemento()
    ]);
    categorias.value = cats.data || cats.result || cats || [];
    clientes.value = Array.isArray(clis) ? clis : (clis.data || clis.result || []);
    metodosPago.value = pagos || [];
    docsRegistrados.value = docs?.result || docs?.data || docs || [];
    emailsRegistrados.value = emails?.result || emails?.data || emails || [];
    numerosRegistrados.value = nums?.result || nums?.data || nums || [];
    complementos.value = comps?.result || comps?.data || comps || [];

    // Initialize sucursal and usuario for the current user
    if (!props.ventaParaEditar) {
      const u = JSON.parse(localStorage.getItem('usuario'));
      if (u?.IdUsuario) {
        try {
          const sucResp = await SucursalUsuario(u.IdUsuario);
          if (sucResp?.idsucursal) {
            selectedSucursalId.value = sucResp.idsucursal;
            sucursalFija.value = true;
          }
        } catch (e) {
          console.error('Error al obtener sucursal del usuario:', e);
        }
      }
      if (selectedSucursalId.value) {
        await cargarUsuariosSucursal();
        fetchItems();
        if (!selectedUsuarioId.value && u?.IdUsuario) {
          selectedUsuarioId.value = u.IdUsuario;
        }
      }
    }

    // Initialize from ventaParaEditar if present
    if (props.ventaParaEditar) {
      const v = props.ventaParaEditar;

      const sucursalId = v.idsucursal || v.IdSucursal || v.Sucursal?.IdSucursal || v.sucursal?.idsucursal;
      if (sucursalId) {
        selectedSucursalId.value = sucursalId;
        sucursalFija.value = false;
      }
      const usuarioId = v.idusuario || v.IdUsuario || v.Usuario?.IdUsuario || v.usuario?.idusuario;
      if (usuarioId) {
        selectedUsuarioId.value = usuarioId;
      }
      if (selectedSucursalId.value) {
        await cargarUsuariosSucursal();
        fetchItems();
      }
      
      // Select client
      const persona = v.Persona || v.persona;
      if (persona) {
        const found = clientes.value.find(c => c.idpersona === (persona.idpersona || persona.IdPersona));
        if (found) selectedCliente.value = found;
        else selectedCliente.value = persona;
      }

      // Populate Cart (agrupado por producto+medida, como en registro)
      const detalles = v.Detalle || v.Detalleventa || [];
      const productosMap = {};
      carrito.value = [];
      detalles.forEach(d => {
        if (d.Promocion || d.idpromocion) {
          carrito.value.push({
            type: 'promocion',
            id: d.idpromocion || d.Promocion?.IdPromocion,
            nombre: d.Promocion?.Nombre || 'Promoción',
            precioUnitario: parseFloat(d.Precio || 0),
            cantidad: parseInt(d.Cantidad || 0),
            limiteUso: parseInt(d.Promocion?.LimiteUso || 0)
          });
        } else {
          const idMedida = d.idproductomedida || d.IdProductoMedida || d.Productomedida?.IdProductoMedida || d.Productomedida?.idproductomedida;
          const productId = d.Productomedida?.Producto?.IdProducto || d.Productomedida?.IdProducto || d.idproducto;
          const key = productId + '|' + idMedida;
          const hasPrecioMayor = d.PrecioMayor != null && d.PrecioMayor > 0;
          const qty = parseInt(d.Cantidad || d.cantidad || 0);

          if (!productosMap[key]) {
            productosMap[key] = {
              type: 'producto',
              id: productId,
              idMedida: idMedida,
              nombre: d.Productomedida?.Producto?.Nombre || d.Productomedida?.Producto?.nombre || 'Producto',
              medidaNombre: d.Productomedida?.Presentacion?.Nombre || d.Productomedida?.Presentacion?.nombre || 'Unidad',
              precioVentaOriginal: parseFloat(d.Productomedida?.PrecioVenta || d.Productomedida?.precioventa || 0),
              precioMayorOriginal: parseFloat(d.Productomedida?.PrecioMayor || d.Productomedida?.preciomayor || 0),
              cantidad: 0, cantidadMenor: 0, cantidadMayor: 0,
              multiplicador: parseFloat(d.Productomedida?.Cantidad || d.Productomedida?.cantidad || 1)
            };
          }
          if (hasPrecioMayor) {
            productosMap[key].cantidadMayor += qty;
          } else {
            productosMap[key].cantidadMenor += qty;
          }
          productosMap[key].cantidad += qty;
        }
      });
      carrito.value = [...carrito.value, ...Object.values(productosMap)];

      // Set payment method
      if (v.Pago && v.Pago.length > 0) {
        metodoPagoSeleccionado.value = v.Pago[0].IdMetodoPago;
        montoRecibido.value = parseFloat(v.Pago[0].Monto) + parseFloat(v.Pago[0].Cambio);
      }

      if (v.fechaventa) {
        const d = new Date(v.fechaventa);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          fechaVenta.value = `${year}-${month}-${day}`;
        } else {
          fechaVenta.value = v.fechaventa.split('T')[0].split(' ')[0];
        }
      }
      if (v.horaventa) horaVenta.value = v.horaventa.substring(0, 5);
    }

    // If there is a pending persona, add it to the list and select it
    if (props.pendingPersona) {
      const tempPersona = { ...props.pendingPersona };
      if (!clientes.value.find(c => c.idpersona === tempPersona.idpersona)) {
        clientes.value.unshift(tempPersona);
      }
      selectedCliente.value = tempPersona;
    }
  } catch (e) { console.error(e); }
  if (!props.ventaParaEditar && props.initialItems?.length > 0) carrito.value = [...props.initialItems];
});

watch(() => props.pendingPersona, (newVal) => {
  if (newVal) {
    const tempPersona = { ...newVal };
    if (!clientes.value.find(c => c.idpersona === tempPersona.idpersona)) {
      clientes.value.unshift(tempPersona);
    }
    selectedCliente.value = tempPersona;
  }
}, { immediate: true });

watch(filtroCategoria, async (v) => {
  filtroSubcategoria.value = 'TODOS';
  if (v !== 'TODOS') {
    const res = await ObtenerSubCategorias(v);
    subcategorias.value = res.result || res || [];
  } else subcategorias.value = [];
  paginacionProd.paginaActual = 1; fetchItems();
});

watch([filtroSubcategoria, filtroNombre], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (activeTab.value === 'productos') paginacionProd.paginaActual = 1;
    else paginacionPromo.paginaActual = 1;
    fetchItems();
  }, 400);
});

watch(activeTab, fetchItems);
watch(() => props.sucursalId, (id) => {
  if (id) {
    selectedSucursalId.value = id;
    cargarUsuariosSucursal();
    fetchItems();
  }
});

watch(subtotal, (val) => {
  montoRecibido.value = val;
}, { immediate: true });


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
