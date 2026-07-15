<template>
  <Transition name="fade-backdrop">
    <div v-if="isOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div class="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-scale-in">
        <!-- Header -->
        <div class="bg-linear-to-r from-orange-600 to-red-700 p-8 text-white relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="flex items-center justify-between relative z-10">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white/20 rounded-xl">
                <Edit2 class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-black uppercase tracking-tight">Ajustar Detalle</h3>
                <p class="text-orange-100 text-[10px] font-bold uppercase tracking-widest">Control de Personas</p>
              </div>
            </div>
            <button @click="$emit('close')" class="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <!-- Info del Producto -->
          <div class="bg-orange-50 rounded-2xl p-5 flex items-center gap-4 border border-orange-100/50">
            <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm border border-orange-50">
              <Package class="h-6 w-6" />
            </div>
            <div>
              <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Producto / Medida</p>
              <p class="text-base font-black text-orange-900 leading-tight">
                {{ detalle?.ProductoMedida?.Producto?.Nombre }}
              </p>
            </div>
          </div>

          <!-- Precio Venta y Cant. Devuelta -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Venta (Bs)</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">Bs</span>
                <input v-model.number="form.precioVenta" type="number" step="0.01"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 font-black text-sm text-gray-700 outline-none transition-all shadow-inner" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cant. Devuelta</label>
              <div class="relative group">
                <input v-model.number="form.cantidadDevuelta" type="number" min="0"
                  class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 font-black text-sm text-gray-700 outline-none transition-all shadow-inner" />
              </div>
            </div>
          </div>

          <!-- Múltiples Ajustes -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ajustes de Precio</label>
              <button @click="agregarAjuste"
                class="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1">
                <Plus class="h-3.5 w-3.5" /> Añadir Ajuste
              </button>
            </div>

            <div v-if="form.ajustes.length === 0" class="bg-gray-50/50 rounded-2xl p-6 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest border border-dashed border-gray-200">
              No hay ajustes. Agrega uno para registrar una venta con precio modificado.
            </div>

            <div v-for="(ajuste, idx) in form.ajustes" :key="idx"
              class="bg-orange-50/30 rounded-2xl p-4 border border-orange-100/50 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Ajuste #{{ idx + 1 }}</span>
                <button @click="form.ajustes.splice(idx, 1)" class="text-red-300 hover:text-red-500 transition-colors p-1">
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad</label>
                  <input v-model.number="ajuste.cantidad" type="number" min="0"
                    class="w-full px-3 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-black text-xs text-gray-700 outline-none shadow-sm" />
                </div>
                <div class="space-y-1">
                  <label class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio (Bs)</label>
                  <input v-model.number="ajuste.precioVenta" type="number" step="0.01" min="0"
                    class="w-full px-3 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-black text-xs text-gray-700 outline-none shadow-sm" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Observación</label>
                <input v-model="ajuste.observacion" type="text" placeholder="Motivo de este ajuste..."
                  class="w-full px-3 py-2.5 bg-white border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-bold text-[10px] text-gray-700 outline-none shadow-sm" />
              </div>
            </div>
          </div>

          <!-- Motivo General -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivo General del Ajuste</label>
            <textarea v-model="form.motivo" rows="2" placeholder="Describe brevemente por qué realizas este ajuste..."
              class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 font-bold text-xs text-gray-700 outline-none transition-all shadow-inner resize-none"></textarea>
          </div>

          <!-- Resumen -->
          <div v-if="totalAjustado > 0" class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div class="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <span>Total Ajustado</span>
              <span class="text-orange-700">{{ totalAjustado }} unidades</span>
            </div>
          </div>

          <!-- Botones -->
          <div class="pt-4 flex flex-col gap-3">
            <button @click="handleConfirm" :disabled="loading"
              class="w-full py-4 bg-linear-to-r from-orange-600 to-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              GUARDAR CAMBIOS
            </button>
            <button @click="$emit('close')" class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-[0.98]">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';
import { X, Package, Loader2, Edit2, Plus, Trash2 } from 'lucide-vue-next';
import { Controldetales } from '@/Server/ControlRevendedor';

const props = defineProps({
  isOpen: Boolean,
  detalle: Object,
  loading: Boolean
});

const emit = defineEmits(['close', 'updated']);

const form = reactive({
  precioVenta: 0,
  cantidadDevuelta: 0,
  motivo: '',
  ajustes: []
});

const totalAjustado = computed(() => {
  return form.ajustes.reduce((sum, a) => sum + (a.cantidad || 0), 0);
});

const agregarAjuste = () => {
  form.ajustes.push({ cantidad: 0, precioVenta: 0, observacion: '' });
};

watch(() => props.detalle, (newVal) => {
  if (newVal) {
    form.precioVenta = newVal.PrecioVenta;
    form.cantidadDevuelta = newVal.CantidadDevuelta;
    form.motivo = newVal.Motivo || '';

    const preciosAjuste = (newVal.Precios || []).filter(p => p.Estado === 'AJUSTE');
    form.ajustes = preciosAjuste.length > 0
      ? preciosAjuste.map(p => ({
          cantidad: p.Cantidad || 0,
          precioVenta: p.PrecioVenta || 0,
          observacion: p.Observacion || ''
        }))
      : [];
  }
}, { immediate: true });

const handleConfirm = async () => {
  try {
    const precios = form.ajustes
      .filter(a => a.cantidad > 0)
      .map(a => ({
        cantidad: a.cantidad,
        precioVenta: a.precioVenta,
        estado: 'AJUSTE',
        observacion: a.observacion
      }));

    await Controldetales(
      props.detalle.IdDetalle,
      {
        precioVenta: form.precioVenta,
        cantidadDevuelta: form.cantidadDevuelta,
        motivo: form.motivo,
        precios
      }
    );
    emit('updated');
    emit('close');
  } catch (error) {
    console.error("Error al actualizar detalle", error);
  }
};
</script>

<style scoped>
.fade-backdrop-enter-active, .fade-backdrop-leave-active { transition: opacity 0.3s ease; }
.fade-backdrop-enter-from, .fade-backdrop-leave-to { opacity: 0; }

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>
