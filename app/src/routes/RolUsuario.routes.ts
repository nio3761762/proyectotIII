import {Router} from 'express'

import { authMiddleware } from '../middleware/verifyToken';
import { AsignarRol, AsignarupdateRol, DeleteRol } from '../controllers/RolUsuario.controllers';

const router = Router();

router.use(authMiddleware);
router.post('/AsignarRolUsuario', AsignarRol)
router.delete('/DeleteRolUsuario/:idu/:idr', DeleteRol)
router.put('/Rolusuario/:id', AsignarupdateRol)


export default router;