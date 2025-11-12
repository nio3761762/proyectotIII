<template>
  <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6">
      <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
        <Package class="h-5 w-5 text-green-600" />
        Agregar Productos
      </h3>
    </div>
    <div class="p-6 space-y-4">
      <div class="flex gap-4">
          <div>
              <input type="radio" id="producto" value="producto" :checked="selectionType === 'producto'" @change="$emit('update:selectionType', 'producto')" />
              <label for="producto"> Producto</label>
          </div>
          <div>
              <input type="radio" id="paquete" value="paquete" :checked="selectionType === 'paquete'" @change="$emit('update:selectionType', 'paquete')" />
              <label for="paquete"> Paquete</label>
          </div>
      </div>

      <div v-if="selectionType === 'paquete'">
        <label class="flex items-center text-gray-700 font-semibold mb-2">
          <Package class="h-4 w-4 mr-2 text-gray-500" /> Paquete:
        </label>
        <Combobox :modelValue="selectedPaquete" @update:modelValue="$emit('update:selectedPaquete', $event)">
          <div class="relative mt-1">
           <div class="relative w-full cursor-default rounded-lg text-left shadow-md focus:outline-none sm:text-sm">
                <ComboboxInput class="w-full pl-4 pr-4 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300
     text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30" :displayValue="(paquete) => paquete?.Nombre || ''" @change="$emit('update:queryPaquete', $event.target.value)" />
      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon class="h-5 w-5 text-green-500" aria-hidden="true" />
              </ComboboxButton>
            </div>
            <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="$emit('update:queryPaquete', '')">
              <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                <div v-if="filteredPaquetes.length === 0 && queryPaquete !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                  No se encontraron resultados.
                </div>
                <ComboboxOption v-for="p in filteredPaquetes" :key="p.IdPaquete" :value="p" v-slot="{ selected, active }">
                  <li :class="[active ? 'bg-green-500 text-white' : 'text-gray-700', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ p.Nombre }} {{ p.PrecioVenta }}</span>
                    <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500"><CheckIcon class="h-5 w-5" aria-hidden="true" /></span>
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
            </TransitionRoot>
          </div>
        </Combobox>
        <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <Hash class="h-4 w-4 mr-2 text-gray-500" /> Cantidad
              </label>
              <input
                :value="paqueteForm.Cantidad"
                @input="$emit('update:paqueteForm', { ...paqueteForm, Cantidad: Number($event.target.value) })"
                type="number"
                min="1"
                class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30"
              />
            </div>
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <DollarSign class="h-4 w-4 mr-2 text-gray-500" /> Precio Venta
              </label>
              <input
                :value="paqueteForm.PrecioVenta"
                @input="$emit('update:paqueteForm', { ...paqueteForm, PrecioVenta: Number($event.target.value) })"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-grenn-500/20 focus:border-green-500/30"
              />
            </div>
          </div>
        <button
          type="button"
          @click="$emit('add-paquete-to-promotion')"
         class="mt-5 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-4 py-3 shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus class="h-4 w-4" />
          {{ editingProductIndex !== null ? 'Actualizar Paquete' : 'Agregar Paquete' }}
        </button>

        <button
          v-if="editingProductIndex !== null"
          type="button"
          @click="$emit('cancel-edit-item')"
          class="w-full border border-gray-200 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-colors flex items-center justify-center gap-2 mt-2"
        >
          <X class="h-4 w-4" />
          Cancelar Edición
        </button>
      </div>

      <div v-if="selectionType === 'producto'">
         <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Package class="h-4 w-4 mr-2 text-gray-500" /> Producto:
            </label>
            <Combobox :modelValue="productForm.Producto" @update:modelValue="$emit('update:productForm', { ...productForm, Producto: $event })">
              <div class="relative mt-1">
                <div class="relative w-full cursor-default rounded-lg text-left shadow-md focus:outline-none sm:text-sm">
                <ComboboxInput class="w-full pl-4 pr-4 py-4 border-0 bg-gray-50/80 rounded-2xl transition-all duration-300
     text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30" :displayValue="(producto) => producto?.Nombre || ''" @change="$emit('update:queryProducto', $event.target.value)" />
  <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon class="h-5 w-5 text-green-500" aria-hidden="true" />
                  </ComboboxButton>
                </div>
                <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="$emit('update:queryProducto', '')">
                  <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    <div v-if="filteredProductos.length === 0 && queryProducto !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                      No se encontraron resultados.
                    </div>
                    <ComboboxOption v-for="producto in filteredProductos" :key="producto.IdProducto" :value="producto" v-slot="{ selected, active }">
                      <li :class="[active ? 'bg-green-500 text-white' : 'text-gray-700', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ producto.Nombre }} {{ pp[producto.IdProducto]?.Precio }}</span>
                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500"><CheckIcon class="h-5 w-5" aria-hidden="true" /></span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <Hash class="h-4 w-4 mr-2 text-gray-500" /> Cantidad
              </label>
              <input
                :value="productForm.Cantidad"
                @input="$emit('update:productForm', { ...productForm, Cantidad: Number($event.target.value) })"
                type="number"
                min="1"
                class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30"
              />
            </div>
            <div>
              <label class="flex items-center text-gray-700 font-semibold mb-2">
                <DollarSign class="h-4 w-4 mr-2 text-gray-500" /> Precio Venta
              </label>
              <input
                :value="productForm.PrecioVenta"
                @input="$emit('update:productForm', { ...productForm, PrecioVenta: Number($event.target.value) })"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30"
              />
            </div>
          </div>

          <button
            type="button"
            @click="$emit('add-product')"
            class="mt-5 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-4 py-3 shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus class="h-4 w-4" />
            {{ editingProductIndex !== null ? 'Actualizar Producto' : 'Agregar Producto' }}
          </button>

          <button
            v-if="editingProductIndex !== null"
            type="button"
            @click="$emit('cancel-edit-item')"
            class="w-full border border-gray-200 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-colors flex items-center justify-center gap-2"
          >
            <X class="h-4 w-4" />
            Cancelar Edición
          </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Package, Plus, X, Hash, DollarSign
} from 'lucide-vue-next';
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

defineProps({
  selectionType: String,
  selectedPaquete: Object,
  queryPaquete: String,
  filteredPaquetes: Array,
  paqueteForm: Object,
  editingProductIndex: [Number, null],
  productForm: Object,
  queryProducto: String,
  filteredProductos: Array,
  pp: Object,
});
defineEmits([
  'update:selectionType',
  'update:selectedPaquete',
  'update:queryPaquete',
  'update:paqueteForm',
  'add-paquete-to-promotion',
  'cancel-edit-item',
  'update:productForm',
  'update:queryProducto',
  'add-product',
]);
</script>