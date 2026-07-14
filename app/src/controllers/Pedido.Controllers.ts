import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Pedido } from "../entities/Pedido";
import { HttpError } from "../utils/error.handler";
import { generarIdSecuencial } from "../utils/idGenerator";
import { verifyPersona } from "./Persona.controllers";
import { verifyUsuario } from "./Usuario.controllers";
import { verifyProductoMedida } from "./ProductoMedida.controllers";
import { verifyPromocion } from "./Promocion.controllers";
import { verifySucursal } from "./Sucursal.controllers";
import { getFechaHoraBolivia } from "../utils/Fecha";
import { verifyTipoPedido } from "./TipoPedido.controllers";
import { createDetallePedido } from "./Detallepedido.controllers";
import { Venta } from "../entities/Venta";
import { createPago, createPagoPedido } from "./Pago.controllers";
import { Pago } from "../entities/Pago";
import { constrainedMemory } from "process";
const { fecha, hora } = getFechaHoraBolivia();

export const verifyPedido = async ( VentaId: string ) => {

  const existVenta = await Pedido.findOne({ where: { IdPedido: VentaId } });


  if (!existVenta) {
    throw new HttpError(404, `El Metodo Venta con ID ${VentaId} no existe.`);
  }

  return existVenta;
};

export const registrarPedido = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { pedidos, detalles } = req.body;
  
    if (!pedidos.IdUsuario || !pedidos.IdSucursal) {
      throw new HttpError(400, "Usuario y Sucursal son requeridos para la pedido.");
    }

    const nuevoIdVenta = await generarIdSecuencial('PED');
    const pedido = new Pedido();
    pedido.IdPedido = nuevoIdVenta;
    
    if (pedidos.IdPersona) {
      pedido.Persona = await verifyPersona({ PersonaId: pedidos.IdPersona });
    }

    pedido.Usuario = await verifyUsuario({ UsuarioId: pedidos.IdUsuario });
    pedido.Sucursal = await verifySucursal({ SucursalId: pedidos.IdSucursal });

   
    pedido.Total = Number(pedidos.Tota)
    if(pedidos.Adelanto > 0)pedido.Adelanto = Number(pedidos.Adelanto)
    pedido.FechaRegistro = pedidos.FechaRegistro || fecha;
    pedido.Hora = pedidos.Hora || hora;
    pedido.Tipopedido = await verifyTipoPedido(pedidos.IdTipo)
    if(pedidos.Direccion)pedido.DireccionEntrega = pedidos.Direccion
    if(pedidos.Referencia)pedido.ReferenciaEntrega =  pedidos.Referencia
    if(pedidos.Link) pedido.LinkUbicacion =  pedidos.Link
    if(pedidos.Modo) pedido.Detalle = pedidos.Modo
     
    
    await queryRunner.manager.save(pedido);

    // Registrar Adelanto si existe
    if (pedido.Adelanto > 0) {
      await createPagoPedido(
        queryRunner,
        pedido,
        pedido.Adelanto,
        0, // Sin cambio para adelantos habitualmente
        pedidos.IdMetodoPagoAdelanto || 1 // Por defecto Efectivo si no se envía
      );
    }

    if (detalles) {
      if (detalles.Producto?.length > 0) {
        for (const prod of detalles.Producto) {
          let promocion = null;
          if (prod.idPromocion) {
            promocion = await verifyPromocion({ PromocionId: prod.idPromocion });
            // Verificar límite de uso si existe
            if (promocion.LimiteUso > 0) {
              if (promocion.LimiteUso < prod.Cantidad) {
                throw new HttpError(400, `La promoción "${promocion.Nombre}" ha agotado su límite de uso o no tiene suficiente disponible.`);
              }
              promocion.LimiteUso -= prod.Cantidad;
              if(promocion.LimiteUso == 0 )
                promocion.Estado = 0
              await queryRunner.manager.save(promocion);
            }
          }

          let presentacion = null;
          if (prod.idPaquete) {
            presentacion = await verifyProductoMedida({ PaqueteId: prod.idPaquete });
          }
        await createDetallePedido(
            queryRunner,
            promocion,
            prod.Cantidad,
            presentacion,
            pedido,
            prod.Precio
        )
        }
      }
    }

    await queryRunner.commitTransaction();
    return res.status(201).json({ 
      message: "La pedido se registró correctamente", 
      idVenta: nuevoIdVenta 
    });

  } catch (error) {
    await queryRunner.rollbackTransaction();

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: "Error al registrar la pedido", 
      error: error instanceof Error ? error.message : "Error desconocido" 
    });
  } finally {
    await queryRunner.release();
  }
};

