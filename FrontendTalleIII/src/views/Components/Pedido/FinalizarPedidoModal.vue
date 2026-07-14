<template>
  <div v-if="show" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="bg-linear-to-r from-green-500 to-emerald-600 p-6 text-white shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg"><CheckCircle class="h-6 w-6" /></div>
            <div>
              <h2 class="text-xl font-bold">Finalizar y Devolución</h2>
              <p class="text-green-100 text-sm">Pedido #{{ pedido?.idpedido }}</p>
            </div>
          </div>
          <button @click="$emit('cancel')" class="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Devolución Section -->
        <div> 
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package class="h-5 w-5 text-orange-500" />
            Productos para Devolución
          </h3>
          <div class="space-y-3">
            <div v-for="item in itemsDevolucion" :key="item.IdDetallePedido" 
                 class="p-4 rounded-2xl border transition-all"
                 :class="item.devolucion ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100 bg-gray-50/30'">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <input type="checkbox" v-model="item.devolucion" 
                         class="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                  <div class="min-w-0">
                    <p class="font-bold text-gray-800 truncate">
                      {{ item.Productomedida?.Producto?.Nombre || item.Producto?.Nombre || item.Promocion?.Nombre }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Entregado: {{ item.Cantidad }} | Precio: Bs. {{ item.Precio }}
                    </p>
                  </div>
                </div>
                
                <div v-if="item.devolucion" class="flex items-center gap-2 shrink-0 animate-fade-in">
                  <span class="text-xs font-semibold text-gray-600">Devolver:</span>
                  <input v-model.number="item.cantidadDevolver" type="number" 
                         :max="item.Cantidad" min="1"
                         class="w-20 px-3 py-1 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-center font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comentario de Devolución -->
        <div v-if="tieneDevolucion" class="animate-fade-in space-y-2">
          <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
            <MessageSquare class="h-4 w-4 text-orange-500" />
            Motivo de Devolución
          </label>
          <textarea v-model="comentarioDevolucion" 
                    rows="2"
                    placeholder="Explica brevemente el motivo de la devolución..."
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"></textarea>
        </div>

        <!-- Resumen Financiero -->
        <div class="bg-gray-50 rounded-3xl p-6 space-y-4">
          <div class="flex justify-between items-center text-gray-600">
            <span>Subtotal Original:</span>
            <span class="font-bold">Bs. {{ pedido?.total }}</span>
          </div>
          <div v-if="totalDevolucion > 0" class="flex justify-between items-center text-orange-600">
            <span>Descuento por Devolución:</span>
            <span class="font-bold">- Bs. {{ totalDevolucion }}</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-gray-200">
            <span class="text-lg font-bold text-gray-800">Nuevo Total:</span>
            <span class="text-2xl font-black text-green-600">Bs. {{ nuevoTotal }}</span>
          </div>
          <div class="flex justify-between items-center text-blue-600">
            <span>Adelanto pagado:</span>
            <span class="font-bold">Bs. {{ pedido?.adelanto }}</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-red-50 rounded-2xl">
            <span class="text-red-800 font-bold text-lg">Saldo a Pagar:</span>
            <span class="text-3xl font-black text-red-600">Bs. {{ saldoPendiente }}</span>
          </div>
        </div>

        <!-- Pago Section -->
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700">Monto Recibido</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Bs.</span>
              <input v-model.number="montoRecibido" type="number" 
                     class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-xl font-bold" 
                     placeholder="0.00" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700">Método de Pago</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
               <button 
                v-for="m in metodosPago" :key="m.IdMetodoPago"
                @click="metodoPagoId = m.IdMetodoPago"
                type="button"
                :class="['py-3 rounded-xl border-2 transition-all font-bold text-sm flex flex-col items-center justify-center gap-1', 
                         metodoPagoId === m.IdMetodoPago ? 'border-green-500 bg-green-50 text-green-600 shadow-sm' : 'border-gray-100 text-gray-400 hover:bg-gray-50']"
              >
                {{ m.Nombre }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 bg-gray-50 shrink-0 flex gap-3">
        <button @click="$emit('cancel')" 
                class="flex-1 px-4 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors">
          Cancelar
        </button>
        <button @click="confirmar" 
                :disabled="montoRecibido < saldoPendiente || guardando"
                class="flex-2 px-6 py-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          <span v-if="guardando" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <CheckCircle v-else class="h-5 w-5" />
          Finalizar y Registrar Venta
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { CheckCircle, X, Package, MessageSquare, DollarSign } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  pedido: Object,
  metodosPago: Array,
  guardando: Boolean
});

const emit = defineEmits(['cancel', 'confirm']);

const itemsDevolucion = ref([]);
const comentarioDevolucion = ref('');
const montoRecibido = ref(0);
const metodoPagoId = ref(1);

const initItems = () => {
  if (!props.pedido?.Detallepedido) return;
  itemsDevolucion.value = props.pedido.Detallepedido.map(item => ({
    ...item,
    devolucion: false,
    cantidadDevolver: 1
  }));
  montoRecibido.value = saldoPendiente.value;
};

watch(() => props.pedido, initItems, { immediate: true });

const tieneDevolucion = computed(() => itemsDevolucion.value.some(i => i.devolucion));

const totalDevolucion = computed(() => {
  return itemsDevolucion.value.reduce((total, item) => {
    if (item.devolucion) {
      return total + (item.cantidadDevolver * parseFloat(item.Precio));
    }
    return total;
  }, 0);
});

const nuevoTotal = computed(() => {
  const totalOrig = parseFloat(props.pedido?.total || 0);
  return Math.max(0, totalOrig - totalDevolucion.value);
});

const saldoPendiente = computed(() => {
  const adelanto = parseFloat(props.pedido?.adelanto || 0);
  return Math.max(0, nuevoTotal.value - adelanto);
});

// Update montoRecibido when saldoPendiente changes
watch(saldoPendiente, (newSaldo) => {
  montoRecibido.value = newSaldo;
});

const confirmar = () => {
  const data = {
    pago: {
      Monto: montoRecibido.value,
      Cambio: Math.max(0, montoRecibido.value - saldoPendiente.value),
      IdMetodoPago: metodoPagoId.value
    },
    devoluciones: itemsDevolucion.value
      .filter(i => i.devolucion)
      .map(i => ({
        IdDetallePedido: i.IdDetallePedido,
        Cantidad: i.cantidadDevolver,
        Precio: i.Precio
      })),
    comentario: comentarioDevolucion.value
  };
  
  emit('confirm', props.pedido.idpedido, data);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
