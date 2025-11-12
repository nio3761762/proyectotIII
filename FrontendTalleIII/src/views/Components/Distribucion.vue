<template>
  <div class="min-h-screen ">
    <!-- VISTA PRINCIPAL: LISTA DE DISTRIBUCIONES -->
    <div v-if="!modoCreacion">
      <!-- Header -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <Truck class="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Gestión de Distribuciones
              </h1>
              <p class="text-gray-600 mt-1 font-medium">Envíos de productos a sucursales</p>
            </div>
          </div>
          <button
            @click="iniciarModoCreacion"
            class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Plus class="h-4 w-4" />
            Nueva Distribución
          </button>
        </div>
        <!-- Filtros -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="filtro-sucursal" class="text-sm font-medium text-gray-700">Filtrar por Sucursal:</label>
                <select id="filtro-sucursal" v-model="filtroSucursal" class="w-full mt-1 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-2xl px-4 py-2 outline-none transition-colors">
                    <option value="TODOS">Todas las sucursales</option>
                    <option value="Cocina">Cocina</option>
                    <option v-for="suc in sucursales" :key="suc.IdSucursal" :value="suc.IdSucursal">{{ suc.Nombre }}</option>
                </select>
            </div>
            <div>
                <label for="filtro-fecha" class="text-sm font-medium text-gray-700">Fecha:</label>
                <input id="filtro-fecha" v-model="filtroFecha" type="date" class="w-full mt-1 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-2xl px-4 py-2 outline-none transition-colors">
            </div>
        </div>
      </div>

      <!-- Lista de Distribuciones -->
      <div class="space-y-6 mt-8">
        <div v-if="distribuciones.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center">
            <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <Truck class="h-12 w-12 text-orange-500" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">No hay distribuciones</h3>
            <p class="text-gray-500">Comienza creando una nueva distribución o ajusta los filtros.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="dist in distribuciones" :key="dist.IdDistribucion" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-500 flex flex-col">
            <div class="p-6 flex-grow">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <p class="text-sm font-semibold text-orange-600">{{ dist.IdDistribucion }}</p>
                  <h3 class="text-xl font-bold text-gray-800">{{ dist.Sucursal ? dist.Sucursal.Nombre : dist.Pedido?.Venta?.Persona?.Nombre +" "+ dist.Pedido?.Venta?.Persona?.ApellidoPaterno }}</h3>
                  <p class="text-sm text-gray-500">{{ new Date(dist.FechaDistribucion + 'T' + dist.HoraDistribucion).toLocaleString() }}</p>
                </div>
                <span :class="['px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium', getStatusClass(dist.Estado.Nombre)]">{{ dist.Estado.Nombre }}</span>
              </div>
              <div class="bg-gray-50/80 rounded-2xl p-4 mb-4 border border-gray-200/50">
                <p class="text-sm font-medium text-gray-700 truncate">
                  {{ dist.Detalledistribucion.map(d => d.Producto?.Nombre || d.Paquete?.Nombre).filter(Boolean).join(', ') }}
                </p>
              </div>
            </div>
            <button @click="toggleDetalles(dist.IdDistribucion)" class="w-full bg-gray-50/80 hover:bg-gray-100/80 text-orange-600 p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-t border-gray-200/50">
                <component :is="distribucionAbierta === dist.IdDistribucion ? ChevronUp : ChevronDown" class="h-4 w-4" />
                <span>{{ distribucionAbierta === dist.IdDistribucion ? 'Ocultar' : 'Ver' }} Detalles</span>
            </button>
            <!-- Collapsible Details -->
            <div v-if="distribucionAbierta === dist.IdDistribucion" class="bg-gray-50/80 p-6 border-t border-gray-200/50">
                <h4 class="font-bold text-lg mb-3 text-gray-700">Detalles del Envío</h4>
                <div class="space-y-4">
                    <p><span class="font-semibold">Origen:</span> {{ dist.Origen }}</p>
                    <p><span class="font-semibold">Observación:</span> {{ dist.Observacion || 'Ninguna' }}</p>
                    <div>
                        <p class="font-semibold mb-2">Items enviados:</p>
                        <ul class="space-y-2 max-h-64 overflow-y-auto pr-2">
                            <li v-for="item in dist.Detalledistribucion" :key="item.IdDetalleDistribucion" class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                <span>{{ item.Producto?.Nombre || item.Paquete?.Nombre }}</span>
                                <div class="text-right">
                                    <p class="font-bold">Enviado: {{ item.Cantidad }}</p>
                                    <p v-if="item.Cantidaddevuelta > 0" class="text-sm text-red-600">Devuelto: {{ item.Cantidaddevuelta }}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="p-4 bg-gray-50/50 border-t border-gray-200/50 flex gap-2">
              <button @click="iniciarModoEdicion(dist)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Edit class="h-4 w-4" /> Editar
              </button>
              <button @click="confirmarAnulacion(dist)" class=" bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center">
                  <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VISTA DE CREACIÓN -->
    <div v-else>
      <!-- Header -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <Send class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Actualizar Distribución
              </h1>
              <p class="text-gray-600 text-sm">Actualiza el envío de productos a un destino</p>
            </div>
          </div>
          <button @click="cancelarModoCreacion" class="p-3 rounded-2xl bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
            <X class="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <!-- Formulario de Distribución -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Columna Izquierda: Selección de Ítems -->
        <div class="space-y-6">
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package class="h-6 w-6 text-orange-500" />
              Ítems para Distribución
            </h3>
            <div class="mb-4">
                <label for="filtro-nombre-item" class="text-sm font-semibold text-gray-700 mb-1 block">Buscar por Nombre</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search class="h-5 w-5 text-gray-400" />
                    </div>
                    <input v-model="filtroNombreItem" id="filtro-nombre-item" type="text" placeholder="Buscar producto o paquete..." class="w-full pl-10 pr-4 py-3 bg-white/60 border-gray-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                </div>
            </div>
            <div>
              <div class="mb-4 border-b border-gray-200">
                  <nav class="flex space-x-4" aria-label="Tabs">
                      <button @click="activeTab = 'productos'" :class="['px-3 py-2 font-medium text-sm rounded-t-lg', activeTab === 'productos' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700']">
                          Productos
                      </button>
                      <button @click="activeTab = 'paquetes'" :class="['px-3 py-2 font-medium text-sm rounded-t-lg', activeTab === 'paquetes' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700']">
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
                      <div v-for="producto in productosFiltradosPorNombre" :key="producto.IdProducto" @click="agregarProductoDesdeCard(producto)" class="bg-white/60 rounded-2xl p-3 border border-white/50 hover:shadow-md transition-all duration-300 cursor-pointer group">
                          <div class="h-24 mb-2 rounded-xl overflow-hidden">
                              <img :src="producto.Imagen?.Url || 'https://via.placeholder.com/150'" :alt="producto.Nombre" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <h4 class="font-semibold text-sm text-gray-800 truncate">{{ producto.Nombre }}</h4>
                          <p class="text-xs text-gray-500">Stock: {{ producto.Productosucursal?.[0]?.Cantidad || 0 }}</p>
                      </div>
                  </div>
              </div>
              <div v-show="activeTab === 'paquetes'">
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                      <div v-for="pack in paquetesFiltradosPorNombre" :key="pack.IdPaquete" @click="agregarPaqueteDesdeCard(pack)" class="bg-white/60 rounded-2xl p-3 border border-white/50 hover:shadow-md transition-all duration-300 cursor-pointer group">
                          <div class="h-24 mb-2 rounded-xl overflow-hidden">
                              <img :src="pack.Imagen?.Url || 'https://via.placeholder.com/150'" :alt="pack.Nombre" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <h4 class="font-semibold text-sm text-gray-800 truncate">{{ pack.Nombre }}</h4>
                          <p class="text-xs text-gray-500">Contiene: {{ pack.Cantidad }} x {{ pack.Producto?.Nombre }}</p>
                          <p class="text-xs text-gray-500">Stock: {{ pack.CantidadPaquete || 0 }}</p>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Destino, Resumen y Finalizar -->
        <div class="space-y-6">
          <!-- Destino -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin class="h-6 w-6 text-orange-500" />
              Destino del Envío
            </h3>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-semibold text-gray-700">Sucursal Destino</label>
                <select v-model="nuevaDistribucion.IdSucursalDestino" class="w-full mt-1 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-2xl px-4 py-3 outline-none transition-colors appearance-none">
                    <option value="TODOS">Seleccione una sucursal</option>
                    <option v-for="suc in sucursales" :key="suc.IdSucursal" :value="suc.IdSucursal">{{ suc.Nombre }}</option>
                </select>
              </div>
              <div class="text-center text-sm font-semibold text-gray-500">O</div>
              <div>
            <div class="flex justify-between items-center mb-1">
              <label class="text-sm font-semibold text-gray-700">Cliente (Opcional)</label>
              <button @click="abrirModalNuevoCliente" class="text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors">
                Nuevo Cliente
              </button>
            </div>
            <select v-model="nuevaDistribucion.IdCliente" class="w-full mt-1 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-2xl px-4 py-3 outline-none transition-colors appearance-none">
                <option value="">Seleccione un cliente</option>
                <option v-for="cli in clientes" :key="cli.IdPersona" :value="cli.IdPersona">{{ cli.Nombre }}</option>
            </select>
          </div>
            </div>
          </div>

          <!-- Información de Entrega -->
          <div v-if="isClientDestination" class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
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
                    v-model="nuevaDistribucion.entrega.direccion"
                    type="text"
                    placeholder="Ej: Calle Falsa 123, Ciudad"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-1 block">Fecha de Entrega</label>
                    <input
                      v-model="nuevaDistribucion.entrega.fecha"
                      type="date"
                      class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-1 block">Hora de Entrega</label>
                    <input
                      v-model="nuevaDistribucion.entrega.hora"
                      type="time"
                      class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Barrio</label>
                  <select
                    v-model="nuevaDistribucion.entrega.barrioId"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecciona un barrio</option>
                    <option v-for="barrio in barrios" :key="barrio.IdBarrio" :value="barrio.IdBarrio">{{ barrio.Nombre }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Referencia</label>
                  <input
                    v-model="nuevaDistribucion.entrega.referencia"
                    type="text"
                    placeholder="Ej: Casa con rejas verdes"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Ubicación (URL o Coordenadas)</label>
                  <input
                    v-model="nuevaDistribucion.entrega.ubicacion"
                    type="text"
                    placeholder="Ej: https://maps.app.goo.gl/xyz"
                    class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-1 block">Costo de Envío</label>
                  <input
                    v-model.number="nuevaDistribucion.entrega.costoEnvio"
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
                      v-model="nuevaDistribucion.entrega.fecha"
                      type="date"
                      class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-gray-700 mb-1 block">Hora de Entrega</label>
                    <input
                      v-model="nuevaDistribucion.entrega.hora"
                      type="time"
                      class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                   </div>   
                   <div v-if="filtroSucursal === 'TODOS'">
                <label class="text-sm font-semibold text-gray-700">Sucursal de Retiro</label>
                <select v-model="destionFInal" class="w-full mt-1 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-2xl px-4 py-3 outline-none transition-colors appearance-none">
                    <option value="TODOS">Seleccione una sucursal</option>
                    <option v-for="suc in sucursales" :key="suc.IdSucursal" :value="suc.IdSucursal">{{ suc.Nombre }}</option>
                </select>
              </div>
              </div>
            </div>
          </div>

          <!-- Resumen de Envío -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardList class="h-6 w-6 text-orange-500" />
              Resumen de Envío
            </h3>
            <div class="bg-gray-50 rounded-2xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              <div v-if="nuevaDistribucion.Items.length === 0" class="text-center text-gray-500 pt-10">
                <p>El carrito está vacío</p>
              </div>
              <div v-else class="space-y-2">
                <div v-for="(item, index) in nuevaDistribucion.Items" :key="index" class="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                  <div class="flex-1">
                    <p class="font-semibold">{{ item.Nombre }}</p>
                    <p v-if="isClientDestination" class="text-sm text-green-600">@ {{ item.precioUnitario }} Bs.</p>
                  </div>
                  <div v-if="isClientDestination && item.type !== 'promocion'" class="flex items-center gap-2">
                    <label :for="`wholesale-toggle-${index}`" class="text-xs text-gray-600 cursor-pointer">P. Mayor</label>
                    <input type="checkbox" :id="`wholesale-toggle-${index}`" v-model="item.Modo" :true-value="1" :false-value="0" @change="actualizarPrecioItem(item)" class="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer" />
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="decrementarCantidad(item)" class="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors">-</button>
                    <input :value="item.Cantidad" @change="handleCantidadChange(item, $event)" type="number" min="1" class="w-16 h-10 text-center border border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all duration-300"/>
                    <button @click="incrementarCantidad(item)" class="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors">+</button>
                  </div>
                  <div v-if="isClientDestination" class="flex items-center gap-2">
                    <label class="font-bold text-green-600">Bs.</label>
                    <input
                      v-model="item.editableTotal"
                      @change="updatePrecioUnitario(item)"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-16 text-right border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-200"
                    />
                  </div>
                  <button @click="quitarItemDeLista(index)" class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Finalizar -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <button @click="guardarDistribucion" :disabled="!puedeGuardar" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
              <Save class="h-5 w-5"/>
              Guardar y Enviar
            </button>
          </div>
        </div>
      </div>
    </div>

    

    <!-- Modal Anulación -->
    <div v-if="modalAnulacionVisible" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md p-6">
        <div class="text-center space-y-4">
          <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center shadow-lg">
            <Trash2 class="h-8 w-8 text-red-600" />
          </div>
          <h3 class="text-2xl font-bold text-gray-800">Confirmar Anulación</h3>
          <p class="text-center text-gray-600 leading-relaxed">
            ¿Está seguro de que desea anular la distribución
            <span class="font-semibold text-gray-900 bg-gradient-to-r from-red-100 to-orange-100 px-2 py-1 rounded-lg">
              {{ distribucionParaAnular?.IdDistribucion }}
            </span>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="flex gap-3 mt-8">
          <button @click="cerrarModalAnulacion" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            Cancelar
          </button>
          <button @click="anularDistribucionConfirmado" class="flex-1 bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            Sí, Anular
          </button>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in">
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ successMessage }}</span>
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
            <input v-model="nuevoCliente.Nombre" type="text" placeholder="Ingrese el nombre" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
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
</div>
</template>

