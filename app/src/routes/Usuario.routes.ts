import {Router} from 'express'
import {createUsuario, deleteUsuario, getUsuario, getUsuarios, updateUsuario,login,refreshToken,logout, RecuperarContrasena, ActualizarPassword, verificarPin, getNoAdmin, getUsuarioRol, getUsuarioSucursal} from '../controllers/Usuario.controllers'
import { authMiddleware } from '../middleware/verifyToken';

const router = Router();



router.use(authMiddleware)
router.post("/verificar-pin", verificarPin);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout)
router.post('/Usuarios', createUsuario)
router.post('/Recuperar', RecuperarContrasena)
router.put('/Usuarios/:id', updateUsuario)
router.get('/Usuarios', getUsuarios)
router.delete('/Usuarios/:id', deleteUsuario)
router.get('/Usuarios/:id', getUsuario)
router.get('/UsuarioRol/:id', getUsuarioRol)
router.get('/UsuarioSucursal/:id', getUsuarioSucursal)
router.get('/getNoAdmin', getNoAdmin)

 export default router; 