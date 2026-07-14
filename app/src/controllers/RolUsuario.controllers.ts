import { Request, Response } from "express";// Asumo que la entidad Rol está aquí
import { Rolusuario } from "../entities/RolUsuario";
import { verifyRol } from "./Rol.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { AppDataSource } from "../db";

export const AsignarRol = async (req: Request, res: Response) => {
  try {
    const { UsuarioId, RolesAsignar = [], RolesQuitar = [] } = req.body;

    await AppDataSource.query('BEGIN');

    // 🔹 1. ELIMINAR roles
    if (RolesQuitar.length > 0) {
      await AppDataSource.query(`
        DELETE FROM rolusuario
        WHERE idusuario = $1
        AND idrol = ANY($2)
      `, [UsuarioId, RolesQuitar]);
    }

    // 🔹 2. INSERTAR roles
    for (const rolId of RolesAsignar) {
      const nuevoId = await generarIdSecuencial('RU');

      await AppDataSource.query(`
        INSERT INTO rolusuario (
          idrolusuario,
          idusuario,
          idrol,
          fecharegistro
        )
        VALUES ($1, $2, $3, NOW())
      `, [nuevoId, UsuarioId, rolId]);
    }

    await AppDataSource.query('COMMIT');

    return res.json({
      message: "Roles actualizados correctamente"
    });

  } catch (error) {
    await AppDataSource.query('ROLLBACK');

    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const DeleteRol = async (req: Request, res: Response) => {
  try {
   const { idu,idr } = req.params;
  
   const result = await AppDataSource.query(`
      DELETE FROM rolusuario
      WHERE idusuario = $1 AND idrol = $2
      RETURNING *;
    `, [idu, idr]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No se encontró la relación" });
    }

    return res.json({ message: "Rol eliminado correctamente" });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
  export const AsignarupdateRol= async (req: Request, res: Response)  => {
    try {
     const { id } = req.params;
     const { RolId } = req.body;
     const RolUsuario = await Rolusuario.findOne({
  where: {
    Usuario: { IdUsuario: id }
  },
  relations:["Rol"]
});

      if(!RolUsuario)
          return res.status(404).json({ message: "El usuario no cuenta con un rol asignado" });
       

    if (RolUsuario.Rol && RolUsuario.Rol.IdRol === RolId) {
    return res.status(200).json({ message: "El rol ya está asignado al usuario." });
    }

      RolUsuario.IdRolUsuario=RolUsuario.IdRolUsuario;
       RolUsuario.Rol=await verifyRol({RolId});
       RolUsuario.FechaActualizacion=new Date();
       
       RolUsuario.save();
      return res.status(200).json({message:"Se actualizo el rol del usuario exitosamente"});
    } catch (error) {
      console.error("Error al obtener los menús del rol:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  };

//   export const AsignarupdateRol = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params; // ID del usuario
//     const { RolId } = req.body; // Nuevo rol que se quiere asignar

//     // Buscar la relación usuario-rol
//     const RolUsuario = await Rolusuario.findOne({
//       where: {
//         IdUsuario: id,
//       },
//     });

//     if (!RolUsuario) {
//       return res.status(404).json({ message: "El usuario no cuenta con un rol asignado" });
//     }

//     // Verificar si ya tiene el mismo rol asignado
//     if (RolUsuario.Rol.IdRol === RolId) {
//       return res.status(200).json({ message: "El rol ya está asignado al usuario, no se requiere actualización" });
//     }

//     // Si el rol es diferente, se actualiza
//     RolUsuario.IdRol = RolId;
//     RolUsuario.FechaActualizacion = new Date();

//     await RolUsuario.save(); // ¡OJO! No olvides el `await` aquí

//     return res.status(200).json({ message: "Se actualizó el rol del usuario exitosamente" });
//   } catch (error) {
//     console.error("Error al actualizar el rol del usuario:", error);
//     return res.status(500).json({ mensaje: "Error del servidor" });
//   }
// };
