<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden animate-fade-in"
    >
      <div class="p-8 text-center">
        <div
          class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center"
        >
          <AlertTriangle class="h-10 w-10 text-orange-500" />
        </div>

        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          {{ title }}
        </h2>

        <p class="text-gray-600 mb-8">
          <slot>{{ message }}</slot>
        </p>

        <div class="flex gap-4">
          <button
            @click="confirm"
            :class="[
              'flex-1 py-3 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2',
              confirmButtonClass,
            ]"
          >
            <Check class="h-5 w-5" />
            {{ confirmText }}
          </button>

          <button
            @click="cancel"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2"
          >
            <X class="h-5 w-5" />
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { AlertTriangle, Check, X } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Confirmar',
  },
  cancelText: {
    type: String,
    default: 'Cancelar',
  },
  confirmButtonClass: {
    type: String,
    default: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-500',
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => {
  emit('confirm');
};

const cancel = () => {
  emit('cancel');
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