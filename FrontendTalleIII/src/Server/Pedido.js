import API from './api';


export const listarPedidoSucursal = async ( estado,tipopedido, idsucursal,producto,promocion,fecha, page,limit,search) => {
  try {
    const params = {
      page,
      limit,
      fecha
    };

    if(search) params.search=search
    if(producto)params.producto=producto
    if(tipopedido) params.tipopedido=tipopedido
    if(promocion) params.promocion=promocion
    if(idsucursal) params.idsucursal=idsucursal
    if(estado) params.estado=estado

    const response = await API.get(`pedidos`,{ params })
    return response.data;
  
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};
export const Registrorapido = async (pedidos, detalles, pagoFinal) => {
  try {
    const response = await API.post('AddpedidosRapido',{pedidos, detalles, pagoFinal});
   
    return response.data;


  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};

export const anularPedido = async (id) => {
  try {
    const response = await API.put(`anularPedido/${id}`);
   
    return response.data;
  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};

export const AtualizarPedido = async (id,Dato,detalles) => {
  try {
    const response = await API.put(`actualizarPedido/${id}`, {
      pedidos:Dato,
      detalles:detalles
    });
     
    return response.data;

  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};



export const enviarPedido = async (id) => {
  try {
    const response = await API.put(`enviarPedido/${id}`);
   
    return response.data;

  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};



export const FinalizarPedido = async (id,pago) => {
  try {
    const response = await API.put(`finalizarPedido/${id}`,{
      pagoFinal:pago
    });
   
    return response.data;

  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};

export const RegistrarPedido = async (Dato,detalles) => {
  try {
    const response = await API.post('Addpedidos', {
      pedidos:Dato,
      detalles:detalles
    });
  ;
    return response.data;
   } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const devolverProducto = async (id, idDetallePedido, cantidadDevolver,descripcion) => {
  try {
    const response = await API.put(`devolverProducto/${id}`, {
    idDetallePedido, cantidadDevolver, descripcion
    });
  ;
   return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const listarTipopedido = async () => {
  try {
  const response = await API.get('getTipopedido')
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};
