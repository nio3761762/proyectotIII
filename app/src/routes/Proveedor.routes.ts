import { Router } from "express";
import { } from '../controllers/Proveedor.controllers';
import { createProveedor, deleteProveedor, getProveedor, getProveedores, updateProveedor } from "../controllers/Proveedor.controllers";
import { getTipoproveedor } from "../controllers/TipoProveedor.controllers";
import { authMiddleware } from "../middleware/verifyToken";


const router = Router();

router.use(authMiddleware)

router.post('/Proveedor', createProveedor);
router.put('/putProveedor/:id', updateProveedor);
router.get('/getProveedor', getProveedores);
router.delete('/deleteProveedor/:id', deleteProveedor);
router.get('/Proveedor/:id', getProveedor);
router.get('/gettipoProveedor', getTipoproveedor);


export default router;
