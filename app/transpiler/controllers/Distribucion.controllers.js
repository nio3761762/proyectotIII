"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anularDistribucion = exports.createDistribucion = exports.ObtenerCLienteDestino = exports.verifyDistribucion = exports.deleteDistribucion = exports.updateDistribucion = exports.getDistribucion = exports.getDistribucionesSucursal = exports.getDistribuciones = void 0;
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
const typeorm_1 = require("typeorm");
const Pedido_1 = require("../entities/Pedido");
const SucursalProducto_controllers_1 = require("./SucursalProducto.controllers");
const getDistribuciones = async (req, res) => {
    try {
        const distribuciones = await Distribucion_1.Distribucion.find({
            relations: [
                "Estado",
                "Detalledistribucion",
                "Detalledistribucion.Producto",
                "Detalledistribucion.Paquete",
                "Pedido",
                "Pedido.Venta.Sucursal",
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
const getDistribucionesSucursal = async (req, res) => {
    try {
        const { fecha, idsucursal } = req.query;
        const query = Distribucion_1.Distribucion.createQueryBuilder("distribucion")
            .leftJoinAndSelect("distribucion.Estado", "Estado")
            .leftJoinAndSelect("distribucion.Detalledistribucion", "Detalledistribucion")
            .leftJoinAndSelect("Detalledistribucion.Producto", "Producto")
            .leftJoinAndSelect("Detalledistribucion.Paquete", "Paquete")
            .leftJoinAndSelect("distribucion.Pedido", "Pedido")
            .leftJoinAndSelect("Pedido.Venta", "Venta")
            .leftJoinAndSelect("Venta.Persona", "Persona")
            .leftJoin("Venta.Sucursal", "VentaSucursal")
            .leftJoinAndSelect("distribucion.Sucursal", "Sucursal")
            .where("distribucion.FechaDistribucion = :fecha", { fecha });
        if (idsucursal === 'Cocina') {
            query.andWhere("distribucion.Origen = 'Cocina'");
        }
        else if (idsucursal !== 'TODOS') {
            query.andWhere(new typeorm_1.Brackets(qb => {
                qb.where("VentaSucursal.IdSucursal = :idsucursal", { idsucursal })
                    .orWhere("Venta.IdVenta IS NULL");
            }));
        }
        const distribuciones = await query.getMany();
        return res.json(distribuciones);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getDistribucionesSucursal = getDistribucionesSucursal;
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
        // Eliminar detalles que ya no existen y restaurar su stock
        for (const existingDetalle of existingDetalles) {
            if (!incomingDetalleIds.has(existingDetalle.IdDetalleDistribucion)) {
                await (0, Detalledistribucion_controllers_1.deleteDetalledistribucionAndRestoreStock)({
                    Iddetalle: existingDetalle.IdDetalleDistribucion,
                    SucursalId: reservas.IdSucursal
                });
            }
        }
        // Actualizar o insertar cada detalle
        if (detalles) {
            for (const detalle of detalles) {
                // Buscar el detalle existente para comparar cantidades
                const detalleExistente = existingDetalles.find(d => d.IdDetalleDistribucion === detalle.IdDetalleDistribucion);
                await (0, Detalledistribucion_controllers_1.updateDetalledistribucion)({
                    Iddetalle: detalle.IdDetalleDistribucion,
                    IdProducto: detalle.IdProducto || "",
                    Cantidad: detalle.Cantidad,
                    IdPaquete: detalle.IdPaquete || "",
                    IdVenta: distribucion.IdDistribucion,
                    Precio: detalle.Precio,
                    Modo: detalle.Modo
                });
                // Calcular la diferencia de stock
                if (detalleExistente) {
                    // Si existe, calcular la diferencia entre nueva y anterior
                    const cantidadAnterior = detalleExistente.Cantidad;
                    const cantidadNueva = detalle.Cantidad;
                    const diferencia = cantidadNueva - cantidadAnterior;
                    // Si diferencia > 0: se agregaron unidades, decrementar stock
                    // Si diferencia < 0: se quitaron unidades, incrementar stock (restaurar)
                    if (diferencia !== 0) {
                        if (detalle.IdProducto) {
                            await (0, SucursalProducto_controllers_1.DecrementProducto)({
                                SucursalId: reservas.IdSucursal,
                                ProductoId: detalle.IdProducto,
                                Cantidad: diferencia
                            });
                        }
                        else {
                            await (0, SucursalProducto_controllers_1.DecrementPaquete)({
                                SucursalId: reservas.IdSucursal,
                                PaqueteId: detalle.IdPaquete,
                                Cantidad: diferencia
                            });
                        }
                    }
                }
                else {
                    // Si es un detalle nuevo, decrementar el stock por la cantidad completa
                    if (detalle.IdProducto) {
                        await (0, SucursalProducto_controllers_1.DecrementProducto)({
                            SucursalId: reservas.IdSucursal,
                            ProductoId: detalle.IdProducto,
                            Cantidad: detalle.Cantidad
                        });
                    }
                    else {
                        await (0, SucursalProducto_controllers_1.DecrementPaquete)({
                            SucursalId: reservas.IdSucursal,
                            PaqueteId: detalle.IdPaquete,
                            Cantidad: detalle.Cantidad
                        });
                    }
                }
            }
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
        console.log(id);
        const result = await Distribucion_1.Distribucion.findOne({
            where: { IdDistribucion: id },
            relations: ['Pedido', 'Pedido.Venta', 'Pedido.Venta.Persona', 'Entrega']
        });
        if (!result) {
            return res.status(404).json({ message: "Distribucion no encontrada" });
        }
        if (!result.Entrega) {
            return res.status(404).json({ message: "La distribución no tiene entrega asociada" });
        }
        const entrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: result.Entrega.IdEntrega },
            relations: ['Direccion', 'Direccion.Barrio', 'Direccion.Sucursal', 'Tipoentrega']
        });
        if (!entrega) {
            return res.status(404).json({ message: "Entrega no encontrada" });
        }
        if (!entrega.Direccion) {
            return res.status(404).json({ message: "La entrega no tiene dirección asociada" });
        }
        return res.json({
            IdCliente: result?.Pedido?.Venta?.Persona?.IdPersona || null,
            Nombre: result?.Pedido?.Venta?.Persona?.Nombre || null,
            ApellidoPaterno: result?.Pedido?.Venta?.Persona?.ApellidoPaterno || null,
            ApellidoMaterno: result?.Pedido?.Venta?.Persona?.ApellidoMaterno || null,
            EntregaId: entrega.IdEntrega,
            direccion: entrega.Direccion.Direccion || null,
            fecha: entrega.FechaEntrega || null,
            hora: entrega.HoraEntrega || null,
            barrioId: entrega.Direccion.Barrio?.IdBarrio || null,
            DireccionId: entrega.Direccion.IdDireccion,
            referencia: entrega.Direccion.Referencia || null,
            ubicacion: entrega.Direccion.Ubicacion || null,
            costoEnvio: entrega.CostoEntrega || 0,
            tipo: entrega.Tipoentrega?.IdTipoEntrega || null,
            IdSucursal: entrega.Direccion.Sucursal?.IdSucursal || null
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: "Error al obtener cliente destino", error: error.message });
        }
        return res.status(500).json({ message: "Error al obtener cliente destino" });
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
        nuevoPedido.Origen = reservas.IdSucursal;
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
            for (const producto of detalles) {
                if (producto.IdProducto)
                    await (0, SucursalProducto_controllers_1.DecrementProducto)({ SucursalId: reservas.IdSucursal, ProductoId: producto.IdProducto, Cantidad: producto.Cantidad });
                else
                    await (0, SucursalProducto_controllers_1.DecrementPaquete)({ SucursalId: reservas.IdSucursal, PaqueteId: producto.IdPaquete, Cantidad: producto.Cantidad });
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
const anularDistribucion = async (req, res) => {
    try {
        const { id } = req.params;
        const distribucion = await Distribucion_1.Distribucion.findOne({
            where: { IdDistribucion: id },
            relations: ["Pedido", "Entrega", "Detalledistribucion"]
        });
        if (!distribucion) {
            return res.status(404).json({ message: "Distribucion not found" });
        }
        // Assuming state 5 is "Anulado". Please verify.
        const estadoAnulado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 5 });
        distribucion.Estado = estadoAnulado;
        if (distribucion.Pedido) {
            const pedido = await Pedido_1.Pedido.findOne({ where: { IdPedido: distribucion.Pedido.IdPedido } });
            if (pedido) {
                pedido.Estado = estadoAnulado;
                await pedido.save();
            }
        }
        if (distribucion.Entrega) {
            const entrega = await Entrega_1.Entrega.findOne({ where: { IdEntrega: distribucion.Entrega.IdEntrega } });
            if (entrega) {
                entrega.Estado = estadoAnulado;
                await entrega.save();
            }
        }
        if (distribucion.Detalledistribucion) {
            for (const detalle of distribucion.Detalledistribucion) {
                await (0, Detalledistribucion_controllers_1.deleteDetalledistribucionAndRestoreStock)({
                    Iddetalle: detalle.IdDetalleDistribucion,
                    SucursalId: distribucion.Origen // Usar el origen de la distribución
                });
            }
        }
        await distribucion.save();
        return res.status(200).json({ message: "Distribucion anulada correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
}; //
exports.anularDistribucion = anularDistribucion;
