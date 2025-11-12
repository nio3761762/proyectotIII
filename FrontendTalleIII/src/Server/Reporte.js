import API from './api';

export const ReporteProducto = async (fechadesde, fechahasta, sucursales, subcategorias ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (sucursales) params.sucursales = sucursales;
    if (subcategorias) params.subcategorias = subcategorias;


    const response = await API.get('reporte/productos', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const ReporteVenta = async (IdSucursal, fechadesde, fechahasta, Metodopago, IdVendedor ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (IdSucursal) params.IdSucursal = IdSucursal;
    if (Metodopago) params.Metodopago = Metodopago;
    if (IdVendedor) params.IdVendedor = IdVendedor;


    const response = await API.get('reporte/ventas', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const ReportePedido = async (fechadesde, fechahasta, IdSucursal, IdEstado, IdEstadoVenta, IdMetodoPago, TipoCliente, IdCategoria, subcategorias ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (IdSucursal) params.IdSucursal = IdSucursal;
    if (IdEstado && IdEstado !== '0') params.IdEstado = IdEstado;
    if (IdEstadoVenta && IdEstadoVenta !== '0') params.IdEstadoVenta = IdEstadoVenta;
    if (IdMetodoPago && IdMetodoPago !== '0') params.IdMetodoPago = IdMetodoPago;
    if (TipoCliente) params.TipoCliente = TipoCliente;
    if (subcategorias) params.subcategorias = subcategorias;


    const response = await API.get('reporte/pedidos', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const ReporteInsumo = async (fechadesde, fechahasta, IdSucursal ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (IdSucursal) params.IdSucursal = IdSucursal;
  
    const response = await API.get('reporte/produccion-insumos', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};