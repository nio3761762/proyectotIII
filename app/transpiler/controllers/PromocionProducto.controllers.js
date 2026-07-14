"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPromocionProducto = exports.updatePromocionProducto = exports.createPromocionProducto = void 0;
const PromocionProducto_1 = require("../entities/PromocionProducto");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const ProductoMedida_controllers_1 = require("./ProductoMedida.controllers");
const createPromocionProducto = async (promocion, IdProducto, Cantidad, Descuento, Precio, IdEstado) => {
    if (IdEstado == 0) {
        return;
    }
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PP');
    const producto = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: IdProducto });
    const nuevoPromocionproducto = new PromocionProducto_1.Promocionproducto();
    nuevoPromocionproducto.IdPromocionProducto = nuevoId;
    if (Cantidad)
        nuevoPromocionproducto.Cantidad = Cantidad;
    if (Descuento >= 0)
        nuevoPromocionproducto.Descuento = Descuento;
    if (producto) {
        nuevoPromocionproducto.Productomedida = producto;
        nuevoPromocionproducto.Producto = producto.Producto;
    }
    if (promocion)
        nuevoPromocionproducto.Promocion = promocion;
    if (Precio >= 0)
        nuevoPromocionproducto.Precio = Precio;
    await nuevoPromocionproducto.save();
    return nuevoPromocionproducto;
};
exports.createPromocionProducto = createPromocionProducto;
const updatePromocionProducto = async (Idpp, IdProducto, promocion, Cantidad, Descuento, IdEstado, Precio) => {
    if (Idpp) {
        const nuevoPromocionproducto = await (0, exports.verifyPromocionProducto)({ PromocionId: Idpp });
        const producto = await (0, ProductoMedida_controllers_1.verifyProductoMedida)({ PaqueteId: IdProducto });
        nuevoPromocionproducto.Cantidad = Cantidad;
        nuevoPromocionproducto.Descuento = Descuento;
        if (producto) {
            nuevoPromocionproducto.Productomedida = producto;
            nuevoPromocionproducto.Producto = producto.Producto;
        }
        nuevoPromocionproducto.Estado = IdEstado;
        if (Precio >= 0)
            nuevoPromocionproducto.Precio = Precio;
        await nuevoPromocionproducto.save();
        return nuevoPromocionproducto;
    }
    else
        return (0, exports.createPromocionProducto)(promocion, IdProducto, Cantidad, Descuento, Precio, IdEstado);
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
