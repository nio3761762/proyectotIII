
import API from './api';

export const listarPromociones = async () => {
  try {
    const response = await API.get('promociones');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las promociones:', error);
    throw error;
  }
};

export const listarPromocionactiva = async () => {
  try {
    const response = await API.get('promocionactiva');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las promociones:', error);
    throw error;
  }
};

export const registrarPromocion = async (promocion) => {
  try {
    const response = await API.post('promocion', {
      RegistrarPromocion:promocion
    });
    return response.data;
  } catch (error) {
    console.error('Error al registrar la promoción:', error.response);
    throw error;
  }
};

export const updatePromocion = async (promocion) => {
  try {
    const response = await API.put(`promocion/${promocion.id}`, {
     RegistrarPromocion:promocion
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const actualizarPromocion = async (promocion) => {
  try {
    const response = await API.put(`promocion/${promocion.IdPromocion}`, {
      RegistrarPromocion:promocion
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la promoción:', error.response);
    throw error;
  }
};

export const eliminarPromocion = async (id) => {
  try {
    const response = await API.delete(`promociones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};

export const buscarPromocion = async (id) => {
  try {
    const response = await API.get(`Onepromocione/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};