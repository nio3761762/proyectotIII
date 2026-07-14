import { Request, Response } from "express";
import { Rolmenu} from "../entities/RolMenu";
import { Rol } from "../entities/Rol";
import { Menu } from "../entities/Menu";
import { createrole, updaterole, updateRole, verifyRol } from "./Rol.controllers";
import { verifyMenu } from "./Menu.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";



export const createRolMenu = async (req: Request, res: Response) => {
  try {
    const { Nombre, Permiso }: { Nombre: string, Permiso: Record<string, string[]> } = req.body;

    if (!Nombre || !Permiso) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const rol = await createrole({ Nombre });
    if (!rol) {
      return res.status(500).json({ message: "No se pudo crear el registro del rol" });
    }

    const result = await Rolmenu.createQueryBuilder("rolmenu")
      .select("MAX(CAST(SUBSTRING(rolmenu.IdRolMenu FROM '[0-9]+') AS INTEGER))", "ultimoNumero")
      .getRawOne();

    let ultimoNumero = result?.ultimoNumero || 0;
    const rolmenusToInsert = [];

    for (const [menuId, permisosArray] of Object.entries(Permiso)) {
      if (!permisosArray || permisosArray.length === 0) continue;

      for (const permisoId of permisosArray) {
        ultimoNumero++;
        const nuevoId = `IMR-${ultimoNumero}`;

        rolmenusToInsert.push({
          IdRolMenu: nuevoId,
          FechaRegistro: new Date(),
          menu: { IdMenu: menuId },
          rol: rol,
          Permiso: { IdPermiso: permisoId },
          Permitido: 1,
        });
      }
    }

    await Rolmenu.save(rolmenusToInsert);

    return res.status(201).json({ message: "Se registraron los datos del rol correctamente" });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const updateRolMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Nombre, Permiso }: { Nombre: string, Permiso: Record<string, string[]> } = req.body;

    if (!id || !Permiso || typeof Permiso !== 'object') {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    // Actualizar el rol
    let rol;
    try {
      rol = await updaterole({ RolId: id, Nombre });
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ message: error.message });
    }

    if (!rol) {
      return res.status(500).json({ message: "No se pudo actualizar los datos del rol" });
    }

    // Obtener relaciones actuales
    const relacionesActuales = await Rolmenu.find({
      where: { rol: { IdRol: id } },
      relations: ["menu", "rol", "Permiso"],
    });

    // Paso 1: Desactivar relaciones que ya no están
 for (const relacion of relacionesActuales) {
  const menuId = String(relacion.menu.IdMenu);
  const permisoId = String(relacion.Permiso.IdPermiso);
  const permisosSeleccionados = Permiso[menuId] || [];

  const sigueSeleccionado = permisosSeleccionados.includes(permisoId);

  if (!sigueSeleccionado) {
    // El permiso ya no está seleccionado → desactivar
    relacion.Permitido = 0;
    relacion.FechaRegistro = new Date();
    await relacion.save();
   
  }
}

    // Paso 2: Activar / Crear nuevas relaciones
    let ultimoNumero = 0;
    //const result = await generarIdSecuencial("rolmenu")
    

    for (const [menuId, permisosArray] of Object.entries(Permiso)) {
      if (!permisosArray || permisosArray.length === 0) continue;

      for (const permisoId of permisosArray) {
        const relacionExistente = relacionesActuales.find(
          (r) =>
            r.menu.IdMenu === menuId &&
            r.Permiso.IdPermiso === permisoId
        );

        if (relacionExistente) {
        
          relacionExistente.Permitido = 1;
          relacionExistente.FechaRegistro = new Date();
          await relacionExistente.save();
        } else {
          ultimoNumero++;
          const nuevoId = await generarIdSecuencial('IMR');

          const nuevaRelacion = Rolmenu.create({
            IdRolMenu: nuevoId,
            FechaRegistro: new Date(),
            menu: { IdMenu: menuId },
            rol: rol,
            Permiso: { IdPermiso: permisoId },
            Permitido: 1,
          });

          await nuevaRelacion.save();
        }
      }
    }

    return res.status(200).json({ message: "Se actualizaron los datos del rol correctamente" });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

  export const GetMenusPorRol= async (req: Request, res: Response)  => {
    try {
     const { id } = req.params;
      const rolMenus = await Rolmenu.find({
        where: {
          rol: { IdRol : id },
          Permitido: 1
        },
        relations: ["menu","menu.Icono","rol","Permiso"]
      });

      const menus = rolMenus.map((rm) => rm.menu);

      return res.status(200).json(rolMenus);
    } catch (error) {
      console.error("Error al obtener los menús del rol:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  };

    export const GetMenuPorRol= async (req: Request, res: Response)  => {
    try {
     const { id } = req.params;

      const rolMenus = await Rolmenu.find({
        where: {
          rol: { IdRol : id }
        },
       relations: ["rolMenus.menu","rolMenus.menu.Icono","rolMenus.Rolmenu.Permiso"]
      });

      const menus = rolMenus.map((rm) => rm.menu);

      return res.status(200).json(rolMenus);
    } catch (error) {
      console.error("Error al obtener los menús del rol:", error);
      return res.status(500).json({ mensaje: "Error del servidor" });
    }
  };



