
<script setup>
import { RouterView } from 'vue-router'
import AlertDisplay from '@/views/Components/AlertDisplay.vue'
</script>

<template>
  <div class="bg-orange-50">
    <AlertDisplay />
    <RouterView />
  </div>
</template>

<style scoped>
</style>
