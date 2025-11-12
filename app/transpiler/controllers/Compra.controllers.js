"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompra = exports.getCompras = exports.anularCompra = exports.updateCompra = exports.registrarCompra = exports.verifyCompra = void 0;
const Raw_1 = require("typeorm/find-options/operator/Raw");
const Compra_1 = require("../entities/Compra");
const DetalleCompra_1 = require("../entities/DetalleCompra");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const Comprobante_controllers_1 = require("./Comprobante.controllers");
const Detallecompra_controllers_1 = require("./Detallecompra.controllers");
const Estado_controllers_1 = require("./Estado.controllers");
const Proveedor_controllers_1 = require("./Proveedor.controllers");
const verifyCompra = async ({ PaqueteId }) => {
    const existPaquete = await Compra_1.Compra.findOne({ where: { IdCompra: PaqueteId } });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `La compra con ID ${PaqueteId} no existe.`);
    }
    return existPaquete;
};
exports.verifyCompra = verifyCompra;
const registrarCompra = async (req, res) => {
    try {
        const { Compras, detalles } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('COM');
        const compra = new Compra_1.Compra();
        compra.IdCompra = nuevoId;
        if (Compras.IdProveedor)
            compra.Proveedor = await (0, Proveedor_controllers_1.verifyProveedor)({ TipoproveedorId: Compras.IdProveedor });
        compra.FechaCompra = new Date();
        compra.NroComprobante = Compras.Numero;
        compra.Comprobante = await (0, Comprobante_controllers_1.verifyComprobante)({ TipoId: Compras.Comprobante });
        compra.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        await compra.save();
        if (detalles && detalles.length > 0) {
            for (const producto of detalles) {
                await (0, Detallecompra_controllers_1.createDetalleCompra)({ IdCompra: nuevoId, Cantidad: producto.Cantidad, IdMedida: producto.IdMedida, Descripcion: producto.IdMedida, Precio: Number(producto.Precio), Fecha: producto.Fecha });
            }
        }
        res.status(201).json({ message: "La Compra se registro correctamente" });
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
exports.registrarCompra = registrarCompra;
const updateCompra = async (req, res) => {
    try {
        const { id } = req.params;
        const { Compras, detalles } = req.body;
        const compra = await Compra_1.Compra.findOne({
            where: { IdCompra: id }
        });
        if (!compra) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }
        if (Compras.IdProveedor)
            compra.Proveedor = await (0, Proveedor_controllers_1.verifyProveedor)({ TipoproveedorId: Compras.IdProveedor });
        compra.FechaCompra = new Date();
        compra.NroComprobante = Compras.Numero;
        compra.Comprobante = await (0, Comprobante_controllers_1.verifyComprobante)({ TipoId: Compras.Comprobante });
        await compra.save();
        // Fetch existing details for this Compra
        const existingDetalles = await DetalleCompra_1.Detallecompra.find({
            where: { Compra: { IdCompra: id } },
            relations: ["Productomedida"]
        });
        // Collect IDs of incoming details
        const incomingDetalleIds = new Set();
        if (detalles) {
            detalles.forEach((p) => {
                if (p.IdDetalleCompra)
                    incomingDetalleIds.add(p.IdDetalleCompra);
            });
        }
        // Identify and delete details that are no longer present in the incoming request
        for (const existingDetalle of existingDetalles) {
            if (!incomingDetalleIds.has(existingDetalle.IdDetalleCompra)) {
                await (0, Detallecompra_controllers_1.deleteDetalleCompraAndRestoreStock)({
                    Iddetalle: existingDetalle.IdDetalleCompra,
                });
            }
        }
        if (detalles && detalles.length > 0)
            for (const producto of detalles) {
                await (0, Detallecompra_controllers_1.updateDetalleCompra)({ IdDetalle: producto.IdDetalle, IdCompra: compra.IdCompra, Cantidad: producto.Cantidad, IdMedida: producto.IdMedida, Descripcion: producto.IdMedida, Precio: Number(producto.Precio), Fecha: producto.Fecha });
            }
        res.status(201).json({ message: "La Compra se actualizo correctamente" });
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
exports.updateCompra = updateCompra;
const anularCompra = async (req, res) => {
    try {
        const { id } = req.params;
        const compra = await Compra_1.Compra.findOne({
            where: { IdCompra: id }
        });
        if (!compra) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }
        compra.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 5 });
        await compra.save();
        // Fetch existing details for this Compra
        res.status(201).json({ message: "La Compra se anulo correctamente" });
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
exports.anularCompra = anularCompra;
const getCompras = async (req, res) => {
    try {
        const { fecha } = req.params;
        console.log("Fecha recibida:", fecha);
        const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
        const inicioDia = new Date(`${fechaStr}T00:00:00`);
        const finDia = new Date(`${fechaStr}T23:59:59.999`);
        const pagos = await Compra_1.Compra.find({
            where: {
                FechaCompra: (0, Raw_1.Raw)(alias => `${alias} IS NOT NULL AND ${alias} BETWEEN :inicio AND :fin`, {
                    inicio: inicioDia,
                    fin: finDia
                })
            },
            relations: [
                "Estado",
                "Proveedor",
                "Proveedor.Persona",
                "Comprobante",
                "Detallecompra",
                "Detallecompra.Productomedida",
                "Detallecompra.Productomedida.Unidadmedida",
                "Detallecompra.Productomedida.Unidadmedida.Categoria",
                "Detallecompra.Productomedida.Producto",
                "Detallecompra.Productomedida.Producto.Marca"
            ]
        });
        return res.json(pagos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCompras = getCompras;
const getCompra = async (req, res) => {
    try {
        const { id } = req.params;
        const pagos = await Compra_1.Compra.findOne({
            where: { IdCompra: id },
            relations: [
                "Proveedor",
                "Proveedor.Persona",
                "Comprobante",
                "Detallecompra",
                "Detallecompra.Productomedida"
            ]
        });
        return res.json(pagos);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getCompra = getCompra;
