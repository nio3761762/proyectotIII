import { Request, Response } from "express";
import { Rol } from "../entities/Rol"; // Asumo que la entidad Rol está aquí
import { verifyEstado } from "./Estado.controllers";
import { Menupermiso } from "../entities/MenuPermiso";
// Crear un nuevo rol
export const createrole = async ({  Nombre }: {  Nombre: string }) => {

        
        // Verificar si el rol ya existe
        const existingRole = await Rol.findOne({ where: { Nombre } });
        if (existingRole) {
            throw new Error( "El rol ya existe");
        }
   const result = await Rol.createQueryBuilder("rol")
    .select("MAX(CAST(SUBSTRING(rol.IdRol FROM '[0-9]+') AS INTEGER))", "ultimoNumero")
    .getRawOne();

  const nuevoNumero = (result?.ultimoNumero || 0);
  const nuevoId = `ROL-${nuevoNumero}`;
        const role = new Rol();
        role.IdRol=nuevoId;
        role.Nombre = Nombre;
        role.FechaRegistro=new Date();
        role.Estado=await verifyEstado({ EstadoId: 1 });
        await role.save();
      
         const RolRelation = await Rol.findOne({
      where: { IdRol: nuevoId },
      relations: ["Estado"]
    });
        return RolRelation;
   
};

export const updaterole = async ({  RolId,Nombre }: {  RolId:string , Nombre: string }) => {

        
        // Verificar si el rol ya existe
        const existingRole = await verifyRol({RolId});
        if (!existingRole) {
            throw new Error( "No existe registro del rol");
        }
   
        existingRole.IdRol=RolId;
        existingRole.Nombre=Nombre ?? existingRole.Nombre;
        existingRole.FechaActualizacion=new Date();
        await existingRole.save();
      
         const RolRelation = await Rol.findOne({
      where: { IdRol: RolId },
      relations: ["Estado"]
    });
        return RolRelation;
   
};


export const createRole = async (req: Request, res: Response) => {
    try {
        const { Nombre } = req.body;

        // Verificar si el rol ya existe
        const existingRole = await Rol.findOne({ where: { Nombre } });
        if (existingRole) {
            return res.status(400).json({ message: "El rol ya existe" });
        }
       
let estado;
     try {
              estado   = await verifyEstado({ EstadoId: 1 });
            } catch (error) {
                if (error instanceof Error)
                return res.status(400).json({ message: error.message });
            }
        // Verificar si ya existe una sucursal con mismo nombre
        if (!estado) {
      return res.status(500).json({ message: "No se pudo encontrar el estado" });
    }
     const ultimorol = await Rol.createQueryBuilder("rol")
        .select("MAX(rol.IdRol)", "ultimoId")
        .getRawOne();
    
 const nuevoId = `Rol-${(parseInt(ultimorol?.ultimoId?.replace("Rol-", "") || "0") + 1)}`;
        const role = new Rol();
        role.IdRol=nuevoId;
        role.Nombre = Nombre;
        role.FechaRegistro=new Date();
        role.Estado=estado;
        await role.save();
      
         const RolRelation = await Rol.findOne({
      where: { IdRol: nuevoId },
      relations: ["Estado"]
    });
        return res.status(201).json(RolRelation);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getPermiso = async (req: Request, res: Response) => {
    try {
        const permiso = await Menupermiso.find({  relations: ["menu","Permiso"]});
        return res.json(permiso);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
export const getPermisosPorMenu = async (req: Request, res: Response) => {
  const { idMenu } = req.params;

  try {
    const permisos = await Menupermiso.find({
      where: {
        menu: { IdMenu: idMenu }
      },
      relations: ["menu", "Permiso"]
    });

   return res.json(permisos.map(p => p.Permiso));
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// Obtener todos los roles
export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await Rol.createQueryBuilder("rol")
            .leftJoinAndSelect("rol.Estado", "estado")
            .leftJoinAndSelect("rol.rolMenus", "rolMenus", "rolMenus.Permitido = :permitido", { permitido: 1 })
            .leftJoinAndSelect("rolMenus.menu", "menu")
            .leftJoinAndSelect("menu.Icono", "icono")
            .leftJoinAndSelect("rolMenus.Permiso", "permiso")
            .getMany();

        return res.json(roles);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

// Obtener un rol por ID
export const getRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const role = await Rol.findOne({ where: { IdRol: id } });

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        return res.json(role);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

// Actualizar un rol
export const updateRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Nombre } = req.body;

        const role = await Rol.findOne({ where: { IdRol: id } });

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        role.IdRol=id 
        role.Nombre = Nombre || role.Nombre;
      role.FechaRegistro=role.FechaRegistro;  
      role.FechaActualizacion=new Date() ;
        await role.save();
      const RolRelation = await Rol.findOne({
      where: { IdRol: id },
      relations: ["Estado"]
    });
        return res.json(RolRelation);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

// Eliminar (desactivar) un rol
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rol = await Rol.findOne({
      where: { IdRol: id },
      relations: ['Estado']
    });

    if (!rol) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    const esActivo = rol.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1; 
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

    rol.Estado = nuevoEstado;
    await rol.save();

    return res.json({ message: `Se ${mensajeAccion} los datos del rol correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del usuario:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};


export const verifyRol = async ({ RolId }: { RolId: string }) => {
    const existRol = await Rol.findOne({ where: { IdRol: RolId } });
   if (!existRol) {
    throw new Error(`El rol con ID ${existRol} no existe.`);
  }
  
    return existRol;
};


