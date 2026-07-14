"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Usuario_controllers_1 = require("../controllers/Usuario.controllers");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
// Public routes
router.post("/verificar-pin", verifyToken_1.authMiddleware, Usuario_controllers_1.verificarPin);
router.post("/mensaje", verifyToken_1.authMiddleware, Usuario_controllers_1.ActualizarPassword);
router.post('/RegUsuarios', verifyToken_1.authMiddleware, Usuario_controllers_1.createUsuario);
// Routes that require authentication
router.post("/logout", verifyToken_1.authMiddleware, Usuario_controllers_1.logout);
router.put('/Usuarios/:id', verifyToken_1.authMiddleware, Usuario_controllers_1.updateUsuario);
router.get('/Usuarios', verifyToken_1.authMiddleware, Usuario_controllers_1.getUsuarios);
router.delete('/Usuarios/:id', verifyToken_1.authMiddleware, Usuario_controllers_1.deleteUsuario);
router.get('/Usuarios/:id', verifyToken_1.authMiddleware, Usuario_controllers_1.getUsuario);
router.get('/getNoAdmin', verifyToken_1.authMiddleware, Usuario_controllers_1.getNoAdmin);
router.get('/getUsuariosVentas', verifyToken_1.authMiddleware, Usuario_controllers_1.getUsuariosVentas);
router.get('/UsuarioRol/:id', verifyToken_1.authMiddleware, Usuario_controllers_1.getUsuarioRol);
router.get('/UsuarioSucursal/:id', verifyToken_1.authMiddleware, Usuario_controllers_1.getUsuarioSucursal);
router.get('/EmpleadosBySucursal/:idsucursal', verifyToken_1.authMiddleware, Usuario_controllers_1.getEmpleadosBySucursal);
router.post('/Recuperar', verifyToken_1.authMiddleware, Usuario_controllers_1.RecuperarContrasena);
router.post('/Cambiar', verifyToken_1.authMiddleware, Usuario_controllers_1.CambiarContrasenia);
router.post("/login", verifyToken_1.authMiddleware, Usuario_controllers_1.login);
router.post("/refresh-token", verifyToken_1.authMiddleware, Usuario_controllers_1.refreshToken);
exports.default = router;
