"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRepartidor = exports.deleteRepartidor = exports.updateRepartidor = exports.getRepartidor = exports.getRepartidorActivos = exports.getRepartidores = exports.createRepartidor = void 0;
const Repartidor_1 = require("../entities/Repartidor");
const Persona_controllers_1 = require("./Persona.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const Estado_controllers_1 = require("./Estado.controllers");
const Celular_1 = require("../entities/Celular");
const Celular_controllers_1 = require("./Celular.controllers");
const Documento_controllers_1 = require("./Documento.controllers");
const EmpresaReparto_controllers_1 = require("./EmpresaReparto.controllers");
const TipoLicencia_controllers_1 = require("./TipoLicencia.controllers"); // Add this import
const error_handler_1 = require("../utils/error.handler");
const createRepartidor = async (req, res) => {
    try {
        const { PersonaData } = req.body; // Add IdTipoLicencia and NumeroLicencia
        const persona = await (0, Persona_controllers_1.createPersona)({
            Nombre: PersonaData.Nombre,
            ApellidoPaterno: PersonaData.ApellidoPaterno,
            ApellidoMaterno: PersonaData.ApellidoMaterno,
            FechaDeNacimiento: PersonaData.FechaDeNacimiento,
            IdGenero: PersonaData.IdGenero,
            email: PersonaData.Email,
            BarrioId: PersonaData.IdBarrio,
            Direccion: PersonaData.Direccion,
            Referencia: PersonaData.Referencia,
            Url: PersonaData.Url,
        });
        const repartidor = new Repartidor_1.Repartidor();
        // Usar el IdPersona de la Persona creada
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('REP');
        repartidor.IdRepartidor = nuevoId;
        repartidor.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 }); // Set default state to 1 (activo)
        repartidor.TipoVehiculo = PersonaData.TipoVehiculo;
        repartidor.PlacaVehiculo = PersonaData.PlacaVehiculo;
        repartidor.Persona = persona; // Asignar la instancia de Persona
        repartidor.EmpresaReparto = await (0, EmpresaReparto_controllers_1.verifyEmpresaReparto)({ EmpresaRepartoId: PersonaData.IdEmpresaReparto }); // Assign EmpresaReparto
        repartidor.TipoLicencia = await (0, TipoLicencia_controllers_1.verifyTipoLicencia)({ TipoLicenciaId: PersonaData.IdTipoLicencia }); // Assign TipoLicencia
        repartidor.NumeroLicencia = PersonaData.NumeroLicencia;
        await repartidor.save();
        if (PersonaData.Celulares && PersonaData.Celulares.length > 0) {
            for (const celular of PersonaData.Celulares) {
                await (0, Celular_controllers_1.createCelular)({ Numero: celular.Numero, PersonaId: persona.IdPersona });
            }
        }
        if (PersonaData.Documento && PersonaData.Documento.length > 0) {
            for (const documento of PersonaData.Documento) {
                await (0, Documento_controllers_1.createDocumento)({
                    IdTipoDocumento: documento.Tipodocumento,
                    IdComplemento: documento.Complemento,
                    Documentos: documento.Documento,
                    PersonaId: persona.IdPersona
                });
            }
        }
        return res.status(201).json({ message: "Repartidor registrado correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear repartidor:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createRepartidor = createRepartidor;
const getRepartidores = async (req, res) => {
    try {
        const repartidores = await Repartidor_1.Repartidor.find({
            relations: [
                "Persona",
                "Persona.Email",
                "Persona.Genero",
                "Persona.Imagen",
                "Persona.Celulares",
                "Persona.Documento",
                "Persona.Documento.Tipodocumento",
                "Persona.Documento.Complemento",
                "Estado", // Add Estado relation
                "EmpresaReparto", // Add EmpresaReparto relation
                "TipoLicencia", // Add TipoLicencia relation
            ]
        });
        return res.json(repartidores);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getRepartidores = getRepartidores;
const getRepartidorActivos = async (req, res) => {
    try {
        const repartidores = await Repartidor_1.Repartidor.find({
            where: { Estado: { IdEstado: 1 } },
            relations: [
                "Persona",
                "Persona.Email",
                "Persona.Imagen",
                "Persona.Celulares",
                "Estado", // Add Estado relation
                "EmpresaReparto", // Add EmpresaReparto relation
            ]
        });
        return res.json(repartidores);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getRepartidorActivos = getRepartidorActivos;
const getRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const repartidor = await Repartidor_1.Repartidor.findOne({
            where: { IdRepartidor: id },
            relations: [
                "Persona",
                "Persona.Email",
                "Persona.Genero",
                "Persona.Imagen",
                "Persona.Celulares",
                "Persona.Documento",
                "Persona.Documento.Tipodocumento",
                "Persona.Documento.Complemento",
                "Estado", // Add Estado relation
                "EmpresaReparto", // Add EmpresaReparto relation
                "TipoLicencia", // Add TipoLicencia relation
            ]
        });
        if (!repartidor) {
            return res.status(404).json({ message: "Repartidor no encontrado" });
        }
        return res.json(repartidor);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getRepartidor = getRepartidor;
const updateRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const { PersonaData } = req.body;
        const repartidor = await Repartidor_1.Repartidor.findOne({
            where: { IdRepartidor: id },
            relations: ['Persona'],
        });
        if (!repartidor) {
            return res.status(404).json({ message: 'Repartidor no existe' });
        }
        // Actualizar datos de la Persona asociada
        if (repartidor.Persona) {
            await (0, Persona_controllers_1.updatePersona)({
                IdPersona: PersonaData.IdPersona,
                Nombre: PersonaData.Nombre,
                ApellidoPaterno: PersonaData.ApellidoPaterno,
                ApellidoMaterno: PersonaData.ApellidoMaterno,
                FechaDeNacimiento: PersonaData.FechaDeNacimiento,
                IdGenero: PersonaData.IdGenero,
                email: PersonaData.Email,
                IdDireccion: PersonaData.IdDireccion, // Asegúrate de pasar el IdDireccion si existe
                BarrioId: PersonaData.IdBarrio,
                Direccion: PersonaData.Direccion,
                Referencia: PersonaData.Referencia,
                IdImagen: PersonaData.IdImagen, // Asegúrate de pasar el IdImagen si existe
                Url: PersonaData.Url,
            });
        }
        // Actualizar datos específicos del Repartidor
        if (PersonaData.TipoVehiculo !== undefined)
            repartidor.TipoVehiculo = PersonaData.TipoVehiculo;
        if (PersonaData.PlacaVehiculo !== undefined)
            repartidor.PlacaVehiculo = PersonaData.PlacaVehiculo;
        if (PersonaData.IdEmpresaReparto !== undefined) {
            repartidor.EmpresaReparto = await (0, EmpresaReparto_controllers_1.verifyEmpresaReparto)({ EmpresaRepartoId: PersonaData.IdEmpresaReparto });
        }
        if (PersonaData.IdTipoLicencia !== undefined) {
            repartidor.TipoLicencia = await (0, TipoLicencia_controllers_1.verifyTipoLicencia)({ TipoLicenciaId: PersonaData.IdTipoLicencia });
        }
        if (PersonaData.NumeroLicencia !== undefined)
            repartidor.NumeroLicencia = PersonaData.NumeroLicencia;
        await repartidor.save();
        // Actualizar celulares
        if (PersonaData.Celulares && PersonaData.Celulares.length > 0) {
            const celularesActuales = await Celular_1.Celular.find({
                where: { Persona: { IdPersona: PersonaData.IdPersona } }
            });
            const idsEnviados = PersonaData.Celulares
                .filter((c) => c.IdCelular)
                .map((c) => c.IdCelular);
            for (const celularExistente of celularesActuales) {
                if (!idsEnviados.includes(celularExistente.IdCelular)) {
                    await celularExistente.remove();
                }
            }
            for (const celular of PersonaData.Celulares) {
                await (0, Celular_controllers_1.updateCelular)({
                    CelularId: celular.IdCelular,
                    Numero: celular.Numero,
                    PersonaId: PersonaData.IdPersona
                });
            }
        }
        // Actualizar documentos
        if (PersonaData.Documento && PersonaData.Documento.length > 0) {
            for (const documento of PersonaData.Documento) {
                await (0, Documento_controllers_1.updateDocumento)({
                    DocumentoId: documento.IdDocumento,
                    IdTipoDocumento: documento.Tipodocumento,
                    IdComplemento: documento.Complemento,
                    Documentos: documento.Documento,
                    PersonaId: PersonaData.IdPersona // Usar IdPersona del repartidor
                });
            }
        }
        return res.json({ message: "Repartidor actualizado correctamente", repartidor });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al actualizar repartidor:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateRepartidor = updateRepartidor;
const deleteRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const repartidor = await Repartidor_1.Repartidor.findOne({
            where: { IdRepartidor: id },
            relations: ["Estado"]
        });
        if (!repartidor) {
            return res.status(404).json({ message: "Repartidor no encontrado" });
        }
        const esActivo = repartidor.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        repartidor.Estado = nuevoEstado;
        await repartidor.save();
        return res.json({ message: `Se ${mensajeAccion} los datos del repartidor correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del repartidor:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteRepartidor = deleteRepartidor;
const verifyRepartidor = async ({ repartiodrId }) => {
    const existingSucursal = await Repartidor_1.Repartidor.findOne({ where: { IdRepartidor: repartiodrId } });
    if (!existingSucursal) {
        throw new error_handler_1.HttpError(404, `El repartidor con ID ${repartiodrId} no existe.`);
    }
    return existingSucursal;
};
exports.verifyRepartidor = verifyRepartidor;
