import { Router } from 'express';
import { getPagos, getPagosVenta } from '../controllers/Pago.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.get('/getpago', getPagos);
router.get('/getpagoVenta/:id', getPagosVenta);

export default router;
