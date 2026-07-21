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
      <div v-if="isExpanded" class="mb-4 space-y-3 animate-fade-in">
        <div class="max-h-56 overflow-y-auto space-y-2 p-1">
          <!-- Items V. Menor -->
          <div v-if="itemsMenor.length > 0" class="p-3 bg-gray-50/80 rounded-xl border border-gray-200">
            <div class="text-[11px] uppercase font-bold text-gray-600 mb-2 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-gray-400"></span> V. Menor
            </div>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 text-[10px] text-gray-500 uppercase">
                  <th class="text-left py-1 px-1 font-semibold">Nombre</th>
                  <th class="text-center py-1 px-1 font-semibold">Cant.</th>
                  <th class="text-center py-1 px-1 font-semibold">Precio</th>
                  <th class="text-center py-1 px-1 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itemsMenor" :key="item.IdDetalleVenta" class="border-b border-gray-100">
                  <td class="py-2 px-1">
                    <span class="font-bold text-gray-800 text-[11px]">{{ item.Productomedida?.Producto?.Nombre || 'Ítem' }}</span>
                    <span v-if="item.Productomedida?.Presentacion" class="text-[10px] text-gray-500 ml-1">{{ item.Productomedida.Presentacion.Nombre }}</span>
                  </td>
                  <td class="py-2 px-1 text-center font-bold text-gray-700 text-[11px]">{{ item.Cantidad }}</td>
                  <td class="py-2 px-1 text-center font-bold text-gray-700 text-[11px]">Bs. {{ Number(item.Precio).toFixed(2) }}</td>
                  <td class="py-2 px-1 text-center font-bold text-green-600 text-[11px]">Bs. {{ (item.Precio * item.Cantidad).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Items V. Mayor -->
          <div v-if="itemsMayor.length > 0" class="p-3 bg-orange-50/80 rounded-xl border border-orange-200">
            <div class="text-[11px] uppercase font-bold text-orange-600 mb-2 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-orange-400"></span> V. Mayor
            </div>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-orange-200 text-[10px] text-orange-500 uppercase">
                  <th class="text-left py-1 px-1 font-semibold">Nombre</th>
                  <th class="text-center py-1 px-1 font-semibold">Cant.</th>
                  <th class="text-center py-1 px-1 font-semibold">Precio</th>
                  <th class="text-center py-1 px-1 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itemsMayor" :key="item.IdDetalleVenta" class="border-b border-orange-100">
                  <td class="py-2 px-1">
                    <span class="font-bold text-orange-800 text-[11px]">{{ item.Productomedida?.Producto?.Nombre || 'Ítem' }}</span>
                    <span v-if="item.Productomedida?.Presentacion" class="text-[10px] text-orange-500 ml-1">{{ item.Productomedida.Presentacion.Nombre }}</span>
                  </td>
                  <td class="py-2 px-1 text-center font-bold text-orange-700 text-[11px]">{{ item.Cantidad }}</td>
                  <td class="py-2 px-1 text-center font-bold text-orange-700 text-[11px]">Bs. {{ Number(item.Precio).toFixed(2) }}</td>
                  <td class="py-2 px-1 text-center font-bold text-orange-600 text-[11px]">Bs. {{ (item.Precio * item.Cantidad).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Items Promocion -->
          <div v-if="itemsPromo.length > 0" class="p-3 bg-purple-50/80 rounded-xl border border-purple-200">
            <div class="text-[11px] uppercase font-bold text-purple-600 mb-2 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-purple-400"></span> Promociones
            </div>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-purple-200 text-[10px] text-purple-500 uppercase">
                  <th class="text-left py-1 px-1 font-semibold">Nombre</th>
                  <th class="text-center py-1 px-1 font-semibold">Cant.</th>
                  <th class="text-center py-1 px-1 font-semibold">Precio</th>
                  <th class="text-center py-1 px-1 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itemsPromo" :key="item.IdDetalleVenta" class="border-b border-purple-100">
                  <td class="py-2 px-1">
                    <span class="font-bold text-purple-800 text-[11px]">{{ item.Promocion?.Nombre || 'Promoción' }}</span>
                    <button 
                      v-if="item.Promocion?.Productos?.length > 0"
                      @click="togglePromo(item.IdDetalleVenta)"
                      class="ml-1 p-0.5 hover:bg-purple-100 rounded transition-colors text-purple-600 inline-flex"
                    >
                      <Info v-if="!expandedPromos.has(item.IdDetalleVenta)" class="h-3 w-3" />
                      <ChevronUp v-else class="h-3 w-3" />
                    </button>
                  </td>
                  <td class="py-2 px-1 text-center font-bold text-purple-700 text-[11px]">{{ item.Cantidad }}</td>
                  <td class="py-2 px-1 text-center font-bold text-purple-700 text-[11px]">Bs. {{ Number(item.Precio).toFixed(2) }}</td>
                  <td class="py-2 px-1 text-center font-bold text-purple-600 text-[11px]">Bs. {{ (item.Precio * item.Cantidad).toFixed(2) }}</td>
                </tr>
                <!-- Nested Promotion Products -->
                <Transition name="fade-slide">
                  <tr v-if="item.Promocion?.Productos?.length > 0 && expandedPromos.has(item.IdDetalleVenta)">
                    <td colspan="4" class="py-2 px-2">
                      <div class="border-l-2 border-purple-300 pl-3 space-y-1">
                        <p class="text-[10px] font-bold text-purple-700">Productos incluidos:</p>
                        <div v-for="p in item.Promocion.Productos" :key="p.IdPromocionProducto" class="text-[10px] text-gray-600">
                          {{ p.Productomedida?.Producto?.Nombre || 'Producto' }} x{{ p.Cantidad }}
                        </div>
                      </div>
                    </td>
                  </tr>
                </Transition>
              </tbody>
            </table>
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

        <!-- Resumen V. Menor / V. Mayor (siempre visible) -->
        <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
          <div class="font-semibold text-gray-800 mb-2 text-sm">Resumen por Tipo de Venta</div>
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="font-bold text-gray-600">V. Menor</span>
              <span class="font-bold text-gray-700">Bs. {{ totalMenor.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="font-bold text-orange-600">V. Mayor</span>
              <span class="font-bold text-orange-600">Bs. {{ totalMayor.toFixed(2) }}</span>
            </div>
            <hr class="border-gray-200" />
            <div class="flex justify-between text-sm">
              <span class="font-bold text-gray-700">Total general</span>
              <span class="font-bold text-green-600">Bs. {{ totalGeneral.toFixed(2) }}</span>
            </div>
            <div v-if="gastoExtraVal > 0" class="flex justify-between text-xs">
              <span class="text-red-500 font-medium">Gasto Extra</span>
              <span class="text-red-500 font-medium">- Bs. {{ gastoExtraVal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm pt-1 border-t border-gray-200">
              <span class="font-black text-gray-800">Venta Neta</span>
              <span class="font-black text-blue-600">Bs. {{ ventaNeta.toFixed(2) }}</span>
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

const items = computed(() => props.venta.Detalle || props.venta.Detalleventa || []);

const esMayorItem = (i) => {
  const v = i.PrecioMayor ?? i.precioMayor ?? i.preciomayor;
  if (v != null && Number(v) > 0) return true;
  const pm = i.Productomedida;
  const p = i.Producto ?? i.producto;
  const refMenor = pm?.Precio ?? pm?.precioventa ?? p?.PrecioVenta ?? p?.precioventa ?? p?.Precio ?? 0;
  const refMayor = pm?.PrecioMayor ?? pm?.preciomayor ?? p?.PrecioMayor ?? p?.preciomayor ?? 0;
  if (refMayor > 0 && Number(i.Precio) <= Number(refMayor)) return true;
  if (refMenor > 0 && Number(i.Precio) < Number(refMenor)) return true;
  return false;
};

const itemsMenor = computed(() => items.value.filter(i => !i.Promocion && !esMayorItem(i)));
const itemsMayor = computed(() => items.value.filter(i => !i.Promocion && esMayorItem(i)));
const itemsPromo = computed(() => items.value.filter(i => i.Promocion));

const totalMenor = computed(() => {
  return items.value.reduce((acc, item) => {
    if (item.Promocion || esMayorItem(item)) return acc;
    return acc + Number(item.Precio) * Number(item.Cantidad);
  }, 0);
});

const totalMayor = computed(() => {
  return items.value.reduce((acc, item) => {
    if (item.Promocion || !esMayorItem(item)) return acc;
    return acc + Number(item.Precio) * Number(item.Cantidad);
  }, 0);
});

const totalGeneral = computed(() => {
  return items.value.reduce((acc, item) => acc + Number(item.Precio) * Number(item.Cantidad), 0);
});

const gastoExtraVal = computed(() => Number(props.venta.gastoextra || props.venta.GastoExtra || 0));

const ventaNeta = computed(() => totalGeneral.value - gastoExtraVal.value);

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
