import API from './api';

export const listarControlRevendedor = async (fecha, idEmpleado, idSucursal, page, limit) => {
  try {
    const params = {
      fecha,
      idEmpleado,
      idSucursal,
      page,
      limit
    };
    const response = await API.get('revendedorControl', { params });
   
    return response.data;


  } catch (error) {
    console.error('Error al obtener los controles de revendedor:', error);
    throw error;
  }
};

export const registrarcontrolRevendedor = async (controles) => {
  try {
    const response = await API.post('revendedorControl', {
      controles
    });
    return response.data;
   
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const Controldetales = async (id, payload) => {
  try {
    const { precioVenta, cantidadDevuelta, motivo, precios } = payload;

    const response = await API.put(`revendedorControlDetalle/${id}`, {
      precioVenta,
      cantidadDevuelta,
      motivo,
      precios
    });

    return response.data;
  } catch (error) {
    console.error('Error al intentar actualizar detalle:', error.response);
    throw error;
  }
};
