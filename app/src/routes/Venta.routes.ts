import { Router } from 'express';
import { registrarVenta, anularVenta, getVentasSucursal, getVentas, actualizarVenta } from '../controllers/Venta.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();
router.use(authMiddleware)

router.post('/ventas', registrarVenta);
router.get('/ventas', getVentas);
router.get('/ventasSucursal', getVentasSucursal);
router.put('/Anularventas/:id', anularVenta);
router.put('/ventas/:id', actualizarVenta);


export default router;
