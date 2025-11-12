<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden animate-fade-in">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <DollarSign class="h-6 w-6" />
            <h2 class="text-xl font-bold">
              {{ esNuevaComision ? 'Registrar' : 'Actualizar' }} Comision
            </h2>
          </div>
          <button @click="$emit('cerrar-modal')" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="p-6 space-y-6">
        <div class="space-y-2">
          <label class="block text-[#cc2a02] text-sm font-bold mb-2">Producto:</label>
          <Combobox v-model="comision.Producto" @update:modelValue="errors.producto = validateField('producto', comision.Producto)">
            <div class="relative mt-1">
              <div :class="['relative w-full cursor-default bg-white pl-3 pr-10 text-left shadow-md border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-2xl px-4 py-3 outline-none transition-colors', { 'ring-2 ring-red-500/20 bg-red-50': errors.producto }]">
                <ComboboxInput placeholder="Selecciona un producto" class="w-full border-none outline-none ring-0 focus:outline-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0" :displayValue="(producto) => producto ? producto.Nombre : ''" @change="queryProducto = $event.target.value" />
                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon class="h-5 w-5 text-[#f66019]" aria-hidden="true" />
                </ComboboxButton>
              </div>
              <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryProducto = ''">
                <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  <div v-if="filteredProductos.length === 0 && queryProducto !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                    No se encontraron resultados.
                  </div>
                  <ComboboxOption v-for="producto in filteredProductos" :key="producto.IdProducto" :value="producto" v-slot="{ selected, active }">
                    <li :class="[active ? 'bg-[#f66019] text-white' : 'text-[#460c04]', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                      <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ producto.Nombre }} {{ pp[producto.IdProducto]?.Precio }}</span>
                      <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#f66019]"><CheckIcon class="h-5 w-5" aria-hidden="true" /></span>
                    </li>
                  </ComboboxOption>
                </ComboboxOptions>
              </TransitionRoot>
            </div>
          </Combobox>
          <p v-if="errors.producto" class="text-red-500 text-xs italic mt-1">{{ errors.producto }}</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calculator class="h-4 w-4 text-orange-500" />
            Cantidad
          </label>
          <input v-model="comision.Cantidad" type="number" step="1" min="1" placeholder="Ej: 1, 2, 3..." @input="errors.cantidad = validateField('cantidad', comision.Cantidad)" @blur="errors.cantidad = validateField('cantidad', comision.Cantidad)" :class="['w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400', { 'ring-2 ring-red-500/20 bg-red-50': errors.cantidad }]" required />
        </div>
        <p v-if="errors.cantidad" class="text-red-500 text-xs italic mt-1">{{ errors.cantidad }}</p>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calculator class="h-4 w-4 text-orange-500" />
            Monto de la Comisión
          </label>
          <input v-model="comision.Monto" type="number" step="0.01" placeholder="Ej: 10.00" @input="errors.monto = validateField('monto', comision.Monto)" @blur="errors.monto = validateField('monto', comision.Monto)" :class="['w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400', { 'ring-2 ring-red-500/20 bg-red-50': errors.monto }]" required />
        </div>
        <p v-if="errors.monto" class="text-red-500 text-xs italic mt-1">{{ errors.monto }}</p>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calculator class="h-4 w-4 text-orange-500" />
            Porcentaje de la Comisión
          </label>
          <input v-model="porcentajeCalculado" type="number" disabled class="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400" />
        </div>

        <div class="bg-gray-50/80 backdrop-blur-sm p-6 -m-6 mt-6 flex gap-3">
          <button type="button" @click="guardar" class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2">
            <Save class="h-5 w-5" />
            {{ esNuevaComision ? 'Registrar' : 'Actualizar' }} Comision
          </button>
          <button type="button" @click="$emit('cerrar-modal')" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { DollarSign, X, Save, Calculator } from 'lucide-vue-next';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, TransitionRoot } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const props = defineProps({
  comisionEditada: {
    type: Object,
    required: true
  },
  esNuevaComision: {
    type: Boolean,
    default: true
  },
  productos: {
    type: Array,
    required: true
  },
  pp: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['guardar-comision', 'cerrar-modal']);

const comision = ref(JSON.parse(JSON.stringify(props.comisionEditada)));
const queryProducto = ref('');

const errors = reactive({
  producto: '',
  cantidad: '',
  monto: ''
});

watch(() => props.comisionEditada, (newVal) => {
  comision.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true, immediate: true });

const filteredProductos = computed(() =>
  queryProducto.value === ''
    ? props.productos
    : props.productos.filter((producto) =>
        producto.Nombre.toLowerCase()
          .replace(/\s+/g, '')
          .includes(queryProducto.value.toLowerCase().replace(/\s+/g, ''))
      )
);

const porcentajeCalculado = computed(() => {
  if (comision.value.Producto && comision.value.Cantidad && comision.value.Monto) {
    const precio = props.pp[comision.value.Producto.IdProducto]?.Precio;
    if (precio) {
      return (comision.value.Monto / (comision.value.Cantidad * precio)) * 100;
    }
  }
  return 0;
});

const validateField = (field, value) => {
  let error = '';
  switch (field) {
    case 'producto':
      if (!value) error = 'El producto es requerido.';
      break;
    case 'cantidad':
      if (value === null || value === undefined || String(value).trim() === '') error = 'La cantidad es requerida.';
      else if (isNaN(value) || value <= 0) error = 'La cantidad debe ser un número positivo mayor a cero.';
      break;
    case 'monto':
      if (value === null || value === undefined || String(value).trim() === '') error = 'El monto es requerido.';
      else if (isNaN(value) || value <= 0) error = 'El monto debe ser un número positivo mayor a cero.';
      break;
  }
  return error;
};

const validateForm = () => {
  errors.producto = validateField('producto', comision.value.Producto);
  errors.cantidad = validateField('cantidad', comision.value.Cantidad);
  errors.monto = validateField('monto', comision.value.Monto);
  return Object.values(errors).every(error => !error);
};

const guardar = () => {
  if (validateForm()) {
    const dataToSave = {
      ...comision.value,
      Porcentaje: porcentajeCalculado.value
    };
    emit('guardar-comision', dataToSave);
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
