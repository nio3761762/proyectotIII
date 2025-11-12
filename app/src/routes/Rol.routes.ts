import {Router} from 'express'
//import {createUser, deleteUser, getUser, getUsers, updateUser,ActivarUser,login} from '../controllers/user.controllers'
import {createRole,getRoles,getRole,deleteRole,updateRole, getPermiso, getPermisosPorMenu} from '../controllers/Rol.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware)

router.post('/addRole', createRole)
router.get('/role/:id', getRole)
router.get('/role', getRoles)
router.get('/permiso', getPermiso)
router.get('/permisos/:idMenu', getPermisosPorMenu);
router.put('/role/:id', updateRole)
router.delete('/role/:id', deleteRole)

export default router;

