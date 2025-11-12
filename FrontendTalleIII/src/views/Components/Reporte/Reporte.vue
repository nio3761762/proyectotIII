<template>
  <div class="min-h-screen">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- Header -->
    <div class="relative overflow-hidden animate-fade-in-up">
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <FileText class="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Reportes
              </h1>
              <p class="text-gray-600 mt-1 font-medium">Visualiza y exporta los datos del sistema</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mt-6 animate-fade-in-up delay-100">
      <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold mb-4">
        <Filter class="h-5 w-5 text-orange-600" />
        Filtros
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Filtros Comunes -->
        <input type="date" v-model="filtros.desde" :max="filtros.hasta" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none" />
        <input type="date" v-model="filtros.hasta" :min="filtros.desde" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none" />
        <select v-model="filtros.tienda" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todas las tiendas</option>
          <option v-for="sucursal in sucursales" :key="sucursal.IdSucursal" :value="sucursal.IdSucursal">{{ sucursal.Nombre }}</option>
        </select>

        <!-- Filtros Contextuales -->
        <template v-if="activeTab === 'ventas'">
          <select v-model="filtros.vendedor" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
            <option value="">Todos los vendedores</option>
            <option v-for="user in usuarioVendedor" :key="user.IdUsuario" :value="user.IdUsuario">{{ user.Persona?.Nombre + ' ' + user.Persona?.ApellidoPaterno }}</option>
          </select>
          <select v-model="filtros.metodoPago" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
            <option value="0">Todos los métodos</option>
            <option v-for="met in metodo" :key="met.IdMetodoPago" :value="met.IdMetodoPago">{{ met.Nombre }}</option>
          </select>
        </template>

        <template v-if="activeTab === 'pedidos'">
          <select v-model="filtros.metodoPago" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
            <option value="0">Todos los métodos</option>
            <option v-for="met in metodo" :key="met.IdMetodoPago" :value="met.IdMetodoPago">{{ met.Nombre }}</option>
          </select>
          <select v-model="filtros.TipoCliente" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
            <option value="">Tipo de Cliente</option>
            <option value="mayorista">Mayorista</option>
            <option value="normal">Normal</option>
          </select>
          <select v-model="filtros.IdEstado" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
            <option value="0">Estado del Pedido</option>
            <option value="9">Reservado</option><option value="6">Pendiente</option><option value="7">En Preparacion</option><option value="5">Anulado</option><option value="15">Cancelado</option><option value="8">Enviado</option><option value="12">Devolución</option><option value="14">Devolución Parcial</option><option value="13">Entregado</option>
          </select>
          <select v-model="filtros.IdEstadoVenta" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
            <option value="0">Estado de Venta</option>
            <option value="3">Pagado</option><option value="4">Por Pagar</option><option value="5">Anulado</option>
          </select>
        </template>

        <template v-if="activeTab === 'productos' || activeTab === 'pedidos'">
            <select v-model="filtroCategoria" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
                <option value="">Todas las categorías</option>
                <option v-for="cat in categorias" :key="cat.IdCategoria" :value="cat.IdCategoria">{{ cat.Nombre }}</option>
            </select>
            <select v-model="filtros.subcategorias" :disabled="!filtroCategoria" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none disabled:opacity-50">
                <option value="">Todas las subcategorías</option>
                <option v-for="subcat in subcategoriasParaFiltro" :key="subcat.IdSubCategoria" :value="subcat.IdSubCategoria">{{ subcat.Nombre }}</option>
            </select>
        </template>
      </div>

      <div class="flex flex-wrap items-center justify-between mt-6">
        <div class="flex flex-wrap gap-2">
            <button @click="aplicarFiltroRapido('today')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Hoy</button>
            <button @click="aplicarFiltroRapido('yesterday')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Ayer</button>
            <button @click="aplicarFiltroRapido('this_week')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Esta Semana</button>
            <button @click="aplicarFiltroRapido('this_month')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Este Mes</button>
            <button @click="aplicarFiltroRapido('last_7_days')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Últimos 7 Días</button>
            <button @click="aplicarFiltroRapido('last_30_days')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Últimos 30 Días</button>
        </div>
        <div class="flex gap-3">
          <button @click="exportarExcel" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
            <Sheet class="h-4 w-4" />
            Excel
          </button>
          <button @click="exportarPDF" class="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
            <FileText class="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Indicadores -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
        <div class="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg"><DollarSign class="h-6 w-6 text-white"/></div>
        <div><p class="text-gray-500">Total Ventas</p><h2 class="text-2xl font-bold text-green-600">{{ indicadores.totalVentas.toFixed(2) }} Bs.</h2></div>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
        <div class="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg"><Package class="h-6 w-6 text-white"/></div>
        <div><p class="text-gray-500">Productos Vendidos</p><h2 class="text-2xl font-bold">{{ indicadores.productosVendidos }}</h2></div>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
        <div class="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg"><Users class="h-6 w-6 text-white"/></div>
        <div><p class="text-gray-500">Clientes Atendidos</p><h2 class="text-2xl font-bold">{{ indicadores.clientes }}</h2></div>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
        <div class="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg"><XCircle class="h-6 w-6 text-white"/></div>
        <div><p class="text-gray-500">Ventas Anuladas</p><h2 class="text-2xl font-bold text-red-600">{{ indicadores.ventasAnuladas }}</h2></div>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
        <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg"><DollarSign class="h-6 w-6 text-white"/></div>
        <div><p class="text-gray-500">Ganancia Neta</p><h2 class="text-2xl font-bold text-purple-600">{{ indicadores.gananciaNeta.toFixed(2) }} Bs.</h2></div>
      </div>
    </div>

    <!-- Pestañas de Navegación -->
    <div class="mb-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-2">
      <div class="flex items-center gap-2">
        <button @click="activeTab = 'ventas'" :class="['flex-1 text-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300', activeTab === 'ventas' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'hover:bg-orange-50 text-gray-600']">Detalle de Ventas</button>
        <button @click="activeTab = 'pedidos'" :class="['flex-1 text-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300', activeTab === 'pedidos' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'hover:bg-orange-50 text-gray-600']">Detalle de Pedidos</button>
        <button @click="activeTab = 'productos'" :class="['flex-1 text-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300', activeTab === 'productos' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'hover:bg-orange-50 text-gray-600']">Reporte de Productos</button>
        <button @click="activeTab = 'insumos'" :class="['flex-1 text-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300', activeTab === 'insumos' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'hover:bg-orange-50 text-gray-600']">Reporte de Insumos</button>
      </div>
    </div>

    <!-- Contenido de las Pestañas -->
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
      <div v-if="activeTab === 'ventas'">
        <h3 class="text-xl font-bold mb-4">Detalle de Ventas</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Precio Unitario</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Subtotal</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Factura</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="dateGroup in sortedVentas" :key="dateGroup.fecha">
                <tr v-if="dateGroup.ventas.length > 0">
                  <td colspan="8" class="p-4 text-center bg-gray-200 font-semibold text-gray-700">
                    {{ formatFecha(dateGroup.fecha) }} - Total del Día: {{ dateGroup.totalIngreso.toFixed(2) }} Bs.
                  </td>
                </tr>
                <template v-for="ventaData in dateGroup.ventas" :key="ventaData.idVenta + ventaData.producto">
                  <tr>
                    <td v-if="ventaData.isFirstInSale" :rowspan="ventaData.clientRowspan" class="p-3 border-b border-gray-200 text-sm align-top">{{ ventaData.cliente }}</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ ventaData.producto }}</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ ventaData.cantidad }}</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ ventaData.precio }} Bs.</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ ventaData.subtotal }} Bs.</td>
                    <td class="p-3 border-b border-gray-200 text-sm"><span :class="{'text-green-600 font-bold': ventaData.estado === 'Pagado', 'text-red-600 font-bold': ventaData.estado === 'Anulada' || ventaData.estado === 'Por Pagar'}">{{ ventaData.estado }}</span></td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ ventaData.hasFactura ? 'Sí' : 'No' }}</td>
                  </tr>
                </template>
              </template>
              <tr v-if="sortedVentas.length === 0"><td colspan="8" class="p-4 text-center">No hay datos de ventas para mostrar.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'pedidos'">
        <h3 class="text-xl font-bold mb-4">Detalle de Pedidos</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado Pedido</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado Venta</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Origen</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Precio Unitario</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Subtotal</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Pagado</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="dateGroup in processedPedidosGrouped" :key="dateGroup.fecha">
                <tr v-if="dateGroup.pedidos.length > 0">
                  <td colspan="9" class="p-4 text-center bg-gray-200 font-semibold text-gray-700">
                    {{ formatFecha(dateGroup.fecha) }} - Total Pedidos: {{ dateGroup.totalPedidos }}
                  </td>
                </tr>
                <template v-for="pedido in dateGroup.pedidos" :key="pedido.id">
                  <tr>
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 border-b border-gray-200 text-sm align-top">{{ pedido.cliente }}</td>
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 border-b border-gray-200 text-sm align-top">{{ pedido.estadoPedido }}</td>
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 border-b border-gray-200 text-sm align-top">{{ pedido.estadoVenta }}</td>
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 border-b border-gray-200 text-sm align-top">{{ pedido.origen }}</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ pedido.productoNombre }}</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ pedido.productoCantidad }}</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ pedido.productoPrecio }} Bs.</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ pedido.subtotal }} Bs.</td>
                    <td v-if="pedido.isFirstInPedido" :rowspan="pedido.pedidoRowspan" class="p-3 border-b border-gray-200 text-sm align-top">{{ pedido.total.toFixed(2) }} Bs.</td>
                  </tr>
                </template>
              </template>
              <tr v-if="processedPedidosGrouped.length === 0">
                <td colspan="9" class="p-4 text-center">No hay datos de pedidos para mostrar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'productos'">
        <h3 class="text-xl font-bold mb-4">Reporte de Productos Vendidos</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Imagen</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Detalle</th>
                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad Vendida</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="dateGroup in processedProductosGrouped" :key="dateGroup.fecha">
                <tr v-if="dateGroup.items.length > 0">
                  <td colspan="5" class="p-4 text-center bg-gray-200 font-semibold text-gray-700">
                    {{ formatFecha(dateGroup.fecha) }}
                  </td>
                </tr>
                <tr v-for="item in dateGroup.items" :key="item.id" class="hover:bg-gray-50/50">
                  <td class="p-2 border-b border-gray-200"><img :src="item.imagen" :alt="item.nombre" class="h-12 w-12 object-cover rounded-lg"></td>
                  <td class="p-3 border-b border-gray-200 text-sm">{{ item.tipo }}</td>
                  <td class="p-3 border-b border-gray-200 text-sm">{{ item.nombre }}</td>
                  <td class="p-3 border-b border-gray-200 text-sm">{{ item.subcategoria }}</td>
                  <td class="p-3 border-b border-gray-200 text-sm">{{ item.cantidad }}</td>
                </tr>
              </template>
              <tr v-if="processedProductosGrouped.length === 0">
                <td colspan="5" class="p-4 text-center">No hay datos de productos vendidos para mostrar.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Reporte de Productos Más Vendidos -->
        <div class="mt-8">
            <h4 class="text-lg font-semibold mt-4 mb-2">Productos Más Vendidos</h4>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Imagen</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad Vendida</th>
                  </tr>
                </thead>
                <tbody v-if="mostSoldProducts.length > 0">
                  <tr v-for="item in mostSoldProducts" :key="item.IdItem" class="hover:bg-gray-50/50">
                    <td class="p-2 border-b border-gray-200"><img :src="item.UrlImagen" :alt="item.NombreItem" class="h-12 w-12 object-cover rounded-lg"></td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ item.NombreItem }}</td>
                    <td class="p-3 border-b border-gray-200 text-sm">{{ item.cantidadVendida }}</td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr><td colspan="3" class="p-4 text-center">No hay datos de productos más vendidos.</td></tr>
                </tbody>
              </table>
            </div>
        </div>

        <!-- Reporte de Paquetes Más Vendidos -->
        <div class="mt-8">
            <h4 class="text-lg font-semibold mt-4 mb-2">Paquetes Vendidos por Fecha</h4>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Imagen</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad Vendida</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Contenido</th>
                  </tr>
                </thead>
                <tbody v-if="processedPaquetesGrouped.length > 0">
                  <template v-for="dateGroup in processedPaquetesGrouped" :key="dateGroup.fecha">
                    <tr v-if="dateGroup.paquetes.length > 0">
                      <td colspan="4" class="p-4 text-center bg-gray-200 font-semibold text-gray-700">
                        {{ formatFecha(dateGroup.fecha) }}
                      </td>
                    </tr>
                    <tr v-for="item in dateGroup.paquetes" :key="item.IdPaquete" class="hover:bg-gray-50/50">
                      <td class="p-2 border-b border-gray-200"><img :src="item.UrlImagen" :alt="item.Nombre" class="h-12 w-12 object-cover rounded-lg"></td>
                      <td class="p-3 border-b border-gray-200 text-sm">{{ item.Nombre }}</td>
                      <td class="p-3 border-b border-gray-200 text-sm">{{ item.cantidadVendida }}</td>
                      <td class="p-3 border-b border-gray-200 text-sm">
                        <ul>
                          <li v-for="contenido in item.Contenido" :key="contenido.IdProducto">(x{{ contenido.Cantidad }}) {{ contenido.Nombre }} </li>
                        </ul>
                      </td>
                      <!--  uuuuu  -->
                    </tr>
                  </template>
                </tbody>
                <tbody v-else>
                  <tr><td colspan="4" class="p-4 text-center">No hay datos de paquetes vendidos.</td></tr>
                </tbody>
              </table>
            </div>
        </div>

        <!-- Reporte de Promociones Más Vendidas -->
        <div class="mt-8">
            <h4 class="text-lg font-semibold mt-4 mb-2">Promociones Vendidas por Fecha</h4>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Imagen</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad Vendida</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Contenido</th>
                  </tr>
                </thead>
                <tbody v-if="processedPromocionesGrouped.length > 0">
                  <template v-for="dateGroup in processedPromocionesGrouped" :key="dateGroup.fecha">
                    <tr v-if="dateGroup.promociones.length > 0">
                      <td colspan="4" class="p-4 text-center bg-gray-200 font-semibold text-gray-700">
                        {{ formatFecha(dateGroup.fecha) }}
                      </td>
                    </tr>
                    <tr v-for="item in dateGroup.promociones" :key="item.IdPromocion" class="hover:bg-gray-50/50">
                      <td class="p-2 border-b border-gray-200"><img :src="item.UrlImagen" :alt="item.Nombre" class="h-12 w-12 object-cover rounded-lg"></td>
                      <td class="p-3 border-b border-gray-200 text-sm">{{ item.Nombre }}</td>
                      <td class="p-3 border-b border-gray-200 text-sm">{{ item.cantidadVendida }}</td>
                      <td class="p-3 border-b border-gray-200 text-sm">
                        <ul>
                          <li v-for="contenido in item.Contenido" :key="contenido.Id">(x{{ contenido.Cantidad }}) {{  contenido.Nombre }} </li>
                        </ul>
                      </td>
                    </tr>
                  </template>
                </tbody>
                <tbody v-else>
                  <tr><td colspan="4" class="p-4 text-center">No hay datos de promociones vendidas.</td></tr>
                </tbody>
              </table>
            </div>
        </div>
      </div>

      <div v-if="activeTab === 'insumos'">
        <h3 class="text-xl font-bold mb-4">Reporte de Insumos</h3>
        <div class="space-y-6">
          <!-- Detalle de Compras de Insumos -->
          <div>
            <h4 class="text-lg font-semibold mt-4 mb-2">Detalle de Compras de Insumos</h4>
            <div v-if="comprasPorFecha.length > 0">
              <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Proveedor</th>
                      <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Insumo</th>
                      <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad Comprada</th>
                      <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                      <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="data in comprasPorFecha" :key="data.fecha">
                      <tr>
                        <td colspan="5" class="p-4 text-center bg-gray-200 font-semibold text-gray-700">
                          {{ formatFecha(data.fecha) }}
                        </td>
                      </tr>
                      <tr v-for="(row, index) in data.rows" :key="index">
                        <td v-if="row.proveedorRowspan > 0" :rowspan="row.proveedorRowspan" class="p-3 border-b border-gray-200 text-sm text-center align-middle">
                          {{ row.proveedor }}
                        </td>
                        <td class="p-3 border-b border-gray-200 text-sm">{{ row.detalle.NombreProducto }}</td>
                        <td class="p-3 border-b border-gray-200 text-sm">{{ row.detalle.CantidadComprada }} {{ row.detalle.UnidadMedida }} ({{ row.detalle.UnidadAbreviatura }})</td>
                        <td class="p-3 border-b border-gray-200 text-sm">{{ row.detalle.Precio }}</td>
                        <td class="p-3 border-b border-gray-200 text-sm">{{ row.detalle.Subtotal.toFixed(2) }}</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="p-4 text-center">
              No hay datos de compras de insumos.
            </div>
            <div v-if="insumos && insumos.totalInversionCompras" class="mt-4 text-right">
              <span class="text-lg font-bold">Total Inversión: {{ insumos.totalInversionCompras.toFixed(2) }} Bs.</span>
            </div>
          </div>

          <hr class="my-8 border-gray-300">

          <!-- Recetas de Productos -->
          <div>
            <h4 class="text-lg font-semibold mt-4 mb-2">Recetas de Productos</h4>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Ingrediente</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad</th>
                  </tr>
                </thead>
                <tbody v-if="reporteProductosProcesado.length > 0">
                  <template v-for="producto in reporteProductosProcesado" :key="producto.IdProducto">
                    <tr v-for="(ingrediente, index) in producto.Ingredientes" :key="ingrediente.Nombre" class="hover:bg-gray-50/50">
                      <td v-if="index === 0" :rowspan="producto.rowspan" class="p-3 border-b border-gray-200 text-sm align-top">
                        <div class="flex items-center">
                          <img :src="producto.Imagen" :alt="producto.Nombre" class="h-16 w-16 object-cover rounded-lg mr-4">
                          <span class="font-bold">{{ producto.Nombre }}</span>
                        </div>
                      </td>
                      <td class="p-3 border-b border-gray-200 text-sm">{{ ingrediente.Nombre }}</td>
                      <td class="p-3 border-b border-gray-200 text-sm">{{ ingrediente.Cantidad }} {{ ingrediente.Unidad }} ({{ ingrediente.Abreviatura }})</td>
                    </tr>
                    <tr v-if="producto.Ingredientes.length === 0">
                      <td class="p-3 border-b border-gray-200 text-sm align-top">
                        <div class="flex items-center">
                          <img :src="producto.Imagen" :alt="producto.Nombre" class="h-16 w-16 object-cover rounded-lg mr-4">
                          <span class="font-bold">{{ producto.Nombre }}</span>
                        </div>
                      </td>
                      <td colspan="2" class="p-3 border-b border-gray-200 text-sm text-center">Este producto no tiene ingredientes registrados.</td>
                    </tr>
                  </template>
                </tbody>
                <tbody v-else>
                  <tr><td colspan="3" class="p-4 text-center">No hay datos de recetas de productos.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr class="my-8 border-gray-300">

          <!-- Reporte de Producción y Consumo -->
          <div>
            <h4 class="text-lg font-semibold mt-4 mb-2">Reporte de Producción y Consumo</h4>
            <div v-if="unifiedProductionReport.length > 0" class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Para Tiendas</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Para Clientes</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Producido</th>
                    <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Ingredientes Utilizados</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, index) in unifiedProductionReport" :key="index">
                    <tr v-if="item.type === 'date_header'" class="bg-gray-200">
                      <td colspan="5" class="p-4 text-center font-semibold text-gray-700">
                        {{ formatFecha(item.fecha) }}
                      </td>
                    </tr>
                    <tr v-else-if="item.type === 'product_production'" class="hover:bg-gray-50/50">
                      <td class="p-3 border-b border-gray-200 text-sm align-top">
                        <div class="flex items-center">
                          <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre" class="h-12 w-12 object-cover rounded-lg mr-4">
                          <span class="font-bold">{{ item.nombre }}</span>
                        </div>
                      </td>
                      <td class="p-3 border-b border-gray-200 text-sm align-top">{{ item.tiendas }}</td>
                      <td class="p-3 border-b border-gray-200 text-sm align-top">{{ item.clientes }}</td>
                      <td class="p-3 border-b border-gray-200 text-sm align-top font-semibold">{{ item.totalproducido }}</td>
                      <td class="p-3 border-b border-gray-200 text-sm">
                        <ul v-if="item.ingredientesUsados.length > 0" class="list-disc list-inside">
                          <li v-for="ingrediente in item.ingredientesUsados" :key="ingrediente.nombre">
                            {{ ingrediente.nombre }}: {{ ingrediente.cantidad }} {{ ingrediente.abreviatura }}
                          </li>
                        </ul>
                        <span v-else>N/A</span>
                      </td>
                    </tr>
                    <!-- ngfnjg sen -->
                    <tr v-else-if="item.type === 'ingredient_summary_table'">
                      <td colspan="6" class="border-b ">
                        <h6 class="bg-gray-100 text-lg font-semibold mt-6 mb-2 text-center p-3">-- Resumen del Día --</h6>
                        <div class="overflow-x-auto">
                          <table class="w-full border-collapse">
                            <thead>
                              <tr >
                                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Insumo</th>
                                <th v-for="insumo in item.resumenInsumos" :key="insumo.id" class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">{{ insumo.nombre }}</th>
                              </tr>
                              <tr >
                                <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad Total Consumida</th>
                                <td v-for="insumo in item.resumenInsumos" :key="insumo.id" class="p-3 border-b border-gray-200 text-sm">{{ insumo.cantidadTotal.toFixed(2) }} {{ insumo.abreviatura }}</td>
                              </tr>
                            </thead>
                          </table>
                          <div v-if="item.resumenInsumos.length === 0" class="p-4 text-center">
                            No hay insumos consumidos para esta fecha.
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-if="unifiedProductionReport.length === 0">
                    <td colspan="6" class="p-4 text-center">No hay datos de producción para mostrar.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-4 text-center">
              No hay datos de producción para mostrar.
            </div>
          </div>
            
                <hr class="my-12 border-gray-400">
            
                <div>
                  <h4 class="text-lg font-semibold mt-4 mb-2">Resumen de Stock de Insumos (en Unidades de Compra)</h4>
                  <div class="overflow-x-auto">
                      <table class="w-full border-collapse">
                          <thead>
                              <tr class="bg-gray-100">
                                  <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Insumo</th>
                                  <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Cantidad Comprada</th>
                                  <th class="p-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Stock Restante</th>
                              </tr>
                          </thead>
                          <tbody v-if="insumos && insumos.reporteInsumos && insumos.reporteInsumos.length > 0">
                              <tr v-for="insumo in insumos.reporteInsumos" :key="insumo.Nombre" class="hover:bg-gray-50/50">
                                  <td class="p-3 border-b border-gray-200 text-sm font-bold">{{ insumo.Nombre }}</td>
                                  <td class="p-3 border-b border-gray-200 text-sm">
                                      {{ insumo.CompradoOriginalUnit ? insumo.CompradoOriginalUnit.toFixed(2) : '0.00' }} {{ insumo.UnidadOriginalNombre }} ({{ insumo.UnidadOriginalAbreviatura }})
                                  </td>
                                  <td class="p-3 border-b border-gray-200 text-sm">
                                      {{ insumo.StockOriginalUnit ? insumo.StockOriginalUnit.toFixed(2) : '0.00' }} {{ insumo.UnidadOriginalNombre }} ({{ insumo.UnidadOriginalAbreviatura }})
                                  </td>
                              </tr>
                          </tbody>
                          <tbody v-else>
                              <tr><td colspan="3" class="p-4 text-center">No hay datos de resumen de stock.</td></tr>
                          </tbody>
                      </table>
                  </div>
                </div>        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { FileText, Filter, Sheet, DollarSign, Package, Users, XCircle } from 'lucide-vue-next'
