
<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import AlertDisplay from '@/views/Components/AlertDisplay.vue'



onMounted(() => {
});
</script>

<template>
  <div class="bg-orange-50">
    <AlertDisplay />
    <RouterView />
  </div>
</template>

<style scoped>
</style>
