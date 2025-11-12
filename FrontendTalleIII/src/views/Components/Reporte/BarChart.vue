<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController   // 👈 agregar esto
} from "chart.js"

// Registrar todos los módulos necesarios
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, BarController)

const props = defineProps({
  chartData: { type: Object, required: true }
})

const canvas = ref(null)
let chartInstance = null

onMounted(() => {
  if (canvas.value) {
    chartInstance = new Chart(canvas.value, {
      type: "bar",
      data: props.data,
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Ventas por día" }
        }
      }
    })
  }
})

watch(
  () => props.chartData,
  (newData) => {
    if (chartInstance) {
      chartInstance.data = newData
      chartInstance.update()
    }
  },
  { deep: true }
)
</script>
