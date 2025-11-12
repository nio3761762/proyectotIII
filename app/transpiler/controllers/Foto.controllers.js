"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyImagen = exports.updateImagen = exports.createImagen = void 0;
const Imagen_1 = require("../entities/Imagen");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const createImagen = async ({ Foto }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('IMG');
    const imagen = new Imagen_1.Imagen();
    imagen.IdImagen = nuevoId;
    if (Foto)
        imagen.Url = Foto;
    await imagen.save();
    return imagen;
};
exports.createImagen = createImagen;
const updateImagen = async ({ ImagenId, Foto }) => {
    const existImagen = await (0, exports.verifyImagen)({ ImagenId: ImagenId });
    if (Foto)
        existImagen.Url = Foto;
    await existImagen.save();
    return existImagen;
};
exports.updateImagen = updateImagen;
const verifyImagen = async ({ ImagenId }) => {
    const existImagen = await Imagen_1.Imagen.findOne({ where: { IdImagen: ImagenId } });
    if (!existImagen) {
        throw new error_handler_1.HttpError(404, `La Imagen con ID ${ImagenId} no existe.`);
    }
    return existImagen;
};
exports.verifyImagen = verifyImagen;
