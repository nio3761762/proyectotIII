<template>
  <div class="min-h-screen relative overflow-hidden p-6">
    <!-- Background decorations -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl"></div>

    <!-- VISTA PRINCIPAL DE ENTREGAS -->
    <div>
      <!-- Header  --> 
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
              <Truck class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                Gestión de Entregas
              </h1>   
              <p class="text-gray-600 text-sm">Pedidos listos para ser entregados.</p>
            </div>
          </div>
          <div class="hidden md:flex items-center gap-3">
            <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ totalPedidos }}</div>
                <div class="text-sm text-gray-500">Pedidos</div>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ totalReservas }}</div>
                <div class="text-sm text-gray-500">Reservas</div>
              </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="filtro-fecha" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Fecha de Entrega</label>
            <input 
              type="date" 
              id="filtro-fecha"
              v-model="filtroFecha"
              class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div v-if="!TIeneSucursal">
            <label for="filtro-sucursal" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Tienda</label>
            <select 
              id="filtro-sucursal"
              v-model="filtroSucursal"
              class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="TODOS">Todas las Tiendas</option>
              <option v-for="sucursal in sucursales" :key="sucursal.IdSucursal" :value="sucursal.IdSucursal">{{ sucursal.Nombre }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de Entregas -->
      <div v-if="filteredentregas.length === 0" class="text-center py-12">
        <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Truck class="h-12 w-12 text-orange-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-4">No hay entregas pendientes</h3>
        <p class="text-gray-600">No se encontraron pedidos con estado "Enviado" para los filtros seleccionados.</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        <div v-for="entrega in filteredentregas" :key="entrega.IdEntrega" 
         :class="[
                'bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col',
                entrega.IdEntrega === ubicarEntrega 
                  ? 'border-orange-500 border-2 shadow-2xl ring-4 ring-orange-500/20' 
                  : 'border-white/50'
              ]"
               @click="limpiarubicarEntrega"
    >
        
        <div class="p-6 border-b border-gray-100">
            <div class="flex justify-between items-center">
            <h3 class="font-bold text-gray-800"> {{ entrega.Pedido.NombreTipo }} #{{ entrega.Pedido.IdPedido }}</h3>
            <div class="flex items-center gap-2">
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold shadow-md', getStatusClasses(entrega.NombreEstado)]">
                {{ entrega.NombreEstado }}
              </span>
              <button @click="verReserva(entrega)" class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center" title="Ver Reserva">
                <Eye class="h-4 w-4" />
              </button>
            </div>
          </div>
            <p class="text-sm text-gray-500">Fecha de Solicitud: {{ new Date(entrega.Pedido.FechaRegistro + 'T00:00:00').toLocaleDateString() }} - {{ entrega.Pedido.Hora }}</p>
         <p class="text-sm text-gray-500">Origen: {{ destino[entrega.IdEntrega]?.Distribucion?.Origen? NombreSucursal(destino[entrega.IdEntrega]?.Distribucion?.Origen) :  destino[entrega.IdEntrega]?.Pedido?.Venta?.Sucursal?.Nombre}}</p>
        
            <p class="text-sm text-gray-500">Destino: {{ destino[entrega.IdEntrega]?.Pedido
      ? destino[entrega.IdEntrega]?.Pedido?.Venta?.Persona?.Nombre + ' ' + destino[entrega.IdEntrega]?.Pedido?.Venta?.Persona?.ApellidoPaterno
      : destino[entrega.IdEntrega]?.Distribucion?.Sucursal?.Nombre }}  {{ destino[entrega.IdEntrega]?.Pedido && destino[entrega.IdEntrega]?.Distribucion?.Sucursal?  '- '+destino[entrega.IdEntrega]?.Distribucion?.Sucursal.Nombre:''}}</p>
          </div>
          <div class="p-6 space-y-4 flex-grow">
            <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-2 rounded-lg bg-orange-50">
                    <p class="text-sm font-semibold text-orange-700 mb-1">Fecha Entrega</p>
                    <p class="font-medium text-gray-800">{{ new Date(entrega.FechaEntrega  + 'T00:00:00').toLocaleDateString() }}</p>
                </div>
                <div class="text-center p-2 rounded-lg bg-red-50">
                    <p class="text-sm font-semibold text-red-700 mb-1">Hora Entrega</p>
                    <p class="font-medium text-gray-800">{{ entrega.HoraEntrega }}</p>
                </div>
                <div class="text-center p-2 rounded-lg bg-blue-50">
                    <p class="text-sm font-semibold text-blue-700 mb-1">Costo Envio</p>
                    <p class="font-medium text-gray-800">{{ entrega.Costo  || '0.00' }}</p>
                </div>
            </div>

            <div class="pt-4 border-t border-gray-200">
                <button @click="toggleDireccion(entrega)" class="w-full text-left font-semibold text-orange-700 mb-2 flex justify-between items-center">
                    <span>Dirección de Entrega</span>
                    <ChevronDown class="h-5 w-5 transition-transform" :class="{'rotate-180': expandedEntregaId === entrega.IdEntrega}" />
                </button>
                <div v-if="expandedEntregaId === entrega.IdEntrega" class="space-y-2 text-sm text-gray-600">
                    <p><span class="font-semibold">Dirección:</span> {{ direccion?.Direccion?.Direccion || 'No especificada' }}</p>
                    <p><span class="font-semibold">Barrio:</span> {{ direccion?.Direccion.Barrio?.Nombre || '' }}</p>
                    <p><span class="font-semibold">Referencia:</span> {{ direccion?.Direccion.Referencia || 'No especificada' }}</p>
                    <a  href="https://maps.app.goo.gl/C6HCfdLBsiJzsVk57" target="_blank" class="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold hover:bg-orange-200 transition-colors">
                        <MapPin class="h-4 w-4" />
                        <span>Ver en mapa</span>
                    </a>
                </div>
            </div>
             <div class="pt-4 border-t border-gray-200 flex gap-2">
                <button @click="openDevolucionModal(entrega)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Package class="h-4 w-4" /> <span>Devolución y Pago</span>
                </button>
                <button @click="abrirModalDireccion(entrega)" class="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <MapPin class="h-4 w-4" /> <span>Actualizar Dirección</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>

