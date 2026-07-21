<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
    <div class="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
      <!-- Header -->
      <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
            <Edit class="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Editar Producción
            </h2>
            <p class="text-gray-500 text-sm font-bold uppercase tracking-widest">#{{ produccion.idproduccion }}</p>
          </div>
        </div>
        <button @click="$emit('cancel')" class="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="overflow-y-auto flex-grow p-8">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Producción</label>
              <input type="date" v-model="form.FechaProduccion" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Hora Inicio</label>
              <input type="time" v-model="form.HoraInicio" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Hora Fin</label>
              <input type="time" v-model="form.HoraFin" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 transition-all" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Observaciones</label>
            <textarea v-model="form.Observacion" rows="3" class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium text-gray-600" placeholder="Notas..."></textarea>
          </div>

          <!-- Current Products -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest">Productos Registrados</label>
              <button type="button" @click="agregarProductoNuevo" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-100 transition-all flex items-center gap-2">
                <Plus class="h-4 w-4" />
                Agregar Producto
              </button>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th class="py-3 pr-2">Producto</th>
                    <th class="py-3 px-2">Cantidad Actual</th>
                    <th class="py-3 px-2">Nueva Cantidad</th>
                    <th class="py-3 pl-2 w-10"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="(prod, idx) in form.Productos" :key="idx" class="hover:bg-blue-50/20 transition-colors">
                    <td class="py-3 pr-2">
                      <select v-model="prod.IdProducto" class="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 text-xs">
                        <option value="" disabled>Seleccionar</option>
                        <option v-for="p in productos" :key="p.idproducto" :value="p.idproducto">{{ p.nombre }}</option>
                      </select>
                    </td>
                    <td class="py-3 px-2">
                      <span class="px-3 py-3 bg-gray-100 rounded-xl font-bold text-gray-500 text-sm block text-center">{{ prod.CantidadOriginal || 0 }}</span>
                    </td>
                    <td class="py-3 px-2">
                      <input v-model.number="prod.Cantidad" type="number" min="0" class="w-24 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-gray-800 text-center text-sm" />
                    </td>
                    <td class="py-3 pl-2">
                      <button v-if="!prod.CantidadOriginal" @click="removerProducto(idx)" type="button" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <X class="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-if="form.Productos.length === 0" class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl mt-4 text-sm">
              No hay productos registrados. Agregue productos para modificar cantidades.
            </p>
          </div>

          <!-- Merma Section -->
          <div v-if="mermaProductos.length > 0">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-red-100 rounded-xl text-red-600">
                <AlertTriangle class="h-5 w-5" />
              </div>
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest">Registrar Merma (Productos Dañados)</label>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th class="py-3 pr-2">Producto</th>
                    <th class="py-3 px-2">Cantidad Buena</th>
                    <th class="py-3 px-2">Cantidad a Mermar</th>
                    <th class="py-3 px-2">Motivo</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="(prod, idx) in mermaProductos" :key="idx" class="hover:bg-red-50/20 transition-colors">
                    <td class="py-3 pr-2">
                      <span class="text-sm font-bold text-gray-700">{{ prod.Nombre }}</span>
                    </td>
                    <td class="py-3 px-2">
                      <span class="px-3 py-3 bg-green-50 rounded-xl font-bold text-green-600 text-sm block text-center">{{ prod.CantidadBuena }}</span>
                    </td>
                    <td class="py-3 px-2">
                      <input v-model.number="prod.CantidadMermar" type="number" min="0" :max="prod.CantidadBuena" class="w-24 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-black text-gray-800 text-center text-sm" />
                    </td>
                    <td class="py-3 px-2">
                      <input v-model="prod.Motivo" type="text" class="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium text-gray-600 text-xs" placeholder="Ej: Se quemó" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Submit -->
          <div class="pt-6 flex gap-4 flex-shrink-0">
            <button type="button" @click="$emit('cancel')" class="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95">
              Cancelar
            </button>
            <button type="submit" :disabled="isSubmitting || (!tieneCambios && !tieneMerma)" class="flex-[2] py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-200 disabled:opacity-40 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3">
              <CheckCircle v-if="!isSubmitting" class="h-6 w-6" />
              <Loader2 v-else class="h-6 w-6 animate-spin" />
              {{ isSubmitting ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { X, Plus, Edit, CheckCircle, Loader2, AlertTriangle } from 'lucide-vue-next';
import { actualizarProduccion, registrarMermaProduccion } from '@/Server/Produccion';
import { listProduct } from '@/Server/Producto';

const props = defineProps({
  produccion: { type: Object, required: true }
});

const emit = defineEmits(['saved', 'cancel']);

const productos = ref([]);
const isSubmitting = ref(false);

const form = reactive({
  Observacion: '',
  FechaProduccion: '',
  HoraInicio: '',
  HoraFin: '',
  Productos: []
});

// Merma state
const mermaProductos = ref([]);

const formatDateToInput = (dateStr) => {
  if (!dateStr) return '';
  // If already YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Try to parse as Date
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString().split('T')[0];
};

const tieneCambios = computed(() => {
  if (form.Observacion !== (props.produccion.observaciones || '')) return true;
  if (form.FechaProduccion !== formatDateToInput(props.produccion.fecha)) return true;
  if (form.HoraInicio !== props.produccion.horaInicio) return true;
  if (form.HoraFin !== (props.produccion.horaFin || '')) return true;
  for (const prod of form.Productos) {
    if (Number(prod.Cantidad) !== Number(prod.CantidadOriginal)) return true;
  }
  return false;
});

const tieneMerma = computed(() => {
  return mermaProductos.value.some(p => Number(p.CantidadMermar) > 0 && p.Motivo);
});

const agregarProductoNuevo = () => {
  form.Productos.push({
    IdProducto: '',
    Cantidad: 1,
    CantidadOriginal: 0
  });
};

const removerProducto = (idx) => {
  form.Productos.splice(idx, 1);
};

const getProductName = (id) => {
  const p = productos.value.find(p => p.idproducto === id);
  return p ? p.nombre : id;
};

onMounted(async () => {
  try {
    const res = await listProduct();
    productos.value = res.result || res;

    form.Observacion = props.produccion.observaciones || '';
    form.FechaProduccion = formatDateToInput(props.produccion.fecha);
    form.HoraInicio = props.produccion.horaInicio || '';
    form.HoraFin = props.produccion.horaFin || '';

    if (props.produccion.detalles?.length) {
      form.Productos = props.produccion.detalles.map(d => ({
        IdProducto: d.producto?.IdProducto || '',
        Cantidad: Number(d.cantidad),
        CantidadOriginal: Number(d.cantidad)
      }));

      // Poblar merma state con productos existentes
      mermaProductos.value = props.produccion.detalles
        .filter(d => d.producto?.IdProducto && Number(d.cantidad) > 0)
        .map(d => ({
          IdProducto: d.producto.IdProducto,
          Nombre: d.producto.Nombre,
          CantidadBuena: Number(d.cantidad),
          CantidadMermar: 0,
          Motivo: ''
        }));
    }
  } catch (error) {
    console.error('Error loading edit data:', error);
  }
});

const handleSubmit = async () => {
  if (!tieneCambios.value && !tieneMerma.value) return;
  isSubmitting.value = true;
  try {
    // Guardar cambios de productos y datos básicos
    if (tieneCambios.value) {
      const productosPayload = form.Productos
        .filter(p => p.IdProducto)
        .map(p => ({
          IdProducto: p.IdProducto,
          Cantidad: Number(p.Cantidad)
        }));

      await actualizarProduccion(props.produccion.idproduccion, {
        Observacion: form.Observacion,
        FechaProduccion: form.FechaProduccion,
        HoraInicio: form.HoraInicio,
        HoraFin: form.HoraFin,
        Productos: productosPayload
      });
    }

    // Registrar mermas
    const mermasPendientes = mermaProductos.value.filter(p => Number(p.CantidadMermar) > 0 && p.Motivo);
    for (const m of mermasPendientes) {
      await registrarMermaProduccion(props.produccion.idproduccion, m.IdProducto, Number(m.CantidadMermar), m.Motivo);
    }

    emit('saved');
  } catch (error) {
    console.error('Error al actualizar producción:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>