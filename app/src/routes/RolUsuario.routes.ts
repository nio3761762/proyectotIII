import {Router} from 'express'

import { authMiddleware } from '../middleware/verifyToken';
import { AsignarRol, AsignarupdateRol } from '../controllers/RolUsuario.controller';

const router = Router();

router.use(authMiddleware);
router.post('/Rolusuario', AsignarRol)
router.put('/Rolusuario/:id', AsignarupdateRol)


export default router;