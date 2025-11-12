import { Request, Response } from "express";
import { Distribucion } from "../entities/Distribucion";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyEstado } from "./Estado.controllers";
import { createEntrega, updateEntrega } from "./Entrega,controllers";
import { createDetalledistribucion, deleteDetalledistribucionAndRestoreStock, updateDetalledistribucion } from "./Detalledistribucion.controllers";
import { Detalledistribucion } from "../entities/Detalledistribucion";
import { verifySucursal } from "./Sucursal.controllers";
import { actualizarPedido, registarPedido, verifyPedido } from "./Pedido.Controllers";
import { AnanirPersona, createPersona } from "./Persona.controllers";
import { createCelular } from "./Celular.controllers";
import { createDocumento } from "./Documento.controllers";
import { Sucursal } from "../entities/Sucursal";
import { Entrega } from "../entities/Entrega";
import { Direccion } from "../entities/DIreccion";
import { Brackets } from "typeorm";
import { Pedido } from "../entities/Pedido";

export const getDistribuciones = async (req: Request, res: Response) => {
    try {
        const distribuciones = await Distribucion.find({
            relations: [
                "Estado",
                "Detalledistribucion",
                "Detalledistribucion.Producto",
                "Detalledistribucion.Paquete",
                "Pedido",
                "Pedido.Venta.Sucursal",
                "Sucursal"]
        });
        return res.json(distribuciones);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getDistribucionesSucursal = async (req: Request, res: Response) => {
    try {
        const { fecha, idsucursal } = req.query as { fecha: string; idsucursal: string };

        const query = Distribucion.createQueryBuilder("distribucion")
            .leftJoinAndSelect("distribucion.Estado", "Estado")
            .leftJoinAndSelect("distribucion.Detalledistribucion", "Detalledistribucion")
            .leftJoinAndSelect("Detalledistribucion.Producto", "Producto")
            .leftJoinAndSelect("Detalledistribucion.Paquete", "Paquete")
            .leftJoinAndSelect("distribucion.Pedido", "Pedido")
            .leftJoinAndSelect("Pedido.Venta", "Venta")
            .leftJoinAndSelect("Venta.Persona", "Persona")
            .leftJoin("Venta.Sucursal", "VentaSucursal")
            .leftJoinAndSelect("distribucion.Sucursal", "Sucursal")
            .where("distribucion.FechaDistribucion = :fecha", { fecha });

        if (idsucursal === 'Cocina') {
            query.andWhere("distribucion.Origen = 'Cocina'");
        } else if (idsucursal !== 'TODOS') {
            query.andWhere(new Brackets(qb => {
                qb.where("VentaSucursal.IdSucursal = :idsucursal", { idsucursal })
                  .orWhere("Venta.IdVenta IS NULL");
            }));
        }

        const distribuciones = await query.getMany();

        return res.json(distribuciones);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getDistribucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const distribucion = await Distribucion.findOne({ where: { IdDistribucion: id } });

        if (!distribucion) {
            return res.status(404).json({ message: "Distribucion not found" });
        }

        return res.json(distribucion);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const updateDistribucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reservas, detalles } = req.body;
        
        console.log("reserva",reservas)
        console.log("detalles", detalles)
        const distribucion = await Distribucion.findOne({ where: { IdDistribucion: id },
        relations:['Pedido'] });

        if (!distribucion) {
            return res.status(404).json({ message: "Distribucion not found" });
        }

      
       if (reservas.Nombre) {
            reservas.IdCliente = await DataPersona(reservas)
        }
        if(reservas.IdCliente)  {
           distribucion.Sucursal = null;
        }

        if(distribucion.Pedido !== null){
            await actualizarPedido(reservas, detalles);
        }
        if (reservas.DestinoFInal !== 'TODOS'){
            distribucion.Sucursal = await verifySucursal({ SucursalId: reservas.DestinoFInal })
        }
        
        await distribucion.save();

       await updateEntrega({
            BarrioId: reservas.entrega.barrioId,
            Direccions: reservas.entrega.direccion,
            Referencia: reservas.entrega.referencia,
            Ubicacion: reservas.entrega.ubicacion,
            Costo: reservas.entrega.costoEnvio,
            PedidoID: id,
            EntregaId: reservas.Envio,
            DireccionId: reservas.DireccionId,
            IdSucursal:  reservas?.entrega?.sucursaldestino,
            Fecha: reservas.entrega.fecha,
            Hora: reservas.entrega.hora,
            tipoe: reservas.IdTipoEntrega
        });


        // Obtener los detalles existentes
        const existingDetalles = await Detalledistribucion.find({
            where: { Distribucion: { IdDistribucion: id } },
        });

        // Recolectar IDs de los detalles entrantes
        const incomingDetalleIds = new Set<string>();
        detalles.forEach((d: any) => {
            if (d.IdDetalleDistribucion) incomingDetalleIds.add(d.IdDetalleDistribucion);
        });

        // Eliminar detalles que ya no existen
        for (const existingDetalle of existingDetalles) {
            if (!incomingDetalleIds.has(existingDetalle.IdDetalleDistribucion)) {
                await deleteDetalledistribucionAndRestoreStock({
                    Iddetalle: existingDetalle.IdDetalleDistribucion,
                });
            }
        }

        // Actualizar o insertar cada detalle
        for (const detalle of detalles) {
            await updateDetalledistribucion({
                Iddetalle: detalle.IdDetalleDistribucion,
                IdProducto: detalle.IdProducto || "",
                Cantidad: detalle.Cantidad,
                IdPaquete: detalle.IdPaquete || "",
                IdVenta: distribucion.IdDistribucion,
                Precio: detalle.Precio,
                Modo: detalle.Modo
            });
        }


        return res.status(201).json({ message: "Se actualizó correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const deleteDistribucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await Distribucion.delete({ IdDistribucion: id });

        if (result.affected === 0) {
            return res.status(404).json({ message: "Distribucion not found" });
        }

        return res.sendStatus(204);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const verifyDistribucion = async ({ distribucio }: { distribucio: string }) => {

    const existVenta = await Distribucion.findOne({ where: { IdDistribucion: distribucio } });


    if (!existVenta) {
        throw new HttpError(404, `La Distribucion con ID ${distribucio} no existe.`);
    }

    return existVenta;
};

export const ObtenerCLienteDestino = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await Distribucion.findOne({
            where: { IdDistribucion: id },
            relations: ['Pedido', 'Pedido.Venta', 'Pedido.Venta.Persona', 'Entrega']
        }
        );


        if (!result) {
            return res.status(404).json({ message: "Distribucion no encontrada" });
        }

        const entrega = await Entrega.findOne({
            where: { IdEntrega: result.Entrega.IdEntrega },
            relations: ['Direccion', 'Direccion.Barrio','Tipoentrega']
        })
        if (!entrega) {
            return res.status(404).json({ message: "entrega no encontrada" });
        }

        const resultSucursal = await Direccion.findOne({
            where: { IdDireccion: entrega.Direccion.IdDireccion },
            relations: ['Sucursal']
        }
        );
        if (!resultSucursal) {
            return res.status(404).json({ message: "Direccion no encontrada" });
        }
        return res.json({
            IdCliente: result?.Pedido?.Venta?.Persona?.IdPersona,
            Nombre:result?.Pedido?.Venta?.Persona?.Nombre,
            ApellidoPaterno:result?.Pedido?.Venta?.Persona?.ApellidoPaterno,
            ApellidoMaterno:result?.Pedido?.Venta?.Persona?.ApellidoMaterno,
            EntregaId: entrega.IdEntrega,
            direccion: entrega.Direccion.Direccion,
            fecha: entrega.FechaEntrega,
            hora: entrega.HoraEntrega,
            barrioId: entrega.Direccion.Barrio.IdBarrio,
            DireccionId:entrega.Direccion.IdDireccion,
            referencia: entrega.Direccion.Referencia,
            ubicacion: entrega.Direccion.Ubicacion,
            costoEnvio: entrega.CostoEntrega,
            tipo:entrega.Tipoentrega.IdTipoEntrega,
            IdSucursal: resultSucursal?.Sucursal?.IdSucursal
        });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const createDistribucion = async (req: Request, res: Response) => {
    try {
        const { reservas, detalles } = req.body;

        const nuevoId = await generarIdSecuencial('DIS');
        const nuevoPedido = new Distribucion();
        nuevoPedido.IdDistribucion = nuevoId;
        console.log("reservas", reservas)
        const fechaHoraActual = new Date();
        const fechaLocal = new Date(fechaHoraActual.getTime() - fechaHoraActual.getTimezoneOffset() * 60000);
        nuevoPedido.FechaDistribucion = fechaLocal;
        nuevoPedido.HoraDistribucion = fechaHoraActual.toTimeString().slice(0, 8);
        nuevoPedido.Estado = await verifyEstado({ EstadoId: 6 });
        nuevoPedido.Origen = (reservas.IdSucursal === 'TODOS') ? 'Cocina' : reservas.IdSucursal;
         if (reservas.DestinoFInal !== 'TODOS')
            nuevoPedido.Sucursal = await verifySucursal({ SucursalId: reservas.DestinoFInal })
        if (reservas.Nombre) {
            reservas.IdCliente = await DataPersona(reservas)
        }

        if (reservas.IdCliente) {
            const pedido = await registarPedido(reservas, detalles);
            nuevoPedido.Pedido = await verifyPedido({ tipo: pedido.IdPedido })

        }

        await nuevoPedido.save();

         const destino = await createEntrega({
            BarrioId: reservas.entrega.barrioId || "",   // convertir al formato que espera tu método
            Direccions: reservas.entrega.direccion || "",
            Referencia: reservas.entrega.referencia || "",
            Ubicacion: reservas.entrega.ubicacion || "",
            Costo: reservas.entrega.costoEnvio || 0,
            PedidoID: nuevoId,
            IdSucursal: reservas?.entrega?.sucursaldestino,
            Fecha: reservas.entrega.fecha,
            Hora: reservas.entrega.hora,
            tipoe: reservas.IdTipoEntrega
        });
        if(nuevoPedido.Pedido !== null){
         const entrega = await Entrega.findOne({
            where:{IdEntrega:destino.IdEntrega}
         })
          if (!entrega) {
            return res.status(404).json({ message: "Entrega no encontrada" });
        }

         entrega.Pedido = nuevoPedido.Pedido;

         await entrega?.save();
        }

        if (detalles) {
            for (const producto of detalles) {
                await createDetalledistribucion({
                    IdProducto: producto.IdProducto || "",
                    Cantidad: producto.Cantidad,
                    IdPaquete: producto.IdPaquete || "",
                    IdVenta: nuevoId,
                    Precio: producto.Precio.toFixed(2),
                    Modo: producto.Modo
                });
            }
        }

        return res.status(201).json({ message: "Se registró correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};


const DataPersona = async (personaData: any) => {
    const persona = await AnanirPersona({
        Nombre: personaData.Nombre,
        ApellidoPaterno: personaData.ApellidoPaterno,
        ApellidoMaterno: personaData.ApellidoMaterno || '',
        FechaDeNacimiento: personaData.FechaDeNacimiento || '',
        IdGenero: personaData.IdGenero,
        email: personaData.email || ''
    });
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


    return persona.IdPersona;
};

export const anularDistribucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const distribucion = await Distribucion.findOne({
            where: { IdDistribucion: id },
            relations: ["Pedido", "Entrega", "Detalledistribucion"]
        });

        if (!distribucion) {
            return res.status(404).json({ message: "Distribucion not found" });
        }

        // Assuming state 5 is "Anulado". Please verify.
        const estadoAnulado = await verifyEstado({ EstadoId: 5 });

        distribucion.Estado = estadoAnulado;

        if (distribucion.Pedido) {
            const pedido = await Pedido.findOne({ where: { IdPedido: distribucion.Pedido.IdPedido } });
            if (pedido) {
                pedido.Estado = estadoAnulado;
                await pedido.save();
            }
        }

        if (distribucion.Entrega) {
            const entrega = await Entrega.findOne({ where: { IdEntrega: distribucion.Entrega.IdEntrega } });
            if (entrega) {
                entrega.Estado = estadoAnulado;
                await entrega.save();
            }
        }

        if (distribucion.Detalledistribucion) {
            for (const detalle of distribucion.Detalledistribucion) {
                await deleteDetalledistribucionAndRestoreStock({
                    Iddetalle: detalle.IdDetalleDistribucion,
                });
            }
        }

        await distribucion.save();

        return res.status(200).json({ message: "Distribucion anulada correctamente" });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
}; //