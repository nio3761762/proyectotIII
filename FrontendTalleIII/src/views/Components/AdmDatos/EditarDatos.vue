<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <Edit class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold">Editar Información</h2>
            <p class="text-orange-200 text-sm">Datos de la empresa</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 overflow-y-auto flex-grow space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

          <!-- Nombre empresa -->
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Building class="h-4 w-4 mr-2 text-orange-500" /> Nombre de la Empresa
            </label>
            <input
              v-model="form.nombre"
              @input="validar('nombre')"
              @blur="validar('nombre')"
              :class="inputClass('nombre')"
              placeholder="Ej: Masas C'ori"
            />
            <p v-if="errores.nombre" class="text-red-500 text-xs italic mt-1">{{ errores.nombre }}</p>
          </div>

          <!-- Email -->
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Mail class="h-4 w-4 mr-2 text-orange-500" /> Email
            </label>
            <input
              v-model="form.email"
              type="email"
              @input="validar('email')"
              @blur="validar('email')"
              :class="inputClass('email')"
              placeholder="empresa@gmail.com"
            />
            <p v-if="errores.email" class="text-red-500 text-xs italic mt-1">{{ errores.email }}</p>
          </div>

          <!-- Celular -->
          <div>
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <Phone class="h-4 w-4 mr-2 text-orange-500" /> Celular
            </label>
            <input
              v-model="form.celular"
              @input="validar('celular')"
              @blur="validar('celular')"
              :class="inputClass('celular')"
              placeholder="70123456"
            />
            <p v-if="errores.celular" class="text-red-500 text-xs italic mt-1">{{ errores.celular }}</p>
          </div>

          <!-- Propietario (Combobox) -->
          <div class="md:col-span-2">
            <label class="flex items-center text-gray-700 font-semibold mb-2">
              <User class="h-4 w-4 mr-2 text-orange-500" /> Propietario
            </label>
            <Combobox v-model="form.persona">
              <div class="relative">
                <ComboboxInput
                  class="w-full pl-4 pr-10 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  :displayValue="(p) => p ? `${p.nombre ?? p.Nombre ?? ''} ${p.apellidopaterno ?? p.ApellidoPaterno ?? ''}`.trim() : ''"
                  @change="queryPropietario = $event.target.value"
                  placeholder="Buscar propietario..."
                  @blur="validar('persona')"
                />
                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronUpDownIcon class="h-5 w-5 text-orange-500" />
                </ComboboxButton>
                <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" @after-leave="queryPropietario = ''">
                  <ComboboxOptions class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none">
                    <div v-if="propietariosFiltrados.length === 0 && queryPropietario !== ''" class="px-4 py-3 text-gray-500 select-none">
                      No se encontraron resultados.
                    </div>
                    <ComboboxOption
                      v-for="u in propietariosFiltrados"
                      :key="u.idpersona ?? u.Persona?.IdPersona ?? u.IdPersona"
                      :value="u.persona ?? u.Persona ?? u"
                      v-slot="{ selected, active }"
                    >
                      <li :class="[active ? 'bg-orange-500 text-white' : 'text-gray-700', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                          {{ nombreCompleto(u) }}
                        </span>
                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3">
                          <CheckIcon class="h-5 w-5" :class="active ? 'text-white' : 'text-orange-500'" />
                        </span>
                      </li>
                    </ComboboxOption>
                  </ComboboxOptions>
                </TransitionRoot>
              </div>
            </Combobox>
            <p v-if="errores.persona" class="text-red-500 text-xs italic mt-1">{{ errores.persona }}</p>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50/80 p-5 flex gap-3 border-t border-gray-100 flex-shrink-0">
        <button
          @click="$emit('close')"
          class="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-600 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
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
import { Edit, Building, Mail, Phone, User, X, Save, LoaderCircle } from 'lucide-vue-next';
import {
  Combobox, ComboboxInput, ComboboxButton,
  ComboboxOptions, ComboboxOption, TransitionRoot,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const props = defineProps({
  show:        { type: Boolean, required: true },
  dato:        { type: Object,  required: true }, // datos actuales de la empresa
  guardando:   { type: Boolean, default: false },
  propietarios:{ type: Array,   default: () => [] }, // lista de usuarios/personas
  emails:      { type: Array,   default: () => [] }, // [{ email }] — para validar duplicados
  numeros:     { type: Array,   default: () => [] }, // [{ numero }] — para validar duplicados
});

const emit = defineEmits(['close', 'guardar']);

// ── Formulario local ──────────────────────────────────────────────────────────
const form = reactive({
  iddatos: null,
  nombre:  '',
  email:   '',
  idemail: null,
  celular: '',
  persona: null,  // objeto { idpersona, nombre, apellidopaterno, ... }
});

const errores = reactive({ nombre: '', email: '', celular: '', persona: '' });
const queryPropietario = ref('');

// Inicializar cuando se abre el modal o cambia el dato
watch(() => [props.show, props.dato], () => {
  if (!props.show) return;
  const d = props.dato;
  form.iddatos = d.iddatos ?? d.IdDatos ?? null;
  form.nombre  = d.nombre  ?? d.Nombre  ?? '';
  form.email   = d.email   ?? d.Email?.Email ?? '';
  form.idemail = d.idemail ?? d.Email?.IdEmail ?? null;
  form.celular = d.celular ?? d.Celular ?? '';
  // Persona puede venir como objeto directo o anidado
  form.persona = d.persona ?? d.Persona ?? null;
  Object.keys(errores).forEach(k => errores[k] = '');
}, { immediate: true });

// ── Propietarios filtrados ────────────────────────────────────────────────────
const propietariosFiltrados = computed(() => {
  const q = queryPropietario.value.toLowerCase().trim();
  if (!q) return props.propietarios;
  return props.propietarios.filter(u => nombreCompleto(u).toLowerCase().includes(q));
});

const nombreCompleto = (u) => {
  // Soporta estructura nueva (minúsculas) y vieja (PascalCase)
  const p = u.persona ?? u.Persona ?? u;
  return `${p.nombre ?? p.Nombre ?? ''} ${p.apellidopaterno ?? p.ApellidoPaterno ?? ''} ${p.apellidomaterno ?? p.ApellidoMaterno ?? ''}`.trim();
};

// ── Clases input ──────────────────────────────────────────────────────────────
const inputBase = 'w-full px-4 py-4 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all duration-300 text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20';
const inputClass = (campo) => errores[campo]
  ? `${inputBase} ring-2 ring-red-500/20 bg-red-50`
  : inputBase;

// ── Validaciones ──────────────────────────────────────────────────────────────
const validar = (campo) => {
  switch (campo) {
    case 'nombre':
      if (!form.nombre?.trim())
        errores.nombre = 'El nombre es requerido.';
      else if (!/^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚüÜ']+$/.test(form.nombre))
        errores.nombre = 'Solo letras, números y espacios.';
      else errores.nombre = '';
      break;

    case 'email': {
      const v = form.email?.trim();
      if (!v) { errores.email = 'El email es requerido.'; break; }
      if ((v.match(/@/g) || []).length !== 1) { errores.email = 'Debe tener exactamente un @.'; break; }
      if (!v.endsWith('@gmail.com')) { errores.email = 'Debe terminar en @gmail.com.'; break; }
      if (!/^[a-zA-Z0-9._]+@/.test(v)) { errores.email = 'Caracteres no válidos antes del @.'; break; }
      // Validar duplicado — ignorar el email actual de la empresa
      const emailActual = (props.dato.email ?? props.dato.Email?.Email ?? '').toLowerCase();
      const dup = props.emails
        .filter(e => e.email && e.email.toLowerCase() !== emailActual)
        .some(e => e.email.toLowerCase() === v.toLowerCase());
      errores.email = dup ? 'Este correo ya está en uso.' : '';
      break;
    }

    case 'celular': {
      const v = form.celular?.trim();
      if (!v) { errores.celular = 'El celular es requerido.'; break; }
      if (!/^\d+$/.test(v)) { errores.celular = 'Solo números.'; break; }
      if (v.length < 7 || v.length > 8) { errores.celular = 'Debe tener 7 u 8 dígitos.'; break; }
      // Validar duplicado — ignorar el número actual de la empresa
      const numActual = (props.dato.celular ?? props.dato.Celular ?? '').toString();
      const dup = props.numeros
        .filter(n => n.numero && n.numero !== numActual)
        .some(n => n.numero === v);
      errores.celular = dup ? 'Este número ya está registrado.' : '';
      break;
    }

    case 'persona':
      errores.persona = !form.persona ? 'Debe seleccionar un propietario.' : '';
      break;
  }
};

const validarTodo = () => {
  ['nombre', 'email', 'celular', 'persona'].forEach(validar);
  return Object.values(errores).every(e => !e);
};

// ── Guardar ───────────────────────────────────────────────────────────────────
const guardar = () => {
  if (!validarTodo()) return;
  const p = form.persona;
  emit('guardar', {
    iddatos:   form.iddatos,
    nombre:    form.nombre.trim(),
    email:     form.email.trim(),
    idemail:   form.idemail,
    celular:   form.celular.trim(),
    idpersona: p?.idpersona ?? p?.IdPersona ?? null,
  });
};
</script>
