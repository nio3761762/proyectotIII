import { Request, Response } from "express";
import { In } from "typeorm";
import { Usuariosucursal } from "../entities/UsuarioSucursal";
import { verifySucursal } from "./Sucursal.controllers";
import { Usuario } from "../entities/Usuario";
import { Estado } from "../entities/Estado";
import { verifyEstado } from "./Estado.controllers";
import { Productosucursal } from "../entities/ProductoSucursal";
import { Producto } from "../entities/Producto";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyUsuario } from "./Usuario.controllers";

export const createUsuarioSucursal = async (req: Request, res: Response) => {
  try {
    const { IdUsuarios, IdSucursal } = req.body; // IdUsuarios es array de objetos { id: number }

    if (!Array.isArray(IdUsuarios)) {
      return res.status(400).json({ message: "El campo IdUsuarios debe ser un array." });
    }

    const sucursal = await verifySucursal({ SucursalId: IdSucursal });
    if (!sucursal) {
      return res.status(404).json({ message: "Sucursal no encontrada" });
    }

    // Obtener todos los usuarios asignados actualmente a ESTA sucursal
    const usuarioSucursales = await Usuariosucursal.find({
      where: { Sucursal: { IdSucursal: IdSucursal } },
      relations: ["Usuario", "Estado"],
    });

    if (IdUsuarios.length > 0) {
      const usuariosSeleccionados = new Set(IdUsuarios.map(u => u.id));

      for (const asignado of usuarioSucursales) {
        const usuarioId = asignado.Usuario.IdUsuario;

        if (usuariosSeleccionados.has(usuarioId)) {
          if (asignado.Estado.IdEstado !== 1) {
            await Update({ id: asignado.IdUsuarioSucursal, EstadoId: 1 });
          }
          usuariosSeleccionados.delete(usuarioId);
        } else {
          if (asignado.Estado.IdEstado !== 2) {
            await Update({ id: asignado.IdUsuarioSucursal, EstadoId: 2 });
          }
        }
      }

      // Revisar los nuevos usuarios seleccionados que no están en esta sucursal
      for (const nuevoId of usuariosSeleccionados) {
        // 👇 Buscar si ya está activo en otra sucursal
        const asignacionActiva = await Usuariosucursal.findOne({
          where: { Usuario: { IdUsuario: nuevoId }, Estado: { IdEstado: 1 } },
          relations: ["Sucursal", "Estado", "Usuario"],
        });

        if (asignacionActiva && asignacionActiva.Sucursal.IdSucursal !== IdSucursal) {
          // Desactivar la otra relación activa
          await Update({ id: asignacionActiva.IdUsuarioSucursal, EstadoId: 2 });
        }

        // Crear o reactivar la nueva relación en la sucursal actual
        await Add({ IdSucursal, IdUsuario: nuevoId });
      }
    } else {
      // Si no se mandan usuarios → desactivar todos en esta sucursal
      if (usuarioSucursales.length > 0) {
        for (const asignado of usuarioSucursales) {
          await Update({ id: asignado.IdUsuarioSucursal, EstadoId: 2 });
        }
      }
    }

    return res.json({ message: "Usuarios asignados a la sucursal correctamente" });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};




export const Add = async ({ IdSucursal, IdUsuario }: { IdSucursal: string, IdUsuario: string }) => {
  const nuevo = new Usuariosucursal();
      const nuevoId = await generarIdSecuencial('SU');
     nuevo.IdUsuarioSucursal = nuevoId;
     nuevo.Sucursal = await verifySucursal({SucursalId:IdSucursal});
     nuevo.Usuario = await verifyUsuario({UsuarioId:IdUsuario});
     nuevo.Estado = await verifyEstado ({EstadoId:1});
     nuevo.FechaAsignado = new Date();
    await nuevo.save();

    return nuevo;
};

export const Update = async ({ id, EstadoId}: { id: string,EstadoId:number }) => {
    const usuarioSucursal = await Usuariosucursal.findOne({
            where: { IdUsuarioSucursal: id },
            relations: ['Estado']
        });

        if (!usuarioSucursal) {
             throw new Error(  "No la relacion solicitado");
        }

    
     usuarioSucursal.Estado = await verifyEstado ({EstadoId:EstadoId});
    
    await usuarioSucursal.save();

    return usuarioSucursal;
};

export const getUsuarioSucursales = async (req: Request, res: Response) => {
    try {
        const usuarioSucursales = await Usuariosucursal.find({ relations: ["Usuario", "Sucursal", "Estado"] });
        return res.json(usuarioSucursales);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getUsuarioSucursalesBySucursal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const usuarioSucursales = await Usuariosucursal.find({
            where: { Sucursal: { IdSucursal: id } },
            relations: ["Usuario", "Sucursal", "Estado"]
        });
        return res.json(usuarioSucursales);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getUsuarioSucursalesByUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const usuarioSucursales = await Usuariosucursal.find({
            where: { Usuario: { IdUsuario: id } },
            relations: ["Usuario", "Sucursal", "Estado"]
        });
        return res.json(usuarioSucursales);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const deleteUsuarioSucursal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const usuarioSucursal = await Usuariosucursal.findOne({
            where: { IdUsuarioSucursal: id },
            relations: ['Estado']
        });

        if (!usuarioSucursal) {
            return res.status(404).json({ message: "Asignación no encontrada" });
        }

        const esActivo = usuarioSucursal.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'deshabilitada' : 'habilitada';

        const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }

        usuarioSucursal.Estado = nuevoEstado;
        usuarioSucursal.FechaActualizacion = new Date();
        await usuarioSucursal.save();

        return res.json({ message: `Asignación ${mensajeAccion} correctamente` });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const updateUsuarioSucursal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { IdSucursal, IdUsuario, IdEstado } = req.body;

        const usuarioSucursal = await Usuariosucursal.findOne({ where: { IdUsuarioSucursal: id } });

        if (!usuarioSucursal) {
            return res.status(404).json({ message: "Asignación no encontrada" });
        }

        if (IdSucursal) {
            usuarioSucursal.Sucursal = await verifySucursal({ SucursalId: IdSucursal });
        }
        if (IdUsuario) {
            const usuario = await Usuario.findOne({ where: { IdUsuario: IdUsuario } });
            if (!usuario) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            usuarioSucursal.Usuario = usuario;
        }
        if (IdEstado) {
            usuarioSucursal.Estado = await verifyEstado({ EstadoId: IdEstado });
        }

        usuarioSucursal.FechaActualizacion = new Date();
        await usuarioSucursal.save();

        return res.json({ message: "Asignación actualizada correctamente", usuarioSucursal });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getProductsByUserId = async (req: Request, res: Response) => {
    try {
        const { id: userId } = req.params; // Obtener el ID de usuario de los parámetros

        // 1. Encontrar todas las asignaciones de sucursal para el usuario
        const usuarioSucursales = await Usuariosucursal.find({
            where: { Usuario: { IdUsuario: userId } },
            relations: ["Sucursal"], // Asegurarse de cargar la relación con Sucursal
        });

        if (!usuarioSucursales || usuarioSucursales.length === 0) {
            return res.status(404).json({ message: "No se encontraron sucursales asignadas a este usuario." });
        }

        const uniqueProductIds = new Set<string>();
        const allProducts: any[] = [];

        // 2. Para cada sucursal, obtener sus productos
        for (const us of usuarioSucursales) {
            const sucursalId = us.Sucursal.IdSucursal;

            const productosSucursal = await Productosucursal.find({
                where: {
                    Sucursal: { IdSucursal: sucursalId } as any,
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

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
};