export const anularpedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
   
     const result = await AppDataSource.query(
     `UPDATE pedido 
      SET estado = 0 
      WHERE IdPedido = $1
      RETURNING estado AS estado`,
     [id]
   );
   
       // ✅ aquí está el cambio
       if (result.length === 0) {
         return res.status(404).json({ message: "Pedido no encontrado" });
       }
   const nuevoEstado = Number(result[0][0].estado);
       const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
   
       return res.json({
         message: `Se ${mensajeAccion} los datos del pedido correctamente`,
       });
  } catch (error) {
    console.error("Error al cambiar el estado del Sucursal:", error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const enviarPedido = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { id} = req.params

    const pedido = await queryRunner.manager.findOne(Pedido, {
      where: { IdPedido: id },
      relations: [
        "Detallepedido",
        "Detallepedido.Productomedida",
        "Detallepedido.Productomedida.Producto",
        "Detallepedido.Promocion",
        "Detallepedido.Promocion.Promocionproducto",
        "Sucursal",
        "Usuario",
        "Persona"
      ]
    });

    if (!pedido) {
      throw new HttpError(404, "Pedido no encontrado");
    }

    if (pedido.Estado !== 1) {
      throw new HttpError(400, "Solo se pueden enviar pedidos que estén en estado Pendiente (Estado 1)");
    }

    // 1. Procesar Detalles y Decrementar Stock
    if (pedido.Detallepedido && pedido.Detallepedido.length > 0) {
      for (const det of pedido.Detallepedido) {
        const { DecrementProducto, DecrementPromocion } = await import("./Inventario.controllers");
        
        if (det.Productomedida) {
          await DecrementProducto(queryRunner, det.Productomedida, pedido.Sucursal.IdSucursal, det.Cantidad, id);
        } else if (det.Promocion) {
          await DecrementPromocion(queryRunner, pedido.Sucursal.IdSucursal, det.Cantidad, det.Promocion, id);
        }
      }
    }

    // 2. Actualizar estado del pedido a 'Enviado'
    pedido.Estado = 2; 
    await queryRunner.manager.save(pedido);

    await queryRunner.commitTransaction();
    return res.status(200).json({
      message: "Pedido marcado como ENVIADO y stock decrementado correctamente",
      id: id
    });

    } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Error al enviar el pedido",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
    } finally {
    await queryRunner.release();
    }
};