<style scoped>
@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slide-in 0.3s ease-out; }
</style>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Truck, Plus, Eye, ArrowLeft, Send, PackageSearch, ClipboardList, MapPin, Save, X, Trash2, CheckCircle, ChevronDown, ChevronUp, User, Package, Archive, Search, Edit } from 'lucide-vue-next';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/vue';

import { listarDistribuciones, crearDistribucion, actualizarDistribucion, anularDistribucion, ObtenerCLienteDestino, listarDistribucionesSucursal } from '@/Server/Distribucion.js';
import { listarProductos, listarProductosSucursal, listarProductosS ,listarPaquete, PrecioProducto, listarPaqueteSin } from '@/Server/Producto.js';
import { listarCategorias, ObtenerSubCategorias } from '@/Server/Categoria.js';
import { listarSucursales, listarBarrios } from '@/Server/api.js';
import { listarCliente, RegistrarCliente } from '@/Server/Cliente.js';
import { SucursalUsuario } from '@/Server/Usuario.js';
import { listarTipoEntrega } from '@/Server/Entrga.js';
import { listarComplemento } from '@/Server/Complemento.js';

const isInitializing = ref(false);

// --- State ---
const modoCreacion = ref(false);
const esNuevaDistribucion = ref(true);
const destionFInal = ref('TODOS')
const distribuciones = ref([]);
const productos = ref([]);
const paquetes = ref([]);
const sucursales = ref([]);
const clientes = ref([]);
const precios = ref({});
const activeTab = ref('productos');
const userSucursal = ref(null);
const filtroSucursal = ref('TODOS');
const complementos = ref([]);
const tEntrega = ref([]);
const selectentrega = ref('TPE-E1');
const barrios = ref([]);
const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const deliveryTime = new Date(today.getTime() + 60 * 60 * 1000);
  const formattedTime = deliveryTime.toTimeString().slice(0, 5);

