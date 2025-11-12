import API from './api';

export const createFactura = async (factura) => {
  try {
    const response = await API.post('factura',{
       factura: factura
    }
       );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const updatefactura = async (factura) => {
  try {
    const response = await API.put(`insertarEnlaceFactura/${factura.IdFactura}`, { 
      factura:factura, 
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const ObtenerFactura = async (id) => {
  try {
    const response = await API.get(`ObtenerFactura/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


