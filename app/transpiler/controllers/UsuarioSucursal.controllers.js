"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByUserId = exports.updateUsuarioSucursal = exports.deleteUsuarioSucursal = exports.getUsuarioSucursalesByUsuario = exports.getUsuarioSucursalesBySucursal = exports.getUsuarioSucursales = exports.Update = exports.Add = exports.createUsuarioSucursal = void 0;
const UsuarioSucursal_1 = require("../entities/UsuarioSucursal");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Usuario_1 = require("../entities/Usuario");
const Estado_controllers_1 = require("./Estado.controllers");
const ProductoSucursal_1 = require("../entities/ProductoSucursal");
const idGenerator_1 = require("../utils/idGenerator");
const Usuario_controllers_1 = require("./Usuario.controllers");
const createUsuarioSucursal = async (req, res) => {
    try {
        const { IdUsuarios, IdSucursal } = req.body; // IdUsuarios es array de objetos { id: number }
        if (!Array.isArray(IdUsuarios)) {
            return res.status(400).json({ message: "El campo IdUsuarios debe ser un array." });
        }
        const sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrada" });
        }
        // Obtener todos los usuarios asignados actualmente a ESTA sucursal
        const usuarioSucursales = await UsuarioSucursal_1.Usuariosucursal.find({
            where: { Sucursal: { IdSucursal: IdSucursal } },
            relations: ["Usuario", "Estado"],
        });
        if (IdUsuarios.length > 0) {
            const usuariosSeleccionados = new Set(IdUsuarios.map(u => u.id));
            for (const asignado of usuarioSucursales) {
                const usuarioId = asignado.Usuario.IdUsuario;
                if (usuariosSeleccionados.has(usuarioId)) {
                    if (asignado.Estado.IdEstado !== 1) {
                        await (0, exports.Update)({ id: asignado.IdUsuarioSucursal, EstadoId: 1 });
                    }
                    usuariosSeleccionados.delete(usuarioId);
                }
                else {
                    if (asignado.Estado.IdEstado !== 2) {
                        await (0, exports.Update)({ id: asignado.IdUsuarioSucursal, EstadoId: 2 });
                    }
                }
            }
            // Revisar los nuevos usuarios seleccionados que no están en esta sucursal
            for (const nuevoId of usuariosSeleccionados) {
                // 👇 Buscar si ya está activo en otra sucursal
                const asignacionActiva = await UsuarioSucursal_1.Usuariosucursal.findOne({
                    where: { Usuario: { IdUsuario: nuevoId }, Estado: { IdEstado: 1 } },
                    relations: ["Sucursal", "Estado", "Usuario"],
                });
                if (asignacionActiva && asignacionActiva.Sucursal.IdSucursal !== IdSucursal) {
                    // Desactivar la otra relación activa
                    await (0, exports.Update)({ id: asignacionActiva.IdUsuarioSucursal, EstadoId: 2 });
                }
                // Crear o reactivar la nueva relación en la sucursal actual
                await (0, exports.Add)({ IdSucursal, IdUsuario: nuevoId });
            }
        }
        else {
            // Si no se mandan usuarios → desactivar todos en esta sucursal
            if (usuarioSucursales.length > 0) {
                for (const asignado of usuarioSucursales) {
                    await (0, exports.Update)({ id: asignado.IdUsuarioSucursal, EstadoId: 2 });
                }
            }
        }
        return res.json({ message: "Usuarios asignados a la sucursal correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createUsuarioSucursal = createUsuarioSucursal;
const Add = async ({ IdSucursal, IdUsuario }) => {
    const nuevo = new UsuarioSucursal_1.Usuariosucursal();
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('SU');
    nuevo.IdUsuarioSucursal = nuevoId;
    nuevo.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
    nuevo.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: IdUsuario });
    nuevo.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
    nuevo.FechaAsignado = new Date();
    await nuevo.save();
    return nuevo;
};
exports.Add = Add;
const Update = async ({ id, EstadoId }) => {
    const usuarioSucursal = await UsuarioSucursal_1.Usuariosucursal.findOne({
        where: { IdUsuarioSucursal: id },
        relations: ['Estado']
    });
    if (!usuarioSucursal) {
        throw new Error("No la relacion solicitado");
    }
    usuarioSucursal.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: EstadoId });
    await usuarioSucursal.save();
    return usuarioSucursal;
};
exports.Update = Update;
const getUsuarioSucursales = async (req, res) => {
    try {
        const usuarioSucursales = await UsuarioSucursal_1.Usuariosucursal.find({ relations: ["Usuario", "Sucursal", "Estado"] });
        return res.json(usuarioSucursales);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUsuarioSucursales = getUsuarioSucursales;
const getUsuarioSucursalesBySucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioSucursales = await UsuarioSucursal_1.Usuariosucursal.find({
            where: { Sucursal: { IdSucursal: id } },
            relations: ["Usuario", "Sucursal", "Estado"]
        });
        return res.json(usuarioSucursales);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUsuarioSucursalesBySucursal = getUsuarioSucursalesBySucursal;
const getUsuarioSucursalesByUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioSucursales = await UsuarioSucursal_1.Usuariosucursal.find({
            where: { Usuario: { IdUsuario: id } },
            relations: ["Usuario", "Sucursal", "Estado"]
        });
        return res.json(usuarioSucursales);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUsuarioSucursalesByUsuario = getUsuarioSucursalesByUsuario;
const deleteUsuarioSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioSucursal = await UsuarioSucursal_1.Usuariosucursal.findOne({
            where: { IdUsuarioSucursal: id },
            relations: ['Estado']
        });
        if (!usuarioSucursal) {
            return res.status(404).json({ message: "Asignación no encontrada" });
        }
        const esActivo = usuarioSucursal.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'deshabilitada' : 'habilitada';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        usuarioSucursal.Estado = nuevoEstado;
        usuarioSucursal.FechaActualizacion = new Date();
        await usuarioSucursal.save();
        return res.json({ message: `Asignación ${mensajeAccion} correctamente` });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteUsuarioSucursal = deleteUsuarioSucursal;
const updateUsuarioSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdSucursal, IdUsuario, IdEstado } = req.body;
        const usuarioSucursal = await UsuarioSucursal_1.Usuariosucursal.findOne({ where: { IdUsuarioSucursal: id } });
        if (!usuarioSucursal) {
            return res.status(404).json({ message: "Asignación no encontrada" });
        }
        if (IdSucursal) {
            usuarioSucursal.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
        }
        if (IdUsuario) {
            const usuario = await Usuario_1.Usuario.findOne({ where: { IdUsuario: IdUsuario } });
            if (!usuario) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            usuarioSucursal.Usuario = usuario;
        }
        if (IdEstado) {
            usuarioSucursal.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: IdEstado });
        }
        usuarioSucursal.FechaActualizacion = new Date();
        await usuarioSucursal.save();
        return res.json({ message: "Asignación actualizada correctamente", usuarioSucursal });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateUsuarioSucursal = updateUsuarioSucursal;
