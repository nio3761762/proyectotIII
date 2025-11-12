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
// Ruta para obtener la receta (ingredientes) de un producto específico
router.get('/getProductoIngrediente/:id', getProductoIngrediente);

// Ruta para registrar la producción de un producto, actualizar su receta y ajustar el stock
router.post('/registrarProduccionDeProducto', registrarProduccionDeProducto);

// Ruta para actualizar la receta de un producto (múltiples ingredientes: insertar/actualizar/eliminar)
router.put('/actualizarIngredienteReceta/:id', actualizarIngredienteReceta);

// Ruta para eliminar un ingrediente específico de una receta (sin ajustar stock)
router.delete('/eliminarIngredienteReceta/:id', eliminarIngredienteReceta);

export default router;
