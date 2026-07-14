"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObtenerFactura = exports.insertarEnlaceFactura = exports.createFactura = void 0;
const idGenerator_1 = require("../utils/idGenerator");
const Factura_1 = require("../entities/Factura");
const Venta_controllers_1 = require("./Venta.controllers");
const Enlace_controllers_1 = require("./Enlace.controllers");
const Venta_1 = require("../entities/Venta");
const db_1 = require("../db");
const Fecha_1 = require("../utils/Fecha");
const createFactura = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { factura } = req.body;
        const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
        // Contar facturas del día
        const facturasHoy = await queryRunner.manager.count(Factura_1.Factura, {
            where: {
                FechaEmicion: fecha
            }
        });
        // Generar número secuencial
        const numeroSecuencial = (facturasHoy + 1)
            .toString()
            .padStart(6, "0");
        // YYYYMMDD-0001
        const fechaCompacta = fecha
            .toISOString()
            .split("T")[0]
            .replace(/-/g, "");
        const nroFactura = `${fechaCompacta}-${numeroSecuencial}`;
        // Verificar venta
        const venta = await (0, Venta_controllers_1.verifyVenta)(factura.IdVenta);
        // Crear factura
        const nuevaFactura = queryRunner.manager.create(Factura_1.Factura, {
            IdFactura: await (0, idGenerator_1.generarIdSecuencial)("F#"),
            Venta: venta,
            FechaEmicion: fecha,
            HoraEmicion: hora,
            NitCiFacturacion: factura.documento,
            NombreFacturacion: factura.Cliente,
            Aprobado: "Si",
            NroFactura: nroFactura
        });
        await queryRunner.manager.save(nuevaFactura);
        await queryRunner.commitTransaction();
        return res.status(201).json({
            message: "La factura se registró exitosamente",
            factura: {
                ...nuevaFactura,
                FechaEmicion: nuevaFactura.FechaEmicion
                    ? new Date(nuevaFactura.FechaEmicion)
                        .toISOString()
                        .split("T")[0]
                    : null
            }
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error al crear factura:", error);
        return res.status(500).json({
            message: error.message
        });
    }
    finally {
        await queryRunner.release();
    }
};
exports.createFactura = createFactura;
const insertarEnlaceFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const { factura } = req.body;
        const facturasHoy = await Factura_1.Factura.findOne({
            where: {
                IdFactura: factura.IdFactura
            }
        });
        if (!facturasHoy)
            return res.status(404).json({ message: "Factura no encontrada" });
        facturasHoy.Enlace = await (0, Enlace_controllers_1.createEnlace)({ archivo: factura.archivo });
        await facturasHoy.save();
        return res.json({ message: "Se asigno el enlace exitosamente", facturasHoy });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear factura:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.insertarEnlaceFactura = insertarEnlaceFactura;
const ObtenerFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const facturasHoy = await Venta_1.Venta.findOne({
            where: { IdVenta: id },
            relations: ['Persona', 'Factura.Enlace']
        });
        if (!facturasHoy)
            return res.json(null);
        return res.json(facturasHoy);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear factura:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.ObtenerFactura = ObtenerFactura;
