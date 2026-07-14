<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
      <div class="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
        <DollarSign class="h-6 w-6 text-white"/>
      </div>
      <div>
        <p class="text-gray-500">
          {{ activeTab === 'compras' ? 'Inversión Total' : activeTab === 'produccion' ? 'Costo Producción' : activeTab === 'financiero' ? 'Ingresos Totales' : 'Total Ventas' }}
        </p>
        <h2 class="text-2xl font-bold text-green-600">{{ indicadores.totalVentas.toFixed(2) }} Bs.</h2>
      </div>
    </div>
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
      <div class="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
        <Package class="h-6 w-6 text-white"/>
      </div>
      <div>
        <p class="text-gray-500">
          {{ activeTab === 'compras' ? 'Insumos Comprados' : activeTab === 'produccion' ? 'Unidades Producidas' : activeTab === 'financiero' ? 'Registros' : 'Productos Vendidos' }}
        </p>
        <h2 class="text-2xl font-bold">{{ indicadores.productosVendidos }}</h2>
      </div>
    </div>
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
      <div class="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg">
        <Users class="h-6 w-6 text-white"/>
      </div>
      <div>
        <p class="text-gray-500">
          {{ activeTab === 'compras' ? 'Proveedores' : activeTab === 'produccion' ? 'Insumos Utilizados' : activeTab === 'financiero' ? 'Sucursales' : 'Clientes Atendidos' }}
        </p>
        <h2 class="text-2xl font-bold">{{ indicadores.clientes }}</h2>
      </div>
    </div>
    <div v-if="activeTab !== 'compras'" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
      <div class="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg">
        <XCircle class="h-6 w-6 text-white"/>
      </div>
      <div>
        <p class="text-gray-500">
          {{ activeTab === 'produccion' ? 'Sesiones Producción' : activeTab === 'financiero' ? 'Días con Registros' : 'Ventas Anuladas' }}
        </p>
        <h2 class="text-2xl font-bold text-red-600">{{ indicadores.ventasAnuladas }}</h2>
      </div>
    </div>
    <div v-else class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
      <div class="p-3 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-2xl shadow-lg">
        <History class="h-6 w-6 text-white"/>
      </div>
      <div>
        <p class="text-gray-500">Registros Compra</p>
        <h2 class="text-2xl font-bold text-indigo-600">{{ indicadores.ventasAnuladas || 0 }}</h2>
      </div>
    </div>
    <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
      <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
        <DollarSign class="h-6 w-6 text-white"/>
      </div>
      <div>
        <p class="text-gray-500">
          {{ activeTab === 'compras' ? 'Balance Periodo' : activeTab === 'produccion' ? 'Balance Producción' : activeTab === 'financiero' ? 'Utilidad Final' : 'Ganancia Neta' }}
        </p>
        <h2 class="text-2xl font-bold text-purple-600">{{ indicadores.gananciaNeta.toFixed(2) }} Bs.</h2>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div v-if="indicadores.topCliente" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
      <div class="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
        <Crown class="h-6 w-6 text-white"/>
      </div>
      <div>
        <p class="text-gray-500">
          {{ activeTab === 'compras' ? 'Proveedor Mayor Facturación' : activeTab === 'produccion' ? 'Producto Líder Producción' : activeTab === 'financiero' ? 'Sucursal con más Utilidad' : 'Cliente con más compras' }}
        </p>
        <h2 class="text-xl font-bold text-gray-800">{{ indicadores.topCliente.nombre }}</h2>
        <p class="text-sm font-semibold text-orange-600">{{ parseFloat(indicadores.topCliente.total).toFixed(2) }} {{ activeTab === 'produccion' ? 'unidades' : 'Bs. total' }}</p>
      </div>
    </div>
    <div v-if="indicadores.topVendedor" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex items-center gap-4">
      <div class="p-3 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl shadow-lg">
        <Trophy class="h-6 w-6 text-white"/>
      </div>
      <div>
        <p class="text-gray-500">Vendedor con más ventas</p>
        <h2 class="text-xl font-bold text-gray-800">{{ indicadores.topVendedor.nombre }}</h2>
        <p class="text-sm font-semibold text-indigo-600">{{ parseFloat(indicadores.topVendedor.total).toFixed(2) }} Bs. total</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DollarSign, Package, Users, XCircle, Crown, Trophy, History } from 'lucide-vue-next'

defineProps({
  indicadores: {
    type: Object,
    required: true
  },
  activeTab: {
    type: String,
    default: 'ventas'
  }
})
</script>
