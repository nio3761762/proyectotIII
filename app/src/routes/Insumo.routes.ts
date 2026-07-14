import {Router} from 'express'
import { authMiddleware } from '../middleware/verifyToken';
import { createInsumo, deleteInsumo, getInsumo, ListInsumo, SubirPhotoInsumo, updateInsumo } from '../controllers/Insumo.controllers';
import { getInsumoInMedida } from '../controllers/Insumomedida.controllers';

const router = Router();

router.use(authMiddleware)
router.post("/postInsumo", createInsumo)
router.put('/putInsumo/:id', updateInsumo)
router.put('/Photoinsumo/:id',SubirPhotoInsumo)
router.get('/getInsumo', getInsumo);
router.get('/listInumo', ListInsumo)
router.delete('/delInsumo/:id', deleteInsumo)
router.get('/getInsumoInMedida/:id', getInsumoInMedida);
export default router;

