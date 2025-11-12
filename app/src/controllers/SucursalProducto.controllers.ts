import { Request, Response } from "express"
import { HttpError } from "../utils/error.handler";
import { Productosucursal } from "../entities/ProductoSucursal";
import { verifyProducto } from "./Producto.controllers";
import { verifySucursal } from "./Sucursal.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Presentacionproducto } from "../entities/Presentacionproducto";
import { Promocion } from "../entities/Promocion";
import { verifyPaquete } from "./Presentacionproducto.controllers";
import { updateProductostock } from "./Productostock.controllers";

const updateStockAlert = (productoSucursal: Productosucursal) => {
  if (productoSucursal.Cantidad <= productoSucursal.StockMinimo) {
    if (!productoSucursal.FechaAlertaStock) {
      productoSucursal.FechaAlertaStock = new Date();
    }
  } else {
    productoSucursal.FechaAlertaStock = null;
  }
};

export const createSucursalProducto = async (
  { SucursalId, ProductoId,stockminimo }: { SucursalId: string, ProductoId: string, stockminimo:number }
) => {
  const nuevoId = await generarIdSecuencial('PS');

  const productosucursal = new Productosucursal();
  productosucursal.IdProductoSucursal = nuevoId;
  productosucursal.Cantidad = 0;
  productosucursal.StockMinimo = stockminimo;
  const producto = await verifyProducto({ ProductoId });
  if (producto) {
    productosucursal.Producto = producto;
  } else {
    const paquete = await verifyPaquete({ PaqueteId: ProductoId });
    if (paquete) {
      productosucursal.Paquete = paquete;
    } else {
      throw new Error(`El id ${ProductoId} no corresponde a un Producto ni a un Paquete.`);
    }
  }
  productosucursal.Sucursal = await verifySucursal({ SucursalId });
  productosucursal.Fecha = new Date();

  await productosucursal.save();

  return productosucursal;
};

export const IncrementProductosucursal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { RegistroProducto } = req.body;

        let nuevaCantidad=0;
        const existProductosucursal = await verifyProductosucursal({ ProductosucursalId: id });
        if (typeof RegistroProducto.Cantidad === 'number' && !isNaN(RegistroProducto.Cantidad)) {
             nuevaCantidad = existProductosucursal.Cantidad + RegistroProducto.Cantidad;
              console.log("entrda de cantidad", nuevaCantidad)
            if (nuevaCantidad < 0)
                return res.status(404).json({ message: "La cantidad no puede ser menor que cero" });

            
        }
        if(existProductosucursal.Paquete){
        
        const cantidaproducto = await Productosucursal.findOne({
          where:{Producto:{IdProducto:existProductosucursal.Paquete.Producto.IdProducto}, Sucursal:{IdSucursal:existProductosucursal.Sucursal.IdSucursal}}
        , relations:["Producto", "Sucursal"]
        }) 
         if (!cantidaproducto)
                return res.status(404).json({ message: "No existe dicha relacion" });

        cantidaproducto.Cantidad =  cantidaproducto.Cantidad - (RegistroProducto.Cantidad * existProductosucursal.Paquete.Cantidad)
        updateStockAlert(cantidaproducto);
        await cantidaproducto.save();
        existProductosucursal.Fecha = new Date();
        
        await existProductosucursal.save();
       }else{
        if (RegistroProducto.IdProducto) existProductosucursal.Producto = await verifyProducto({ ProductoId: RegistroProducto.IdProducto });
        existProductosucursal.Fecha = new Date();
        const differiencia = RegistroProducto.Cantidad - existProductosucursal.Cantidad;
           await updateProductostock({sucursalId:existProductosucursal.Sucursal.IdSucursal,productoId:RegistroProducto.IdProducto,cantidad:differiencia});
           existProductosucursal.Cantidad = nuevaCantidad;
           updateStockAlert(existProductosucursal);
        await existProductosucursal.save();
       }
        return res.status(200).json({ message: "Actualizacion de stock exitos" });

    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const IncrementProductoCantidad = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { RegistroProducto } = req.body;


        const existProductosucursal = await verifyProductosucursal({ ProductosucursalId: id });
        if (typeof RegistroProducto.Cantidad === 'number' && !isNaN(RegistroProducto.Cantidad)) {
             if (RegistroProducto.Cantidad < 0)
                return res.status(404).json({ message: "La cantidad no puede ser menor que cero" });

           
        }
       if(existProductosucursal.Paquete){
        
        const cantidaproducto = await Productosucursal.findOne({
          where:{Producto:{IdProducto:existProductosucursal.Paquete.Producto.IdProducto},
        Sucursal:{IdSucursal:existProductosucursal.Sucursal.IdSucursal}}
        }) 
        
         if (!cantidaproducto)
                return res.status(404).json({ message: "No existe dicha relacion" });
        cantidaproducto.Cantidad = ((existProductosucursal.Cantidad * existProductosucursal.Paquete.Cantidad) +cantidaproducto.Cantidad) - (RegistroProducto.Cantidad * existProductosucursal.Paquete.Cantidad)
        updateStockAlert(cantidaproducto);
        await cantidaproducto.save();
         existProductosucursal.Cantidad = RegistroProducto.Cantidad;
        existProductosucursal.Fecha = new Date();
        updateStockAlert(existProductosucursal);
        await existProductosucursal.save();
       }else{
        if (RegistroProducto.IdProducto) existProductosucursal.Producto = await verifyProducto({ ProductoId: RegistroProducto.IdProducto });
        const differiencia =RegistroProducto.Cantidad - existProductosucursal.Cantidad;
        existProductosucursal.Cantidad = RegistroProducto.Cantidad;
        existProductosucursal.Fecha = new Date();
        
        await updateProductostock({sucursalId:existProductosucursal.Sucursal.IdSucursal,productoId:RegistroProducto.IdProducto,cantidad:differiencia });
        updateStockAlert(existProductosucursal);
        await existProductosucursal.save();
      }
        return res.status(200).json({ message: "Actualizacion de stock exitos" });

    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyProductosucursal = async ({ ProductosucursalId }: { ProductosucursalId: string }) => {
    const existProductosucursal = await Productosucursal.findOne({ 
      where: { IdProductoSucursal: ProductosucursalId },
      relations:["Sucursal","Paquete","Paquete.Producto","Producto"] });
    if (!existProductosucursal) {
        throw new HttpError(404, `El Producto de la sucursal con ID ${ProductosucursalId} no existe.`);
    }
    return existProductosucursal;
};

