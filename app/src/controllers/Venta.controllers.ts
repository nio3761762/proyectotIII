import { Request, Response } from "express";
import { Venta } from "../entities/Venta";
import { Detalleventa } from "../entities/DetalleVenta";
import { HttpError } from "../utils/error.handler";
import { verifyUsuario } from "./Usuario.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { createDetalleventa, createDetalleventaPedido, updateDetalleventa, deleteDetalleventaAndRestoreStock, updateDetalleventaPedido } from "./DetalleVenta.controllers";
import { createPago, updatePago } from "./Pago.controllers";
import { AnanirPersona, verifyPersona } from "./Persona.controllers";
import { verifyEstado } from "./Estado.controllers";
import { IncrementProducto, IncrementPaquete, IncrementPromocion } from "./SucursalProducto.controllers";
import { Usuario } from "../entities/Usuario";
import { Between, IsNull, Not, Raw } from "typeorm";
import { verifySucursal } from "./Sucursal.controllers";
import { Producto } from "../entities/Producto";
import { createCelular } from "./Celular.controllers";
import { createDocumento } from "./Documento.controllers";
import { Persona } from "../entities/Persona";

const DataPersona = async (personaData: any) => {
    const persona = await AnanirPersona({
        Nombre: personaData.Nombre,
        ApellidoPaterno: personaData.ApellidoPaterno,
        ApellidoMaterno: personaData.ApellidoMaterno || '',
        FechaDeNacimiento: personaData.FechaDeNacimiento || '',
        IdGenero: personaData.IdGenero,
        email: personaData.email || ''
    });
    console.log(persona)
    if (Array.isArray(personaData.Celulares)) {
        await Promise.all(
            personaData.Celulares.map((numero: any) =>
                createCelular({ Numero: numero.Numero, PersonaId: persona.IdPersona })
            )
        );
    }
    if (Array.isArray(personaData.Documento)) {
        await Promise.all(
            personaData.Documento
                .filter((doc: any) => doc.Documento && doc.Documento.trim() !== "")
                .map((doc: any) =>
                    createDocumento({
                        IdTipoDocumento: doc.IdTipoDocumento,
                        IdComplemento: doc.IdComplemento,
                        Documentos: doc.Documento,
                        PersonaId: persona.IdPersona
                    })
                )
        );
    }
    
    const existePersona = await Persona.findOne({
      where:{IdPersona:persona.IdPersona}
    })
    if (existePersona)
    console.log(existePersona, 'existe')

    return persona.IdPersona;
};



export const getVentas = async (req: Request, res: Response) => {
  try {

    const ventas = await Venta.find({
      relations:
        [
          "Estado",
          "Usuario",
          "Usuario.Usuariosucursal",
          "Usuario.Usuariosucursal.Sucursal"
        ]
    });
    return res.json(ventas)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    }
  }
}


export const verifyVenta = async ({ VentaId }: { VentaId: string }) => {

  const existVenta = await Venta.findOne({ where: { IdVenta: VentaId } });


  if (!existVenta) {
    throw new HttpError(404, `El Metodo Venta con ID ${VentaId} no existe.`);
  }

  return existVenta;
};


