import { Raw } from "typeorm/find-options/operator/Raw";
import { Compra } from "../entities/Compra";
import { Detallecompra } from "../entities/DetalleCompra";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyComprobante } from "./Comprobante.controllers";
import { createDetalleCompra, deleteDetalleCompraAndRestoreStock, updateDetalleCompra } from "./Detallecompra.controllers";
import { verifyEstado } from "./Estado.controllers";
import { verifyProveedor } from "./Proveedor.controllers";
import { verifyTipoproveedor } from "./TipoProveedor.controllers";
import { Request, Response } from "express";

export const verifyCompra = async ({ PaqueteId }: { PaqueteId: string }) => {
  const existPaquete = await Compra.findOne({ where: { IdCompra: PaqueteId } });

  if (!existPaquete) {
    throw new HttpError(404, `La compra con ID ${PaqueteId} no existe.`);
  }

  return existPaquete;
};

export const registrarCompra = async (req: Request, res: Response) => {
  try {
    const { Compras, detalles } = req.body;
    const nuevoId = await generarIdSecuencial('COM');

    const compra = new Compra();
    compra.IdCompra = nuevoId;
    if (Compras.IdProveedor) compra.Proveedor = await verifyProveedor({ TipoproveedorId: Compras.IdProveedor });
    compra.FechaCompra = new Date();
    compra.NroComprobante = Compras.Numero;
    compra.Comprobante = await verifyComprobante({ TipoId: Compras.Comprobante })
    compra.Estado = await verifyEstado({EstadoId:1})
    await compra.save();


    if (detalles && detalles.length > 0) {
      for (const producto of detalles) {
        await createDetalleCompra({ IdCompra: nuevoId, Cantidad: producto.Cantidad, IdMedida: producto.IdMedida, Descripcion: producto.IdMedida, Precio: Number(producto.Precio), Fecha:producto.Fecha })
      }
    }

    res.status(201).json({ message: "La Compra se registro correctamente" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
};


export const updateCompra = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Compras, detalles } = req.body;

    const compra = await Compra.findOne({
      where: { IdCompra: id }
    });

    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }
    if (Compras.IdProveedor) compra.Proveedor = await verifyProveedor({ TipoproveedorId: Compras.IdProveedor });
    compra.FechaCompra = new Date();
    compra.NroComprobante = Compras.Numero;
    compra.Comprobante = await verifyComprobante({ TipoId: Compras.Comprobante })

    await compra.save();


    // Fetch existing details for this Compra
    const existingDetalles = await Detallecompra.find({
      where: { Compra: { IdCompra: id } },
      relations: ["Productomedida"]
    });

    // Collect IDs of incoming details
    const incomingDetalleIds = new Set<string>();
    if (detalles) {
      detalles.forEach((p: any) => {
        if (p.IdDetalleCompra) incomingDetalleIds.add(p.IdDetalleCompra);
      });
    }
    // Identify and delete details that are no longer present in the incoming request
    for (const existingDetalle of existingDetalles) {
      if (!incomingDetalleIds.has(existingDetalle.IdDetalleCompra)) {
        await deleteDetalleCompraAndRestoreStock({
          Iddetalle: existingDetalle.IdDetalleCompra,
        });
      }
    }
    if (detalles && detalles.length > 0)
      for (const producto of detalles) {
        await updateDetalleCompra({ IdDetalle: producto.IdDetalle, IdCompra: compra.IdCompra, Cantidad: producto.Cantidad, IdMedida: producto.IdMedida, Descripcion: producto.IdMedida, Precio: Number(producto.Precio), Fecha:producto.Fecha  })
      }
    res.status(201).json({ message: "La Compra se actualizo correctamente" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
};


export const anularCompra = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const compra = await Compra.findOne({
      where: { IdCompra: id }
    });

    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }
     compra.Estado = await verifyEstado({EstadoId:5}) 

    await compra.save();


    // Fetch existing details for this Compra
    res.status(201).json({ message: "La Compra se anulo correctamente" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
};


export const getCompras = async (req: Request, res: Response) => {
  try {
     const { fecha } = req.params;

    console.log("Fecha recibida:", fecha);
    const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
    const inicioDia = new Date(`${fechaStr}T00:00:00`);
    const finDia = new Date(`${fechaStr}T23:59:59.999`);

    const pagos = await Compra.find({
      where: {
          FechaCompra: Raw(alias => `${alias} IS NOT NULL AND ${alias} BETWEEN :inicio AND :fin`, {
            inicio: inicioDia,
            fin: finDia
          })
        },
      relations:
        [
          "Estado",
          "Proveedor",
          "Proveedor.Persona",
          "Comprobante",
          "Detallecompra",
          "Detallecompra.Productomedida",
           "Detallecompra.Productomedida.Unidadmedida",
            "Detallecompra.Productomedida.Unidadmedida.Categoria",
          "Detallecompra.Productomedida.Producto",
          "Detallecompra.Productomedida.Producto.Marca"
        ]
    });
    return res.json(pagos)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    }
  }
}

export const getCompra = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const pagos = await Compra.findOne({ 
      where:{IdCompra:id},
      relations:
        [
          "Proveedor",
          "Proveedor.Persona",
          "Comprobante",
          "Detallecompra",
          "Detallecompra.Productomedida"
        ]
    });
    return res.json(pagos)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    }
  }
}