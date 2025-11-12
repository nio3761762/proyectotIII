import {Router} from 'express'
import { createProducto, deleteProducto, getBuscarProductos, getInsumo, getProducto, getProductos, PrecioProducto, updateProducto } from '../controllers/Producto.controllers';
import { authMiddleware } from '../middleware/verifyToken';
import { getPaquete, getPaquetesinSucursal, getPaqueteSucursal, getProductod, getProductoPaquete, getProductoPromocion, getProductosPaquete, getProductoSucursal, ObtenerPresentacion, getUniqueProductsWithSummedQuantities } from '../controllers/Presentacionproducto.controllers';
import { getAllProducts, getProductoInMedida } from '../controllers/ProductoMedida.controllers';
import { getProductoIngrediente } from '../controllers/Ingredientes.controllers';

const router = Router();

router.use(authMiddleware)
router.post("/producto", createProducto)
router.put('/producto/:id', updateProducto)
router.get('/productos', getProductos)
router.get('/getInsumo', getInsumo);
router.delete('/productos/:id', deleteProducto)
router.get('/producto/:id', getProducto)
router.get('/productopaquete/:id', getProductoPaquete)
router.get('/productospaquete/:id', getProductosPaquete)
router.get('/ObtenerPresentacion/:id', ObtenerPresentacion)
router.get('/PrecioProducto/:id', PrecioProducto)
router.get('/productopromocions', getProductoPromocion)
router.get('/productoSucursal/:id/:categoriaId/:subcategoriaId', getProductoSucursal)
router.get('/Buscarproducto', getBuscarProductos);
router.get('/getpaquete/:id', getPaquete);
router.get('/getPaquetesinSucursal', getPaquetesinSucursal);
router.get('/getPaqueteSucursal/:ids/:id', getPaqueteSucursal);
router.get('/getAllProducts', getAllProducts);
router.get('/getProductod/:categoriaId/:subcategoriaId', getProductod);
router.get('/unique-products-summed', getUniqueProductsWithSummedQuantities); // New route

router.get('/getProductoIngrediente/:id', getProductoIngrediente)
router.get('/getProductoInMedida/:id', getProductoInMedida);
export default router;

