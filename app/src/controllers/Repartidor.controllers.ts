import { Request, Response } from "express";
import { Repartidor } from "../entities/Repartidor";
import { createPersona, updatePersona } from "./Persona.controllers";
import { generarIdSecuencial } from '../utils/idGenerator';
import { Persona } from "../entities/Persona";
import { verifyEstado } from "./Estado.controllers";
import { Celular } from "../entities/Celular";
import { createCelular, updateCelular } from "./Celular.controllers";
import { createDocumento, updateDocumento } from "./Documento.controllers";
import { Estado } from "../entities/Estado";
import { verifyEmpresaReparto } from "./EmpresaReparto.controllers";
import { verifyTipoLicencia } from "./TipoLicencia.controllers"; // Add this import
import { HttpError } from "../utils/error.handler";

export const createRepartidor = async (req: Request, res: Response) => {
    try {
        const {  PersonaData} = req.body; // Add IdTipoLicencia and NumeroLicencia

        const persona = await createPersona({
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

        const repartidor = new Repartidor();
       // Usar el IdPersona de la Persona creada
         const nuevoId = await generarIdSecuencial('REP');
        repartidor.IdRepartidor = nuevoId;
        repartidor.Estado = await verifyEstado({EstadoId:1}); // Set default state to 1 (activo)
        repartidor.TipoVehiculo =PersonaData.TipoVehiculo;
        repartidor.PlacaVehiculo = PersonaData.PlacaVehiculo;
        repartidor.Persona = persona; // Asignar la instancia de Persona
        repartidor.EmpresaReparto = await verifyEmpresaReparto({ EmpresaRepartoId:PersonaData.IdEmpresaReparto }); // Assign EmpresaReparto
        repartidor.TipoLicencia = await verifyTipoLicencia({ TipoLicenciaId: PersonaData.IdTipoLicencia }); // Assign TipoLicencia
        repartidor.NumeroLicencia = PersonaData.NumeroLicencia;

        await repartidor.save();

        if (PersonaData.Celulares && PersonaData.Celulares.length > 0) {
            for (const celular of PersonaData.Celulares) {
                await createCelular({ Numero: celular.Numero, PersonaId: persona.IdPersona });
            }
        }

        if (PersonaData.Documento && PersonaData.Documento.length > 0) {
            for (const documento of PersonaData.Documento) {
                await createDocumento({
                    IdTipoDocumento: documento.Tipodocumento,
                    IdComplemento: documento.Complemento,
                    Documentos: documento.Documento,
                    PersonaId: persona.IdPersona
                });
            }
        }

        return res.status(201).json({ message: "Repartidor registrado correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear repartidor:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getRepartidores = async (req: Request, res: Response) => {
    try {
        const repartidores = await Repartidor.find({
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
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getRepartidorActivos = async (req: Request, res: Response) => {
    try {
        const repartidores = await Repartidor.find({
            where:{Estado:{IdEstado:1}},
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
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


export const getRepartidor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const repartidor = await Repartidor.findOne({
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
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const updateRepartidor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {  PersonaData } = req.body;

        const repartidor = await Repartidor.findOne({
            where: { IdRepartidor: id },
            relations: ['Persona'],
        });

        if (!repartidor) {
            return res.status(404).json({ message: 'Repartidor no existe' });
        }

        // Actualizar datos de la Persona asociada
        if (repartidor.Persona) {
            await updatePersona({
                IdPersona: PersonaData.IdPersona,
                Nombre: PersonaData.Nombre,
                ApellidoPaterno: PersonaData.ApellidoPaterno,
                ApellidoMaterno: PersonaData.ApellidoMaterno,
                FechaDeNacimiento: PersonaData.FechaDeNacimiento,
                IdGenero: PersonaData.IdGenero,
                IdEmail: PersonaData.IdEmail, // Asegúrate de pasar el IdEmail si existe
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
        if (PersonaData.TipoVehiculo !== undefined) repartidor.TipoVehiculo = PersonaData.TipoVehiculo;
        if (PersonaData.PlacaVehiculo !== undefined) repartidor.PlacaVehiculo = PersonaData.PlacaVehiculo;
        if (PersonaData.IdEmpresaReparto !== undefined) {
            repartidor.EmpresaReparto = await verifyEmpresaReparto({ EmpresaRepartoId: PersonaData.IdEmpresaReparto });
        }
        if (PersonaData.IdTipoLicencia !== undefined) {
            repartidor.TipoLicencia = await verifyTipoLicencia({ TipoLicenciaId: PersonaData.IdTipoLicencia });
        }
        if (PersonaData.NumeroLicencia !== undefined) repartidor.NumeroLicencia = PersonaData.NumeroLicencia;

        await repartidor.save();

        // Actualizar celulares
        if (PersonaData.Celulares && PersonaData.Celulares.length > 0) {
            const celularesActuales = await Celular.find({
                where: { Persona: { IdPersona: PersonaData.IdPersona } }
            });

            const idsEnviados = PersonaData.Celulares
                .filter((c: { IdCelular: any; }) => c.IdCelular)
                .map((c: { IdCelular: any; }) => c.IdCelular);

            for (const celularExistente of celularesActuales) {
                if (!idsEnviados.includes(celularExistente.IdCelular)) {
                    await celularExistente.remove();
                }
            }

            for (const celular of PersonaData.Celulares) {
                await updateCelular({
                    CelularId: celular.IdCelular,
                    Numero: celular.Numero,
                    PersonaId:PersonaData.IdPersona
                });
            }
        }

        // Actualizar documentos
        if (PersonaData.Documento && PersonaData.Documento.length > 0) {
            for (const documento of PersonaData.Documento) {
                await updateDocumento({
                    DocumentoId: documento.IdDocumento,
                    IdTipoDocumento: documento.Tipodocumento,
                    IdComplemento: documento.Complemento,
                    Documentos: documento.Documento,
                    PersonaId: PersonaData.IdPersona // Usar IdPersona del repartidor
                });
            }
        }

        return res.json({ message: "Repartidor actualizado correctamente", repartidor });

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error al actualizar repartidor:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};

export const deleteRepartidor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const repartidor = await Repartidor.findOne({
            where: { IdRepartidor: id },
            relations:["Estado"]
        });

        if (!repartidor) {
            return res.status(404).json({ message: "Repartidor no encontrado" });
        }

        const esActivo = repartidor.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1; 
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

        const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

        if (!nuevoEstado) {
          return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }

        repartidor.Estado = nuevoEstado;
         
        await repartidor.save();

        return res.json({ message: `Se ${mensajeAccion} los datos del repartidor correctamente` });

    } catch (error) {
        console.error("Error al cambiar el estado del repartidor:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyRepartidor = async ({ repartiodrId }: { repartiodrId: string }) => {

    const existingSucursal = await Repartidor.findOne({ where: { IdRepartidor: repartiodrId } });
    
    
   if (!existingSucursal) {
    throw new HttpError(404,`El repartidor con ID ${repartiodrId} no existe.`);
  }
  
    return existingSucursal;
};
