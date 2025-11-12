<template>
  <div class="seguimiento-page">
    <h1 class="page-title">Ejemplo de Seguimiento de Envío</h1>
    <p class="page-description">
      Esta página muestra cómo se utilizaría el componente <code>SeguimientoEnvio.vue</code>.
      Los datos del pedido a continuación son un ejemplo fijo.
    </p>
    
    <!-- Usamos el componente de seguimiento y le pasamos los datos de ejemplo -->
    <SeguimientoEnvio :pedido="pedidoDeEjemplo" />

    <div class="info-box">
      <h3>Datos de Ejemplo Utilizados:</h3>
      <pre>{{ pedidoDeEjemplo }}</pre>
      <p>Para probar el botón deshabilitado, puedes cambiar el valor de <code>enlace_seguimiento</code> a <code>null</code> en el código de esta vista.</p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
// Importamos el componente que creamos anteriormente
import SeguimientoEnvio from './SeguimientoEnvio.vue';

// Creamos un objeto de pedido de ejemplo con datos fijos.
// En una aplicación real, estos datos vendrían de una API al cargar la página.
const pedidoDeEjemplo = ref({
  id: "A4B12-789",
  estado_pedido: "En Ruta",
  monto_total: 25.50,
  distribucion: {
    servicio_delivery: "PedidosYa",
    // Este es el enlace que activa el botón. Si es null, el botón aparece deshabilitado.
    enlace_seguimiento: "https://www.pedidosya.com/track-order"
  }
});
</script>

<style scoped>
.seguimiento-page {
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 0.5rem;
}

.page-description {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.info-box {
  margin-top: 3rem;
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-box h3 {
  margin-top: 0;
}

pre {
  background-color: #e9ecef;
  color: #333;
  padding: 1rem;
  border-radius: 6px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

code {
  background-color: #e9ecef;
  padding: 2px 4px;
  border-radius: 4px;
  color: #c7254e;
}
</style>