import { listarMetodo } from "@/Server/Pago"
import { listarSucursales } from "@/Server/api"
import { usuariosSinSucursal } from "@/Server/Usuario"
import { ReporteInsumo, ReporteVenta, ReportePedido,ReporteProducto } from "@/Server/Reporte"
import { listarCategorias, ObtenerSubCategorias } from '@/Server/Categoria';

// --- Lógica de Pestañas ---
const activeTab = ref('ventas');

// --- Lógica de Ordenamiento ---
const sortKey = ref('');
const sortOrder = ref('asc');

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

const processedVentasGrouped = computed(() => {
  const grouped = [];
  if (!ventas.value || !ventas.value.reportePorFecha) return [];

  for (const fecha in ventas.value.reportePorFecha) {
    const ventasDelDia = ventas.value.reportePorFecha[fecha].ventas;
    const totalIngresoDia = ventas.value.reportePorFecha[fecha].totalIngreso;

    const processedSales = [];
    let dateRowspan = 0;

    ventasDelDia.forEach(venta => {
      const clientName = (venta.Cliente?.Nombre && venta.Cliente?.ApellidoPaterno) ? `${venta.Cliente.Nombre} ${venta.Cliente.ApellidoPaterno}` : venta.Persona || 'N/A';
      const clientRowspan = venta.Detalleventa.length > 0 ? venta.Detalleventa.length : 1;
      dateRowspan += clientRowspan;

      venta.Detalleventa.forEach((detalle, index) => {
        const productName = detalle.Producto?.Nombre || detalle.Paquete?.Nombre || detalle.Promocion?.Nombre || 'N/A';
        const subtotal = (parseFloat(detalle.Cantidad) * parseFloat(detalle.Precio || '0')).toFixed(2);

        processedSales.push({
          idVenta: venta.IdVenta,
          fecha: venta.FechaVenta,
          cliente: clientName,
          producto: productName,
          cantidad: detalle.Cantidad,
          precio: parseFloat(detalle.Precio || '0').toFixed(2),
          subtotal: subtotal,
          estado: venta.Estado,
          hasFactura: !!venta.Factura,
          isFirstInSale: index === 0,
          clientRowspan: index === 0 ? clientRowspan : 0,
        });
      });

      if (venta.Detalleventa.length === 0) {
        processedSales.push({
          idVenta: venta.IdVenta,
          fecha: venta.FechaVenta,
          cliente: clientName,
          producto: 'Sin detalles',
          cantidad: 0,
          precio: '0.00',
          subtotal: '0.00',
          estado: venta.Estado,
          hasFactura: !!venta.Factura,
          isFirstInSale: true,
          clientRowspan: 1,
        });
      }
    });

    grouped.push({
      fecha: fecha,
      totalIngreso: totalIngresoDia,
      ventas: processedSales,
      dateRowspan: dateRowspan > 0 ? dateRowspan : 1,
    });
  }
  return grouped;
});