const getProductsByUserId = async (req, res) => {
    try {
        const { id: userId } = req.params; // Obtener el ID de usuario de los parámetros
        // 1. Encontrar todas las asignaciones de sucursal para el usuario
        const usuarioSucursales = await UsuarioSucursal_1.Usuariosucursal.find({
            where: { Usuario: { IdUsuario: userId } },
            relations: ["Sucursal"], // Asegurarse de cargar la relación con Sucursal
        });
        if (!usuarioSucursales || usuarioSucursales.length === 0) {
            return res.status(404).json({ message: "No se encontraron sucursales asignadas a este usuario." });
        }
        const uniqueProductIds = new Set();
        const allProducts = [];
        // 2. Para cada sucursal, obtener sus productos
        for (const us of usuarioSucursales) {
            const sucursalId = us.Sucursal.IdSucursal;
            const productosSucursal = await ProductoSucursal_1.Productosucursal.find({
                where: {
                    Sucursal: { IdSucursal: sucursalId },
                },
                relations: ["Producto", "Producto.Subcategoria", "Producto.Subcategoria.Categoria", "Producto.Estado", "Producto.Marca", "Producto.Tipoproducto", "Producto.Imagen", "Producto.Comision", "Producto.Promocionproducto", "Producto.Ingrediente", "Producto.Productomedida", "Producto.Paquete"],
            });
            if (productosSucursal && productosSucursal.length > 0) {
                productosSucursal.forEach(ps => {
                    if (!uniqueProductIds.has(ps.Producto.IdProducto)) {
                        uniqueProductIds.add(ps.Producto.IdProducto);
                        allProducts.push(ps.Producto);
                    }
                });
            }
        }
        if (allProducts.length === 0) {
            return res.status(404).json({ message: "No se encontraron productos en las sucursales asignadas a este usuario." });
        }
        return res.json(allProducts);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
};
exports.getProductsByUserId = getProductsByUserId;