export const getProductosBySucursal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productosSucursal = await Productosucursal.find({
            where: {
                Sucursal: { IdSucursal: id } as any,
            },
            relations: [
         'Producto',
         'Producto.Tipoproducto', 
         'Producto.Subcategoria', 
         'Producto.Subcategoria.Categoria', 
         'Producto.Precio', 
         'Producto.Imagen',
         'Producto.Paquete',
         'Producto.Presentacionproducto.Estado',
         'Producto.Presentacionproducto.Unidadmedida',
         'Producto.Productosucursal',
         'ProductoProductosucursal.Sucursal'],
        });

        if (!productosSucursal)
            return res.status(404).json('Sucursal sin productos');

        return res.json({ productosSucursal });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const ObtenerSucursalproducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productosSucursal = await Productosucursal.findOne({
            where: {
              IdProductoSucursal: id 
            },
        });

        if (!productosSucursal)
            return res.status(404).json('Sin relacion a un producto');

        return res.json( productosSucursal );

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
export const getAllProductsWithSummedQuantities = async (req: Request, res: Response) => {
  try { 
     const { categoriaId, subcategoriaId } = req.params;
    const allProductoSucursal = await Productosucursal.find({
      where: { 
        Producto: { Tipoproducto: { IdTipoProducto: 'ITP-2' } }
      },  
      relations: [
        'Sucursal',    
        'Producto',
        'Producto.Estado',
        'Producto.Subcategoria', 
        'Producto.Subcategoria.Categoria', 
        'Producto.Imagen',
      ],
    });

    if (!allProductoSucursal.length) {
      return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
    }

    // Transformar datos para dejar solo los IDs pedidos
     const productoFiltradas = allProductoSucursal.filter(v =>
      (categoriaId === "TODOS" || v.Producto?.Subcategoria.Categoria.IdCategoria === categoriaId) &&
      (subcategoriaId === "TODOS" || v.Producto?.Subcategoria.IdSubCategoria === subcategoriaId)&& v.Producto !== null
    );
    const result = productoFiltradas.map(ps => {
      return {
        ...ps,
        Sucursal: ps.Sucursal?.IdSucursal ?? null,  // 👈 solo IdSucursal
        Producto: {
          ...ps.Producto,
          Estado: ps.Producto.Estado?.IdEstado ?? null, // 👈 solo IdEstado
          Productomedida: ps.Producto.Productomedida?.map(pm => ({
            IdProductomedida: pm.IdProductoMedida,   // 👈 id directo
            Unidadmedida: pm.Unidadmedida?.IdUnidadMedida ?? null, // 👈 solo id
          })) || []
        }
      }
    });

    return res.json(result);

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Ocurrió un error desconocido." });
  }
};

