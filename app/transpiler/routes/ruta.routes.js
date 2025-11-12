"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ruta_controllers_1 = require("../controllers/ruta.controllers");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
/**
 * @swagger
 * components:
 *   schemas:
 *     Ruta:
 *       type: object
 *       required:
 *         - Origen
 *         - Destino
 *       properties:
 *         RutaID:
 *           type: integer
 *           description: ID auto-generado de la ruta
 *         Origen:
 *           type: string
 *           description: Origen de la ruta
 *         Destino:
 *           type: string
 *           description: Destino de la ruta
 *       example:
 *         RutaID: 1
 *         Origen: "Ciudad A"
 *         Destino: "Ciudad B"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * security:
 *   - bearerAuth: []
 */
/**
 * @swagger
 * /rutas:
 *   post:
 *     summary: Crear una nueva ruta
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ruta'
 *     responses:
 *       200:
 *         description: Ruta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ruta'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/rutas', ruta_controllers_1.createRuta);
/**
 * @swagger
 * /rutas:
 *   get:
 *     summary: Obtener la lista de todas las rutas
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ruta'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/rutas', ruta_controllers_1.getRutas);
/**
 * @swagger
 * /rutas/{id}:
 *   put:
 *     summary: Actualizar una ruta existente
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la ruta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ruta'
 *     responses:
 *       204:
 *         description: Ruta actualizada exitosamente
 *       404:
 *         description: Ruta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/rutas/:id', ruta_controllers_1.updateRuta);
/**
 * @swagger
 * /rutas/{id}:
 *   delete:
 *     summary: Eliminar una ruta
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la ruta
 *     responses:
 *       204:
 *         description: Ruta eliminada exitosamente
 *       404:
 *         description: Ruta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/rutas/:id', ruta_controllers_1.deleteRuta);
/**
 * @swagger
 * /rutas/{id}:
 *   get:
 *     summary: Obtener una ruta por ID
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la ruta
 *     responses:
 *       200:
 *         description: Ruta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ruta'
 *       404:
 *         description: Ruta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/rutas/:id', ruta_controllers_1.getRuta);
exports.default = router;
