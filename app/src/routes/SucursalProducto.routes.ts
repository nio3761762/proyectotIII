import { Router } from 'express';
import { getProductosBySucursal, getAllProductsWithSummedQuantities, IncrementProductosucursal, getProductoPromocion, IncrementProductoCantidad, getAllPaquetsWithSummedQuantities, ObtenerSucursalproducto, getUniquePackagesWithSummedQuantities } from '../controllers/SucursalProducto.controllers';
import { authMiddleware } from '../middleware/verifyToken'; // Descomentar si se necesita autenticación

const router = Router();

router.use(authMiddleware); 
router.get("/sucursalproductos",  getProductosBySucursal);
router.get("/ObtenerSucursalproducto/:id",  ObtenerSucursalproducto);
router.get("/sucursal-productos-summed/:categoriaId/:subcategoriaId", getAllProductsWithSummedQuantities);
router.get("/getAllPaquetsWithSummedQuantities/:id", getAllPaquetsWithSummedQuantities);
router.get("/unique-packages-summed", getUniquePackagesWithSummedQuantities); // New route
router.put("/IncrementProducto/:id",IncrementProductosucursal)
router.put("/IncrementProductoCantidad/:id",IncrementProductoCantidad)
router.get("/getProductoPromocion/:id",getProductoPromocion)
export default router;