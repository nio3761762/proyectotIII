"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDistribucion = exports.ObtenerCLienteDestino = exports.verifyDistribucion = exports.deleteDistribucion = exports.updateDistribucion = exports.getDistribucion = exports.getDistribuciones = void 0;
const Distribucion_1 = require("../entities/Distribucion");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Estado_controllers_1 = require("./Estado.controllers");
const Entrega_controllers_1 = require("./Entrega,controllers");
const Detalledistribucion_controllers_1 = require("./Detalledistribucion.controllers");
const Detalledistribucion_1 = require("../entities/Detalledistribucion");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Pedido_Controllers_1 = require("./Pedido.Controllers");
const Persona_controllers_1 = require("./Persona.controllers");
const Celular_controllers_1 = require("./Celular.controllers");
const Documento_controllers_1 = require("./Documento.controllers");
const Entrega_1 = require("../entities/Entrega");
const DIreccion_1 = require("../entities/DIreccion");
const getDistribuciones = async (req, res) => {
    try {
        const distribuciones = await Distribucion_1.Distribucion.find({
            relations: [
                "Estado",
                "Detalledistribucion",
                "Detalledistribucion.Producto",
                "Detalledistribucion.Paquete",
                "Pedido",
                "Sucursal"
            ]
        });
        return res.json(distribuciones);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDistribuciones = getDistribuciones;
const getDistribucion = async (req, res) => {
    try {
        const { id } = req.params;
        const distribucion = await Distribucion_1.Distribucion.findOne({ where: { IdDistribucion: id } });
        if (!distribucion) {
            return res.status(404).json({ message: "Distribucion not found" });
        }
        return res.json(distribucion);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDistribucion = getDistribucion;
const updateDistribucion = async (req, res) => {
    try {
        const { id } = req.params;
        const { reservas, detalles } = req.body;
        console.log("reserva", reservas);
        console.log("detalles", detalles);
        const distribucion = await Distribucion_1.Distribucion.findOne({ where: { IdDistribucion: id },
            relations: ['Pedido'] });
        if (!distribucion) {
            return res.status(404).json({ message: "Distribucion not found" });
        }
        if (reservas.Nombre) {
            reservas.IdCliente = await DataPersona(reservas);
        }
        if (reservas.IdCliente) {
            distribucion.Sucursal = null;
        }
        if (distribucion.Pedido !== null) {
            await (0, Pedido_Controllers_1.actualizarPedido)(reservas, detalles);
        }
        if (reservas.DestinoFInal !== 'TODOS') {
            distribucion.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: reservas.DestinoFInal });
        }
        await distribucion.save();
        await (0, Entrega_controllers_1.updateEntrega)({
            BarrioId: reservas.entrega.barrioId,
            Direccions: reservas.entrega.direccion,
            Referencia: reservas.entrega.referencia,
            Ubicacion: reservas.entrega.ubicacion,
            Costo: reservas.entrega.costoEnvio,
            PedidoID: id,
            EntregaId: reservas.Envio,
            DireccionId: reservas.DireccionId,
            IdSucursal: reservas?.entrega?.sucursaldestino,
            Fecha: reservas.entrega.fecha,
            Hora: reservas.entrega.hora,
            tipoe: reservas.IdTipoEntrega
        });
        // Obtener los detalles existentes
        const existingDetalles = await Detalledistribucion_1.Detalledistribucion.find({
            where: { Distribucion: { IdDistribucion: id } },
        });
        // Recolectar IDs de los detalles entrantes
        const incomingDetalleIds = new Set();
        detalles.forEach((d) => {
            if (d.IdDetalleDistribucion)
                incomingDetalleIds.add(d.IdDetalleDistribucion);
        });
        // Eliminar detalles que ya no existen
        for (const existingDetalle of existingDetalles) {
            if (!incomingDetalleIds.has(existingDetalle.IdDetalleDistribucion)) {
                await (0, Detalledistribucion_controllers_1.deleteDetalledistribucionAndRestoreStock)({
                    Iddetalle: existingDetalle.IdDetalleDistribucion,
                });
            }
        }
        // Actualizar o insertar cada detalle
        for (const detalle of detalles) {
            await (0, Detalledistribucion_controllers_1.updateDetalledistribucion)({
                Iddetalle: detalle.IdDetalleDistribucion,
                IdProducto: detalle.IdProducto || "",
                Cantidad: detalle.Cantidad,
                IdPaquete: detalle.IdPaquete || "",
                IdVenta: distribucion.IdDistribucion,
                Precio: detalle.Precio,
                Modo: detalle.Modo
            });
        }
        return res.status(201).json({ message: "Se actualizó correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateDistribucion = updateDistribucion;
const deleteDistribucion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Distribucion_1.Distribucion.delete({ IdDistribucion: id });
        if (result.affected === 0) {
            return res.status(404).json({ message: "Distribucion not found" });
        }
        return res.sendStatus(204);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteDistribucion = deleteDistribucion;
const verifyDistribucion = async ({ distribucio }) => {
    const existVenta = await Distribucion_1.Distribucion.findOne({ where: { IdDistribucion: distribucio } });
    if (!existVenta) {
        throw new error_handler_1.HttpError(404, `La Distribucion con ID ${distribucio} no existe.`);
    }
    return existVenta;
};
exports.verifyDistribucion = verifyDistribucion;
const ObtenerCLienteDestino = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Distribucion_1.Distribucion.findOne({
            where: { IdDistribucion: id },
            relations: ['Pedido', 'Pedido.Venta', 'Pedido.Venta.Persona', 'Entrega']
        });
        if (!result) {
            return res.status(404).json({ message: "Distribucion no encontrada" });
        }
        const entrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: result.Entrega.IdEntrega },
            relations: ['Direccion', 'Direccion.Barrio', 'Tipoentrega']
        });
        if (!entrega) {
            return res.status(404).json({ message: "entrega no encontrada" });
        }
        const resultSucursal = await DIreccion_1.Direccion.findOne({
            where: { IdDireccion: entrega.Direccion.IdDireccion },
            relations: ['Sucursal']
        });
        if (!resultSucursal) {
            return res.status(404).json({ message: "Direccion no encontrada" });
        }
        return res.json({
            IdCliente: result?.Pedido?.Venta?.Persona?.IdPersona,
            EntregaId: entrega.IdEntrega,
            direccion: entrega.Direccion.Direccion,
            fecha: entrega.FechaEntrega,
            hora: entrega.HoraEntrega,
            barrioId: entrega.Direccion.Barrio.IdBarrio,
            DireccionId: entrega.Direccion.IdDireccion,
            referencia: entrega.Direccion.Referencia,
            ubicacion: entrega.Direccion.Ubicacion,
            costoEnvio: entrega.CostoEntrega,
            tipo: entrega.Tipoentrega.IdTipoEntrega,
            IdSucursal: resultSucursal?.Sucursal?.IdSucursal
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.ObtenerCLienteDestino = ObtenerCLienteDestino;
const createDistribucion = async (req, res) => {
    try {
        const { reservas, detalles } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DIS');
        const nuevoPedido = new Distribucion_1.Distribucion();
        nuevoPedido.IdDistribucion = nuevoId;
        console.log("reservas", reservas);
        const fechaHoraActual = new Date();
        const fechaLocal = new Date(fechaHoraActual.getTime() - fechaHoraActual.getTimezoneOffset() * 60000);
        nuevoPedido.FechaDistribucion = fechaLocal;
        nuevoPedido.HoraDistribucion = fechaHoraActual.toTimeString().slice(0, 8);
        nuevoPedido.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 6 });
        nuevoPedido.Origen = (reservas.IdSucursal === 'TODOS') ? 'Cocina' : reservas.IdSucursal;
        if (reservas.DestinoFInal !== 'TODOS')
            nuevoPedido.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: reservas.DestinoFInal });
        if (reservas.Nombre) {
            reservas.IdCliente = await DataPersona(reservas);
        }
        if (reservas.IdCliente) {
            const pedido = await (0, Pedido_Controllers_1.registarPedido)(reservas, detalles);
            nuevoPedido.Pedido = await (0, Pedido_Controllers_1.verifyPedido)({ tipo: pedido.IdPedido });
        }
        await nuevoPedido.save();
        const destino = await (0, Entrega_controllers_1.createEntrega)({
            BarrioId: reservas.entrega.barrioId || "", // convertir al formato que espera tu método
            Direccions: reservas.entrega.direccion || "",
            Referencia: reservas.entrega.referencia || "",
            Ubicacion: reservas.entrega.ubicacion || "",
            Costo: reservas.entrega.costoEnvio || 0,
            PedidoID: nuevoId,
            IdSucursal: reservas?.entrega?.sucursaldestino,
            Fecha: reservas.entrega.fecha,
            Hora: reservas.entrega.hora,
            tipoe: reservas.IdTipoEntrega
        });
        if (nuevoPedido.Pedido !== null) {
            const entrega = await Entrega_1.Entrega.findOne({
                where: { IdEntrega: destino.IdEntrega }
            });
            if (!entrega) {
                return res.status(404).json({ message: "Entrega no encontrada" });
            }
            entrega.Pedido = nuevoPedido.Pedido;
            await entrega?.save();
        }
        if (detalles) {
            for (const producto of detalles) {
                await (0, Detalledistribucion_controllers_1.createDetalledistribucion)({
                    IdProducto: producto.IdProducto || "",
                    Cantidad: producto.Cantidad,
                    IdPaquete: producto.IdPaquete || "",
                    IdVenta: nuevoId,
                    Precio: producto.Precio.toFixed(2),
                    Modo: producto.Modo
                });
            }
        }
        return res.status(201).json({ message: "Se registró correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createDistribucion = createDistribucion;
const DataPersona = async (personaData) => {
    const persona = await (0, Persona_controllers_1.AnanirPersona)({
        Nombre: personaData.Nombre,
        ApellidoPaterno: personaData.ApellidoPaterno,
        ApellidoMaterno: personaData.ApellidoMaterno || '',
        FechaDeNacimiento: personaData.FechaDeNacimiento || '',
        IdGenero: personaData.IdGenero,
        email: personaData.email || ''
    });
    if (Array.isArray(personaData.Celulares)) {
        await Promise.all(personaData.Celulares.map((numero) => (0, Celular_controllers_1.createCelular)({ Numero: numero.Numero, PersonaId: persona.IdPersona })));
    }
    if (Array.isArray(personaData.Documento)) {
        await Promise.all(personaData.Documento
            .filter((doc) => doc.Documento && doc.Documento.trim() !== "")
            .map((doc) => (0, Documento_controllers_1.createDocumento)({
            IdTipoDocumento: doc.IdTipoDocumento,
            IdComplemento: doc.IdComplemento,
            Documentos: doc.Documento,
            PersonaId: persona.IdPersona
        })));
    }
    return persona.IdPersona;
};
