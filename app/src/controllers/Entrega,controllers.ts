
import { Sucursal } from "../entities/Sucursal";
import { Request, Response } from "express";
import { Tipoentrega } from "../entities/TipoEntrega";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { createDireccion, updateDireccion, verifyDireccion } from "./Direccion.controllers";
import { verifyEstado } from "./Estado.controllers";
import { verifyPedido } from "./Pedido.Controllers";
import { Between } from "typeorm";
import { verifyDistribucion } from "./Distribucion.controllers";
import { Distribucion } from "../entities/Distribucion";
import { Pedido } from "../entities/Pedido";
import { verifyRepartidor } from "./Repartidor.controllers";
import { SeguimientoEntrega } from "../entities/SeguimientoRepartidor";
import { createDetalleventa, createDetalleventaPedido } from "./DetalleVenta.controllers";
import { devolucionCantidad } from "./Detalledistribucion.controllers";
import { Venta } from "../entities/Venta";
import { afterEach, describe } from "node:test";
import { Direccion } from "../entities/DIreccion";
import { verifySucursal } from "./Sucursal.controllers";
import { createPago } from "./Pago.controllers";
import { verifyVenta } from "./Venta.controllers";
import { Pago } from "../entities/Pago";
import { Entrega } from "../entities/Entrega";
import { Productostock } from "../entities/ProductoStock";
import { IncrementarProductosEnSucursal, IncrementProductosucursal } from "./SucursalProducto.controllers";


export const createEntrega = async ({
    BarrioId, Direccions, Referencia, Ubicacion, Costo, PedidoID, IdSucursal, Fecha, Hora, tipoe
}: {
    BarrioId: string;
    Direccions: string;
    Referencia: string;
    Ubicacion: string;
    Costo: number,
    PedidoID: string;
    IdSucursal: string;
    Fecha: string;
    Hora: string;
    tipoe: string
}) => {
    const nuevoId = await generarIdSecuencial('ENT');

    const nuevoEntrega = new Entrega();

    nuevoEntrega.IdEntrega = nuevoId;

    nuevoEntrega.Direccion = (tipoe === "TPE-E1") ? await cargarDireccion({ IdSucursal: IdSucursal }) : await createDireccion({
        BarrioId: BarrioId || "",
        Direccions: Direccions || "",
        Referencia: Referencia || "",
        Ubicacion: Ubicacion || ""
    });

    nuevoEntrega.CostoEntrega = Costo || 0.00;
    nuevoEntrega.FechaEntrega = parseLocalDate(Fecha);
    nuevoEntrega.HoraEntrega = normalizarHora(Hora);

    let pedido: Pedido | null = null;
    let distribucion: Distribucion | null = null;

    try {
        pedido = await verifyPedido({ tipo: PedidoID });
    } catch (err) {
        // si no existe, intentamos como Distribución
        distribucion = await verifyDistribucion({ distribucio: PedidoID }); // ojo, parámetro correcto
    }

    if (!pedido && !distribucion) {
        throw new Error("No se encontró ni Pedido ni Distribución con ese ID");
    }

    // asignar al nuevoEntrega
    if (pedido) nuevoEntrega.Pedido = pedido;
    if (distribucion) nuevoEntrega.Distribucion = distribucion;

    nuevoEntrega.Estado = await verifyEstado({ EstadoId: 6 });
    nuevoEntrega.Tipoentrega = await verifyTipoEntrega({ tipo: tipoe });

    await nuevoEntrega.save();

    return nuevoEntrega;
};