export const getPedidos = async (req: Request, res: Response) => {
  try {
    const {
      estado,
      tipopedido, 
      idsucursal,
      producto,
      promocion,
      fecha,
      page = 1,
      limit = 10,
      search = ''
    } = req.query;
  
    const currentPage = Number(page);
    const currentLimit = Number(limit);
    const offset = (currentPage - 1) * currentLimit;


    const query = `
      WITH filtered_pedidos AS (
        SELECT p.*
        FROM pedido p
        WHERE
          ($1::int IS NULL OR p.estado = $1)
          AND ($2::text IS NULL OR p.idtipopedido = $2)
          AND (
            $3::text IS NULL OR $3::text = 'TODOS'
            OR p.idsucursal = $3
          )
          AND (
            $4::varchar IS NULL
            OR EXISTS (
              SELECT 1 FROM detallepedido dp 
              WHERE dp.idpedido = p.idpedido 
              AND (dp.idproducto = $4 OR EXISTS (
                SELECT 1 FROM productomedida pm WHERE pm.idproductomedida = dp.idproductomedida AND pm.idproducto = $4
              ))
            )
          )
          AND (
            $5::varchar IS NULL
            OR EXISTS (
              SELECT 1 FROM detallepedido dp 
              WHERE dp.idpedido = p.idpedido AND dp.idpromocion = $5
            )
          )
          AND (
            $8::text = '' OR p.idpedido ILIKE $8 
            OR EXISTS (
              SELECT 1 FROM persona per WHERE per.idpersona = p.idpersona 
              AND (per.nombre ILIKE $8 OR per.apellidopaterno ILIKE $8 OR per.apellidomaterno ILIKE $8)
            )
          )
          AND ($9::date IS NULL OR p.fecharegistro = $9)
      )
      SELECT 
        p.idpedido,
        p.fecharegistro,
        p.hora,
        p.detalle,
        p.total,
        p.adelanto,
        p.devolucion,
        p.direccionentrega,
        p.referenciaentrega,
        p.linkubicacion,
        p.estado,
        COUNT(*) OVER() AS total_count,

        -- SUCURSAL
        json_build_object(
          'IdSucursal', s.idsucursal,
          'Nombre', s.nombre
        ) AS "Sucursal",

        -- PERSONA
        CASE 
          WHEN per.idpersona IS NOT NULL THEN
            json_build_object(
              'IdPersona', per.idpersona,
              'Nombre', per.nombre,
              'Imagen', per.imagen,
              'ApellidoPaterno', per.apellidopaterno,
              'ApellidoMaterno', per.apellidomaterno
            )
          ELSE NULL
        END AS "Persona",

        -- USUARIO
        json_build_object(
          'IdUsuario', u.idusuario,
          'Username', u.Username
        ) AS "Usuario",

        -- TIPO PEDIDO
        json_build_object(
          'IdTipoPedido', tp.idtipopedido,
          'Nombre', tp.nombre
        ) AS "Tipopedido",

        -- VENTA Y FACTURA (SI EXISTEN)
        CASE 
          WHEN v.idventa IS NOT NULL THEN
            json_build_object(
              'IdVenta', v.idventa,
              'FechaVenta', v.fechaventa,
              'HoraVenta', v.horaventa,
              'PrecioTotal', v.preciototal,
              'Factura', CASE 
                WHEN f.idfactura IS NOT NULL THEN
                  json_build_object(
                    'IdFactura', f.idfactura,
                    'NroFactura', f.nrofactura,
                    'Aprobado', f.aprobado,
                    'NombreFacturacion', f.nombrefacturacion,
                    'NitCiFacturacion', f.nitcifacturacion,
                    'Enlace', e.enlace
                  )
                ELSE NULL
              END
            )
          ELSE NULL
        END AS "Venta",

        --  PAGOS (ADELANTOS Y PAGOS FINALES)
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdPago', pg.idpago,
              'Monto', pg.monto,
              'Cambio', pg.cambio,
              'FechaPago', pg.fechapago,
              'Metodopago', json_build_object(
                'IdMetodoPago', mp.idmetodopago,
                'Nombre', mp.nombre
              )
            )
          ) FILTER (WHERE pg.idpago IS NOT NULL),
          '[]'
        ) AS "Pagos",

        -- DETALLE PEDIDO
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdDetallePedido', dp.iddetallepedido,
              'Cantidad', dp.cantidad,
              'CantidadDevuelta', dp.cantidad_devuelta,
              'Precio', dp.precio,
              'Subtotal', dp.subtotal,

              'Producto', CASE
                WHEN prod.idproducto IS NOT NULL THEN
                  json_build_object(
                    'IdProducto', prod.idproducto,
                    'Nombre', prod.nombre,
                    'Imagen', prod.imagen
                  )
                ELSE NULL
              END,

              'Productomedida', CASE
                WHEN pm.idproductomedida IS NOT NULL THEN
                  json_build_object(
                    'IdProductoMedida', pm.idproductomedida,
                    'Cantidad', pm.cantidad,
                    'PrecioVenta', pm.precioventa,
                    'Presentacion', json_build_object(
                      'IdPresentacion', pres.idpresentacion,
                      'Nombre', pres.nombre
                    ),
                    'Producto', json_build_object(
                      'IdProducto', prod_pm.idproducto,
                      'Nombre', prod_pm.nombre,
                      'Imagen', prod_pm.imagen
                    )
                  )
                ELSE NULL
              END,

              'Promocion', CASE
                WHEN prom.idpromocion IS NOT NULL THEN
                  json_build_object(
                    'IdPromocion', prom.idpromocion,
                    'Nombre', prom.nombre,
                    'PrecioPromocion', prom.preciopromocion,
                    'Imagen', prom.imagen,
                    'Productos', (
                      SELECT json_agg(
                        json_build_object(
                          'IdPromocionProducto', pp.idpromocionproducto,
                          'Cantidad', pp.cantidad,
                          'Producto', json_build_object(
                            'Nombre', COALESCE(p_pp.nombre, p_ppm.nombre)
                          )
                        )
                      )
                      FROM promocionproducto pp
                      LEFT JOIN producto p_pp ON p_pp.idproducto = pp.idproducto
                      LEFT JOIN productomedida ppm ON ppm.idproductomedida = pp.idproductomedida
                      LEFT JOIN producto p_ppm ON p_ppm.idproducto = ppm.idproducto
                      WHERE pp.idpromocion = prom.idpromocion
                    )
                  )
                ELSE NULL
              END
            )
          ) FILTER (WHERE dp.iddetallepedido IS NOT NULL),
          '[]'
        ) AS "Detallepedido"

      FROM filtered_pedidos p
      LEFT JOIN sucursal s ON s.idsucursal = p.idsucursal
      LEFT JOIN persona per ON per.idpersona = p.idpersona
      LEFT JOIN usuario u ON u.idusuario = p.idusuario
      LEFT JOIN tipopedido tp ON tp.idtipopedido = p.idtipopedido
      LEFT JOIN detallepedido dp ON dp.idpedido = p.idpedido
      LEFT JOIN producto prod ON prod.idproducto = dp.idproducto
      LEFT JOIN productomedida pm ON pm.idproductomedida = dp.idproductomedida
      LEFT JOIN presentacion pres ON pres.idpresentacion = pm.idpresentacion
      LEFT JOIN producto prod_pm ON prod_pm.idproducto = pm.idproducto
      LEFT JOIN promocion prom ON prom.idpromocion = dp.idpromocion
      LEFT JOIN venta v ON v.idpedido = p.idpedido
      LEFT JOIN factura f ON f.idventa = v.idventa
      LEFT JOIN enlace e ON e.idenlace = f.idenlace
      LEFT JOIN pago pg ON pg.idpedido = p.idpedido
      LEFT JOIN metodopago mp ON mp.idmetodopago = pg.idmetodopago

      GROUP BY 
        p.idpedido, p.fecharegistro, p.hora, p.detalle, p.total, p.adelanto, p.devolucion,
        p.direccionentrega, p.referenciaentrega, p.linkubicacion, p.estado,
        s.idsucursal, s.nombre, per.idpersona, u.idusuario, tp.idtipopedido,
        v.idventa, v.fechaventa, v.horaventa, v.preciototal, 
        f.idfactura, f.nrofactura, f.aprobado, f.nombrefacturacion, f.nitcifacturacion, e.enlace

      ORDER BY p.fecharegistro DESC, p.hora DESC
      LIMIT $6 OFFSET $7;
    `;

    const result = await AppDataSource.query(query, [
      estado || null,
      tipopedido || null,
      idsucursal || "TODOS",
      producto || null,
      promocion || null,
      currentLimit,
      offset,
      search ? `%${search}%` : '',
      fecha || null
    ]);

    return res.json({
      total: result.length > 0 ? Number(result[0].total_count) : 0,
      page: currentPage,
      limit: currentLimit,
      data: result.map(({ total_count, ...rest }: any) => rest),
    });

  } catch (error) {
    console.error("Error en getPedidos:", error,);
    return res.status(500).json({ 
      message: "Error al obtener los pedidos", 
      error: error instanceof Error ? error.message : "Error desconocido" 
    });
  }
};

