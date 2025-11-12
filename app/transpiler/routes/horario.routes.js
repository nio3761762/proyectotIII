"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const horario_controllers_1 = require("../controllers/horario.controllers");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
/**
 * @swagger
 * components:
 *   schemas:
 *     Horario:
 *       type: object
 *       required:
 *         - RutaID
 *         - BusID
 *         - FechaSalida
 *         - HoraSalida
 *         - FechaLlegada
 *         - Precio
 *       properties:
 *         HorarioID:
 *           type: integer
 *           description: ID auto-generado del horario
 *         RutaID:
 *           type: integer
 *           description: ID de la ruta
 *         BusID:
 *           type: integer
 *           description: ID del bus
 *         FechaSalida:
 *           type: string
 *           format: date
 *           description: Fecha de salida del horario
 *         HoraSalida:
 *           type: string
 *           format: time
 *           description: Hora de salida del horario
 *         FechaLlegada:
 *           type: string
 *           format: date
 *           description: Fecha de llegada del horario
 *         Precio:
 *           type: integer
 *           description: Precio del horario
 *       example:
 *         HorarioID: 1
 *         RutaID: 1
 *         BusID: 1
 *         FechaSalida: "2023-12-25"
 *         HoraSalida: "10:00:00"
 *         FechaLlegada: "2023-12-25"
 *         Precio: 100
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
 * /horarios:
 *   post:
 *     summary: Crear un nuevo horario
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Horario'
 *     responses:
 *       200:
 *         description: Horario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Horario'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/horarios', horario_controllers_1.createHorario);
/**
 * @swagger
 * /horarios:
 *   get:
 *     summary: Obtener la lista de todos los horarios
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de horarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Horario'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/horarios', horario_controllers_1.getHorarios);
/**
 * @swagger
 * /horarios/{id}:
 *   put:
 *     summary: Actualizar un horario existente
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del horario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Horario'
 *     responses:
 *       204:
 *         description: Horario actualizado exitosamente
 *       404:
 *         description: Horario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/horarios/:id', horario_controllers_1.updateHorario);
/**
 * @swagger
 * /horarios/{id}:
 *   delete:
 *     summary: Eliminar un horario
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del horario
 *     responses:
 *       204:
 *         description: Horario eliminado exitosamente
 *       404:
 *         description: Horario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/horarios/:id', horario_controllers_1.deleteHorario);
/**
 * @swagger
 * /horarios/{id}:
 *   get:
 *     summary: Obtener un horario por ID
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del horario
 *     responses:
 *       200:
 *         description: Horario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Horario'
 *       404:
 *         description: Horario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/horarios/:id', horario_controllers_1.getHorario);
exports.default = router;
