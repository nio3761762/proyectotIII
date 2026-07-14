<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    @click.self="$emit('cancelar')"
  >
    <div class="bg-white/95 backdrop-blur-sm border border-white/50 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-xl">
              <Briefcase class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold">
                {{ esEdicion ? 'Actualizar Datos de Empleado' : 'Asignar como Empleado' }}
              </h2>
              <p class="text-blue-100 text-sm mt-1">
                {{ nombrePersona }}
              </p>
            </div>
          </div>
          <button @click="$emit('cancelar')" class="text-white hover:text-blue-100 transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
        <!-- Información Base -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Fecha de Ingreso</label>
            <div class="relative">
              <Calendar class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
              <input
                v-model="form.fechaIngreso"
                type="date"
                class="w-full pl-12 pr-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Salario</label>
            <div class="relative">
              <DollarSign class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
              <input
                v-model.number="form.salario"
                type="number"
                placeholder="0.00"
                class="w-full pl-12 pr-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-gray-700 font-semibold mb-2">Sucursal Asignada</label>
            <div class="relative">
              <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
              <select
                v-model="form.idSucursal"
                class="w-full pl-12 pr-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
              >
                <option value="">Seleccione una sucursal</option>
                <option v-for="s in sucursales" :key="s.idsucursal" :value="s.idsucursal">
                  {{ s.nombre }} {{ s.central === 1 ? '(Central)' : s.central === 3 ? '(Cocina)' : '' }}
                </option>
              </select>
              <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <!-- Cargos -->
        <div class="bg-gray-50/80 rounded-3xl p-5 border border-gray-100">
          <div class="flex items-center gap-2 mb-4">
            <UserCog class="h-5 w-5 text-blue-600" />
            <h3 class="text-lg font-bold text-gray-800">Cargos del Empleado</h3>
          </div>

          <div v-if="cargandoCargos" class="py-10 text-center text-gray-500">
            Cargando cargos...
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="cargo in cargos"
              :key="cargo.idcargo"
              type="button"
              @click="toggleCargo(cargo.idcargo)"
              :class="[
                'px-4 py-3 rounded-2xl border-2 transition-all duration-300 font-medium text-sm text-left flex flex-col',
                form.cargosSeleccionados.includes(cargo.idcargo)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg'
                  : 'border-blue-100 text-blue-600 hover:border-blue-200 hover:bg-blue-50'
              ]"
            >
              <span class="font-bold">{{ cargo.nombre }}</span>
              <span :class="['text-xs mt-1', form.cargosSeleccionados.includes(cargo.idcargo) ? 'text-blue-100' : 'text-gray-500']">
                {{ cargo.descripcion }}
              </span>
            </button>
          </div>
          
          <div v-if="!cargandoCargos && !cargos.length" class="py-10 text-center text-gray-400 text-sm">
            No hay cargos disponibles.
          </div>
        </div>

        <!-- Footer Acciones -->
        <div class="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            @click="$emit('cancelar')"
            class="px-6 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2"
          >
            <X class="h-4 w-4" />
            Cancelar
          </button>
          <button
            @click="emitirGuardar"
            :disabled="guardando || !puedeGuardar"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-44"
          >
            <LoaderCircle v-if="guardando" class="animate-spin h-4 w-4" />
            <Save v-else class="h-4 w-4" />
            {{ guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Asignar Empleado' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { X, Save, LoaderCircle, Briefcase, Calendar, DollarSign, MapPin, UserCog, ChevronDown } from 'lucide-vue-next';
import { values } from 'lodash';

const props = defineProps({
  show: { type: Boolean, default: false },
  persona: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
  cargandoCargos: { type: Boolean, default: false },
  cargos: { type: Array, default: () => [] },
  sucursales: { type: Array, default: () => [] },
});

const emit = defineEmits(['guardar', 'cancelar']);

const form = reactive({
  idEmpleado: '',
  fechaIngreso: '',
  salario: 0,
  idSucursal: '',
  cargosSeleccionados: [],
});

const esEdicion = computed(() => Boolean(form.idEmpleado));

const nombrePersona = computed(() => {
  if (!props.persona) return '';
  return [
    props.persona.nombre ?? props.persona.Nombre ?? '',
    props.persona.apellidopaterno ?? props.persona.ApellidoPaterno ?? '',
    props.persona.apellidomaterno ?? props.persona.ApellidoMaterno ?? '',
  ].filter(Boolean).join(' ');
});

const puedeGuardar = computed(() => {
  return form.fechaIngreso && form.cargosSeleccionados.length > 0;
});

const toggleCargo = (idCargo) => {
  const index = form.cargosSeleccionados.indexOf(idCargo);
  if (index > -1) {
    form.cargosSeleccionados.splice(index, 1);
  } else {
    form.cargosSeleccionados.push(idCargo);
  }
};

const inicializarFormulario = () => {
  const p = props.persona;
  const emp = p?.empleado;

  if (emp) {
    form.idEmpleado = emp.idempleado ?? emp.IdEmpleado ?? '';
    form.fechaIngreso = emp.fechaingreso ? String(emp.fechaingreso).substring(0, 10) : '';
    form.salario = emp.salario?.monto ?? emp.monto ?? 0;
    form.idSucursal = emp.sucursal?.idsucursal ?? emp.sucursal?.IdSucursal ?? '';
    form.cargosSeleccionados = (emp.cargos ?? []).map(c => c.idcargo ?? c.IdCargo);
  } else {
    form.idEmpleado = '';
    form.fechaIngreso = new Date().toISOString().substring(0, 10);
    form.salario = 0;
    form.idSucursal = '';
    form.cargosSeleccionados = [];
  }
};
const emitirGuardar = () => {
  emit('guardar', {
    id: form.idEmpleado,
    IdPersona: props.persona?.idpersona ?? props.persona?.IdPersona,
    FechaIngreso: form.fechaIngreso,
    Salario: form.salario,
    fecha: new Date().toISOString().substring(0, 10), // Para el historial de salario
    IdSucursal: form.idSucursal || null,
    Cargos: [...form.cargosSeleccionados]
  });
};

watch(() => props.show, (visible) => {
  if (visible) inicializarFormulario();
});

watch(() => props.persona, () => {
  if (props.show) inicializarFormulario();
});
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.25);
  border-radius: 9999px;
}
</style>