const nuevaDistribucion = ref({
  IdSucursalDestino: 'TODOS',
  IdCliente: '',
  Items: [],
  entrega: {
    direccion: '',
    fecha: formattedDate,
    hora: formattedTime,
    barrioId: '',
    referencia: '',
    ubicacion: '',
    costoEnvio: 0
  },
});

const distribucionAbierta = ref(null);
const showSuccessToast = ref(false);
const successMessage = ref('');

const modalAnulacionVisible = ref(false);
const distribucionParaAnular = ref(null);

const mostrarModalNuevoCliente = ref(false);
const nuevoCliente = ref({
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
});

// --- New state for item selection ---
const filtroNombreItem = ref('');
const categorias = ref([]);
const subcategoriasParaFiltro = ref([]);
const filtroCategoria = ref('TODOS');
const filtroSubcategoria = ref('TODOS');
const filtroFecha = ref(new Date().toISOString().split('T')[0]);

// --- Computed Properties ---
const isClientDestination = computed(() => !!nuevaDistribucion.value.IdCliente);

const productosFiltradosPorNombre = computed(() => {
    if (!filtroNombreItem.value) {
        return productos.value;
    }
    return productos.value.filter(p =>
        p.Nombre.toLowerCase().includes(filtroNombreItem.value.toLowerCase())
    );
});

