import {Router} from 'express'

import { GetMenusPorRol,createRolMenu,updateRolMenu,GetMenuPorRol } from '../controllers/RolMEnu.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.post('/RolMenu', createRolMenu)
router.put('/RolMenu/:id', updateRolMenu)
router.get('/RolMenu/:id', GetMenusPorRol)
router.get('/RolMenus/:id', GetMenuPorRol)

export default router;