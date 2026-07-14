<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('cerrar')"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden">

      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl"><Camera class="h-5 w-5" /></div>
          <h2 class="text-xl font-bold">Actualizar Foto de Perfil</h2>
        </div>
        <button @click="$emit('cerrar')" class="p-2 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 space-y-5">
        <div
          @click="inputRef.click()"
          @dragover.prevent
          @dragenter.prevent="dragActivo = true"
          @dragleave.prevent="dragActivo = false"
          @drop.prevent="onDrop"
          :class="[
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
            dragActivo ? 'border-orange-500 bg-orange-50' : 'border-orange-300 hover:border-orange-500 hover:bg-orange-50/50'
          ]"
        >
          <input ref="inputRef" type="file" accept="image/*" class="hidden" @change="onArchivo" />

          <div v-if="!vistaPrevia" class="space-y-3">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto">
              <Upload class="h-8 w-8 text-orange-500" />
            </div>
            <p class="text-base font-semibold text-gray-700">Arrastra aquí o haz clic para seleccionar</p>
            <p class="text-sm text-gray-400">PNG, JPG, WEBP · hasta 10 MB</p>
          </div>

          <div v-else class="space-y-3">
            <div class="relative inline-block">
              <img :src="vistaPrevia" class="w-32 h-32 rounded-full object-cover mx-auto shadow-lg border-4 border-white" />
              <button @click.stop="limpiar" class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg">
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
            <p class="text-sm text-gray-500">Haz clic para cambiar la imagen</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50/80 p-5 flex gap-3 border-t border-gray-100">
        <button @click="$emit('cerrar')" class="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-600 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
          <X class="h-4 w-4" /> Cancelar
        </button>
        <button
          @click="confirmar"
          :disabled="!archivo || subiendo"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <LoaderCircle v-if="subiendo" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          {{ subiendo ? 'Subiendo...' : 'Guardar Foto' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Camera, Upload, X, Save, LoaderCircle } from 'lucide-vue-next';

const props = defineProps({
  show:        { type: Boolean, required: true },
  imagenActual:{ type: String,  default: ''    },
  subiendo:    { type: Boolean, default: false },
});

const emit = defineEmits(['cerrar', 'subir']);

const inputRef    = ref(null);
const vistaPrevia = ref('');
const archivo     = ref(null);
const dragActivo  = ref(false);

watch(() => props.show, (v) => {
  if (v) { vistaPrevia.value = props.imagenActual || ''; archivo.value = null; }
});

const procesarFile = (file) => {
  if (!file?.type.startsWith('image/')) return;
  archivo.value = file;
  const reader = new FileReader();
  reader.onload = (e) => { vistaPrevia.value = e.target.result; };
  reader.readAsDataURL(file);
};

const onArchivo = (e) => procesarFile(e.target.files[0]);
const onDrop    = (e) => { dragActivo.value = false; procesarFile(e.dataTransfer.files[0]); };
const limpiar   = () => { archivo.value = null; vistaPrevia.value = props.imagenActual || ''; };
const confirmar = () => { if (archivo.value) emit('subir', archivo.value); };
</script>
