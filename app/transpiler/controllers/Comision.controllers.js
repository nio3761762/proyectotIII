"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComision = exports.deleteComision = exports.updateComision = exports.createComision = void 0;
const Comision_1 = require("../entities/Comision");
const Producto_controllers_1 = require("./Producto.controllers");
const Estado_controllers_1 = require("./Estado.controllers");
const ProductoMedida_1 = require("../entities/ProductoMedida");
const createComision = async (req, res) => {
    try {
        const { Registrar } = req.body;
        const ultimaComision = await Comision_1.Comision.findOne({
            where: {},
            order: { IdComision: "DESC" },
        });
        const nuevoId = ultimaComision ? ultimaComision.IdComision + 1 : 1;
        const nuevaPromocion = new Comision_1.Comision();
        nuevaPromocion.IdComision = nuevoId;
        nuevaPromocion.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: Registrar.IdProducto });
        const precio = await ProductoMedida_1.Productomedida.findOne({
            where: { Producto: { IdProducto: Registrar.IdProducto } }
        });
        if (!precio) {
            return res.status(404).json({ message: "Producto no encontrada" });
        }
        nuevaPromocion.Cantidad = Registrar.Cantidad;
        nuevaPromocion.Porcentaje = Registrar.Porcentaje;
        // nuevaPromocion.Porcentaje = (Registrar.Cantidad*precio?.PrecioVenta)*(Registrar.Porcentaje/100);
        nuevaPromocion.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        await nuevaPromocion.save();
        return res.status(201).json({ message: "La comision se registró correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createComision = createComision;
const updateComision = async (req, res) => {
    try {
        const { Registrar } = req.body;
        const { id } = req.params;
        const nuevaPromocion = await Comision_1.Comision.findOne({
            where: { IdComision: Number(id) },
        });
        if (!nuevaPromocion) {
            return res.status(404).json({ message: "Comision no encontrada" });
        }
        nuevaPromocion.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: Registrar.IdProducto });
        nuevaPromocion.Cantidad = await Registrar.Cantidad;
        nuevaPromocion.Porcentaje = await Registrar.Porcentaje;
        await nuevaPromocion.save();
        return res.status(201).json({ message: "Se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateComision = updateComision;
const deleteComision = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Comision_1.Comision.findOne({
            where: { IdComision: Number(id) },
            relations: ['Estado']
        });
        if (!usuario) {
            return res.status(404).json({ message: "Comision no encontrada" });
        }
        const esActivo = usuario.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        usuario.Estado = nuevoEstado;
        await usuario.save();
        return res.json({ message: `Se ${mensajeAccion} los datos de la comison correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del usuario:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteComision = deleteComision;
const getComision = async (req, res) => {
    try {
        const comision = await Comision_1.Comision.find({ relations: [
                "Estado", "Producto"
            ] });
        const result = comision.map(ps => {
            return {
                IdComision: ps.IdComision,
                Cantidad: ps.Cantidad,
                Porcentaje: ps.Porcentaje,
                IdProducto: ps.Producto.IdProducto ?? null,
                Nombre: ps.Producto.Nombre,
                Estado: ps.Estado?.IdEstado ?? null,
            };
        }) || [];
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getComision = getComision;
