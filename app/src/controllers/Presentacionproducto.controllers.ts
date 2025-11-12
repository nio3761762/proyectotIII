import { Presentacionproducto } from "../entities/Presentacionproducto";
import { Producto } from "../entities/Producto";
import { Promocion } from "../entities/Promocion";
import { Sucursal } from "../entities/Sucursal";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyEstado } from "./Estado.controllers";
import { createImagen, updateImagen } from "./Foto.controllers";
import { verifyUnidadMedida } from "./Medida.controllers";
import { verifyPresentacion } from "./Presentacion,controllers";
import { verifyProducto } from "./Producto.controllers";
import { Request, Response } from "express";
import { createSucursalProducto } from "./SucursalProducto.controllers";
import { Productosucursal } from "../entities/ProductoSucursal";

export const verifyPaquete = async ({ PaqueteId }: { PaqueteId: string }) => {
  const existPaquete = await Presentacionproducto.findOne({ where: { IdPaquete: PaqueteId } });

  if (!existPaquete) {
    throw new HttpError(404, `El Presentacionproducto con ID ${PaqueteId} no existe.`);
  }

  return existPaquete;
};

export const createPaquete = async ({
  IdProducto,
  IdUnidadMedida,
  Nombre,
  PrecioVenta,
  Cantidad,
  IdEstado,
  IdPresentacion,
  Url,
  StockMinimo,

}: {
  IdProducto: string;
  IdUnidadMedida: number;
  Nombre: string,
  PrecioVenta: number;
  Cantidad: number;
  IdEstado: number;
  IdPresentacion: string;
  Url: string,
  StockMinimo:number
}) => {
  const nuevoId = await generarIdSecuencial('PQ');

  const nuevoPaquete = new Presentacionproducto();
  nuevoPaquete.IdPaquete = nuevoId;
  nuevoPaquete.Cantidad = Cantidad;
  nuevoPaquete.Nombre = Nombre;
  nuevoPaquete.PrecioVenta = PrecioVenta;
  nuevoPaquete.FechaRegistro = new Date();
  nuevoPaquete.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: IdUnidadMedida });
  nuevoPaquete.Producto = await verifyProducto({ ProductoId: IdProducto });
  nuevoPaquete.Estado = await verifyEstado({ EstadoId: IdEstado });
  nuevoPaquete.Presentacion = await verifyPresentacion({ PresentacionId: IdPresentacion });
  if (Url) nuevoPaquete.Imagen = await createImagen({ Foto: Url })
  await nuevoPaquete.save();

  const sucursales = await Sucursal.find();
  for (const sucursal of sucursales)
    await createSucursalProducto({ SucursalId: sucursal.IdSucursal, ProductoId: nuevoId,stockminimo:StockMinimo });
  return nuevoPaquete;
};

