import { Router } from 'express';
import { AddPresentacion, deletePresentacion, getbypresentacion, getPresentacion, getPresentaciones, updatePresentacion } from '../controllers/Presentacion,controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.post('/addpresentacion', AddPresentacion);
router.put('/updatePresntacion/:id', updatePresentacion);
router.get('/presntacion/:id', getbypresentacion);
router.delete('/delPresentacion/:id', deletePresentacion);
router.get('/presentaciones', getPresentacion);
router.get('/getpresentaciones', getPresentaciones);

export default router;