const paquetesFiltradosPorNombre = computed(() => {
    if (!filtroNombreItem.value) {
        return paquetes.value;
    }
    return paquetes.value.filter(p =>
        p.Nombre.toLowerCase().includes(filtroNombreItem.value.toLowerCase())
    );
});

const puedeGuardar = computed(() => {
    return (nuevaDistribucion.value.IdSucursalDestino || nuevaDistribucion.value.IdCliente) && nuevaDistribucion.value.Items.length > 0;
});

// --- Watchers ---
watch(filtroSucursal, async (newVal) => {
  await actualizarListaDistribuciones();
  await Listarproductos(newVal);
  await ListarPaquetes();
});

watch(filtroFecha, async () => {
  await actualizarListaDistribuciones();
});

watch(() => nuevaDistribucion.value.IdCliente, async (newVal) => {
    if (isInitializing.value) return;
    if (newVal) {
        nuevaDistribucion.value.IdSucursalDestino = 'TODOS';
        // Recalculate prices for existing items
        for (const item of nuevaDistribucion.value.Items) {
            item.precioUnitario = await calcularPrecio(item, item.Modo === 1);
        }
    } else {
        // If client is deselected, reset prices to 0
        for (const item of nuevaDistribucion.value.Items) {
            item.precioUnitario = 0;
        }
    }
});

watch(() => nuevaDistribucion.value.IdSucursalDestino, (newVal) => {
    if (newVal) {
        nuevaDistribucion.value.IdCliente = '';
        // When switching to a branch, prices are not needed.
        for (const item of nuevaDistribucion.value.Items) {
            item.precioUnitario = 0;
        }
    }
});

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

const getStockInfo = (item) => {
    if (item.type === 'producto') {
        const productoEnStock = productos.value.find(p => p.IdProducto === item.id);
        return {
            stock: productoEnStock?.Productosucursal?.[0]?.Cantidad || 0,
            nombre: productoEnStock?.Nombre || item.Nombre
        };
    } else if (item.type === 'paquete') {
        const paqueteEnStock = paquetes.value.find(p => p.IdPaquete === item.id);
        return {
            stock: paqueteEnStock?.CantidadPaquete || 0,
            nombre: paqueteEnStock?.Nombre || item.Nombre
        };
    }
    return { stock: 0, nombre: item.Nombre };
};

