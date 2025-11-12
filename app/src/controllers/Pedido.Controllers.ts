import { Request, Response } from "express";
import { Pedido } from "../entities/Pedido";
import { verifyEstado } from "./Estado.controllers";
import { ActualizarVenta, createVenta, verifyVenta } from "./Venta.controllers";
import { generarIdSecuencial } from "../utils/idGenerator";
import { Tipopedido } from "../entities/TipoPedido";
import { HttpError } from "../utils/error.handler";
import { Venta } from "../entities/Venta";
import { Detalleventa } from "../entities/DetalleVenta";
import { DecrementPaquete, DecrementProducto, DecrementPromocion, IncrementPaquete, IncrementProducto, IncrementPromocion } from "./SucursalProducto.controllers";
import { createPago, updatePago, verifyPago } from "./Pago.controllers";
import { Between } from "typeorm";
import { createEntrega, updateEntrega } from "./Entrega,controllers";
import { verifyTipoPedido } from "./TipoPedido.controllers";
import { transporter } from "../config/mailer";
import { verifyPersona } from "./Persona.controllers";
import { createDetallePedido, deleteDetallepedidoAndRestoreStock, updateDetallePedido } from "./Detallepedido.controllers";
import { Detallepedido } from "../entities/DetallePedido";
import { createDetalleventa } from "./DetalleVenta.controllers";