export const registrarVenta = async (req: Request, res: Response) => {
  try {
    const { ventas, detalles } = req.body;
    const nuevoId = await generarIdSecuencial('V');
    const venta = new Venta();
    venta.IdVenta = nuevoId;
      if (ventas.Nombre) {
            ventas.IdCliente = await DataPersona(ventas)
        }
    if (ventas.IdCliente) venta.Persona = await verifyPersona({ PersonaId: ventas.IdCliente });
    venta.Usuario = await verifyUsuario({ UsuarioId: ventas.IdUsuario });
    if (ventas.IdSucursal) venta.Sucursal = await verifySucursal({ SucursalId: ventas.IdSucursal })
    const fechaHoraActual = new Date();
    venta.FechaVenta = fechaHoraActual;
    venta.HoraVenta = fechaHoraActual.toTimeString().slice(0, 8);
    venta.Estado = await verifyEstado({ EstadoId: 3 });
    await venta.save();
    await createPago({ IdVenta: nuevoId, Monto: ventas.Monto, Cambio: ventas.Cambio, IdMetodoPago: ventas.IdMetodoPago })


    if (detalles) {
      if (detalles.Producto && detalles.Producto.length > 0) {
        for (const producto of detalles.Producto) {
          await createDetalleventa({
            IdPromocion: '',
            IdProducto: producto.id,
            Cantidad: producto.Cantidad,
            IdPaquete: '',
            IdVenta: nuevoId,
            Precio: producto.precioUnitario.toFixed(2),
            IdSucursal: ventas.IdSucursal,
            Modo: producto.Modo
          });
        }
      }
      if (detalles.Paquete && detalles.Paquete.length > 0) {
        for (const paquete of detalles.Paquete) {
          await createDetalleventa({
            IdPromocion: '',
            IdProducto: '',
            Cantidad: paquete.Cantidad,
            IdPaquete: paquete.id,
            IdVenta: nuevoId,
            Precio: paquete.precioUnitario.toFixed(2),
            IdSucursal: ventas.IdSucursal,
            Modo: paquete.Modo
          });
        }
      }
      if (detalles.Promocion && detalles.Promocion.length > 0) {
        for (const promocion of detalles.Promocion) {
          await createDetalleventa({
            IdPromocion: promocion.id,
            IdProducto: '',
            Cantidad: promocion.Cantidad,
            IdPaquete: '',
            IdVenta: nuevoId,
            Precio: promocion.precioUnitario.toFixed(2),
            IdSucursal: ventas.IdSucursal,
            Modo: promocion.Modo
          });
        }
      }
    }

    res.status(201).json({ message: "La venta se registro correctamente" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
};


export const updateVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ventas, detalles } = req.body;

    const venta = await Venta.findOne({
      where: { IdVenta: id }
    });

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    if (ventas.IdCliente) venta.Persona = await verifyPersona({ PersonaId: ventas.IdCliente });
    const fechaHoraActual = new Date();
    venta.FechaVenta = fechaHoraActual;
    venta.HoraVenta = fechaHoraActual.toTimeString().slice(0, 8);

    await venta.save();

    await updatePago({ IdVenta: venta.IdVenta, IdPago: ventas.IdPago, Monto: ventas.Monto, Cambio: ventas.Cambio, IdMetodoPago: ventas.IdMetodoPago });

    // Fetch existing details for this venta
    const existingDetalles = await Detalleventa.find({
      where: { Venta: { IdVenta: id } },
      relations: ["Producto", "Paquete", "Promocion"]
    });

    // Collect IDs of incoming details
    const incomingDetalleIds = new Set<string>();
    if (detalles.Producto) {
      detalles.Producto.forEach((p: any) => {
        if (p.IdDetalleVenta) incomingDetalleIds.add(p.IdDetalleVenta);
      });
    }
    if (detalles.Paquete) {
      detalles.Paquete.forEach((p: any) => {
        if (p.IdDetalleVenta) incomingDetalleIds.add(p.IdDetalleVenta);
      });
    }
    if (detalles.Promocion) {
      detalles.Promocion.forEach((p: any) => {
        if (p.IdDetalleVenta) incomingDetalleIds.add(p.IdDetalleVenta);
      });
    }

    // Identify and delete details that are no longer present in the incoming request
    for (const existingDetalle of existingDetalles) {
      if (!incomingDetalleIds.has(existingDetalle.IdDetalleVenta)) {
        await deleteDetalleventaAndRestoreStock({
          Iddetalle: existingDetalle.IdDetalleVenta,
          IdSucursal: ventas.IdSucursal // Assuming IdSucursal is available in ventas
        });
      }
    }

    if (detalles) {
      if (detalles.Producto && detalles.Producto.length > 0) {
        for (const producto of detalles.Producto) {
          await updateDetalleventa({
            Iddetalle: producto.IdDetalleVenta,
            IdPromocion: '',
            IdProducto: producto.id,
            Cantidad: producto.Cantidad,
            IdPaquete: '',
            IdVenta: venta.IdVenta,
            Precio: producto.precioUnitario.toFixed(2),
            IdSucursal: ventas.IdSucursal,
            Modo: producto.Modo
          });
        }
      }
      if (detalles.Paquete && detalles.Paquete.length > 0) {
        for (const paquete of detalles.Paquete) {
          await updateDetalleventa({
            Iddetalle: paquete.IdDetalleVenta,
            IdPromocion: '',
            IdProducto: '',
            Cantidad: paquete.Cantidad,
            IdPaquete: paquete.id,
            IdVenta: venta.IdVenta,
            Precio: paquete.precioUnitario.toFixed(2),
            IdSucursal: ventas.IdSucursal,
            Modo: paquete.Modo
          });
        }
      }
      if (detalles.Promocion && detalles.Promocion.length > 0) {
        for (const promocion of detalles.Promocion) {
          await updateDetalleventa({
            Iddetalle: promocion.IdDetalleVenta,
            IdPromocion: promocion.id,
            IdProducto: '',
            Cantidad: promocion.Cantidad,
            IdPaquete: '',
            IdVenta: venta.IdVenta,
            Precio: promocion.precioUnitario.toFixed(2),
            IdSucursal: ventas.IdSucursal,
            Modo: promocion.Modo
          });
        }
      }
    }

    res.status(201).json({ message: "La venta se actualizo correctamente" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
};


export const agregarClienteVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ventas } = req.body;

    const venta = await Venta.findOne({
      where: { IdVenta: id },
       relations:["Persona"]
    });
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }
    
    if (ventas.Nombre && venta.Persona === null && !ventas.IdCliente) {
            ventas.IdCliente = await DataPersona(ventas);
            console.log( ventas.IdCliente)
        } 
    if (ventas.IdCliente) venta.Persona = await verifyPersona({ PersonaId: ventas.IdCliente });

    await venta.save();

   
    // Collect IDs of incoming details
  

  
    res.status(201).json({ message: "La venta se actualizo correctamente" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
};
export const anularVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { IdSucursal } = req.body;
    const venta = await Venta.findOne({
      where: { IdVenta: id },
      relations: [
        "Detalleventa", "Usuario"
      ]
    });
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }
    console.log(venta.Detalleventa)
    for (const detalle of venta.Detalleventa) {

      const cantidad = detalle.Cantidad;

      const obtenerDetalle = await Detalleventa.findOne({
        where: { IdDetalleVenta: detalle.IdDetalleVenta },
        relations: [
          "Producto",
          "Paquete",
          "Promocion",
        ]
      });
      if (!obtenerDetalle) {
        return res.status(404).json({ message: "Detalles de la venta no encontrada" });
      }

      if (obtenerDetalle.Producto) {
        await IncrementProducto({
          SucursalId: IdSucursal,
          ProductoId: obtenerDetalle.Producto.IdProducto,
          Cantidad: cantidad
        });
      } else if (obtenerDetalle.Paquete) {
        await IncrementPaquete({
          SucursalId: IdSucursal,
          PaqueteId: obtenerDetalle.Paquete.IdPaquete,
          Cantidad: cantidad
        });
      } else if (obtenerDetalle.Promocion) {
        await IncrementPromocion({
          SucursalId: IdSucursal,
          PromocionId: obtenerDetalle.Promocion.IdPromocion,
          Cantidad: cantidad
        });
      }
    }
    venta.Estado = await verifyEstado({ EstadoId: 5 });
    await venta.save();

    res.status(200).json({ message: "Venta anulada correctamente y stock restaurado." });

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const getVentasTodasSucursal = async (req: Request, res: Response) => {
  try {
    //  const { fecha } = req.params;

    // console.log("Fecha recibida:", fecha);
    // const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
    // const inicioDia = new Date(`${fechaStr}T00:00:00`);
    // const finDia = new Date(`${fechaStr}T23:59:59.999`);

    let ventas = await Venta.find({
      //   where: { FechaVenta: Between(inicioDia, finDia) },
      relations: [
        "Pago",
        "Pago.Metodopago",
        "Persona",
        "Detalleventa",
        "Detalleventa.Producto",
        "Detalleventa.Paquete",
        "Detalleventa.Promocion",
        "Usuario",
        "Sucursal"]
    });
    return res.json(ventas)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    }
  }
}

