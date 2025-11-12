import { Router } from 'express';
import { AddPresentacion, deletePresentacion, getpresentacion, getPresentacion, getPresentacionEstaoo, updatePresentacion } from '../controllers/Presentacion,controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.post('/addpresentacion', AddPresentacion);
router.put('/updatePresntacion/:id', updatePresentacion);
router.get('/presntacion/:id', getpresentacion);
router.delete('/delPresentacion/:id', deletePresentacion);
router.get('/presentaciones', getPresentacion);
router.get('/presentacionestado', getPresentacionEstaoo);

export default router;