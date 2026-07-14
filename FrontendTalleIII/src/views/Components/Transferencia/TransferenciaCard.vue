<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 group">
    <div class="flex flex-col gap-4">
      <!-- Header: ID and Status -->
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div :class="[
            'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg',
            transferencia.estado === 1 ? 'bg-linear-to-br from-green-500 to-emerald-600' : 'bg-linear-to-br from-red-500 to-rose-600'
          ]">
            <ArrowRightLeft class="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors">
              {{ transferencia.idtransferencia }}
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <Calendar class="h-4 w-4" />
              <span>{{ formatDate(transferencia.fecha) }}</span>
              <Clock class="h-4 w-4 ml-1" />
              <span>{{ transferencia.hora }}</span>
            </div>
          </div>
        </div>
        <div :class="[
          'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
          transferencia.estado === 1 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        ]">
          {{ transferencia.estado === 1 ? 'Activo' : 'Anulado' }}
        </div>
      </div>

      <!-- Type and Origin/Destination -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-gray-100">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-gray-400 uppercase">Origen</span>
          <div class="flex items-center gap-2 text-gray-700">
            <Home class="h-4 w-4 text-orange-500" />
            <span class="font-medium">{{ transferencia.SucursalOrigen?.Nombre || 'N/A' }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-gray-400 uppercase">Destino</span>
          <div v-if="transferencia.tipo === 'SUCURSAL'" class="flex items-center gap-2 text-gray-700">
            <Building2 class="h-4 w-4 text-blue-500" />
            <span class="font-medium">{{ transferencia.SucursalDestino?.Nombre || 'N/A' }}</span>
          </div>
          <div v-else class="flex items-center gap-2 text-gray-700">
            <User class="h-4 w-4 text-purple-500" />
            <span class="font-medium">
              {{ transferencia.EmpleadoDestino?.Persona?.Nombre }} {{ transferencia.EmpleadoDestino?.Persona?.ApellidoPaterno }}
            </span>
          </div>
        </div>
      </div>

      <!-- Items Summary -->
      <div class="flex flex-wrap gap-2">
        <div v-for="(item, index) in limitedDetalles" :key="index" 
          class="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 flex items-center gap-2">
          <Package v-if="item.Producto" class="h-3 w-3 text-orange-400" />
          <FlaskConical v-else class="h-3 w-3 text-blue-400" />
          <span class="text-xs font-medium text-gray-600">
            {{ item.Cantidad }} x {{ item.Producto?.Nombre || item.Insumo?.Nombre }}
          </span>
        </div>
        <div v-if="transferencia.Detalletransferencia?.length > 3" 
          class="bg-orange-50 border border-orange-100 rounded-xl px-3 py-1 flex items-center">
          <span class="text-xs font-bold text-orange-600">+{{ transferencia.Detalletransferencia.length - 3 }} más</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2 mt-2">
        <button 
          @click="$emit('view', transferencia)"
          class="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
          title="Ver Detalles"
        >
          <Eye class="h-5 w-5" />
        </button>
        <button 
          v-if="puedeAnular"
          @click="$emit('anular', transferencia)"
          class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          title="Anular Transferencia"
        >
          <Trash2 class="h-5 w-5" />
        </button>
        <div v-else-if="transferencia.estado === 1" class="p-2 text-gray-300 cursor-not-allowed" title="Tiempo de anulación expirado">
          <Trash2 class="h-5 w-5 opacity-40" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { 
  ArrowRightLeft, Calendar, Clock, Package, 
  Home, Building2, User, Eye, Trash2, FlaskConical 
} from 'lucide-vue-next';

const props = defineProps({
  transferencia: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view', 'anular']);

// Reloj interno para actualizar la visibilidad del botón en tiempo real
const now = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 30000); // Actualizar cada 30 segundos
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const puedeAnular = computed(() => {
  if (props.transferencia.estado !== 1) return false;
  
  try {
    // Combinar fecha (YYYY-MM-DD) y hora (HH:mm:ss)
    const fechaTransferencia = new Date(`${props.transferencia.fecha}T${props.transferencia.hora}`);
    const diferenciaMs = now.value - fechaTransferencia;
    const diferenciaMinutos = diferenciaMs / (1000 * 60);
    
    // Solo permitir si han pasado menos de 10 minutos
    return diferenciaMinutos >= 0 && diferenciaMinutos <= 10;
  } catch (e) {
    console.error("Error al calcular tiempo de anulación:", e);
    return false;
  }
});

const limitedDetalles = computed(() => {
  return props.transferencia.Detalletransferencia?.slice(0, 3) || [];
});

const formatDate = (dateString) => {
  try {
    // Si ya viene formateada (ej: DD/MM/YYYY), la devolvemos tal cual
    if (dateString.includes('/')) return dateString;

    const date = new Date(dateString);
    // Formato latinoamericano: DD/MM/YYYY
    return new Intl.DateTimeFormat('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  } catch (e) {
    return dateString;
  }
};
</script>
