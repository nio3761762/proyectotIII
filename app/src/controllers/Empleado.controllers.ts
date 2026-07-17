import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Empleado } from "../entities/Empleado";
import { verifyPersona } from "./Persona.controllers";
import { Cargo } from "../entities/Cargo";
import { HttpError } from "../utils/error.handler";
import { EmpleadoSucursal } from "../entities/EmpleadoSucursal";
import { verifySucursal } from "./Sucursal.controllers";
import { createSalario, updateSalario } from "./Salario.controllers";
import { createEmpleadoCargo } from "./Cargo.controllers";
import { Salario } from "../entities/Salario";

export const createEmpleadoSucursal = async ({ Idempleado,  idSucursal }: { Idempleado:string,  idSucursal:string }) => {
 const nuevoId = await generarIdSecuencial('SCEMP');
  const persona = new EmpleadoSucursal();
  persona.IdEmpleadoSucursal = nuevoId   
  persona.Empleado = await verifyEmpleado(Idempleado)
  if(idSucursal)
  persona.Sucursal = await verifySucursal({SucursalId:idSucursal})
  persona.FechaInicio = new Date();
  await persona.save();

   return persona;

};

export const updateEmpleadoSucursal = async ({
  Idempleado,
  idSucursal,
}: {
  Idempleado: string;
  idSucursal: string;
}) => {

  const existPersona = await EmpleadoSucursal
    .createQueryBuilder("es")
    .leftJoinAndSelect("es.Sucursal", "s")
    .leftJoin("es.Empleado", "e")
    .where("e.idempleado = :idEmpleado", {
      idEmpleado: Idempleado,
    })
    .andWhere("es.fechafin IS NULL")
    .getOne();

  // si no se asigna sucursal, cerrar relación activa si existe y salir
  if (!idSucursal) {
    if (existPersona) {
      existPersona.FechaFin = new Date();
      existPersona.Estado = 0;
      await existPersona.save();
    }
    return null;
  }

  // si hay registro activo con la misma sucursal, no hay cambios
  if (existPersona) {
    const sucursalActual = existPersona.Sucursal?.IdSucursal ?? null;
    if (sucursalActual === idSucursal) {
      return existPersona;
    }

    // cerrar relación actual
    existPersona.FechaFin = new Date();
    existPersona.Estado = 0;
    await existPersona.save();
  }

  // crear nueva relación
  return await createEmpleadoSucursal({
    Idempleado,
    idSucursal,
  });
};

export const verifyEmpleado = async ( IdEmpleado: string ) => {

const existPersona = await Empleado.findOne({ where: { IdEmpleado: IdEmpleado } });
       
   if (!existPersona) {
    throw new HttpError(404,`El empleado con ID ${IdEmpleado} no existe.`);

  }
  
    return existPersona;
};

export const getEmpleados = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AppDataSource.query(
      `
      SELECT 
        e.idempleado,
        p.nombre,
        p.apellidopaterno,
        p.apellidomaterno,
        p.imagen,
        c.nombre AS cargo
      FROM empleado e
      INNER JOIN persona p 
        ON e.idpersona = p.idpersona
      INNER JOIN empleado_cargo ec 
        ON ec.idempleado = e.idempleado
      INNER JOIN cargo c 
        ON c.idcargo = ec.idcargo
      INNER JOIN empleado_sucursal es 
        ON es.idempleado = e.idempleado
      WHERE 
        ec.estado = 1
        AND es.estado = 1
        AND es.idsucursal = $1
        AND ec.idcargo IN ('CAR-004', 'CAR-001')
      `,
      [id]
    );

    return res.json({ result });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message
      });
    }
  }
};
export const SalarioEmpleado = async ( IdEmpleado: string ) => {

  const salario = await Salario.findOne({
    where:{Estado:1,
      Empleado:{IdEmpleado:IdEmpleado}
    }, 
  })
   if (!salario) {
    throw new HttpError(404,`El empleado con ID ${IdEmpleado} no existe.`);
   }
    
   return salario.Salario;
};
export const CreateEmpleado = async (req: Request, res: Response) => { 
      try {
     const { Personas } = req.body;
    
       const nuevoId = await generarIdSecuencial('EMPL');
 
        const persona = new Empleado();
         persona.IdEmpleado = nuevoId;
     persona.Persona = await verifyPersona({PersonaId:Personas.IdPersona}) 
      persona.FechaIngreso = Personas.FechaIngreso;
     

       await persona.save() 

     if (Personas.Cargos && Personas.Cargos.length) {
  for (const cargo of Personas.Cargos) {
    await createEmpleadoCargo({
      Idempleado: nuevoId,
      idcargo: cargo
       });
      }
     }
     
      if(Personas.Salario > 0)
      await createSalario({salario:Personas.Salario,fecha:Personas.fecha,idempleado:nuevoId})
      if(Personas.IdSucursal)
      await createEmpleadoSucursal({Idempleado:nuevoId, idSucursal:Personas.IdSucursal})
  
      return res.status(200).json({message:"Se registro los datos del cliente exitosamente"});
    } catch (error) {
      console.error("Error al obtener los menús del rol:", error);
      return res.status(500).json({ message: "Error del servidor" });
    }
 
};  

