import {Router} from 'express'
import { authMiddleware } from '../middleware/verifyToken';
import { createComision, deleteComision, getComision, updateComision } from '../controllers/Comision.controllers';

const router = Router();

router.use(authMiddleware)
router.post("/AddComision", createComision)
router.put('/uptComision/:id', updateComision)
router.delete('/DelComision/:id', deleteComision)
router.get('/Comisiones', getComision)

export default router;