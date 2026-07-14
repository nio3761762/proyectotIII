import {Router} from 'express'
import { createProducto, deleteProducto, getProducto, getProductos, getProductosVista, updateProducto } from '../controllers/Producto.controllers';
import { authMiddleware } from '../middleware/verifyToken';
import { getmedidasdelProducto, getmedidasdelProductoPrecio, getProductomedidas, updateCreatePrecioProducto } from '../controllers/ProductoMedida.controllers';
import { getProductoIngrediente } from '../controllers/Ingredientes.controllers';

const router = Router();



router.use(authMiddleware)
router.get('/productos-vista', getProductosVista)
router.post("/producto", createProducto)
router.put('/producto/:id', updateProducto)
router.post('/updateCreatePrecioProducto', updateCreatePrecioProducto)
router.get('/productos', getProductos)
router.delete('/productos/:id', deleteProducto)
router.get('/getproducto', getProducto)
router.get('/getProductomedidas', getProductomedidas);
router.get('/getProductoIngrediente/:id', getProductoIngrediente)
router.get('/getmedidasdelProducto/:id', getmedidasdelProducto)
router.get('/getmedidasdelProductoPrecio/:id', getmedidasdelProductoPrecio)
export default router;

