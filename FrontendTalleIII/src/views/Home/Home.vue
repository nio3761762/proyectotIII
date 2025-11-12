<template>
      <div class="m-0 p-0 font-sans flex flex-col h-screen ">
    <header class="z-50">
      <Headviews />
    </header>
    
    <main class="flex-1 relative overflow-hidden">
      <Menuviews />
    </main>
  </div>

</template>
<script>
import Menuviews from './MenuComponent.vue';
import Headviews  from './HeaderComponent.vue';
export default {
components: {
    Menuviews,
    Headviews
  },
   data() {
       return {
       name: 'home'
       }
    }};
</script>