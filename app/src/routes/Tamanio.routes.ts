import { Router } from 'express';
import { CreateTamanio, DeleteTamanio, getTamanio, getTamaniosActivos, UpdateTamanio } from '../controllers/Tamanio.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.post('/addtamanio', CreateTamanio);
router.put('/updatetamanio/:id', UpdateTamanio);
router.delete('/deltamanio/:id', DeleteTamanio);
router.get('/tamanios', getTamanio);
router.get('/gettamanios', getTamaniosActivos);

export default router;