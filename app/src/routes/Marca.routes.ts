import {Router} from 'express'
import { authMiddleware } from '../middleware/verifyToken';
import { getMarcas } from '../controllers/Marca.controllers';

const router = Router();
router.use(authMiddleware)
router.get('/marcas', getMarcas)


export default router;