const ajustarStockProductoLocal = (productoId, cantidad) => {
  const prod = productos.value.find(p => p.IdProducto === productoId);
  if (prod && prod.Productosucursal && prod.Productosucursal.length > 0) {
    prod.Productosucursal[0].Cantidad += cantidad;
    productos.value = [...productos.value];
  }
};

const ajustarStockPaqueteLocal = (paqueteId, cantidad) => {
  const pack = paquetes.value.find(p => p.IdPaquete === paqueteId);
  if (pack) {
    if (typeof pack.CantidadPaquete !== 'number') {
        pack.CantidadPaquete = 0;
    }
    pack.CantidadPaquete += cantidad;
    paquetes.value = [...paquetes.value];
  }
};

const ajustarStockPorItem = (item, cantidad) => {
  if (item.type === 'producto') {
    ajustarStockProductoLocal(item.id, cantidad);
  } else if (item.type === 'paquete') {
    ajustarStockPaqueteLocal(item.id, cantidad);
  }
};
const distribucionCLiente =ref({})
// --- Methods ---
const actualizarListaDistribuciones = async () => {
  try {
    distribuciones.value = await listarDistribucionesSucursal(filtroFecha.value,filtroSucursal.value);
  } catch (error) {
    console.error("Error al cargar distribuciones:", error);
    mostrarNotificacion('Error al cargar las distribuciones.', true);
  }
};

