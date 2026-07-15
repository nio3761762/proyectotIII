<template>
  <div class="space-y-8">

    <!-- Header -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-600/10 rounded-3xl"></div>
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
        <div class="flex items-center gap-4">
          <button @click="$emit('cancelar')" class="rounded-2xl hover:bg-orange-50 p-2 transition-colors">
            <ArrowLeft class="h-5 w-5" />
          </button>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <Building class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                {{ esNueva ? 'Registrar' : 'Actualizar' }} Sucursal
              </h1> 
              <p class="text-gray-600 mt-1">{{ esNueva ? 'Crea una nueva sucursal' : 'Modifica los datos de la sucursal' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div> 

    <!-- Información General -->
    <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
      <div class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-6">
        <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
          <Info class="h-5 w-5 text-orange-600" /> Información General
        </h3>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Building class="h-5 w-5 mr-2 text-orange-500" /> Nombre de la Sucursal
          </label>
          <input v-model="form.nombre" @blur="validar('nombre')" :class="inputClass('nombre')" placeholder="Ej: Sucursal Centro" />
          <p v-if="errores.nombre" class="text-red-500 text-xs italic mt-1">{{ errores.nombre }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Hash class="h-5 w-5 mr-2 text-orange-500" /> Número
          </label>
          <input v-model="form.nro" @blur="validar('nro')" :class="inputClass('nro')" placeholder="Ej: 001" />
          <p v-if="errores.nro" class="text-red-500 text-xs italic mt-1">{{ errores.nro }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Smartphone class="h-5 w-5 mr-2 text-orange-500" /> Celular
          </label>
          <input v-model="form.celular" @blur="validar('celular')" :class="inputClass('celular')" placeholder="70123456" />
          <p v-if="errores.celular" class="text-red-500 text-xs italic mt-1">{{ errores.celular }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Info class="h-5 w-5 mr-2 text-orange-500" /> Tipo
          </label>
          <select v-model="form.central" class="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/80 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-gray-700">
            <option :value="1">Central</option>
            <option :value="2">Normal</option>
            <option :value="3">Cocina</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Horarios por día -->
    <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
        <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
          <Clock class="h-5 w-5 text-blue-600" /> Horarios por Día
        </h3>
      </div>
      <div class="p-6 space-y-3">
        <div
          v-for="(horario, dayIndex) in form.horarios"
          :key="horario.dia"
          class="flex flex-col p-4 rounded-2xl border transition-all duration-200"
          :class="horario.activo ? 'bg-blue-50/60 border-blue-200' : 'bg-gray-50/60 border-gray-200'"
        >
          <div class="flex items-center justify-between mb-2">
            <!-- Toggle día activo -->
            <div class="flex items-center gap-3 w-40 flex-shrink-0">
              <button
                type="button"
                @click="toggleDia(dayIndex)"
                :class="['relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0',
                  horario.activo ? 'bg-blue-500' : 'bg-gray-300']"
              >
                <span :class="['absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                  horario.activo ? 'left-5' : 'left-0.5']" />
              </button>
              <span class="text-sm font-semibold text-gray-700">{{ horario.dia }}</span>
            </div>

            <button
              v-if="horario.activo"
              type="button"
              @click="agregarTurno(dayIndex)"
              class="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 text-xs px-2"
            >
              <Plus class="h-3.5 w-3.5" />
              <span>Turno</span>
            </button>
          </div>

          <!-- Turnos -->
          <div v-if="horario.activo" class="space-y-3 mt-2">
            <div
              v-for="(turno, tIndex) in horario.turnos"
              :key="tIndex"
              class="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white/80 p-3 rounded-xl border border-blue-100 shadow-sm"
            >
              <div class="w-full sm:w-32">
                <select
                  v-model="turno.tipo"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                >
                  <option value="Turno">Turno</option>
                  <option value="Produccion">Produccion</option>
                </select>
              </div>

              <div class="flex items-center gap-2 flex-1 w-full">
                <div class="flex-1">
                  <input
                    v-model="turno.horaentrada"
                    type="time"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                  />
                </div>
                <span class="text-gray-400">–</span>
                <div class="flex-1">
                  <input
                    v-model="turno.horasalida"
                    type="time"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                @click="eliminarTurno(dayIndex, tIndex)"
                class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-center"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <template v-else>
            <span class="text-sm text-gray-400 italic">Cerrado</span>
          </template>
        </div>
        <p v-if="errores.horarios" class="text-red-500 text-xs italic">{{ errores.horarios }}</p>
      </div>
    </div>

    <!-- Ubicación -->
    <div class="bg-white/80 backdrop-blur-sm shadow-xl border-white/50 rounded-3xl overflow-hidden">
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6">
        <h3 class="text-xl text-gray-800 flex items-center gap-2 font-semibold">
          <MapPin class="h-5 w-5 text-green-600" /> Ubicación
        </h3>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Globe class="h-5 w-5 mr-2 text-green-500" /> Departamento
          </label>
          <select v-model="selDepartamento" @change="onDepartamento" :class="inputClass('departamento')">
            <option :value="null" disabled>Seleccione</option>
            <option v-for="d in departamentos" :key="d.IdDepto" :value="d.IdDepto">{{ d.Nombre }}</option>
          </select>
          <p v-if="errores.departamento" class="text-red-500 text-xs italic mt-1">{{ errores.departamento }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Building class="h-5 w-5 mr-2 text-green-500" /> Ciudad
          </label>
          <select v-model="selCiudad" @change="onCiudad" :disabled="!selDepartamento" :class="inputClass('ciudad')">
            <option :value="null" disabled>Seleccione</option>
            <option v-for="c in ciudades" :key="c.IdCiudad" :value="c.IdCiudad">{{ c.Nombre }}</option>
          </select>
          <p v-if="errores.ciudad" class="text-red-500 text-xs italic mt-1">{{ errores.ciudad }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Map class="h-5 w-5 mr-2 text-green-500" /> Distrito
          </label>
          <select v-model="selDistrito" @change="onDistrito" :disabled="!selCiudad" :class="inputClass('distrito')">
            <option :value="null" disabled>Seleccione</option>
            <option v-for="d in distritos" :key="d.IdDistrito" :value="d.IdDistrito">{{ d.Nombre }}</option>
          </select>
          <p v-if="errores.distrito" class="text-red-500 text-xs italic mt-1">{{ errores.distrito }}</p>
        </div>

        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <MapPin class="h-5 w-5 mr-2 text-green-500" /> Barrio
          </label>
          <select v-model="selBarrio" :disabled="!selDistrito" :class="inputClass('barrio')" @blur="validar('barrio')">
            <option :value="null" disabled>Seleccione</option>
            <option v-for="b in barrios" :key="b.IdBarrio" :value="b.IdBarrio">{{ b.Nombre }}</option>
          </select>
          <p v-if="errores.barrio" class="text-red-500 text-xs italic mt-1">{{ errores.barrio }}</p>
        </div>

        <div class="md:col-span-2">
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <MapPin class="h-5 w-5 mr-2 text-green-500" /> Dirección
          </label>
          <input v-model="form.direccion" @blur="validar('direccion')" :class="inputClass('direccion')" placeholder="Av. Principal #123" />
          <p v-if="errores.direccion" class="text-red-500 text-xs italic mt-1">{{ errores.direccion }}</p>
        </div>

        <div class="md:col-span-2">
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <ClipboardList class="h-5 w-5 mr-2 text-green-500" /> Referencia
          </label>
          <input v-model="form.referencia" :class="inputClass(null)" placeholder="Cerca del mercado central" />
        </div>

        <div class="md:col-span-2">
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Globe class="h-5 w-5 mr-2 text-green-500" /> Ubicación GPS
          </label>
          <input v-model="form.ubicacion" :class="inputClass(null)" placeholder="-21.5355, -64.7296" />
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
      <button type="button" @click="$emit('cancelar')"
        class="px-8 py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl bg-transparent transition-colors flex items-center gap-2 text-gray-600">
        <X class="h-4 w-4" /> Cancelar
      </button>
      <button type="button" @click="guardar" :disabled="guardando"
        class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold">
        <LoaderCircle v-if="guardando" class="h-4 w-4 animate-spin" />
        <Save v-else class="h-4 w-4" />
        {{ guardando ? 'Guardando...' : (esNueva ? 'Registrar' : 'Actualizar') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import {
  ArrowLeft, Building, Info, Hash, Smartphone, Clock,
  MapPin, Map, ClipboardList, Globe, X, Save, LoaderCircle, Plus, Trash2
} from 'lucide-vue-next';
import { getDepartamento, getCiudad, getDistrito, getBarrio } from '@/Server/Direccion';

const props = defineProps({
  sucursal:  { type: Object,  default: null  },
  guardando: { type: Boolean, default: false },
});

const emit = defineEmits(['guardar', 'cancelar']);

const esNueva = ref(!props.sucursal?.idsucursal);

// Días de la semana
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const horarioVacio = () => DIAS.map(dia => ({
  dia,
  activo: false,
  turnos: [{
    idhorario:   null,
    horaentrada: '08:00',
    horasalida:  '18:00',
    tipo:        'Turno',
  }],
}));

const formVacio = () => ({
  idsucursal: null,
  nombre:     '',
  nro:        '',
  celular:    '',
  central:    2,
  horarios:   horarioVacio(),
  direccion:  '',
  referencia: '',
  ubicacion:  '',
});

const form    = reactive(formVacio());
const errores = reactive({
  nombre: '', nro: '', celular: '', horarios: '',
  departamento: '', ciudad: '', distrito: '', barrio: '', direccion: '',
});

// Ubicación jerárquica
const departamentos = ref([]);
const ciudades      = ref([]);
const distritos     = ref([]);
const barrios       = ref([]);
const selDepartamento = ref(null);
const selCiudad       = ref(null);
const selDistrito     = ref(null);
const selBarrio       = ref(null);

// ── Inicializar ──────────────────────────────────────────────────────────────
const inicializar = async () => {
  departamentos.value = await getDepartamento();
  const s = props.sucursal;
  if (!s) { Object.assign(form, formVacio()); esNueva.value = true; return; }

  esNueva.value       = false;
  form.idsucursal     = s.idsucursal;
  form.nombre         = s.nombre         ?? '';
  form.nro            = s.nro            ?? '';
  form.celular        = s.celular        ?? '';
  form.central        = s.central        ?? 2;
  form.direccion      = s.direccion?.direccion  ?? '';
  form.referencia     = s.direccion?.referencia ?? '';
  form.ubicacion      = s.direccion?.ubicacion  ?? '';

  // Normalizar para comparación
  const normalizar = (t) => t?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

  const plantilla = horarioVacio();
  const horariosBackend = s.horario || s.horarios || [];
  
  if (Array.isArray(horariosBackend)) {
    // Identificar qué días tienen datos para resetear sus turnos por defecto
    const diasConDatos = new Set(horariosBackend.map(h => normalizar(h.dia)));
    
    plantilla.forEach(p => {
      if (diasConDatos.has(normalizar(p.dia))) {
        p.turnos = [];
        p.activo = true;
      }
    });

    horariosBackend.forEach(h => {
      const diaBusca = normalizar(h.dia);
      const dayIdx = plantilla.findIndex(p => normalizar(p.dia) === diaBusca);
      if (dayIdx !== -1) {
        plantilla[dayIdx].turnos.push({ 
          idhorario: h.idhorario, 
          horaentrada: h.horaentrada?.substring(0, 5) || '08:00', 
          horasalida:  h.horasalida?.substring(0, 5)  || '18:00', 
          tipo: h.tipo || 'Turno' 
        });
      }
    });
  }
  form.horarios = plantilla; 

  // Cargar jerarquía de dirección
  const barrio = s.direccion?.barrio;
  if (barrio?.distrito?.ciudad?.departamento) {
    selDepartamento.value = barrio.distrito.ciudad.departamento.iddepto;
    ciudades.value  = await getCiudad(selDepartamento.value);
    selCiudad.value = barrio.distrito.ciudad.idciudad;
    distritos.value = await getDistrito(selCiudad.value);
    selDistrito.value = barrio.distrito.iddistrito;
    barrios.value   = await getBarrio(selDistrito.value);
    selBarrio.value = barrio.idbarrio;
  }
};

watch(() => props.sucursal, inicializar, { immediate: true });

// ── Jerarquía ────────────────────────────────────────────────────────────────
const onDepartamento = async () => {
  selCiudad.value = null; selDistrito.value = null; selBarrio.value = null;
  ciudades.value = []; distritos.value = []; barrios.value = [];
  if (selDepartamento.value) ciudades.value = await getCiudad(selDepartamento.value);
  errores.departamento = '';
};
const onCiudad = async () => {
  selDistrito.value = null; selBarrio.value = null;
  distritos.value = []; barrios.value = [];
  if (selCiudad.value) distritos.value = await getDistrito(selCiudad.value);
  errores.ciudad = '';
};
const onDistrito = async () => {
  selBarrio.value = null; barrios.value = [];
  if (selDistrito.value) barrios.value = await getBarrio(selDistrito.value);
  errores.distrito = '';
};

// ── Toggle día ───────────────────────────────────────────────────────────────
const toggleDia = (index) => { 
  form.horarios[index].activo = !form.horarios[index].activo;
  if (form.horarios[index].activo && form.horarios[index].turnos.length === 0) {
    agregarTurno(index);
  }
};

const agregarTurno = (dayIndex) => {
  form.horarios[dayIndex].turnos.push({
    idhorario: null,
    horaentrada: '08:00',
    horasalida: '18:00',
    tipo: 'Turno'
  });
};

const eliminarTurno = (dayIndex, turnoIndex) => {
  form.horarios[dayIndex].turnos.splice(turnoIndex, 1);
  if (form.horarios[dayIndex].turnos.length === 0) {
    form.horarios[dayIndex].activo = false;
  }
};

// ── Clases input ─────────────────────────────────────────────────────────────
const inputBase = 'w-full px-4 py-3 border rounded-2xl bg-gray-50/80 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-gray-700 placeholder:text-gray-400 transition-all';
const inputClass = (campo) => campo && errores[campo]
  ? `${inputBase} border-red-300 bg-red-50`
  : `${inputBase} border-gray-200`;

// ── Validaciones ─────────────────────────────────────────────────────────────
const validar = (campo) => {
  switch (campo) {
    case 'nombre':
      errores.nombre = !form.nombre.trim() ? 'El nombre es requerido.' : '';
      break;
    case 'nro':
      errores.nro = !form.nro.toString().trim() ? 'El número es requerido.'
        : !/^\d+$/.test(form.nro) ? 'Solo números.' : '';
      break;
    case 'celular':
      errores.celular = form.celular && form.celular.length < 7 ? 'Debe tener al menos 7 dígitos.' : '';
      break;
    case 'departamento':
      errores.departamento = !selDepartamento.value ? 'Seleccione un departamento.' : '';
      break;
    case 'ciudad':
      errores.ciudad = !selCiudad.value ? 'Seleccione una ciudad.' : '';
      break;
    case 'distrito':
      errores.distrito = !selDistrito.value ? 'Seleccione un distrito.' : '';
      break;
    case 'barrio':
      errores.barrio = !selBarrio.value ? 'Seleccione un barrio.' : '';
      break;
    case 'direccion':
      errores.direccion = !form.direccion.trim() ? 'La dirección es requerida.' : '';
      break;
  }
};

const validarTodo = () => {
  ['nombre','nro','celular','departamento','ciudad','distrito','barrio','direccion'].forEach(validar);
  const horariosActivos = form.horarios.filter(h => h.activo);
  errores.horarios = horariosActivos.length === 0 ? 'Debe activar al menos un día.' : '';
  return Object.values(errores).every(e => !e);
};

// ── Guardar ──────────────────────────────────────────────────────────────────
const guardar = () => {
  if (!validarTodo()) return;

  const horariosActivos = form.horarios
    .filter(d => d.activo)
    .flatMap(d => d.turnos.map(t => ({
      ...(t.idhorario ? { idhorario: t.idhorario } : {}),
      dia:         d.dia,
      horaentrada: t.horaentrada,
      horasalida:  t.horasalida,
      Tipo:        t.tipo // Envía 'Tipo' con T mayúscula
    })));

  emit('guardar', {
    idsucursal: form.idsucursal,
    nombre:     form.nombre.trim(),
    nro:        form.nro,
    celular:    form.celular,
    central:    form.central,
    horarios:   horariosActivos,
    idbarrio:   selBarrio.value,
    direccion:  form.direccion.trim(),
    referencia: form.referencia.trim(),
    ubicacion:  form.ubicacion.trim(),
  });
};
</script>
