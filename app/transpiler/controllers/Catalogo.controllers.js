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
exports.deleteCatalogo = exports.updateCatalogo = exports.getCatalogoById = exports.getCatalogos = exports.createCatalogo = void 0;
const Catalogo_1 = require("../entities/Catalogo");
const Producto_1 = require("../entities/Producto");
// Crear un nuevo Catálogo
const createCatalogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Producto_Id, NombreCatalogo, CantidadVenta, PrecioVenta, Fecha, Descripcion, Estado, } = req.body;
        // Verificar que el producto exista
        const producto = yield Producto_1.Producto.findOne({ where: { Id_Producto: Producto_Id } });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        // Crear un nuevo catálogo
        const catalogo = new Catalogo_1.Catalogo();
        catalogo.Producto_Id = Producto_Id;
        catalogo.NombreCatalogo = NombreCatalogo;
        catalogo.CantidadVenta = CantidadVenta;
        catalogo.PrecioVenta = PrecioVenta;
        catalogo.Fecha = Fecha;
        catalogo.Descripcion = Descripcion;
        catalogo.Estado = Estado;
        // Guardar en la base de datos
        yield catalogo.save();
        return res.status(201).json(catalogo);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.createCatalogo = createCatalogo;
// Obtener todos los Catálogos
const getCatalogos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const catalogos = yield Catalogo_1.Catalogo.find({ relations: ["producto"] }); // Incluye el producto relacionado
        return res.json(catalogos);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getCatalogos = getCatalogos;
// Obtener un Catálogo por su ID
const getCatalogoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const catalogo = yield Catalogo_1.Catalogo.findOne({
            where: { Id_Catalogo: parseInt(id) },
            relations: ["producto"], // Incluye el producto relacionado
        });
        if (!catalogo) {
            return res.status(404).json({ message: "Catálogo no encontrado" });
        }
        return res.json(catalogo);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.getCatalogoById = getCatalogoById;
// Actualizar un Catálogo
const updateCatalogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { NombreCatalogo, CantidadVenta, PrecioVenta, Fecha, Descripcion, Estado, } = req.body;
        const catalogo = yield Catalogo_1.Catalogo.findOne({ where: { Id_Catalogo: parseInt(id) } });
        if (!catalogo) {
            return res.status(404).json({ message: "Catálogo no encontrado" });
        }
        // Actualizar los datos del catálogo
        catalogo.NombreCatalogo = NombreCatalogo;
        catalogo.CantidadVenta = CantidadVenta;
        catalogo.PrecioVenta = PrecioVenta;
        catalogo.Fecha = Fecha;
        catalogo.Descripcion = Descripcion;
        catalogo.Estado = Estado;
        // Guardar los cambios
        yield catalogo.save();
        return res.status(200).json(catalogo);
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.updateCatalogo = updateCatalogo;
// Eliminar (desactivar) un Catálogo
const deleteCatalogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const catalogo = yield Catalogo_1.Catalogo.findOne({ where: { Id_Catalogo: parseInt(id) } });
        if (!catalogo) {
            return res.status(404).json({ message: "Catálogo no encontrado" });
        }
        // Marcar el catálogo como desactivado (Estado = 0)
        catalogo.Estado = 0;
        yield catalogo.save();
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
});
exports.deleteCatalogo = deleteCatalogo;