const Listarproductos = async (id) => {
  try {
    let response;
    if(id && id !== 'TODOS'){
      response = await listarProductosSucursal(id, filtroCategoria.value, filtroSubcategoria.value);
      console.log(response)
    } else {
      response = await listarProductosS(filtroCategoria.value, filtroSubcategoria.value);
    }
    productos.value = response;
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
};

const ListarCategoriasPrincipales = async () => {
  try {
    const response = await listarCategorias();
    categorias.value = response;
  } catch (error) {
    console.error('Error al cargar categorias:', error);
  }
};

const cargarDatos = async () => {
  try {
    const [sucs, clis, userSuc, tiposEntrega, listaBarrios, comp] = await Promise.all([
      listarSucursales(),
      listarCliente(),
      SucursalUsuario(),
      listarTipoEntrega(),
      listarBarrios(),
      listarComplemento(),
    ]);
    await actualizarListaDistribuciones();
    sucursales.value = sucs;
    clientes.value = clis;
    tEntrega.value = tiposEntrega;
    barrios.value = listaBarrios;
    complementos.value = comp
    if (userSuc && userSuc.length > 0) {
      userSucursal.value = userSuc[0];
      paquetes.value = await listarPaquete(userSucursal.value.IdSucursal);
    }
    // Initial product listing
    await Listarproductos(filtroSucursal.value);
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
    mostrarNotificacion('Error al cargar los datos.', true);
  }
};


const ListarPaquetes = async () => { 
  try {
      let response;
    if(filtroSucursal.value !== "TODOS"){ response = await listarPaquete(filtroSucursal.value);}
    else{ response = await listarPaqueteSin();  }
    paquetes.value = response;
  } catch (error) {
    console.error('Error al cargar paquetes y sus presentaciones:', error);
  }
};

const iniciarModoCreacion = async () => {
  esNuevaDistribucion.value = true;
  await Listarproductos(filtroSucursal.value);
  await ListarPaquetes();
  modoCreacion.value = true;
  isInitializing.value = false;
};

const cancelarModoCreacion = () => {
  modoCreacion.value = false;
  esNuevaDistribucion.value = true;
   destionFInal.value = "TODOS";
        idenvio.value ='';
        iddireccion.value ='';
  resetFormulario();
  Listarproductos(filtroSucursal.value);
  ListarPaquetes();
};
const obtenerCLienteDestino = async (id) => { 
 let response;
  try {
       response = await ObtenerCLienteDestino(id)
       // esto son los datos del metodo ObtenerClienteDestion 
       //        return res.json({
        //     IdCliente: result?.Pedido?.Venta?.Persona?.IdPersona,
        //     Nombre:result?.Pedido?.Venta?.Persona?.Nombre,
        //     ApellidoPaterno:result?.Pedido?.Venta?.Persona?.ApellidoPaterno,
        //     ApellidoMaterno:result?.Pedido?.Venta?.Persona?.ApellidoMaterno,
        //     EntregaId: entrega.IdEntrega,
        //     direccion: entrega.Direccion.Direccion,
        //     fecha: entrega.FechaEntrega,
        //     hora: entrega.HoraEntrega,
        //     barrioId: entrega.Direccion.Barrio.IdBarrio,
        //     DireccionId:entrega.Direccion.IdDireccion,
        //     referencia: entrega.Direccion.Referencia,
        //     ubicacion: entrega.Direccion.Ubicacion,
        //     costoEnvio: entrega.CostoEntrega,
        //     tipo:entrega.Tipoentrega.IdTipoEntrega,
        //     IdSucursal: resultSucursal?.Sucursal?.IdSucursal
        // });
  } catch (error) {
    console.error('Error al cargar paquetes y sus presentaciones:', error);
  }
  return response;
};
const idenvio = ref('');
const iddireccion = ref('');
const iniciarModoEdicion = async (dist) => {
  
  isInitializing.value = true;
  esNuevaDistribucion.value = false;
  console.log("Esto que es?",dist)
   const destino = await obtenerCLienteDestino(dist.IdDistribucion);
   console.log("El destino",destino)
  nuevaDistribucion.value = {
    IdDistribucion: dist.IdDistribucion,
    IdSucursalDestino: dist.Sucursal?.IdSucursal || 'TODOS',
    IdCliente: destino?.IdCliente || '',
    Items: dist.Detalledistribucion.map(detalle => ({
      id: detalle.Producto?.IdProducto || detalle.Paquete?.IdPaquete,
      type: detalle.Producto ? 'producto' : 'paquete',
      Nombre: detalle.Producto?.Nombre || detalle.Paquete?.Nombre,
      Cantidad: detalle.Cantidad,
      precioUnitario: detalle.Precio,
      Modo: detalle.Modo,
      editableTotal: redondearPrecio(detalle.Precio * detalle.Cantidad),
      IdDetalleDistribucion: detalle.IdDetalleDistribucion,
    })),
    entrega: {
      direccion:destino?.direccion || '',
      fecha: destino.fecha ? new Date(destino.fecha).toISOString().split('T')[0] : formattedDate,
      hora: destino.hora|| formattedTime,
      barrioId: destino.barrioId || '',
      referencia: destino?.referencia || '',
      ubicacion: destino?.ubicacion || '',
      costoEnvio: destino?.CostoEnvio || 0,
      IdSucursalRetiro: ''
    }
  };
  idenvio.value = destino.EntregaId;
  iddireccion.value = destino.DireccionId;
  destionFInal.value = destino?.IdSucursal || 'TODOS';
  selectentrega.value = destino?.tipo || 'TPE-E1';

  if (dist.Cliente && selectentrega.value === 'TPE-E1') {
      nuevaDistribucion.value.entrega.IdSucursalRetiro = dist.Sucursal?.IdSucursal || '';
  }

  modoCreacion.value = true;
  isInitializing.value = false;
};

const resetFormulario = () => {
    nuevaDistribucion.value = {
        IdSucursalDestino: 'TODOS',
        IdCliente: '',
        Items: [],
        entrega: {
            direccion: '',
            fecha: formattedDate,
            hora: formattedTime,
            barrioId: '',
            referencia: '',
            ubicacion: '',
            costoEnvio: 0,
            IdSucursalRetiro: ''
        }
    };
    selectentrega.value = 'TPE-E1';
    activeTab.value = 'productos';
    filtroNombreItem.value = '';
    filtroCategoria.value = 'TODOS';
    filtroSubcategoria.value = 'TODOS';
};

const agregarProductoDesdeCard = async (producto) => {
    const stockInfo = getStockInfo({ id: producto.IdProducto, type: 'producto', Nombre: producto.Nombre });
    if (stockInfo.stock <= 0 && filtroSucursal.value !== 'TODOS') {
        mostrarNotificacion(`No hay stock disponible para ${stockInfo.nombre}.`, true);
        return;
    }

    const itemExistente = nuevaDistribucion.value.Items.find(i => i.id === producto.IdProducto && i.type === 'producto');
    if (itemExistente) {
        itemExistente.Cantidad += 1;
        itemExistente.editableTotal = redondearPrecio(itemExistente.precioUnitario * itemExistente.Cantidad); // Update editableTotal
    } else {
        const newItem = {
            id: producto.IdProducto,
            type: 'producto',
            Nombre: producto.Nombre,
            Cantidad: 1,
            precioUnitario: 0,
            Modo: 1,
        };
        if (isClientDestination.value) {
            newItem.precioUnitario = await calcularPrecio(newItem, true);
            newItem.editableTotal = redondearPrecio(newItem.precioUnitario * newItem.Cantidad); // Initialize editableTotal
        } else {
            newItem.editableTotal = 0; // Initialize even if not client destination
        }
        nuevaDistribucion.value.Items.push(newItem);
    }
    ajustarStockPorItem({ id: producto.IdProducto, type: 'producto' }, -1);
    mostrarNotificacion(`${producto.Nombre} agregado al envío.`);
};

const agregarPaqueteDesdeCard = async (paquete) => {
    const stockInfo = getStockInfo({ id: paquete.IdPaquete, type: 'paquete', Nombre: paquete.Nombre });
    if (stockInfo.stock <= 0 && filtroSucursal.value !== 'TODOS') {
        mostrarNotificacion(`No hay stock disponible para ${stockInfo.nombre}.`, true);
        return;
    }

    const itemExistente = nuevaDistribucion.value.Items.find(i => i.id === paquete.IdPaquete && i.type === 'paquete');
    if (itemExistente) {
        itemExistente.Cantidad += 1;
        itemExistente.editableTotal = redondearPrecio(itemExistente.precioUnitario * itemExistente.Cantidad); // Update editableTotal
    } else {
        const newItem = {
            id: paquete.IdPaquete,
            type: 'paquete',
            Nombre: paquete.Nombre,
            Cantidad: 1,
            precioUnitario: 0,
            Modo: 1,
        };
        if (isClientDestination.value) {
            newItem.precioUnitario = await calcularPrecio(newItem, true);
            newItem.editableTotal = redondearPrecio(newItem.precioUnitario * newItem.Cantidad); // Initialize editableTotal
        } else {
            newItem.editableTotal = 0; // Initialize even if not client destination
        }
        nuevaDistribucion.value.Items.push(newItem);
    }
    ajustarStockPorItem({ id: paquete.IdPaquete, type: 'paquete' }, -1);
    mostrarNotificacion(`${paquete.Nombre} agregado al envío.`);
};

const quitarItemDeLista = (index) => {
    const item = nuevaDistribucion.value.Items[index];
    ajustarStockPorItem(item, item.Cantidad);
    nuevaDistribucion.value.Items.splice(index, 1);
    mostrarNotificacion('Ítem eliminado del envío.');
};

const incrementarCantidad = (item) => {
  const stockInfo = getStockInfo(item);
  if (stockInfo.stock <= 0 && filtroSucursal.value !== 'TODOS') {
    mostrarNotificacion(`No hay más stock disponible para ${stockInfo.nombre}.`, true);
    return;
  }
  ajustarStockPorItem(item, -1);
  item.Cantidad++;
  item.editableTotal = redondearPrecio((item.precioUnitario * item.Cantidad)); // Update editableTotal
};

const decrementarCantidad = (item) => {

  if (item.Cantidad > 1) {
    ajustarStockPorItem(item, 1);
    item.Cantidad--;
    item.editableTotal = redondearPrecio((item.precioUnitario * item.Cantidad)); // Update editableTotal
  } else {
    const index = nuevaDistribucion.value.Items.findIndex(i => i.id === item.id && i.type === item.type);
    if (index !== -1) {
      quitarItemDeLista(index);
    }
  }
};

const handleCantidadChange = (item, event) => {
  const oldQuantity = item.Cantidad;
  let newQuantity = parseInt(event.target.value, 10);
  
  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1;
  }

  const stockInfo = getStockInfo(item);
  const maxAllowed = stockInfo.stock + oldQuantity;

  if (newQuantity > maxAllowed && filtroSucursal.value !== 'TODOS') {
    newQuantity = maxAllowed;
    mostrarNotificacion(`Stock máximo para ${stockInfo.nombre} es ${maxAllowed}.`, true);
  }
  
  const diff = newQuantity - oldQuantity;
  if (diff !== 0) {
      ajustarStockPorItem(item, -diff);
  }

  item.Cantidad = newQuantity;
  item.editableTotal = redondearPrecio(item.precioUnitario * item.Cantidad); // Update editableTotal
  if (event.target.value != newQuantity) {
      event.target.value = newQuantity;
  }
};

