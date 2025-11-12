import API from './api';

export const listarTipoEntrega = async () => {
  try {
  const response = await API.get('getTipoEntrega')
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const listarEntregaSucursal = async (id,fecha) => {
  try {
    const response = await API.get(`getEntregaSucursal/${id}/${fecha}`)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const ObtenerEntrega = async (id) => {
  try {
    const response = await API.get(`ObtenerEntrega/${id}`)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const obteneralCliente = async (id) => {
  try {
    const response = await API.get(`obteneralCliente/${id}`)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const obteneDetalles = async (id) => {
  try {
    const response = await API.get(`obtenerDetalles/${id}`)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};



export const actualizarlaDireccion = async (dato) => {
  try {
    const response = await API.put(`actualizarlaDireccion/${dato.IdEntrega}`,{
      detalles:dato
    })
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};
export const DevolucionEntrega = async (dato) => {
  try {
    const response = await API.put(`DevolucionEntrega/${dato.IdEntrega}`,
      {
        detalles:dato,
        comentario:dato.comentario
      }
    )
    return response.data;
  } catch (error) {
    console.error('Error al procesar la devolucion:', error);
    throw error;
  }
};