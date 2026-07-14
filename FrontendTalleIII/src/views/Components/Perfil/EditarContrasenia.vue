<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="cerrar"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden">

      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl"><Lock class="h-5 w-5" /></div>
          <h2 class="text-xl font-bold">Cambiar Contraseña</h2>
        </div>
        <button @click="cerrar" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 space-y-5">

        <!-- Nueva contraseña -->
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Lock class="h-4 w-4 mr-2 text-orange-500" /> Nueva Contraseña
          </label>
          <div class="relative">
            <input
              v-model="form.nueva"
              :type="ver.nueva ? 'text' : 'password'"
              :class="inputClass('nueva')"
              placeholder="••••••••"
            />
            <button type="button" @click="ver.nueva = !ver.nueva" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Eye v-if="!ver.nueva" class="h-5 w-5" /><EyeOff v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Confirmar -->
        <div>
          <label class="flex items-center text-gray-700 font-semibold mb-2">
            <Lock class="h-4 w-4 mr-2 text-orange-500" /> Confirmar Contraseña
          </label>
          <div class="relative">
            <input
              v-model="form.confirmar"
              :type="ver.confirmar ? 'text' : 'password'"
              :class="inputClass('confirmar')"
              placeholder="••••••••"
            />
            <button type="button" @click="ver.confirmar = !ver.confirmar" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Eye v-if="!ver.confirmar" class="h-5 w-5" /><EyeOff v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Checklist requisitos (solo si hay algo escrito) -->
        <div v-if="form.nueva" class="bg-gray-50 rounded-2xl p-4 space-y-2">
          <p class="text-sm font-semibold text-gray-700 mb-2">Requisitos:</p>
          <div v-for="req in requisitos" :key="req.label" class="flex items-center gap-2">
            <CheckCircle v-if="req.ok" class="h-4 w-4 text-green-500 flex-shrink-0" />
            <XCircle v-else class="h-4 w-4 text-red-400 flex-shrink-0" />
            <span :class="req.ok ? 'text-green-700' : 'text-red-500'" class="text-sm">{{ req.label }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50/80 p-5 flex gap-3 border-t border-gray-100">
        <button @click="cerrar" class="flex-1 border border-gray-200 hover:bg-100 text-gray-600 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
          <X class="h-4 w-4" /> Cancelar
        </button>
        <button
          @click="cambiar"
          :disabled="!contrasenaValida || guardando"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <LoaderCircle v-if="guardando" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          {{ guardando ? 'Guardando...' : 'Cambiar Contraseña' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { Lock, Eye, EyeOff, X, CheckCircle, XCircle, Save, LoaderCircle } from 'lucide-vue-next';

const props = defineProps({
  show:      { type: Boolean, required: true },
  email:     { type: String,  default: ''    }, // email del usuario para el payload
  guardando: { type: Boolean, default: false },
});

const emit = defineEmits(['cerrar', 'cambiar']);

const form = reactive({ nueva: '', confirmar: '' });
const ver  = reactive({ nueva: false, confirmar: false });
const errores = reactive({ nueva: '' });

const resetear = () => {
  form.nueva = ''; form.confirmar = '';
  ver.nueva = false; ver.confirmar = false;
  errores.nueva = '';
};

watch(() => props.show, (v) => { if (v) resetear(); });

// Requisitos visuales
const req = (ok, label) => ({ ok, label });
const requisitos = computed(() => [
  req(form.nueva.length >= 8,          'Mínimo 8 caracteres'),
  req(/[A-Z]/.test(form.nueva),        'Al menos una mayúscula'),
  req(/[a-z]/.test(form.nueva),        'Al menos una minúscula'),
  req(/\d/.test(form.nueva),           'Al menos un número'),
  req(/[@$!%*#?&]/.test(form.nueva),   'Al menos un carácter especial'),
  req(form.nueva === form.confirmar && form.nueva !== '', 'Las contraseñas coinciden'),
]);

const contrasenaValida = computed(() => requisitos.value.every(r => r.ok));

const inputBase = 'w-full px-4 py-3 pr-12 border-0 shadow-md bg-gray-50/80 rounded-2xl transition-all text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20';
const inputClass = (campo) => errores[campo] ? `${inputBase} ring-2 ring-red-500/20 bg-red-50` : inputBase;

const cerrar = () => { resetear(); emit('cerrar'); };

const cambiar = () => {
  if (!contrasenaValida.value) return;
  emit('cambiar', {
    email:             props.email,
    password:          form.nueva,
    repetirContrasena: form.confirmar,
  });
};
</script>
