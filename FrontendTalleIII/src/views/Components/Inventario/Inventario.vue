<template>
  <div class="p-6 max-w-7xl mx-auto">
    <BajaProducto
      :IdSucursal="sucursalId"
      @toast="mostrarNotificacion"
      @success="recargar"
      @close="cerrar"
    />

    <Transition name="slide-up">
      <div v-if="notificacion.visible"
        class="fixed bottom-6 right-6 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 font-bold"
        :class="notificacion.error ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-orange-500 to-red-600'">
        <CheckCircle class="h-5 w-5" />
        {{ notificacion.mensaje }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { CheckCircle } from 'lucide-vue-next'
import BajaProducto from './BajaProducto.vue'
import { SucursalUsuario } from '@/Server/Usuario'

const sucursalId = ref('')
const notificacion = reactive({ visible: false, mensaje: '', error: false })

const idUsuario = () => {
  const u = localStorage.getItem('usuario')
  if (!u) return null
  try { return JSON.parse(u).IdUsuario || JSON.parse(u).idusuario || null }
  catch { return null }
}

const mostrarNotificacion = (mensaje, error) => {
  notificacion.mensaje = mensaje
  notificacion.error = (error === true || error === 'error')
  notificacion.visible = true
  setTimeout(() => { notificacion.visible = false }, 3000)
}

const recargar = () => {}
const cerrar = () => {}

onMounted(async () => {
  const id = idUsuario()
  if (!id) return
  try {
    const res = await SucursalUsuario(id)
    if (res?.IdSucursal) sucursalId.value = res.IdSucursal
    else if (res?.idsucursal) sucursalId.value = res.idsucursal
  } catch (err) {
    console.error(err)
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from { opacity: 0; transform: translateY(30px) scale(0.95); }
.slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