const actualizarPrecioItem = async (item) => {
    if (isClientDestination.value) {
        item.precioUnitario = await calcularPrecio(item, item.Modo === 1);
        item.editableTotal =redondearPrecio((item.precioUnitario * item.Cantidad)); // Update editableTotal after price recalculation
    }
};

const updatePrecioUnitario = (item) => {
  if (item.Cantidad > 0) {
    item.precioUnitario = item.editableTotal / item.Cantidad;
  } else {
    item.precioUnitario = 0;
  }
};
const redondearPrecio = (precio) => {
  const base = Math.floor(precio * 10) / 10; // redondea hacia abajo a la décima
  const diff = precio - base;

  if (diff < 0.05) {
    return base.toFixed(2); // baja
  } else {
    return (base + 0.1).toFixed(2); // sube
  }
};

const calcularPrecio = async (item, usarMayor = false) => {
    let precio = 0;
    try {
        if (item.type === 'producto') {
            const priceInfo = await PrecioProducto(item.id);
            precio = usarMayor && priceInfo?.PrecioMayor > 0 ? priceInfo.PrecioMayor : priceInfo?.Precio || 0;
        } else if (item.type === 'paquete') {
            const pack = paquetes.value.find(p => p.IdPaquete === item.id);
            precio = usarMayor && pack?.PrecioMayor > 0 ? pack.PrecioMayor : pack?.PrecioVenta || 0;
        }
    } catch (error) {
        console.error('Error calculando precio:', error);
    }
    return Number(precio);
};

