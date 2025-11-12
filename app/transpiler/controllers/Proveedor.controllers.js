"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProveedor = exports.getProveedor = exports.deleteProveedor = exports.updateProveedor = exports.getProveedores = exports.createProveedor = void 0;
const Proveedor_1 = require("../entities/Proveedor");
const Estado_controllers_1 = require("./Estado.controllers");
const Persona_controllers_1 = require("./Persona.controllers");
const idGenerator_1 = require("../utils/idGenerator"); // Importar la función
const Celular_controllers_1 = require("./Celular.controllers");
const Documento_controllers_1 = require("./Documento.controllers");
const Celular_1 = require("../entities/Celular");
const TipoProveedor_controllers_1 = require("./TipoProveedor.controllers");
const error_handler_1 = require("../utils/error.handler");
const createProveedor = async (req, res) => {
    try {
        const { Persona } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PROV'); // Generar el ID secuencial
        console.log(Persona);
        const proveedor = new Proveedor_1.Proveedor();
        proveedor.IdProveedor = nuevoId;
        proveedor.Persona = await (0, Persona_controllers_1.createPersona)({
            Nombre: Persona.Nombre,
            ApellidoPaterno: Persona.ApellidoPaterno,
            ApellidoMaterno: Persona.ApellidoMaterno,
            FechaDeNacimiento: Persona.FechaDeNacimiento,
            IdGenero: Persona.IdGenero,
            email: Persona.Email,
            // Salario, 
            BarrioId: Persona.IdBarrio,
            Direccion: Persona.Direccion,
            Referencia: Persona.Referencia,
            Url: Persona.Url,
        });
        proveedor.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        if (Persona.RazonSocial)
            proveedor.RazonSocial = Persona.RazonSocial;
        proveedor.Tipoproveedor = await (0, TipoProveedor_controllers_1.verifyTipoproveedor)({ TipoproveedorId: Persona.IdTipoProveedor });
        await proveedor.save();
        const persona = await Proveedor_1.Proveedor.findOne({
            where: { IdProveedor: nuevoId },
            relations: ['Persona'],
        });
        if (!persona) {
            return res.status(404).json('Usuario no encontrado');
        }
        if (Persona.Celulares.length > 0)
            for (const celules of Persona.Celulares)
                await (0, Celular_controllers_1.createCelular)({ Numero: celules.Numero, PersonaId: persona.Persona.IdPersona });
        if (Persona.Documento.length > 0)
            for (const documento of Persona.Documento)
                await (0, Documento_controllers_1.createDocumento)({ IdTipoDocumento: documento.IdTipodocumento, IdComplemento: documento.Complemento, Documentos: documento.Documento, PersonaId: persona.Persona.IdPersona });
        return res.json({ message: "El Proveedor se registro correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear Proveedor:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createProveedor = createProveedor;
const getProveedores = async (req, res) => {
    try {
        const Proveedors = await Proveedor_1.Proveedor.find({ relations: ["Estado", "Persona", "Tipoproveedor",
                "Persona.Email", "Persona.Estado", "Persona.Genero",
                "Persona.Imagen", "Persona.Celulares", "Persona.Documento",
                "Persona.Documento.Tipodocumento", "Persona.Documento.Complemento",
                "Persona.Direccion.Barrio",
            ] });
        return res.json(Proveedors);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProveedores = getProveedores;
const updateProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const { Persona } = req.body;
        const proveedor = await Proveedor_1.Proveedor.findOne({
            where: { IdProveedor: id },
            relations: ['Persona'],
        });
        if (!proveedor)
            return res.status(404).json({ message: 'Proveedor no existe' });
        proveedor.Persona = await (0, Persona_controllers_1.updatePersona)({
            IdPersona: proveedor.Persona.IdPersona,
            Nombre: Persona.Nombre,
            ApellidoPaterno: Persona.ApellidoPaterno,
            ApellidoMaterno: Persona.ApellidoMaterno,
            FechaDeNacimiento: Persona.FechaDeNacimiento,
            IdGenero: Persona.IdGenero,
            IdEmail: Persona.IdEmail,
            email: Persona.Email,
            // Salario, 
            IdDireccion: Persona.IdDireccion,
            BarrioId: Persona.IdBarrio,
            Direccion: Persona.Direccion,
            Referencia: Persona.Referencia,
            IdImagen: Persona.IdImagen,
            Url: Persona.Url,
        });
        if (Persona.RazonSocial)
            proveedor.RazonSocial = Persona.RazonSocial;
        proveedor.Tipoproveedor = await (0, TipoProveedor_controllers_1.verifyTipoproveedor)({ TipoproveedorId: Persona.IdTipoProveedor });
        await proveedor.save();
        if (Persona.Celulares && Persona.Celulares.length > 0) {
            const celularesActuales = await Celular_1.Celular.find({
                where: { Persona: { IdPersona: proveedor.Persona.IdPersona } }
            });
            const idsEnviados = Persona.Celulares
                .filter((c) => c.IdCelular) // solo los que tienen ID
                .map((c) => c.IdCelular);
            for (const celularExistente of celularesActuales) {
                if (!idsEnviados.includes(celularExistente.IdCelular)) {
                    await celularExistente.remove(); // o .destroy() si usas Sequelize
                }
            }
            for (const celules of Persona.Celulares) {
                await (0, Celular_controllers_1.updateCelular)({
                    CelularId: celules.IdCelular,
                    Numero: celules.Numero,
                    PersonaId: proveedor.Persona.IdPersona
                });
            }
        }
        if (Persona.Documento.length > 0)
            for (const documento of Persona.Documento)
                await (0, Documento_controllers_1.updateDocumento)({ DocumentoId: documento.IdDocumento, IdTipoDocumento: documento.IdTipodocumento, IdComplemento: documento.Complemento, Documentos: documento.Documento, PersonaId: proveedor.Persona.IdPersona });
        return res.json({ message: "El Proveedor se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateProveedor = updateProveedor;
const deleteProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const proveedor = await Proveedor_1.Proveedor.findOne({
            where: { IdProveedor: id },
            relations: ['Estado']
        });
        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        const esActivo = proveedor.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        proveedor.Estado = nuevoEstado;
        await proveedor.save();
        return res.json({ message: `Se ${mensajeAccion} los datos del Proveedor correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Proveedor:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteProveedor = deleteProveedor;
//buscar Proveedor por id
const getProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const proveedor = await Proveedor_1.Proveedor.findOne({ where: { IdProveedor: id },
            relations: ["Estado", "Persona", "Tipoproveedor",
                "Persona.Email", "Persona.Estado", "Persona.Genero",
                "Persona.Imagen", "Persona.Celulares", "Persona.Documento",
                "Persona.Documento.Tipodocumento", "Persona.Documento.Complemento",
                "Persona.Direccion.Barrio"], });
        if (proveedor) {
            return res.status(404).json('Proveedor not found');
        }
        return res.json({
            //...
            proveedor
            // CorreoElectronico: decryptedEmail
        });
        //return res.json(Proveedor);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProveedor = getProveedor;
const verifyProveedor = async ({ TipoproveedorId }) => {
    const existTipoproveedor = await Proveedor_1.Proveedor.findOne({ where: { IdProveedor: TipoproveedorId } });
    if (!existTipoproveedor) {
        throw new error_handler_1.HttpError(404, `El Proveedor con ID ${TipoproveedorId} no existe.`);
    }
    return existTipoproveedor;
};
exports.verifyProveedor = verifyProveedor;
