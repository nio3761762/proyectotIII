"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProveedorProducto = exports.updateProveedorProducto = exports.getProveedorProductoByIds = exports.getProveedorProductos = exports.createProveedorProducto = void 0;
const ProveedorProducto_1 = require("../entities/ProveedorProducto"); // Importar la entidad ProveedorProducto
const Proveedor_1 = require("../entities/Proveedor"); // Importar la entidad Proveedor
const Producto_1 = require("../entities/Producto"); // Importar la entidad Producto
// Crear una relación entre un Proveedor y un Producto
const createProveedorProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Proveedor_Id, Producto_Id, Fecha } = req.body;
        // Verificar que el proveedor y el producto existen
        const proveedor = yield Proveedor_1.Proveedor.findOne({ where: { Id_Proveedor: Proveedor_Id } });
        const producto = yield Producto_1.Producto.findOne({ where: { Id_Producto: Producto_Id } });
        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        // Crear una nueva relación entre el proveedor y el producto
        const proveedorProducto = new ProveedorProducto_1.ProveedorProducto();
        proveedorProducto.Proveedor_Id = Proveedor_Id;
        proveedorProducto.Producto_Id = Producto_Id;
        proveedorProducto.Fecha = Fecha;
        // Guardar la relación en la base de datos
        yield proveedorProducto.save();
        return res.status(201).json(proveedorProducto);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.createProveedorProducto = createProveedorProducto;
// Obtener todas las relaciones de ProveedorProducto
const getProveedorProductos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proveedorProductos = yield ProveedorProducto_1.ProveedorProducto.find({
            relations: ["proveedor", "producto"] // Obtener los proveedores y productos relacionados
        });
        return res.json(proveedorProductos);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getProveedorProductos = getProveedorProductos;
// Obtener una relación de ProveedorProducto por sus IDs
const getProveedorProductoByIds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Proveedor_Id, Producto_Id } = req.params;
        const proveedorProducto = yield ProveedorProducto_1.ProveedorProducto.findOne({
            where: {
                Proveedor_Id: parseInt(Proveedor_Id),
                Producto_Id: parseInt(Producto_Id),
            },
            relations: ["proveedor", "producto"] // Obtener las relaciones de proveedor y producto
        });
        if (!proveedorProducto) {
            return res.status(404).json({ message: "Relación no encontrada" });
        }
        return res.json(proveedorProducto);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getProveedorProductoByIds = getProveedorProductoByIds;
// Actualizar una relación entre Proveedor y Producto
const updateProveedorProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Proveedor_Id, Producto_Id } = req.params;
        const { Fecha } = req.body;
        const proveedorProducto = yield ProveedorProducto_1.ProveedorProducto.findOne({
            where: {
                Proveedor_Id: parseInt(Proveedor_Id),
                Producto_Id: parseInt(Producto_Id),
            },
        });
        if (!proveedorProducto) {
            return res.status(404).json({ message: "Relación no encontrada" });
        }
        proveedorProducto.Fecha = Fecha;
        yield proveedorProducto.save();
        return res.status(200).json(proveedorProducto);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.updateProveedorProducto = updateProveedorProducto;
// Eliminar una relación entre Proveedor y Producto
const deleteProveedorProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Proveedor_Id, Producto_Id } = req.params;
        const proveedorProducto = yield ProveedorProducto_1.ProveedorProducto.findOne({
            where: {
                Proveedor_Id: parseInt(Proveedor_Id),
                Producto_Id: parseInt(Producto_Id),
            },
        });
        if (!proveedorProducto) {
            return res.status(404).json({ message: "Relación no encontrada" });
        }
        yield ProveedorProducto_1.ProveedorProducto.remove(proveedorProducto);
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.deleteProveedorProducto = deleteProveedorProducto;