const processedProductosGrouped = computed(() => {
  const grouped = [];
  const allItems = {}; // To group all product types by date

  // Process Productos Vendidos
  if (productos.value && productos.value.productosVendidos) {
    productos.value.productosVendidos.forEach(fechaData => {
      if (!allItems[fechaData.fecha]) allItems[fechaData.fecha] = [];
      fechaData.productos.forEach(item => {
        allItems[fechaData.fecha].push({
          id: `prod-${item.IdItem}`,
          tipo: 'Producto',
          nombre: item.NombreItem,
          subcategoria: item.Subcategoria,
          cantidad: item.cantidadVendida,
          imagen: item.UrlImagen,
        });
      });
    });
  }

  // Convert grouped items into the final array structure
  for (const fecha in allItems) {
    grouped.push({
      fecha: fecha,
      items: allItems[fecha],
    });
  }

  // Sort by date (newest first)
  grouped.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return grouped;
});

const sortedVentas = computed(() => {
  const sorted = [...processedVentasGrouped.value];
  // Sorting for grouped data might be different, or applied within each group if needed.
  // For now, we'll assume sorting is applied to the date groups themselves if sortKey matches 'fecha'.
  if (sortKey.value === 'fecha') {
    sorted.sort((a, b) => {
      return sortOrder.value === 'asc' ? String(a.fecha).localeCompare(String(b.fecha)) : String(b.fecha).localeCompare(String(a.fecha));
    });
  }
  return sorted;
});

