<template>
  <div class="fixed top-20 right-4 w-80 space-y-3 z-[9999]">
    <transition-group name="alert-group">
      <div
        v-for="alert in displayedAlerts"
        :key="alert.id"
        :class="[
          'p-4 rounded-lg shadow-lg',
          alertClasses(alert.tipo)
        ]"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component :is="alertIcon(alert.tipo)" class="h-6 w-6" />
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-semibold">{{ alert.titulo }}</p>
            <p class="text-sm mt-1">{{ alert.descripcion }}</p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button @click="dismissAlert(alert.id)" class="hover:opacity-75">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useAlertStore } from '@/stores/alertStore';
import { storeToRefs } from 'pinia';
import { Bell, X, AlertTriangle, Info } from 'lucide-vue-next';

const alertStore = useAlertStore();
const { currentActiveAlerts } = storeToRefs(alertStore);

const displayedAlerts = ref([]);
const initialLoadQueue = ref([]);
const isInitialProcessing = ref(true);
let initialRevealTimer = null;
let initialDismissTimer = null;

const ALERT_REVEAL_DELAY = 1000; // 1 second between alerts appearing
const INITIAL_BATCH_DISMISS_DELAY = 5000; // 5 seconds after all initial alerts have appeared
const INTERACTIVE_ALERT_LIFETIME = 5000; // 5 seconds for interactive alerts

const alertClasses = (type) => {
  switch (type) {
    case 'critico':
      return 'bg-red-100 border border-red-200 text-red-800';
    case 'info':
      return 'bg-blue-100 border border-blue-200 text-blue-800';
    default:
      return 'bg-gray-100 border border-gray-200 text-gray-800';
  }
};

const alertIcon = (type) => {
  switch (type) {
    case 'critico':
      return AlertTriangle;
    case 'info':
      return Info;
    default:
      return Bell;
  }
};

const dismissAlert = (id) => {
  alertStore.dismissAlert(id);
  // Remove from displayedAlerts immediately
  displayedAlerts.value = displayedAlerts.value.filter(alert => alert.id !== id);
};

const startInitialRevealSequence = () => {
  if (initialLoadQueue.value.length > 0) {
    const nextAlert = initialLoadQueue.value.shift();
    displayedAlerts.value.push(nextAlert);
    initialRevealTimer = setTimeout(startInitialRevealSequence, ALERT_REVEAL_DELAY);
  } else {
    // All initial alerts have been displayed
    isInitialProcessing.value = false;
    startInitialBatchDismissTimer();
  }
};

const startInitialBatchDismissTimer = () => {
  if (displayedAlerts.value.length > 0 && !initialDismissTimer) {
    initialDismissTimer = setTimeout(() => {
      displayedAlerts.value.forEach(alert => {
        alertStore.dismissAlert(alert.id);
      });
      displayedAlerts.value = [];
      initialDismissTimer = null;
    }, INITIAL_BATCH_DISMISS_DELAY);
  }
};

const handleInteractiveAlert = (alert) => {
  displayedAlerts.value.push(alert);
  setTimeout(() => {
    dismissAlert(alert.id);
  }, INTERACTIVE_ALERT_LIFETIME);
};

watch(currentActiveAlerts, (newAlerts, oldAlerts) => {
  const newlyAdded = newAlerts.filter(n => 
    !oldAlerts.some(o => o.id === n.id) &&
    !displayedAlerts.value.some(d => d.id === n.id) &&
    !initialLoadQueue.value.some(q => q.id === n.id)
  );

  if (newlyAdded.length > 0) {
    if (isInitialProcessing.value) {
      initialLoadQueue.value.push(...newlyAdded);
      // If initial sequence hasn't started yet, start it
      if (!initialRevealTimer && !initialDismissTimer) {
        startInitialRevealSequence();
      }
    } else {
      // Handle as interactive alerts
      newlyAdded.forEach(alert => handleInteractiveAlert(alert));
    }
  }
}, { deep: true });

onMounted(() => {
  if (currentActiveAlerts.value.length > 0) {
    initialLoadQueue.value.push(...currentActiveAlerts.value);
    startInitialRevealSequence();
  } else {
    isInitialProcessing.value = false; // No initial alerts, switch to interactive mode immediately
  }
});

onUnmounted(() => {
  if (initialRevealTimer) clearTimeout(initialRevealTimer);
  if (initialDismissTimer) clearTimeout(initialDismissTimer);
});
</script>

<style scoped>
.alert-group-enter-active,
.alert-group-leave-active {
  transition: all 0.5s ease;
}
.alert-group-enter-from,
.alert-group-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>


