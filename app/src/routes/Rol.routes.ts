import {Router} from 'express'
import {createRole,getRoles,getRole,deleteRole,updateRole, getPermiso, getPermisosPorMenu, getobtenerMenus, filRoles} from '../controllers/Rol.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware)

router.post('/addRole', createRole)
router.get('/filroles',filRoles)
router.get('/role/:id', getRole)
router.get('/role', getRoles)
router.get('/permiso', getPermiso)
router.get('/permisos/:idMenu', getPermisosPorMenu);
router.put('/role/:id', updateRole)
router.delete('/role/:id', deleteRole)
router.get('/rolemenus/:id',getobtenerMenus)
export default router;

