import { Request, Response } from "express";
import { Sucursal } from "../entities/Sucursal";
import { createDireccion, updateDireccion } from "./Direccion.controllers";
import { verifyEstado } from "./Estado.controllers";
import { verifyDatos } from "./AdmDatos.controllers";
import { createHorario, updateHorario } from "./Horario.controllers";
import { HttpError } from "../utils/error.handler";
import { Usuariosucursal } from "../entities/UsuarioSucursal";
import { Producto } from "../entities/Producto";
import { createSucursalProducto } from "./SucursalProducto.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";

// Crear una nueva sucursal
export const createSucursal = async (req: Request, res: Response) => {
  try {
    const {
      RegistrarSucurcal
    } = req.body;


    const existingSucursal = await Sucursal.findOne({ where: { Nombre: RegistrarSucurcal.Nombre } });

    if (existingSucursal) {
      return res.status(400).json({ message: "La sucursal ya existe" });
    }


     

    const sucursal = new Sucursal();

    sucursal.IdSucursal = await generarIdSecuencial('SUC');;

    sucursal.Nombre = RegistrarSucurcal.Nombre;
    sucursal.Direccion = await createDireccion({ BarrioId: RegistrarSucurcal.IdBarrio, Direccions: RegistrarSucurcal.Direccion, Referencia: RegistrarSucurcal.Referencia,Ubicacion:RegistrarSucurcal.Ubicacion });
    if (RegistrarSucurcal.Nro) sucursal.Nro = RegistrarSucurcal.Nro;
    sucursal.FechaRegistro = new Date();
    sucursal.Datos = await verifyDatos({ DatoId: 1 });;
    sucursal.Estado = await verifyEstado({ EstadoId: 1 });
    sucursal.Horario = await createHorario({ HoraEntrada: RegistrarSucurcal.Entrada, HoraSalida: RegistrarSucurcal.Salida });
    if (RegistrarSucurcal.Celular) sucursal.Celular = RegistrarSucurcal.Celular;
    if (RegistrarSucurcal.Central) sucursal.Central = Number(RegistrarSucurcal.Central);
    await sucursal.save();
    
    const productos = await Producto.find({
          where: { Tipoproducto: { IdTipoProducto: 'ITP-2' } },
       });
   for(const prodducto of productos){
    await createSucursalProducto({SucursalId:sucursal.IdSucursal,ProductoId:prodducto.IdProducto, stockminimo:5})
   }
    return res.status(201).json({ message: "La sucursal se registro correctamente" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// Obtener todas las sucursales
export const getSucursales = async (req: Request, res: Response) => {
  try {
    const sucursales = await Sucursal.find({
       relations: ["Direccion", "Direccion.Barrio"
        ,"Direccion.Barrio.Distrito",
         "Direccion.Barrio.Distrito.Ciudad", 
          "Direccion.Barrio.Distrito.Ciudad.Departamento",
           "Estado",
            "Datos",
             "Horario"], });;
    return res.json(sucursales);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// Obtener sucursal por ID
export const getSucursalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sucursal = await Sucursal.find({ 
      where: { IdSucursal: id, 
    }
      ,relations:["Usuariosucursal","Usuariosucursal.Usuario","Usuariosucursal.Estado"] });

    if (!sucursal) {
      return res.status(404).json({ message: "Sucursal no encontrada" });
    }

    return res.json(sucursal);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// Actualizar sucursal
export const updateSucursal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      RegistrarSucurcal
    } = req.body;

    const sucursal = await Sucursal.findOne({
      where: { IdSucursal: id },
      relations: ['Estado']
    });

    if (!sucursal) {
      return res.status(404).json({ message: "Sucursal no encontrado" });
    }

    sucursal.Nombre = RegistrarSucurcal.Nombre;
    sucursal.Direccion = await updateDireccion({ IdDireccion: RegistrarSucurcal.IdDireccion, BarrioId: RegistrarSucurcal.IdBarrio, Direccions: RegistrarSucurcal.Direccion, Referencia: RegistrarSucurcal.Referencia, Ubicacion:'' });
    if (RegistrarSucurcal.Nro) sucursal.Nro = RegistrarSucurcal.Nro;
    sucursal.FechaActualizacion = new Date();
    sucursal.Horario = await updateHorario({ HorarioId: RegistrarSucurcal.IdHorario, HoraEntrada: RegistrarSucurcal.Entrada, HoraSalida: RegistrarSucurcal.Salida });
    if (RegistrarSucurcal.Celular) sucursal.Celular = RegistrarSucurcal.Celular;
    if (RegistrarSucurcal.Central) sucursal.Central = RegistrarSucurcal.Central;
    await sucursal.save();


    return res.status(201).json({ message: "La sucursal se actualizo correctamente" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// Eliminar (desactivar o activar) sucursal
export const deleteSucursal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sucursal = await Sucursal.findOne({
      where: { IdSucursal: id },
      relations: ['Estado']
    });

    if (!sucursal) {
      return res.status(404).json({ message: "Sucursal no encontrado" });
    }

    const esActivo = sucursal.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1;
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    sucursal.Estado = await verifyEstado({ EstadoId: nuevoEstadoId });;
    await sucursal.save();

    return res.json({ message: `Se ${mensajeAccion} los datos del Sucursal correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del Sucursal:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};


export const verifySucursal = async ({ SucursalId }: { SucursalId: string }) => {

    const existingSucursal = await Sucursal.findOne({ where: { IdSucursal: SucursalId } });
    
    
   if (!existingSucursal) {
    throw new HttpError(404,`La sucursal con ID ${SucursalId} no existe.`);
  }
  
    return existingSucursal;
};
