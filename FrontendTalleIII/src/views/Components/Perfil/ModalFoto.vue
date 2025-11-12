<template>
  <div 
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden animate-fade-in">
      <div class="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Camera class="h-6 w-6" />
            <h2 class="text-xl font-bold">Cambiar Foto de Perfil</h2>
          </div>
          <button
            @click="cerrar"
            class="p-2 rounded-xl hover:bg-white/20 transition-colors"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="p-6">
        <!-- Upload Area -->
        <div 
          @click="seleccionarArchivo"
          class="border-2 border-dashed border-orange-300 rounded-2xl p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300 group"
        >
          <input 
            ref="inputArchivo"
            type="file" 
            accept="image/*" 
            class="hidden" 
            @change="manejarArchivo"
          />
          
          <div v-if="!vistaPrevia" class="space-y-4">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Upload class="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-700 mb-2">Seleccionar Imagen</p>
              <p class="text-sm text-gray-500">PNG, JPG, WEBP hasta 5MB</p>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <img 
              :src="vistaPrevia" 
              alt="Vista previa" 
              class="w-32 h-32 rounded-2xl object-cover mx-auto shadow-lg"
            />
            <p class="text-sm font-medium text-gray-700">Haz clic para cambiar la imagen</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-50/80 backdrop-blur-sm p-6 flex gap-3">
        <button
          @click="cerrar"
          class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          Cancelar
        </button>
        
        <button
          @click="subir"
          :disabled="!archivoSeleccionado"
          class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar Foto
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { Camera, Upload, X } from 'lucide-vue-next';

defineProps({
  show: Boolean,
});

const emits = defineEmits(['cerrar', 'subir']);

const vistaPrevia = ref('');
const archivoSeleccionado = ref(null);
const inputArchivo = ref(null);

const cerrar = () => {
  emits('cerrar');
  vistaPrevia.value = '';
  archivoSeleccionado.value = null;
};

const seleccionarArchivo = () => {
  inputArchivo.value.click();
};

const manejarArchivo = (event) => {
  const archivo = event.target.files[0];
  if (archivo) {
    archivoSeleccionado.value = archivo;
    const reader = new FileReader();
    reader.onload = (e) => {
      vistaPrevia.value = e.target.result;
    };
    reader.readAsDataURL(archivo);
  }
};

const subir = () => {
  if (archivoSeleccionado.value) {
    emits('subir', archivoSeleccionado.value);
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