export const getVentasSucursal = async (req: Request, res: Response) => {
  try {
    const { id, fecha, pago } = req.params;

    console.log("Fecha recibida:", fecha);
    const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
    const inicioDia = new Date(`${fechaStr}T00:00:00`);
    const finDia = new Date(`${fechaStr}T23:59:59.999`);

   let ventas = await Venta.find({
  where: {
    FechaVenta: Raw(alias => `${alias} IS NOT NULL AND ${alias} BETWEEN :inicio AND :fin`, {
      inicio: inicioDia,
      fin: finDia
    })
  },
  relations: [
    "Estado",
    "Persona",
    "Detalleventa",
    "Detalleventa.Producto",
    "Detalleventa.Paquete",
    "Detalleventa.Promocion",
    "Usuario",
    "Sucursal",
    "Pago",
    "Pago.Metodopago"
  ]
});


    const ventasFiltradas = ventas.filter(v =>
     (
    id === "TODOS" || v.Sucursal?.IdSucursal === id || // sucursal específica
    (id === "TODOS" && v.Sucursal == null) // incluir null si es TODOS
  )   &&
      (Number(pago) == 0 || v.Pago?.some(p => p.Metodopago?.IdMetodoPago == Number(pago)))
    );
    return res.json(ventasFiltradas)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    }
  }
}

