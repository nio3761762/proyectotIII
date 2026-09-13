import { Router } from 'express';
import { CreateSabor, DeleteSabor, getSabor, getSaboresActivos, UpdateSabor } from '../controllers/Sabor.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.post('/addsabor', CreateSabor);
router.put('/updatesabor/:id', UpdateSabor);
router.delete('/delsabor/:id', DeleteSabor);
router.get('/sabores', getSabor);
router.get('/getsabores', getSaboresActivos);

export default router;