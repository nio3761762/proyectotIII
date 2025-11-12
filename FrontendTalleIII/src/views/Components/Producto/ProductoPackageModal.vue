<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
      
      <!-- Encabezado -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Package class="h-8 w-8" />
           <div>
            <h2 class="text-xl font-bold"> Administrar Presentaciones  </h2>
            <p class="text-sm text-blue-200">{{ productoParaPaquetes?.Producto?.Nombre }}</p>
           </div>
          </div>
          <button
            @click="$emit('cancelar-edicion-paquete'); $emit('close');"
            class="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Contenido con scroll -->
      <div class="p-6 overflow-y-auto flex-grow bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Columna del Formulario -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-green-800">
              {{ paqueteEnEdicionIndex === null ? 'Nueva Presentación' : 'Editando Presentación' }}
            </h3>

            <!-- Presentación -->
            <div>
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Package class="h-4 w-4 text-gray-500" />
                Presentación <span class="text-red-500">(*)</span>
              </label>
              <select :value="nuevoPaquete.IdPresentacion" 
                @change="$emit('update:nuevoPaquete', { ...nuevoPaquete, IdPresentacion: $event.target.value }); $emit('validate-paquete-field', 'presentacion', $event.target.value)"
                @blur="$emit('validate-paquete-field', 'presentacion', $event.target.value)"
                :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', { 'border-red-400 ring-1 ring-red-400': paqueteErrors.presentacion }]"
              >
                <option value="" disabled>Selecciona una Presentación</option>
                <option v-for="p in presentacion" :key="p.IdPresentacion" :value="p.IdPresentacion">
                  {{ p.Nombre }}
                </option>
              </select>
              <p v-if="paqueteErrors.presentacion" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ paqueteErrors.presentacion }}
              </p>
            </div>

            <!-- Nombre del Paquete -->
            <div>
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Type class="h-4 w-4 text-gray-500" />
                Nombre del Paquete <span class="text-red-500">(*)</span>
              </label>
              <input :value="nuevoPaquete.Nombre" type="text" placeholder="Ej: Caja de 12 unidades" 
                @input="$emit('update:nuevoPaquete', { ...nuevoPaquete, Nombre: $event.target.value }); $emit('validate-paquete-field', 'nombre', $event.target.value)"
                @blur="$emit('validate-paquete-field', 'nombre', $event.target.value)"
                :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', { 'border-red-400 ring-1 ring-red-400': paqueteErrors.nombre }]"/>
              <p v-if="paqueteErrors.nombre" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ paqueteErrors.nombre }}
              </p>
            </div>

            <!-- Categoría y Unidad Medida -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Ruler class="h-4 w-4 text-gray-500" />
                  Categoría Medida <span class="text-red-500">(*)</span>
              </label>
                <select :value="selectedCategoriaMedidaPaquete" 
                  @change="$emit('update:selectedCategoriaMedidaPaquete', $event.target.value); $emit('validate-paquete-field', 'categoriaMedida', $event.target.value)"
                  @blur="$emit('validate-paquete-field', 'categoriaMedida', $event.target.value)"
                  :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', { 'border-red-400 ring-1 ring-red-400': paqueteErrors.categoriaMedida }]"
                >
                  <option value="" disabled>Seleccione</option>
                  <option v-for="cat in categoriaMedidas" :key="cat.IdCategoriaMedida" :value="cat.IdCategoriaMedida">
                    {{ cat.Nombre }}
                  </option>
                </select>
                <p v-if="paqueteErrors.categoriaMedida" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ paqueteErrors.categoriaMedida }}
                </p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Ruler class="h-4 w-4 text-gray-500" />
                  Unidad Medida <span class="text-red-500">(*)</span>
              </label>
                <select :value="nuevoPaquete.IdUnidadMedida" :disabled="!selectedCategoriaMedidaPaquete" 
                  @change="$emit('update:nuevoPaquete', { ...nuevoPaquete, IdUnidadMedida: $event.target.value }); $emit('validate-paquete-field', 'unidadMedida', $event.target.value)"
                  @blur="$emit('validate-paquete-field', 'unidadMedida', $event.target.value)"
                  :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:bg-gray-100', { 'border-red-400 ring-1 ring-red-400': paqueteErrors.unidadMedida }]"
                >
                  <option value="" disabled>Seleccione</option>
                  <option v-for="medida in medidasPaquete" :key="medida.IdUnidadMedida" :value="medida.IdUnidadMedida">
                    {{ medida.Nombre }}
                  </option>
                </select>
                <p v-if="paqueteErrors.unidadMedida" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ paqueteErrors.unidadMedida }}
                </p>
              </div>
            </div>

            <!-- Cantidad -->
            <div>
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Hash class="h-4 w-4 text-gray-500" />
                Cantidad <span class="text-red-500">(*)</span>
              </label>
              <input :value="nuevoPaquete.Cantidad" type="number" min="1" placeholder="1" 
                @input="$emit('update:nuevoPaquete', { ...nuevoPaquete, Cantidad: Number($event.target.value) }); $emit('validate-paquete-field', 'cantidad', $event.target.value)"
                @blur="$emit('validate-paquete-field', 'cantidad', $event.target.value)"
                :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', { 'border-red-400 ring-1 ring-red-400': paqueteErrors.cantidad }]"/>
              <p v-if="paqueteErrors.cantidad" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ paqueteErrors.cantidad }}
              </p>
            </div>

            <!-- Stock Mínimo -->
            <div>
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Hash class="h-4 w-4 text-gray-500" />
                Stock Mínimo <span class="text-red-500">(*)</span>
              </label>
              <input :value="nuevoPaquete.StockMinimo" type="number" min="0" placeholder="0" 
                @input="$emit('update:nuevoPaquete', { ...nuevoPaquete, StockMinimo: Number($event.target.value) }); $emit('validate-paquete-field', 'stockMinimo', $event.target.value)"
                @blur="$emit('validate-paquete-field', 'stockMinimo', $event.target.value)"
                :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', { 'border-red-400 ring-1 ring-red-400': paqueteErrors.stockMinimo }]"/>
              <p v-if="paqueteErrors.stockMinimo" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" />
                {{ paqueteErrors.stockMinimo }}
              </p>
            </div>

            <!-- Precios -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <DollarSign class="h-4 w-4 text-gray-500" />
                  Precio de Venta <span class="text-red-500">(*)</span>
              </label>
                <input :value="nuevoPaquete.PrecioVenta" type="number" step="0.01" min="0" placeholder="0.00" 
                  @input="$emit('update:nuevoPaquete', { ...nuevoPaquete, PrecioVenta: Number($event.target.value) }); $emit('validate-paquete-field', 'precioVenta', $event.target.value)"
                  @blur="$emit('validate-paquete-field', 'precioVenta', $event.target.value)"
                  :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', { 'border-red-400 ring-1 ring-red-400': paqueteErrors.precioVenta }]"/>
                <p v-if="paqueteErrors.precioVenta" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ paqueteErrors.precioVenta }}
                </p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <DollarSign class="h-4 w-4 text-gray-500" />
                  Precio por Mayor <span class="text-red-500">(*)</span>
              </label>
                <input :value="nuevoPaquete.PrecioMayor" type="number" step="0.01" min="0" placeholder="0.00" 
                  @input="$emit('update:nuevoPaquete', { ...nuevoPaquete, PrecioMayor: Number($event.target.value) }); $emit('validate-paquete-field', 'precioMayor', $event.target.value)"
                  @blur="$emit('validate-paquete-field', 'precioMayor', $event.target.value)"
                  :class="['w-full px-4 py-3 border bg-white rounded-xl transition-all duration-300 text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500', { 'border-red-400 ring-1 ring-red-400': paqueteErrors.precioMayor }]"/>
                <p v-if="paqueteErrors.precioMayor" class="text-red-500 text-xs italic mt-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" />
                  {{ paqueteErrors.precioMayor }}
                </p>
              </div>
            </div>

            <!-- Imagen -->
            <div>
              <label class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <ImageIcon class="h-4 w-4 text-gray-500" />
                Imagen de la Presentación
              </label>
              <input type="file" accept="image/*" @change="$emit('handle-archivo-paquete', $event)" 
                class="w-full pl-12 pr-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl 
                       transition-all duration-300 text-gray-700 placeholder:text-gray-400 
                       outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 
                       file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm 
                       file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
              <div v-if="previewPaqueteUrl" class="mt-4 flex justify-center">
                <img :src="previewPaqueteUrl" alt="Previsualización" class="w-32 h-32 object-cover rounded-2xl shadow-lg"/>
              </div>
            </div>

            <!-- Botones de Agregar/Editar -->
            <div class="flex gap-3 pt-2">
              <button @click.prevent="$emit('guardar-paquete')" 
               class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
    >
                {{ paqueteEnEdicionIndex === null ? 'Agregar' : 'Actualizar' }}
              </button>
              <button v-if="paqueteEnEdicionIndex !== null" @click.prevent="$emit('cancelar-edicion-paquete')" 
                class="px-4 bg-gray-500 text-white py-3 rounded-2xl shadow-lg">
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Columna de la Lista -->
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-gray-800">Presentaciones Agregadas</h3>
            <div v-if="paquetesEnModal.length === 0" class="text-center py-10 text-gray-500">
              <p>No hay presentaciones para este producto.</p>
            </div>
            <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-2">
              <div v-for="(paquete, index) in paquetesEnModal" :key="index" 
                class="bg-white/60 rounded-2xl p-4 border border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p :class="['font-semibold text-gray-800', { 'line-through opacity-50': paquete.Estado === 2 }]"
                    >
                      {{ paquete.Nombre }}
                    </p>
                    <p class="text-sm text-gray-600">
                      Cantidad: {{ paquete.Cantidad }} | P: {{ paquete.PrecioVenta }} | PM: {{ paquete.PrecioMayor }} Bs.
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <img v-if="paquete.localPreviewUrl || paquete.Url" :src="paquete.localPreviewUrl || paquete.Url" alt="Imagen Paquete" 
                         class="w-10 h-10 object-cover rounded-lg shadow-md"/>
                    <button @click.prevent="$emit('editar-paquete', index)" 
                            class="p-2 bg-blue-500 text-white rounded-xl shadow-md">
                      <Edit class="h-4 w-4" />
                    </button>
                    <button @click.prevent="$emit('eliminar-paquete', index)" 
                            :class="['p-2 text-white rounded-xl shadow-md', paquete.Estado === 1 ? 'bg-red-500' : 'bg-green-500']">
                      <Trash2 v-if="paquete.Estado === 1" class="h-4 w-4" />
                      <RotateCcw v-else class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-100 p-4 flex justify-end gap-4 flex-shrink-0 border-t">
        <button
          @click="$emit('cancelar-edicion-paquete'); $emit('close');"
          class="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-300 font-semibold"
        >
          Cancelar
        </button>
        
        <button
          @click="$emit('guardar-cambios-de-paquetes')"
          class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, X, Type, Ruler, Hash, DollarSign, ImageIcon, AlertCircle, Edit, Trash2, RotateCcw } from 'lucide-vue-next';
import { watch } from 'vue';

const props = defineProps({
  show: Boolean,
  productoParaPaquetes: Object,
  paqueteEnEdicionIndex: [Number, null],
  nuevoPaquete: Object,
  paqueteErrors: Object,
  presentacion: Array,
  paquetesEnModal: Array,
  selectedCategoriaMedidaPaquete: [String, Number],
  categoriaMedidas: Array,
  medidasPaquete: Array,
  previewPaqueteUrl: String,
});

watch(() => props.paqueteErrors, (newErrors) => {
  console.log('Paquete Errors prop in ProductoPackageModal changed:', newErrors);
}, { deep: true });

defineEmits([
  'close',
  'cancelar-edicion-paquete',
  'update:nuevoPaquete',
  'validate-paquete-field',
  'update:selectedCategoriaMedidaPaquete',
  'handle-archivo-paquete',
  'guardar-paquete',
  'editar-paquete',
  'eliminar-paquete',
  'guardar-cambios-de-paquetes',
]);
</script>