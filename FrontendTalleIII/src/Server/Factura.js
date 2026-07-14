import API from './api';

export const createFactura = async (factura) => {
  try {
    const response = await API.post('factura',{
       factura: factura
    }
       );
    return response.data;
  } catch (error) {
    console.warn('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const insertarEnlaceFactura = async (factura) => {
  try {
    const response = await API.put(`insertarEnlaceFactura/${factura.IdFactura}`, { 
      factura:factura, 
    });
   
    return response.data;
  } catch (error) {
    console.warn('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const ObtenerFactura = async (id) => {
  try {
    const response = await API.get(`ObtenerFactura/${id}`);
   
    return response.data;
  } catch (error) {
    console.warn('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


