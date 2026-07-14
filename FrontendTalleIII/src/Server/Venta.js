
import API from './api';
import { Password } from 'primevue';

//listar usuarios

export const listarVentaSucursal = async (producto, promocion,id,fecha, pago,page, limit, tienefactura) => {
  try {
    const params ={
      id,
      page, 
      limit,
      fecha
    }
    if(producto) params.producto = producto
    if(promocion) params.promocion = promocion
    if(pago) params.pago = pago
    if( tienefactura) params.factura = tienefactura
    const response = await API.get(`ventasSucursal`, { params})
  
    return response.data;
 } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};





export const anularVenta = async (id) => {
  try {
    const response = await API.put(`Anularventas/${id}`);
   
    return response.data;
  } catch (error) {
     console.error('Error al anular la venta:',error);
    throw error;
  }
};


export const actualizarventa = async (id, Dato) => {
  try {
    const response = await API.put(`ventas/${id}`, { 
      ventas: Dato, 
      detalles: Dato.detalles
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la venta:', error);
    throw error;
  }
};

export const RegistrarVenta = async (Dato) => {
  try {
    const response = await API.post('ventas', { 
      ventas:Dato, 
      detalles:Dato.detalles
    });
  // este es el metodo de como se reciven los datos el back end   
// export const registrarVenta = async (req: Request, res: Response) => {
//   const queryRunner = AppDataSource.createQueryRunner();
//   await queryRunner.connect();
//   await queryRunner.startTransaction();

//   try {
//     const { ventas, detalles } = req.body;

//     // 1. Validaciones básicas
//     if (!ventas.IdUsuario || !ventas.IdSucursal) {
//       throw new HttpError(400, "Usuario y Sucursal son requeridos para la venta.");
//     }

//     // 2. Generar ID y preparar cabecera de Venta
//     const nuevoIdVenta = await generarIdSecuencial('V');
//     const venta = new Venta();
//     venta.IdVenta = nuevoIdVenta;

//     // 3. Manejo de Cliente (Persona)
//     if (ventas.Nombre) {
//       ventas.IdCliente = await DataPersona(ventas);
//     }
//     if (ventas.IdCliente) {
//       venta.Persona = await verifyPersona({ PersonaId: ventas.IdCliente });
//     }

//     venta.Usuario = await verifyUsuario({ UsuarioId: ventas.IdUsuario });
//     venta.Sucursal = await verifySucursal({ SucursalId: ventas.IdSucursal });

   
//     venta.FechaVenta = fecha;
//     venta.HoraVenta = hora;
  

//     // Guardar venta dentro de la transacción
//     await queryRunner.manager.save(venta);

//     // 4. Registro de Pago
//     await createPago(
//       venta, 
//       ventas.Monto, 
//      ventas.Cambio, 
//        ventas.IdMetodoPago 
//     );

//     // 5. Procesar Detalles (Presentaciones Productos, Promociones)
//     if (detalles) {
//       if (detalles.Producto?.length > 0) {
//         for (const prod of detalles.Producto) {
//           let promocion = null;
//           if (prod.idPromocion) {
//             promocion = await verifyPromocion({ PromocionId: prod.idPromocion });
//             // Verificar límite de uso si existe
//             if (promocion.LimiteUso !== null) {
//               if (promocion.LimiteUso < prod.Cantidad) {
//                 throw new HttpError(400, `La promoción "${promocion.Nombre}" ha agotado su límite de uso o no tiene suficiente disponible.`);
//               }
//               promocion.LimiteUso -= prod.Cantidad;
//               if(promocion.LimiteUso == 0 )
//                 promocion.Estado = 0
//               await queryRunner.manager.save(promocion);
//             }
//           }

//           let presentacion = null;
//           if (prod.idPaquete) {
//             presentacion = await verifyProductoMedida({ PaqueteId: prod.idPaquete });
//           }
//           await createDetalleventa(
//             venta,
//             presentacion,
//             promocion,
//             prod.Cantidad,
//             prod.precioUnitario,
//             ventas.IdSucursal
//           );
//         }
//       }
//     }

//     // Confirmar todo si llegamos aquí
//     await queryRunner.commitTransaction();
//     return res.status(201).json({ 
//       message: "La venta se registró correctamente", 
//       idVenta: nuevoIdVenta 
//     });

//   } catch (error) {
//     // Si algo falla, revertimos todos los cambios (Venta, Pagos e Inventario)
//     await queryRunner.rollbackTransaction();

//     if (error instanceof HttpError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     return res.status(500).json({ 
//       message: "Error al registrar la venta", 
//       error: error instanceof Error ? error.message : "Error desconocido" 
//     });
//   } finally {
//     // Liberar el query runner
//     await queryRunner.release();
//   }
// };
  ;
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const agregarClienteVenta = async (Dato) => {
  try {
    const response = await API.put(`agregarClienteVenta/${Dato.IdVenta}`, { 
      ventas:Dato, 
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