export const finalizarPedido = async (req: Request, res: Response) => {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const { id } = req.params;
        const { pagoFinal } = req.body; // { Monto, Cambio, IdMetodoPago }

        const pedido = await queryRunner.manager.findOne(Pedido, {
          where: { IdPedido: id },
          relations: [
            "Detallepedido",
            "Detallepedido.Productomedida",
            "Detallepedido.Producto",
            "Detallepedido.Promocion",
            "Sucursal",
            "Usuario",
            "Persona"
          ]
        });

        if (!pedido) {
          throw new HttpError(404, "Pedido no encontrado");
        }

        if (pedido.Estado !== 2) {
          throw new HttpError(400, "Solo se pueden finalizar pedidos que hayan sido enviados (Estado 2)");
        }

        // 1. Crear Venta Oficial
        const nuevoIdVenta = await generarIdSecuencial('V');
        const venta = new Venta();
        venta.IdVenta = nuevoIdVenta;
        venta.FechaVenta = fecha;
        venta.HoraVenta = hora;
        venta.PrecioTotal = Number(pedido.Total);
        venta.Usuario = pedido.Usuario;
        venta.Persona = pedido.Persona;
        venta.Sucursal = pedido.Sucursal;
        venta.Pedido = pedido;

        await queryRunner.manager.save(venta);

        // 2. Vincular adelantos previos a la nueva Venta
        await queryRunner.manager.update(Pago, 
          { Pedido: { IdPedido: id }, Venta: null }, 
          { Venta: venta }
        );

        // 3. Crear Pago final (el saldo que paga al recibir)
        if (pagoFinal && pagoFinal.Monto > 0) {
          await createPago(
            queryRunner,
            venta,
            pagoFinal.Monto,
           (pedido.Total - pagoFinal.Monto) || 0,
            pagoFinal.IdMetodoPago || 1,
            pedido
          );
        }

        // 4. Crear DetalleVenta (ya no descuenta stock porque se hizo en enviarPedido)
        if (pedido.Detallepedido && pedido.Detallepedido.length > 0) {
          for (const det of pedido.Detallepedido) {
            const { Detalleventa } = await import("../entities/DetalleVenta");
            const dv = new Detalleventa();
            dv.IdDetalleVenta =  await generarIdSecuencial('DV')
            dv.Venta = venta;
            dv.Producto =  det.Producto
            dv.Productomedida = det.Productomedida;
            dv.Promocion = det.Promocion;
            dv.Cantidad = det.Cantidad;
            dv.Precio = det.Precio;
            await queryRunner.manager.save(dv);
          }
        }

        // 5. Finalizar Pedido
        pedido.Estado = 3; 
        await queryRunner.manager.save(pedido);

        await queryRunner.commitTransaction();
        return res.status(200).json({
          message: "Pedido finalizado y venta registrada correctamente",
          idVenta: nuevoIdVenta
        });

      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof HttpError) {
          return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ 
          message: "Error al finalizar el pedido", 
          error: error instanceof Error ? error.message : "Error desconocido" 
        });
      } finally {
        await queryRunner.release();
      }
};