const processedPedidosGrouped = computed(() => {
  const grouped = [];
  if (!pedidos.value || !pedidos.value.reportePorFecha) return [];

  for (const fecha in pedidos.value.reportePorFecha) {
    const pedidosDelDia = pedidos.value.reportePorFecha[fecha].pedidos;
    const processedPedidos = [];

    pedidosDelDia.forEach(pedido => {
      const pedidoRowspan = pedido.Detallepedido && pedido.Detallepedido.length > 0 ? pedido.Detallepedido.length : 1;
      const totalPagado = pedido.Venta?.Pago?.reduce((acc, p) => acc + p.Total, 0) || 0;

      if (pedido.Detallepedido && pedido.Detallepedido.length > 0) {
        pedido.Detallepedido.forEach((detalle, index) => {
          const subtotal = (parseFloat(detalle.Cantidad) * parseFloat(detalle.Precio || '0')).toFixed(2);
          processedPedidos.push({
            id: `${pedido.IdPedido}-${index}`,
            isFirstInPedido: index === 0,
            pedidoRowspan: pedidoRowspan,
            cliente: pedido.Venta?.Persona || 'N/A',
            estadoPedido: pedido.Estado,
            estadoVenta: pedido.Venta?.Estado?.Nombre || 'N/A',
            origen: pedido.Origen || 'N/A',
            total: totalPagado,
            productoNombre: detalle.Producto?.Nombre || detalle.Paquete?.Nombre || detalle.Promocion?.Nombre || 'N/A',
            productoCantidad: detalle.Cantidad,
            productoPrecio: detalle.Precio,
            subtotal: subtotal,
          });
        });
      } else {
        // Handle orders with no detail items
        processedPedidos.push({
          id: pedido.IdPedido,
          isFirstInPedido: true,
          pedidoRowspan: 1,
          cliente: pedido.Venta?.Persona || 'N/A',
          estadoPedido: pedido.Estado,
          estadoVenta: pedido.Venta?.Estado?.Nombre || 'N/A',
          origen: pedido.Origen || 'N/A',
          total: totalPagado,
          productoNombre: 'Sin detalles',
          productoCantidad: '-',
          productoPrecio: '-',
        });
      }
    });

    grouped.push({
      fecha: fecha,
      pedidos: processedPedidos,
      totalPedidos: pedidos.value.reportePorFecha[fecha].totalPedidos,
    });
  }
  // Sort by date descending
  grouped.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return grouped;
});

// Filtros
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
const day = String(today.getDate()).padStart(2, '0');
const currentDate = `${year}-${month}-${day}`;
const filtros = ref({ desde: currentDate, hasta: currentDate, tienda: "", vendedor: "", metodoPago: 0, subcategorias:'', TipoCliente:'', IdEstado:0, IdEstadoVenta:0 });
const filtroCategoria = ref('');
const categorias = ref([]);
const subcategoriasParaFiltro = ref([]);





const productosDisponiblesUnicos = computed(() => {
  if (!productos.value || !productos.value.productosDisponibles) return [];
  const unicos = new Map();
  productos.value.productosDisponibles.forEach(p => { if (!unicos.has(p.IdProducto)) unicos.set(p.IdProducto, p); });
  return Array.from(unicos.values());
});

const comprasPorFecha = computed(() => {
  if (!insumos.value || !insumos.value.reporteComprasDetallado) {
    return [];
  }

  return insumos.value.reporteComprasDetallado.map(fechaData => {
    const rows = [];
    fechaData.Proveedores.forEach(proveedorData => {
      const proveedor = proveedorData.Proveedor;
      const totalDetallesForProveedor = proveedorData.Compras.reduce((compraTotal, compra) => compraTotal + (compra.Detalles ? compra.Detalles.length : 0), 0);
      let isFirstRowForProveedor = true;

      proveedorData.Compras.forEach(compra => {
        if (compra.Detalles) {
                            compra.Detalles.forEach(detalle => {
                              const insumoData = insumos.value.reporteInsumos?.find(
                                (ins) => ins.Nombre === detalle.NombreProducto
                              );
                              rows.push({
                                proveedor: proveedor,
                                detalle: {
                                  ...detalle,
                                  UnidadAbreviatura: insumoData ? insumoData.Abreviado : '',
                                },
                                proveedorRowspan: isFirstRowForProveedor ? totalDetallesForProveedor : 0,
                              });
                              isFirstRowForProveedor = false;
                            });        }
      });
    });
    return {
      fecha: fechaData.Fecha,
      rows: rows,
    };
  });
});

const comprasDetalladasRows = computed(() => {
  if (!insumos.value || !insumos.value.reporteComprasDetallado) {
    return [];
  }

  const rows = [];
  insumos.value.reporteComprasDetallado.forEach(fechaData => {
    const fecha = fechaData.Fecha;
    const totalDetallesForFecha = fechaData.Proveedores.reduce((total, prov) => {
      return total + prov.Compras.reduce((compraTotal, compra) => compraTotal + compra.Detalles.length, 0);
    }, 0);

    let isFirstRowForFecha = true;

    fechaData.Proveedores.forEach(proveedorData => {
      const proveedor = proveedorData.Proveedor;
      const totalDetallesForProveedor = proveedorData.Compras.reduce((compraTotal, compra) => compraTotal + compra.Detalles.length, 0);

      let isFirstRowForProveedor = true;
      proveedorData.Compras.forEach(compra => {
        compra.Detalles.forEach(detalle => {
          rows.push({
            fecha: fecha,
            proveedor: proveedor,
            detalle: detalle,
            fechaRowspan: isFirstRowForFecha ? totalDetallesForFecha : 0,
            proveedorRowspan: isFirstRowForProveedor ? totalDetallesForProveedor : 0,
          });
          isFirstRowForFecha = false;
          isFirstRowForProveedor = false;
        });
      });
    });
  });
  return rows;
});

const reporteProductosProcesado = computed(() => {
  if (!insumos.value || !insumos.value.reporteProductos) {
    return [];
  }
  return insumos.value.reporteProductos.map(producto => ({
    ...producto,
    rowspan: producto.Ingredientes.length > 0 ? producto.Ingredientes.length : 1,
  }));
});