export const getVentasUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Fecha } = req.body;
    const ventas = await Venta.find({
      where: {
        Usuario: { IdUsuario: id },
        FechaVenta: Fecha
      },
      relations:
        [
          "Estado",
          "Pago",
          "Persona",
          "Detalleventa",
          "Detalleventa.Producto",
          "Detalleventa.Paquete",
          "Detalleventa.Promocion"
        ]
    });
    return res.json(ventas)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    }
  }
}

export const createVenta = async (ventasData: any, detallesData: any): Promise<Venta> => {
  try {
    const nuevoId = await generarIdSecuencial('V');
    console.log(ventasData)
    const venta = new Venta();
    venta.IdVenta = nuevoId;
    if (ventasData.IdCliente) venta.Persona = await verifyPersona({ PersonaId: ventasData.IdCliente });
    if (ventasData.IdUsuario) venta.Usuario = await verifyUsuario({ UsuarioId: ventasData.IdUsuario });
    if (ventasData.IdSucursal !== 'TODOS') venta.Sucursal = await verifySucursal({ SucursalId: ventasData.IdSucursal })
    const fechaHoraActual = new Date();
    venta.FechaVenta = fechaHoraActual;
    venta.HoraVenta = fechaHoraActual.toTimeString().slice(0, 8);
    venta.Estado = await verifyEstado({ EstadoId: 4 });


    await venta.save();

    if (ventasData.pago.Monto !== 0 && (ventasData.pago.Cambio === 0 || ventasData.pago.Cambio !== 0))
      await createPago({ IdVenta: nuevoId, Monto: ventasData.pago.Monto, Cambio: ventasData.pago.Cambio, IdMetodoPago: ventasData.pago.IdMetodoPago })



    return venta;
  } catch (error) {
    throw error;
  }
};

export const ActualizarVenta = async (ventasData: any, detallesData: any): Promise<Venta> => {
  try {
    // Buscar la venta
    console.log("actualizar precio "+ventasData)
    const venta = await Venta.findOne({
      where: { IdVenta: ventasData.IdVenta },
    });
    if (!venta) throw new HttpError(404, "Venta no encontrada");

    // Actualizar cliente y tipo de venta
    if (ventasData.IdCliente) {
      venta.Persona = await verifyPersona({ PersonaId: ventasData.IdCliente });
    }

    await venta.save();

    // Actualizar pago
     if (ventasData.pago.Monto !== 0 && (ventasData.pago.Cambio === 0 || ventasData.pago.Cambio !== 0))
    await updatePago({
      IdVenta: venta.IdVenta,
      IdPago: ventasData.pago.IdPago,
      Monto: ventasData.pago.Monto,
      Cambio: ventasData.pago.Cambio,
      IdMetodoPago: ventasData.pago.IdMetodoPago,
    });


    return venta;

  } catch (error) {
    throw error;
  }
};


