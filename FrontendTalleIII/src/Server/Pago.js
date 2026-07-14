import API from './api';

export const registrarPago = async (pagoData) => {
  try {
    const response = await API.post('/pagos', pagoData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    throw error;
  }
};

export const listarPagoReserva = async (id) => {
  try {
    const response = await API.get(`getpagoVenta/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pagos de la venta:', error);
    throw error;
  }
};

export const listarPagoVenta = async (id) => {
  try {
    const response = await API.get(`getpagoVenta/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pagos de la venta:', error);
    throw error;
  }
}

export const listarPago = async () => {
  try {
    const response = await API.get(`getpago`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    throw error;
  }
};