"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerDetalle = exports.obteneralCliente = exports.actualizarlaDireccion = exports.DevolucionEntrega = exports.AsignarRepartidor = exports.getEntregaSucursal = exports.getEntregas = exports.ObtenerDIreccionEntrega = exports.ObtenerEntrega = exports.getTipoEntrega = exports.verifyTipoEntrega = exports.updateEntrega = exports.createEntrega = void 0;
const Entrega_1 = require("../entities/Entrega");
const Sucursal_1 = require("../entities/Sucursal");
const TipoEntrega_1 = require("../entities/TipoEntrega");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Direccion_controllers_1 = require("./Direccion.controllers");
const Estado_controllers_1 = require("./Estado.controllers");
const Pedido_Controllers_1 = require("./Pedido.Controllers");
const typeorm_1 = require("typeorm");
const Distribucion_controllers_1 = require("./Distribucion.controllers");
const Distribucion_1 = require("../entities/Distribucion");
const Pedido_1 = require("../entities/Pedido");
const Repartidor_controllers_1 = require("./Repartidor.controllers");
const DetalleVenta_controllers_1 = require("./DetalleVenta.controllers");
const Detalledistribucion_controllers_1 = require("./Detalledistribucion.controllers");
const Venta_1 = require("../entities/Venta");
const DIreccion_1 = require("../entities/DIreccion");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Pago_controllers_1 = require("./Pago.controllers");
const createEntrega = async ({ BarrioId, Direccions, Referencia, Ubicacion, Costo, PedidoID, IdSucursal, Fecha, Hora, tipoe }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('ENT');
    const nuevoEntrega = new Entrega_1.Entrega();
    nuevoEntrega.IdEntrega = nuevoId;
    nuevoEntrega.Direccion = (tipoe === "TPE-E1") ? await cargarDireccion({ IdSucursal: IdSucursal }) : await (0, Direccion_controllers_1.createDireccion)({
        BarrioId: BarrioId || "",
        Direccions: Direccions || "",
        Referencia: Referencia || "",
        Ubicacion: Ubicacion || ""
    });
    nuevoEntrega.CostoEntrega = Costo || 0.00;
    nuevoEntrega.FechaEntrega = parseLocalDate(Fecha);
    nuevoEntrega.HoraEntrega = normalizarHora(Hora);
    let pedido = null;
    let distribucion = null;
    try {
        pedido = await (0, Pedido_Controllers_1.verifyPedido)({ tipo: PedidoID });
    }
    catch (err) {
        // si no existe, intentamos como Distribución
        distribucion = await (0, Distribucion_controllers_1.verifyDistribucion)({ distribucio: PedidoID }); // ojo, parámetro correcto
    }
    if (!pedido && !distribucion) {
        throw new Error("No se encontró ni Pedido ni Distribución con ese ID");
    }
    // asignar al nuevoEntrega
    if (pedido)
        nuevoEntrega.Pedido = pedido;
    if (distribucion)
        nuevoEntrega.Distribucion = distribucion;
    nuevoEntrega.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 6 });
    nuevoEntrega.Tipoentrega = await (0, exports.verifyTipoEntrega)({ tipo: tipoe });
    await nuevoEntrega.save();
    return nuevoEntrega;
};
exports.createEntrega = createEntrega;
const updateEntrega = async ({ BarrioId, Direccions, Referencia, Ubicacion, Costo, PedidoID, EntregaId, DireccionId, IdSucursal, Fecha, Hora, tipoe }) => {
    if (EntregaId) {
        const nuevoEntrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: EntregaId },
            relations: ["Direccion", "Direccion.Sucursal"]
        });
        if (!nuevoEntrega) {
            throw new error_handler_1.HttpError(404, `El Entrega con ID ${EntregaId} no existe.`);
        }
        if (!nuevoEntrega?.Direccion?.Sucursal && IdSucursal === 'TODOS') {
            if (tipoe !== "TPE-E1" && !DireccionId) {
                nuevoEntrega.Direccion = await (0, Direccion_controllers_1.createDireccion)({
                    BarrioId: BarrioId || "",
                    Direccions: Direccions || "",
                    Referencia: Referencia || "",
                    Ubicacion: Ubicacion || ""
                });
            }
            else
                await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: DireccionId, BarrioId: BarrioId, Direccions: Direccions, Referencia: Referencia, Ubicacion: Ubicacion });
        }
        else {
            nuevoEntrega.Direccion = (tipoe === "TPE-E1") ?
                await cargarDireccion({ IdSucursal: IdSucursal }) :
                await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: IdSucursal ? '' : DireccionId, BarrioId: BarrioId, Direccions: Direccions, Referencia: Referencia, Ubicacion: Ubicacion });
        }
        if (IdSucursal && tipoe === "TPE-E1") {
            const direccion = await DIreccion_1.Direccion.findOne({
                where: { IdDireccion: DireccionId },
                relations: ["Sucursal"],
            });
            if (direccion?.Sucursal) {
                console.log('Ok');
                //     throw new HttpError(400, "No se puede eliminar la dirección porque está asociada a una sucursal");
            }
            else {
                await DIreccion_1.Direccion.delete({ IdDireccion: DireccionId });
            }
        }
        nuevoEntrega.CostoEntrega = Costo;
        nuevoEntrega.FechaEntrega = parseLocalDate(Fecha);
        nuevoEntrega.HoraEntrega = normalizarHora(Hora);
        nuevoEntrega.Tipoentrega = await (0, exports.verifyTipoEntrega)({ tipo: tipoe });
        await nuevoEntrega.save();
        return nuevoEntrega;
    }
    else
        return (0, exports.createEntrega)({ BarrioId: BarrioId, Direccions: Direccions, Referencia: Referencia, Ubicacion: Ubicacion, Costo: Costo, PedidoID: PedidoID, IdSucursal: IdSucursal, Fecha: Fecha, Hora: Hora, tipoe: tipoe });
};
exports.updateEntrega = updateEntrega;
const normalizarHora = (hora) => {
    if (!hora)
        return new Date().toTimeString().split(" ")[0]; // hora actual HH:mm:ss
    // Si viene en formato HH:mm, agregamos los segundos
    if (/^\d{2}:\d{2}$/.test(hora)) {
        return `${hora}:00`;
    }
    return hora; // Asumimos que ya está en HH:mm:ss
};
const parseLocalDate = (yyyyMMdd) => {
    const [year, month, day] = yyyyMMdd.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
};
const cargarDireccion = async ({ IdSucursal }) => {
    const sucursal = await Sucursal_1.Sucursal.findOne({
        where: {
            IdSucursal: IdSucursal
        }, relations: [
            "Direccion"
        ]
    });
    if (!sucursal) {
        throw new error_handler_1.HttpError(404, `La sucursal con el ID ${IdSucursal} no existe.`);
    }
    return sucursal.Direccion;
};
const verifyTipoEntrega = async ({ tipo }) => {
    const existEstado = await TipoEntrega_1.Tipoentrega.findOne({ where: { IdTipoEntrega: tipo } });
    if (!existEstado) {
        throw new Error(`La entrega con ID ${existEstado} no existe.`);
    }
    return existEstado;
};
exports.verifyTipoEntrega = verifyTipoEntrega;
const getTipoEntrega = async (req, res) => {
    try {
        const Tipopromocions = await TipoEntrega_1.Tipoentrega.find();
        return res.json(Tipopromocions);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getTipoEntrega = getTipoEntrega;
const ObtenerEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const entrega = await Entrega_1.Entrega.findOne({
            where: [
                { Pedido: { IdPedido: id } },
                { IdEntrega: id }
            ],
            relations: ["Tipoentrega", "Direccion", "Direccion.Sucursal", "Direccion.Barrio"]
        });
        return res.json(entrega);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.ObtenerEntrega = ObtenerEntrega;
const ObtenerDIreccionEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const entrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: id },
            relations: ["Tipoentrega", "Direccion", "Direccion.Sucursal", "Direccion.Barrio"]
        });
        return res.json(entrega);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.ObtenerDIreccionEntrega = ObtenerDIreccionEntrega;
