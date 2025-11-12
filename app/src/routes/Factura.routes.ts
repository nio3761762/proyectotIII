import { Router } from 'express';
import { createFactura, insertarEnlaceFactura, ObtenerFactura } from '../controllers/Factura.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.post('/factura', createFactura);
router.put('/insertarEnlaceFactura/:id', insertarEnlaceFactura);
router.get('/ObtenerFactura/:id', ObtenerFactura);

export default router;
