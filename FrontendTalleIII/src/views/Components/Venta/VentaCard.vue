<template>
  <div class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div class="relative p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
            <ShoppingCart class="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              Venta #{{ venta.idventa }}
            </h3>
            <p class="text-gray-600 text-sm">
              {{ clienteNombre || 'Consumidor Final' }}
            </p>
          </div>
        </div> 

        <span
          :class="[
            'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
            (venta.estado === 1 || venta.estado === 'Pagado' || venta.estado?.Nombre === 'Pagado')
              ? 'bg-linear-to-r from-green-500 to-emerald-600'
              : (venta.estado === 0 || venta.estado === 'Anulado' || venta.estado?.Nombre === 'Anulado')
                ? 'bg-linear-to-r from-red-500 to-rose-600'
                : 'bg-linear-to-r from-yellow-500 to-amber-600'
          ]"
        >
          {{ venta.estado === 1 ? 'Pagado' : venta.estado === 0 ? 'Anulado' : (venta.estado?.Nombre || venta.estado) }}
        </span>
      </div>

      <!-- Venta Details Preview -->
      <div class="mb-4 p-4 bg-linear-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">Información Clave</span>
          <button
            @click="$emit('toggle-expand')"
            class="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition-colors"
          >
            {{ isExpanded ? 'Ocultar' : 'Ver más' }}
            <ChevronDown v-if="!isExpanded" class="h-4 w-4" />
            <ChevronUp v-else class="h-4 w-4" />
          </button>
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Calendar class="h-4 w-4 text-orange-500" />
            <span>{{ formatearFecha(venta.fechaventa) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign class="h-4 w-4 text-green-500" />
            <span class="font-bold text-green-600">Bs. {{ venta.preciototal || totalCalculado }}</span>
          </div>
          <div v-if="venta.gastoextra || venta.GastoExtra" class="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign class="h-4 w-4 text-red-400" />
            <span class="font-medium text-red-500">Gasto Extra: Bs. {{ Number(venta.gastoextra || venta.GastoExtra).toFixed(2) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Receipt class="h-4 w-4 text-blue-500" />
            <div v-if="venta.Factura?.NroFactura" class="flex items-center gap-2">
              <span class="font-medium">Comprobante:</span>
              <a href="#" @click.prevent="$emit('open-comprobante', venta)" class="hover:underline font-bold text-blue-600">
                {{ venta.Factura.NroFactura }}
              </a>
              <a 
                v-if="venta.Factura?.Enlace || venta.Factura?.IdEnlace?.startsWith('http')" 
                :href="venta.Factura.Enlace || venta.Factura.IdEnlace" 
                target="_blank"
                class="ml-1 p-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 text-[10px] font-bold border border-blue-100"
                title="Ver PDF digital"
              >
                <FileText class="h-3 w-3" />
                PDF
              </a>
            </div>
            <span v-else class="text-gray-400 italic">
              Sin Comprobante
            </span>
          </div>
        </div> 
      </div>

      <!-- Expanded Details -->
      <div v-if="isExpanded" class="mb-4 space-y-3 animate-fade-in max-h-64 overflow-y-auto p-1">
        <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
          <div class="font-semibold text-gray-800 mb-2 text-sm">Detalles de Ítems</div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 px-2 font-semibold text-gray-700">Tipo</th>
                  <th class="text-left py-2 px-2 font-semibold text-gray-700">Nombre</th>
                  <th class="text-center py-2 px-2 font-semibold text-gray-700">Cant.</th>
                    <th class="text-center py-2 px-2 font-semibold text-gray-700">Precio</th>
                  <th class="text-center py-2 px-2 font-semibold text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="item in (venta.Detalle || venta.Detalleventa)" :key="item.IdDetalleVenta">
                  <tr class="border-b border-gray-100 hover:bg-white/50 transition-colors">
                    <td class="py-3 px-2">
                      <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                        <img 
                          v-if="item.Productomedida?.Imagen || item.Producto?.Imagen || item.Promocion?.Imagen"
                          :src="item.Productomedida?.Imagen || item.Producto?.Imagen || item.Promocion?.Imagen" 
                          :alt="item.Productomedida?.Producto?.Nombre || item.Promocion?.Nombre"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center">
                          <Package v-if="item.Productomedida" class="h-5 w-5 text-gray-400" />
                          <Tag v-else class="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-2">
                      <div class="flex flex-col">
                        <span class="font-bold text-gray-800 flex items-center gap-2">
                          {{ item.Productomedida?.Producto?.Nombre || item.Promocion?.Nombre || 'Desconocido' }}
                          <button 
                            v-if="item.Promocion?.Productos?.length > 0"
                            @click="togglePromo(item.IdDetalleVenta)"
                            class="p-1 hover:bg-orange-100 rounded-lg transition-colors text-orange-600"
                            title="Ver productos del combo"
                          >
                            <Info v-if="!expandedPromos.has(item.IdDetalleVenta)" class="h-4 w-4" />
                            <ChevronUp v-else class="h-4 w-4" />
                          </button>
                        </span>
                        <span v-if="item.Productomedida?.Presentacion" class="text-xs text-gray-500">
                          {{ item.Productomedida.Presentacion.Nombre }}
                        </span>
                        <span v-if="item.Promocion" class="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-fit mt-1">
                          Promoción
                        </span>
                      </div>
                    </td>
                    <td class="py-3 px-2 text-center font-bold text-gray-700">{{ item.Cantidad }}</td>
                    <td class="py-3 px-2 text-center font-bold text-gray-700">{{ item.Precio }}</td>
                    <td class="py-3 px-2 text-center font-bold text-green-600">Bs. {{ (item.Precio * item.Cantidad).toFixed(2) }}</td>
                  </tr>
                  
                  <!-- Nested Promotion Products -->
                  <Transition name="fade-slide">
                    <tr v-if="item.Promocion?.Productos?.length > 0 && expandedPromos.has(item.IdDetalleVenta)" class="bg-gray-50/50">
                      <td colspan="4" class="py-3 px-4">
                        <div class="border-l-4 border-orange-400 pl-4 space-y-3">
                          <p class="text-xs font-bold text-orange-700 uppercase tracking-wider">Productos incluidos en el combo:</p>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div v-for="p in item.Promocion.Productos" :key="p.IdPromocionProducto" class="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                              <div class="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                <img 
                                  v-if="p.Productomedida?.Imagen || p.Productomedida?.Producto?.Imagen"
                                  :src="p.Productomedida?.Imagen || p.Productomedida?.Producto?.Imagen" 
                                  class="w-full h-full object-cover"
                                />
                                <Package v-else class="h-4 w-4 m-2 text-gray-300" />
                              </div>
                              <div class="min-w-0">
                                <p class="text-xs font-bold text-gray-800 truncate">{{ p.Productomedida?.Producto?.Nombre || 'Producto' }}</p>
                                <p class="text-[10px] text-gray-500">Cant: {{ p.Cantidad }} x {{ p.Productomedida?.Presentacion?.Nombre || 'Unidad' }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Transition>
                </template>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Info Pago -->
        <div v-if="infoPagos && infoPagos.length > 0">
           <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100" v-for="pago in infoPagos" :key="pago.IdPago">
            <div class="font-semibold text-gray-800 mb-2 text-sm">Información de Pago</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-xs text-gray-600">
                <CreditCard class="h-3 w-3 text-blue-500" />
                <span>Método: {{ pago.Metodopago?.Nombre || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-600">
                <DollarSign class="h-3 w-3 text-green-500" />
                <span>Monto Pagado: Bs. {{ Number(pago.Monto) + Number(pago.Cambio) || '0.00' }}</span>
              </div>
              <div v-if="pago.Cambio > 0" class="flex items-center gap-2 text-xs text-gray-600">
                <Coins class="h-3 w-3 text-purple-500" />
                <span>Cambio: Bs. {{ pago.Cambio || '0.00' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mt-4">
        <button
          @click="$emit('open-comprobante', venta)"
          :disabled="estaBloqueadoComprobante"
          :title="estaBloqueadoComprobante ? 'El comprobante ya no está disponible (pasó más de 24h)' : 'Ver comprobante'"
          class="border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl p-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
        >
          <span>Comprobante</span> <Receipt class="h-4 w-4" />
        </button>

        <!-- Edit Button -->
        <button
          v-if="venta.estado !== 0"
          @click="$emit('editar', venta)"
          class="bg-orange-500 text-white hover:bg-orange-600 rounded-xl p-2 text-sm font-medium transition-colors flex items-center justify-center"
          title="Editar venta"
        >
          <Pencil class="h-4 w-4" />
        </button>

        <button
          v-if="venta.estado !== 0"
          @click="$emit('anular', venta.idventa)"
          :disabled="isBlocked || estaBloqueadoAnulacion"
          :title="estaBloqueadoAnulacion ? 'La venta ya no se puede anular (pasaron más de 30 min)' : 'Anular venta'"
          class="bg-red-500 text-white hover:bg-red-600 rounded-xl p-2 text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  ShoppingCart, ChevronDown, ChevronUp, Calendar, DollarSign, Receipt, CreditCard, Coins, X, Info, Package, Tag, FileText, Pencil
} from 'lucide-vue-next';
// Tag already imported

const props = defineProps({
  venta: {
    type: Object,
    required: true
  },
  factura: {
    type: Object,
    default: () => ({})
  },
  isExpanded: {
    type: Boolean,
    default: false
  },
  pagosVenta: {
    type: Array,
    default: () => []
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-expand', 'open-comprobante', 'anular', 'editar']);

const expandedPromos = ref(new Set());

// Date/Time calculation logic
const saleDateTime = computed(() => {
  const f = props.venta.fechaventa || props.venta.FechaVenta;
  const h = props.venta.horaventa || props.venta.HoraVenta;
  
  if (!f) return null;

  // Si f ya es un objeto Date (raro pero posible)
  if (f instanceof Date) return f;

  // Intentar parsear la fecha directamente
  let d = new Date(f);
  
  // Si la fecha es válida pero es medianoche (probablemente solo fecha sin hora),
  // o si el parsing falló, intentamos combinar con horaventa
  if (isNaN(d.getTime()) || (typeof f === 'string' && f.includes('T') && d.getHours() === 0 && d.getMinutes() === 0)) {
    const datePart = typeof f === 'string' ? f.split('T')[0] : f;
    const timePart = h || '00:00:00';
    const combined = new Date(`${datePart} ${timePart}`);
    if (!isNaN(combined.getTime())) d = combined;
  }

  // Fallback manual si sigue siendo inválida
  if (isNaN(d.getTime())) {
    try {
      const datePart = typeof f === 'string' ? f.split('T')[0] : String(f);
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, min, sec] = (h || '00:00:00').split(':').map(Number);
      d = new Date(year, month - 1, day, hour, min, sec);
    } catch (e) {
      return null;
    }
  }

  return isNaN(d.getTime()) ? null : d;
});

const estaBloqueadoAnulacion = computed(() => {
  if (!saleDateTime.value) return false;
  const now = new Date();
  const diffInMinutes = (now - saleDateTime.value) / (1000 * 60);
  return diffInMinutes > 30;
});

const estaBloqueadoComprobante = computed(() => {
  // Si la venta está anulada, el comprobante se bloquea automáticamente
  if (props.venta.estado === 0 || props.venta.estado === 'Anulado' || props.venta.estado?.Nombre === 'Anulado') {
    return true;
  }
  
  if (!saleDateTime.value) return false;
  const now = new Date();
  const diffInHours = (now - saleDateTime.value) / (1000 * 60 * 60);
  return diffInHours > 24;
});

const togglePromo = (id) => {
  if (expandedPromos.value.has(id)) {
    expandedPromos.value.delete(id);
  } else {
    expandedPromos.value.add(id);
  }
};

const clienteNombre = computed(() => {
  if (props.venta.Factura?.NombreFacturacion) return props.venta.Factura.NombreFacturacion;
  const p = props.venta.Persona || props.venta.persona;
  if (!p) return 'Consumidor Final';
  const nombre = p.Nombre || p.nombre || '';
  const paterno = p.ApellidoPaterno || p.apellidopaterno || '';
  const materno = p.ApellidoMaterno || p.apellidomaterno || '';
  return `${nombre} ${paterno} ${materno}`.trim() || 'Consumidor Final';
});

const infoPagos = computed(() => {
  return props.venta.Pago || props.pagosVenta || [];
});

const totalCalculado = computed(() => {
  const detalles = props.venta.Detalle || props.venta.Detalleventa;
  if (!detalles) return '0.00';
  const totalVal = detalles.reduce((acc, item) => acc + (parseFloat(item.Precio) * item.Cantidad), 0);
  return totalVal.toFixed(2);
});

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'N/A';
  try {
    // Parsear la fecha asegurando que sea local si es YYYY-MM-DD
    let date;
    if (typeof fechaStr === 'string' && fechaStr.includes('-') && !fechaStr.includes('T')) {
      const [year, month, day] = fechaStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(fechaStr);
    }

    if (isNaN(date.getTime())) return fechaStr;
    // Formato latinoamericano (día/mes/año)
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return fechaStr;
  }
};
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
