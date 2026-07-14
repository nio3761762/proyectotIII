<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mt-6 animate-fade-in-up delay-100">
    <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold mb-4">
      <Filter class="h-5 w-5 text-orange-600" />
      Filtros
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Filtros Comunes -->
      <template v-if="activeTab !== 'inventario'">
        <input type="date" v-model="filtros.desde" :max="filtros.hasta" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none" />
        <input type="date" v-model="filtros.hasta" :min="filtros.desde" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none" />
      </template>
      <select v-if="activeTab !== 'compras' && activeTab !== 'transferencias' && activeTab !== 'comision'" v-model="filtros.tienda" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
        <option value="">Todas las tiendas</option>
        <option v-for="sucursal in sucursales" :key="sucursal.idsucursal" :value="sucursal.idsucursal">{{ sucursal.nombre }}</option>
      </select>

      <!-- Filtro de Producto para Producción -->
      <template v-if="activeTab === 'produccion'">
        <select v-model="filtros.iditem" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los productos</option>
          <option v-for="prod in productos" :key="prod.idproducto" :value="prod.idproducto">{{ prod.nombre }}</option>
        </select>
      </template>

      <!-- Filtros Contextuales -->
      <template v-if="activeTab === 'ventas'">
        <select v-model="filtros.estado" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los estados</option>
          <option value="1">Pagado</option>
          <option value="0">Anulado</option>
        </select>
        <select v-model="filtros.vendedor" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los vendedores</option>
          <option v-for="user in usuarioVendedor" :key="user.idusuario" :value="user.idusuario">{{ user.nombre + ' ' + (user.apellidopaterno || '') }}</option>
        </select>
        <select v-model="filtros.cliente" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los clientes</option>
          <option v-for="cliente in clientes" :key="cliente.idpersona" :value="cliente.idpersona">{{ cliente.nombre + ' ' + (cliente.apellidopaterno || '') }}</option>
        </select>
        <select v-model="filtros.metodoPago" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="0">Todos los métodos</option>
          <option v-for="met in metodo" :key="met.IdMetodoPago" :value="met.IdMetodoPago">{{ met.Nombre }}</option>
        </select>
      </template>

      <template v-if="activeTab === 'pedidos'">
        <select v-model="filtros.IdEstado" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="0">Todos los Estados</option>
          <option value="1">Pendiente</option>
          <option value="2">Enviado</option>
          <option value="3">Finalizado</option>
          <option value="0">Anulado</option>
        </select>
        <select v-model="filtros.idtipopedido" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="0">Tipo de Pedido</option>
          <option v-for="tipo in tiposPedido" :key="tipo.idtipopedido" :value="tipo.idtipopedido">{{ tipo.nombre }}</option>
        </select>
        <select v-model="filtros.cliente" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los clientes</option>
          <option v-for="cliente in clientes" :key="cliente.idpersona" :value="cliente.idpersona">{{ cliente.nombre + ' ' + (cliente.apellidopaterno || '') }}</option>
        </select>
      </template>

      <template v-if="activeTab === 'transferencias'">
        <select v-model="filtros.idsucursalorigen" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Sucursal Origen: Todas</option>
          <option v-for="sucursal in sucursales" :key="sucursal.idsucursal" :value="sucursal.idsucursal">{{ sucursal.nombre }}</option>
        </select>
        <select v-model="filtros.idsucursaldestino" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Sucursal Destino: Todas</option>
          <option v-for="sucursal in sucursales" :key="sucursal.idsucursal" :value="sucursal.idsucursal">{{ sucursal.nombre }}</option>
        </select>
        <select v-model="filtros.idempleado" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Empleado: Todos</option>
          <option v-for="emp in empleados" :key="emp.idempleado" :value="emp.idempleado">{{ emp.nombre + ' ' + (emp.apellidopaterno || '') }}</option>
        </select>
      </template>

      <template v-if="activeTab === 'comision'">
        <select v-model="filtros.tienda" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todas las sucursales</option>
          <option v-for="sucursal in sucursales" :key="sucursal.idsucursal" :value="sucursal.idsucursal">{{ sucursal.nombre }}</option>
        </select>
        <select v-model="filtros.idempleado" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los empleados</option>
          <option v-for="emp in empleados" :key="emp.idempleado" :value="emp.idempleado">{{ emp.nombre + ' ' + (emp.apellidopaterno || '') }}</option>
        </select>
      </template>

      <template v-if="activeTab === 'compras'">
        <select v-model="filtros.idproveedor" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los proveedores</option>
          <option v-for="prov in proveedores" :key="prov.idproveedor" :value="prov.idproveedor">{{ prov.nombre }}</option>
        </select>
        <select v-model="filtros.idinsumo" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los insumos</option>
          <option v-for="ins in insumosLista" :key="ins.idinsumo" :value="ins.idinsumo">{{ ins.nombre }}</option>
        </select>
      </template>

      <template v-if="activeTab === 'inventario' || activeTab === 'kardex'">
        <select v-model="filtros.tipoItem" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todo tipo de Item</option>
          <option value="PRODUCTO">Producto</option>
          <option value="INSUMO">Insumo</option>
        </select>
        <select v-model="filtros.iditem" class="w-full pl-4 pr-4 py-3 border-0 bg-gray-50/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none">
          <option value="">Todos los items</option>
          <template v-if="filtros.tipoItem === 'PRODUCTO'">
            <option v-for="prod in productos" :key="prod.idproducto" :value="prod.idproducto">{{ prod.nombre }}</option>
          </template>
          <template v-else-if="filtros.tipoItem === 'INSUMO'">
            <option v-for="ins in insumosLista" :key="ins.idinsumo" :value="ins.idinsumo">{{ ins.nombre }}</option>
          </template>
          <template v-else>
            <optgroup label="Productos">
              <option v-for="prod in productos" :key="prod.idproducto" :value="prod.idproducto">{{ prod.nombre }}</option>
            </optgroup>
            <optgroup label="Insumos">
              <option v-for="ins in insumosLista" :key="ins.idinsumo" :value="ins.idinsumo">{{ ins.nombre }}</option>
            </optgroup>
          </template>
        </select>
      </template>
    </div>

    <div class="flex flex-wrap items-center justify-between mt-6">
      <div v-if="activeTab !== 'inventario'" class="flex flex-wrap gap-2">
          <button @click="$emit('aplicarFiltroRapido', 'today')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Hoy</button>
          <button @click="$emit('aplicarFiltroRapido', 'yesterday')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Ayer</button>
          <button @click="$emit('aplicarFiltroRapido', 'this_week')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Esta Semana</button>
          <button @click="$emit('aplicarFiltroRapido', 'this_month')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Este Mes</button>
          <button @click="$emit('aplicarFiltroRapido', 'last_7_days')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Últimos 7 Días</button>
          <button @click="$emit('aplicarFiltroRapido', 'last_30_days')" class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Últimos 30 Días</button>
          <button v-if="activeTab !== 'inventario'" 
            @click="$emit('update:agruparPorSemana', !agruparPorSemana)" 
            :class="['px-4 py-2 rounded-xl text-sm font-medium transition-colors border', agruparPorSemana ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50']">
            <Calendar class="h-4 w-4 inline mr-1.5" />
            {{ agruparPorSemana ? 'Vista por Día' : 'Agrupar por Semana' }}
          </button>
      </div>
      <div :class="['flex gap-3', activeTab === 'inventario' ? 'w-full justify-end' : '']">
        <button v-if="false" @click="$emit('exportarExcel')" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
          <Sheet class="h-4 w-4" />
          Excel
        </button>
        <button @click="$emit('exportarPdf')" class="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
          <FileText class="h-4 w-4" />
          PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Filter, Sheet, FileText, Calendar } from 'lucide-vue-next'

const props = defineProps({
  filtros: {
    type: Object,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  },
  agruparPorSemana: {
    type: Boolean,
    default: false
  },
  sucursales: {
    type: Array,
    required: true
  },
  empleados: {
    type: Array,
    default: () => []
  },
  usuarioVendedor: {
    type: Array,
    required: true
  },
  clientes: {
    type: Array,
    required: true
  },
  metodo: {
    type: Array,
    required: true
  },
  tiposPedido: {
    type: Array,
    default: () => []
  },
  categorias: {
    type: Array,
    required: true
  },
  subcategoriasParaFiltro: {
    type: Array,
    required: true
  },
  filtroCategoria: {
    type: [String, Number],
    default: ''
  },
  proveedores: {
    type: Array,
    default: () => []
  },
  insumosLista: {
    type: Array,
    default: () => []
  },
  productos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filtroCategoria', 'update:agruparPorSemana', 'aplicarFiltroRapido', 'exportarExcel', 'exportarPdf'])

const localFiltroCategoria = computed({
  get: () => props.filtroCategoria,
  set: (val) => emit('update:filtroCategoria', val)
})
</script>
