<template>
  <div class="seguimiento-card">
    <div class="card-header">
      <h3>Seguimiento del Pedido #{{ pedido.id }}</h3>
      <span :class="`status-badge status-${pedido.estado_pedido.toLowerCase()}`">{{ pedido.estado_pedido }}</span>
    </div>
    <div class="card-body">
      <div class="detalle-pedido">
        <h4>Resumen del Pedido</h4>
        <p><strong>Monto Total:</strong> ${{ pedido.monto_total.toFixed(2) }}</p>
      </div>
      <hr />
      <div class="detalle-envio">
        <h4>Información de Envío</h4>
        <p>
          <strong>Método:</strong> Delivery Externo<br />
          <strong>Servicio:</strong> {{ pedido.distribucion.servicio_delivery }}
        </p>
        <div v-if="pedido.distribucion.enlace_seguimiento">
          <button @click="abrirEnlaceSeguimiento" class="btn-seguir">
            Seguir mi Pedido
          </button>
          <p class="nota-seguimiento">Serás redirigido a la página de {{ pedido.distribucion.servicio_delivery }} para ver el seguimiento en tiempo real.</p>
        </div>
        <div v-else>
          <button class="btn-seguir" disabled>
            Seguimiento no disponible
          </button>
          <p class="nota-seguimiento">El enlace de seguimiento se generará cuando el repartidor recoja tu pedido.</p>
        </div>
      </div>
      <hr />
      <div class="location-section">
        <h4>Mi Ubicación</h4>
        <p class="nota-seguimiento">Puedes obtener tu ubicación automáticamente o pegar un enlace de Google Maps para mayor precisión.</p>

        <!-- Opción 1: Geolocalización Automática -->
        <button @click="getLocation" class="btn-location">
          Obtener Mi Ubicación (Automático)
        </button>

        <!-- Opción 2: Extraer de URL -->
        <div class="url-extractor">
          <input type="text" v-model="googleMapsUrl" placeholder="Pega el enlace de Google Maps aquí" class="url-input" :disabled="isLoading"/>
          <button @click="extractCoordsFromUrl" class="btn-extractor" :disabled="isLoading">
            {{ isLoading ? 'Procesando Enlace...' : 'Extraer Coordenadas' }}
          </button>
        </div>

        <!-- Pantalla de resultados -->
        <div v-if="latitude && longitude" class="location-display">
          <p><strong>Latitud:</strong> {{ latitude }}</p>
          <p><strong>Longitud:</strong> {{ longitude }}</p>
          <p v-if="accuracy"><strong>Precisión:</strong> Aproximadamente {{ accuracy.toFixed(2) }} metros</p>
          <button @click="showOnMap" class="btn-map">
            Mostrar en Mapa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref } from 'vue';

const latitude = ref(null);
const longitude = ref(null);
const accuracy = ref(null);
const googleMapsUrl = ref('');
const isLoading = ref(false);

const props = defineProps({
  pedido: {
    type: Object,
    required: true,
  },
});

const abrirEnlaceSeguimiento = () => {
  if (props.pedido.distribucion && props.pedido.distribucion.enlace_seguimiento) {
    window.open(props.pedido.distribucion.enlace_seguimiento, '_blank');
  }
};

const getLocation = () => {
  if (navigator.geolocation) {
    const options = { enableHighAccuracy: true };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitude.value = position.coords.latitude;
        longitude.value = position.coords.longitude;
        accuracy.value = position.coords.accuracy;
      },
      (error) => {
        console.error("Error getting location: ", error);
        alert(`No se pudo obtener la ubicación. Código de error: ${error.code} - ${error.message}`);
      },
      options
    );
  } else {
    alert("La geolocalización no es soportada por este navegador.");
  }
};

const parseCoordinates = (str) => {
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = str.match(regex);
  if (match && match[1] && match[2]) {
    latitude.value = parseFloat(match[1]);
    longitude.value = parseFloat(match[2]);
    accuracy.value = null;
    googleMapsUrl.value = '';
    return true;
  }
  return false;
};

const extractCoordsFromUrl = async () => {
  const url = googleMapsUrl.value;
  if (!url) {
    alert('Por favor, pega un enlace de Google Maps.');
    return;
  }

  // Si es un enlace largo, intentar procesarlo directamente
  if (parseCoordinates(url)) {
    return;
  }

  // Si es un enlace corto, usar el proxy CORS
  if (url.includes('maps.app.goo.gl')) {
    isLoading.value = true;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Error del proxy: ${response.statusText}`);
      }
      const finalContent = await response.text();

      // El contenido final debería tener la URL larga con las coordenadas
      if (parseCoordinates(finalContent)) {
        // Éxito
      } else {
        alert('El enlace corto no pudo ser resuelto o no contiene coordenadas. Intenta usar el enlace largo de la barra de direcciones.');
      }
    } catch (error) {
      console.error('Error fetching via proxy:', error);
      alert('Ocurrió un error al procesar el enlace corto. Verifica tu conexión o intenta con el enlace largo.');
    } finally {
      isLoading.value = false;
    }
  } else {
    alert('Enlace no válido o no se encontraron coordenadas. Por favor, usa un enlace de Google Maps que contenga "@lat,lon" o un enlace corto de tipo "maps.app.goo.gl".');
  }
};

const showOnMap = () => {
  if (latitude.value && longitude.value) {
    const mapUrl = `https://www.google.com/maps?q=${latitude.value},${longitude.value}`;
    window.open(mapUrl, '_blank');
  }
};
</script>

<style scoped>
.seguimiento-card {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  max-width: 450px;
  margin: 2rem auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background-color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f7f7f7;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.status-badge {
  padding: 0.3rem 0.7rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
}

.status-en.ruta { /* Para estados como "En Ruta" */
  background-color: #007bff;
}

.status-entregado {
  background-color: #28a745;
}

.status-pendiente {
  background-color: #ffc107;
  color: #333;
}

.card-body {
  padding: 1.5rem;
}

.detalle-pedido h4, .detalle-envio h4, .location-section h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #555;
}

hr {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 1.5rem 0;
}

.btn-seguir, .btn-location, .btn-map, .btn-extractor {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 0.5rem;
}

.btn-location {
  background-color: #17a2b8;
}

.btn-extractor {
 background-color: #6c757d;
}

.btn-map {
  background-color: #28a745;
  margin-top: 0.5rem;
}

.btn-seguir:hover:not(:disabled), .btn-location:hover, .btn-map:hover, .btn-extractor:hover {
  opacity: 0.9;
}

.btn-seguir:disabled, .btn-extractor:disabled {
  background-color: #c0c0c0;
  cursor: not-allowed;
}

.nota-seguimiento {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
  margin: 0.5rem 0;
}

.location-display {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f8ff;
  border-radius: 8px;
  border: 1px solid #d1e7fd;
}

.url-extractor {
  margin-top: 1rem;
}

.url-input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-sizing: border-box; /* Asegura que el padding no afecte el ancho total */
}
</style>