const guardarDistribucion = async () => {
    if (!puedeGuardar.value) return;

    try {
        const payload = {
            IdDistribucion: nuevaDistribucion.value.IdDistribucion,
            IdCliente: nuevaDistribucion.value.IdCliente,
            Nombre: nuevoCliente.value?.Nombre,
            ApellidoPaterno: nuevoCliente.value?.ApellidoPaterno,
            ApellidoMaterno:nuevoCliente.value?.ApellidoMaterno,
            IdGenero:nuevoCliente.value?.IdGenero,
            email: nuevoCliente.value?.Email ,
            Celulares : nuevoCliente.value.Telefono,
            Documento : nuevoCliente.value.Documento,
            IdTipoEntrega: selectentrega.value,
            IdSucursal:filtroSucursal.value,
            IdTipoPedido : 'ITP-P1',
            Envio: idenvio.value || '',
            DireccionId:iddireccion.value || '',
            DestinoFInal :  nuevaDistribucion.value.IdSucursalDestino,
            pago:{ Monto:0 ,Cambio : 0},
             detalles: nuevaDistribucion.value.Items.map(item => ({
             IdDetalleDistribucion: item?.IdDetalleDistribucion,
             IdProducto: item.type === 'producto' ? item.id : null,
             IdPaquete: item.type === 'paquete' ? item.id : null,
             Cantidad: item.Cantidad,
             Precio: item.precioUnitario,
             Subtotal: item.subtotal,
             Modo: item.Modo || 0,
             })),
            entrega: {
              direccion: nuevaDistribucion.value.entrega.direccion,
              fecha: nuevaDistribucion.value.entrega.fecha,
              hora: nuevaDistribucion.value.entrega.hora,
              barrioId: nuevaDistribucion.value.entrega.barrioId,
              referencia: nuevaDistribucion.value.entrega.referencia,
              ubicacion: nuevaDistribucion.value.entrega.ubicacion,
              costoEnvio: nuevaDistribucion.value.entrega.costoEnvio,
              sucursaldestino: destionFInal.value
            }
        };
        console.log(payload)

        let response;
        if (esNuevaDistribucion.value) {
            response = await crearDistribucion(payload);
        } else {
            response = await actualizarDistribucion(payload);
        }
        
        await cargarDatos();
        cancelarModoCreacion();
        mostrarNotificacion(response.message);
       
    } catch (error) {
        console.error("Error al guardar la distribución:", error);
        mostrarNotificacion('No se pudo crear la distribución.', true);
    }
};

const toggleDetalles = (distId) => {
    if (distribucionAbierta.value === distId) {
        distribucionAbierta.value = null;
    } else {
        distribucionAbierta.value = distId;
    }
};

const abrirModalNuevoCliente = () => {
  mostrarModalNuevoCliente.value = true;
};

const cerrarModalNuevoCliente = () => {
  mostrarModalNuevoCliente.value = false;
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
          Complemento: { IdComplemento: 'C-1'},
          Tipodocumento: { IdTipoDocumento: 2 }
        },
        {
          IdDocumento: '',
          Documento: '',
          Complemento: null,
          Tipodocumento: { IdTipoDocumento: 1 }
        }
      ],
};
};

const guardarNuevoCliente = async () => {
  try {
    const response = await RegistrarCliente(nuevoCliente.value);
    mostrarNotificacion(response.message || 'Cliente registrado con éxito.');
    clientes.value = await listarCliente();
    nuevaDistribucion.value.IdCliente = response.cliente.IdPersona;
    cerrarModalNuevoCliente();
  } catch (error) {
    console.error('Error al registrar el cliente:', error);
    mostrarNotificacion(error.response?.data?.message || 'Error al registrar el cliente.', true);
  }
};

const confirmarAnulacion = (dist) => {
  distribucionParaAnular.value = dist;
  modalAnulacionVisible.value = true;
};

const cerrarModalAnulacion = () => {
  distribucionParaAnular.value = null;
  modalAnulacionVisible.value = false;
};

const anularDistribucionConfirmado = async () => {
  if (distribucionParaAnular.value) {
    try {
      const response = await anularDistribucion(distribucionParaAnular.value.IdDistribucion);
     // console.log(response)
     mostrarNotificacion(response.message);
     
      await cargarDatos();
    } catch (error) {
      console.error('Error al anular la distribución:', error);
      mostrarNotificacion('No se pudo anular la distribución.', true);
    }
  }
  cerrarModalAnulacion();
};

const mostrarNotificacion = (mensaje, esError = false) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => { showSuccessToast.value = false; }, 3000);
};

const getStatusClass = (estado) => {
    switch (estado) {
        case 'Entregado': return 'bg-gradient-to-r from-green-500 to-emerald-600';
        case 'En Camino': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
        case 'Pendiente': return 'bg-gradient-to-r from-red-500 to-rose-600';
        default: return 'bg-gray-500';
    }
};

const getStatusTextColor = (estado) => {
    switch (estado) {
        case 'Entregado': return 'text-green-600';
        case 'En Camino': return 'text-yellow-600';
        case 'Pendiente': return 'text-red-600';
        default: return 'text-gray-600';
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await cargarDatos();
    await ListarCategoriasPrincipales();
});

</script>