export const getAllPaquetsWithSummedQuantities = async (req: Request, res: Response) => {
  try { 
    const {id} = req.params
     const allProductoSucursal = await Productosucursal.find({
       
      relations: [
        'Sucursal',    
        'Paquete',
        'Paquete.Producto',
        'Paquete.Imagen',
      ],
    });

    if (!allProductoSucursal.length) {
      return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
    }

    // Transformar datos para dejar solo los IDs pedidos
     const productoFiltradas = allProductoSucursal.filter(v =>
      (id === "TODOS" || v.Sucursal?.IdSucursal === id) && 
      v.Paquete !== null
    );
    const result = productoFiltradas.map(ps => {
      return {
        ...ps,
        Sucursal: ps.Sucursal?.IdSucursal ?? null,  // 👈 solo IdSucursal
        Paquete: {
          ...ps.Paquete,
         // Estado: ps.Paquete.Estado?.IdEstado ?? null, // 👈 solo IdEstado
        }
      }
    });

    return res.json(result);

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Ocurrió un error desconocido." });
  }
};

export const getUniquePackagesWithSummedQuantities = async (req: Request, res: Response) => {
  try {
    const { id } = req.query; // This 'id' can be a SucursalId or "TODOS"

    const allProductoSucursal = await Productosucursal.find({
      relations: [
        'Sucursal',
        'Paquete',
        'Paquete.Producto',
        'Paquete.Imagen',
      ],
    });

    if (!allProductoSucursal.length) {
      return res.status(404).json({ message: "No se encontraron productos con cantidades en ninguna sucursal." });
    }

    let productoFiltradas = allProductoSucursal.filter(v => v.Paquete !== null);

    if (id !== "TODOS") {
      productoFiltradas = productoFiltradas.filter(v => v.Sucursal?.IdSucursal === id);
    }

    const uniquePackages = new Map<string, any>();

    for (const ps of productoFiltradas) {
      if (ps.Paquete) {
        const paqueteId = ps.Paquete.IdPaquete;
        if (uniquePackages.has(paqueteId)) {
          // If package already exists, sum the quantities
          const existingPackage = uniquePackages.get(paqueteId);
          existingPackage.Cantidad += ps.Cantidad;
          uniquePackages.set(paqueteId, existingPackage);
        } else {
          // If package is new, add it to the map
          uniquePackages.set(paqueteId, {
            ...ps,
            // When 'id' is "TODOS", set Sucursal to null or a placeholder to represent aggregation
            // Otherwise, show the specific SucursalId
            Sucursal: id === "TODOS" ? null : (ps.Sucursal?.IdSucursal ?? null),
            Paquete: {
              ...ps.Paquete,
            }
          });
        }
      }
    }

    const result = Array.from(uniquePackages.values());

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
    const { id } = req.params;
    const producto = await Promocion.find({
      where: { 
        Promocionproducto:{Producto:{IdProducto: id },
          Estado: { IdEstado: 1 }},
          Estado: { IdEstado: 1 }
      },
      relations: ['Promocionproducto','Promocionproducto.Producto','Promocionproducto.Estado']
    });

    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    return res.json(producto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const DecrementProducto = async ({ SucursalId, ProductoId, Cantidad }: { SucursalId: string, ProductoId: string, Cantidad: number }) => {

   const existProductosucursal = await Productosucursal.findOne({
  where: {
    Sucursal: { IdSucursal: SucursalId },
    Producto: { IdProducto: ProductoId }
  },
  relations: ['Sucursal', 'Producto']  // si necesitas acceder a los datos relacionados
});
console.log(ProductoId,existProductosucursal)
      if (!existProductosucursal) {
        throw new HttpError(404, `El Producto de la sucursal con ID ${SucursalId} no existe.`);
    }
   if(existProductosucursal.Cantidad - Cantidad < 0 )
         throw new HttpError(404, `La cantidad del Stock es insuficiente`);
   
   existProductosucursal.Cantidad -= Cantidad;
    updateStockAlert(existProductosucursal);
  
   await existProductosucursal.save();  

     return existProductosucursal;
};

export const DecrementPaquete = async ({ SucursalId, Cantidad,PaqueteId }: { SucursalId: string, Cantidad: number,PaqueteId:string }) => {

 const existPaquete = await Presentacionproducto.findOne({
  where: {
  IdPaquete:PaqueteId,
  },
  relations: ['Producto']  // si necesitas acceder a los datos relacionados
});

console.log(PaqueteId,existPaquete)
   if (!existPaquete) {
        throw new HttpError(404, `El Producto en el paquete con ID ${PaqueteId} no existe.`);
    }
 const existProductosucursal = await Productosucursal.findOne({
  where: {
    Sucursal: { IdSucursal: SucursalId },
    Paquete: { IdPaquete: PaqueteId }
  },
  relations: ['Sucursal', 'Producto']  // si necesitas acceder a los datos relacionados
});
      if (!existProductosucursal) {
        throw new HttpError(404, `El Producto de la sucursal con ID ${SucursalId} no existe.`);
    }
   
   if(existProductosucursal.Cantidad - (Cantidad) < 0 )
         throw new HttpError(404, `La cantidad del Stock es insuficiente`);
   
   existProductosucursal.Cantidad -= (Cantidad)
    updateStockAlert(existProductosucursal);
  
   await existProductosucursal.save();  

     return existProductosucursal;
};

// export const createProductoSucursal = async ({ SucursalId, ProductoId }: { SucursalId: string, ProductoId:string }) => {



// const existProductosucursal = new Productosucursal();
  
//   existProductosucursal.Sucursal= await verifySucursal({SucursalId:SucursalId});
//   existProductosucursal.Producto= await verifyProducto({ProductoId:ProductoId});
//   existProductosucursal.Fecha = new Date();
//   existProductosucursal.Cantidad = 0;
//   existProductosucursal.IdProductoSucursal

//    await existProductosucursal.save();  
// }
 

//      return existProductosucursal;
// };


export const DecrementPromocion = async ({
   SucursalId,
  Cantidad,
  PromocionId,
}: {
  SucursalId: string;
  Cantidad: number;
  PromocionId: string;
}) => {
  // Buscar la promoción
  const existPromocion = await Promocion.findOne({
    where: { IdPromocion: PromocionId },
    relations: [
      "Promocionproducto",
      "Promocionproducto.Paquete",
      "Promocionproducto.Producto",
    ],
  });

  if (!existPromocion) {
    throw new HttpError(404, `La promoción con ID ${PromocionId} no existe.`);
  }

  for (const promotion of existPromocion.Promocionproducto) {
    let productoId: string | null = null;
    let cantidadSumar = 0;

    if (promotion.Paquete) {
      // Si es paquete, buscamos la presentación del producto dentro del paquete
    const existProductosucursal = await Productosucursal.findOne({
  where: {
    Sucursal: { IdSucursal: SucursalId },
    Paquete: { IdPaquete: promotion.Paquete.IdPaquete }
  },
  relations: ['Sucursal', 'Producto']
});
if (!existProductosucursal) {
        throw new HttpError(404, `El Producto de la sucursal con ID ${SucursalId} no existe.`);
    }
   
     

      cantidadSumar = promotion.Cantidad * Cantidad;
      existProductosucursal.Cantidad -= cantidadSumar;
      updateStockAlert(existProductosucursal);
      await existProductosucursal.save();
    } else if (promotion.Producto) {
    const existProductosucursal = await Productosucursal.findOne({
      where: {
        Sucursal: { IdSucursal: SucursalId },
        Producto: { IdProducto: promotion.Producto.IdProducto },
      },
      relations: ["Sucursal", "Producto"],
    });

    if (!existProductosucursal) {
      throw new HttpError(
        404,
        `El producto con ID ${productoId} no existe en la sucursal ${SucursalId}.`
      );
    }

    // Incrementar stock
    cantidadSumar = promotion.Cantidad * Cantidad;
    existProductosucursal.Cantidad -= cantidadSumar;
    updateStockAlert(existProductosucursal);
    await existProductosucursal.save();
    } else {
      throw new HttpError(
        400,
        `El ítem de la promoción no tiene ni producto ni paquete asociado.`
      );
    }

    // Buscar el producto en la sucursal
   
  }

  return existPromocion;
};


export const IncrementProducto = async ({ SucursalId, ProductoId, Cantidad }: { SucursalId: string, ProductoId: string, Cantidad: number }) => {
   const existProductosucursal = await Productosucursal.findOne({
  where: {
    Sucursal: { IdSucursal: SucursalId },
    Producto: { IdProducto: ProductoId }
  },
  relations: ['Sucursal', 'Producto']
});
      if (!existProductosucursal) {
        throw new HttpError(404, `El Producto de la sucursal con ID ${SucursalId} no existe.`);
    }
   
   existProductosucursal.Cantidad += Cantidad;
    updateStockAlert(existProductosucursal);
  
   await existProductosucursal.save();  

     return existProductosucursal;
};

export const IncrementPaquete = async ({ SucursalId, Cantidad,PaqueteId }: { SucursalId: string, Cantidad: number,PaqueteId:string }) => {

 const existPaquete = await Presentacionproducto.findOne({
  where: {
  IdPaquete:PaqueteId,
  },
  relations: ['Producto']
});
   if (!existPaquete) {
        throw new HttpError(404, `El Producto en el paquete con ID ${PaqueteId} no existe.`);
    }
 const existProductosucursal = await Productosucursal.findOne({
  where: {
    Sucursal: { IdSucursal: SucursalId },
    Paquete: { IdPaquete: PaqueteId }
  },
  relations: ['Sucursal', 'Producto']
});
      if (!existProductosucursal) {
        throw new HttpError(404, `El Producto de la sucursal con ID ${SucursalId} no existe.`);
    }
   
   existProductosucursal.Cantidad += (Cantidad)
    updateStockAlert(existProductosucursal);
  
   await existProductosucursal.save();  

     return existProductosucursal;
};


export const IncrementPromocion = async ({ SucursalId, Cantidad, PromocionId }: { SucursalId: string; Cantidad: number; PromocionId: string; }) => {
  // Buscar la promoción
  const existPromocion = await Promocion.findOne({
    where: { IdPromocion: PromocionId },
    relations: [
      "Promocionproducto",
      "Promocionproducto.Paquete",
      "Promocionproducto.Producto",
    ],
  });

  if (!existPromocion) {
    throw new HttpError(404, `La promoción con ID ${PromocionId} no existe.`);
  }

  for (const promotion of existPromocion.Promocionproducto) {
    let productoId: string | null = null;
    let cantidadSumar = 0;

    if (promotion.Paquete) {
      // Si es paquete, buscamos la presentación del producto dentro del paquete
    const existProductosucursal = await Productosucursal.findOne({
  where: {
    Sucursal: { IdSucursal: SucursalId },
    Paquete: { IdPaquete: promotion.Paquete.IdPaquete }
  },
  relations: ['Sucursal', 'Producto']
});
if (!existProductosucursal) {
        throw new HttpError(404, `El Producto de la sucursal con ID ${SucursalId} no existe.`);
    }
   
     

      cantidadSumar = promotion.Cantidad * Cantidad;
      existProductosucursal.Cantidad += cantidadSumar;
      updateStockAlert(existProductosucursal);
      await existProductosucursal.save();
    } else if (promotion.Producto) {
    const existProductosucursal = await Productosucursal.findOne({
      where: {
        Sucursal: { IdSucursal: SucursalId },
        Producto: { IdProducto: promotion.Producto.IdProducto },
      },
      relations: ["Sucursal", "Producto"],
    });

    if (!existProductosucursal) {
      throw new HttpError(
        404,
        `El producto con ID ${productoId} no existe en la sucursal ${SucursalId}.`
      );
    }

    // Incrementar stock
    cantidadSumar = promotion.Cantidad * Cantidad;
    existProductosucursal.Cantidad += cantidadSumar;
    updateStockAlert(existProductosucursal);
    await existProductosucursal.save();
    } else {
      throw new HttpError(
        400,
        `El ítem de la promoción no tiene ni producto ni paquete asociado.`
      );
    }

    // Buscar el producto en la sucursal
   
  }

  return existPromocion;
};


export const IncrementarProductosEnSucursal = async ({ SucursalId, ProductoId, Cantidad }: { SucursalId: string, ProductoId: string, Cantidad: number }) => {
  const existProductosucursal = await Productosucursal.findOne({
  where: [
    { Sucursal: { IdSucursal: SucursalId }, Producto: { IdProducto: ProductoId } },
    { Sucursal: { IdSucursal: SucursalId }, Paquete: { IdPaquete: ProductoId } }
  ],
  relations: ['Sucursal', 'Producto', 'Paquete', 'Paquete.Producto']
});

      if (!existProductosucursal) {
        throw new HttpError(404, `El Producto de la sucursal con ID ${SucursalId} no existe.`);
    }
   if(existProductosucursal.Paquete)
{existProductosucursal.Cantidad += Cantidad;
   
    Cantidad = Cantidad * existProductosucursal.Paquete.Cantidad;
}   
  else{
    existProductosucursal.Cantidad += Cantidad;

  }
   
  await updateProductostock({sucursalId:SucursalId,productoId:ProductoId,cantidad:Cantidad});
   
  updateStockAlert(existProductosucursal);
  await existProductosucursal.save();  

     return existProductosucursal;
};