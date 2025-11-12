"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTipoProducto = void 0;
const error_handler_1 = require("../utils/error.handler");
const TipoProducto_1 = require("../entities/TipoProducto");
const verifyTipoProducto = async ({ TipoId }) => {
    const existTipoProducto = await TipoProducto_1.Tipoproducto.findOne({ where: { IdTipoProducto: TipoId } });
    if (!existTipoProducto) {
        throw new error_handler_1.HttpError(404, `El rango con ID ${TipoId} no existe.`);
    }
    return existTipoProducto;
};
exports.verifyTipoProducto = verifyTipoProducto;