export const updatePaquete = async ({
  IdPaquete,
  IdProducto,
  IdUnidadMedida,
  Nombre,
  PrecioVenta,
  Cantidad,
  IdEstado,
  IdPresentacion,
  IdImagen,
  Url,
  StockMinimo
}: {
  IdPaquete: string;
  IdProducto: string;
  Nombre: string,
  IdUnidadMedida: number;
  PrecioVenta: number;
  Cantidad: number;
  IdEstado: number;
  IdPresentacion: string;
  IdImagen: string;
  Url: string,
  StockMinimo:number
}) => {

  if (IdPaquete) {
    const paquete = await Presentacionproducto.findOne({ where: { IdPaquete } });

    if (paquete) {
      // --- SI EL PAQUETE EXISTE, SE ACTUALIZA ---
      if (Cantidad) paquete.Cantidad = Cantidad;
      if (Nombre) paquete.Nombre = Nombre;
      if (PrecioVenta) paquete.PrecioVenta = PrecioVenta;
      if (IdProducto) paquete.Producto = await verifyProducto({ ProductoId: IdProducto });
      if (IdUnidadMedida) paquete.Unidadmedida = await verifyUnidadMedida({ UnidadMedidaId: IdUnidadMedida });
      if (IdPresentacion) paquete.Presentacion = await verifyPresentacion({ PresentacionId: IdPresentacion })

      // Si se proporciona un IdEstado, se actualiza. Si no, no se cambia.
      if (IdEstado !== undefined) {
        paquete.Estado = await verifyEstado({ EstadoId: IdEstado });
      }

      paquete.FechaRegistro = new Date(); // Actualiza la fecha en cada modificación

      if (IdImagen)
        paquete.Imagen = await updateImagen({ ImagenId: IdImagen, Foto: Url });
      else
        paquete.Imagen = await createImagen({ Foto: Url })
      await paquete.save();

      const paqueteSucursal = await Productosucursal.find({
        where:{Paquete:{IdPaquete:IdPaquete}}
      })
     
      if(paqueteSucursal)
     for(const paq of paqueteSucursal){
      paq.StockMinimo = StockMinimo;
      await paq.save()
     }

      return paquete;

    }
  }


  return await createPaquete({ IdProducto: IdProducto, IdUnidadMedida: IdUnidadMedida, Nombre: Nombre, PrecioVenta: PrecioVenta, Cantidad: Cantidad, IdEstado: IdEstado, IdPresentacion: IdPresentacion, Url: Url,StockMinimo:StockMinimo });

};
export const getPaquete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productosSucursal = await Productosucursal.createQueryBuilder("ps")
      .innerJoin("ps.Paquete", "paquete")
      .leftJoinAndSelect("paquete.Imagen", "imagen")
      .leftJoinAndSelect("paquete.Producto", "producto")
      .innerJoin("ps.Sucursal", "sucursal")
      .where("sucursal.IdSucursal = :id", { id })
      .select([
        "ps.IdProductoSucursal",
        "ps.Cantidad",
        "paquete.IdPaquete",
        "paquete.Nombre",
        "paquete.Cantidad",
        "paquete.FechaRegistro",
        "paquete.PrecioVenta",
        "paquete.PrecioMayor",
        "imagen",
        "producto"
      ])
      .getMany();

    // Mapeamos para incluir IdProductoSucursal junto con los datos del paquete
    const resultado = productosSucursal.map(ps => ({
      IdProductoSucursal: ps.IdProductoSucursal,
      CantidadPaquete: ps.Cantidad,
      ...ps.Paquete
    }));

    return res.json(resultado);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getPaquetesinSucursal = async (req: Request, res: Response) => {
  try {
    const productosSucursal = await Presentacionproducto.createQueryBuilder("ps")
      .leftJoinAndSelect("ps.Imagen", "imagen")
      .leftJoinAndSelect("ps.Producto", "producto")
      .select([
        "ps.IdPaquete",
        "ps.Nombre",
        "ps.Cantidad",
        "ps.FechaRegistro",
        "ps.PrecioVenta",
        "ps.PrecioMayor",
        "imagen",
        "producto"
      ])
      .getMany();

    // Mapeamos para incluir IdProductoSucursal junto con los datos del paquete
    const resultado = productosSucursal.map(ps => ({
      IdPaquete: ps.IdPaquete,
      Cantidad: ps.Cantidad,
      Nombre: ps.Nombre,
      FechaRegistro: ps.FechaRegistro,
      PrecioVenta: ps.PrecioVenta,
      PrecioMayor: ps.PrecioMayor,
      Imagen: ps.Imagen ? {
        IdImagen: ps.Imagen.IdImagen,
        Url: ps.Imagen.Url
      } : null,
      Producto: ps.Producto ? {
        IdProducto: ps.Producto.IdProducto,
        Nombre: ps.Producto.Nombre,
        Descripcion: ps.Producto.Descripcion,
        FechaRegistro: ps.Producto.FechaRegistro,
        Fechaactualizacion: ps.Producto.Fechaactualizacion,
        FechaVencimiento: ps.Producto.FechaVencimiento
      } : null
    }));

    return res.json(resultado);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getPaqueteSucursal = async (req: Request, res: Response) => {
  try {

    const { ids, id } = req.params;
    const producto = await Productosucursal.findOne({
      where: {
        Sucursal: { IdSucursal: ids },
        Paquete: { IdPaquete: id }
      }
    });


    return res.json(producto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getProductoPaquete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const producto = await Presentacionproducto.find({
      where: {
        Producto: { IdProducto: id },
        Estado: { IdEstado: 1 }
      },
      relations: ['Estado']
    });

    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    return res.json(producto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getProductosPaquete = async (req: Request, res: Response) => { 
  try {
    const { id } = req.params;

    const productos = await Presentacionproducto.find({
      where: {
        Producto: { IdProducto: id },
      },
      relations: ['Estado', 'Presentacion', 'Unidadmedida', 'Imagen','Productosucursal'],
    });

    // Si no existe, devolver array vacío
    if (!productos.length) {
      return res.json([]);
    }

    const result = productos.map(p => ({
      ...p,
      Estado: p.Estado?.IdEstado ?? null,
      Presentacion: p.Presentacion?.IdPresentacion ?? null,
      Unidadmedida: p.Unidadmedida?.IdUnidadMedida ?? null,
      IdImagen: p.Imagen?.IdImagen ?? null,
      Url: p.Imagen?.Url ?? null,
      StockMinimo: p.Productosucursal?.[0]?.StockMinimo ?? 0,
    }));

    return res.json(result);

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Ocurrió un error desconocido." });
  }
};


export const ObtenerPresentacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productos = await Presentacionproducto.findOne({
      where: {
        IdPaquete: id,
      },
      relations: ['Estado', 'Presentacion', 'Unidadmedida', 'Producto'],
    });

    if (!productos) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json({
      IdPaquete: productos.IdPaquete,
      Estado: productos.Estado.IdEstado,
      Nombre: productos.Nombre,
      Cantidad: productos.Cantidad,
      Precio: productos.PrecioVenta,
      Presentacion: productos.Presentacion.IdPresentacion,
      Unidadmedida: productos.Unidadmedida.IdUnidadMedida,
      IdProducto: productos.Producto.IdProducto
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Ocurrió un error desconocido." });
  }
};

export const getProductoSucursal = async (req: Request, res: Response) => {
  try {
    const { id, categoriaId, subcategoriaId } = req.params; // usar nombre en vez de id

    const producto = await Producto.find({
      where: { Productosucursal: { Sucursal: { IdSucursal: id } } }, // búsqueda insensible a mayúsculas/minúsculas
      relations: ["Imagen", 
        "Subcategoria", 
        "Subcategoria.Categoria",
         "Productosucursal",
          "Productosucursal.Sucursal"],
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    const productoFiltradas = producto.filter(v =>
      (categoriaId === "TODOS" || v.Subcategoria?.Categoria.IdCategoria === categoriaId) &&
      (subcategoriaId === "TODOS" || v.Subcategoria?.IdSubCategoria === subcategoriaId)
    );

    return res.json(productoFiltradas);
  } catch (error) {   //
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};


export const getProductod = async (req: Request, res: Response) => {
  try {
    const { categoriaId, subcategoriaId } = req.params; // usar nombre en vez de id

    const producto = await Producto.find({
      where: { Tipoproducto: { IdTipoProducto: 'ITP-2' } }, // búsqueda insensible a mayúsculas/minúsculas
      relations: ["Imagen", "Subcategoria", "Subcategoria.Categoria"],
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    const productoFiltradas = producto.filter(v =>
      (categoriaId === "TODOS" || v.Subcategoria?.Categoria.IdCategoria === categoriaId) &&
      (subcategoriaId === "TODOS" || v.Subcategoria?.IdSubCategoria === subcategoriaId)
    );

    return res.json(productoFiltradas);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getUniqueProductsWithSummedQuantities = async (req: Request, res: Response) => {
  try {
    const { id, subcategoriaId } = req.query; // 'id' can be SucursalId or "TODOS"

    const allProductoSucursal = await Productosucursal.find({
      relations: [
        'Sucursal',
        'Producto',
        'Producto.Subcategoria',
        'Producto.Subcategoria.Categoria',
        'Producto.Imagen',
        'Producto.Estado',
        'Producto.Productomedida',
        'Producto.Productomedida.Unidadmedida'
      ],
    });

    if (!allProductoSucursal.length) {
      return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
    }

    let productoFiltradas = allProductoSucursal.filter(v => v.Producto !== null);

    // Apply category and subcategory filters
    productoFiltradas = productoFiltradas.filter(v =>
      (subcategoriaId === "TODOS" || v.Producto?.Subcategoria.IdSubCategoria === subcategoriaId)
    );

    // Apply sucursal filter if 'id' is not "TODOS"
    if (id !== "TODOS") {
      productoFiltradas = productoFiltradas.filter(v => v.Sucursal?.IdSucursal === id);
    }

    const uniqueProducts = new Map<string, any>();

    for (const ps of productoFiltradas) {
      if (ps.Producto) {
        const productoId = ps.Producto.IdProducto;
        if (uniqueProducts.has(productoId)) {
          // If product already exists, sum the quantities
          const existingProduct = uniqueProducts.get(productoId);
          existingProduct.Cantidad += ps.Cantidad;
          uniqueProducts.set(productoId, existingProduct);
        } else {
          // If product is new, add it to the map
          uniqueProducts.set(productoId, {
            ...ps,
            // When 'id' is "TODOS", set IdProductoSucursal to null
            IdProductoSucursal: id === "TODOS" ? null : ps.IdProductoSucursal, // <--- Modified here
            // When 'id' is "TODOS", set Sucursal to null to represent aggregation
            // Otherwise, show the specific SucursalId
            Sucursal: id === "TODOS" ? null : (ps.Sucursal?.IdSucursal ?? null),
            Producto: {
              ...ps.Producto,
             // Cantidad:ps.Producto.Cantidad,
              Estado: ps.Producto.Estado?.IdEstado ?? null,
            }
          });
        }
      }
    }

    const result = Array.from(uniqueProducts.values());

    return res.json(result);

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Ocurrió un error desconocido." });
  }
};

export const getProductoPromocion = async (req: Request, res: Response) => {
  try {
    const producto = await Promocion.find({
      where: {
        Promocionproducto: { Estado: { IdEstado: 1 } },
        Estado: { IdEstado: 1 }
      },
      relations: [
        'Promocionproducto',
        'Promocionproducto.Producto',
        'Promocionproducto.Paquete',
        'Promocionproducto.Paquete.Producto',
        'Estado']
    });

    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    return res.json(producto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};