import {Router} from 'express'
import { authMiddleware } from '../middleware/verifyToken';
import { obtenerDIreccion } from '../controllers/Direccion.controllers';

const router = Router();

router.use(authMiddleware)
router.get('/obtenerDIreccion/:id', obtenerDIreccion)

export default router;