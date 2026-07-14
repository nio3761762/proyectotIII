import { Router } from 'express';
import {
    getProductoIngrediente,
    registrarProduccionDeProducto,
    actualizarIngredienteReceta,
    eliminarIngredienteReceta
} from '../controllers/Ingredientes.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();

router.use(authMiddleware);
router.get('/getProductoIngrediente/:id', getProductoIngrediente);
router.post('/registrarProduccionDeProducto', registrarProduccionDeProducto);
router.put('/actualizarIngredienteReceta/:id', actualizarIngredienteReceta);
router.delete('/eliminarIngredienteReceta/:id', eliminarIngredienteReceta);

export default router;
