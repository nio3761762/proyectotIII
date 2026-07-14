import { Router } from 'express';
import {
    createPromocion,
    updatePromocion,
    deletePromocion,
    getPromociones,
    activarPromociones,
    cerrarPromocionesVencidas,
    getPromocionesVista
} from '../controllers/Promocion.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.get('/promociones-vista', getPromocionesVista);

router.use(authMiddleware);
router.post('/promocion', createPromocion);
router.put('/promocion/:id', updatePromocion);
router.delete('/promociones/:id', deletePromocion);
router.get('/promociones', getPromociones);
router.post("/cerrar-vencidas", cerrarPromocionesVencidas);
router.post("/activar", activarPromociones);

export default router;