const produccionPorFechaProcesada = computed(() => {
  if (!insumos.value || !insumos.value.produccionPorFecha) {
    return [];
  }

  const getProductImage = (productName) => {
    if (!insumos.value.reporteProductos) return '';
    const product = insumos.value.reporteProductos.find(p => p.Nombre === productName);
    return product ? product.Imagen : '';
  };

  const processed = Object.entries(insumos.value.produccionPorFecha).map(([fecha, data]) => {
    const productos = Object.entries(data.productos).map(([prodId, prodData]) => ({
      id: prodId,
      nombre: prodData.nombre,
      imagen: getProductImage(prodData.nombre),
      tiendas: prodData.tiendas,
      clientes: prodData.clientes,
      totalproducido: prodData.totalproducido,
      ingredientesUsados: prodData.ingredientesUsados.map(ing => ({
        ...ing,
        cantidad: parseFloat(ing.cantidad).toFixed(2) 
      })),
    }));

    const resumenInsumos = Object.entries(data.resumenInsumos).map(([insumoId, insumoData]) => ({
      id: insumoId,
      nombre: insumoData.nombre,
      cantidadTotal: insumoData.cantidadTotal,
      abreviatura: insumoData.abreviatura,
    }));
  //
    return {
      fecha,
      productos,
      resumenInsumos,
    };
  });

  // Sort by date descending
  return processed.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const unifiedProductionReport = computed(() => {
  const unified = [];
  produccionPorFechaProcesada.value.forEach(dateGroup => {
    unified.push({ type: 'date_header', fecha: dateGroup.fecha });
    dateGroup.productos.forEach(producto => {
      unified.push({ type: 'product_production', ...producto });
    });
    if (dateGroup.resumenInsumos.length > 0) {
      unified.push({ type: 'ingredient_summary_table', resumenInsumos: dateGroup.resumenInsumos });
    }
  });
  return unified;
});

const mostSoldProducts = computed(() => {
  if (!productos.value || !productos.value.productosVendidos) return [];
  const aggregated = {};
  productos.value.productosVendidos.forEach(fechaData => {
    fechaData.productos.forEach(item => {
      if (!aggregated[item.IdItem]) {
        aggregated[item.IdItem] = { ...item, cantidadVendida: 0 };
      }
      aggregated[item.IdItem].cantidadVendida += item.cantidadVendida;
    });
  });
  return Object.values(aggregated).sort((a, b) => b.cantidadVendida - a.cantidadVendida);
});

const processedPaquetesGrouped = computed(() => {
  if (!productos.value || !productos.value.paquetesVendidos) return [];
  return productos.value.paquetesVendidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const processedPromocionesGrouped = computed(() => {
  if (!productos.value || !productos.value.promocionesVendidas) return [];
  return productos.value.promocionesVendidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});


const ventasFiltradas = ref([]);
const indicadores = ref({ totalVentas: 0, productosVendidos: 0, clientes: 0, ventasAnuladas: 0, gananciaNeta: 0 });
const sucursales = ref([]);
const usuarioVendedor = ref([]);
const metodo = ref([]);
const ventas = ref([]);
const productos = ref([]);
const pedidos = ref([]);
const insumos = ref([]);

const cargarSucursales = async () => { try { sucursales.value = await listarSucursales(); } catch (error) { console.error('Error al cargar sucursales:', error); } };
const cargarventas = async () => { try { ventas.value = await ReporteVenta(filtros.value.tienda, filtros.value.desde, filtros.value.hasta, filtros.value.metodoPago, filtros.value.vendedor); } catch (error) { console.error('Error al cargar ventas:', error); } };
const cargarproductos = async () => { try { productos.value = await ReporteProducto(filtros.value.desde, filtros.value.hasta, filtros.value.tienda, filtros.value.subcategorias);} catch (error) { console.error('Error al cargar productos:', error); } };
// esta es la nueva lista de productos
//{
//     "productosVendidos": [
//         {
//             "fecha": "2025-10-17",
//             "productos": [
//                 {
//                     "IdItem": "08132025PROD-2",
//                     "NombreItem": "Media Luna",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1755185420636.jpeg",
//                     "cantidadVendida": 15
//                 }
//             ]
//         },
//         {
//             "fecha": "2025-10-12",
//             "productos": [
//                 {
//                     "IdItem": "08132025PROD-2",
//                     "NombreItem": "Media Luna",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1755185420636.jpeg",
//                     "cantidadVendida": 12
//                 },
//                 {
//                     "IdItem": "08132025PROD-1",
//                     "NombreItem": "Cunape",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1761164610004.jpg",
//                     "cantidadVendida": 24
//                 }
//             ]
//         },
//         {
//             "fecha": "2025-09-24",
//             "productos": [
//                 {
//                     "IdItem": "08132025PROD-2",
//                     "NombreItem": "Media Luna",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1755185420636.jpeg",
//                     "cantidadVendida": 3
//                 },
//                 {
//                     "IdItem": "08132025PROD-1",
//                     "NombreItem": "Cunape",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1761164610004.jpg",
//                     "cantidadVendida": 22
//                 }
//             ]
//         },
//         {
//             "fecha": "2025-10-31",
//             "productos": [
//                 {
//                     "IdItem": "08132025PROD-1",
//                     "NombreItem": "Cunape",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1761164610004.jpg",
//                     "cantidadVendida": 24
//                 }
//             ]
//         },
//         {
//             "fecha": "2025-09-27",
//             "productos": [
//                 {
//                     "IdItem": "08132025PROD-1",
//                     "NombreItem": "Cunape",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1761164610004.jpg",
//                     "cantidadVendida": 5
//                 }
//             ]
//         },
//         {
//             "fecha": "2025-09-20",
//             "productos": [
//                 {
//                     "IdItem": "08132025PROD-1",
//                     "NombreItem": "Cunape",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1761164610004.jpg",
//                     "cantidadVendida": 10
//                 }
//             ]
//         },
//         {
//             "fecha": "2025-09-22",
//             "productos": [
//                 {
//                     "IdItem": "08132025PROD-1",
//                     "NombreItem": "Cunape",
//                     "Subcategoria": "Pan especial",
//                     "Categoria": "Pan",
//                     "UrlImagen": "http://localhost:3000/uploads/1761164610004.jpg",
//                     "cantidadVendida": 24
//                 }
//             ]
//         }
//     ],
//     "paquetesVendidos": [
//         {
//             "fecha": "2025-09-24",
//             "paquetes": [
//                 {
//                     "IdPaquete": "08172025PQ-1",
//                     "Nombre": "Bolsa de Cunape",
//                     "UrlImagen": "http://localhost:3000/uploads/1761164733008.jpg",
//                     "cantidadVendida": 2,
//                     "Contenido": [
//                         {
//                             "IdProducto": "08132025PROD-1",
//                             "Nombre": "Cunape",
//                             "Cantidad": 5
//                         }
//                     ]
//                 }
//             ]
//         }
//     ],
//     "promocionesVendidas": [
//         {
//             "fecha": "2025-10-31",
//             "promociones": [
//                 {
//                     "IdPromocion": "08312025PROM-1",
//                     "Nombre": "Al 2x1 bolsa de cunape",
//                     "tipoPromocion": "2x1 o 3x2",
//                     "UrlImagen": null,
//                     "cantidadVendida": 2,
//                     "Contenido": [
//                         {
//                             "Tipo": "Paquete",
//                             "Id": "08172025PQ-1",
//                             "Nombre": "Bolsa de Cunape",
//                             "Cantidad": 2,
//                             "Contenido": [
//                                 {
//                                     "IdProducto": "08132025PROD-1",
//                                     "Nombre": "Cunape",
//                                     "Cantidad": 5
//                                 }
//                             ]
//                         }
//                     ]
//                 }
//             ]
//         },
//         {
//             "fecha": "2025-09-22",
//             "promociones": [
//                 {
//                     "IdPromocion": "08132025PROM-1",
//                     "Nombre": "Docena de Cunape",
//                     "tipoPromocion": "Descuento por porcentaje",
//                     "UrlImagen": "http://localhost:3000/uploads/1757740053954.jpg",
//                     "cantidadVendida": 2,
//                     "Contenido": [
//                         {
//                             "Tipo": "Producto",
//                             "Id": "08132025PROD-1",
//                             "Nombre": "Cunape",
//                             "Cantidad": 12
//                         }
//                     ]
//                 }
//             ]
//         }
//     ],
//     "productosDisponibles": [
//         {
//             "IdProducto": "08132025PROD-1",
//             "NombreProducto": "Cunape",
//             "UrlImagen": "http://localhost:3000/uploads/1761164610004.jpg",
//             "StockTotal": "57"
//         },
//         {
//             "IdProducto": "08132025PROD-2",
//             "NombreProducto": "Media Luna",
//             "UrlImagen": "http://localhost:3000/uploads/1755185420636.jpeg",
//             "StockTotal": "17"
//         }
//     ],
//     "consumoInsumos": []
// }
const cargarpedidos = async () => { try { pedidos.value = await ReportePedido(filtros.value.desde, filtros.value.hasta, filtros.value.tienda, filtros.value.IdEstado, filtros.value.IdEstadoVenta, filtros.value.metodoPago, filtros.value.TipoCliente, filtroCategoria.value, filtros.value.subcategorias); } catch (error) { console.error('Error al cargar pedidos:', error); } };
const cargarinsumo = async () => { try { insumos.value = await ReporteInsumo(filtros.value.desde, filtros.value.hasta, filtros.value.tienda);} catch (error) { console.error('Error al cargar insumos:', error); } };
const cargarUsuarios = async () => { try { usuarioVendedor.value = await usuariosSinSucursal(); } catch (error) { console.error('Error al cargar usuarios:', error); } };
const cargarMetodo = async () => { try { metodo.value = await listarMetodo(); } catch (error) { console.error('Error al cargar metodos de pago:', error); } };
const ListarCategoriasPrincipales = async () => { try { categorias.value = await listarCategorias(); } catch (error) { console.error('Error al cargar categorias:', error); } };
const ObtenerSubCategoriasParaFiltro = async (idCategoria) => { try { subcategoriasParaFiltro.value = await ObtenerSubCategorias(idCategoria); } catch (error) { console.error('Error al cargar subcategorias:', error); } };

const aplicarFiltroRapido = (rango) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let newDesde = new Date(); let newHasta = new Date();
  const formatDate = (date) => date.toISOString().slice(0, 10);
  switch (rango) {
    case 'today': newDesde = today; newHasta = today; break;
    case 'yesterday': newDesde.setDate(today.getDate() - 1); newHasta.setDate(today.getDate() - 1); break;
    case 'this_week': newDesde.setDate(today.getDate() - today.getDay()); newHasta = today; break;
    case 'this_month': newDesde = new Date(today.getFullYear(), today.getMonth(), 1); newHasta = today; break;
    case 'last_7_days': newDesde.setDate(today.getDate() - 6); newHasta = today; break;
    case 'last_30_days': newDesde.setDate(today.getDate() - 29); newHasta = today; break;
  }
  filtros.value.desde = formatDate(newDesde);
  filtros.value.hasta = formatDate(newHasta);
};

const formatFecha = (fecha) => {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
};

// Resetea filtros no comunes al cambiar de pestaña
watch(activeTab, () => {
    filtros.value.vendedor = "";
    filtros.value.metodoPago = 0;
    filtros.value.TipoCliente = "";
    filtros.value.IdEstado = 0;
    filtros.value.IdEstadoVenta = 0;
    filtroCategoria.value = "";
    // La subcategoría se resetea automáticamente por el watch de filtroCategoria
});

watch(filtros, async () => {
  await generarReporte();
}, { deep: true });

watch(filtroCategoria, async (newVal) => {
  filtros.value.subcategorias = '';
  if (newVal && newVal !== '') await ObtenerSubCategoriasParaFiltro(newVal);
  else subcategoriasParaFiltro.value = [];
});

onMounted(async () => {
  await Promise.all([cargarSucursales(), cargarMetodo(), cargarUsuarios(), ListarCategoriasPrincipales()]);
  await generarReporte();
});

const cargarReportes = async () => {
  // Carga todos los reportes para que los datos estén disponibles en todas las pestañas
  await Promise.all([
    cargarventas(),
    cargarpedidos(),
    cargarproductos(),
    cargarinsumo()
  ]);
};

const generarReporte = async () => {
  await cargarReportes();
  const desde = new Date(filtros.value.desde); const hasta = new Date(filtros.value.hasta);
  if (desde > hasta) { alert("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'."); return; }

  // Actualizar indicadores con los nuevos totales de ventas
  indicadores.value.totalVentas = ventas.value?.granTotalIngresos || 0;
  indicadores.value.productosVendidos = ventas.value?.granTotalProductosVendidos || 0;
  indicadores.value.clientes = ventas.value?.granTotalClientes || 0;
  indicadores.value.ventasAnuladas = ventas.value?.granTotalVentasAnuladas || 0;
  indicadores.value.gananciaNeta = (indicadores.value.totalVentas || 0) - (insumos.value?.totalInversionCompras || 0);
};

const exportarPDF = () => {
  if (activeTab.value === 'ventas') {
    if (!sortedVentas.value || sortedVentas.value.length === 0) {
      alert("No hay datos de ventas para exportar a PDF.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Ventas", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const indicadoresText = `Total Ventas: ${indicadores.value.totalVentas.toFixed(2)} Bs.\nProductos Vendidos: ${indicadores.value.productosVendidos}\nClientes Atendidos: ${indicadores.value.clientes}\nVentas Anuladas: ${indicadores.value.ventasAnuladas}`;
    doc.text(indicadoresText, 14, 32);

    const tableColumn = ["Cliente", "Producto", "Cantidad", "Precio Unitario", "Subtotal", "Estado", "Factura"];
    const tableRows = [];

    sortedVentas.value.forEach(dateGroup => {
      if (dateGroup.ventas.length > 0) {
        tableRows.push([{
          content: `Fecha: ${formatFecha(dateGroup.fecha)} - Total del Día: ${dateGroup.totalIngreso.toFixed(2)} Bs.`,
          colSpan: 7,
          styles: {
            halign: 'center',
            fillColor: [220, 220, 220]
          }
        }]);
        dateGroup.ventas.forEach(venta => {
          const ventaData = [
            venta.isFirstInSale ? venta.cliente : '',
            venta.producto,
            venta.cantidad,
            `${venta.precio} Bs.`,
            `${venta.subtotal} Bs.`,
            venta.estado,
            venta.hasFactura ? 'Sí' : 'No'
          ];
          tableRows.push(ventaData);
        });
      }
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60
    });
    doc.save(`reporte_ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'pedidos') {
    if (!processedPedidosGrouped.value || processedPedidosGrouped.value.length === 0) {
      alert("No hay datos de pedidos para exportar a PDF.");
      return;
    }
    const doc = new jsPDF('l'); // 'l' for landscape
    doc.setFontSize(18);
    doc.text("Reporte de Pedidos", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    const tableColumn = ["Cliente", "Estado Pedido", "Estado Venta", "Origen", "Producto", "Cantidad", "Precio Unitario", "Subtotal", "Total Pagado"];
    const tableRows = [];

    processedPedidosGrouped.value.forEach(dateGroup => {
      if (dateGroup.pedidos.length > 0) {
        tableRows.push([{
          content: `Fecha: ${formatFecha(dateGroup.fecha)} - Total Pedidos: ${dateGroup.totalPedidos}`,
          colSpan: 9,
          styles: {
            halign: 'center',
            fillColor: [220, 220, 220]
          }
        }]);
        dateGroup.pedidos.forEach(pedido => {
          const pedidoData = [
            pedido.isFirstInPedido ? pedido.cliente : '',
            pedido.isFirstInPedido ? pedido.estadoPedido : '',
            pedido.isFirstInPedido ? pedido.estadoVenta : '',
            pedido.isFirstInPedido ? pedido.origen : '',
            pedido.productoNombre,
            pedido.productoCantidad,
            `${pedido.productoPrecio} Bs.`,
            `${pedido.subtotal} Bs.`,
            pedido.isFirstInPedido ? `${pedido.total.toFixed(2)} Bs.` : ''
          ];
          tableRows.push(pedidoData);
        });
      }
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30
    });
    doc.save(`reporte_pedidos_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'productos') {
    const doc = new jsPDF('p');
    doc.setFontSize(18);
    doc.text("Reporte de Productos", 14, 22);
    let startY = 30;

    // Productos Vendidos
    if (processedProductosGrouped.value.length > 0) {
      doc.setFontSize(14);
      doc.text("Productos Vendidos", 14, startY);
      startY += 8;
      const tableColumn = ["Tipo", "Nombre", "Detalle", "Cantidad Vendida"];
      const tableRows = [];
      processedProductosGrouped.value.forEach(dateGroup => {
        tableRows.push([{ content: `Fecha: ${formatFecha(dateGroup.fecha)}`, colSpan: 4, styles: { halign: 'center', fillColor: [220, 220, 220] } }]);
        dateGroup.items.forEach(item => {
          tableRows.push([item.tipo, item.nombre, item.subcategoria, item.cantidad]);
        });
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: startY });
      startY = doc.lastAutoTable.finalY + 10;
    }

    // Productos Más Vendidos
    if (mostSoldProducts.value.length > 0) {
      doc.setFontSize(14);
      doc.text("Productos Más Vendidos", 14, startY);
      startY += 8;
      const tableColumn = ["Nombre", "Cantidad Vendida"];
      const tableRows = mostSoldProducts.value.map(p => [p.NombreItem, p.cantidadVendida]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: startY });
      startY = doc.lastAutoTable.finalY + 10;
    }

    // Paquetes Vendidos
    if (processedPaquetesGrouped.value.length > 0) {
      doc.setFontSize(14);
      doc.text("Paquetes Vendidos", 14, startY);
      startY += 8;
      const tableColumn = ["Nombre", "Cantidad Vendida", "Contenido"];
      const tableRows = [];
      processedPaquetesGrouped.value.forEach(dateGroup => {
        tableRows.push([{ content: `Fecha: ${formatFecha(dateGroup.fecha)}`, colSpan: 3, styles: { halign: 'center', fillColor: [220, 220, 220] } }]);
        dateGroup.paquetes.forEach(item => {
          const contenido = item.Contenido.map(c => `(x${c.Cantidad}) ${c.Nombre}`).join('\n');
          tableRows.push([item.Nombre, item.cantidadVendida, contenido]);
        });
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: startY });
      startY = doc.lastAutoTable.finalY + 10;
    }

    // Promociones Vendidas
    if (processedPromocionesGrouped.value.length > 0) {
      doc.setFontSize(14);
      doc.text("Promociones Vendidas", 14, startY);
      startY += 8;
      const tableColumn = ["Nombre", "Cantidad Vendida", "Contenido"];
      const tableRows = [];
      processedPromocionesGrouped.value.forEach(dateGroup => {
        tableRows.push([{ content: `Fecha: ${formatFecha(dateGroup.fecha)}`, colSpan: 3, styles: { halign: 'center', fillColor: [220, 220, 220] } }]);
        dateGroup.promociones.forEach(item => {
          const contenido = item.Contenido.map(c => `(x${c.Cantidad}) ${c.Nombre}`).join('\n');
          tableRows.push([item.Nombre, item.cantidadVendida, contenido]);
        });
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: startY });
    }

    doc.save(`reporte_productos_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (activeTab.value === 'insumos') {
    const doc = new jsPDF('l');
    doc.setFontSize(18);
    doc.text("Reporte de Insumos", 14, 22);
    let startY = 30;

    // Compras de Insumos
    if (comprasPorFecha.value.length > 0) {
      doc.setFontSize(14);
      doc.text("Detalle de Compras de Insumos", 14, startY);
      startY += 8;
      const tableColumn = ["Proveedor", "Insumo", "Cantidad Comprada", "Precio", "Subtotal"];
      const tableRows = [];
      comprasPorFecha.value.forEach(data => {
        tableRows.push([{ content: `Fecha: ${formatFecha(data.fecha)}`, colSpan: 5, styles: { halign: 'center', fillColor: [220, 220, 220] } }]);
        data.rows.forEach(row => {
          const rowData = [
            row.proveedorRowspan > 0 ? row.proveedor : '',
            row.detalle.NombreProducto,
            `${row.detalle.CantidadComprada} ${row.detalle.UnidadMedida}`,
            row.detalle.Precio,
            row.detalle.Subtotal.toFixed(2)
          ];
          tableRows.push(rowData);
        });
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: startY });
      startY = doc.lastAutoTable.finalY + 10;
    }

    // Recetas de Productos
    if (reporteProductosProcesado.value.length > 0) {
      doc.setFontSize(14);
      doc.text("Recetas de Productos", 14, startY);
      startY += 8;
      const tableColumn = ["Producto", "Ingrediente", "Cantidad"];
      const tableRows = [];
      reporteProductosProcesado.value.forEach(producto => {
        if (producto.Ingredientes.length > 0) {
          producto.Ingredientes.forEach((ingrediente, index) => {
            if (index === 0) {
              tableRows.push([producto.Nombre, ingrediente.Nombre, `${ingrediente.Cantidad} ${ingrediente.Unidad}`]);
            } else {
              tableRows.push(['', ingrediente.Nombre, `${ingrediente.Cantidad} ${ingrediente.Unidad}`]);
            }
          });
        } else {
          tableRows.push([producto.Nombre, 'Sin ingredientes', '']);
        }
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: startY });
      startY = doc.lastAutoTable.finalY + 10;
    }

      // Producción y Consumo
      if (unifiedProductionReport.value.length > 0) {
        doc.setFontSize(14);
        doc.text("Reporte de Producción y Consumo", 14, startY);
        startY += 8;
        const tableColumn = ["Producto", "Para Tiendas", "Para Clientes", "Total Producido", "Ingredientes Utilizados"];
        const tableRows = [];
        unifiedProductionReport.value.forEach(item => {
          if (item.type === 'date_header') {
            tableRows.push([{ content: `Fecha: ${formatFecha(item.fecha)}`, colSpan: 5, styles: { halign: 'center', fillColor: [220, 220, 220] } }]);
          } else if (item.type === 'product_production') {
            const ingredientes = item.ingredientesUsados.map(i => `${i.nombre}: ${i.cantidad} ${i.abreviatura}`).join('\n');
            tableRows.push([item.nombre, item.tiendas, item.clientes, item.totalproducido, ingredientes]);
          } else if (item.type === 'ingredient_summary_table') {
            tableRows.push([{ content: `-- Resumen del Día --`, colSpan: 5, styles: { halign: 'center', fillColor: [230, 230, 230] } }]);
            item.resumenInsumos.forEach(insumo => {
              tableRows.push([{ content: `${insumo.nombre}: ${insumo.cantidadTotal.toFixed(2)} ${insumo.abreviatura}`, colSpan: 5, styles: { halign: 'left' } }]);
            });
          }
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: startY });
        startY = doc.lastAutoTable.finalY + 10;
      }
    
    // Resumen de Stock
    if (insumos.value && insumos.value.reporteInsumos && insumos.value.reporteInsumos.length > 0) {
        doc.setFontSize(14);
        doc.text("Resumen de Stock de Insumos", 14, startY);
        startY += 8;
        const tableColumn = ["Insumo", "Cantidad Comprada", "Stock Restante"];
        const tableRows = insumos.value.reporteInsumos.map(insumo => [
            insumo.Nombre,
            `${insumo.CompradoOriginalUnit ? insumo.CompradoOriginalUnit.toFixed(2) : '0.00'} ${insumo.UnidadOriginalNombre}`,
            `${insumo.StockOriginalUnit ? insumo.StockOriginalUnit.toFixed(2) : '0.00'} ${insumo.UnidadOriginalNombre}`
        ]);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: startY });
    }

    doc.save(`reporte_insumos_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
};

const exportarExcel = () => {
  if (activeTab.value === 'ventas') {
    if (!sortedVentas.value || sortedVentas.value.length === 0) {
      alert("No hay datos de ventas para exportar a Excel.");
      return;
    }

    const ws = {};
    const merges = [];
    let rowIndex = 0;

    // Header
    const header = ["Cliente", "Producto", "Cantidad", "Precio Unitario (Bs.)", "Subtotal (Bs.)", "Estado", "Factura"];
    header.forEach((h, c) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
      ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
    });
    rowIndex++;

    // Data
    sortedVentas.value.forEach(dateGroup => {
      if (dateGroup.ventas.length > 0) {
        // Date Header
        const dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[dateHeaderCellRef] = {
          t: 's',
          v: `Fecha: ${formatFecha(dateGroup.fecha)} - Total del Día: ${dateGroup.totalIngreso.toFixed(2)} Bs.`,
          s: {
            fill: { patternType: "solid", fgColor: { rgb: "FFFFFF00" } }, // Yellow
            font: { bold: true },
            alignment: { horizontal: "center" }
          }
        };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        // Sales data
        dateGroup.ventas.forEach(venta => {
          const row = [
            venta.cliente,
            venta.producto,
            venta.cantidad,
            parseFloat(venta.precio),
            parseFloat(venta.subtotal),
            venta.estado,
            venta.hasFactura ? 'Sí' : 'No'
          ];
          
          if (venta.isFirstInSale && venta.clientRowspan > 1) {
            merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex + venta.clientRowspan - 1, c: 0 } });
          }

          row.forEach((val, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            const cell = { v: val };
            if (typeof val === 'number') {
              cell.t = 'n';
            } else {
              cell.t = 's';
            }
            ws[cellRef] = cell;
          });
          rowIndex++;
        });
      }
    });

    // Set range
    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex - 1, c: header.length - 1 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!merges'] = merges;

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Ventas");
    XLSX.writeFile(workbook, `reporte_ventas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'pedidos') {
    if (!processedPedidosGrouped.value || processedPedidosGrouped.value.length === 0) {
      alert("No hay datos de pedidos para exportar a Excel.");
      return;
    }

    const ws = {};
    const merges = [];
    let rowIndex = 0;

    // Header
    const header = ["Cliente", "Estado Pedido", "Estado Venta", "Origen", "Producto", "Cantidad", "Precio Unitario (Bs.)", "Subtotal (Bs.)", "Total Pagado (Bs.)"];
    header.forEach((h, c) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
      ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
    });
    rowIndex++;

    // Data
    processedPedidosGrouped.value.forEach(dateGroup => {
      if (dateGroup.pedidos.length > 0) {
        // Date Header
        const dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[dateHeaderCellRef] = {
          t: 's',
          v: `Fecha: ${formatFecha(dateGroup.fecha)} - Total Pedidos: ${dateGroup.totalPedidos}`,
          s: {
            fill: { patternType: "solid", fgColor: { rgb: "FFFFFF00" } }, // Yellow
            font: { bold: true },
            alignment: { horizontal: "center" }
          }
        };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        // Orders data
        dateGroup.pedidos.forEach(pedido => {
          const row = [
            pedido.cliente,
            pedido.estadoPedido,
            pedido.estadoVenta,
            pedido.origen,
            pedido.productoNombre,
            pedido.productoCantidad,
            parseFloat(pedido.productoPrecio),
            parseFloat(pedido.subtotal),
            pedido.total
          ];

          if (pedido.isFirstInPedido && pedido.pedidoRowspan > 1) {
            const mergeRange = { s: { r: rowIndex, c: 0 }, e: { r: rowIndex + pedido.pedidoRowspan - 1, c: 0 } };
            merges.push(mergeRange);
            const mergeRange2 = { s: { r: rowIndex, c: 1 }, e: { r: rowIndex + pedido.pedidoRowspan - 1, c: 1 } };
            merges.push(mergeRange2);
            const mergeRange3 = { s: { r: rowIndex, c: 2 }, e: { r: rowIndex + pedido.pedidoRowspan - 1, c: 2 } };
            merges.push(mergeRange3);
            const mergeRange4 = { s: { r: rowIndex, c: 3 }, e: { r: rowIndex + pedido.pedidoRowspan - 1, c: 3 } };
            merges.push(mergeRange4);
            const mergeRange5 = { s: { r: rowIndex, c: 8 }, e: { r: rowIndex + pedido.pedidoRowspan - 1, c: 8 } };
            merges.push(mergeRange5);
          }

          row.forEach((val, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            const cell = { v: val };
            if (typeof val === 'number') {
              cell.t = 'n';
            } else {
              cell.t = 's';
            }
            ws[cellRef] = cell;
          });
          rowIndex++;
        });
      }
    });

    // Set range
    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex - 1, c: header.length - 1 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!merges'] = merges;

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 20 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Pedidos");
    XLSX.writeFile(workbook, `reporte_pedidos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else if (activeTab.value === 'productos') {
    const workbook = XLSX.utils.book_new();
    const ws = {};
    const merges = [];
    let rowIndex = 0;

    // Reporte de Productos Vendidos
    if (processedProductosGrouped.value.length > 0) {
        let header = ["Tipo", "Nombre", "Detalle", "Cantidad Vendida"];
        let titleCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[titleCellRef] = { t: 's', v: "Reporte de Productos Vendidos", s: { font: { bold: true } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        header.forEach((h, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
        });
        rowIndex++;

        processedProductosGrouped.value.forEach(dateGroup => {
            let dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
            ws[dateHeaderCellRef] = { t: 's', v: `Fecha: ${formatFecha(dateGroup.fecha)}`, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF00" } } } };
            merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
            rowIndex++;

            dateGroup.items.forEach(item => {
                const row = [item.tipo, item.nombre, item.subcategoria, item.cantidad];
                row.forEach((val, c) => {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                    ws[cellRef] = { t: 's', v: val };
                });
                rowIndex++;
            });
        });
    }

    // Productos Más Vendidos
    if (mostSoldProducts.value.length > 0) {
        rowIndex++; // Spacer
        let header = ["Nombre", "Cantidad Vendida"];
        let titleCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[titleCellRef] = { t: 's', v: "Productos Más Vendidos", s: { font: { bold: true } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        header.forEach((h, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
        });
        rowIndex++;

        mostSoldProducts.value.forEach(p => {
            const row = [p.NombreItem, p.cantidadVendida];
            row.forEach((val, c) => {
                const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                ws[cellRef] = { t: 's', v: val };
            });
            rowIndex++;
        });
    }

    // Paquetes Vendidos
    if (processedPaquetesGrouped.value.length > 0) {
        rowIndex++; // Spacer
        let header = ["Nombre", "Cantidad Vendida", "Contenido"];
        let titleCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[titleCellRef] = { t: 's', v: "Paquetes Vendidos", s: { font: { bold: true } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        header.forEach((h, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
        });
        rowIndex++;

        processedPaquetesGrouped.value.forEach(dateGroup => {
            let dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
            ws[dateHeaderCellRef] = { t: 's', v: `Fecha: ${formatFecha(dateGroup.fecha)}`, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF00" } } } };
            merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
            rowIndex++;

            dateGroup.paquetes.forEach(item => {
                const contenido = item.Contenido.map(c => `(x${c.Cantidad}) ${c.Nombre}`).join('\n');
                const row = [item.Nombre, item.cantidadVendida, contenido];
                row.forEach((val, c) => {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                    ws[cellRef] = { t: 's', v: val };
                });
                rowIndex++;
            });
        });
    }

    // Promociones Vendidas
    if (processedPromocionesGrouped.value.length > 0) {
        rowIndex++; // Spacer
        let header = ["Nombre", "Cantidad Vendida", "Contenido"];
        let titleCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[titleCellRef] = { t: 's', v: "Promociones Vendidas", s: { font: { bold: true } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        header.forEach((h, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
        });
        rowIndex++;

        processedPromocionesGrouped.value.forEach(dateGroup => {
            let dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
            ws[dateHeaderCellRef] = { t: 's', v: `Fecha: ${formatFecha(dateGroup.fecha)}`, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF00" } } } };
            merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
            rowIndex++;

            dateGroup.promociones.forEach(item => {
                const contenido = item.Contenido.map(c => `(x${c.Cantidad}) ${c.Nombre}`).join('\n');
                const row = [item.Nombre, item.cantidadVendida, contenido];
                row.forEach((val, c) => {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                    ws[cellRef] = { t: 's', v: val };
                });
                rowIndex++;
            });
        });
    }

    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex, c: 4 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!merges'] = merges;
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, ws, "Reporte de Productos");
    XLSX.writeFile(workbook, `reporte_productos_${new Date().toISOString().slice(0, 10)}.xlsx`);

  } else if (activeTab.value === 'insumos') {
    const workbook = XLSX.utils.book_new();
    const ws = {};
    const merges = [];
    let rowIndex = 0;

    // Compras de Insumos
    if (comprasPorFecha.value.length > 0) {
        let header = ["Proveedor", "Insumo", "Cantidad Comprada", "Precio", "Subtotal"];
        let titleCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[titleCellRef] = { t: 's', v: "Detalle de Compras de Insumos", s: { font: { bold: true } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        header.forEach((h, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
        });
        rowIndex++;

        comprasPorFecha.value.forEach(d => {
            let dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
            ws[dateHeaderCellRef] = { t: 's', v: `Fecha: ${formatFecha(d.fecha)}`, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF00" } } } };
            merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
            rowIndex++;

            d.rows.forEach(row => {
                if (row.proveedorRowspan > 1) {
                    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex + row.proveedorRowspan - 1, c: 0 } });
                }
                const data = [row.proveedor, row.detalle.NombreProducto, `${row.detalle.CantidadComprada} ${row.detalle.UnidadMedida}`, row.detalle.Precio, row.detalle.Subtotal.toFixed(2)];
                data.forEach((val, c) => {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                    ws[cellRef] = { t: 's', v: val };
                });
                rowIndex++;
            });
        });
    }

    // Recetas de Productos
    if (reporteProductosProcesado.value.length > 0) {
        rowIndex++; // Spacer
        let header = ["Producto", "Ingrediente", "Cantidad"];
        let titleCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[titleCellRef] = { t: 's', v: "Recetas de Productos", s: { font: { bold: true } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        header.forEach((h, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
        });
        rowIndex++;

        reporteProductosProcesado.value.forEach(producto => {
            if (producto.Ingredientes.length > 0) {
                producto.Ingredientes.forEach((ingrediente, index) => {
                    const row = [index === 0 ? producto.Nombre : '', ingrediente.Nombre, `${ingrediente.Cantidad} ${ingrediente.Unidad}`];
                    row.forEach((val, c) => {
                        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                        ws[cellRef] = { t: 's', v: val };
                    });
                    rowIndex++;
                });
            } else {
                const row = [producto.Nombre, 'Sin ingredientes', ''];
                row.forEach((val, c) => {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                    ws[cellRef] = { t: 's', v: val };
                });
                rowIndex++;
            }
        });
    }

    // Reporte de Producción y Consumo
    if (unifiedProductionReport.value.length > 0) {
        rowIndex++; // Spacer
        let header = ["Producto", "Para Tiendas", "Para Clientes", "Total Producido", "Ingredientes Utilizados"];
        let titleCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[titleCellRef] = { t: 's', v: "Reporte de Producción y Consumo", s: { font: { bold: true } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        header.forEach((h, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
        });
        rowIndex++;

        unifiedProductionReport.value.forEach(item => {
            if (item.type === 'date_header') {
                let dateHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
                ws[dateHeaderCellRef] = { t: 's', v: `Fecha: ${formatFecha(item.fecha)}`, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF00" } } } };
                merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
                rowIndex++;
            } else if (item.type === 'product_production') {
                const ingredientes = item.ingredientesUsados.map(i => `${i.nombre}: ${i.cantidad} ${i.abreviatura}`).join('\n');
                const row = [item.nombre, item.tiendas, item.clientes, item.totalproducido, ingredientes];
                row.forEach((val, c) => {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                    ws[cellRef] = { t: 's', v: val };
                });
                rowIndex++;
            } else if (item.type === 'ingredient_summary_table') {
                let summaryHeaderCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
                ws[summaryHeaderCellRef] = { t: 's', v: `-- Resumen del Día --`, s: { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "FFDDDDDD" } } } };
                merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
                rowIndex++;

                item.resumenInsumos.forEach(insumo => {
                    const row = [`${insumo.nombre}: ${insumo.cantidadTotal.toFixed(2)} ${insumo.abreviatura}`];
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
                    ws[cellRef] = { t: 's', v: row[0] };
                    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
                    rowIndex++;
                });
            }
        });
    }

    // Resumen de Stock de Insumos
    if (insumos.value && insumos.value.reporteInsumos && insumos.value.reporteInsumos.length > 0) {
        rowIndex++; // Spacer
        let header = ["Insumo", "Cantidad Comprada", "Stock Restante"];
        let titleCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        ws[titleCellRef] = { t: 's', v: "Resumen de Stock de Insumos (en Unidades de Compra)", s: { font: { bold: true } } };
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: header.length - 1 } });
        rowIndex++;

        header.forEach((h, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
            ws[cellRef] = { t: 's', v: h, s: { font: { bold: true } } };
        });
        rowIndex++;

        insumos.value.reporteInsumos.forEach(insumo => {
            const row = [
                insumo.Nombre,
                `${insumo.CompradoOriginalUnit ? insumo.CompradoOriginalUnit.toFixed(2) : '0.00'} ${insumo.UnidadOriginalNombre}`,
                `${insumo.StockOriginalUnit ? insumo.StockOriginalUnit.toFixed(2) : '0.00'} ${insumo.UnidadOriginalNombre}`
            ];
            row.forEach((val, c) => {
                const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
                ws[cellRef] = { t: 's', v: val };
            });
            rowIndex++;
        });
    }

    const range = { s: { r: 0, c: 0 }, e: { r: rowIndex, c: 4 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!merges'] = merges;
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(workbook, ws, "Reporte de Insumos");
    XLSX.writeFile(workbook, `reporte_insumos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};

</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;   
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out forwards;
}

.cursor-pointer { cursor: pointer; }
</style>
