"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bus_controllers_1 = require("../controllers/bus.controllers");
const verifyToken_1 = require("../middleware/verifyToken");
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
 *     Bus:
 *       type: object
 *       required:
 *         - Placa
 *         - Modelo
 *         - Capacidad
 *       properties:
 *         BusID:
 *           type: integer
 *           description: ID auto-generado del bus
 *         Placa:
 *           type: string
 *           description: Placa del bus
 *         Modelo:
 *           type: string
 *           description: Modelo del bus
 *         Capacidad:
 *           type: integer
 *           description: Capacidad del bus
 *       example:
 *         BusID: 1
 *         Placa: 'ABC1234'
 *         Modelo: 'Volvo 2020'
 *         Capacidad: 50
 */
router.use(verifyToken_1.authMiddleware);
router.post('/buses', bus_controllers_1.createBus);
/**
 * @swagger
 * /buses:
 *   post:
 *     summary: Crear un nuevo bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bus'
 *     responses:
 *       200:
 *         description: Bus creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bus'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/buses', bus_controllers_1.getBuses);
/**
 * @swagger
 * /buses:
 *   get:
 *     summary: Obtener la lista de todos los buses
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de buses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bus'
 *       500:
 *         description: Error interno del servidor
 */
router.put('/buses/:id', bus_controllers_1.updateBus);
/**
 * @swagger
 * /buses/{id}:
 *   put:
 *     summary: Actualizar un bus existente
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del bus
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bus'
 *     responses:
 *       204:
 *         description: Bus actualizado exitosamente
 *       404:
 *         description: Bus no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/buses/:id', bus_controllers_1.deleteBus);
/**
 * @swagger
 * /buses/{id}:
 *   delete:
 *     summary: Eliminar un bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del bus
 *     responses:
 *       204:
 *         description: Bus eliminado exitosamente
 *       404:
 *         description: Bus no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/buses/:id', bus_controllers_1.getBus);
/**
 * @swagger
 * /buses/{id}:
 *   get:
 *     summary: Obtener detalles de un bus específico
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del bus
 *     responses:
 *       200:
 *         description: Detalles del bus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bus'
 *       404:
 *         description: Bus no encontrado
 *       500:
 *         description: Error interno del servidor
 */
exports.default = router;
