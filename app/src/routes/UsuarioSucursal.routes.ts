import { Router } from 'express';
import { createUsuarioSucursal, getUsuarioSucursales, getUsuarioSucursalesBySucursal, getUsuarioSucursalesByUsuario, deleteUsuarioSucursal, getProductsByUserId } from '../controllers/UsuarioSucursal.controllers';
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();
router.use(authMiddleware)
router.post('/usuario-sucursal', createUsuarioSucursal);
router.get('/usuario-sucursal', getUsuarioSucursales);
router.get('/usuario-sucursal/sucursal/:id', getUsuarioSucursalesBySucursal);
router.get('/usuario-sucursal/usuario/:id', getUsuarioSucursalesByUsuario);
router.delete('/usuario-sucursal/:id', deleteUsuarioSucursal);
router.get('/usuario-sucursal/products-by-user/:id', getProductsByUserId);

export default router;
