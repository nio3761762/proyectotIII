import API from './api';

/**
 * Lista todos los repartidores.
 */
export const listarRepartidores = async () => {
  try {
    const response = await API.get('repartidor');
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const listarRepartidorActivos = async () => {
  try {
    const response = await API.get('repartidoractivo');
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};
export const listarTipoLiecencia = async () => {
  try {
    const response = await API.get('tipolicencia');
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};

export const listarEpresaReoparto = async () => {
  try {
    const response = await API.get('empresareparto');
    return response.data;
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    throw error;
  }
};


export const registrarRepartidor = async (dato) => {
  try {
    const response = await API.post('repartidor', {PersonaData:dato} ) ;
    return response.data;
  } catch (error) {
    console.error('Error al registrar el repartidor:', error.response);
    throw error;
  }
};

export const actualizarRepartidor = async (dato) => {
  try {
    const response = await API.put(`repartidor/${dato.IdRepartidor}`, {PersonaData:dato});
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el repartidor:', error.response);
    throw error;
  }
};


export const cambiarEstadoRepartidor = async (id) => {
  try {
    // Asumimos un endpoint tipo DELETE para cambiar estado, similar a usuarios
    const response = await API.delete(`repartidor/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar el estado del repartidor:', error);
    throw error;
  }
};
