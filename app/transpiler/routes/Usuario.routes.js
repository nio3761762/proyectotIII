"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Usuario_controllers_1 = require("../controllers/Usuario.controllers");
const router = (0, express_1.Router)();
//router.use(authMiddleware)
router.post("/login", Usuario_controllers_1.login);
router.post("/mensaje", Usuario_controllers_1.ActualizarPassword);
router.post("/verificar-pin", Usuario_controllers_1.verificarPin);
router.post("/refresh-token", Usuario_controllers_1.refreshToken);
router.post("/logout", Usuario_controllers_1.logout);
router.post('/Usuarios', Usuario_controllers_1.createUsuario);
router.post('/Recuperar', Usuario_controllers_1.RecuperarContrasena);
router.put('/Usuarios/:id', Usuario_controllers_1.updateUsuario);
router.get('/Usuarios', Usuario_controllers_1.getUsuarios);
router.delete('/Usuarios/:id', Usuario_controllers_1.deleteUsuario);
router.get('/Usuarios/:id', Usuario_controllers_1.getUsuario);
router.get('/UsuarioRol/:id', Usuario_controllers_1.getUsuarioRol);
router.get('/UsuarioSucursal/:id', Usuario_controllers_1.getUsuarioSucursal);
router.get('/getNoAdmin', Usuario_controllers_1.getNoAdmin);
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Usuarios:
 *       type: object
 *       required:
 *         - Usuario
 *         - Password
 *         - Email
 *       properties:
 *         Usuario:
 *           type: string
 *           description: Nombre de usuario
 *         Password:
 *           type: string
 *           description: Contraseña del usuario
 *         Email:
 *           type: string
 *           description: Email del usuario
 *         Token:
 *           type: string
 *           nullable: true
 *           description: Token de autenticación
 *       example:
 *         Usuario: 'Usuario1'
 *         Password: 'password123'
 *         Email: 'Usuario@example.com'
 *         Token: 'jwt-token-here'
 */
/**
 * @swagger
 * /addUsuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *           schema:
 *             properties:
 *               Usuario:
 *                 type: string
 *               Password:
 *                 type: string
 *               Email :
 *                 type: string
 *             example:
 *               Usuario: 'Usuario1'
 *               Password: 'password123'
 *               Email : 'Usuario1@gmail.com'
 *       200:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: El nombre de usuario ya está en uso
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /Usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuarios'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor*/
/**
 * @swagger
 * /Usuarios:
 *   get:
 *     summary: Obtener la lista de todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuarios'
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /Usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario existente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuarios'
 *     responses:
 *       204:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /Usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
exports.default = router;