export const ObtenerPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const entrega = await Pedido.findOne(
            {
                where: { IdPedido: id },
                relations: ["Tipopedido", "Direccion", "Direccion.Barrio"]
            }
        );
        return res.json(entrega);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getPedidos = async (req: Request, res: Response) => {
    try {

        const pedido = await Pedido.find(
            {
                relations:
                    [
                        "Estado",
                        "Venta",
                        "Tipopedido",
                    ]
            });


        return res.json(pedido)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}

export const registarPedido = async (ventasData: any, detallesData: any): Promise<Pedido> => {
  try {
    const nuevoId = await generarIdSecuencial('PED');
    
    const pedido = new Pedido();
     pedido.IdPedido = nuevoId;
      const venta = await createVenta(ventasData, detallesData);

      pedido.Venta = venta;

        const fechaHoraActual = new Date();
        const fechaLocal = new Date(fechaHoraActual.getTime() - fechaHoraActual.getTimezoneOffset() * 60000);
        pedido.FechaRegistro = fechaLocal;
        pedido.Hora = fechaHoraActual.toTimeString().slice(0, 8);
        const tipopedido = await verifyTipoPedido({ tipo: ventasData.IdTipoPedido });
        pedido.Tipopedido = tipopedido;
        pedido.Estado = (tipopedido.IdTipoPedido === 'ITP-P1') ? await verifyEstado({ EstadoId: 6 }) : await verifyEstado({ EstadoId: 9 });
        pedido.Venta = venta;
        await pedido.save();

          if (detallesData) {
        for (const producto of detallesData) {
          await createDetallePedido({
            IdPromocion: producto.IdPromocion || "",
            IdProducto: producto.IdProducto  || "",
            Cantidad: producto.Cantidad,
            IdPaquete:  producto.IdPaquete  || "",
            IdVenta: nuevoId,
            Precio: producto.Precio.toFixed(2),
            Modo: producto.Modo
          });
        }}
    return pedido;
  } catch (error) {
    throw error;
  }
};

export const actualizarPedido = async (ventasData: any, detallesData: any): Promise<Pedido> => {
  try {
    const pedido = await Pedido.findOne({
      where: { Distribuciones: { IdDistribucion: ventasData.IdDistribucion } },
      relations: ["Venta", "Detallepedido", "Detallepedido.Producto", "Detallepedido.Paquete"]
    });

    if (!pedido) throw new HttpError(404, "Pedido no encontrado");

    // Actualiza la venta asociada
    //await ActualizarVenta(ventasData, detallesData);

    const venta = await Venta.findOne({
      where: { IdVenta: pedido.Venta.IdVenta }
    });

    if (!venta) throw new HttpError(404, "Venta no encontrada");
  
    if(ventasData.IdCliente) 
    venta.Persona = await verifyPersona({PersonaId:ventasData.IdCliente})


    await venta.save();
    // --- SINCRONIZAR DETALLES ---
    await pedido.save();
   
    if (Array.isArray(detallesData)) {
      // 1. Crear un set con los IDs que llegan en la petición
      const nuevosIdsProductos = detallesData.map(d => d.IdProducto).filter(Boolean);
      const nuevosIdsPaquetes = detallesData.map(d => d.IdPaquete).filter(Boolean);

      // 2. Eliminar los que ya no existen
      for (const detalle of pedido.Detallepedido) {
        const sigueExistiendo =
          (detalle.Producto && nuevosIdsProductos.includes(detalle.Producto.IdProducto)) ||
          (detalle.Paquete && nuevosIdsPaquetes.includes(detalle.Paquete.IdPaquete));

        if (!sigueExistiendo) {
          // 👇 eliminas el detalle pedido
          await Detallepedido.remove(detalle);
        }
      }

      // 3. Actualizar o insertar los detalles nuevos
      for (const producto of detallesData) {
        const detalleExistente = pedido.Detallepedido.find(dp =>
          (producto.IdProducto && dp.Producto?.IdProducto === producto.IdProducto) ||
          (producto.IdPaquete && dp.Paquete?.IdPaquete === producto.IdPaquete)
        );

        if (detalleExistente) {
          // --- ACTUALIZAR ---
          await updateDetallePedido({
            Iddetalle: detalleExistente.IdDetallePedido,
            IdProducto: producto.IdProducto || "",
            IdPaquete: producto.IdPaquete || "",
            IdPromocion: producto.IdPromocion || "",
            Cantidad: producto.Cantidad,
            IdVenta: pedido.IdPedido,
            Precio: parseFloat(Number(producto.Precio || 0).toFixed(2)),
            Modo: producto.Modo,
          });
        } else {
          // --- INSERTAR NUEVO ---
          await createDetallePedido({
            IdProducto: producto.IdProducto || "",
            IdPaquete: producto.IdPaquete || "",
            IdPromocion: producto.IdPromocion || "",
            Cantidad: producto.Cantidad,
            IdVenta: pedido.IdPedido,
            Precio: parseFloat(Number(producto.Precio || 0).toFixed(2)),
            Modo: producto.Modo,
          });
        }
      }
    }

   
    return pedido;
  } catch (error) {
    throw error;
  }
};



export const createPedido = async (req: Request, res: Response) => {
    try {
        const { reservas, detalles } = req.body;

        const nuevoId = await generarIdSecuencial('PED');
        const nuevoPedido = new Pedido();
        nuevoPedido.IdPedido = nuevoId;
        console.log(reservas, detalles)
        const venta = await createVenta(reservas, detalles);

        nuevoPedido.Venta = venta;
       
        const fechaHoraActual = new Date();
        const fechaLocal = new Date(fechaHoraActual.getTime() - fechaHoraActual.getTimezoneOffset() * 60000);
        nuevoPedido.FechaRegistro = fechaLocal;
        nuevoPedido.Hora = fechaHoraActual.toTimeString().slice(0, 8);
        const tipopedido = await verifyTipoPedido({ tipo: reservas.IdTipoPedido });
        nuevoPedido.Tipopedido = tipopedido;
        nuevoPedido.Estado = (tipopedido.IdTipoPedido === 'ITP-P1') ? await verifyEstado({ EstadoId: 6 }) : await verifyEstado({ EstadoId: 9 });
        nuevoPedido.Venta = venta;
        await nuevoPedido.save();

        await createEntrega({
            BarrioId: reservas.entrega.barrioId,
            Direccions: reservas.entrega.direccion,
            Referencia: reservas.entrega.referencia,
            Ubicacion: reservas.entrega.ubicacion,
            Costo: reservas.entrega.costoEnvio,
            PedidoID: nuevoId,
            IdSucursal: reservas.IdSucursal,
            Fecha: reservas.entrega.fecha,
            Hora: reservas.entrega.hora,
            tipoe: reservas.IdTipoEntrega
        });
        
         if (detalles) {
        for (const producto of detalles) {
          await createDetallePedido({
            IdPromocion: producto.IdPromocion || "",
            IdProducto: producto.IdProducto  || "",
            Cantidad: producto.Cantidad,
            IdPaquete:  producto.IdPaquete  || "",
            IdVenta: nuevoId,
            Precio: producto.Precio.toFixed(2),
            Modo: producto.Modo
          });
        }
    }

        return res.status(201).json({ message: "El pedido se registró correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyPedido = async ({ tipo }: { tipo: string }) => {

    const existVenta = await Pedido.findOne({ where: { IdPedido: tipo } });


    if (!existVenta) {
        throw new HttpError(404, `El pedido con ID ${tipo} no existe.`);
    }

    return existVenta;
};

export const anularPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findOne({
            where: { IdPedido: id },
            relations: [
                "Estado",
                "Venta",
                "Tipopedido",
                "Entrega"
            ]
        });
        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });

        }

        // if(pedido.Estado.IdEstado === )
        if (pedido.Estado.IdEstado === 8) {
            const detalleventa = await Detalleventa.find({
                where: { Venta: { IdVenta: pedido.Venta.IdVenta } }
                , relations: [
                    "Venta",
                    "Producto",
                    "Paquete",
                    "Promocion"]
            }
            )


            const venta = await Venta.findOne({
                where: { IdVenta: pedido.Venta.IdVenta }
                , relations: [
                    "Persona",
                    "Sucursal",
                ]
            }
            )
            console.log(detalleventa)
            if (!detalleventa) {
                return res.status(404).json({ message: "Los detalles de la venta no encontrados" });

            }
            if (!venta) {
                return res.status(404).json({ message: "Venta no encontrado" });
            }

            if (!venta) {
                throw new HttpError(404, "Venta no encontrada");
            }
            for (const detalle of detalleventa) {
                if (detalle.Producto && detalle.Producto.IdProducto) {
                    await IncrementProducto({
                        SucursalId: venta.Sucursal.IdSucursal,
                        ProductoId: detalle.Producto.IdProducto,
                        Cantidad: detalle.Cantidad
                    });
                }
                if (detalle.Paquete && detalle.Paquete.IdPaquete) {
                    await IncrementPaquete({
                        SucursalId: venta.Sucursal.IdSucursal,
                        PaqueteId: detalle.Paquete.IdPaquete,
                        Cantidad: detalle.Cantidad
                    });
                }
                if (detalle.Promocion && detalle.Promocion.IdPromocion) {
                    await IncrementPromocion({
                        SucursalId: venta.Sucursal.IdSucursal,
                        PromocionId: detalle.Promocion.IdPromocion,
                        Cantidad: detalle.Cantidad
                    });
                }
            }
        }


        pedido.Estado = await verifyEstado({ EstadoId: 5 });
        await pedido.save();

        res.status(200).json({ message: "Pedido anulado correctamente y stock restaurado." });

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const enviarPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data } = req.body;

        const pedido = await Pedido.findOne({
            where: { IdPedido: id },
            relations: [
                "Estado",
                "Venta",
                "Tipopedido",
            ]
        });
        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        const detallepedido = await Detallepedido.find({
            where: { Pedido: { IdPedido: id } }
            , relations: [
                "Pediod",
                "Producto",
                "Paquete",
                "Promocion"]
        }
        )


        const venta = await Venta.findOne({
            where: { IdVenta: pedido.Venta.IdVenta }
            , relations: [
                "Persona",
                "Sucursal",
            ]
        }
        )
        if (!detallepedido) {
            return res.status(404).json({ message: "Los detalles de la venta no encontrados" });

        }
        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrado" });
        }
        console.log(venta)
        const estado = await verifyEstado({ EstadoId: data.IdEstado });
        if (!estado)
            return res.status(404).json({ message: "Pedido no encontrado" });

        if (estado.Nombre === 'En preparación')
            pedido.Estado = estado;
        //            await enviarMensaje({ idPersona: venta.Persona.IdPersona, Mensaje: data.mensajeCorreo })
        if (estado.Nombre === 'Listo')
            pedido.Estado = estado;
        //          await enviarMensaje({ idPersona: venta.Persona.IdPersona, Mensaje: data.mensajeCorreo })
        if (estado.Nombre === 'Enviado') {
            pedido.Estado = estado;
            //await enviarMensaje({ idPersona: venta.Persona.IdPersona, Mensaje: data.mensajeCorreo })
            for (const detalle of detallepedido) {
                  await createDetalleventa({
            IdPromocion: detalle.Paquete.IdPaquete,
            IdProducto: detalle.Producto.IdProducto || "",
            Cantidad: detalle.Cantidad,
            IdPaquete: detalle.Paquete.IdPaquete || "",
            IdVenta: venta.IdVenta,
            Precio: detalle.Precio,
            IdSucursal:venta.Sucursal?.IdSucursal,
            Modo: detalle.Modo
          }); 
                if (detalle.Producto && detalle.Producto.IdProducto) {
                    await DecrementProducto({ ProductoId: detalle.Producto.IdProducto, SucursalId: venta.Sucursal?.IdSucursal, Cantidad: detalle.Cantidad });
                }
                if (detalle.Paquete && detalle.Paquete.IdPaquete) {
                    await DecrementPaquete({ SucursalId: venta.Sucursal?.IdSucursal, Cantidad: detalle.Cantidad, PaqueteId: detalle.Paquete.IdPaquete });
                }
                if (detalle.Promocion && detalle.Promocion.IdPromocion) {
                    await DecrementPromocion({ SucursalId: venta.Sucursal?.IdSucursal, Cantidad: detalle.Cantidad, PromocionId: detalle.Promocion.IdPromocion });
                }
            }
        }

        //    pedido.Estado = estado;

        await pedido.save();

        res.status(200).json({ message: "Correo enviado para que el cliente sigua su pedido." });

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const enviarMensaje = async ({ idPersona, Mensaje }: { idPersona: string, Mensaje: string }) => {

    const persona = await verifyPersona({ PersonaId: idPersona })

    await transporter.sendMail({
        from: '"Recuperación de contraseña" <antoniofernandezt134@gmail.com>',
        to: persona.Email.Email,
        subject: 'Tu PIN de recuperación de contraseña',
        html: `
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Usa el siguiente PIN para continuar:</p>
        <h2 style="text-align: center; font-size: 24px; margin: 20px 0;">${Mensaje}</h2>
        <p>Este PIN es válido por 1 hora.</p>
        <p>Si no fuiste tú quien lo solicitó, puedes ignorar este mensaje.</p>
      `,
    });
}

