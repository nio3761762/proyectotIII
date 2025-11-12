import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../views/Auth/Login.vue'
import home from '../views/Home/Home.vue'
import AdmDatos from '../views/Components/AdmDatos/AdmDatos.vue'
import Perfil from '../views/Components/Perfil/Perfil.vue'
import Usuario from '../views/Components/Usuario/Usuario.vue'
import Repartidor from '@/views/Components/Repartidor/Repartidor.vue'
import Rol from '../views/Components/Rol/Rol.vue'
import Recup from '../views/Auth/Recuperar.vue'
import Producto from '@/views/Components/Producto/Producto.vue'
import Categoria from '@/views/Components/Categoria/Categoria.vue'
import Medida from '@/views/Components/Medida/Medida.vue'
import Venta from '@/views/Components/Venta.vue'
import Promocion from '@/views/Components/Promocion/Promocion.vue'
import Insumo from '@/views/Components/Insumo/Insumo.vue'
import Cliente from '@/views/Components/Cliente/Cliente.vue'
import Proveedor from '@/views/Components/Proveedor/Proveedor.vue'
import Comision from '@/views/Components/Comision/Comision.vue'
import Compra from '../views/Components/Compra.vue'
import Reserva from '@/views/Components/Reserva.vue'
import Entrega from '@/views/Components/Entrega.vue'
import Presentacion from '@/views/Components/Presentacion/Presentacion.vue'
import Landing from '@/views/Landing/Landing.vue' 
import Sucursal from '@/views/Components/Sucursal/Sucursal.vue'
import dashboard from '@/views/Landing/dashboard.vue'
import distribucion from '@/views/Components/Distribucion.vue'
import SeguimientoView from '@/views/Components/SeguimientoView.vue'
import PanelDespacho from '@/views/Components/PanelDespacho.vue'
import Reporte from '@/views/Components/Reporte/Reporte.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing
    }, {
       path: '/login',
       name: 'login',
      component: Auth,
    }, 
     {
       path: '/recuperar',
       name: 'recuperar',
      component: Recup,    
    },
     {
    path: '/home',
    name: 'home',
    component: home,
    redirect: '/home/dashboard', 
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: dashboard
      },
       {
        path: 'sucursal',
        name: 'sucursal',
        component: Sucursal
      },
      {
        path: 'datos',
        name: 'AdmDatos',
        component: AdmDatos
      },
      {
        path: 'perfil',
        name: 'Perfil',
        component: Perfil
      },{
      path: 'usuario',
        name: 'usuario',
        component: Usuario
      },
      {
        path: 'repartidores',
        name: 'repartidores',
        component: Repartidor
      },
      {
      path: 'rol',
        name: 'rol',
        component: Rol
      },
      {
       path: 'producto',
        name: 'producto',
        component: Producto
      },
      {
       path: 'insumo',
        name: 'insumo',
        component: Insumo
      },
      {
       path: 'promocion',
        name: 'promocion',
        component: Promocion
      },
      {
       path: 'categoria',
        name: 'categoria',
        component: Categoria
      },
      {
        path:'medidas',
        name:'medidas',
        component: Medida
      },
        {
        path:'venta',
        name:'venta',
        component: Venta
      },
      {
        path:'cliente',
        name:'Cliente',
        component: Cliente
      },
      {
        path:'proveedor',
        name:'proveedor',
        component: Proveedor
      },
      {
        path:'comision',
        name:'comision',
        component: Comision
      },
       {
        path:'compras',
        name:'compra',
        component: Compra
      },
      {
        path:'reserva',
        name:'reserva',
        component: Reserva
      },
       {
        path:'entrega',
        name:'entrega',
        component: Entrega
      },
      {
        path: 'presentacion',
        name: 'presentacion',
        component: Presentacion
      },
      {
        path: 'distribucion',
        name: 'distribucion',
        component: distribucion
      },
      {
        path: 'seguimiento-pedido',
        name: 'seguimiento-pedido',
        component: SeguimientoView
      },
      {
        path: 'panel-despacho',
        name: 'panel-despacho',
        component: PanelDespacho
      },
      {
        path: 'reporte',
        name: 'reporte',
        component: Reporte
      }
      ]
  }
  ]
})

export default router