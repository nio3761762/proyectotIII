<template>
  <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 animate-fade-in">
    <!-- Header Registro -->
    <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
          <Truck class="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 class="text-2xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {{ isEditing ? 'Editar Compra' : 'Nueva Compra' }}
          </h2>
          <p class="text-gray-500 text-sm">{{ isEditing ? 'Modificar datos de la compra' : 'Registro de adquisición de insumos' }}</p>
        </div>
      </div>
      <button @click="$emit('cancel')" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
        <X class="h-6 w-6" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Columna 1: Datos Generales e Insumo -->
        <div class="space-y-6">
          <div class="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 space-y-4">
            <h3 class="font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Info class="h-5 w-5 text-orange-500" />
              Datos de la Transacción
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-600 ml-1 flex items-center gap-1">
                  Proveedor <span class="text-gray-400 text-[10px]">(opcional)</span>
                </label>
                <select 
                  v-model="form.IdProveedor"
                  class="w-full px-4 py-3 text-gray-700 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm font-semibold"
                >
                  <option value="">Sin proveedor</option>
                  <option v-for="p in proveedores" :key="p.idproveedor" :value="p.idproveedor">
                    {{ p.razonsocial }} ({{ p.nombre }})
                  </option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-600 ml-1 flex items-center gap-1">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.FechaCompra" 
                type="date" 
                class="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm font-semibold"
              />
            </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-600  ml-1">Descripción (Opcional)</label>
                <textarea 
                  v-model="form.Descripcion" 
                  rows="2"
                  class="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm resize-none"
                  placeholder="Notas adicionales sobre la compra..."
                ></textarea>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-600 ml-1 flex items-center gap-1">
                  Lugar de Compra <span class="text-gray-400 text-[10px]">(opcional)</span>
                </label>
                <input
                  v-model="form.LugarCompra"
                  type="text"
                  placeholder="Ej: Mercado Central, Distribuidora XYZ, etc."
                  class="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm font-semibold"
                />
              </div>
            </div>

          <!-- Selección de Productos -->
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 class="font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Package class="h-5 w-5 text-orange-500" />
              Agregar Insumo
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-400  ml-1">Insumo</label>
                <div class="relative">
                  <!-- Custom Dropdown Trigger -->
                  <div 
                    @click="showInsumoDropdown = !showInsumoDropdown"
                    class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500 transition-all cursor-pointer flex items-center gap-3 h-14"
                  >
                    <div class="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <img v-if="selectedInsumo?.imagen" :src="selectedInsumo.imagen" class="w-full h-full object-cover" />
                      <Package v-else class="w-5 h-5 text-gray-300" />
                    </div>
                    <span class="flex-1 font-semibold text-sm text-gray-700">
                      {{ selectedInsumo?.nombre || 'Seleccione Insumo' }}
                    </span>
                    <ChevronDown class="h-5 w-5 text-gray-400 transition-transform" :class="{'rotate-180': showInsumoDropdown}" />
                  </div>

                  <!-- Custom Dropdown List -->
                  <div 
                    v-if="showInsumoDropdown"
                    class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar animate-fade-in"
                  >
                    <div 
                      v-for="i in insumosList" 
                      :key="i.idinsumo"
                      @click="selectInsumo(i)"
                      class="flex items-center gap-3 p-3 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div class="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img v-if="i.imagen" :src="i.imagen" class="w-full h-full object-cover" />
                        <Package v-else class="w-5 h-5 text-gray-300" />
                      </div>
                      <span class="font-semibold text-sm text-gray-700">{{ i.nombre }}</span>
                      <Check v-if="selectedInsumoId === i.idinsumo" class="h-4 w-4 text-orange-500 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-400  ml-1">Medida</label>
                <select 
                  v-model="selectedMedidaId" 
                  :disabled="!selectedInsumoId"
                  class="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 font-semibold text-sm h-14"
                >
                  <option value="" disabled>Seleccione Medida</option>
                  <option v-for="m in medidasList" :key="m.idinsumomedida" :value="m.idinsumomedida">
                  {{ m.cantidadmedida }}  {{ m.unidad_nombre }} ({{ m.abreviatura }})
                  </option>
                </select>
              </div>
            </div>Restante por asignar

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-400  ml-1">Cantidad</label>
                <input 
                  v-model.number="itemForm.Cantidad" 
                  type="number" 
                  min="1"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-black text-center"
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-400  ml-1">Precio Total</label>
                <input 
                  v-model.number="itemForm.PrecioTotal"
                  type="number" 
                  step="0.01"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-black text-center"
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-400  ml-1">Precio Unit.</label>
                <input 
                  v-model.number="itemForm.Precio"
                  type="number" 
                  step="0.01"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-black text-center"
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-400  ml-1">Vencimiento</label>
                <div class="relative group cursor-pointer">
                  <input
                    :value="formatDateLatino(itemForm.Fecha)"
                    type="text"
                    readonly
                    @click="vencimientoPicker.showPicker()"
                    placeholder="dd/mm/yyyy"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer font-semibold text-center"
                  />
                  <input 
                    ref="vencimientoPicker"
                    v-model="itemForm.Fecha" 
                    type="date" 
                    class="absolute inset-0 opacity-0 invisible pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="button" 
              @click="addDetail"
              class="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black  tracking-widest hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-200 active:scale-95"
            >
              <Plus class="h-6 w-6" />
              Agregar a la lista
            </button>
          </div>
        </div>

        <!-- Columna 2: Resumen y Distribución -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[600px]">
            <h3 class="font-semibold text-gray-800 flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <ClipboardList class="h-6 w-6 text-orange-500" />
                <span class="text-lg">Resumen de Compra</span>
              </div>
              <span class="text-orange-600 bg-orange-50 px-4 py-2 rounded-xl text-lg font-black shadow-sm">
                Total: {{ (totalCompra || 0).toFixed(2) }} Bs.
              </span>
            </h3>

            <div class="flex-1 space-y-6 overflow-y-auto max-h-[650px] pr-2 custom-scrollbar">
              <div v-if="detalles.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                <PackageOpen class="h-20 w-20 mb-4 opacity-10" />
                <p class="font-semibold text-lg">No hay insumos en el carrito</p>
              </div>
              
              <!-- Item de Detalle -->
              <div v-for="(d, idx) in detalles" :key="idx" class="p-6 bg-gray-50/80 rounded-[2rem] border border-gray-200 shadow-sm transition-all hover:shadow-md group">
                <div class="flex justify-between items-start mb-6">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 border border-orange-100 overflow-hidden">
                       <img v-if="d.imagen" :src="d.imagen" class="w-full h-full object-cover" />
                       <Package v-else class="h-8 w-8" />
                    </div>
                    <div>
                      <p class="font-black text-gray-800  text-sm tracking-tight">{{ d.nombreInsumo }}</p>
                      <p class="text-xs text-gray-500 font-semibold mt-0.5">
                        {{ d.Cantidad }} {{ d.nombreMedida }} <span class="mx-2 text-gray-300">|</span> {{ d.Precio }} Bs/ud
                      </p>
                      <div class="flex items-center gap-1.5 mt-1 text-[11px] text-orange-600 font-black  tracking-tighter">
                         <Calendar class="h-3 w-3" />
                         Vencimiento: {{ formatDateLatino(d.Fecha) }}
                      </div>
                    </div>
                  </div>
                  <div class="text-right flex flex-col items-end gap-2">
                    <span class="font-black text-orange-600 text-xl">{{ ((d.Cantidad * d.Precio) || 0).toFixed(2) }} Bs.</span>
                    <button type="button" @click="removeDetail(idx)" class="bg-red-50 text-red-400 hover:text-red-600 p-2 rounded-xl transition-all">
                      <Trash2 class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <!-- Gestión de Distribución -->
                <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-inner">
                  <div class="flex items-center justify-between mb-5">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full animate-pulse" :class="getRemainingQty(idx) === 0 ? 'bg-green-500' : 'bg-orange-500'"></div>
                      <span class="text-xs font-black text-gray-600  tracking-widest">Distribución por Sucursal</span>
                    </div>
                    <div class="flex flex-col items-end">
                      <span class="text-[10px] text-gray-400 font-semibold ">Restante por asignar</span>
                      <span class="text-sm font-black" :class="getRemainingQty(idx) === 0 ? 'text-green-600' : 'text-orange-600'">
                    {{ getRemainingQty(idx) }} x {{ d.cantidadmedida }} {{ d.nombreMedida }}
                      </span>
                    </div>
                  </div>
   
                  <!-- Formulario Agregar Distribución -->
                  <div v-if="getRemainingQty(idx) > 0" class="flex flex-col sm:flex-row gap-3 mb-6">
                    <div class="flex-1 relative">
                      <Building class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select 
                        v-model="distForms[idx].sucursalId"
                        class="w-full pl-12 pr-4 py-3 text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:border-orange-500/50 transition-all appearance-none"
                      >
                        <option value="" disabled>Seleccionar Sucursal</option>
                        <option v-for="suc in availableSucursales(idx)" :key="suc.idsucursal" :value="suc.idsucursal">
                          {{ suc.nombre }}
                        </option>
                      </select>
                    </div>
                    <div class="flex gap-2">
                      <input 
                        v-model.number="distForms[idx].cantidad"
                        type="number"
                        min="1"
                        :max="getRemainingQty(idx)"
                        placeholder="Cant."
                        class="w-24 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black outline-none text-center focus:border-orange-500/50"
                      />
                      <button 
                        @click="addBranchDist(idx)"
                        type="button"
                        class="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Plus class="h-5 w-5" />
                        <span class="sm:hidden">Asignar</span>
                      </button>
                    </div>
                  </div>

                  <!-- Lista de Sucursales Asignadas -->
                  <div class="space-y-3">
                    <div v-for="(dist, dIdx) in d.distribucion" :key="dIdx" class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group/item">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-500 group-hover/item:text-orange-500 transition-colors">
                          <Building class="h-5 w-5" />
                        </div>
                        <span class="text-sm font-black text-gray-700">{{ getSucursalName(dist.IdSucursal) }}</span>
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="flex items-center bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
                           <button type="button" @click="adjustDistQty(idx, dIdx, -1)" class="w-10 h-10 flex items-center justify-center text-orange-500 font-semibold hover:bg-orange-50 transition-colors border-r border-gray-100 text-lg">-</button>
                           <span class="text-base font-black w-14 text-center text-gray-800">{{ dist.Cantidad }}</span>
                           <button type="button" @click="adjustDistQty(idx, dIdx, 1)" :disabled="getRemainingQty(idx) <= 0" class="w-10 h-10 flex items-center justify-center text-orange-500 font-semibold hover:bg-orange-50 transition-colors border-l border-gray-100 text-lg disabled:opacity-20">+</button>
                        </div>
                        <button type="button" @click="removeBranchDist(idx, dIdx)" class="bg-white p-2 rounded-xl text-red-300 hover:text-red-500 shadow-sm border border-gray-100 transition-all active:scale-90">
                          <X class="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100 space-y-4">
              <button 
                type="submit" 
                :disabled="detalles.length === 0 || isSubmitting"
                class="w-full py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-[2rem] font-black text-lg tracking-[0.2em] shadow-2xl hover:shadow-blue-300 disabled:opacity-40 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
              >
                <component :is="isEditing ? Save : Plus" class="h-7 w-7" />
                {{ isEditing ? 'Guardar Cambios' : 'Agregar Compra a la Lista' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Tabla de Compras Registradas -->
    <div v-if="!isEditing && registeredCompras.length > 0" class="mt-8 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-semibold text-gray-800 flex items-center gap-2 text-lg">
          <ClipboardList class="h-6 w-6 text-orange-500" />
          Compras Pendientes ({{ registeredCompras.length }})
        </h3>
      </div>

      <div class="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-orange-50 to-red-50">
              <th class="text-left p-4 font-black text-gray-700 text-xs uppercase tracking-widest">#</th>
              <th class="text-left p-4 font-black text-gray-700 text-xs uppercase tracking-widest">Proveedor</th>
              <th class="text-left p-4 font-black text-gray-700 text-xs uppercase tracking-widest">Fecha</th>
              <th class="text-right p-4 font-black text-gray-700 text-xs uppercase tracking-widest">Total</th>
              <th class="text-left p-4 font-black text-gray-700 text-xs uppercase tracking-widest">Insumos</th>
              <th class="text-center p-4 font-black text-gray-700 text-xs uppercase tracking-widest">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in registeredCompras" :key="idx" class="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="p-4 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-4 font-semibold text-gray-800">{{ item.proveedorNombre }}</td>
              <td class="p-4 text-gray-600">{{ item.FechaCompra }}</td>
              <td class="p-4 font-black text-orange-600 text-right">{{ item.PrecioTotal.toFixed(2) }} Bs.</td>
              <td class="p-4 text-gray-500 text-xs">{{ item.detallesCount }} insumos</td>
              <td class="p-4 text-center">
                <button @click="removeRegisteredCompra(idx)" class="text-red-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition-all" title="Eliminar">
                  <Trash2 class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 flex justify-end">
        <button 
          @click="finalizeAll"
          :disabled="isSubmitting"
          class="py-4 px-10 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-[2rem] font-black text-lg tracking-[0.2em] shadow-2xl hover:shadow-orange-300 disabled:opacity-40 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
        >
          <CheckCircle v-if="!isSubmitting" class="h-6 w-6" />
          {{ isSubmitting ? 'Enviando...' : 'Finalizar Todos los Registros' }}
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { Truck, X, Plus, Trash2, Info, Package, ClipboardList, PackageOpen, Building, CheckCircle, Calendar, ChevronDown, Check, Save } from 'lucide-vue-next';
import { listarProveedores } from '@/Server/Proveedor';
import { ListInsumo, listarInsumoConMedidas } from '@/Server/Insumo';
import { Listsucursal } from '@/Server/Sucural';
import { registrarCompra, updateCompra } from '@/Server/Compra';
import { getLocalDate } from '@/utils/formatters';

const props = defineProps({
  compraToEdit: { type: Object, default: null }
});

const emit = defineEmits(['saved', 'cancel', 'toast']);

const isEditing = computed(() => !!props.compraToEdit);

// Refs
const vencimientoPicker = ref(null);
const showInsumoDropdown = ref(false);

// Data Sources
const proveedores = ref([]);
const insumosList = ref([]);
const sucursales = ref([]);

// Form State
const isSubmitting = ref(false);
const submitted = ref(false);

const form = reactive({
  IdProveedor: '',
  Descripcion: '',
  LugarCompra: '',
  FechaCompra: getLocalDate()
});

const registeredCompras = ref([]);

const detalles = ref([]); 
const distForms = ref([]); // Temporal forms for distribution UI

const selectedInsumoId = ref('');
const selectedMedidaId = ref('');
const medidasList = ref([]);
const itemForm = reactive({
  Cantidad: 1,
  Precio: 0,
  PrecioTotal: 0,
  Fecha: getLocalDate()
});

watch(() => itemForm.PrecioTotal, (val) => {
  if (itemForm.Cantidad > 0) {
    itemForm.Precio = val / itemForm.Cantidad;
  }
});

watch(() => itemForm.Precio, (val) => {
  itemForm.PrecioTotal = val * itemForm.Cantidad;
});

watch(() => itemForm.Cantidad, (val) => {
  if (val > 0) {
    itemForm.Precio = itemForm.PrecioTotal / val;
  }
});

// Computed
const totalCompra = computed(() => {
  return detalles.value.reduce((acc, curr) => acc + (curr.Cantidad * curr.Precio), 0);
});

const selectedInsumo = computed(() => {
  return insumosList.value.find(i => i.idinsumo === selectedInsumoId.value);
});

const selectedMedida = computed(() => {
  return medidasList.value.find(m => m.idinsumomedida === selectedMedidaId.value);
});

const isItemFormValid = computed(() => {
  return selectedInsumoId.value && 
         selectedMedidaId.value && 
         itemForm.Cantidad > 0 && 
         itemForm.Precio > 0;
});

const isMainFormValid = computed(() => {
  const vDetalles = detalles.value.length > 0;
  const vFecha = !!form.FechaCompra;

  return vDetalles && vFecha;
});

// Pre-fill form when editing
watch(() => props.compraToEdit, (compra) => {
  if (!compra) return;
  form.IdProveedor = compra.proveedor?.idproveedor || '';
  form.FechaCompra = compra.fechacompra ? compra.fechacompra.split('T')[0] : getLocalDate();
  form.Descripcion = compra.descripcion || '';
  form.LugarCompra = compra.lugarcompra || '';

  // Rebuild detalles
  detalles.value = (compra.detalles || []).map(d => {
    const dist = (compra.destinos || [])
      .filter(dest => dest.insumo?.idinsumo === d.insumo?.idinsumo)
      .map(dest => ({
        IdSucursal: dest.sucursal?.idsucursal || '',
        Cantidad: dest.cantidad || 0,
        IdInventario: dest.idinventario || ''
      }));

    return {
      IdInsumo: d.insumo?.idinsumo || '',
      IdMedida: d.insumomedida?.idinsumomedida || '',
      Cantidad: d.cantidad || 0,
      Precio: d.precio || 0,
      Fecha: d.fechavencimiento ? d.fechavencimiento.split('T')[0] : '',
      nombreInsumo: d.insumo?.nombre || '',
      nombreMedida: d.insumomedida?.unidadmedida?.nombre || '',
      cantidadmedida: d.insumomedida?.cantidad || 1,
      conversionFactor: parseFloat(d.insumomedida?.unidadmedida?.equivalente || d.insumomedida?.cantidad || 1),
      imagen: d.insumo?.imagen || null,
      distribucion: dist
    };
  });

  distForms.value = detalles.value.map(() => ({ sucursalId: '', cantidad: 1 }));
}, { immediate: true });

// Load Initial Data
onMounted(async () => {
  try { 
    const [p, i, s] = await Promise.all([
      listarProveedores(),
      ListInsumo(),
      Listsucursal()
    ]);
    proveedores.value = p.result || p;
    insumosList.value = i.result || i;
    sucursales.value = s;
  } catch (error) {
    console.error("Error loading registry data:", error);
    emit('toast', 'Error al cargar datos necesarios', 'error');
  }
});

// Watch insumo selection
watch(selectedInsumoId, async (newId) => {
  if (newId) {
    selectedMedidaId.value = '';
    medidasList.value = await listarInsumoConMedidas(newId);
  }
});

// Selection handler
const selectInsumo = (insumo) => {
  selectedInsumoId.value = insumo.idinsumo;
  showInsumoDropdown.value = false;
};

// Watch medida selection
watch(selectedMedidaId, (newId) => {
  if (newId) {
    const medida = medidasList.value.find(m => m.idinsumomedida === newId);
  }
});

// Detail Management
const addDetail = () => {
  if (!isItemFormValid.value) {
    emit('toast', 'Por favor complete todos los campos del insumo correctamente (Cantidad y Precio deben ser mayores a 0)', 'warning');
    return;
  }

  const existingIndex = detalles.value.findIndex(d => 
    d.IdInsumo === selectedInsumoId.value && d.IdMedida === selectedMedidaId.value
  );

  if (existingIndex > -1) {
    // Si ya existe el insumo con esa medida, aumentamos cantidad y actualizamos datos
    const existing = detalles.value[existingIndex];
    existing.Cantidad += itemForm.Cantidad;
    existing.Precio = itemForm.Precio;
    existing.Fecha = itemForm.Fecha;
  } else {
    // Si no existe, agregamos uno nuevo
    const insumo = insumosList.value.find(i => i.idinsumo === selectedInsumoId.value);
    const medida = medidasList.value.find(m => m.idinsumomedida === selectedMedidaId.value);

    detalles.value.push({
      IdInsumo: selectedInsumoId.value,
      IdMedida: selectedMedidaId.value,
      Cantidad: itemForm.Cantidad,
      Precio: itemForm.Precio,
      Fecha: itemForm.Fecha,
      nombreInsumo: insumo.nombre,
      nombreMedida: medida.unidad_nombre,
      cantidadmedida: medida.cantidadmedida,
      conversionFactor: parseFloat(medida.cantidad),
      imagen: insumo.imagen,
      distribucion: []
    });

    distForms.value.push({ sucursalId: '', cantidad: 1 });
  }

  // Reset
  selectedInsumoId.value = '';
  selectedMedidaId.value = '';
  itemForm.Cantidad = 1;
  itemForm.Precio = 0;
  itemForm.PrecioTotal = 0;
  itemForm.Fecha = getLocalDate();
};

const removeDetail = (index) => {
  detalles.value.splice(index, 1);
  distForms.value.splice(index, 1);
};

// Branch Distribution Logic
const availableSucursales = (itemIdx) => {
  const assignedIds = detalles.value[itemIdx].distribucion.map(d => d.IdSucursal);
  return sucursales.value.filter(s => !assignedIds.includes(s.idsucursal));
};

const getSucursalName = (id) => {
  return sucursales.value.find(s => s.idsucursal === id)?.nombre || 'S/N';
};

const addBranchDist = (idx) => {
  const formDist = distForms.value[idx];
  if (!formDist.sucursalId || formDist.cantidad <= 0) return;

  const remaining = getRemainingQty(idx);
  const finalQty = Math.min(formDist.cantidad, remaining);

  detalles.value[idx].distribucion.push({
    IdSucursal: formDist.sucursalId,
    Cantidad: finalQty
  });

  // Reset mini form
  formDist.sucursalId = '';
  formDist.cantidad = 1;
};

const removeBranchDist = (itemIdx, distIdx) => {
  detalles.value[itemIdx].distribucion.splice(distIdx, 1);
};

const adjustDistQty = (itemIdx, distIdx, amount) => {
  const dist = detalles.value[itemIdx].distribucion[distIdx];
  const remaining = getRemainingQty(itemIdx);
  
  if (amount > 0 && remaining <= 0) return;
  
  const newQty = dist.Cantidad + amount;
  if (newQty <= 0) {
    removeBranchDist(itemIdx, distIdx);
  } else {
    dist.Cantidad = newQty;
  }
};

const getRemainingQty = (idx) => {
  const detail = detalles.value[idx];
  const totalDist = detail.distribucion.reduce((a, c) => a + c.Cantidad, 0);
  return detail.Cantidad - totalDist;
};

// Formatters
const formatDateLatino = (date) => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

// Submit - add to local pending list or direct update
const handleSubmit = async () => {
  submitted.value = true;

  if (!isMainFormValid.value) {
    if (detalles.value.length === 0) {
      emit('toast', 'Debe agregar al menos un insumo a la lista', 'warning');
    } else {
      emit('toast', 'Por favor complete todos los campos obligatorios de la transacción', 'warning');
    }
    return;
  }

  const destinosApi = [];
  detalles.value.forEach(d => {
    d.distribucion.forEach(dist => {
      destinosApi.push({ 
        IdInsumo: d.IdInsumo,
        IdProducto: '',
        Cantidad: dist.Cantidad,
        PrecioInsumo: d.Precio,
        CantidadMedida: d.conversionFactor,
        IdSucursal: dist.IdSucursal,
        IdMedida: d.IdMedida,
        IdInventario: dist.IdInventario
      });
    });
  });

  const ComprasPayload = {
    IdProveedor: form.IdProveedor,
    Descripcion: form.Descripcion,
    LugarCompra: form.LugarCompra,
    Fecha: form.FechaCompra,
    PrecioTotal: totalCompra.value
  };

  const detallesApi = detalles.value.map(d => ({
    Cantidad: d.Cantidad,
    IdMedida: d.IdMedida,
    Precio: d.Precio,
    Fecha: d.Fecha
  }));

  if (isEditing.value) {
    isSubmitting.value = true;
    try {
    
      await updateCompra(props.compraToEdit.idcompra, ComprasPayload, detallesApi, destinosApi);
      emit('toast', 'Compra actualizada correctamente', 'success');
      emit('saved');
    } catch (error) {
      console.error("Update error:", error);
      emit('toast', error.response?.data?.message || 'Error al actualizar la compra', 'error');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  const proveedor = proveedores.value.find(p => p.idproveedor === form.IdProveedor);

  registeredCompras.value.push({
    IdProveedor: form.IdProveedor,
    Descripcion: form.Descripcion,
    LugarCompra: form.LugarCompra,
    FechaCompra: form.FechaCompra,
    PrecioTotal: totalCompra.value,
    proveedorNombre: proveedor ? `${proveedor.razonsocial} (${proveedor.nombre})` : 'S/N',
    detallesCount: detalles.value.length,
    detalles: detallesApi,
    destinos: destinosApi
  });

  emit('toast', 'Compra agregada a la lista', 'success');

  // Reset form
  form.IdProveedor = '';
  form.Descripcion = '';
  form.LugarCompra = '';
  form.FechaCompra = getLocalDate();
  detalles.value = [];
  distForms.value = [];
  selectedInsumoId.value = '';
  selectedMedidaId.value = '';
  itemForm.Cantidad = 1;
  itemForm.Precio = 0;
  itemForm.PrecioTotal = 0;
  itemForm.Fecha = getLocalDate();
};

const removeRegisteredCompra = (index) => {
  registeredCompras.value.splice(index, 1);
};

const finalizeAll = async () => {
  if (registeredCompras.value.length === 0) return;

  isSubmitting.value = true;
  try {
    for (const item of registeredCompras.value) {
      const payload = {
        IdProveedor: item.IdProveedor,
        Descripcion: item.Descripcion,
        LugarCompra: item.LugarCompra,
        Fecha: item.FechaCompra,
        PrecioTotal: item.PrecioTotal,
        detalles: item.detalles,
        destinos: item.destinos
      };
      await registrarCompra(payload);
    }
    emit('toast', `${registeredCompras.value.length} compra(s) registrada(s) con éxito`, 'success');
    registeredCompras.value = [];
    emit('saved');
  } catch (error) {
    console.error("Finalize error:", error);
    emit('toast', error.response?.data?.message || 'Error al registrar una o más compras', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #fb923c;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #f97316;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
