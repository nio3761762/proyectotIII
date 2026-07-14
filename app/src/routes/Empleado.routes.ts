import {Router} from 'express'
import { CreateEmpleado, deleteEmpleado , getEmpleados, UpdateEmpleado,getEmpleadosVendedores } from '../controllers/Empleado.controllers';
import { authMiddleware } from '../middleware/verifyToken';
import { getCargo } from '../controllers/Cargo.controllers';
const router = Router();

router.get('/getCargo', authMiddleware,getCargo)
router.post("/AddEmpleado",authMiddleware, CreateEmpleado)
router.put('/UpdateEmpleado/:id',authMiddleware, UpdateEmpleado)
router.delete('/deleteEmpleado/:id',authMiddleware, deleteEmpleado)
router.get('/getEmpleados/:id',authMiddleware,getEmpleados)
router.get('/getEmpleadosVendedores',authMiddleware,getEmpleadosVendedores)
 export default router; 