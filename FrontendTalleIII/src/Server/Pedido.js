import API from './api';

//listar pedidos
export const listarPedidoSucursal = async (id,fecha, pago) => {
  try {
  console.log(id,fecha, pago)
    const response = await API.get(`getPedidoSucursal/${id}/${fecha}/${pago}`)
    return response.data;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

export const listarPedidoUsuario = async (id) => {
  try {
    const response = await API.get(`pedidosUsuario/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};
export const anularPedido = async (id,IdSucursal) => {
  try {
    const response = await API.put(`anularPedido/${id}`,{
        IdSucursal:IdSucursal
    });
     console.log(response.data)
    return response.data;

  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};

export const enviarPedido = async (id,IdSucursal) => {
  try {
    const response = await API.put(`enviarPedido/${id}`,{
        IdSucursal:IdSucursal
    });
     console.log(response.data)
    return response.data;

  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};

export const PagarPedido = async (id,dato) => {
  try {
    const response = await API.put(`PagarPedido/${id}`,{
        Registrar:dato
    });
     console.log(response.data)
    return response.data;

  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};

export const PonerProceso = async (id) => {
  try {
    const response = await API.put(`PonerProceso/${id}`);
     console.log(response.data)
    return response.data;

  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};

export const RegistrarPedido = async (Dato) => {
  try {
    const response = await API.post('Addpedidos', {
      Registrar:Dato,
      ventas:Dato.ventas,
      detalles:Dato.detalles
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const UpdatePedido = async (Dato) => {
  try {
    const response = await API.put(`updPedido/${Dato.id}`, {
      Registrar:Dato,
      ventas:Dato.ventas,
      detalles:Dato.detalles
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