export const PagarPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Registrar } = req.body;
        const pedido = await Pedido.findOne({
            where: { IdPedido: id },
            relations: [
                "Estado",
                "Venta",
                "Tipopedido",
            ]
        });
        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        // if(pedido.Estado.IdEstado === )
        const venta = await Venta.findOne({
            where: { IdVenta: pedido.Venta.IdVenta }
            , relations: ["Pago", "Estado"]
        }
        )
        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }
        pedido.Estado = await verifyEstado({ EstadoId: 11 });
        venta.Estado = await verifyEstado({ EstadoId: 3 });

        await venta.save();
        await pedido.save();


        await createPago({ IdVenta: venta.IdVenta, Monto: Registrar.Monto, Cambio: Registrar.Cambio, IdMetodoPago: Registrar.MetodoPago })
        //  

        res.status(200).json({ message: "Se completo el pago de la venta ." });

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const PonerEnProceso = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const pedido = await Pedido.findOne({
            where: { IdPedido: id },
            relations: [
                "Estado",
                "Envio",
                "Venta",
                "Tipopedido",
                "Reserva"
            ]
        });
        if (!pedido) {
            throw new HttpError(404, "Pedido no encontrada");
        }



        pedido.Estado = await verifyEstado({ EstadoId: 7 });
        await pedido.save();

        res.status(200).json({ message: "Venta anulada correctamente y stock restaurado." });

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const updatePedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reservas, detalles } = req.body;

        const pedidoToUpdate = await Pedido.findOne({
            where: { IdPedido: id }
        });
        if (!pedidoToUpdate)
            return res.status(404).json({ message: "Pedido no encontrado" });

        const venta = await ActualizarVenta(reservas, detalles);

        pedidoToUpdate.Venta = venta;
        const fechaHoraActual = new Date();
        pedidoToUpdate.FechaRegistro = fechaHoraActual;
        pedidoToUpdate.Hora = fechaHoraActual.toTimeString().slice(0, 8);
        pedidoToUpdate.Tipopedido = await verifyTipoPedido({ tipo: reservas.IdTipoPedido });

        await pedidoToUpdate.save();

        await updateEntrega({
            BarrioId: reservas.entrega.barrioId,
            Direccions: reservas.entrega.direccion,
            Referencia: reservas.entrega.referencia,
            Ubicacion: reservas.entrega.ubicacion,
            Costo: reservas.entrega.costoEnvio,
            PedidoID: reservas.IdPedido,
            EntregaId: reservas.Envio,
            DireccionId: reservas.DireccionId,
            IdSucursal: reservas.IdSucursal,
            Fecha: reservas.entrega.fecha,
            Hora: reservas.entrega.hora,
            tipoe: reservas.tipoEntrega
        });
       

         // Obtener los detalles existentes
    const existingDetalles = await Detallepedido.find({
      where: { Pedido: { IdPedido:id } },
    });

    // Recolectar IDs de los detalles entrantes
    const incomingDetalleIds = new Set<string>();
    detalles.forEach((d: any) => {
      if (d.IdDetallePedido) incomingDetalleIds.add(d.IdDetallePedido);
    });

    // Eliminar detalles que ya no existen
    for (const existingDetalle of existingDetalles) {
      if (!incomingDetalleIds.has(existingDetalle.IdDetallePedido)) {
        await deleteDetallepedidoAndRestoreStock({
          Iddetalle: existingDetalle.IdDetallePedido,
          IdSucursal: reservas.IdSucursal,
        });
      }
    }

    // Actualizar o insertar cada detalle
    for (const detalle of detalles) {
      await updateDetallePedido({
        Iddetalle: detalle.IdDetallePedido,
        IdProducto: detalle.IdProducto || "",
        IdPaquete: detalle.IdPaquete || "",
        IdPromocion: detalle.IdPromocion || "",
        Cantidad: detalle.Cantidad,
        IdVenta: id,
        Precio: detalle.Precio.toFixed(2),
        Modo: detalle.Modo,
      });
    }

        return res.status(200).json({ message: "El pedido se actualizó correctamente" });

    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getPedidoSucursal = async (req: Request, res: Response) => {
    try {
        const { id, fecha, pago } = req.params;

        console.log("Fecha recibida:", fecha);
        const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
        const inicioDia = new Date(`${fechaStr}T00:00:00`);
        const finDia = new Date(`${fechaStr}T23:59:59.999`);

        let ventas = await Pedido.find({
            where: { FechaRegistro: Between(inicioDia, finDia) },
            relations: [
                "Estado",
                "Tipopedido",
                "Venta",
                "Venta.Pago",
                "Venta.Pago.Metodopago",
                "Venta.Persona",
                "Venta.Sucursal",
                "Detallepedido",
                "Detallepedido.Producto",
                "Detallepedido.Paquete",
                "Detallepedido.Promocion",
               ]
        });


        const ventasFiltradas = ventas.filter(v =>
            (id === "TODOS" || v.Venta?.Sucursal.IdSucursal === id) &&
            (Number(pago) == 0 || v.Venta?.Pago?.some(p => p.Metodopago?.IdMetodoPago == Number(pago)))
        );
        return res.json(ventasFiltradas)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message })
        }
    }
}