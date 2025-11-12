import {Router} from 'express'
import { createUnidadMedida, deleteUnidadMedida, getUnidadMedida, getUnidadMedidas, updateUnidadMedida } from '../controllers/Medida.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware)
router.post("/UnidadMedida", createUnidadMedida)
router.put('/UnidadMedida/:id', updateUnidadMedida)
router.get('/UnidadMedidas', getUnidadMedidas)
router.delete('/UnidadMedidas/:id', deleteUnidadMedida)
router.get('/UnidadMedida/:id', getUnidadMedida)

export default router;