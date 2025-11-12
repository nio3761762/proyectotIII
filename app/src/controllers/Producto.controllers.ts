import { Request, Response } from "express";
import { Producto } from "../entities/Producto";
import { verifyEstado } from "./Estado.controllers";
import { verifyTipoProducto } from "./Tipoproducto.controllers";
import { verifyMarca } from "./Marca.controllers";
import { verifySubCategoria } from "./Categoria.controllers";
import { HttpError } from "../utils/error.handler";
import { createImagen, updateImagen, verifyImagen } from "./Foto.controllers";
import { createPrecio, updatePrecio } from "./Precio.controllers";
import { Sucursal } from "../entities/Sucursal";
import { createSucursalProducto } from "./SucursalProducto.controllers";
import { createPaquete, updatePaquete } from "./Presentacionproducto.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Like } from "typeorm";
import { createProductoMedida, updateProductoMedida } from "./ProductoMedida.controllers";
import { Unidadmedida } from "../entities/UnidadMedida";
import { Productomedida } from "../entities/ProductoMedida";
import { createIngrediente, ObtenerIngredientes, updateIngrediente } from "./Ingredientes.controllers";
import { Ingrediente } from "../entities/Ingrediente";
import { Productosucursal } from "../entities/ProductoSucursal";


export const createProducto = async (req: Request, res: Response) => {
  try {
    const { RegistroProducto } = req.body;



    const nuevoId = await generarIdSecuencial('PROD');

    const producto = new Producto();
    producto.IdProducto = nuevoId;
    producto.Nombre = RegistroProducto.Nombre;
    producto.FechaRegistro = new Date();
    producto.Estado = await verifyEstado({ EstadoId: 1 });

    if (RegistroProducto.Descripcion) producto.Descripcion = RegistroProducto.Descripcion;
    if (RegistroProducto.Url) {
      const imagen = await createImagen({ Foto: RegistroProducto.Url });
      producto.Imagen = imagen;
    }
    if (RegistroProducto.IdSubCategoria) producto.Subcategoria = await verifySubCategoria({ CategoriaId: RegistroProducto.IdSubCategoria });
    if (RegistroProducto.IdMarca) producto.Marca = await verifyMarca({ Marcaid: RegistroProducto.IdMarca });
    if (RegistroProducto.IdTipo) producto.Tipoproducto = await verifyTipoProducto({ TipoId: RegistroProducto.IdTipo });
    if (RegistroProducto.Descripcion) producto.Descripcion = RegistroProducto.Descripcion;
    await producto.save();

    if (!RegistroProducto.IdMarca) {
      const sucursales = await Sucursal.find();
      for (const sucursal of sucursales)
        await createSucursalProducto({ SucursalId: sucursal.IdSucursal, ProductoId: nuevoId,stockminimo:RegistroProducto.StockMinimo });
    }
    if (RegistroProducto.Productomedida && RegistroProducto.Productomedida.length > 0)
      for (const medida of RegistroProducto.Productomedida)
        await createProductoMedida({ IdProducto: nuevoId, IdUnidadMedida: medida.IdUnidadMedida, Cantidad: medida.Cantidad, Precio: medida.Precio, PrecioMayor: medida.PrecioMayor })


    if (RegistroProducto.Paquete && RegistroProducto.Paquete.length > 0)
      for (const paquete of RegistroProducto.Paquete)
        await createPaquete({
          IdProducto: nuevoId, IdUnidadMedida: paquete.IdUnidadMedida, Nombre: paquete.Nombre,
          PrecioVenta: paquete.PrecioVenta, Cantidad: paquete.Cantidad, IdEstado: paquete.Estado, IdPresentacion: paquete.IdPresentacion,
          Url: paquete.Url,StockMinimo:paquete.StockMinimo
        })


    return res.json({ message: "El Producto se registró correctamente" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findOne({
      where: { IdProducto: id },
      relations: ['Estado']
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const esActivo = producto.Estado?.IdEstado === 1;
    const nuevoEstadoId = esActivo ? 2 : 1;
    const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';

    const nuevoEstado = await verifyEstado({ EstadoId: nuevoEstadoId });

    if (!nuevoEstado) {
      return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
    }

    producto.Estado = nuevoEstado;
    await producto.save();

    return res.json({ message: `Se ${mensajeAccion} los datos del Producto correctamente` });

  } catch (error) {
    console.error("Error al cambiar el estado del Producto:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const PrecioProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findOne({
      where: { IdProducto: id },
      relations: ['Productomedida', 'Productomedida.Unidadmedida']
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }


    return res.json({
      Precio: producto.Productomedida[0].PrecioVenta,
      Unidadmedida: producto.Productomedida[0].Unidadmedida.IdUnidadMedida,
      Id: producto.Productomedida[0].IdProductoMedida,
      PrecioMayor: producto.Productomedida[0].PrecioMayor
    });

  } catch (error) {
    console.error("Error al cambiar el estado del Producto:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getProductos = async (req: Request, res: Response) => {
  try {
    const productos = await Producto.find({
      where: { Tipoproducto: { IdTipoProducto: 'ITP-2' } },
      relations: [
        'Estado',
        'Marca',
        'Tipoproducto',
        'Subcategoria',
        'Subcategoria.Categoria',
        'Imagen',
        'Productomedida',
        'Paquete',
        'Paquete.Estado',
        'Paquete.Unidadmedida',
        'Productosucursal',
        'Productosucursal.Sucursal']
    });
    return res.json(productos);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getInsumo = async (req: Request, res: Response) => {
  try {
    const productos = await Producto.find({
      where: { Tipoproducto: { IdTipoProducto: 'ITP-1' } },
      relations: [
        'Estado',
        'Marca',
        'Tipoproducto',
        'Subcategoria',
        'Subcategoria.Categoria',
        'Imagen',
        'Productomedida',
        'Productomedida.Unidadmedida',
        'Productomedida.Unidadmedida.Categoria'
      ]
    });
    return res.json(productos);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
export const getBuscarProductos = async (req: Request, res: Response) => {
  try {
    // Trae los productos (filtra por tipo en la base si Tipoproducto es relación)
    const productos = await Producto.find({
      where: { Tipoproducto: { IdTipoProducto: "ITP-2" } },
      relations: ["Productosucursal", "Productosucursal.Sucursal"],
    });

    // Filtrar en memoria: quedarse solo con los que tienen 1+ Productosucursal
    const productosConSucursal = productos.filter(
      (p) => Array.isArray(p.Productosucursal) && p.Productosucursal.length > 0
    );

    // Opcional: normalizar/limpiar salida para el front (evita enviar arrays vacíos innecesarios)
    const resultado = productosConSucursal.map((p) => {
      // tomar la primera Productosucursal por ejemplo (o dejar toda la lista si la necesitas)
      const ps0 = p.Productosucursal[0];

      // calcular precioActual (tomando el último por fecha si hay)
      let precioActual = null;
      // if (Array.isArray(p.Precio) && p.Precio.length) {
      //   precioActual = [...p.Precio]
      //     .sort((a, b) => new Date(b.FechaRegistro).getTime() - new Date(a.FechaRegistro).getTime())[0]
      //     .Precio;
      // }

      return {
        IdProducto: p.IdProducto,
        Nombre: p.Nombre,
        Descripcion: p.Descripcion,
        FechaRegistro: p.FechaRegistro,
        precioActual,
        Productosucursal: p.Productosucursal, // o ps0 si solo quieres la primera
      };
    });

    return res.json(resultado);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error desconocido" });
  }
};

export const getProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findOne({
      where: { IdProducto: id },
      relations: ['Estado', 'Marca', 'Unidadmedida', 'Tipoproducto', 'Subcategoria', 'Subcategoria.categoria', 'Precio', "Imagen"]
    });

    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    return res.json(producto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const getProductoSucursal = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.params; // mejor usar nombre en vez de id
    const producto = await Producto.findOne({
      where: { Nombre: Like(`%${nombre}%`) }, // búsqueda parcial
      relations: ["Productosucursal", "Productosucursal.Sucursal"],
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json(producto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};


export const updateProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { RegistroProducto } = req.body;

    const producto = await Producto.findOne(
      { where: { IdProducto: id }, relations: ["Productomedida", "Ingrediente"] });

    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });


    if (RegistroProducto.Nombre) producto.Nombre = RegistroProducto.Nombre;

    if (RegistroProducto.IdImagen) {
      const imagen = await updateImagen({ ImagenId: RegistroProducto.IdImagen, Foto: RegistroProducto.Url });
      producto.Imagen = imagen;
    } else {
      if (RegistroProducto.Url) {
        const imagen = await createImagen({ Foto: RegistroProducto.Url });
        producto.Imagen = imagen;
      }
    }

    if (RegistroProducto.IdSubCategoria) producto.Subcategoria = await verifySubCategoria({ CategoriaId: RegistroProducto.IdSubCategoria });
    if (RegistroProducto.IdMarca) producto.Marca = await verifyMarca({ Marcaid: RegistroProducto.IdMarca });
    if (RegistroProducto.Descripcion) producto.Descripcion = RegistroProducto.Descripcion;
    await producto.save();
     
    const productosucursal = await Productosucursal.find({
      where:{Producto:{IdProducto:id}}
    })
   if(!productosucursal){
return res.status(404).json({ message: "Producto no encontrado  ninguna sucursal" });
   }
    for(const prod of productosucursal){
      prod.StockMinimo= RegistroProducto.StockMinimo;
      await prod.save();
    }
    // IDs enviados desde el front (o vacío si no mandaron nada)
const idsEnviadosMedida = RegistroProducto.Productomedida?.map((pm: any) => pm.IdProductomedida)
  .filter((id: any) => id !== undefined) || [];

// Todas las medidas actuales en BD
const medidasActuales = producto.Productomedida || [];

if (!RegistroProducto.Productomedida || RegistroProducto.Productomedida.length === 0) {
  // Caso: no se envió nada → eliminar todas
  for (const medida of medidasActuales) {
    await Productomedida.delete({ IdProductoMedida: medida.IdProductoMedida });
  }
} else {
  // Caso: sí se enviaron medidas → eliminar las que no estén en idsEnviados
  const medidasAEliminar = medidasActuales.filter(
    (pm: any) => !idsEnviadosMedida.includes(pm.IdProductoMedida)
  );

  for (const medida of medidasAEliminar) {
    await Productomedida.delete({ IdProductoMedida: medida.IdProductoMedida });
  }

  // Crear o actualizar las medidas que vinieron
  for (const medida of RegistroProducto.Productomedida) {
    await updateProductoMedida({
      IdProductomedida: medida.IdProductomedida,
      IdProducto: id,
      IdUnidadMedida: medida.IdUnidadMedida,
      Cantidad:  medida.Cantidad,
      Precio: medida.Precio,
      PrecioMayor: medida.PrecioMayor,
  
    });
  }
}
    if (RegistroProducto.Paquete && RegistroProducto.Paquete.length > 0) {
      for (const paquete of RegistroProducto.Paquete)
        await updatePaquete({
          IdPaquete: paquete.IdPaquete, IdProducto: producto.IdProducto, IdUnidadMedida: paquete.IdUnidadMedida, Nombre: paquete.Nombre,
          PrecioVenta: paquete.PrecioVenta, Cantidad: paquete.Cantidad, IdEstado: paquete.Estado, IdPresentacion: paquete.IdPresentacion
          , IdImagen: paquete.IdImagen, Url: paquete.Url, StockMinimo:paquete.StockMinimo
        })
    }



    return res.json({
      producto: producto
      , message: "El Producto se actualizó correctamente"
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const verifyProducto = async ({ ProductoId }: { ProductoId: string }) => {

  const existProducto = await Producto.findOne({ where: { IdProducto: ProductoId } });


  if (!existProducto) {
    throw new HttpError(404, `El producto con ID ${ProductoId} no existe.`);
  }

  return existProducto;
};