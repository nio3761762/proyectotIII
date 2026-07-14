<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden animate-fade-in">
        <div class="p-8 text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle class="h-10 w-10 text-red-500" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ title }}</h2>
          <p class="text-gray-600 mb-8">{{ message }}</p>
          <div class="flex gap-4">
            <button 
              @click="$emit('confirm')" 
              class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg transition-all transform hover:scale-105"
            >
              Sí, Anular
            </button>
            <button 
              @click="$emit('close')" 
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg transition-all transform hover:scale-105"
            >
              No, Conservar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next';

defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '¿Confirmar Anulación?' },
  message: { type: String, default: 'Esta acción no se puede deshacer.' }
});

defineEmits(['confirm', 'close']);
</script>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
