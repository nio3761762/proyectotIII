"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySucursal = exports.deleteSucursal = exports.updateSucursal = exports.getSucursalById = exports.getSucursales = exports.createSucursal = void 0;
const Sucursal_1 = require("../entities/Sucursal");
const Direccion_controllers_1 = require("./Direccion.controllers");
const Estado_controllers_1 = require("./Estado.controllers");
const AdmDatos_controllers_1 = require("./AdmDatos.controllers");
const Horario_controllers_1 = require("./Horario.controllers");
const error_handler_1 = require("../utils/error.handler");
const Producto_1 = require("../entities/Producto");
const SucursalProducto_controllers_1 = require("./SucursalProducto.controllers");
const idGenerator_1 = require("../utils/idGenerator");
// Crear una nueva sucursal
const createSucursal = async (req, res) => {
    try {
        const { RegistrarSucurcal } = req.body;
        const existingSucursal = await Sucursal_1.Sucursal.findOne({ where: { Nombre: RegistrarSucurcal.Nombre } });
        if (existingSucursal) {
            return res.status(400).json({ message: "La sucursal ya existe" });
        }
        const sucursal = new Sucursal_1.Sucursal();
        sucursal.IdSucursal = await (0, idGenerator_1.generarIdSecuencial)('SUC');
        ;
        sucursal.Nombre = RegistrarSucurcal.Nombre;
        sucursal.Direccion = await (0, Direccion_controllers_1.createDireccion)({ BarrioId: RegistrarSucurcal.IdBarrio, Direccions: RegistrarSucurcal.Direccion, Referencia: RegistrarSucurcal.Referencia, Ubicacion: RegistrarSucurcal.Ubicacion });
        if (RegistrarSucurcal.Nro)
            sucursal.Nro = RegistrarSucurcal.Nro;
        sucursal.FechaRegistro = new Date();
        sucursal.Datos = await (0, AdmDatos_controllers_1.verifyDatos)({ DatoId: 1 });
        ;
        sucursal.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        sucursal.Horario = await (0, Horario_controllers_1.createHorario)({ HoraEntrada: RegistrarSucurcal.Entrada, HoraSalida: RegistrarSucurcal.Salida });
        if (RegistrarSucurcal.Celular)
            sucursal.Celular = RegistrarSucurcal.Celular;
        if (RegistrarSucurcal.Central)
            sucursal.Central = Number(RegistrarSucurcal.Central);
        await sucursal.save();
        const productos = await Producto_1.Producto.find({
            where: { Tipoproducto: { IdTipoProducto: 'ITP-2' } },
        });
        for (const prodducto of productos) {
            await (0, SucursalProducto_controllers_1.createSucursalProducto)({ SucursalId: sucursal.IdSucursal, ProductoId: prodducto.IdProducto, stockminimo: 5 });
        }
        return res.status(201).json({ message: "La sucursal se registro correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createSucursal = createSucursal;
// Obtener todas las sucursales
const getSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal_1.Sucursal.find({
            relations: ["Direccion", "Direccion.Barrio",
                "Direccion.Barrio.Distrito",
                "Direccion.Barrio.Distrito.Ciudad",
                "Direccion.Barrio.Distrito.Ciudad.Departamento",
                "Estado",
                "Datos",
                "Horario"],
        });
        ;
        return res.json(sucursales);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getSucursales = getSucursales;
// Obtener sucursal por ID
const getSucursalById = async (req, res) => {
    try {
        const { id } = req.params;
        const sucursal = await Sucursal_1.Sucursal.find({
            where: { IdSucursal: id,
            },
            relations: ["Usuariosucursal", "Usuariosucursal.Usuario", "Usuariosucursal.Estado"]
        });
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrada" });
        }
        return res.json(sucursal);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getSucursalById = getSucursalById;
// Actualizar sucursal
const updateSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistrarSucurcal } = req.body;
        const sucursal = await Sucursal_1.Sucursal.findOne({
            where: { IdSucursal: id },
            relations: ['Estado']
        });
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrado" });
        }
        sucursal.Nombre = RegistrarSucurcal.Nombre;
        sucursal.Direccion = await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: RegistrarSucurcal.IdDireccion, BarrioId: RegistrarSucurcal.IdBarrio, Direccions: RegistrarSucurcal.Direccion, Referencia: RegistrarSucurcal.Referencia, Ubicacion: '' });
        if (RegistrarSucurcal.Nro)
            sucursal.Nro = RegistrarSucurcal.Nro;
        sucursal.FechaActualizacion = new Date();
        sucursal.Horario = await (0, Horario_controllers_1.updateHorario)({ HorarioId: RegistrarSucurcal.IdHorario, HoraEntrada: RegistrarSucurcal.Entrada, HoraSalida: RegistrarSucurcal.Salida });
        if (RegistrarSucurcal.Celular)
            sucursal.Celular = RegistrarSucurcal.Celular;
        if (RegistrarSucurcal.Central)
            sucursal.Central = RegistrarSucurcal.Central;
        await sucursal.save();
        return res.status(201).json({ message: "La sucursal se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateSucursal = updateSucursal;
// Eliminar (desactivar o activar) sucursal
const deleteSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const sucursal = await Sucursal_1.Sucursal.findOne({
            where: { IdSucursal: id },
            relations: ['Estado']
        });
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrado" });
        }
        const esActivo = sucursal.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        sucursal.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        ;
        await sucursal.save();
        return res.json({ message: `Se ${mensajeAccion} los datos del Sucursal correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Sucursal:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteSucursal = deleteSucursal;
const verifySucursal = async ({ SucursalId }) => {
    const existingSucursal = await Sucursal_1.Sucursal.findOne({ where: { IdSucursal: SucursalId } });
    if (!existingSucursal) {
        throw new error_handler_1.HttpError(404, `La sucursal con ID ${SucursalId} no existe.`);
    }
    return existingSucursal;
};
exports.verifySucursal = verifySucursal;
