<template>
  <div 
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="cerrar"
  >
    <div class="bg-white/95 backdrop-blur-sm border-white/50 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Cambiar Contraseña</h2>
          <button
            @click="cerrar"
            class="text-white hover:text-gray-200 transition-colors"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="p-6">
        <form @submit.prevent="cambiar" class="space-y-6">
          <!-- Contraseña Actual -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Key class="h-4 w-4 text-orange-500" />
              Contraseña Actual
            </label>
            <div class="relative">
              <input
                :value="contrasenas.actual"
                @input="$emit('update:contrasenas', { ...contrasenas, actual: $event.target.value })"
                :type="mostrarContrasenaActual ? 'text' : 'password'"
                class="w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700"
                required
              />
              <button
                type="button"
                @click="mostrarContrasenaActual = !mostrarContrasenaActual"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="!mostrarContrasenaActual" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Nueva Contraseña -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock class="h-4 w-4 text-orange-500" />
              Nueva Contraseña
            </label>
            <div class="relative">
              <input
                :value="contrasenas.nueva"
                @input="$emit('update:contrasenas', { ...contrasenas, nueva: $event.target.value })"
                :type="mostrarContrasenaNueva ? 'text' : 'password'"
                class="w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700"
                required
              />
              <button
                type="button"
                @click="mostrarContrasenaNueva = !mostrarContrasenaNueva"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="!mostrarContrasenaNueva" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Confirmar Contraseña -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock class="h-4 w-4 text-orange-500" />
              Confirmar Contraseña
            </label>
            <div class="relative">
              <input
                :value="contrasenas.confirmar"
                @input="$emit('update:contrasenas', { ...contrasenas, confirmar: $event.target.value })"
                :type="mostrarContrasenaConfirmar ? 'text' : 'password'"
                class="w-full px-4 py-3 pr-12 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent transition-all duration-300 text-gray-700"
                required
              />
              <button
                type="button"
                @click="mostrarContrasenaConfirmar = !mostrarContrasenaConfirmar"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="!mostrarContrasenaConfirmar" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Validación de Contraseña -->
          <div v-if="contrasenas.nueva" class="bg-gray-50 rounded-2xl p-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Requisitos de Contraseña:</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <CheckCircle v-if="validarLongitud" class="h-4 w-4 text-green-500" />
                <X v-else class="h-4 w-4 text-red-500" />
                <span :class="validarLongitud ? 'text-green-700' : 'text-red-600'" class="text-sm">
                  Mínimo 8 caracteres
                </span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle v-if="validarMayuscula" class="h-4 w-4 text-green-500" />
                <X v-else class="h-4 w-4 text-red-500" />
                <span :class="validarMayuscula ? 'text-green-700' : 'text-red-600'" class="text-sm">
                  Al menos una mayúscula
                </span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle v-if="validarNumero" class="h-4 w-4 text-green-500" />
                <X v-else class="h-4 w-4 text-red-500" />
                <span :class="validarNumero ? 'text-green-700' : 'text-red-600'" class="text-sm">
                  Al menos un número
                </span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle v-if="validarCoincidencia" class="h-4 w-4 text-green-500" />
                <X v-else class="h-4 w-4 text-red-500" />
                <span :class="validarCoincidencia ? 'text-green-700' : 'text-red-600'" class="text-sm">
                  Las contraseñas coinciden
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex justify-end gap-4">
        <button
          @click="cerrar"
          class="px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border-2 border-gray-300 bg-transparent hover:bg-gray-100 text-gray-600"
        >
          Cancelar
        </button>
        
        <button
          @click="cambiar"
          :disabled="!contrasenaValida"
          class="px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl"
        >
          Cambiar Contraseña
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { Lock, Key, Eye, EyeOff, X, CheckCircle } from 'lucide-vue-next';

defineProps({
  show: Boolean,
  contrasenas: Object,
  validarLongitud: Boolean,
  validarMayuscula: Boolean,
  validarNumero: Boolean,
  validarCoincidencia: Boolean,
  contrasenaValida: Boolean,
});

const emits = defineEmits(['cerrar', 'cambiar', 'update:contrasenas']);

const mostrarContrasenaActual = ref(false);
const mostrarContrasenaNueva = ref(false);
const mostrarContrasenaConfirmar = ref(false);

const cerrar = () => {
  emits('cerrar');
};

const cambiar = () => {
  emits('cambiar');
};
</script>
