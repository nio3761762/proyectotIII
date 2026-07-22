import API from './api';
export const ReporteComisionDetallado = async (  fechadesde, fechahasta, idempleado, idsucursal) => {
  try {
      const params = {
       fechadesde, fechahasta, idempleado, idsucursal
    };


    const response = await API.get(`reporte/revendedor-detallado`, { params });
    return response.data;
 

  } catch (error) {
    console.error('Error al obtener las compras:', error);
    throw error;
  }
};
export const ReporteComisionConsolidado = async (  fechadesde, fechahasta, idempleado, idsucursal) => {
  try {
      const params = {
       fechadesde, fechahasta, idempleado, idsucursal
    };


    const response = await API.get(`reporte/revendedor-consolidado`, { params });
  
    return response.data;
   

  } catch (error) {
    console.error('Error al obtener las compras:', error);
    throw error;
  }
};



export const ReproteFinanciero = async (fechadesde, fechahasta, idsucursal ) => {
  try {
     const params = {
      fechadesde,
      fechahasta
    };
   
    if(idsucursal) params.idsucursal=idsucursal

    const response = await API.get('reporte/financiero-consolidado', { params });
  
   
    return response.data;
  
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return null;
    }
    console.error('Error al obtener los insumos:', error);
    throw error;
  }
};



export const ReporteProduccion = async (fechadesde, fechahasta, idsucursal,idproducto ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (idsucursal) params.idsucursal = idsucursal;
    if (idproducto) params.idproducto = idproducto;
    const response = await API.get('reporte/produccion-detallado', { params });
  
    return response.data;
  

  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const ReporteProduccionConsolidado = async (fechadesde, fechahasta, idsucursal,idproducto) =>{
   try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (idsucursal) params.idsucursal = idsucursal;
    if (idproducto) params.idproducto = idproducto;

    const response = await API.get('reporte/produccion-consolidado', { params });
 
    return response.data;

  } catch (error) {
    console.error('Error al obtener reporte producción:', error);
    throw error;
  }
}

export const ReporteVenta = async (IdSucursal = 'TODOS', fechadesde, fechahasta, IdVendedor, IdCliente, IdMetodoPago, Estado  ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (IdSucursal) params.idsucursal = IdSucursal;
    if (IdMetodoPago) params.idmetodopago = IdMetodoPago;
    if (IdVendedor) params.idusuario = IdVendedor;
    if (IdCliente) params.idcliente = IdCliente;
    if(Estado) params.estado = Estado


    const response = await API.get('/reporte/ventas-detallado', { params });
 
    return response.data;
   
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const ReporteVentaConsolidada = async (idsucursal = 'TODOS', fechadesde, fechahasta, idusuario ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };
    // parámetros opcionales
   if (idsucursal) params.idsucursal = idsucursal;              
   if (idusuario) params.idusuario = idusuario;


    const response = await API.get('/reporte/ventas-consolidado', { params });
  
    return response.data;
    


} catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};


export const ReporteTransferencia = async ( fechadesde, fechahasta, idsucursalorigen, idsucursaldestino,idempleado ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (idsucursalorigen) params.idsucursalorigen = idsucursalorigen;
     if (idsucursaldestino) params.idsucursaldestino = idsucursaldestino;
    if(idempleado) params.idempleado = idempleado
    const response = await API.get('/reporte/transferencias-detallado', { params });
    return response.data;
 
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};


export const ReporteTransferenciaConsolidada = async ( fechadesde, fechahasta, idsucursalorigen, idsucursaldestino,idempleado ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (idsucursalorigen) params.idsucursalorigen = idsucursalorigen;
     if (idsucursaldestino) params.idsucursaldestino = idsucursaldestino;
      if(idempleado) params.idempleado = idempleado
    const response = await API.get('/reporte/transferencias-consolidado', { params });
    return response.data;

   
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};


