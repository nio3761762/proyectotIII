<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6 flex flex-wrap gap-4 items-end animate-fade-in mb-6">
    <!-- Sucursal Filter -->
    <div class="w-64">
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Sucursal (Historial)</label>
      <select 
        :value="modelValue.idsucursal" 
        @change="$emit('update:modelValue', { ...modelValue, idsucursal: $event.target.value })"
        class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-xs text-gray-700 transition-all shadow-inner"
      >
        <option value="">Todas las Sucursales</option>
        <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">{{ s.nombre }}</option>
      </select>
    </div>

    <!-- Persona Filter -->
    <div class="w-64">
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Persona</label>
      <select 
        :value="modelValue.idempleado" 
        @change="$emit('update:modelValue', { ...modelValue, idempleado: $event.target.value })"
        class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-xs text-gray-700 transition-all shadow-inner"
      >
        <option value="">Todas las Personas</option>
        <option v-for="p in personas" :key="p.idpersona ?? p.idempleado ?? p.empleado?.idempleado" :value="p.empleado?.idempleado ?? p.idempleado ?? p.idpersona">{{ p.nombre ?? p.Nombre }} {{ p.apellidopaterno ?? p.ApellidoPaterno }}</option>
      </select>
    </div>

    <!-- Fecha Filter -->
    <div class="w-48">
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Fecha</label>
      <input 
        :value="modelValue.fecha" 
        @input="$emit('update:modelValue', { ...modelValue, fecha: $event.target.value })"
        type="date" 
        class="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-xs text-gray-700 transition-all shadow-inner" 
      />
    </div>

    <!-- Por página -->
    <div>
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Mostrar</label>
      <div class="flex rounded-2xl bg-gray-100/80 p-1 gap-1 shadow-inner">
        <button
          v-for="op in [9, 12, 21, 45]" :key="op"
          @click="$emit('update:limit', op)"
          :class="['min-w-[36px] px-2.5 py-1.5 text-[10px] font-black rounded-xl transition-all',
            limit === op ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50']"
        >{{ op }}</button>
      </div>
    </div>

    <!-- Vista Modo Toggle -->
    <div class="ml-auto">
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Vista</label>
      <div class="bg-gray-100/80 p-1 rounded-2xl flex gap-1 shadow-inner h-fit">
        <button 
          @click="$emit('update:vistaModo', 'card')"
          :class="['p-2 rounded-xl transition-all', vistaModo === 'card' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
          title="Vista Cuadrícula"
        >
          <LayoutGrid class="h-4 w-4" />
        </button>
        <button 
          @click="$emit('update:vistaModo', 'table')"
          :class="['p-2 rounded-xl transition-all', vistaModo === 'table' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
          title="Vista Tabla"
        >
          <ListIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Exportar PDF del Día -->
    <div>
      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Exportar</label>
      <button
        @click="$emit('export-pdf')"
        :disabled="exportandoPdf"
        class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
      >
        <Loader2 v-if="exportandoPdf" class="h-4 w-4 animate-spin" />
        <FileDown v-else class="h-4 w-4" />
        {{ exportandoPdf ? 'Generando...' : 'PDF del Día' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { LayoutGrid, List as ListIcon, FileDown, Loader2 } from 'lucide-vue-next';
import { listarTodasPersonas } from '@/Server/persona';

const props = defineProps({
  modelValue: { type: Object, required: true },
  sucursales: { type: Array, default: () => [] },
  limit: { type: Number, default: 9 },
  vistaModo: { type: String, default: 'card' },
  exportandoPdf: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'update:limit', 'update:vistaModo', 'filter', 'export-pdf']);

const personas = ref([]);

const cargarPersonas = async () => {
  try {
    const res = await listarTodasPersonas();
    const lista = Array.isArray(res) ? res : (res?.data ?? res?.result ?? res ?? []);
    personas.value = Array.isArray(lista) ? lista.map(p => ({
      ...p,
      idpersona: p.idpersona,
      idempleado: p.empleado?.idempleado ?? null
    })) : [];
  } catch (error) {
    console.error("Error al cargar personas para filtros", error);
  }
};

// Automatic update on any filter change
watch(() => props.modelValue, () => {
  emit('filter');
}, { deep: true });

onMounted(() => {
  cargarPersonas();
});
</script>