export const devolverProductoPedido = async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try { 
      const { id } = req.params
    const {  idDetallePedido, cantidadDevolver, descripcion } = req.body;

    // 1. Validar pedido y su estado
    const pedido = await queryRunner.manager.findOne(Pedido, {
      where: { IdPedido: id },
      relations: ["Venta", "Sucursal"]
    });

    if (!pedido) throw new HttpError(404, "Pedido no encontrado");
    if (pedido.Estado === 3) throw new HttpError(400, "El pedido ya está finalizado, no se admiten devoluciones.");
    
    const { Detallepedido } = await import("../entities/DetallePedido");
    const detalle = await queryRunner.manager.findOne(Detallepedido, {
      where: { IdDetallePedido: idDetallePedido, Pedido: { IdPedido: id } },
      relations: ["Productomedida",
        "Productomedida.Producto", 
        "Promocion",
        "Promocion.Promocionproducto",
        "Promocion.Promocionproducto.Productomedida"]
    });

    if (!detalle) throw new HttpError(404, "Detalle de pedido no encontrado");
    if (Number(detalle.Cantidad) < cantidadDevolver) {
      throw new HttpError(400, "La cantidad a devolver supera la cantidad pedida");
    }

    // 2. Restaurar Stock (Solo si el pedido ya fue enviado, es decir, ya se descontó stock)
    if (pedido.Estado === 2) {
      const { IncrementProducto, IncrementPromocion } = await import("./Inventario.controllers");
      if (detalle.Productomedida) {
        await IncrementProducto(queryRunner, detalle.Productomedida, pedido.Sucursal.IdSucursal, cantidadDevolver, id);
      } else if (detalle.Promocion) {
        await IncrementPromocion(queryRunner, pedido.Sucursal.IdSucursal, cantidadDevolver, detalle.Promocion, id);
      }
    }

    // 3. Ajustar montos y cantidades
    const montoADescontar = Number(detalle.Precio) * cantidadDevolver;

    // Actualizar detalle
    detalle.Cantidad = Number(detalle.Cantidad) - cantidadDevolver;
    detalle.CantidadDevuelta = Number(detalle.CantidadDevuelta || 0) + cantidadDevolver;
    detalle.Subtotal = Number(detalle.Subtotal) - montoADescontar;
  
    // Nota: Ya no eliminamos el registro si la cantidad llega a 0, 
    // para poder mantener el registro de lo que se devolvió.
    await queryRunner.manager.save(detalle);

    // Actualizar Cabecera Pedido
    pedido.Total = Number(pedido.Total) - montoADescontar;
   if(descripcion) pedido.devolucion = descripcion
    await queryRunner.manager.save(pedido);

    // 4. Si ya existía una venta (flujo antiguo o post-finalización), también ajustarla
    if (pedido.Venta) {
      const venta = pedido.Venta;
      venta.PrecioTotal = Number(venta.PrecioTotal) - montoADescontar;
      await queryRunner.manager.save(venta);
      
      // Intentar buscar y ajustar detalleventa si existe
      const { Detalleventa } = await import("../entities/DetalleVenta");
      const dv = await queryRunner.manager.findOne(Detalleventa, {
        where: { Venta: { IdVenta: venta.IdVenta }, Productomedida: detalle.Productomedida, Promocion: detalle.Promocion }
      });
      if (dv) {
        dv.Cantidad = Number(dv.Cantidad) - cantidadDevolver;
        if (dv.Cantidad <= 0) await queryRunner.manager.remove(dv);
        else await queryRunner.manager.save(dv);
      }
    }

    await queryRunner.commitTransaction();
    return res.json({ 
      message: "Devolución y ajuste de stock procesados correctamente", 
      nuevoTotal: pedido.Total 
    });

    } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: "Error al procesar la devolución", 
      error: error instanceof Error ? error.message : "Error desconocido" 
    });
    } finally {
    await queryRunner.release();
    }
    };

    export const actualizarPedido = async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
    const { id } = req.params;
    const { pedidos, detalles } = req.body;

    const pedido = await queryRunner.manager.findOne(Pedido, {
      where: { IdPedido: id },
      relations: [
        "Sucursal",
        "Detallepedido",
        "Detallepedido.Productomedida",
        "Detallepedido.Promocion",
        "Detallepedido.Promocion.Promocionproducto",
        "Detallepedido.Promocion.Promocionproducto.Productomedida"
      ]
    });

    if (!pedido) {
      throw new HttpError(404, "Pedido no encontrado");
    }

    if (pedido.Estado !== 1) {
      throw new HttpError(400, "Solo se pueden actualizar pedidos en estado Pendiente");
    }

    // 1. Si hay nuevos detalles, eliminamos los antiguos
    if (detalles) {
      if (pedido.Detallepedido) {
        for (const detalle of pedido.Detallepedido) {
          // Restaurar límite de uso de promoción si aplica
          if (detalle.Promocion && detalle.Promocion.LimiteUso != null) {
            detalle.Promocion.LimiteUso += detalle.Cantidad;
            detalle.Promocion.Estado = 1;
            await queryRunner.manager.save(detalle.Promocion);
          }
          await queryRunner.manager.remove(detalle);
        }
      }
    }

    // 2. Actualizar cabecera del Pedido
    if (pedidos.IdPersona) {
      pedido.Persona = await verifyPersona({ PersonaId: pedidos.IdPersona });
    }
    if (pedidos.IdUsuario) {
      pedido.Usuario = await verifyUsuario({ UsuarioId: pedidos.IdUsuario });
    }
    if (pedidos.IdSucursal) {
      pedido.Sucursal = await verifySucursal({ SucursalId: pedidos.IdSucursal });
    }
    if (pedidos.IdTipo) {
      pedido.Tipopedido = await verifyTipoPedido(pedidos.IdTipo);
    }

    pedido.Total = Number(pedidos.Tota || pedido.Total);
    if (pedidos.Adelanto !== undefined) pedido.Adelanto = Number(pedidos.Adelanto);
    if (pedidos.Direccion) pedido.DireccionEntrega = pedidos.Direccion;
    if (pedidos.Referencia) pedido.ReferenciaEntrega = pedidos.Referencia;
    if (pedidos.Link) pedido.LinkUbicacion = pedidos.Link;
    if (pedidos.Modo) pedido.Detalle = pedidos.Modo;

    await queryRunner.manager.save(pedido);

    // 3. Manejo de Adelantos (Pagos)
    if (pedidos.Adelanto > 0) {
      const pagoExistente = await queryRunner.manager.findOne(Pago, { where: { Pedido: { IdPedido: id } } });
      if (pagoExistente) {
        pagoExistente.Monto = pedidos.Adelanto;
        pagoExistente.Metodopago = await (await import("./MetodoPago.controllers")).verifyMetodoPago({ MetodoPagoId: pedidos.IdMetodoPagoAdelanto || 1 });
        await queryRunner.manager.save(pagoExistente);
      } else {
        await createPagoPedido(queryRunner, pedido, pedidos.Adelanto, 0, pedidos.IdMetodoPagoAdelanto || 1);
      }
    }

    // 4. Procesar nuevos Detalles
    if (detalles && detalles.Producto?.length > 0) {
      for (const prod of detalles.Producto) {
        let promocion = null;
        if (prod.idPromocion) {
          promocion = await verifyPromocion({ PromocionId: prod.idPromocion });
          if (promocion.LimiteUso > 0) {
            if (promocion.LimiteUso < prod.Cantidad) {
              throw new HttpError(400, `La promoción "${promocion.Nombre}" ha agotado su límite de uso.`);
            }
            promocion.LimiteUso -= prod.Cantidad;
            if (promocion.LimiteUso === 0) promocion.Estado = 0;
            await queryRunner.manager.save(promocion);
          }
        }

        let presentacion = null;
        if (prod.idPaquete) {
          presentacion = await verifyProductoMedida({ PaqueteId: prod.idPaquete });
        }

        await createDetallePedido(
          queryRunner,
          promocion,
          prod.Cantidad,
          presentacion,
          pedido,
          prod.Precio
        );
      }
    }

    await queryRunner.commitTransaction();
    return res.status(200).json({ message: "El pedido se actualizó correctamente" });

    } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: "Error al actualizar el pedido", 
      error: error instanceof Error ? error.message : "Error desconocido" 
    });
    } finally {
    await queryRunner.release();
    }
    };

    export const registrarPedidoRapido = async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
    const { pedidos, detalles, pagoFinal } = req.body;

    // 1. Registrar el pedido normalmente (pero forzamos estado finalizado al terminar)
    if (!pedidos.IdUsuario || !pedidos.IdSucursal) {
      throw new HttpError(400, "Usuario y Sucursal son requeridos.");
    }

    const nuevoIdPedido = await generarIdSecuencial('PED');
    const pedido = new Pedido();
    pedido.IdPedido = nuevoIdPedido;

    if (pedidos.IdPersona) {
      pedido.Persona = await verifyPersona({ PersonaId: pedidos.IdPersona });
    }

    pedido.Usuario = await verifyUsuario({ UsuarioId: pedidos.IdUsuario });
    pedido.Sucursal = await verifySucursal({ SucursalId: pedidos.IdSucursal });
    pedido.Total = Number(pedidos.Tota);
    pedido.FechaRegistro = pedidos.FechaRegistro || fecha ;
    pedido.Hora = pedidos.Hora || hora;
    pedido.Tipopedido = await verifyTipoPedido(pedidos.IdTipo);
    pedido.Estado = 3; // Estado 3: Entregado/Finalizado

    await queryRunner.manager.save(pedido);

    // 2. Procesar Detalles y Decrementar Stock inmediatamente
    if (detalles && detalles.Producto?.length > 0) {
      const { DecrementProducto, DecrementPromocion } = await import("./Inventario.controllers");

      for (const prod of detalles.Producto) {
        let promocion = null;
        if (prod.idPromocion) {
          promocion = await verifyPromocion({ PromocionId: prod.idPromocion });
          if (promocion.LimiteUso > 0) {
            promocion.LimiteUso -= prod.Cantidad;
            if (promocion.LimiteUso <= 0) promocion.Estado = 0;
            await queryRunner.manager.save(promocion);
          }
        }

        let presentacion = null;
        if (prod.idPaquete) {
          presentacion = await verifyProductoMedida({ PaqueteId: prod.idPaquete });
        }

        // Crear detalle pedido
        await createDetallePedido(queryRunner, promocion, prod.Cantidad, presentacion, pedido, prod.Precio);

        // Decrementar stock
        if (presentacion) {
          await DecrementProducto(queryRunner, presentacion, pedido.Sucursal.IdSucursal, prod.Cantidad, nuevoIdPedido);
        } else if (promocion) {
          await DecrementPromocion(queryRunner, pedido.Sucursal.IdSucursal, prod.Cantidad, promocion, nuevoIdPedido);
        }
      }
    }

    // 3. Crear Venta Oficial
    const nuevoIdVenta = await generarIdSecuencial('V');
    const venta = new Venta();
    venta.IdVenta = nuevoIdVenta;
    venta.FechaVenta = fecha;
    venta.HoraVenta = hora;
    venta.PrecioTotal = Number(pedido.Total);
    venta.Usuario = pedido.Usuario;
    venta.Persona = pedido.Persona;
    venta.Sucursal = pedido.Sucursal;
    venta.Pedido = pedido;
    await queryRunner.manager.save(venta);

    // 4. Registrar Pago
    if (pagoFinal) {
      await createPago(
        queryRunner,
        venta,
        Number(pagoFinal.Monto),
        Number(pagoFinal.Cambio) || 0,
        pagoFinal.IdMetodoPago || 1,
        pedido
      );
    }

    // 5. Crear Detalles de Venta
    const detallesPedido = await queryRunner.manager.find(await (await import("../entities/DetallePedido")).Detallepedido, { where: { Pedido: { IdPedido: nuevoIdPedido } }, relations: ["Producto", "Productomedida", "Promocion"] });

    for (const det of detallesPedido) {
      const { Detalleventa } = await import("../entities/DetalleVenta");
      const dv = new Detalleventa();
      dv.IdDetalleVenta = await generarIdSecuencial('DV');
      dv.Venta = venta;
      dv.Producto = det.Producto;
      dv.Productomedida = det.Productomedida;
      dv.Promocion = det.Promocion;
      dv.Cantidad = det.Cantidad;
      dv.Precio = det.Precio;
      await queryRunner.manager.save(dv);
    }

    await queryRunner.commitTransaction();
    return res.status(201).json({ 
      message: "Pedido registrado y entregado correctamente", 
      idPedido: nuevoIdPedido,
      idVenta: nuevoIdVenta 
    });

    } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: "Error en registro rápido", 
      error: error instanceof Error ? error.message : "Error desconocido" 
    });
    } finally {
    await queryRunner.release();
    }
    };