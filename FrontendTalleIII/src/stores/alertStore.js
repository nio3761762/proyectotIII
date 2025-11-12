
import { defineStore } from 'pinia';
import { Alertas } from '@/Server/CubeOlap';

export const useAlertStore = defineStore('alertStore', {
  state: () => ({
    activeAlerts: [],
    allAlerts: [], // New state to keep all fetched alerts
    dismissedAlertIds: new Set(),
    stockStatus: {}, // To track the status of stock alerts
  }),
  getters: {
    allAlertsHistory: (state) => state.allAlerts,
    currentActiveAlerts: (state) => state.activeAlerts,
  },
  actions: {
    async fetchAlerts() {
      try {
        const rawAlerts = await Alertas(''); // Fetch for all branches
        
        const newMappedAlerts = rawAlerts.map(alerta => {
          let tipoMapped = 'info';
          let tituloMapped = '';

          switch (alerta.type) {
            case 'Stock':
              tipoMapped = 'critico';
              tituloMapped = 'Alerta de Stock';
              break;
            case 'Reserva':
              tipoMapped = 'info';
              tituloMapped = 'Nueva Reserva';
              break;
            case 'Pedido':
              tipoMapped = 'info';
              tituloMapped = 'Nuevo Pedido';
              break;
            default:
              tipoMapped = 'info';
              tituloMapped = 'Notificación';
          }

          return {
            id: alerta.id,
            tipo: tipoMapped,
            titulo: tituloMapped,
            descripcion: alerta.description,
            date: alerta.date,
            time: alerta.time,
          };
        });

        // Add all newly fetched alerts to allAlerts history
        const uniqueNewAlertsForHistory = newMappedAlerts.filter(newAlert => 
          !this.allAlerts.some(existingAlert => existingAlert.id === newAlert.id)
        );
        this.allAlerts = [...this.allAlerts, ...uniqueNewAlertsForHistory];

        // Update active alerts, filtering out already active and dismissed ones
        // Also manage dismissedAlertIds for stock alerts based on resolution
        const activeStockAlertIds = new Set(this.activeAlerts.filter(a => a.tipo === 'critico').map(a => a.id));
        const incomingStockAlertIds = new Set(newMappedAlerts.filter(a => a.tipo === 'critico').map(a => a.id));

        // Clear dismissed status for stock alerts that are no longer reported
        activeStockAlertIds.forEach(alertId => {
          if (!incomingStockAlertIds.has(alertId)) {
            this.dismissedAlertIds.delete(alertId);
          }
        });

        const newActiveAlerts = newMappedAlerts.filter(newAlert => 
          !this.activeAlerts.some(existingAlert => existingAlert.id === newAlert.id) &&
          !this.dismissedAlertIds.has(newAlert.id)
        );

        if (newActiveAlerts.length > 0) {
          this.activeAlerts = [...this.activeAlerts, ...newActiveAlerts];
        }

      } catch (error) {
        console.error('Error fetching alerts:', error);
        this.activeAlerts = [];
        this.allAlerts = [];
      }
    },
    dismissAlert(alertId) {
      this.dismissedAlertIds.add(alertId);
      this.activeAlerts = this.activeAlerts.filter(alert => alert.id !== alertId);
    }
  },
});
