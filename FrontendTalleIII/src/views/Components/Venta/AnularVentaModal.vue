<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-white/50">
              <div class="flex items-center gap-4 mb-6">
                <div class="p-3 bg-red-100 rounded-2xl">
                  <AlertTriangle class="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <DialogTitle as="h3" class="text-xl font-bold text-gray-800">
                    {{ title || 'Confirmar Anulación' }}
                  </DialogTitle>
                  <p class="text-gray-500 text-sm">#{{ idVenta }}</p>
                </div>
              </div>

              <div class="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                <p class="text-red-700 text-sm font-medium leading-relaxed">
                  {{ message || '¿Estás seguro de que deseas anular esta venta? Esta acción restaurará el stock de los productos y anulará el comprobante asociado. Esta acción no se puede deshacer.' }}
                </p>
              </div>

              <div class="flex gap-3">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all focus:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  @click="$emit('confirm', idVenta)"
                  :disabled="loading"
                  class="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none"
                >
                  <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ loading ? 'Anulando...' : (confirmText || 'Anular Venta') }}</span>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { 
  TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle 
} from '@headlessui/vue';
import { AlertTriangle } from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
  idVenta: String,
  loading: Boolean,
  title: String,
  message: String,
  confirmText: String
});

defineEmits(['close', 'confirm']);
</script>