<!-- Modal Devolucion y Pago -->
<div v-if="showDevolucionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl overflow-hidden">
    <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
           <h2 class="text-xl font-bold">Devolución y Pago </h2>
        </div>
        <button @click="closeDevolucionModal" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div class="p-6 max-h-[70vh] overflow-y-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Columna Izquierda -->
        <div class="space-y-6">
          <!-- Lista de Productos -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package class="h-6 w-6 text-orange-500" />
              Productos para Devolución
            </h3>
            <div class="space-y-2 max-h-60 overflow-y-auto p-1">
              <div v-for="producto in productosDevolucion" :key="producto.id" class="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                <div class="flex-1 flex items-center">
                    <input type="checkbox" v-model="producto.devolucion" :id="'prod-' + producto.id" class="h-5 w-5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer">
                    <div class="ml-3">
                        <p class="font-semibold">{{ producto.nombre }}</p>
                        <p class="text-sm text-gray-500">Cantidad en pedido: {{ producto.cantidad }}</p>
                        <p v-if="producto.precio > 0" class="text-sm text-green-600 font-semibold">Precio: Bs. {{ redondearPrecio(producto.precio) }}</p>
                    </div>
                </div>
                <div v-if="producto.devolucion" class="flex items-center gap-2">
                    <input type="number" v-model.number="producto.cantidadDevolver" min="0" :max="producto.cantidad" @input="validarCantidadDevolver(producto)" class="w-20 h-10 text-center border border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-200" placeholder="Cant.">
                </div>
              </div>
            </div>
          </div>

          <!-- Detalle de Devolución -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
             <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Pencil class="h-6 w-6 text-orange-500" />
                Motivo de la Devolución
            </h3>
            <textarea v-model="detalleDevolucion" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows="4" placeholder="Escribe aquí el motivo de la devolución..."></textarea>
          </div>
        </div>

        <!-- Columna Derecha -->
        <div class="space-y-6">
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calculator class="h-6 w-6 text-orange-500" />
              Pago
            </h3>
            <div class="space-y-4">
              <div v-if="montoAdelanto > 0" class="bg-amber-50 rounded-2xl p-4 flex justify-between items-center">
                <p class="text-lg font-semibold text-amber-800">Adelanto Pagado:</p>
                <p class="text-2xl font-bold text-amber-600">Bs. {{ redondearPrecio(montoAdelanto) }}</p>
              </div>

              <!-- Show Total to Pay if it's positive -->
              <div v-if="calcularPagoFinal() >= 0" class="bg-green-50 rounded-2xl p-4 flex justify-between items-center">
                <p class="text-lg font-semibold text-green-800">Total a Pagar:</p>
                <p class="text-2xl font-bold text-green-600">Bs. {{ redondearPrecio(calcularPagoFinal()) }}</p>
              </div>

              <!-- Show Refund if the total is negative -->
              <div v-else class="bg-red-50 rounded-2xl p-4 flex justify-between items-center">
                <p class="text-lg font-semibold text-red-800">Reembolso al Cliente:</p>
                <p class="text-2xl font-bold text-red-600">Bs. {{ redondearPrecio(Math.abs(calcularPagoFinal())) }}</p>
              </div>
              <div>
                <p class="font-semibold mb-2">Método de Pago</p>
                <div class="flex gap-4" v-for="Pagos in metodo">
                  <label class="flex items-center"><input type="radio" v-model.number="metodoPago" :value="Pagos.IdMetodoPago" class="text-orange-600 focus:ring-orange-500"> <span class="ml-2">{{ Pagos.Nombre }}</span></label>
                </div>
              </div>
              <div v-if="metodoPago === 1 ">
                <input
                  v-model.number="montoRecibido"
                  type="number"
                  placeholder="Monto recibido"
                  class="w-full px-4 py-3 bg-white/60 border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div v-if="metodoPago === 1" class="bg-gray-100 rounded-2xl p-3 flex justify-between items-center">
                <p class="font-semibold text-gray-800">Cambio:</p>
                <p class="text-lg font-bold text-gray-600">Bs. {{ cambio }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-4">
      <button @click="closeDevolucionModal" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Cancelar</button>
      <button @click="procesarPago" :disabled="isProcessingPayment" class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center" :class="{'opacity-50 cursor-not-allowed': isProcessingPayment}">
  <span v-if="!isProcessingPayment">Confirmar y Procesar Pago</span>
  <span v-else class="flex items-center">
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Procesando...
  </span>
</button>
    </div>
  </div>
</div>

    <!-- Modal Actualizar Dirección -->
    <div v-if="showDireccionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden">
        <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Pencil class="h-6 w-6" />
              <h2 class="text-xl font-bold">Actualizar Información de Entrega</h2>
            </div>
            <button @click="cerrarModalDireccion" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>
        <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div v-if="direccionParaEditar" class="space-y-4">
                <div>
                    <p class="font-semibold mb-2 text-sm text-gray-700">Tipo de Entrega</p>
                    <div class="flex flex-wrap gap-4">
                      <label v-for="tipo in tEntrega" :key="tipo.IdTipoEntrega" class="flex items-center">
                        <input type="radio" v-model="direccionParaEditar.IdTipoEntrega" :value="tipo.IdTipoEntrega" class="text-orange-600 focus:ring-orange-500">
                        <span class="ml-2 text-gray-800">{{ tipo.Nombre }}</span>
                      </label>
                    </div>
                </div>

                <div v-if="direccionParaEditar.IdTipoEntrega === 'TPE-E2'" class="space-y-4 pt-4 border-t border-gray-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-semibold text-gray-700 mb-1 block">Fecha de Entrega</label>
                            <input v-model="direccionParaEditar.FechaEntrega" type="date" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-700 mb-1 block">Hora de Entrega</label>
                            <input v-model="direccionParaEditar.HoraEntrega" type="time" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>
                    <div>
                        <label class="text-sm font-semibold text-gray-700 mb-1 block">Dirección</label>
                        <input v-model="direccionParaEditar.Direccion" type="text" placeholder="Ej: Calle Falsa 123" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                        <label class="text-sm font-semibold text-gray-700 mb-1 block">Barrio</label>
                        <select v-model="direccionParaEditar.IdBarrio" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <option value="">Selecciona un barrio</option>
                            <option v-for="barrio in barrios" :key="barrio.IdBarrio" :value="barrio.IdBarrio">{{ barrio.Nombre }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-sm font-semibold text-gray-700 mb-1 block">Referencia</label>
                        <input v-model="direccionParaEditar.Referencia" type="text" placeholder="Ej: Casa con rejas verdes" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                        <label class="text-sm font-semibold text-gray-700 mb-1 block">Ubicación (URL de Google Maps)</label>
                        <input v-model="direccionParaEditar.Ubicacion" type="text" placeholder="https://maps.app.goo.gl/xyz" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                     <div>
                        <label class="text-sm font-semibold text-gray-700 mb-1 block">Costo de Envío</label>
                        <input v-model.number="direccionParaEditar.Costo" type="number" min="0" step="0.50" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                </div>
                <div v-else class="space-y-4 pt-4 border-t border-gray-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-semibold text-gray-700 mb-1 block">Fecha de Recojo</label>
                            <input v-model="direccionParaEditar.FechaEntrega" type="date" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-700 mb-1 block">Hora de Recojo</label>
                            <input v-model="direccionParaEditar.HoraEntrega" type="time" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>
                    <div>
                        <label class="text-sm font-semibold text-gray-700 mb-1 block">Sucursal de Recojo</label>
                        <select v-model="direccionParaEditar.IdSucursalRetiro" class="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <option value="">Seleccione una sucursal</option>
                            <option v-for="sucursal in sucursales" :key="sucursal.IdSucursal" :value="sucursal.IdSucursal">{{ sucursal.Nombre }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-4">
          <button @click="cerrarModalDireccion" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Cancelar</button>
          <button @click="actualizarDireccion" class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">Actualizar</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="showToast" class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50">
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/order';
import { listarPedidoSucursal, actualizarEstadoReserva } from '@/Server/Reserva';
import { DevolucionEntrega, obteneralCliente, listarEntregaSucursal, listarTipoEntrega, ObtenerEntrega, actualizarlaDireccion, obteneDetalles } from '@/Server/Entrga';
import { listarBarrios,listarSucursales  } from '@/Server/api';
import { listarMetodo, listarPagoVenta } from '@/Server/Pago';
import { SucursalUsuario } from '@/Server/Usuario' 
import { Truck, CheckCircle, MapPin, Pencil, X, ChevronDown, Eye, Package, Calculator } from 'lucide-vue-next';

const router = useRouter();

const expandedEntregaId = ref(null);

const toggleDireccion = async (entrega) => {
  await obtenerEntrega(entrega.IdEntrega);
  expandedEntregaId.value = expandedEntregaId.value === entrega.IdEntrega ? null : entrega.IdEntrega;

};
const destino = ref({});
const entregas = ref([]);
const sucursales = ref([]);
const barrios = ref([]);
const tEntrega = ref([]);
const filtroFecha = ref(new Date().toISOString().slice(0, 10));
const filtroSucursal = ref('TODOS');
const TIeneSucursal = ref(false);
const totalPedidos = ref(0);
const totalReservas = ref(0);
const showToast = ref(false);
const toastMessage = ref('');
const direccion = ref({});
const store = useAppStore();
const ubicarEntrega = ref(''); 

// Data for Devolucion Modal
const showDevolucionModal = ref(false);
const selectedEntrega = ref(null);
const productosDevolucion = ref([]);
const detalleDevolucion = ref('');
const metodoPago = ref(1);
const isProcessingPayment = ref(false);
const metodo = ref([]);
const montoRecibido = ref(0);
const montoAdelanto = ref(0);

const ListarMetodo = async () => {
  try {
    metodo.value = await listarMetodo();
  } catch (error) {
    console.error('Error fetching metodos de pago:', error);
  }
};

const cambio = computed(() => {
  if (metodoPago.value === 1) { // Assuming 1 is for cash
    const result = montoRecibido.value - calcularPagoFinal();
    return redondearPrecio(result);
  }
  return '0.00';
});

const getStatusClasses = (status) => {
  if (!status) return 'bg-slate-500 text-white';
  const lowerCaseStatus = status.toLowerCase();
  switch (lowerCaseStatus) {
    case 'completado':
      return 'bg-emerald-500 text-white';
    case 'devuelto':
      return 'bg-orange-500 text-white';
    case 'pendiente':
      return 'bg-sky-500 text-white';
    case 'enviado':
      return 'bg-indigo-500 text-white';
    default:
      return 'bg-slate-500 text-white';
  }
};

const validarCantidadDevolver = (producto) => {
  if (producto.cantidadDevolver > producto.cantidad) {
    producto.cantidadDevolver = producto.cantidad;
  }
  if (producto.cantidadDevolver < 0) {
    producto.cantidadDevolver = 0;
  }
};

// Data for Direccion Modal
const showDireccionModal = ref(false);
const direccionParaEditar = ref(null);

const abrirModalDireccion = async (entrega) => {
  console.log(entrega)
  const dir = await ObtenerEntrega(entrega.IdEntrega);
  direccionParaEditar.value = {
      IdEntrega: entrega.IdEntrega,
      IdTipoEntrega: entrega.IdtEntrega,
      Direccion: dir.Direccion?.Direccion,
      IdBarrio: dir.Direccion.Barrio.IdBarrio,
      Referencia: dir.Direccion.Referencia,
      Ubicacion: dir.Direccion?.Ubicacion,
      FechaEntrega: entrega.FechaEntrega,
      HoraEntrega: entrega.HoraEntrega,
      Costo: entrega.Costo,
      IdSucursalRetiro: dir.Direccion?.Sucursal?.IdSucursal || '', // Assuming this property exists
      IdDireccion:dir.Direccion?.IdDireccion
    };
  console.log(direccionParaEditar.value)
  showDireccionModal.value = true;
};

const cerrarModalDireccion = () => {
  showDireccionModal.value = false;
  direccionParaEditar.value = null;
};

const actualizarDireccion = async () => {
  // console.log()
  try{
    const dato = {
      IdEntrega:direccionParaEditar.value?.IdEntrega,
      tipoe:direccionParaEditar.value?.IdTipoEntrega,
      Ubicacion:direccionParaEditar.value?.Ubicacion,
      Referencia: direccionParaEditar.value?.Referencia,
      Direccion:direccionParaEditar.value?.Direccion,
      BarrioId:direccionParaEditar.value?.IdBarrio,
      Hora:direccionParaEditar.value?.HoraEntrega,
      Fecha:direccionParaEditar.value?.FechaEntrega,
      Costo:direccionParaEditar.value?.Costo,
      IdSucursal: direccionParaEditar.value?.IdSucursalRetiro,
      DireccionId:direccionParaEditar.value?.IdDireccion
    }
    console.log(dato)
    const response = await actualizarlaDireccion(dato);
    await ListarEntregas();
    cerrarModalDireccion();
    showToastMessage(response.message);
  }catch(error){
   showToastMessage('Error al actualizar la direccion de la entrega');
  }

};

const NombreSucursal = (id) =>{
  const nombre = sucursales.value.filter((e) => e.IdSucursal === id);
  
 if(nombre.length >0)
 return nombre[0].Nombre;
else
 return id;
}

const openDevolucionModal = async (entrega) => {
  selectedEntrega.value = entrega;
  montoAdelanto.value = 0;
  // Sample data - replace with actual product data from the delivery
  const productos = await obteneDetalles(entrega.IdEntrega);
  const pagoRegistrado = await listarPagoVenta(entrega.Pedido.IdVenta); 

  if (pagoRegistrado && pagoRegistrado.length > 0 && pagoRegistrado[0]?.Monto) {
    const monto = parseFloat(pagoRegistrado[0]?.Monto) || 0;
    const cambio = parseFloat(pagoRegistrado[0]?.Cambio) || 0;
    montoAdelanto.value = Math.max(0, monto - cambio);
  } 
  // esto es lo que devuelve el metodo listarPagoVenta si es que es reserva
// [
//     {
//         "Metodopago": 1,
//         "Nombre": "Efectivo",
//         "Cambio": "9.05",
//         "Monto": "40.00",
//         "IdPago": "10122025PA-1"
//     }
// ]
console.log(entrega)
  console.log(productos)
 // esto devuelve la lista de productos de obtenerDetalles
//  {
//     "Pedido": {
//         "IdPedido": "09192025PED-6",
//         "FechaRegistro": "2025-09-19",
//         "Hora": "18:37:16",
//         "Detalle": null,
//         "Tipopedido": {
//             "IdTipoPedido": "ITP-P1",
//             "Nombre": "Pedido"
//         },
//         "Detallepedido": [
//             {
//                 "IdDetallePedido": "09192025DP-4",
//                 "Cantidad": 4,
//                 "Precio": "0.00",
//                 "Modo": 0,
//                 "Producto": {
//                     "IdProducto": "08132025PROD-1",
//                     "Nombre": "Cunape",
//                     "Descripcion": "Lo mejor de la Casa",
//                     "FechaRegistro": "2025-08-13",
//                     "Fechaactualizacion": null,
//                     "FechaVencimiento": null
//                 },
//                 "Paquete": null,
//                 "Promocion": null
//             }
//         ]
//     },
//     "Distribucion": {
//         "IdDistribucion": "09192025DIS-6",
//         "FechaDistribucion": "2025-09-19",
//         "HoraDistribucion": "18:37:16",
//         "Origen": "Cocina",
//         "Observacion": null,
//         "Detalledistribucion": [
//             {
//                 "IdDetalleDistribucion": "09192025DD-4",
//                 "Cantidad": 4,
//                 "Precio": "0.00",
//                 "Cantidaddevuelta": 0,
//                 "Modo": 0,
//                 "Producto": {
//                     "IdProducto": "08132025PROD-1",
//                     "Nombre": "Cunape",
//                     "Descripcion": "Lo mejor de la Casa",
//                     "FechaRegistro": "2025-08-13",
//                     "Fechaactualizacion": null,
//                     "FechaVencimiento": null
//                 },
//                 "Paquete": null
//             }
//         ]
//     }
// }
  
let items = [];
    if (productos.Pedido && productos.Pedido.Detallepedido) {
        items = productos.Pedido.Detallepedido.map(detalle => {
            return {
                IdProducto :detalle?.Producto?.IdProducto,
                IdPaquete :detalle?.Paquete?.IdPaquete,
                IdPromocion:detalle?.Promocion?.IdPromocion,
                nombre: detalle?.Producto?.Nombre?  detalle?.Producto?.Nombre :detalle?.Paquete?.Nombre? detalle?.Paquete?.Nombre: detalle?.Promocion?.Nombre,
                cantidad: detalle.Cantidad,
                precio: parseFloat(detalle.Precio) || 0,
                devolucion: false,
                cantidadDevolver: 0
            };
        });
    } else if (productos.Distribucion && productos.Distribucion.Detalledistribucion) {
        items = productos.Distribucion.Detalledistribucion.map(detalle => {
            return {
                IdProducto :detalle?.Producto?.IdProducto,
                IdPaquete :detalle?.Paquete?.IdPaquete,
                nombre: detalle?.Producto?.Nombre?  detalle?.Producto?.Nombre :detalle?.Paquete?.Nombre,
                cantidad: detalle.Cantidad,
                precio: parseFloat(detalle.Precio) || 0, 
                devolucion: false,
                cantidadDevolver: 0
            };
        });
    }
    productosDevolucion.value = items;
  detalleDevolucion.value = '';
  showDevolucionModal.value = true;
};

const closeDevolucionModal = () => {
  showDevolucionModal.value = false;
  selectedEntrega.value = null;
  productosDevolucion.value = [];
  detalleDevolucion.value = '';
  metodoPago.value = 'efectivo';
  montoAdelanto.value = 0;
};

const calcularMontoTotal = () => {
  if (!selectedEntrega.value) return 0;
  // This should eventually be calculated from the actual delivery data
  return redondearPrecio(productosDevolucion.value.reduce((total, prod) => total + (prod.cantidad * prod.precio), 0));
};

const calcularMontoDevolver = () => {
  return productosDevolucion.value.reduce((total, prod) => {
    if (prod.devolucion) {
      const cantidadADevolver = Math.min(prod.cantidadDevolver, prod.cantidad);
      return total + (cantidadADevolver * prod.precio);
    }
    return total;
  }, 0);
};

const redondearPrecio = (precio) => {
  // Se asegura que el precio sea un número, lo multiplica por 10, lo redondea, y luego lo divide por 10.
  const redondeado = Math.round(Number(precio) * 10) / 10;
  // Devuelve el número con dos decimales. Ej: 19.9
  return redondeado.toFixed(2);
};


const calcularPagoFinal = () => {
  const total = calcularMontoTotal() - calcularMontoDevolver();
  const aPagar = total - montoAdelanto.value;
  return aPagar;
};

const procesarPago = async () => {
  if (isProcessingPayment.value) return;
  isProcessingPayment.value = true;
  try {
    console.log(productosDevolucion.value)
    const itemsParaEnviar = productosDevolucion.value.map(p => {
      const cantidadDevolver = (p.devolucion && p.cantidadDevolver > 0) ? p.cantidadDevolver : 0;
      return {
        IdProducto: p?.IdProducto,
        IdPaquete: p?.IdPaquete,
        IdPromocion: p?.IdPromocion,
        Precio: p?.precio,
        Cantidad: p.cantidad - cantidadDevolver,
        CantidadOriginal:p.cantidad,
        Cantidaddevuelta: cantidadDevolver
      };
    });
console.log(itemsParaEnviar)
    if (metodoPago.value !== 1) {
        montoRecibido.value = calcularPagoFinal();
    }

    const data = {
      IdEntrega: selectedEntrega.value.IdEntrega,
      item: itemsParaEnviar,
      comentario: detalleDevolucion.value,
          IdMetodo: metodoPago.value,
          Monto: montoRecibido.value,
          Cambio: cambio.value,
          pagoFinal: calcularPagoFinal()
    };
      console.log(data)
    const response = await DevolucionEntrega(data);
    
    showToastMessage(response.message || 'Pago procesado y devolución registrada.');
    closeDevolucionModal();
    ListarEntregas(); // Refresh the list
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    showToastMessage('Error al procesar el pago.');
  } finally {
    isProcessingPayment.value = false;
  }
};


const verReserva = (entrega) => {
  if (entrega && entrega.Pedido && entrega.Pedido.IdPedido) {
    store.setPedido(entrega.Pedido.IdPedido);
    store.setSucursal(filtroSucursal.value);
    store.setFecha(entrega.Pedido.FechaRegistro);
    router.push({ name: 'reserva' });
  // , query: { id: entrega.Pedido.IdPedido }
  } else {
    console.error('No se pudo encontrar el IdPedido para la navegación.');
  }
};

const ListarEntregas = async () => {
  try {
    const response = await listarEntregaSucursal(filtroSucursal.value, filtroFecha.value);
    entregas.value = response;
    for(const entrega of response)
    await ObteneralCliente(entrega.IdEntrega);
  calcularTipos();
  } catch (error) {
    console.error('Error fetching entregas:', error);
    showToastMessage('Error al cargar las entregas.');
  }
};
const calcularTipos = () =>{
  totalReservas.value = entregas.value.filter((e) => e.Pedido?.NombreTipo === 'Reserva').length;
     totalPedidos.value = entregas.value.filter((e) => e.Pedido?.NombreTipo !== 'Reserva').length;
}
const SacarSucursal = async () => {
    try {
        const res = await SucursalUsuario();
        if (res.IdSucursal) {
            TIeneSucursal.value = true;
            filtroSucursal.value = res.IdSucursal;
        } else {
            const response = await listarSucursales();
            sucursales.value = response;
        }
    } catch (error) {
        console.error('Error fetching sucursales:', error);
    }
};

const ListarSucursales = async  () =>{
  try {
            const response = await listarSucursales();
            sucursales.value = response;
    } catch (error) {
        console.error('Error fetching sucursales:', error);
    }
}

const cargarTiposEntrega = async () => {
    try {
        tEntrega.value = await listarTipoEntrega();
    } catch (error) {
        console.error('Error fetching delivery types:', error);
    }
};

const ListarBarrios = async () => {
    try {
        const response = await listarBarrios();
        barrios.value = response;
    } catch (error) {
        console.error('Error fetching barrios:', error);
    }
};
const obtenerEntrega = async (id) => {
    try {
        const response = await ObtenerEntrega(id);
          console.log(response)
        direccion.value = response;
      
    } catch (error) {
        console.error('Error fetching barrios:', error);
    }
};
const ObteneDetalles = async (id) => {
  let salida; 
  try {
        const response = await obteneDetalles(id);
        salida = response;
      
    } catch (error) {
        console.error('Error fetching barrios:', error);
    }
    return salida;
};

const ObteneralCliente = async (id) => {
    try {
        const response = await obteneralCliente(id);
        destino.value[id] = response;
      
    } catch (error) {
        console.error('Error fetching barrios:', error);
    }
};

const filteredentregas = computed(() => {
  if (!Array.isArray(entregas.value)) return [];
  return entregas.value;
});

const marcarComoCompletado = async (pedidoId) => {
  try {
    // Assuming '9' is the ID for 'Completado' state
    await actualizarEstadoReserva(pedidoId, { IdEstado: 9 });
    showToastMessage('Entrega completada con éxito.');
    await ListarEntregas(); // Refresh the list
  } catch (error) {
    console.error('Error completing entrega:', error);
    showToastMessage('Error al completar la entrega.');
  }
};

const limpiarubicarEntrega = () =>{
  ubicarEntrega.value = ''; 
}

const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};


onMounted(() => {
    if(store.Fecha!=="" && store.IdSucursal !==""){
  filtroFecha.value = store.Fecha;
  filtroSucursal.value = store.IdSucursal;
  ubicarEntrega.value = store.IdPEdido;}
  ListarBarrios();
  ListarEntregas();
  ListarSucursales();
  cargarTiposEntrega();
  ListarMetodo();
  // SacarSucursal().then(() => {
  //     ListarEntregas();
  // });
});
watch([filtroFecha, filtroSucursal], ListarEntregas);

</script>

<style scoped>
/* Add any specific styles if needed */
</style>