import {Router} from 'express'
import { authMiddleware } from '../middleware/verifyToken';
import { createCategoriaMedida, updateCateriaMedida, getMedidas, deleteCategoriaMedida, ObtenerMedidas, ObtenrCategoriaMedida, getCategoriaMedidas } from '../controllers/CategoriaMedida.controllers';

const router = Router();

router.use(authMiddleware)
router.post("/createCategoriaMedida", createCategoriaMedida)
router.put('/updateCateriaMedida/:id', updateCateriaMedida)
router.get('/getMedidas', getMedidas)
router.get('/getCategoriaMedidas', getCategoriaMedidas)
router.delete('/deleteCategoriaMedida/:id', deleteCategoriaMedida)
router.get('/ObtenerMedidas/:id', ObtenerMedidas)
router.get('/ObtenrCategoriaMedida/:id', ObtenrCategoriaMedida)
export default router;