
import API from './api';
import { Password } from 'primevue';

//listar usuarios

export const listarPedidoSucursal = async (id,fecha, pago) => {
  try {
  console.log(id,fecha, pago)
    const response = await API.get(`getPedidoSucursal/${id}/${fecha}/${pago}`)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
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

export const listarReservaUsuario = async (id) => {
  try {
    const response = await API.get(`reservasUsuario/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};
export const anularReserva = async (id,IdSucursal) => {
  try {
    const response = await API.put(`anularPedido/${id}`);
     console.log(response.data)
    return response.data;
   
  } catch (error) {
     console.error('Error al anular la venta:',error);
    throw error;
  }
};

export const RegistrarReserva = async (Dato) => {
  try {
    const response = await API.post('Addpedidos', { 
      reservas:Dato, 
      detalles:Dato.detalles
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const updateReserva = async (Dato) => {
  try {
    const response = await API.put(`updPedido/${Dato.IdPedido}`, { 
      reservas:Dato, 
      detalles:Dato.detalles
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const actualizarEstadoReserva = async (id, data) => {
  try {
    const response = await API.put(`enviarPedido/${id}`, {data:data});
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estado de la reserva:', error);
    throw error;
  }
};

export const CompletarPago = async (dato) => {
  try {
    const response = await API.put(`PagarPedido/${dato.IdPedido}`,{
        Registrar:dato
    });
     console.log(response.data)
    return response.data;

  } catch (error) {
     console.error('Error al anular el pedido:',error);
    throw error;
  }
};