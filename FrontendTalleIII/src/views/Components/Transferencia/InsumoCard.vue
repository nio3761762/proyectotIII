<template>
  <div class="group relative bg-white rounded-3xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col gap-4">
    <!-- Image -->
    <div class="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
      <img 
        v-if="insumo.Imagen" 
        :src="insumo.Imagen" 
        :alt="insumo.Nombre" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <FlaskConical class="h-12 w-12 text-gray-300" />
      </div>
      
      <!-- Stock Badge -->
      <div class="absolute top-2 right-2">
        <div :class="[
          'px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg flex flex-col items-end leading-none gap-0.5',
          stockGramos > 0 ? 'bg-white/95 text-orange-600' : 'bg-red-500 text-white'
        ]">
          <span class="flex items-center gap-1">
             <Database class="h-2.5 w-3" />
             {{ stockEnMedida }} {{ medidaSeleccionada?.abreviatura || 'unid' }}
          </span>
          <span class="text-[8px] opacity-60 font-bold border-t border-gray-100 pt-0.5 mt-0.5">
            {{ stockGramos.toFixed(0) }} g base
          </span>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="flex flex-col gap-1 px-1">
      <h3 class="font-black text-gray-800 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
        {{ insumo.Nombre }}
      </h3>
      <div class="flex items-center justify-between">
        <p class="text-[10px] text-gray-500 font-bold flex items-center gap-1 italic">
          <Tag class="h-2.5 w-2.5 text-orange-400" />
          {{ insumo.UnidadNombre || 'Insumo' }}
        </p>
        <span v-if="medidas.length > 0" class="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-lg font-bold">
          {{ medidas.length }} pres.
        </span>
      </div>
    </div>

    <!-- Measures Selector / List -->
    <div v-if="loadingMedidas" class="flex justify-center py-2">
      <div class="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
    </div>
    <div v-else-if="medidas.length > 0" class="space-y-2">
      <template v-if="!readonly">
        <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Seleccionar Medida</label>
        <select 
          v-model="medidaSeleccionada"
          class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        >
          <option v-for="m in medidas" :key="m.idinsumomedida" :value="m">
            {{ m.cantidadmedida }} {{ m.unidad_nombre }} ({{ m.abreviatura }})
          </option>
        </select>
      </template>
      <template v-else>
        <div class="space-y-1">
          <div 
            v-for="m in medidas" 
            :key="m.idinsumomedida"
            class="flex justify-between items-center text-[11px] p-2 rounded-xl bg-orange-50/50 border border-orange-100/50"
          >
            <span class="text-gray-700 font-medium">
              {{ m.cantidadmedida }} {{ m.unidad_nombre }}
            </span>
            <span class="font-black text-orange-600">
              {{ calcularStockEnMedida(m) }} uni
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- Calculated Stock Info (Only in Edit Mode) -->
    <div v-if="!readonly && medidaSeleccionada" class="bg-orange-50 rounded-xl p-2 flex justify-between items-center">
      <span class="text-[10px] font-bold text-orange-600 uppercase">Stock Disp.</span>
      <span class="text-xs font-black text-orange-700">
        {{ stockEnMedida }} {{ medidaSeleccionada.unidad_nombre }}
      </span>
    </div>

    <!-- Quantity Selector and Add Button (Only in Edit Mode) -->
    <div v-if="!readonly" class="flex flex-col gap-3 mt-auto">
      <div class="flex items-center justify-between gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
        <button 
          @click="decrementar"
          class="w-8 h-8 rounded-xl bg-white text-gray-600 shadow-sm hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-center disabled:opacity-50"
          :disabled="cantidad <= 1"
        >
          <Minus class="h-4 w-4" />
        </button>
        <div class="flex-1 flex flex-col items-center">
          <input 
            type="number" 
            v-model.number="cantidad" 
            class="w-full bg-transparent border-none text-center font-bold text-gray-800 focus:ring-0 p-0 text-sm"
            min="1"
            :max="stockEnMedida"
          />
          <button 
            @click="cantidad = stockEnMedida" 
            class="text-[9px] font-black text-orange-500 hover:text-orange-700 uppercase tracking-tighter"
            v-if="stockEnMedida > 0"
          >
            Máximo
          </button>
        </div>
        <button 
          @click="incrementar"
          class="w-8 h-8 rounded-xl bg-white text-gray-600 shadow-sm hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-center disabled:opacity-50"
          :disabled="cantidad >= stockEnMedida"
        >
          <Plus class="h-4 w-4" />
        </button>
      </div>

      <button 
        @click="seleccionar"
        :disabled="stockEnMedida < 1 || !medidaSeleccionada"
        class="w-full py-3 rounded-2xl bg-linear-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:grayscale disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
      >
        <PlusCircle class="h-5 w-5" />
        Agregar
      </button>
    </div>

    <!-- Readonly Footer -->
    <div v-else class="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center">
       <span class="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Vista de Existencias</span>
       <div class="p-1 bg-orange-50 rounded-lg text-orange-500">
         <Info class="h-3.5 w-3.5" />
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { FlaskConical, Database, Tag, Plus, Minus, PlusCircle, ChevronDown, Info } from 'lucide-vue-next';
import { listarInsumoConMedidas } from '@/Server/Insumo';

const props = defineProps({
  insumo: {
    type: Object,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select']);

const cantidad = ref(1);
const medidas = ref([]);
const medidaSeleccionada = ref(null);
const loadingMedidas = ref(false);

const stockGramos = computed(() => parseFloat(props.insumo.StockGramos || 0));

const calcularStockEnMedida = (medida) => {
  if (!medida) return 0;
  const factor = parseFloat(medida.cantidad || 1);
  const cantidadmedida =   parseFloat(medida.cantidadmedida || 1);
  return Math.floor(stockGramos.value / (factor * cantidadmedida));
};

const stockEnMedida = computed(() => calcularStockEnMedida(medidaSeleccionada.value));

const fetchMedidas = async () => {
  loadingMedidas.value = true;
  try {
    const res = await listarInsumoConMedidas(props.insumo.IdInsumo);
    medidas.value = res || [];
    if (medidas.value.length > 0) {
      // Intentar pre-seleccionar la medida que coincida con la que devolvió getInsumosSucursal si existe
      const pre = medidas.value.find(m => m.unidad_nombre === props.insumo.UnidadNombre);
      medidaSeleccionada.value = pre || medidas.value[0];
    }
  } catch (error) {
    console.error('Error fetching measures for insumo:', error);
  } finally {
    loadingMedidas.value = false;
  }
};

const incrementar = () => {
  if (cantidad.value < stockEnMedida.value) {
    cantidad.value++;
  }
};

const decrementar = () => {
  if (cantidad.value > 1) {
    cantidad.value--;
  }
};

const seleccionar = () => {
  if (cantidad.value > 0 && cantidad.value <= stockEnMedida.value && medidaSeleccionada.value) {
    emit('select', {
      ...props.insumo,
      medida: medidaSeleccionada.value,
      cantidad: cantidad.value
    });
    cantidad.value = 1; // Reset
  }
};

onMounted(fetchMedidas);

// Watch for changes in stock (if updated externally)
watch(() => props.insumo.StockGramos, () => {
  if (cantidad.value > stockEnMedida.value) {
    cantidad.value = Math.max(1, stockEnMedida.value);
  }
});
</script>
