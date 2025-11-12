import { Router } from 'express';
import { registrarVenta, anularVenta, getVentasSucursal, getVentas, getVentasUsuario, updateVenta, getVentasTodasSucursal, agregarClienteVenta } from '../controllers/Venta.controllers';
import { getProductoSucursal } from '../controllers/Presentacionproducto.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();
router.use(authMiddleware)

router.post('/ventas', registrarVenta);
router.get('/ventas', getVentas);
router.get('/ventasSucursal/:id/:fecha/:pago', getVentasSucursal);
router.get('/getVentasTodasSucursal', getVentasTodasSucursal);
router.get('/productosPorSucursal/:id', getProductoSucursal);
router.get('/ventasUsuario/:id', getVentasUsuario);
router.put('/Anularventas/:id', anularVenta);
router.put('/updVenta/:id', updateVenta);
router.put('/agregarClienteVenta/:id', agregarClienteVenta);

export default router;
