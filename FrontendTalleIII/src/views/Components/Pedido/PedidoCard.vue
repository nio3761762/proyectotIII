<template>
  <div class="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div class="relative p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
            <Package class="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              Pedido #{{ pedido.idpedido }}
            </h3>
            <p class="text-gray-600 text-sm">
              {{ clienteNombre }}
            </p>
          </div>
        </div>

        <span
          :class="[
            'px-3 py-1 rounded-xl text-white border-0 shadow-lg text-sm font-medium',
            pedido.estado === 1 ? 'bg-linear-to-r from-yellow-500 to-amber-600' :
            pedido.estado === 2 ? 'bg-linear-to-r from-blue-500 to-indigo-600' :
            pedido.estado === 3 ? 'bg-linear-to-r from-green-500 to-emerald-600' :
            'bg-linear-to-r from-red-500 to-rose-600'
          ]"
        >
          {{ estadoNombre }}
        </span>
      </div>

      <!-- Pedido Details Preview -->
      <div class="mb-4 p-4 bg-linear-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-orange-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">Resumen del Pedido</span>
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
            <span>{{ formatearFecha(pedido.fecharegistro) }} {{ pedido.hora }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign class="h-4 w-4 text-green-500" />
              <span class="font-bold text-green-600">Total: Bs. {{ pedido.total }}</span>
            </div>
            <div v-if="pedido.adelanto > 0" class="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
              Adelanto: Bs. {{ pedido.adelanto }}
            </div>
          </div>
          <div v-if="pedido.direccionentrega" class="flex items-center gap-2 text-sm text-gray-600">
            <MapPin class="h-4 w-4 text-red-500" />
            <span class="truncate">{{ pedido.direccionentrega }}</span>
          </div>
          <!-- Descripcion / Motivo de Devolución -->
          <div v-if="pedido.Descripcion || pedido.devolucion" class="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-xl border border-orange-100">
            <MessageSquare class="h-4 w-4 shrink-0" />
            <span class="text-xs italic">{{ pedido.Descripcion || pedido.devolucion }}</span>
          </div>
        </div> 
      </div>

      <!-- Expanded Details -->
      <div v-if="isExpanded" class="mb-4 space-y-3 animate-fade-in max-h-80 overflow-y-auto p-1">
        <!-- Ítems -->
        <div class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
          <div class="font-semibold text-gray-800 mb-2 text-sm">Detalles de Ítems</div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 px-2 font-semibold text-gray-700">Producto</th>
                  <th class="text-center py-2 px-2 font-semibold text-gray-700">Cant.</th>
                  <th class="text-center py-2 px-2 font-semibold text-gray-700">Precio</th>
                  <th class="text-center py-2 px-2 font-semibold text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="item in (pedido.Detallepedido)" :key="item.IdDetallePedido">
                  <tr class="border-b border-gray-100 hover:bg-white/50 transition-colors">
                    <td class="py-3 px-2">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            v-if="item.Producto?.Imagen || item.Productomedida?.Imagen || item.Promocion?.Imagen"
                            :src="item.Producto?.Imagen || item.Productomedida?.Imagen || item.Promocion?.Imagen" 
                            class="w-full h-full object-cover"
                          />
                          <Package v-else class="h-4 w-4 m-2 text-gray-300" />
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="font-bold text-gray-800 truncate">
                            {{ item.Producto?.Nombre || item.Productomedida?.Producto?.Nombre || item.Promocion?.Nombre }}
                          </span>
                          <span v-if="item.Productomedida?.Presentacion" class="text-[10px] text-gray-500">
                            {{ item.Productomedida.Presentacion.Nombre }} x ({{ item.Productomedida.Cantidad }})
                          </span>
                          <span v-if="item.CantidadDevuelta > 0" class="text-[9px] font-bold text-red-500 uppercase">
                            Devuelto: {{ item.CantidadDevuelta }}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-2 text-center font-bold text-gray-700">{{ item.Cantidad }}</td>
                    <td class="py-3 px-2 text-center text-gray-600">Bs. {{ item.Precio }}</td>
                    <td class="py-3 px-2 text-center font-bold text-green-600">Bs. {{ item.Subtotal }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
 
        <!-- Entrega Info -->
        <div v-if="pedido.referenciaentrega || pedido.linkubicacion" class="p-3 bg-white/70 rounded-xl shadow-sm border border-gray-100">
          <div class="font-semibold text-gray-800 mb-2 text-sm">Información de Entrega</div>
          <div class="space-y-2">
            <p v-if="pedido.referenciaentrega" class="text-xs text-gray-600">
              <span class="font-bold">Referencia:</span> {{ pedido.referenciaentrega }}
            </p>
            <a v-if="pedido.linkubicacion" :href="pedido.linkubicacion" target="_blank" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <ExternalLink class="h-3 w-3" /> Ver Ubicación en Mapa
            </a>
          </div> 
        </div>

        <!-- Venta Asociada -->
        <div v-if="pedido.Venta" class="p-3 bg-green-50 rounded-xl shadow-sm border border-green-100">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-green-800 uppercase">Venta Registrada</span>
            <span class="text-[10px] text-green-600 font-bold">#{{ pedido.Venta.IdVenta }}</span>
          </div>
          <p class="text-xs text-green-700">
            Finalizado el {{ formatearFecha(pedido.Venta.FechaVenta) }} a las {{ pedido.Venta.HoraVenta }}
          </p>
          <div v-if="pedido.Venta.Factura" class="mt-2 flex items-center gap-2">
             <Receipt class="h-3 w-3 text-green-600" />
             <span class="text-xs font-bold text-green-800">Factura: {{ pedido.Venta.Factura.NroFactura }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mt-4">
        <!-- Pendiente (1) -> Enviar -->
        <button
          v-if="pedido.estado === 1"
          @click="$emit('enviar', pedido.idpedido)"
          class="bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-500 rounded-xl p-2 text-sm font-bold transition-all flex items-center justify-center gap-2 flex-1 shadow-md hover:shadow-lg"
        >
          <Send class="h-4 w-4" /> Enviar
        </button>

        <!-- Enviado (2) -> Finalizar -->
        <button
          v-if="pedido.estado === 2"
          @click="$emit('finalizar', pedido)"
          class="bg-linear-to-r from-green-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-green-500 rounded-xl p-2 text-sm font-bold transition-all flex items-center justify-center gap-2 flex-1 shadow-md hover:shadow-lg"
        >
          <CheckCircle class="h-4 w-4" /> Finalizar
        </button>

        <!-- Acciones comunes -->
        <!-- Editar solo visible si está Pendiente (1) -->
        <button
          v-if="pedido.estado === 1"
          @click="$emit('editar', pedido)"
          class="bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl p-2 transition-colors border border-orange-100"
          title="Editar Pedido"
        >
          <Pencil class="h-5 w-5" />
        </button>

        <!-- Anular solo visible si está Pendiente (1) -->
        <button
          v-if="pedido.estado === 1"
          @click="$emit('anular', pedido.idpedido)"
          class="bg-red-50 text-red-600 hover:bg-red-100 rounded-xl p-2 transition-colors border border-red-100"
          title="Anular Pedido"
        >
          <X class="h-5 w-5" />
        </button>

        <button
          @click="$emit('open-comprobante', pedido)"
          class="bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl p-2 transition-colors border border-orange-100"
          title="Ver Comprobante / Detalle"
        >
          <Receipt class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  Package, ChevronDown, ChevronUp, Calendar, DollarSign, MapPin, Tag, 
  ExternalLink, Send, CheckCircle, X, Receipt, MessageSquare, Pencil
} from 'lucide-vue-next';

const props = defineProps({
  pedido: {
    type: Object,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-expand', 'enviar', 'finalizar', 'anular', 'open-comprobante', 'editar']);

const estadoNombre = computed(() => {
  switch (props.pedido.estado) {
    case 0: return 'Anulado';
    case 1: return 'Pendiente';
    case 2: return 'Enviado';
    case 3: return 'Finalizado';
    default: return 'Desconocido';
  }
});

const clienteNombre = computed(() => {
  const p = props.pedido.Persona || props.pedido.persona;
  if (!p) return 'S/N';
  return `${p.Nombre || ''} ${p.ApellidoPaterno || ''} ${p.ApellidoMaterno || ''}`.trim();
});

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'N/A';
  try {
    // Si viene en formato YYYY-MM-DD o similar, evitamos el desfase de zona horaria
    // dividiendo la cadena y tratando los componentes localmente.
    const parts = fechaStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    
    // Fallback por si el formato es distinto
    const date = new Date(fechaStr);
    if (isNaN(date.getTime())) return fechaStr;
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // A veces forzar UTC ayuda si la base de datos envía solo fecha
    });
  } catch (e) {
    return fechaStr;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
