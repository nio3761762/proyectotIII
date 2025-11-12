<!-- 
  ADVERTENCIA: Este es un componente de borrador visual (mockup) y no es funcional.
  Los datos son de ejemplo y están fijos en el código.
  Su propósito es mostrar cómo podría lucir una interfaz de despacho.
-->
<template>
  <div class="panel-container">
    
    <div class="map-area">
      <!-- El mapa se renderizará aquí -->
      <div id="map-container" class="map-container"></div>
    </div>

    <div class="sidebar-area">
      <h3>Pedidos Pendientes</h3>
      <ul class="order-list">
        <li v-if="pendingOrders.length === 0">No hay pedidos pendientes.</li>
        <li v-for="order in pendingOrders" :key="order.id" class="order-item">
          <div class="order-details">
            <strong>Pedido #{{ order.id }}</strong>
            <p>Cliente: {{ order.customer }}</p>
            <p>Dirección: {{ order.address }}</p>
          </div>
          <button @click="assignDriver(order)" class="assign-btn">Asignar</button>
        </li>
      </ul> 
    </div>

    <!-- Modal para Asignar Repartidor -->
    <div v-if="isModalVisible" class="modal-overlay">
      <div class="modal-content">
        <h4>Asignar Repartidor</h4>
        <p v-if="selectedOrder">Asignando repartidor al pedido <strong>#{{ selectedOrder.id }}</strong></p>
        
        <div class="form-group">
          <label for="driver-select">Seleccione un repartidor:</label>
          <select id="driver-select" v-model="selectedDriver" class="driver-select">
            <option :value="null" disabled>-- Elija un repartidor --</option>
            <option v-for="driver in availableDrivers" :key="driver.id" :value="driver.id">
              {{ driver.name }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <button @click="confirmAssignment" class="btn-confirm">Confirmar</button>
          <button @click="closeModal" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

// --- ESTADO DEL MODAL ---
const isModalVisible = ref(false);
const selectedOrder = ref(null);
const selectedDriver = ref(null);

// --- DATOS DE EJEMPLO (FIJOS) ---
const pendingOrders = ref([
  {
    id: 'P-123',
    customer: 'Ana Gómez',
    address: 'Av. de la Banda',
    coords: { lat: -21.53, lng: -64.72 }
  },
  {
    id: 'P-124',
    customer: 'Luis Martin',
    address: 'Calle Gral. Trigo',
    coords: { lat: -21.54, lng: -64.73 }
  },
  {
    id: 'P-125',
    customer: 'Marta Soler',
    address: 'Parque Bolívar',
    coords: { lat: -21.53, lng: -64.74 }
  },
    {id: 'P-126',
    customer: 'Marta Soler',
    address: 'Parque Bolívar',
    coords: { lat: -21.5449114, lng: -64.7235489 }
  }
]);

const availableDrivers = ref([
  {
    id: 'R-01',
    name: 'Carlos',
    coords: { lat: -21.52, lng: -64.71 }
  },
  {
    id: 'R-02',
    name: 'Sofía',
    coords: { lat: -21.55, lng: -64.75 }
  }
]);

// --- LÓGICA DE UBICACIÓN EN TIEMPO REAL ---
const driverMarkers = ref({});
let locationUpdateInterval = null;

// **ADVERTENCIA**: Esta es una función de simulación.
// Reemplácela con la llamada real a su API de seguimiento GPS (ej. Trackenlinck).
const fetchDriverLocationsFromTrackenlinck = async () => {
  // Simula una llamada a la API
  console.log('Fetching driver locations...');
  
  // Mapea los repartidores actuales y modifica ligeramente sus coordenadas
  // para simular el movimiento. En un caso real, aquí procesaría los datos
  // de su API para que coincidan con la estructura esperada.
  const updatedDrivers = availableDrivers.value.map(driver => ({
    ...driver,
    coords: {
      lat: driver.coords.lat + (Math.random() - 0.5) * 0.001,
      lng: driver.coords.lng + (Math.random() - 0.5) * 0.001,
    }
  }));

  return updatedDrivers;
};

const updateDriverLocations = async () => {
  try {
    const updatedDrivers = await fetchDriverLocationsFromTrackenlinck();

    updatedDrivers.forEach(driver => {
      const marker = driverMarkers.value[driver.id];
      if (marker) {
        marker.setLatLng([driver.coords.lat, driver.coords.lng]);
      }
      
      // Actualizar la referencia local de `availableDrivers` si es necesario
      const localDriver = availableDrivers.value.find(d => d.id === driver.id);
      if (localDriver) {
        localDriver.coords = driver.coords;
      }
    });
  } catch (error) {
    console.error('Error al actualizar la ubicación de los repartidores:', error);
  }
};

const assignDriver = (order) => {
  selectedOrder.value = order;
  isModalVisible.value = true;
};

const confirmAssignment = () => {
  if (!selectedDriver.value) {
    alert('Por favor, seleccione un repartidor.');
    return;
  }
  
  console.log(`Asignando repartidor ${selectedDriver.value} al pedido ${selectedOrder.value.id}`);
  
  // Aquí iría la lógica para actualizar el backend
  alert(`Repartidor asignado (simulación). Pedido: ${selectedOrder.value.id}, Repartidor: ${selectedDriver.value}`);
  
  closeModal();
};

const closeModal = () => {
  isModalVisible.value = false;
  selectedOrder.value = null;
  selectedDriver.value = null;
};

// --- CICLO DE VIDA DEL COMPONENTE ---
onMounted(() => {
  if (typeof L === 'undefined') {
    console.error('Leaflet no está cargado.');
    return;
  }

  // Coordenadas de Tarija, Bolivia
  const lat = -21.5355;
  const lng = -64.7296;
  const map = L.map('map-container').setView([lat, lng], 13); // Zoom ajustado a 13 para una mejor vista

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Crear y guardar marcadores para los repartidores
  availableDrivers.value.forEach(driver => {
    const driverIcon = L.divIcon({
      html: 'R',
      className: 'map-icon driver-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker([driver.coords.lat, driver.coords.lng], { icon: driverIcon })
      .addTo(map)
      .bindPopup(`<b>Repartidor:</b> ${driver.name}`);
    
    driverMarkers.value[driver.id] = marker;
  });

  // Crear marcadores para los pedidos
  pendingOrders.value.forEach(order => {
    const orderIcon = L.divIcon({
      html: 'P',
      className: 'map-icon order-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    L.marker([order.coords.lat, order.coords.lng], { icon: orderIcon })
      .addTo(map)
      .bindPopup(`<b>Pedido:</b> ${order.id}<br><b>Cliente:</b> ${order.customer}`);
  });

  map.scrollWheelZoom.disable();

  nextTick(() => {
    map.invalidateSize();
  });

  // Iniciar la actualización de ubicaciones en tiempo real
  locationUpdateInterval = setInterval(updateDriverLocations, 5000); // Actualizar cada 5 segundos
});

onUnmounted(() => {
  // Detener la actualización al destruir el componente
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
  }
});
</script>

<style scoped>
.panel-container {
  display: flex;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  width: 100%;
  height: 80vh;
  background-color: #f4f6f8;
}

.map-area {
  flex-grow: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column; /* Asegura que el contenido se apile verticalmente */
}

.map-container {
  position: relative;
  width: 100%;
  flex-grow: 1; /* Hace que el mapa se expanda para llenar el espacio vertical */
  border-radius: 12px;
  z-index: 1; /* Asegura que el mapa esté en su capa correcta */
}

.sidebar-area {
  width: 350px;
  flex-shrink: 0;
  background-color: #fff;
  padding: 1rem;
  border-left: 1px solid #dee2e6;
  overflow-y: auto;
}

.sidebar-area h3 {
  margin-top: 0;
  color: #343a40;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.order-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-item {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.order-details p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #495057;
}

.assign-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.assign-btn:hover {
  background-color: #218838;
}

/* 
  Estilos para los marcadores personalizados de Leaflet.
  Usamos :deep() para asegurar que los estilos se apliquen a los elementos
  generados por Leaflet, que no están directamente en el scope de este componente.
*/
:deep(.map-icon) {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

:deep(.driver-icon) {
  background-color: #007bff;
  border: 2px solid #fff;
}

:deep(.order-icon) {
  background-color: #dc3545;
  border: 2px solid #fff;
}

/* Estilos del Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 450px;
  text-align: left;
}

.modal-content h4 {
  margin-top: 0;
  color: #343a40;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.driver-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #f8f9fa;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-confirm {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #5a6268;
}
</style>