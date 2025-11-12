"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTipoproveedor = exports.getTipoproveedor = void 0;
const TipoProveedor_1 = require("../entities/TipoProveedor");
const error_handler_1 = require("../utils/error.handler");
const getTipoproveedor = async (req, res) => {
    try {
        const tipoproveedor = await TipoProveedor_1.Tipoproveedor.find();
        return res.json(tipoproveedor);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getTipoproveedor = getTipoproveedor;
const verifyTipoproveedor = async ({ TipoproveedorId }) => {
    const existTipoproveedor = await TipoProveedor_1.Tipoproveedor.findOne({ where: { IdTipoProveedor: TipoproveedorId } });
    if (!existTipoproveedor) {
        throw new error_handler_1.HttpError(404, `El Tipoproveedor con ID ${TipoproveedorId} no existe.`);
    }
    return existTipoproveedor;
};
exports.verifyTipoproveedor = verifyTipoproveedor;
