"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPromocionProducto = exports.updatePromocionProducto = exports.createPromocionProducto = void 0;
const PromocionProducto_1 = require("../entities/PromocionProducto");
const Promocion_controllers_1 = require("./Promocion.controllers");
const Producto_controllers_1 = require("./Producto.controllers");
const error_handler_1 = require("../utils/error.handler");
const Estado_controllers_1 = require("./Estado.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const Presentacionproducto_controllers_1 = require("./Presentacionproducto.controllers");
const createPromocionProducto = async ({ IdPromocion, IdProducto, Cantidad, Descuento, IdEstado, IdPaquete }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PP');
    const nuevoPromocionproducto = new PromocionProducto_1.Promocionproducto();
    nuevoPromocionproducto.IdPromocionProducto = nuevoId;
    if (Cantidad)
        nuevoPromocionproducto.Cantidad = Cantidad;
    if (Descuento >= 0)
        nuevoPromocionproducto.Descuento = Descuento;
    if (IdProducto)
        nuevoPromocionproducto.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
    if (IdPromocion)
        nuevoPromocionproducto.Promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: IdPromocion });
    if (IdPaquete)
        nuevoPromocionproducto.Paquete = await (0, Presentacionproducto_controllers_1.verifyPaquete)({ PaqueteId: IdPaquete });
    nuevoPromocionproducto.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: IdEstado });
    await nuevoPromocionproducto.save();
    return nuevoPromocionproducto;
};
exports.createPromocionProducto = createPromocionProducto;
const updatePromocionProducto = async ({ Idpp, IdProducto, IdPromocion, Cantidad, Descuento, IdEstado, IdPaquete }) => {
    if (Idpp) {
        const nuevoPromocionproducto = await (0, exports.verifyPromocionProducto)({ PromocionId: Idpp });
        nuevoPromocionproducto.Cantidad = Cantidad;
        nuevoPromocionproducto.Descuento = Descuento;
        nuevoPromocionproducto.Promocion = await (0, Promocion_controllers_1.verifyPromocion)({ PromocionId: IdPromocion });
        nuevoPromocionproducto.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: IdEstado });
        if (IdProducto)
            nuevoPromocionproducto.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
        if (IdPaquete)
            nuevoPromocionproducto.Paquete = await (0, Presentacionproducto_controllers_1.verifyPaquete)({ PaqueteId: IdPaquete });
        await nuevoPromocionproducto.save();
        return nuevoPromocionproducto;
    }
    else
        return (0, exports.createPromocionProducto)({ IdProducto: IdProducto, Cantidad: Cantidad, Descuento: Descuento, IdPromocion: IdPromocion, IdEstado: IdEstado, IdPaquete: IdPaquete });
};
exports.updatePromocionProducto = updatePromocionProducto;
const verifyPromocionProducto = async ({ PromocionId }) => {
    const existPromocion = await PromocionProducto_1.Promocionproducto.findOne({ where: { IdPromocionProducto: PromocionId } });
    if (!existPromocion) {
        throw new error_handler_1.HttpError(404, `La promocion con ID ${PromocionId} no existe.`);
    }
    return existPromocion;
};
exports.verifyPromocionProducto = verifyPromocionProducto;
