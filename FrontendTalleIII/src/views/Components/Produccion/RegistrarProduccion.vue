<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
    <div class="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
      <!-- Header -->
      <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
            <Factory class="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Iniciar Nueva Producción
            </h2>
            <p class="text-gray-500 text-sm font-bold uppercase tracking-widest">Asignación de Personal</p>
          </div>
        </div>
        <button @click="$emit('cancel')" class="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="overflow-y-auto flex-grow p-8">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Sucursal & Info -->
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sucursal</label>
                <select 
                  v-model="form.IdSucursal" 
                  @change="cargarEmpleados"
                  :disabled="tieneSucursal"
                  class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-gray-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                >
                  <option value="" disabled>Seleccione Sucursal</option>
                  <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">
                    {{ s.nombre }}
                  </option>
                </select>
              </div>

              <!-- Fecha de Producción -->
              <div class="space-y-2">
                <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Producción <span class="text-red-500">*</span></label>
                <input 
                  type="date" 
                  v-model="form.FechaRegistro" 
                  class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-gray-700 transition-all"
                  required
                />
              </div>

              <!-- Horario de Inicio -->
              <div class="space-y-2">
                <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Hora Inicio <span class="text-red-500">*</span></label>
                <input 
                  type="time" 
                  v-model="form.HoraInicio" 
                  class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-gray-700 transition-all"
                  required
                />
              </div>

              <div class="space-y-2">
                <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Observaciones</label>
                <textarea 
                  v-model="form.Observacion" 
                  rows="4"
                  class="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none font-medium text-gray-600"
                  placeholder="Instrucciones o notas para el equipo..."
                ></textarea>
              </div>
            </div>

            <!-- Selección de Empleados -->
            <div class="space-y-4">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                <span>Seleccionar Personal</span>
                <span class="text-orange-600 font-black">{{ selectedEmpleados.length }} seleccionados</span>
              </label>
              
              <div v-if="!form.IdSucursal" class="h-64 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                 <Users class="h-10 w-10 mb-2 opacity-20" />
                 <p class="text-xs font-bold uppercase">Primero elija una sucursal</p>
              </div>

              <div v-else-if="loadingEmpleados" class="h-64 flex items-center justify-center">
                 <div class="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
              </div>

              <div v-else-if="empleados.length === 0" class="h-64 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                 <Users class="h-10 w-10 mb-2 opacity-20" />
                 <p class="text-xs font-bold uppercase">No hay empleados en esta sucursal</p>
              </div>

              <div v-else class="h-64 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                 <div 
                  v-for="e in empleados" 
                  :key="e.idempleado"
                  @click="toggleEmpleado(e.idempleado)"
                  :class="['flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer group', 
                    selectedEmpleados.includes(e.idempleado) ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-50 hover:border-orange-100']"
                >
                  <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 relative">
                     <img v-if="e.imagen" :src="e.imagen" class="w-full h-full object-cover" />
                     <User v-else class="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                     <div v-if="selectedEmpleados.includes(e.idempleado)" class="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                        <Check class="h-5 w-5 text-orange-600" />
                     </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-gray-800">{{ e.nombre }} {{ e.apellidopaterno }}</p>
                    <p class="text-[10px] text-gray-500 font-black uppercase tracking-tighter">{{ e.cargo }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-6 flex gap-4 flex-shrink-0">
            <button 
              type="button"
              @click="$emit('cancel')"
              class="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="!isFormValid || isSubmitting"
              class="flex-[2] py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:shadow-orange-200 disabled:opacity-40 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
            >
              <CheckCircle v-if="!isSubmitting" class="h-6 w-6" />
              <Loader2 v-else class="h-6 w-6 animate-spin" />
              {{ isSubmitting ? 'INICIANDO...' : 'INICIAR PRODUCCIÓN' }}
            </button>
          </div>
        </form> 
      </div> 
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { X, Users, User, Check, CheckCircle, Factory, Loader2 } from 'lucide-vue-next';
import { Listsucursal } from '@/Server/Sucural';
import { ListEmpleado } from '@/Server/Empleado';
import { getEmpleadosSinSucursal } from '@/Server/EmpleadoSucursal';
import { iniciarProduccion } from '@/Server/Produccion';



const props = defineProps({
  tieneSucursal: Boolean,
  sucursalId: [String, Number]
});


const emit = defineEmits(['saved', 'cancel']);

// Data Sources 
const sucursales = ref([]);
const empleados = ref([]);
const loadingEmpleados = ref(false);

// Form State
const isSubmitting = ref(false);
const form = reactive({
  IdSucursal: '',
  Observacion: '',
  HoraInicio: '',
  FechaRegistro: new Date().toISOString().split('T')[0]
});

const selectedEmpleados = ref([]);

// Computed
const isFormValid = computed(() => {
  return form.IdSucursal && selectedEmpleados.value.length > 0 && form.HoraInicio && form.FechaRegistro;
});

// Helper Methods
const cargarEmpleados = async () => {
  if (!form.IdSucursal || form.IdSucursal === '-1') {
    empleados.value = [];
    return;
  }
  
  loadingEmpleados.value = true;
  selectedEmpleados.value = [];
  try {
    const [e, eSinSuc] = await Promise.all([
      ListEmpleado(form.IdSucursal),
      getEmpleadosSinSucursal()
    ]);

    const deSucursal = Array.isArray(e?.result ?? e) ? (e?.result ?? e) : [];
    const sinSucursal = Array.isArray(eSinSuc) ? eSinSuc : (eSinSuc?.result ?? []);

    const normalizados = sinSucursal.map(emp => ({
      idempleado: emp.idempleado,
      nombre: emp.persona?.nombre ?? '',
      apellidopaterno: emp.persona?.apellidopaterno ?? '',
      apellidomaterno: emp.persona?.apellidomaterno ?? '',
      imagen: emp.persona?.imagen ?? null,
      cargo: emp.cargo?.nombre ?? '',
      cargoId: emp.cargo?.idcargo ?? '',
    }));

    const ids = new Set(deSucursal.map(e => e.idempleado));
    const unicos = normalizados.filter(e =>
      !ids.has(e.idempleado) &&
      e.cargoId !== 'CAR-003'
    );

    empleados.value = [...deSucursal, ...unicos];
  
  } catch (error) {
    console.error("Error al cargar empleados:", error);
  } finally {
    loadingEmpleados.value = false;
  }
};

const toggleEmpleado = (id) => {
  const index = selectedEmpleados.value.indexOf(id);
  if (index > -1) {
    selectedEmpleados.value.splice(index, 1);
  } else {
    selectedEmpleados.value.push(id);
  }
};

// Sync prop changes
watch(() => props.sucursalId, (newVal) => {
  if (newVal && newVal !== '-1' && newVal !== form.IdSucursal) {
    form.IdSucursal = newVal;
  }
}, { immediate: true });

// Watch for changes in form.IdSucursal
watch(() => form.IdSucursal, (newId) => {
  if (newId && newId !== '-1') {
    cargarEmpleados();
  } else {
    empleados.value = [];
  }
});

// Load Initial Data
onMounted(async () => {
  try {
    const s = await Listsucursal();
    sucursales.value = s;
    
    if (props.sucursalId && props.sucursalId !== '-1') {
      form.IdSucursal = props.sucursalId;
      await cargarEmpleados();
    }
  } catch (error) {
    console.error(">>> RegistrarProduccion: Error en onMounted:", error);
  }
});

// Submit
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  try {
    await iniciarProduccion(
      form.IdSucursal, 
      selectedEmpleados.value, 
      form.Observacion,
      form.HoraInicio,
      '',
      form.FechaRegistro
    );
    emit('saved', form.IdSucursal);
  } catch (error) {
    console.error("Error al iniciar producción:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #fb923c;
  border-radius: 10px;
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
