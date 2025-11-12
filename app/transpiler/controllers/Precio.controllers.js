"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrecio = exports.createPrecio = exports.verifyPrecio = void 0;
const Precio_1 = require("../entities/Precio");
const error_handler_1 = require("../utils/error.handler");
const Estado_controllers_1 = require("./Estado.controllers");
const verifyPrecio = async ({ Precioid }) => {
    const existPrecio = await Precio_1.Precio.findOne({ where: { IdPrecio: Precioid } });
    if (!existPrecio) {
        throw new error_handler_1.HttpError(404, `El Precio con ID ${Precioid} no existe.`);
    }
    return existPrecio;
};
exports.verifyPrecio = verifyPrecio;
const createPrecio = async ({ IdProducto, Precios }) => {
    const existingPrecio = await Precio_1.Precio.findOne({
        where: {
            Estado: { IdEstado: 1 }, // Asumiendo que 1 es el estado "Activo"
        },
        relations: ["Proucto", "Estado"],
    });
    if (existingPrecio) {
        throw new error_handler_1.HttpError(409, `Ya existe un precio activo para el producto con ID ${IdProducto}.`);
    }
    const result = await Precio_1.Precio.createQueryBuilder("Precio")
        .select("MAX(CAST(SUBSTRING(Precio.IdPrecio, 5) AS INTEGER))", "ultimoNumero")
        .where("Precio.IdPrecio LIKE 'PPV-%'")
        .getRawOne();
    const nuevoNumero = (result?.ultimoNumero || 0) + 1;
    const nuevoId = `PPV-${nuevoNumero}`;
    const nuevoPrecio = new Precio_1.Precio();
    nuevoPrecio.IdPrecio = nuevoId;
    nuevoPrecio.Precio = Precios;
    nuevoPrecio.FechaRegistro = new Date();
    nuevoPrecio.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
    await nuevoPrecio.save();
    return nuevoPrecio;
};
exports.createPrecio = createPrecio;
const updatePrecio = async ({ PrecioId, IdProducto, Precios, }) => {
    if (PrecioId) {
        const existPrecio = await Precio_1.Precio.findOne({ where: { IdPrecio: PrecioId } });
        if (existPrecio) {
            existPrecio.Precio = Precios;
            await existPrecio.save();
            return existPrecio;
        }
    }
    return await (0, exports.createPrecio)({ IdProducto, Precios });
};
exports.updatePrecio = updatePrecio;