export const UpdateEmpleado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Personas } = req.body;
   
    const existPersona = await Empleado.findOneBy({
      IdEmpleado: id,
    });

    if (!existPersona) {
      return res.status(404).json({
        message: "El empleado no existe",
      });
    }

    existPersona.FechaIngreso = Personas.FechaIngreso;

    // cargos actuales activos
    const cargosActuales = await AppDataSource.query(
      `
      SELECT idcargo
      FROM empleado_cargo
      WHERE idempleado = $1
      AND fechafin IS NULL
      `,
      [id]
    );

    const cargosActualesIds = cargosActuales.map(
      (c: any) => c.idcargo
    );

    const nuevosCargos = Personas.Cargos || [];

    // cargos que deben cerrarse
    const cargosEliminar = cargosActualesIds.filter(
      (c: string) => !nuevosCargos.includes(c)
    );

    // cargos nuevos que deben agregarse
    const cargosAgregar = nuevosCargos.filter(
      (c: string) => !cargosActualesIds.includes(c)
    );

    // cerrar cargos eliminados
    if (cargosEliminar.length > 0) {
      await AppDataSource.query(
        `
        UPDATE empleado_cargo
        SET fechafin = CURRENT_DATE,
            estado = 0
        WHERE idempleado = $1
        AND idcargo = ANY($2)
        AND fechafin IS NULL
        `,
        [id, cargosEliminar]
      );
    }

    // agregar nuevos cargos
    for (const cargo of cargosAgregar) {
      await createEmpleadoCargo({
        Idempleado: id,
        idcargo: cargo,
      });
    }

    await existPersona.save();

    await updateSalario({
      salario: Personas.Salario,
      fecha: Personas.fecha,
      idempleado: id,
    });

    await updateEmpleadoSucursal({
      Idempleado: id,
      idSucursal: Personas.IdSucursal,
    });

    return res.status(200).json({
      message: "Empleado actualizado correctamente",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error del servidor",
    });
  }
};
export const deleteEmpleado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

  const result = await AppDataSource.query(
  `UPDATE empleado 
   SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
   WHERE IdEmpleado = $1
   RETURNING estado AS estado`,
  [id]
);

    // ✅ aquí está el cambio
    if (result.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
const nuevoEstado = Number(result[0][0].estado);
    const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";

    return res.json({
      message: `Se ${mensajeAccion} los datos del empleado correctamente`,
    });

  } catch (error) {
    console.error("Error al cambiar el estado del Persona:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};


export const getEmpleadosVendedores = async (req: Request, res: Response) => {
  try {
    const result = await AppDataSource.query(
      `
      SELECT 
        e.idempleado,
        p.nombre,
        p.apellidopaterno,
        p.apellidomaterno,
        p.imagen,
        c.nombre AS cargo
      FROM empleado e
      INNER JOIN persona p 
        ON e.idpersona = p.idpersona
      INNER JOIN empleado_cargo ec 
        ON ec.idempleado = e.idempleado
      INNER JOIN cargo c 
        ON c.idcargo = ec.idcargo
      WHERE 
        ec.estado = 1
        AND ec.idcargo IN ('CAR-003', 'CAR-001')
      `,
    );

    return res.json({ result });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message
      });
    }
  }
};