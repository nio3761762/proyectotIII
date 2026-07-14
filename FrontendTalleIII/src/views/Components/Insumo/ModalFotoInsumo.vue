<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-sm overflow-hidden">

      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl"><Camera class="h-4 w-4" /></div>
          <div>
            <h2 class="text-lg font-bold">Actualizar Imagen</h2>
            <p class="text-blue-200 text-xs">{{ nombreInsumo }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-1.5 rounded-xl hover:bg-white/20 transition-colors">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div
          @click="inputRef.click()"
          @dragover.prevent
          @dragenter.prevent="drag = true"
          @dragleave.prevent="drag = false"
          @drop.prevent="onDrop"
          :class="['border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
            drag ? 'border-blue-500 bg-blue-50' : 'border-orange-300 hover:border-orange-500 hover:bg-orange-50/50']"
        >
          <input ref="inputRef" type="file" accept="image/*" class="hidden" @change="onArchivo" />
          <div v-if="!preview" class="space-y-2">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mx-auto flex items-center justify-center">
              <Upload class="h-6 w-6 text-orange-500" />
            </div>
            <p class="text-sm font-semibold text-gray-700">Arrastra o haz clic</p>
            <p class="text-xs text-gray-400">PNG, JPG, WEBP · 10 MB max</p>
          </div>
          <div v-else class="space-y-2">
            <div class="relative inline-block">
              <img :src="preview" class="w-28 h-28 rounded-2xl object-cover mx-auto shadow-md" />
              <button @click.stop="limpiar" class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow">
                <X class="h-3 w-3" />
              </button>
            </div>
            <p class="text-xs text-gray-400">Haz clic para cambiar</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-50/80 p-4 flex gap-3 border-t border-gray-100">
        <button @click="$emit('close')" class="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-600 py-2.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-1.5">
          <X class="h-3.5 w-3.5" /> Cancelar
        </button>
        <button
          @click="confirmar"
          :disabled="!archivo || subiendo"
          class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-2xl shadow-lg text-sm transition-all flex items-center justify-center gap-1.5 font-semibold"
        >
          <LoaderCircle v-if="subiendo" class="h-3.5 w-3.5 animate-spin" />
          <Save v-else class="h-3.5 w-3.5" />
          {{ subiendo ? 'Subiendo...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Camera, Upload, X, Save, LoaderCircle } from 'lucide-vue-next';

const props = defineProps({
  show:         { type: Boolean, required: true },
  nombreInsumo: { type: String,  default: ''    },
  imagenActual: { type: String,  default: ''    },
  subiendo:     { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'guardar']);

const inputRef = ref(null);
const preview  = ref('');
const archivo  = ref(null);
const drag     = ref(false);

watch(() => props.show, (v) => { if (v) { preview.value = props.imagenActual; archivo.value = null; } });

const procesar = (file) => {
  if (!file?.type.startsWith('image/')) return;
  archivo.value = file;
  const r = new FileReader();
  r.onload = (e) => { preview.value = e.target.result; };
  r.readAsDataURL(file);
};
const onArchivo = (e) => procesar(e.target.files[0]);
const onDrop    = (e) => { drag.value = false; procesar(e.dataTransfer.files[0]); };
const limpiar   = () => { archivo.value = null; preview.value = props.imagenActual; };
const confirmar = () => { if (archivo.value) emit('guardar', archivo.value); };
</script>
