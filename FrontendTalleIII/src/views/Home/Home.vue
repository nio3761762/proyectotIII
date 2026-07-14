<template>
  <div class="m-0 p-0 font-sans flex flex-col h-screen">
    <div v-if="showWelcome" class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-100 via-orange-100 to-red-100 overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300 to-red-400 rounded-full blur-3xl opacity-30" style="animation: pulse-slow 2s infinite"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-300 to-orange-400 rounded-full blur-2xl opacity-30" style="animation: pulse-slow 2s 0.5s infinite"></div>

      <div class="relative text-center">
        <div class="mb-8" style="animation: bounce-slow 2s ease-in-out infinite">
          <div class="w-32 h-32 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl flex items-center justify-center">
            <BarChart3 class="h-16 w-16 text-white" style="animation: pulse-slow 1.5s infinite" />
          </div>
        </div>

        <h1 class="text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent mb-4" style="animation: slide-up 0.6s ease-out forwards">
          Bienvenidos
        </h1>
        <p class="text-2xl text-gray-600 font-medium" style="animation: slide-up 0.6s 0.2s ease-out forwards">
          Masas C'ori
        </p>
      </div>
    </div>

    <header class="z-50">
      <Headviews />
    </header>
    
    <main class="flex-1 relative overflow-hidden">
      <Menuviews />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BarChart3 } from 'lucide-vue-next'
import Menuviews from './MenuComponent.vue'
import Headviews from './HeaderComponent.vue'

const showWelcome = ref(true)

setTimeout(() => {
  showWelcome.value = false
}, 2500)
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>