"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Security:
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
 *         Usuario: 'user1'
 *         Password: 'password123'
 *         Email: 'user@example.com'
 *         Token: 'jwt-token-here'
 */
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión y obtener un token
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               Usuario:
 *                 type: string
 *               Password:
 *                 type: string
 *             example:
 *               Usuario: 'user1'
 *               Password: 'password123'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post("/login", user_controllers_1.login);
router.post("/refresh-token", user_controllers_1.refreshToken);
router.post("/logout", user_controllers_1.logout);
router.post('/addusers', user_controllers_1.createUser);
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
 *         Usuario: 'user1'
 *         Password: 'password123'
 *         Email: 'user@example.com'
 *         Token: 'jwt-token-here'
 */
/**
 * @swagger
 * /addusers:
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
 *               Usuario: 'user1'
 *               Password: 'password123'
 *               Email : 'user1@gmail.com'
 *       200:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: El nombre de usuario ya está en uso
 *       500:
 *         description: Error interno del servidor
 */
//router.use(authMiddleware)
router.get('/users/:id', user_controllers_1.getUser);
router.get('/users1/:id', user_controllers_1.getUser1);
/**
 * @swagger
 * /users/{id}:
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
router.get('/users', user_controllers_1.getUsers);
/**
 * @swagger
 * /users:
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
 * /users/{id}:
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
router.put('/users/:id', user_controllers_1.updateUser);
router.delete('/users/:id', user_controllers_1.deleteUser);
router.put('/uses/:id', user_controllers_1.ActivarUser);
/**
 * @swagger
 * /users/{id}:
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