export const ReportePedido = async (fechadesde, fechahasta, idsucursal, idestado, idtipopedido, idcliente ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (idsucursal) params.idsucursal = idsucursal;
    if (idestado) params.idestado = idestado;
    if (idtipopedido ) params.idtipopedido = idtipopedido;
    if (idcliente) params.idcliente = idcliente;


    const response = await API.get('reporte/pedidos-detallado', { params });
    return response.data;
  
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const ReportePedidoConsolidado = async (fechadesde, fechahasta, idsucursal, idtipopedido ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (idsucursal) params.idsucursal = idsucursal;
    if (idtipopedido ) params.idtipopedido = idtipopedido;
   
    const response = await API.get('reporte/pedidos-consolidado', { params });
    return response.data;

  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};


export const ReportePresioHistorico = async (fechadesde, fechahasta, idproveedor, idinsumo ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };

    // parámetros opcionales
    if (idproveedor) params.idproveedor = idproveedor;
    if (idinsumo) params.idinsumo = idinsumo;
  
    const response = await API.get('reporte/precios-historico', { params });
  
    return response.data;
    

} catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const ReporteCompraConsolidada = async (fechadesde, fechahasta, idproveedor, idinsumo) => {
  try {
    const params = {
      fechadesde,
      fechahasta
    };

    if (idproveedor) params.idproveedor = idproveedor;
    if (idinsumo) params.idinsumo = idinsumo;

    const response = await API.get('reporte/compras-consolidado', { params });

    return response.data;

  } catch (error) {
    console.error('Error al obtener compras consolidadas:', error);
    throw error;
  }
};

export const ReporteInventario = async (idsucursal, tipo, iditem  ) => {
  try {
  
        const params = {};

     if (iditem) params.iditem = iditem;
     if (tipo) params.tipo = tipo;
      if (idsucursal) params.idsucursal = idsucursal;

    const response = await API.get('reporte/inventario-consolidado', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};


export const ReporteKardex = async (iditem, tipo, idsucursal, fechadesde, fechahasta ) => {
  try {
        const params = {
      fechadesde,
      fechahasta
    };
   // parámetros opcionales
    if (idsucursal) params.idsucursal = idsucursal;
      if (iditem) params.iditem = iditem;
        if (tipo) params.tipo = tipo;
  
    const response = await API.get('reporte/kardex', { params });
    return response.data;
 
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};
export const ReporteGastosGenerales = async (fechadesde, fechahasta) => {
  try {
    const params = { fechadesde, fechahasta };
    const response = await API.get('reporte/gastos-generales', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener gastos generales:', error);
    throw error;
  }
};

// ========================
// REPORTES SEMANALES
// ========================
export const ReporteSemanalVentas = async (fechadesde, fechahasta, idsucursal) => {
  try {
    const params = { fechadesde, fechahasta, idsucursal };
    const response = await API.get('reporte-semanal/ventas', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal ventas:', error);
    throw error;
  }
};

export const ReporteSemanalPedidos = async (fechadesde, fechahasta, idsucursal) => {
  try {
    const params = { fechadesde, fechahasta, idsucursal };
    const response = await API.get('reporte-semanal/pedidos', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal pedidos:', error);
    throw error;
  }
};

export const ReporteSemanalProduccion = async (fechadesde, fechahasta, idsucursal) => {
  try {
    const params = { fechadesde, fechahasta, idsucursal };
    const response = await API.get('reporte-semanal/produccion', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal produccion:', error);
    throw error;
  }
};

export const ReporteSemanalTransferencias = async (fechadesde, fechahasta) => {
  try {
    const params = { fechadesde, fechahasta };
    const response = await API.get('reporte-semanal/transferencias', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal transferencias:', error);
    throw error;
  }
};

export const ReporteSemanalCompras = async (fechadesde, fechahasta) => {
  try {
    const params = { fechadesde, fechahasta };
    const response = await API.get('reporte-semanal/compras', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal compras:', error);
    throw error;
  }
};

export const ReporteSemanalGastosGenerales = async (fechadesde, fechahasta) => {
  try {
    const params = { fechadesde, fechahasta };
    const response = await API.get('reporte-semanal/gastos-generales', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal gastos generales:', error);
    throw error;
  }
};

export const ReporteSemanalFinanciero = async (fechadesde, fechahasta, idsucursal) => {
  try {
    const params = { fechadesde, fechahasta, idsucursal };
    const response = await API.get('reporte-semanal/financiero', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal financiero:', error);
    throw error;
  }
};

export const ReporteSemanalComisiones = async (fechadesde, fechahasta, idsucursal) => {
  try {
    const params = { fechadesde, fechahasta, idsucursal };
    const response = await API.get('reporte-semanal/comisiones', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal comisiones:', error);
    throw error;
  }
};

export const ReporteSemanalKardex = async (fechadesde, fechahasta, idsucursal) => {
  try {
    const params = { fechadesde, fechahasta, idsucursal };
    const response = await API.get('reporte-semanal/kardex', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal kardex:', error);
    throw error;
  }
};

export const ReporteSemanalGeneral = async (fechadesde, fechahasta, idsucursal) => {
  try {
    const params = { fechadesde, fechahasta, idsucursal };
    const response = await API.get('reporte-semanal/resumen-general', { params });
    return response.data;
  } catch (error) {
    console.error('Error en reporte semanal general:', error);
    throw error;
  }
};