export const updateEntrega = async ({
    BarrioId, Direccions, Referencia, Ubicacion, Costo, PedidoID, EntregaId, DireccionId, IdSucursal, Fecha, Hora, tipoe
}: {
    BarrioId: string;
    Direccions: string;
    Referencia: string;
    Ubicacion: string;
    Costo: number;
    PedidoID: string;
    EntregaId: string;
    DireccionId: string;
    IdSucursal: string;
    Fecha: string;
    Hora: string;
    tipoe: string
}) => {
   
    if (!EntregaId) {
        return createEntrega({ BarrioId, Direccions, Referencia, Ubicacion, Costo, PedidoID, IdSucursal, Fecha, Hora, tipoe });
    }

    const entrega = await Entrega.findOne({
        where: { IdEntrega: EntregaId },
        relations: ["Direccion", "Direccion.Sucursal"]
    });

    if (!entrega) {
        throw new HttpError(404, `El Entrega con ID ${EntregaId} no existe.`);
    }

    const oldDireccionId = entrega.Direccion ? entrega.Direccion.IdDireccion : null;
    const oldDireccionWasFromSucursal = !!entrega.Direccion?.Sucursal;

    // Determine the new direccion
    if (tipoe === "TPE-E1" && IdSucursal !== 'TODOS') {
        // Case 1: Delivery to a Sucursal
        entrega.Direccion = await cargarDireccion({ IdSucursal: IdSucursal });
    } else {
        // Case 2: Delivery to a custom address
        if (oldDireccionWasFromSucursal || !oldDireccionId) {
            // If previous was a sucursal, or no direccion existed, create a new one
            entrega.Direccion = await createDireccion({
                BarrioId: BarrioId || "",
                Direccions: Direccions || "",
                Referencia: Referencia || "",
                Ubicacion: Ubicacion || ""
            });
        } else {
            // If previous was a custom address, update it
            await updateDireccion({ 
                IdDireccion: oldDireccionId, 
                BarrioId: BarrioId, 
                Direccions: Direccions, 
                Referencia: Referencia, 
                Ubicacion: Ubicacion 
            });
            // We don't need to re-assign entrega.Direccion because it's the same object being updated.
        }
    }

    // Update other fields
    entrega.CostoEntrega = Costo;
    entrega.FechaEntrega = parseLocalDate(Fecha);
    entrega.HoraEntrega = normalizarHora(Hora);
    entrega.Tipoentrega = await verifyTipoEntrega({ tipo: tipoe });

    // Save the Entrega with the new direccion reference
    await entrega.save();

    // Now it's safe to delete the old direccion if it was a custom one and has been replaced
    if (oldDireccionId && oldDireccionId !== entrega.Direccion.IdDireccion && !oldDireccionWasFromSucursal) {
        await Direccion.delete({ IdDireccion: oldDireccionId });
    }

    return entrega;
};

const normalizarHora = (hora: string): string => {
    if (!hora) return new Date().toTimeString().split(" ")[0]; // hora actual HH:mm:ss
    // Si viene en formato HH:mm, agregamos los segundos
    if (/^\d{2}:\d{2}$/.test(hora)) {
        return `${hora}:00`;
    }
    return hora; // Asumimos que ya está en HH:mm:ss
};
const parseLocalDate = (yyyyMMdd: string): Date => {
    const [year, month, day] = yyyyMMdd.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
}
const cargarDireccion = async (
    { IdSucursal }: { IdSucursal: string }) => {
    const sucursal = await Sucursal.findOne({
        where: {
            IdSucursal: IdSucursal
        }, relations: [
            "Direccion"
        ]
    })
    if (!sucursal) {
        throw new HttpError(404, `La sucursal con el ID ${IdSucursal} no existe.`);
    }
    return sucursal.Direccion;
}
export const verifyTipoEntrega = async ({ tipo }: { tipo: string }) => {

    const existEstado = await Tipoentrega.findOne({ where: { IdTipoEntrega: tipo } });


    if (!existEstado) {
        throw new Error(`La entrega con ID ${existEstado} no existe.`);
    }

    return existEstado;
};

