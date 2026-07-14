"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyInsumoMedida = exports.createInsumoMedida = exports.updateInsumoMedida = exports.getInsumoInMedida = void 0;
const InsumoMedida_1 = require("../entities/InsumoMedida");
const idGenerator_1 = require("../utils/idGenerator");
const Insumo_controllers_1 = require("./Insumo.controllers");
const Medida_controllers_1 = require("./Medida.controllers");
const error_handler_1 = require("../utils/error.handler");
const db_1 = require("../db");
const getInsumoInMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        im.idinsumomedida,
        im.fecharegistro,
        im.cantidad AS cantidadmedida,

        um.idunidadmedida,
        um.nombre AS unidad_nombre,
        um.cantidad, 
        um.abreviatura,

        cat.idcategoriamedida,
        cat.nombre AS categoria_nombre

      FROM insumomedida im

      INNER JOIN unidadmedida um 
        ON im.idunidadmedida = um.idunidadmedida

      INNER JOIN categoriamedida cat 
        ON um.idcategoriamedida = cat.idcategoriamedida

      WHERE im.idinsumo = $1
    `, [id]);
        if (!result.length) {
            return res.status(404).json({ message: "No se encontraron medidas para este insumo." });
        }
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getInsumoInMedida = getInsumoInMedida;
const updateInsumoMedida = async (IdProductomedida, IdProducto, IdUnidadMedida, Cantidad, Estado) => {
    if (IdProductomedida) {
        const nuevoPaquete = await (0, exports.verifyInsumoMedida)({ PaqueteId: IdProductomedida });
        nuevoPaquete.Cantidad = Cantidad || 0;
        nuevoPaquete.Insumo = await (0, Insumo_controllers_1.verifyInsumo)({ ProductoId: IdProducto });
        nuevoPaquete.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: IdUnidadMedida });
        nuevoPaquete.FechaActualizacion = new Date();
        nuevoPaquete.Estado = Estado;
        await nuevoPaquete.save();
        return nuevoPaquete;
    }
    return (0, exports.createInsumoMedida)(IdProducto, IdUnidadMedida, Cantidad);
};
exports.updateInsumoMedida = updateInsumoMedida;
const createInsumoMedida = async (IdProducto, IdUnidadMedida, Cantidad) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('ISM');
    const nuevoPaquete = new InsumoMedida_1.Insumomedida();
    nuevoPaquete.IdinsumoMedida = nuevoId;
    nuevoPaquete.Cantidad = Cantidad || 0;
    nuevoPaquete.Insumo = await (0, Insumo_controllers_1.verifyInsumo)({ ProductoId: IdProducto });
    nuevoPaquete.Unidadmedida = await (0, Medida_controllers_1.verifyUnidadMedida)({ UnidadMedidaId: IdUnidadMedida });
    nuevoPaquete.FechaRegistro = new Date();
    await nuevoPaquete.save();
    return nuevoPaquete;
};
exports.createInsumoMedida = createInsumoMedida;
const verifyInsumoMedida = async ({ PaqueteId }) => {
    const existPaquete = await InsumoMedida_1.Insumomedida.findOne({
        where: { IdinsumoMedida: PaqueteId },
        relations: ["Insumo", "Unidadmedida"]
    });
    if (!existPaquete) {
        throw new error_handler_1.HttpError(404, `La medida con ID ${PaqueteId} no existe.`);
    }
    return existPaquete;
};
exports.verifyInsumoMedida = verifyInsumoMedida;
