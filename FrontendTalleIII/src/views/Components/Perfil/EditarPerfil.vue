<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="cerrar"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl"><Edit class="h-5 w-5" /></div>
          <div>
            <h2 class="text-xl font-bold">Editar Perfil</h2>
            <p class="text-orange-200 text-sm">Actualiza tu información personal</p>
          </div>
        </div>
        <button @click="cerrar" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 overflow-y-auto flex-grow space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

          <!-- Nombre -->
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <User class="h-4 w-4 mr-2 text-orange-500" /> Nombre <span class="text-red-500 ml-1">*</span>
            </label>
            <input v-model="form.nombre" @blur="validar('nombre')" @input="validar('nombre')" :class="inputClass('nombre')" placeholder="Tu nombre" />
            <p v-if="errores.nombre" class="text-red-500 text-xs italic mt-1">{{ errores.nombre }}</p>
          </div>

          <!-- Apellido Paterno -->
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <User class="h-4 w-4 mr-2 text-orange-500" /> Apellido Paterno <span class="text-red-500 ml-1">*</span>
            </label>
            <input v-model="form.apellidopaterno" @blur="validar('apellidopaterno')" @input="validar('apellidopaterno')" :class="inputClass('apellidopaterno')" placeholder="Apellido paterno" />
            <p v-if="errores.apellidopaterno" class="text-red-500 text-xs italic mt-1">{{ errores.apellidopaterno }}</p>
          </div>

          <!-- Apellido Materno -->
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <User class="h-4 w-4 mr-2 text-orange-500" /> Apellido Materno
            </label>
            <input v-model="form.apellidomaterno" :class="inputClass(null)" placeholder="Apellido materno (opcional)" />
          </div>

          <!-- Fecha nacimiento -->
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Calendar class="h-4 w-4 mr-2 text-orange-500" /> Fecha de Nacimiento
            </label>
            <input v-model="form.fechadenacimiento" type="date" :class="inputClass(null)" />
          </div>

          <!-- Email -->
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Mail class="h-4 w-4 mr-2 text-orange-500" /> Email <span class="text-red-500 ml-1">*</span>
            </label>
            <input v-model="form.email" type="email" @blur="validar('email')" @input="validar('email')" :class="inputClass('email')" placeholder="tu@gmail.com" />
            <p v-if="errores.email" class="text-red-500 text-xs italic mt-1">{{ errores.email }}</p>
          </div>

          <!-- Celulares (hasta 2) -->
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Phone class="h-4 w-4 mr-2 text-orange-500" /> Celulares
            </label>
            <div v-for="(cel, idx) in form.celulares" :key="idx" class="flex items-center gap-2 mb-2">
              <input
                v-model="form.celulares[idx].numero"
                @blur="validarCelular(idx)"
                @input="validarCelular(idx)"
                :placeholder="'Celular #' + (idx + 1)"
                :class="[inputBase, errores.celulares[idx] ? 'ring-2 ring-red-500/20 bg-red-50' : '']"
              />
              <button
                v-if="form.celulares.length > 1"
                @click="eliminarCelular(idx)"
                class="w-9 h-9 flex-shrink-0 border border-red-200 hover:bg-red-50 text-red-500 rounded-2xl flex items-center justify-center transition-colors"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
            <template v-for="(err, idx) in errores.celulares" :key="'err-cel-'+idx">
              <p v-if="err" class="text-red-500 text-xs italic mb-1">Cel #{{ idx+1 }}: {{ err }}</p>
            </template>
            <button
              v-if="form.celulares.length < 2"
              @click="agregarCelular"
              class="text-sm text-orange-600 hover:underline"
            >+ Agregar otro número</button>
          </div>

          <!-- CI + Complemento -->
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <IdCard class="h-4 w-4 mr-2 text-orange-500" /> Cédula de Identidad <span class="text-red-500 ml-1">*</span>
            </label>
            <div class="flex">
              <input
                v-model="form.documento"
                @blur="validar('documento')"
                @input="validar('documento')"
                :class="['w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-l-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20', errores.documento ? 'ring-2 ring-red-500/20 bg-red-50' : '']"
                placeholder="Número de CI"
              />
              <select
                v-model="form.idcomplemento"
                class="px-3 border-l border-gray-200 shadow-md bg-gray-50/80 rounded-r-2xl text-sm text-gray-700 outline-none focus:bg-white"
              >
                <option v-for="c in complementos" :key="c.idcomplemento" :value="c.idcomplemento">{{ c.nombre }}</option>
              </select>
            </div>
            <p v-if="errores.documento" class="text-red-500 text-xs italic mt-1">{{ errores.documento }}</p>
          </div>

          <!-- Barrio (Combobox) -->
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Map class="h-4 w-4 mr-2 text-orange-500" /> Barrio
            </label>
            <Combobox v-model="form.barrio">
              <div class="relative">
                <ComboboxInput
                  class="w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  :displayValue="(b) => b?.nombre ?? b?.Nombre ?? ''"
                  @change="queryBarrio = $event.target.value"
                  placeholder="Buscar barrio..."
                />
                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronUpDownIcon class="h-5 w-5 text-orange-500" />
                </ComboboxButton>
                <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryBarrio = ''">
                  <ComboboxOptions class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5">
                    <div v-if="barriosFiltrados.length === 0 && queryBarrio !== ''" class="px-4 py-3 text-gray-400 select-none">No se encontraron resultados.</div>
                    <ComboboxOption v-for="b in barriosFiltrados" :key="b.idbarrio ?? b.IdBarrio" :value="b" v-slot="{ selected, active }">
                      <li :class="[active ? 'bg-orange-500 text-white' : 'text-gray-700', 'cursor-default select-none py-2 pl-10 pr-4 relative']">
                        <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ b.nombre ?? b.Nombre }}</span>
                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3">
                          <CheckIcon class="h-5 w-5" :class="active ? 'text-white' : 'text-orange-500'" />
                        </span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
          </div>

          <!-- Dirección -->
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <MapPin class="h-4 w-4 mr-2 text-orange-500" /> Dirección
            </label>
            <input v-model="form.direccion" :class="inputClass(null)" placeholder="Av. Principal #123" />
          </div>

          <!-- Referencia -->
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <MapPin class="h-4 w-4 mr-2 text-orange-500" /> Referencia
            </label>
            <input v-model="form.referencia" :class="inputClass(null)" placeholder="Cerca del mercado..." />
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50/80 p-5 flex gap-3 border-t border-gray-100 flex-shrink-0">
        <button @click="cerrar" class="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-600 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
          <X class="h-4 w-4" /> Cancelar
        </button>
        <button
          @click="guardar"
          :disabled="guardando"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-60 text-white py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <LoaderCircle v-if="guardando" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import {
  Edit, User, Calendar, Mail, Phone, IdCard,
  Map, MapPin, X, Save, LoaderCircle
} from 'lucide-vue-next';
import {
  Combobox, ComboboxInput, ComboboxButton,
  ComboboxOptions, ComboboxOption, TransitionRoot,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const props = defineProps({
  show:          { type: Boolean, required: true },
  persona:       { type: Object,  required: true },
  guardando:     { type: Boolean, default: false },
  barrios:       { type: Array,   default: () => [] },  // [{ idbarrio, nombre }]
  complementos:  { type: Array,   default: () => [] },  // [{ idcomplemento, nombre }]
  // Listas para validar duplicados (excluye al usuario actual)
  emailsOcupados:   { type: Array, default: () => [] },  // [{ email }]
  numerosOcupados:  { type: Array, default: () => [] },  // [{ numero }]
  documentosOcupados:{ type: Array, default: () => [] }, // [{ documento }]
});

const emit = defineEmits(['cerrar', 'guardar']);

// ── Formulario ────────────────────────────────────────────────────────────────
const form    = reactive({
  nombre: '', apellidopaterno: '', apellidomaterno: '',
  fechadenacimiento: '', email: '',
  celulares:    [{ idcelular: null, numero: '' }],
  documento:    '', iddocumento: null, idcomplemento: '',
  barrio:       null,
  iddireccion:  null, direccion: '', referencia: '',
});

const errores = reactive({
  nombre: '', apellidopaterno: '', email: '', documento: '', celulares: [],
});

const queryBarrio = ref('');

// ── Inicializar desde persona ─────────────────────────────────────────────────
const inicializar = () => {
  const p = props.persona;
  if (!p) return;

  form.nombre           = p.nombre           ?? '';
  form.apellidopaterno  = p.apellidopaterno  ?? '';
  form.apellidomaterno  = p.apellidomaterno  ?? '';
  form.fechadenacimiento= p.fechadenacimiento ? p.fechadenacimiento.substring(0, 10) : '';
  form.email            = p.email            ?? '';
  form.celulares        = p.celulares?.length
    ? p.celulares.map(c => ({ idcelular: c.idcelular, numero: c.numero }))
    : [{ idcelular: null, numero: '' }];
  form.documento        = p.documento?.documento ?? '';
  form.iddocumento      = p.documento?.iddocumento ?? null;
  form.idcomplemento    = p.documento?.complemento?.idcomplemento ?? props.complementos[0]?.idcomplemento ?? '';
  form.barrio           = p.direccion?.barrio ?? null;
  form.iddireccion      = p.direccion?.iddireccion ?? null;
  form.direccion        = p.direccion?.direccion   ?? '';
  form.referencia       = p.direccion?.referencia  ?? '';

  Object.keys(errores).forEach(k => errores[k] = '');
  errores.celulares = [];
};

watch(() => [props.show, props.persona], ([v]) => { if (v) inicializar(); }, { immediate: true });

// ── Barrios filtrados ─────────────────────────────────────────────────────────
const barriosFiltrados = computed(() => {
  const q = queryBarrio.value.toLowerCase().trim();
  if (!q) return props.barrios;
  return props.barrios.filter(b => (b.nombre ?? b.Nombre ?? '').toLowerCase().includes(q));
});

// ── Clases input ──────────────────────────────────────────────────────────────
const inputBase = 'w-full px-4 py-3 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20';
const inputClass = (campo) => campo && errores[campo]
  ? `${inputBase} ring-2 ring-red-500/20 bg-red-50`
  : inputBase;

// ── Validaciones ──────────────────────────────────────────────────────────────
const emailActual    = computed(() => props.persona?.email   ?? '');
const celularActual  = computed(() => props.persona?.celulares?.[0]?.numero ?? '');
const documentoActual= computed(() => props.persona?.documento?.documento ?? '');

const validar = (campo) => {
  switch (campo) {
    case 'nombre':
      errores.nombre = !form.nombre?.trim() ? 'El nombre es requerido.'
        : !/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/.test(form.nombre) ? 'Solo letras y espacios.' : '';
      break;
    case 'apellidopaterno':
      errores.apellidopaterno = !form.apellidopaterno?.trim() ? 'El apellido paterno es requerido.'
        : !/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/.test(form.apellidopaterno) ? 'Solo letras y espacios.' : '';
      break;
    case 'email': {
      const v = form.email?.trim();
      if (!v) { errores.email = 'El email es requerido.'; break; }
      if ((v.match(/@/g)||[]).length !== 1) { errores.email = 'Debe tener exactamente un @.'; break; }
      if (!v.endsWith('@gmail.com')) { errores.email = 'Debe terminar en @gmail.com.'; break; }
      if (!/^[a-zA-Z0-9._]+@/.test(v)) { errores.email = 'Caracteres inválidos antes del @.'; break; }
      // Verificar duplicado ignorando el email actual del usuario
      const dup = props.emailsOcupados
        .filter(e => e.email && e.email.toLowerCase() !== emailActual.value.toLowerCase())
        .some(e => e.email.toLowerCase() === v.toLowerCase());
      errores.email = dup ? 'Este correo ya está en uso.' : '';
      break;
    }
    case 'documento': {
      const v = form.documento?.trim();
      if (!v) { errores.documento = 'La CI es requerida.'; break; }
      if (!/^\d+$/.test(v)) { errores.documento = 'Solo números.'; break; }
      // Verificar duplicado ignorando el documento actual del usuario
      const dup = props.documentosOcupados
        .filter(d => d.documento && d.documento !== documentoActual.value)
        .some(d => d.documento === v);
      errores.documento = dup ? 'Este número de CI ya está registrado.' : '';
      break;
    }
  }
};

const validarCelular = (idx) => {
  const v = form.celulares[idx]?.numero?.trim();
  if (!errores.celulares) errores.celulares = [];
  if (!v) { errores.celulares[idx] = 'El número es requerido.'; return; }
  if (!/^\d+$/.test(v)) { errores.celulares[idx] = 'Solo números.'; return; }
  if (v.length < 7 || v.length > 8) { errores.celulares[idx] = 'Debe tener 7 u 8 dígitos.'; return; }
  // Duplicado ignorando los números actuales del usuario
  const mismosCelulares = props.persona?.celulares?.map(c => c.numero) ?? [];
  const dup = props.numerosOcupados
    .filter(n => n.numero && !mismosCelulares.includes(n.numero))
    .some(n => n.numero === v);
  errores.celulares[idx] = dup ? 'Este número ya está registrado.' : '';
};

const agregarCelular = () => {
  if (form.celulares.length < 2) form.celulares.push({ idcelular: null, numero: '' });
};

const eliminarCelular = (idx) => {
  if (form.celulares.length > 1) { form.celulares.splice(idx, 1); errores.celulares.splice(idx, 1); }
};

const validarTodo = () => {
  ['nombre','apellidopaterno','email','documento'].forEach(validar);
  form.celulares.forEach((_, i) => validarCelular(i));
  return !errores.nombre && !errores.apellidopaterno && !errores.email && !errores.documento
    && errores.celulares.every(e => !e);
};

// ── Guardar ───────────────────────────────────────────────────────────────────
const guardar = () => {
  if (!validarTodo()) return;
  emit('guardar', {
    idpersona:       props.persona.idpersona,
    nombre:          form.nombre.trim(),
    apellidopaterno: form.apellidopaterno.trim(),
    apellidomaterno: form.apellidomaterno.trim(),
    fechadenacimiento: form.fechadenacimiento,
    email:           form.email.trim(),
    celulares:       form.celulares.map(c => ({ ...c, numero: c.numero.trim() })),
    documento:       form.documento.trim(),
    iddocumento:     form.iddocumento,
    idcomplemento:   form.idcomplemento,
    idbarrio:        form.barrio?.idbarrio ?? form.barrio?.IdBarrio ?? null,
    iddireccion:     form.iddireccion,
    direccion:       form.direccion.trim(),
    referencia:      form.referencia.trim(),
  });
};

const cerrar = () => { inicializar(); emit('cerrar'); };
</script>