export const getTipoEntrega = async (req: Request, res: Response) => {
    try {
        const Tipopromocions = await Tipoentrega.find();
        return res.json(Tipopromocions);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const ObtenerEntrega = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const entrega = await Entrega.findOne(
            {
                where: [
                    { Pedido: { IdPedido: id } },
                    { IdEntrega: id }
                ],
                relations: ["Tipoentrega", "Direccion", "Direccion.Sucursal", "Direccion.Barrio"]
            }
        );
        return res.json(entrega);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const ObtenerDIreccionEntrega = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const entrega = await Entrega.findOne(
            {
                where: { IdEntrega: id },
                relations: ["Tipoentrega", "Direccion", "Direccion.Sucursal", "Direccion.Barrio"]
            }
        );
        return res.json(entrega);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
export const getEntregas = async (req: Request, res: Response) => {
    try {

        const entrega = await Entrega.findOne(
            {
                relations: [
                    "Tipoentrega",
                    "Direccion",
                    "Direccion.Barrio",
                    "Estado",
                    "Pedido"]
            }
        );
        return res.json(entrega);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};



export const getEntregaSucursal = async (req: Request, res: Response) => {
    try {
        const { id, fecha } = req.params;

        console.log("Fecha recibida:", fecha);
        const fechaStr = fecha.split('T')[0] || fecha; // por si llega con hora
        const inicioDia = new Date(`${fechaStr}T00:00:00`);
        const finDia = new Date(`${fechaStr}T23:59:59.999`);

        let entregas = await Entrega.find({
            where: { FechaEntrega: Between(inicioDia, finDia) },
            relations: [
                "Estado",
                "Direccion",
                "Pedido",
                "Pedido.Tipopedido",
                "Pedido.Venta.Persona",
                "Pedido.Venta.Sucursal",
                "Tipoentrega"
            ]
        });

        const filtradas = entregas
            .filter(e => id === "TODOS" || e.Pedido.Venta?.Sucursal.IdSucursal === id)
            .map(e => ({
                IdEntrega: e.IdEntrega,
                FechaEntrega: e.FechaEntrega,
                HoraEntrega: e.HoraEntrega,
                Estado: e.Estado?.IdEstado,
                NombreEstado: e.Estado?.Nombre,
                Costo: e.CostoEntrega,
                Direccion: e.Direccion?.IdDireccion,
                NombreEntrega: e.Tipoentrega.Nombre,
                IdtEntrega: e.Tipoentrega.IdTipoEntrega,
                Pedido: {
                    IdPedido: e.Pedido?.IdPedido,
                    FechaRegistro: e.Pedido?.FechaRegistro,
                    Hora: e.Pedido?.Hora,
                    NombreTipo: e.Pedido?.Tipopedido?.Nombre,
                    IdVenta: e.Pedido?.Venta?.IdVenta,
                    Persona: e.Pedido?.Venta?.Persona
                }
            }));

        return res.json(filtradas);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export const AsignarRepartidor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { repartidor } = req.body;
        const entrega = await Entrega.findOne({
            where: { IdEntrega: id }
        })

        if (!entrega) {
            return res.status(404).json({ message: "Entrega no asignada" });
        }
        entrega.Repartidor = await verifyRepartidor({ repartiodrId: repartidor.IdRepartidor })
        return res.json({ message: 'Repartidor asignado correctamente' });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const DevolucionEntrega = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { detalles, comentario } = req.body;

        const entrega = await Entrega.findOne({
            where: { IdEntrega: id },
            relations: [
                "Pedido",
                "Distribucion",
            ]
        });
//ssss
        if (!entrega) {
            throw new HttpError(404, `La entrega con ID ${id} no existe.`);
        }

        // ASUMO que el estado 9 es 'Devuelto'. ¡Verifica esto!


        if (entrega.Pedido) {
            const pedido = await Pedido.findOne({
                where: { IdPedido: entrega.Pedido.IdPedido },
                relations: ["Venta", "Venta.Sucursal"],
            });

            if (!pedido) throw new HttpError(404, `Pedido no existe.`);

            const venta = await Venta.findOne({
                where: { IdVenta: pedido?.Venta.IdVenta },
                relations: ["Sucursal"],
            });

            if (!venta) throw new HttpError(404, `venta no existe.`);

            venta.FechaVenta = new Date();
            venta.Estado = await verifyEstado({ EstadoId: 3 }); // por ejemplo: "En proceso"
            await venta.save();

            let todosDevueltos = true;
            let todosEntregados = true;

            for (const detalle of detalles.item) {
                await createDetalleventa({
                    IdPromocion: detalle?.IdPromocion || "",
                    IdProducto: detalle?.IdProducto || "",
                    Cantidad: detalle.Cantidad, // Cantidad entregada
                    IdPaquete: detalle?.IdPaquete || "",
                    IdVenta: venta.IdVenta,
                    Precio: detalle.Precio,
                    IdSucursal: venta?.Sucursal?.IdSucursal || "",
                    Modo: detalle.Modo,
                });

                // Comparaciones
                if (detalle.Cantidad !== 0) {
                    todosDevueltos = false; // hay algo entregado
                }

                if (detalle.Cantidad !== detalle.CantidadOriginal) {
                    todosEntregados = false; // no se cumplió la cantidad completa
                }
            }

            if (comentario) pedido.Detalle = comentario;

            // 🔹 Decidir estado final
            if (todosDevueltos) {
                pedido.Estado = await verifyEstado({ EstadoId: 12 }); // Devuelto
                entrega.Estado = await verifyEstado({ EstadoId: 12 });
                venta.Estado = await verifyEstado({ EstadoId: 5 });
            } else if (todosEntregados) {
                pedido.Estado = await verifyEstado({ EstadoId: 13 }); // Entregado
                entrega.Estado = await verifyEstado({ EstadoId: 13 });
                 venta.Estado = await verifyEstado({ EstadoId: 3 });
            } else {
                pedido.Estado = await verifyEstado({ EstadoId: 14 }); // Entrega parcial
                entrega.Estado = await verifyEstado({ EstadoId: 14 });
                venta.Estado = await verifyEstado({ EstadoId: 3 });
            }
            await venta.save();

            await pedido.save();

            // Generar pago si corresponde
            await createPago({
                IdVenta: venta.IdVenta,
                Monto: detalles.Monto,
                Cambio: detalles.Cambio,
                IdMetodoPago: detalles.IdMetodo,
            });
        }


        if (entrega.Distribucion) {
            const distribucio = await Distribucion.findOne({
                where: { IdDistribucion: entrega.Distribucion.IdDistribucion },
                relations: [
                    "Sucursal",
                    "Detalledistribucion",
                    "Detalledistribucion.Producto",
                    "Detalledistribucion.Paquete"
                ]
            });
            if (!distribucio) {
                throw new HttpError(404, `Distribucion no existe.`);
            }
            const exitSucusal = distribucio?.Sucursal?.IdSucursal;
            if(exitSucusal)
             for(const dist of distribucio.Detalledistribucion){
              await IncrementarProductosEnSucursal({SucursalId:exitSucusal,ProductoId:dist.Paquete? dist.Paquete.IdPaquete:dist.Producto.IdProducto,Cantidad:dist.Cantidad})  
             }

            for (const detalle of detalles.item) {
                const idDetalle = detalle?.IdPaquete ? detalle.IdPaquete : detalle.IdProducto;
                 
                
                // Buscar el detalle existente en la distribución
                const detalleExistente = distribucio.Detalledistribucion.find(d =>
                    (d.Producto && d.Producto.IdProducto === idDetalle) ||
                    (d.Paquete && d.Paquete.IdPaquete === idDetalle)
                );

                if (!detalleExistente) {
                    throw new HttpError(404, `No existe en la distribución el detalle con ID ${idDetalle}`);
                }

                 if (detalle.Cantidaddevuelta > 0)
                    entrega.Estado = await verifyEstado({ EstadoId: 12 });

                await devolucionCantidad({
                    Iddetalle: detalleExistente.IdDetalleDistribucion,
                    Cantidad: detalle.Cantidaddevuelta
                });


                let todosDevueltos = true;
                let todosEntregados = true;



                if (todosDevueltos) {
                    distribucio.Estado = await verifyEstado({ EstadoId: 11 }); // Devuelto
                    entrega.Estado = await verifyEstado({ EstadoId: 11 });

                } else if (todosEntregados) {
                    distribucio.Estado = await verifyEstado({ EstadoId: 12 }); // Entregado
                    entrega.Estado = await verifyEstado({ EstadoId: 12 });
                } else {
                    distribucio.Estado = await verifyEstado({ EstadoId: 13 }); // Entrega parcial
                    entrega.Estado = await verifyEstado({ EstadoId: 13 });
                }


            }

            if (comentario) distribucio.Observacion = comentario;
            distribucio.Estado = await verifyEstado({ EstadoId: 11 })
            await distribucio.save();

        }

        await entrega.save();

        return res.json({ message: 'Devolución registrada correctamente.' });

    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const actualizarlaDireccion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { detalles } = req.body;

        const entrega = await Entrega.findOne({
            where: { IdEntrega: id },
            relations: [
                "Distribucion",
                "Pedido",
                "Direccion",
                "Direccion.Sucursal",
            ]
        });

        if (!entrega) {
            throw new HttpError(404, `La entrega con ID ${id} no existe.`);
        }

        if (!entrega?.Direccion?.Sucursal && !detalles.IdSucursal) {
            if (detalles.tipoe !== "TPE-E1" && !detalles.DireccionId) {
                entrega.Direccion = await createDireccion({
                    BarrioId: detalles.BarrioId || "",
                    Direccions: detalles.Direccion || "",
                    Referencia: detalles.Referencia || "",
                    Ubicacion: detalles.Ubicacion || ""
                });
            } else
                await updateDireccion({ IdDireccion: detalles.DireccionId, BarrioId: detalles.BarrioId, Direccions: detalles.Direccion, Referencia: detalles.Referencia, Ubicacion: detalles.Ubicacion })

        } else {
            entrega.Direccion = (detalles.tipoe === "TPE-E1") ?
                await cargarDireccion({ IdSucursal: detalles.IdSucursal }) :
                await updateDireccion({ IdDireccion: detalles.IdSucursal ? '' : detalles.DireccionId, BarrioId: detalles.BarrioId, Direccions: detalles.Direccion, Referencia: detalles.Referencia, Ubicacion: detalles.Ubicacion })
        }

        entrega.CostoEntrega = detalles.Costo;
        entrega.Tipoentrega = await verifyTipoEntrega({ tipo: detalles.tipoe })
        entrega.FechaEntrega = parseLocalDate(detalles.Fecha);
        entrega.HoraEntrega = normalizarHora(detalles.Hora);

        await entrega.save();
        if (detalles.tipoe === "TPE-E2") {
            if (entrega.Distribucion) {
                const distribucion = await Distribucion.findOne({
                    where: { IdDistribucion: entrega.Distribucion.IdDistribucion }
                })
                if (!distribucion) {
                    throw new HttpError(404, `La entrega con ID ${id} no existe.`);
                }
                distribucion.Sucursal = null;
                await distribucion.save();
            }
        }

        if (detalles.IdSucursal && detalles.tipoe === "TPE-E1") {
            if (entrega.Distribucion) {
                const distribucion = await Distribucion.findOne({
                    where: { IdDistribucion: entrega.Distribucion.IdDistribucion }
                })
                if (!distribucion) {
                    throw new HttpError(404, `La entrega con ID ${id} no existe.`);
                }
                distribucion.Sucursal = await verifySucursal({ SucursalId: detalles.IdSucursal })
                await distribucion.save();
            }
            const direccion = await Direccion.findOne({
                where: { IdDireccion: detalles.DireccionId },
                relations: ["Sucursal"],
            });
            if (direccion?.Sucursal) {
                console.log('Ok')
                //     throw new HttpError(400, "No se puede eliminar la dirección porque está asociada a una sucursal");
            } else {
                await Direccion.delete({ IdDireccion: detalles.DireccionId });
            }
        }




        return res.json({ message: 'Direccion actualizada' });

    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const obteneralCliente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const entrega = await Entrega.findOne({
            where: { IdEntrega: id },
            relations: [
                "Pedido",
                "Pedido.Venta",
                "Pedido.Venta.Sucursal",
                "Pedido.Venta.Persona",
                "Distribucion",
                "Distribucion.Sucursal",
                "Direccion",
                "Direccion.Sucursal",
            ]
        });

        if (!entrega) {
            throw new HttpError(404, `La entrega con ID ${id} no existe.`);
        }


        return res.json(entrega);

    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const obtenerDetalle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const entrega = await Entrega.findOne({
            where: { IdEntrega: id },
            relations: [
                "Pedido",
                "Distribucion"
            ]
        });
        let distribucio;
        if (!entrega) {
            throw new HttpError(404, `La entrega con ID ${id} no existe.`);
        }
        if (entrega.Distribucion) {
            distribucio = await Distribucion.findOne({
                where: { IdDistribucion: entrega.Distribucion.IdDistribucion },
                relations: [
                    "Detalledistribucion",
                    "Detalledistribucion.Producto",
                    "Detalledistribucion.Paquete",
                ]
            });

            if (!distribucio) {
                throw new HttpError(404, `La distribucion con ID ${entrega.Distribucion.IdDistribucion} no existe.`);
            }
        }
        let pedido;
        if (entrega.Pedido) {
            pedido = await Pedido.findOne({
                where: { IdPedido: entrega.Pedido.IdPedido },
                relations: [
                    "Tipopedido",
                    "Detallepedido",
                    "Detallepedido.Producto",
                    "Detallepedido.Paquete",
                    "Detallepedido.Promocion",
                ]
            });

            if (!pedido) {
                throw new HttpError(404, `La distribucion con ID ${entrega.Pedido.IdPedido} no existe.`);
            }
        }
        return res.json({
            Pedido: pedido,
            Distribucion: distribucio
        });

    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