const getEntregas = async (req, res) => {
    try {
        const entrega = await Entrega_1.Entrega.findOne({
            relations: [
                "Tipoentrega",
                "Direccion",
                "Direccion.Barrio",
                "Estado",
                "Pedido"
            ]
        });
        return res.json(entrega);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getEntregas = getEntregas;
const getEntregaSucursal = async (req, res) => {
    try {
        const { id, fecha } = req.params;
        console.log("Fecha recibida:", fecha);
        const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
        const inicioDia = new Date(`${fechaStr}T00:00:00`);
        const finDia = new Date(`${fechaStr}T23:59:59.999`);
        let entregas = await Entrega_1.Entrega.find({
            where: { FechaEntrega: (0, typeorm_1.Between)(inicioDia, finDia) },
            relations: [
                "Estado",
                "Direccion",
                "Pedido",
                "Pedido.Tipopedido",
                "Pedido.Venta.Persona",
                "Pedido.Venta.Sucursal",
                "Tipoentrega"
            ]
        });
        const filtradas = entregas
            .filter(e => id === "TODOS" || e.Pedido.Venta?.Sucursal.IdSucursal === id)
            .map(e => ({
            IdEntrega: e.IdEntrega,
            FechaEntrega: e.FechaEntrega,
            HoraEntrega: e.HoraEntrega,
            Estado: e.Estado?.IdEstado,
            NombreEstado: e.Estado?.Nombre,
            Costo: e.CostoEntrega,
            Direccion: e.Direccion?.IdDireccion,
            NombreEntrega: e.Tipoentrega.Nombre,
            IdtEntrega: e.Tipoentrega.IdTipoEntrega,
            Pedido: {
                IdPedido: e.Pedido?.IdPedido,
                FechaRegistro: e.Pedido?.FechaRegistro,
                Hora: e.Pedido?.Hora,
                NombreTipo: e.Pedido?.Tipopedido?.Nombre,
                IdVenta: e.Pedido?.Venta?.IdVenta,
                Persona: e.Pedido?.Venta?.Persona
            }
        }));
        return res.json(filtradas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getEntregaSucursal = getEntregaSucursal;
const AsignarRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const { repartidor } = req.body;
        const entrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: id }
        });
        if (!entrega) {
            return res.status(404).json({ message: "Entrega no asignada" });
        }
        entrega.Repartidor = await (0, Repartidor_controllers_1.verifyRepartidor)({ repartiodrId: repartidor.IdRepartidor });
        return res.json({ message: 'Repartidor asignado correctamente' });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.AsignarRepartidor = AsignarRepartidor;
const DevolucionEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const { detalles, comentario } = req.body;
        const entrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: id },
            relations: [
                "Pedido",
                "Distribucion",
            ]
        });
        //ssss
        if (!entrega) {
            throw new error_handler_1.HttpError(404, `La entrega con ID ${id} no existe.`);
        }
        // ASUMO que el estado 9 es 'Devuelto'. ¡Verifica esto!
        if (entrega.Pedido) {
            const pedido = await Pedido_1.Pedido.findOne({
                where: { IdPedido: entrega.Pedido.IdPedido },
                relations: ["Venta", "Venta.Sucursal"],
            });
            if (!pedido)
                throw new error_handler_1.HttpError(404, `Pedido no existe.`);
            const venta = await Venta_1.Venta.findOne({
                where: { IdVenta: pedido?.Venta.IdVenta },
                relations: ["Sucursal"],
            });
            if (!venta)
                throw new error_handler_1.HttpError(404, `venta no existe.`);
            venta.FechaVenta = new Date();
            venta.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 3 }); // por ejemplo: "En proceso"
            await venta.save();
            let todosDevueltos = true;
            let todosEntregados = true;
            for (const detalle of detalles.item) {
                await (0, DetalleVenta_controllers_1.createDetalleventa)({
                    IdPromocion: detalle?.IdPromocion || "",
                    IdProducto: detalle?.IdProducto || "",
                    Cantidad: detalle.Cantidad, // Cantidad entregada
                    IdPaquete: detalle?.IdPaquete || "",
                    IdVenta: venta.IdVenta,
                    Precio: detalle.Precio,
                    IdSucursal: venta?.Sucursal?.IdSucursal || "",
                    Modo: detalle.Modo,
                });
                // Comparaciones
                if (detalle.Cantidad !== 0) {
                    todosDevueltos = false; // hay algo entregado
                }
                if (detalle.Cantidad !== detalle.CantidadOriginal) {
                    todosEntregados = false; // no se cumplió la cantidad completa
                }
            }
            if (comentario)
                pedido.Detalle = comentario;
            // 🔹 Decidir estado final
            if (todosDevueltos) {
                pedido.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 12 }); // Devuelto
                entrega.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 12 });
                venta.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 5 });
            }
            else if (todosEntregados) {
                pedido.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 13 }); // Entregado
                entrega.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 13 });
                venta.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 3 });
            }
            else {
                pedido.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 14 }); // Entrega parcial
                entrega.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 14 });
                venta.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 3 });
            }
            await venta.save();
            await pedido.save();
            // Generar pago si corresponde
            await (0, Pago_controllers_1.createPago)({
                IdVenta: venta.IdVenta,
                Monto: detalles.Monto,
                Cambio: detalles.Cambio,
                IdMetodoPago: detalles.IdMetodo,
            });
        }
        if (entrega.Distribucion) {
            const distribucio = await Distribucion_1.Distribucion.findOne({
                where: { IdDistribucion: entrega.Distribucion.IdDistribucion },
                relations: [
                    "Detalledistribucion",
                    "Detalledistribucion.Producto",
                    "Detalledistribucion.Paquete"
                ]
            });
            if (!distribucio) {
                throw new error_handler_1.HttpError(404, `Distribucion no existe.`);
            }
            for (const detalle of detalles.item) {
                const idDetalle = detalle?.IdPaquete ? detalle.IdPaquete : detalle.IdProducto;
                // Buscar el detalle existente en la distribución
                const detalleExistente = distribucio.Detalledistribucion.find(d => (d.Producto && d.Producto.IdProducto === idDetalle) ||
                    (d.Paquete && d.Paquete.IdPaquete === idDetalle));
                if (!detalleExistente) {
                    throw new error_handler_1.HttpError(404, `No existe en la distribución el detalle con ID ${idDetalle}`);
                }
                console.log("IdDetalledistribucion encontrado:", detalleExistente.IdDetalleDistribucion);
                if (detalle.Cantidaddevuelta > 0)
                    entrega.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 12 });
                await (0, Detalledistribucion_controllers_1.devolucionCantidad)({
                    Iddetalle: detalleExistente.IdDetalleDistribucion,
                    Cantidad: detalle.Cantidaddevuelta
                });
                let todosDevueltos = true;
                let todosEntregados = true;
                if (todosDevueltos) {
                    distribucio.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 11 }); // Devuelto
                    entrega.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 11 });
                }
                else if (todosEntregados) {
                    distribucio.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 12 }); // Entregado
                    entrega.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 12 });
                }
                else {
                    distribucio.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 13 }); // Entrega parcial
                    entrega.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 13 });
                }
            }
            if (comentario)
                distribucio.Observacion = comentario;
            distribucio.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 11 });
            await distribucio.save();
        }
        await entrega.save();
        return res.json({ message: 'Devolución registrada correctamente.' });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.DevolucionEntrega = DevolucionEntrega;
const actualizarlaDireccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { detalles } = req.body;
        const entrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: id },
            relations: [
                "Distribucion",
                "Pedido",
                "Direccion",
                "Direccion.Sucursal",
            ]
        });
        if (!entrega) {
            throw new error_handler_1.HttpError(404, `La entrega con ID ${id} no existe.`);
        }
        if (!entrega?.Direccion?.Sucursal && !detalles.IdSucursal) {
            if (detalles.tipoe !== "TPE-E1" && !detalles.DireccionId) {
                entrega.Direccion = await (0, Direccion_controllers_1.createDireccion)({
                    BarrioId: detalles.BarrioId || "",
                    Direccions: detalles.Direccion || "",
                    Referencia: detalles.Referencia || "",
                    Ubicacion: detalles.Ubicacion || ""
                });
            }
            else
                await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: detalles.DireccionId, BarrioId: detalles.BarrioId, Direccions: detalles.Direccion, Referencia: detalles.Referencia, Ubicacion: detalles.Ubicacion });
        }
        else {
            entrega.Direccion = (detalles.tipoe === "TPE-E1") ?
                await cargarDireccion({ IdSucursal: detalles.IdSucursal }) :
                await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: detalles.IdSucursal ? '' : detalles.DireccionId, BarrioId: detalles.BarrioId, Direccions: detalles.Direccion, Referencia: detalles.Referencia, Ubicacion: detalles.Ubicacion });
        }
        entrega.CostoEntrega = detalles.Costo;
        entrega.Tipoentrega = await (0, exports.verifyTipoEntrega)({ tipo: detalles.tipoe });
        entrega.FechaEntrega = parseLocalDate(detalles.Fecha);
        entrega.HoraEntrega = normalizarHora(detalles.Hora);
        await entrega.save();
        if (detalles.tipoe === "TPE-E2") {
            if (entrega.Distribucion) {
                const distribucion = await Distribucion_1.Distribucion.findOne({
                    where: { IdDistribucion: entrega.Distribucion.IdDistribucion }
                });
                if (!distribucion) {
                    throw new error_handler_1.HttpError(404, `La entrega con ID ${id} no existe.`);
                }
                distribucion.Sucursal = null;
                await distribucion.save();
            }
        }
        if (detalles.IdSucursal && detalles.tipoe === "TPE-E1") {
            if (entrega.Distribucion) {
                const distribucion = await Distribucion_1.Distribucion.findOne({
                    where: { IdDistribucion: entrega.Distribucion.IdDistribucion }
                });
                if (!distribucion) {
                    throw new error_handler_1.HttpError(404, `La entrega con ID ${id} no existe.`);
                }
                distribucion.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: detalles.IdSucursal });
                await distribucion.save();
            }
            const direccion = await DIreccion_1.Direccion.findOne({
                where: { IdDireccion: detalles.DireccionId },
                relations: ["Sucursal"],
            });
            if (direccion?.Sucursal) {
                console.log('Ok');
                //     throw new HttpError(400, "No se puede eliminar la dirección porque está asociada a una sucursal");
            }
            else {
                await DIreccion_1.Direccion.delete({ IdDireccion: detalles.DireccionId });
            }
        }
        return res.json({ message: 'Direccion actualizada' });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.actualizarlaDireccion = actualizarlaDireccion;
const obteneralCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const entrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: id },
            relations: [
                "Pedido",
                "Pedido.Venta",
                "Pedido.Venta.Sucursal",
                "Pedido.Venta.Persona",
                "Distribucion",
                "Distribucion.Sucursal",
                "Direccion",
                "Direccion.Sucursal",
            ]
        });
        if (!entrega) {
            throw new error_handler_1.HttpError(404, `La entrega con ID ${id} no existe.`);
        }
        return res.json(entrega);
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.obteneralCliente = obteneralCliente;
const obtenerDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const entrega = await Entrega_1.Entrega.findOne({
            where: { IdEntrega: id },
            relations: [
                "Pedido",
                "Distribucion"
            ]
        });
        let distribucio;
        if (!entrega) {
            throw new error_handler_1.HttpError(404, `La entrega con ID ${id} no existe.`);
        }
        if (entrega.Distribucion) {
            distribucio = await Distribucion_1.Distribucion.findOne({
                where: { IdDistribucion: entrega.Distribucion.IdDistribucion },
                relations: [
                    "Detalledistribucion",
                    "Detalledistribucion.Producto",
                    "Detalledistribucion.Paquete",
                ]
            });
            if (!distribucio) {
                throw new error_handler_1.HttpError(404, `La distribucion con ID ${entrega.Distribucion.IdDistribucion} no existe.`);
            }
        }
        let pedido;
        if (entrega.Pedido) {
            pedido = await Pedido_1.Pedido.findOne({
                where: { IdPedido: entrega.Pedido.IdPedido },
                relations: [
                    "Tipopedido",
                    "Detallepedido",
                    "Detallepedido.Producto",
                    "Detallepedido.Paquete",
                    "Detallepedido.Promocion",
                ]
            });
            if (!pedido) {
                throw new error_handler_1.HttpError(404, `La distribucion con ID ${entrega.Pedido.IdPedido} no existe.`);
            }
        }
        return res.json({
            Pedido: pedido,
            Distribucion: distribucio
        });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.obtenerDetalle = obtenerDetalle;
