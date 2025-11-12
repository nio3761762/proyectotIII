
import { ref } from 'vue';
import { defineStore } from 'pinia';

// Definimos el store con un ID único 'delivery'
export const useDeliveryStore = defineStore('delivery', () => {
  // --- STATE ---
  // La información del pedido que queremos compartir.
  // Se inicializa como null.
  const deliveryInfo = ref(null);

  // --- ACTIONS ---
  // Acción para actualizar la información de la entrega.
  // Cualquier componente podrá llamar a esta función.
  function setDeliveryInfo(idpedido, bario, idsucursal) {
    if (idpedido && bario && idsucursal) {
      deliveryInfo.value = {
        idpedido,
        bario,
        idsucursal,
      };
    } else {
      deliveryInfo.value = null;
    }
  }

  // Acción para limpiar la información.
  function clearDeliveryInfo() {
    deliveryInfo.value = null;
  }

  // Exponemos el state y las actions para que los componentes puedan usarlos.
  return {
    deliveryInfo,
    setDeliveryInfo,
    clearDeliveryInfo,
  };
});
