import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: () => import('@/views/Landing/Landing.vue'),
      meta: { requiresAuth: false }
    }, {
       path: '/login',
       name: 'login',
       component: () => import('@/views/Auth/Login.vue'),
      meta: { requiresAuth: false }
    },
     {
       path: '/recuperar',
       name: 'recuperar',
       component: () => import('@/views/Auth/Recuperar.vue'),
      meta: { requiresAuth: false }
    },
     {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home/Home.vue'),
    redirect: '/home/dashboard',
     meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Landing/dashboard.vue'),
      },
       {
        path: 'sucursal',
        name: 'sucursal',
        component: () => import('@/views/Components/Sucursal/Sucursal.vue'),
      },
      {
        path: 'datos',
        name: 'AdmDatos',
        component: () => import('@/views/Components/AdmDatos/AdmDatos.vue'),
      },
      {
        path: 'perfil',
        name: 'Perfil',
        component: () => import('@/views/Components/Perfil/Perfil.vue'),
      },{
      path: 'persona',
        name: 'persona',
        component: () => import('@/views/Components/Persona/Persona.vue'), 
      },
      {
      path: 'rol',
        name: 'rol',
        component: () => import('@/views/Components/Rol/Rol.vue'),
      },
      {
       path: 'producto',
        name: 'producto',
        component: () => import('@/views/Components/Insumo/Insumo.vue'),
      },
      {
       path: 'promocion',
        name: 'promocion',
        component: () => import('@/views/Components/Promocion/Promocion.vue')
      },
      {
       path: 'categoria',
        name: 'categoria',
        component:  () => import('@/views/Components/Categoria/Categoria.vue')
      },
      {
        path:'medida',
        name:'medidas',
        component: () => import('@/views/Components/Medida/Medida.vue')
      },
        {
        path:'venta',
        name:'venta',
        component: () => import('@/views/Components/Venta/Venta.vue')
      },
      {
        path:'persona',
        name:'persona',
        component: () => import('@/views/Components/Persona/Persona.vue'),
      },
      {
        path:'produccion',
        name:'produccion',
        component: () => import('@/views/Components/Produccion/Produccion.vue'),
      },
      {
        path:'comision',
        name:'comision',
    component: () => import('@/views/Components/ControlRevendedor/ControlRevendedor.vue'),
      },
       {
        path:'compra',
        name:'compra',
        component: () => import('@/views/Components/Compra/Compra.vue'),
      },
      {
        path:'pedido',
        name:'pedido',
        component: () => import('@/views/Components/Pedido/Pedido.vue'),
      },
      {
        path: 'presentacion',
        name: 'presentacion',
       component: () => import('@/views/Components/Presentacion/Presentacion.vue'),
      },
      {
        path: 'transferencia',
        name: 'transferencia',
        component: () => import('@/views/Components/Transferencia/Transferencia.vue'),
      },
      {
        path: 'reporte',
        name: 'reporte',
       component: () => import('@/views/Components/Reporte/Reporte.vue'),
      }
      ]
  }
  ]
})

// Función para obtener los menús permitidos del usuario
const obtenerMenusPermitidos = () => {
  try {
    const userMenusStr = localStorage.getItem('userMenus');
    if (!userMenusStr) {
      console.warn('No hay menús del usuario en localStorage');
      return [];
    }

    const rolMenus = JSON.parse(userMenusStr);

    // Extraer todos los enlaces permitidos
    const enlacesPermitidos = rolMenus
      .filter(rm => rm.menu?.Visible === 1)
      .map(rm => rm.menu?.Enlace?.Enlace)
      .filter(enlace => enlace); // Filtrar valores null/undefined

    return enlacesPermitidos;
  } catch (error) {
    
    return [];
  }
};
 
// Guardia de navegación global
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);

  // Rutas públicas (Landing, Login, Recuperar)
  if (!requiresAuth) {
    return next();
  } 

  // Verificar autenticación
  if (!isAuthenticated) {
    console.warn('Usuario no autenticado, redirigiendo a login');
    return next('/login');
  }

  // Si es la ruta /home o /home/dashboard, siempre permitir (ruta por defecto)
  if (to.path === '/home' || to.path === '/home/dashboard') {
    return next();
  }

  // Verificar si el usuario tiene acceso a la ruta específica
  const menusPermitidos = obtenerMenusPermitidos();
  const rutaSolicitada = to.path;

  // Verificar si la ruta está en los menús permitidos
  const tieneAcceso = menusPermitidos.some(enlace => {
    // Normalizar rutas para comparación
    const enlaceNormalizado = enlace.toLowerCase();
    const rutaNormalizada = rutaSolicitada.toLowerCase();
    return enlaceNormalizado === rutaNormalizada;
  });

  if (!tieneAcceso) {
    console.warn(`Acceso denegado a la ruta: ${rutaSolicitada}`);
    // Redirigir al dashboard con mensaje de error
    return next('/home/dashboard');
  }

  // Todo OK, permitir navegación
  next();
});

export default router