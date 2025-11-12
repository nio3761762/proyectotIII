"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMarca = exports.getMarcas = void 0;
const Marca_1 = require("../entities/Marca");
const error_handler_1 = require("../utils/error.handler");
const getMarcas = async (req, res) => {
    try {
        const Marcas = await Marca_1.Marca.find({
        //   relations: ['Estado', 'Marca', 'Unidadmedida', 'TipoMarca', 'Subcategoria', 'Subcategoria.categoria']
        });
        return res.json(Marcas);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getMarcas = getMarcas;
const verifyMarca = async ({ Marcaid }) => {
    const existMarca = await Marca_1.Marca.findOne({ where: { IdMarca: Marcaid } });
    if (!existMarca) {
        throw new error_handler_1.HttpError(404, `El Marca con ID ${Marcaid} no existe.`);
    }
    return existMarca;
};
exports.verifyMarca = verifyMarca;
