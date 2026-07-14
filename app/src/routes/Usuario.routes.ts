import {Router} from 'express'
import {createUsuario, deleteUsuario, getUsuario, getUsuarios, updateUsuario,login,refreshToken,logout, RecuperarContrasena, ActualizarPassword, verificarPin, getNoAdmin, getUsuarioRol, getUsuarioSucursal, getEmpleadosBySucursal, getUsuariosVentas, CambiarContrasenia} from '../controllers/Usuario.controllers'
import { authMiddleware,publicAccessMiddleware } from '../middleware/verifyToken';

const router = Router();

// Public routes
router.post("/verificar-pin",authMiddleware, verificarPin);
router.post("/mensaje", authMiddleware,ActualizarPassword)
router.post('/RegUsuarios',authMiddleware, createUsuario)


// Routes that require authentication
router.post("/logout", authMiddleware, logout)
router.put('/Usuarios/:id', authMiddleware, updateUsuario)
router.get('/Usuarios', authMiddleware, getUsuarios)
router.delete('/Usuarios/:id', authMiddleware, deleteUsuario)
router.get('/Usuarios/:id', authMiddleware, getUsuario)
router.get('/getNoAdmin', authMiddleware, getNoAdmin)
router.get('/getUsuariosVentas', authMiddleware, getUsuariosVentas)
router.get('/UsuarioRol/:id', authMiddleware, getUsuarioRol)
router.get('/UsuarioSucursal/:id', authMiddleware, getUsuarioSucursal)
router.get('/EmpleadosBySucursal/:idsucursal', authMiddleware, getEmpleadosBySucursal)
router.post('/Recuperar',authMiddleware, RecuperarContrasena)
router.post('/Cambiar',authMiddleware, CambiarContrasenia)
router.post("/login",authMiddleware, login)
router.post("/refresh-token",authMiddleware, refreshToken)
 export default router; 