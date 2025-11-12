import { Router } from 'express';
import {
    createPromocion,
    updatePromocion,
    deletePromocion,
    getPromociones,
    getPromocion,
    getPromocionesActiva,
    activarPromociones,
    cerrarPromocionesVencidas
} from '../controllers/Promocion.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.post('/promocion', createPromocion);
router.put('/promocion/:id', updatePromocion);
router.delete('/promociones/:id', deletePromocion);
router.get('/promociones', getPromociones);
router.get('/promocionactiva', getPromocionesActiva);
router.get('/Onepromocione/:id', getPromocion);
router.post("/cerrar-vencidas", cerrarPromocionesVencidas);
router.post("/activar", activarPromociones);

export default router;
