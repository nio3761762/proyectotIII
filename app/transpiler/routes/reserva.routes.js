"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reserva_controllers_1 = require("../controllers/reserva.controllers");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
/**
 * @swagger
 * components:
 *   schemas:
 *     Reserva:
 *       type: object
 *       required:
 *         - UsuarioID
 *         - HorarioID
 *         - FechaReserva
 *         - Asientos
 *         - Estado
 *         - RAsientos
 *         - PrecioTotal
 *       properties:
 *         ReservaID:
 *           type: integer
 *           description: ID auto-generado de la reserva
 *         UsuarioID:
 *           type: integer
 *           description: ID del usuario
 *         HorarioID:
 *           type: integer
 *           description: ID del horario
 *         FechaReserva:
 *           type: string
 *           format: date
 *           description: Fecha de la reserva
 *         Asientos:
 *           type: integer
 *           description: Número de asientos reservados
 *         Estado:
 *           type: string
 *           description: Estado de la reserva (A para Activo, I para Inactivo)
 *         RAsientos:
 *           type: integer
 *           description: Asientos reservados
 *         PrecioTotal:
 *           type: integer
 *           description: Precio total de la reserva
 *       example:
 *         ReservaID: 1
 *         UsuarioID: 1
 *         HorarioID: 1
 *         FechaReserva: "2023-12-25"
 *         Asientos: 2
 *         Estado: "A"
 *         RAsientos: 2
 *         PrecioTotal: 200
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
 * /reservasadd:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reserva'
 *     responses:
 *       200:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/reservasadd', reserva_controllers_1.createReserva);
/**
 * @swagger
 * /reservas:
 *   get:
 *     summary: Obtener la lista de todas las reservas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reservas', reserva_controllers_1.getReservas);
/**
 * @swagger
 * /reservas/{id}:
 *   put:
 *     summary: Actualizar una reserva existente
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reserva'
 *     responses:
 *       204:
 *         description: Reserva actualizada exitosamente
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/reservas/:id', reserva_controllers_1.updateReserva);
/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Eliminar una reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva
 *     responses:
 *       204:
 *         description: Reserva eliminada exitosamente
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/reservas/:id', reserva_controllers_1.deleteReserva);
/**
 * @swagger
 * /reservas/{id}:
 *   get:
 *     summary: Obtener una reserva por ID
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reservas/:id', reserva_controllers_1.getReserva);
/**
 * @swagger
 * /reservas/{fecha}/{horarioID}/{Estado}/{busID}:
 *   get:
 *     summary: Obtener una reserva por fecha, horario, estado y bus
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de la reserva
 *       - in: path
 *         name: horarioID
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del horario
 *       - in: path
 *         name: Estado
 *         schema:
 *           type: string
 *         required: true
 *         description: Estado de la reserva
 *       - in: path
 *         name: busID
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del bus
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reservas/:fecha/:horarioID/:Estado/:busID', reserva_controllers_1.getReservaByFechaHorarioEstadoBus);
exports.default = router;
