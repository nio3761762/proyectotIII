import { Router } from 'express';
import { 
  iniciarProduccion,
  encenderHorno,
  apagarHorno,
  registrarSalidaProducto,
  cambiarCombustibleHorno,
  finalizarProduccionTotal,
  finalizarTurnoEmpleado,
  getProducciones,
  getInsumosSucursal,
  agregarEmpleadoProduccion,
  anularProduccion,
  registrarMermaProduccion,
  descartarProductosDaniados,
  registrarSalidaProductoMasiva,
  actualizarProduccion
} from '../controllers/Produccion.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

// Flujo de Producción Simplificado
router.get('/produccion', authMiddleware, getProducciones);
router.get('/produccion/insumos/sucursal/:id', authMiddleware, getInsumosSucursal);
router.post('/produccion/iniciar', authMiddleware, iniciarProduccion);
router.post('/produccion/agregarempleado', authMiddleware, agregarEmpleadoProduccion);
router.post('/produccion/empleado/finalizar', authMiddleware, finalizarTurnoEmpleado);
router.post('/produccion/horno/encender', authMiddleware, encenderHorno);
router.post('/produccion/producto/salida', authMiddleware, registrarSalidaProducto);
router.post('/produccion/producto/merma', authMiddleware, registrarMermaProduccion);
router.post('/produccion/Descartarproducto', authMiddleware, descartarProductosDaniados);
router.post('/produccion/horno/cambio-combustible', authMiddleware, cambiarCombustibleHorno);
router.post('/produccion/finalizar', authMiddleware, finalizarProduccionTotal);
router.put('/produccion/anular/:id', authMiddleware, anularProduccion);
router.put('/produccion/:id', authMiddleware, actualizarProduccion);
router.post('/produccion/producto/salida-masiva', authMiddleware, registrarSalidaProductoMasiva);
router.post('/produccion/Apagarhorno', authMiddleware, apagarHorno);

export default router;

