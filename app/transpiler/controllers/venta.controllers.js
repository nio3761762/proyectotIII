"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarVenta = exports.createVenta = exports.getVentasUsuario = exports.getVentasSucursal = exports.getVentasTodasSucursal = exports.anularVenta = exports.agregarClienteVenta = exports.updateVenta = exports.registrarVenta = exports.verifyVenta = exports.getVentas = void 0;
const Venta_1 = require("../entities/Venta");
const DetalleVenta_1 = require("../entities/DetalleVenta");
const error_handler_1 = require("../utils/error.handler");
const Usuario_controllers_1 = require("./Usuario.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const DetalleVenta_controllers_1 = require("./DetalleVenta.controllers");
const Pago_controllers_1 = require("./Pago.controllers");
const Persona_controllers_1 = require("./Persona.controllers");
const Estado_controllers_1 = require("./Estado.controllers");
const SucursalProducto_controllers_1 = require("./SucursalProducto.controllers");
const typeorm_1 = require("typeorm");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Celular_controllers_1 = require("./Celular.controllers");
const Documento_controllers_1 = require("./Documento.controllers");
const Persona_1 = require("../entities/Persona");
const DataPersona = async (personaData) => {
    const persona = await (0, Persona_controllers_1.AnanirPersona)({
        Nombre: personaData.Nombre,
        ApellidoPaterno: personaData.ApellidoPaterno,
        ApellidoMaterno: personaData.ApellidoMaterno || '',
        FechaDeNacimiento: personaData.FechaDeNacimiento || '',
        IdGenero: personaData.IdGenero,
        email: personaData.email || ''
    });
    console.log(persona);
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
    const existePersona = await Persona_1.Persona.findOne({
        where: { IdPersona: persona.IdPersona }
    });
    if (existePersona)
        console.log(existePersona, 'existe');
    return persona.IdPersona;
};
const getVentas = async (req, res) => {
    try {
        const ventas = await Venta_1.Venta.find({
            relations: [
                "Estado",
                "Usuario",
                "Usuario.Usuariosucursal",
                "Usuario.Usuariosucursal.Sucursal"
            ]
        });
        return res.json(ventas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getVentas = getVentas;
const verifyVenta = async ({ VentaId }) => {
    const existVenta = await Venta_1.Venta.findOne({ where: { IdVenta: VentaId } });
    if (!existVenta) {
        throw new error_handler_1.HttpError(404, `El Metodo Venta con ID ${VentaId} no existe.`);
    }
    return existVenta;
};
exports.verifyVenta = verifyVenta;
const registrarVenta = async (req, res) => {
    try {
        const { ventas, detalles } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('V');
        const venta = new Venta_1.Venta();
        venta.IdVenta = nuevoId;
        if (ventas.Nombre) {
            ventas.IdCliente = DataPersona(ventas);
        }
        if (ventas.IdCliente)
            venta.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: ventas.IdCliente });
        venta.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: ventas.IdUsuario });
        if (ventas.IdSucursal)
            venta.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: ventas.IdSucursal });
        const fechaHoraActual = new Date();
        venta.FechaVenta = fechaHoraActual;
        venta.HoraVenta = fechaHoraActual.toTimeString().slice(0, 8);
        venta.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 3 });
        await venta.save();
        await (0, Pago_controllers_1.createPago)({ IdVenta: nuevoId, Monto: ventas.Monto, Cambio: ventas.Cambio, IdMetodoPago: ventas.IdMetodoPago });
        if (detalles) {
            if (detalles.Producto && detalles.Producto.length > 0) {
                for (const producto of detalles.Producto) {
                    await (0, DetalleVenta_controllers_1.createDetalleventa)({
                        IdPromocion: '',
                        IdProducto: producto.id,
                        Cantidad: producto.Cantidad,
                        IdPaquete: '',
                        IdVenta: nuevoId,
                        Precio: producto.precioUnitario.toFixed(2),
                        IdSucursal: ventas.IdSucursal,
                        Modo: producto.Modo
                    });
                }
            }
            if (detalles.Paquete && detalles.Paquete.length > 0) {
                for (const paquete of detalles.Paquete) {
                    await (0, DetalleVenta_controllers_1.createDetalleventa)({
                        IdPromocion: '',
                        IdProducto: '',
                        Cantidad: paquete.Cantidad,
                        IdPaquete: paquete.id,
                        IdVenta: nuevoId,
                        Precio: paquete.precioUnitario.toFixed(2),
                        IdSucursal: ventas.IdSucursal,
                        Modo: paquete.Modo
                    });
                }
            }
            if (detalles.Promocion && detalles.Promocion.length > 0) {
                for (const promocion of detalles.Promocion) {
                    await (0, DetalleVenta_controllers_1.createDetalleventa)({
                        IdPromocion: promocion.id,
                        IdProducto: '',
                        Cantidad: promocion.Cantidad,
                        IdPaquete: '',
                        IdVenta: nuevoId,
                        Precio: promocion.precioUnitario.toFixed(2),
                        IdSucursal: ventas.IdSucursal,
                        Modo: promocion.Modo
                    });
                }
            }
        }
        res.status(201).json({ message: "La venta se registro correctamente" });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }
};
exports.registrarVenta = registrarVenta;
const updateVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { ventas, detalles } = req.body;
        const venta = await Venta_1.Venta.findOne({
            where: { IdVenta: id }
        });
        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }
        if (ventas.IdCliente)
            venta.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: ventas.IdCliente });
        const fechaHoraActual = new Date();
        venta.FechaVenta = fechaHoraActual;
        venta.HoraVenta = fechaHoraActual.toTimeString().slice(0, 8);
        await venta.save();
        await (0, Pago_controllers_1.updatePago)({ IdVenta: venta.IdVenta, IdPago: ventas.IdPago, Monto: ventas.Monto, Cambio: ventas.Cambio, IdMetodoPago: ventas.IdMetodoPago });
        // Fetch existing details for this venta
        const existingDetalles = await DetalleVenta_1.Detalleventa.find({
            where: { Venta: { IdVenta: id } },
            relations: ["Producto", "Paquete", "Promocion"]
        });
        // Collect IDs of incoming details
        const incomingDetalleIds = new Set();
        if (detalles.Producto) {
            detalles.Producto.forEach((p) => {
                if (p.IdDetalleVenta)
                    incomingDetalleIds.add(p.IdDetalleVenta);
            });
        }
        if (detalles.Paquete) {
            detalles.Paquete.forEach((p) => {
                if (p.IdDetalleVenta)
                    incomingDetalleIds.add(p.IdDetalleVenta);
            });
        }
        if (detalles.Promocion) {
            detalles.Promocion.forEach((p) => {
                if (p.IdDetalleVenta)
                    incomingDetalleIds.add(p.IdDetalleVenta);
            });
        }
        // Identify and delete details that are no longer present in the incoming request
        for (const existingDetalle of existingDetalles) {
            if (!incomingDetalleIds.has(existingDetalle.IdDetalleVenta)) {
                await (0, DetalleVenta_controllers_1.deleteDetalleventaAndRestoreStock)({
                    Iddetalle: existingDetalle.IdDetalleVenta,
                    IdSucursal: ventas.IdSucursal // Assuming IdSucursal is available in ventas
                });
            }
        }
        if (detalles) {
            if (detalles.Producto && detalles.Producto.length > 0) {
                for (const producto of detalles.Producto) {
                    await (0, DetalleVenta_controllers_1.updateDetalleventa)({
                        Iddetalle: producto.IdDetalleVenta,
                        IdPromocion: '',
                        IdProducto: producto.id,
                        Cantidad: producto.Cantidad,
                        IdPaquete: '',
                        IdVenta: venta.IdVenta,
                        Precio: producto.precioUnitario.toFixed(2),
                        IdSucursal: ventas.IdSucursal,
                        Modo: producto.Modo
                    });
                }
            }
            if (detalles.Paquete && detalles.Paquete.length > 0) {
                for (const paquete of detalles.Paquete) {
                    await (0, DetalleVenta_controllers_1.updateDetalleventa)({
                        Iddetalle: paquete.IdDetalleVenta,
                        IdPromocion: '',
                        IdProducto: '',
                        Cantidad: paquete.Cantidad,
                        IdPaquete: paquete.id,
                        IdVenta: venta.IdVenta,
                        Precio: paquete.precioUnitario.toFixed(2),
                        IdSucursal: ventas.IdSucursal,
                        Modo: paquete.Modo
                    });
                }
            }
            if (detalles.Promocion && detalles.Promocion.length > 0) {
                for (const promocion of detalles.Promocion) {
                    await (0, DetalleVenta_controllers_1.updateDetalleventa)({
                        Iddetalle: promocion.IdDetalleVenta,
                        IdPromocion: promocion.id,
                        IdProducto: '',
                        Cantidad: promocion.Cantidad,
                        IdPaquete: '',
                        IdVenta: venta.IdVenta,
                        Precio: promocion.precioUnitario.toFixed(2),
                        IdSucursal: ventas.IdSucursal,
                        Modo: promocion.Modo
                    });
                }
            }
        }
        res.status(201).json({ message: "La venta se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }
};
exports.updateVenta = updateVenta;
const agregarClienteVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { ventas } = req.body;
        const venta = await Venta_1.Venta.findOne({
            where: { IdVenta: id },
            relations: ["Persona"]
        });
        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }
        if (ventas.Nombre && venta.Persona === null && !ventas.IdCliente) {
            ventas.IdCliente = await DataPersona(ventas);
            console.log(ventas.IdCliente);
        }
        if (ventas.IdCliente)
            venta.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: ventas.IdCliente });
        await venta.save();
        // Collect IDs of incoming details
        res.status(201).json({ message: "La venta se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof error_handler_1.HttpError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }
};
exports.agregarClienteVenta = agregarClienteVenta;
const anularVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdSucursal } = req.body;
        const venta = await Venta_1.Venta.findOne({
            where: { IdVenta: id },
            relations: [
                "Detalleventa", "Usuario"
            ]
        });
        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }
        console.log(venta.Detalleventa);
        for (const detalle of venta.Detalleventa) {
            const cantidad = detalle.Cantidad;
            const obtenerDetalle = await DetalleVenta_1.Detalleventa.findOne({
                where: { IdDetalleVenta: detalle.IdDetalleVenta },
                relations: [
                    "Producto",
                    "Paquete",
                    "Promocion",
                ]
            });
            if (!obtenerDetalle) {
                return res.status(404).json({ message: "Detalles de la venta no encontrada" });
            }
            if (obtenerDetalle.Producto) {
                await (0, SucursalProducto_controllers_1.IncrementProducto)({
                    SucursalId: IdSucursal,
                    ProductoId: obtenerDetalle.Producto.IdProducto,
                    Cantidad: cantidad
                });
            }
            else if (obtenerDetalle.Paquete) {
                await (0, SucursalProducto_controllers_1.IncrementPaquete)({
                    SucursalId: IdSucursal,
                    PaqueteId: obtenerDetalle.Paquete.IdPaquete,
                    Cantidad: cantidad
                });
            }
            else if (obtenerDetalle.Promocion) {
                await (0, SucursalProducto_controllers_1.IncrementPromocion)({
                    SucursalId: IdSucursal,
                    PromocionId: obtenerDetalle.Promocion.IdPromocion,
                    Cantidad: cantidad
                });
            }
        }
        venta.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 5 });
        await venta.save();
        res.status(200).json({ message: "Venta anulada correctamente y stock restaurado." });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
};
exports.anularVenta = anularVenta;
const getVentasTodasSucursal = async (req, res) => {
    try {
        //  const { fecha } = req.params;
        // console.log("Fecha recibida:", fecha);
        // const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
        // const inicioDia = new Date(`${fechaStr}T00:00:00`);
        // const finDia = new Date(`${fechaStr}T23:59:59.999`);
        let ventas = await Venta_1.Venta.find({
            //   where: { FechaVenta: Between(inicioDia, finDia) },
            relations: [
                "Pago",
                "Pago.Metodopago",
                "Persona",
                "Detalleventa",
                "Detalleventa.Producto",
                "Detalleventa.Paquete",
                "Detalleventa.Promocion",
                "Usuario",
                "Sucursal"
            ]
        });
        return res.json(ventas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getVentasTodasSucursal = getVentasTodasSucursal;
const getVentasSucursal = async (req, res) => {
    try {
        const { id, fecha, pago } = req.params;
        console.log("Fecha recibida:", fecha);
        const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
        const inicioDia = new Date(`${fechaStr}T00:00:00`);
        const finDia = new Date(`${fechaStr}T23:59:59.999`);
        let ventas = await Venta_1.Venta.find({
            where: {
                FechaVenta: (0, typeorm_1.Raw)(alias => `${alias} IS NOT NULL AND ${alias} BETWEEN :inicio AND :fin`, {
                    inicio: inicioDia,
                    fin: finDia
                })
            },
            relations: [
                "Estado",
                "Persona",
                "Detalleventa",
                "Detalleventa.Producto",
                "Detalleventa.Paquete",
                "Detalleventa.Promocion",
                "Usuario",
                "Sucursal",
                "Pago",
                "Pago.Metodopago"
            ]
        });
        const ventasFiltradas = ventas.filter(v => (id === "TODOS" || v.Sucursal?.IdSucursal === id || // sucursal específica
            (id === "TODOS" && v.Sucursal == null) // incluir null si es TODOS
        ) &&
            (Number(pago) == 0 || v.Pago?.some(p => p.Metodopago?.IdMetodoPago == Number(pago))));
        return res.json(ventasFiltradas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getVentasSucursal = getVentasSucursal;
const getVentasUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { Fecha } = req.body;
        const ventas = await Venta_1.Venta.find({
            where: {
                Usuario: { IdUsuario: id },
                FechaVenta: Fecha
            },
            relations: [
                "Estado",
                "Pago",
                "Persona",
                "Detalleventa",
                "Detalleventa.Producto",
                "Detalleventa.Paquete",
                "Detalleventa.Promocion"
            ]
        });
        return res.json(ventas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getVentasUsuario = getVentasUsuario;
const createVenta = async (ventasData, detallesData) => {
    try {
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('V');
        console.log(ventasData);
        const venta = new Venta_1.Venta();
        venta.IdVenta = nuevoId;
        if (ventasData.IdCliente)
            venta.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: ventasData.IdCliente });
        if (ventasData.IdUsuario)
            venta.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: ventasData.IdUsuario });
        if (ventasData.IdSucursal !== 'TODOS')
            venta.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: ventasData.IdSucursal });
        const fechaHoraActual = new Date();
        venta.FechaVenta = fechaHoraActual;
        venta.HoraVenta = fechaHoraActual.toTimeString().slice(0, 8);
        venta.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 4 });
        await venta.save();
        if (ventasData.pago.Monto !== 0 && (ventasData.pago.Cambio === 0 || ventasData.pago.Cambio !== 0))
            await (0, Pago_controllers_1.createPago)({ IdVenta: nuevoId, Monto: ventasData.pago.Monto, Cambio: ventasData.pago.Cambio, IdMetodoPago: ventasData.pago.IdMetodoPago });
        return venta;
    }
    catch (error) {
        throw error;
    }
};
exports.createVenta = createVenta;
const ActualizarVenta = async (ventasData, detallesData) => {
    try {
        // Buscar la venta
        console.log("actualizar precio " + ventasData);
        const venta = await Venta_1.Venta.findOne({
            where: { IdVenta: ventasData.IdVenta },
        });
        if (!venta)
            throw new error_handler_1.HttpError(404, "Venta no encontrada");
        // Actualizar cliente y tipo de venta
        if (ventasData.IdCliente) {
            venta.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: ventasData.IdCliente });
        }
        await venta.save();
        // Actualizar pago
        if (ventasData.pago.Monto !== 0 && (ventasData.pago.Cambio === 0 || ventasData.pago.Cambio !== 0))
            await (0, Pago_controllers_1.updatePago)({
                IdVenta: venta.IdVenta,
                IdPago: ventasData.pago.IdPago,
                Monto: ventasData.pago.Monto,
                Cambio: ventasData.pago.Cambio,
                IdMetodoPago: ventasData.pago.IdMetodoPago,
            });
        return venta;
    }
    catch (error) {
        throw error;
    }
};
exports.ActualizarVenta = ActualizarVenta;
