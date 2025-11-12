import API from './api';

// Lista todas las categorías de medida con sus unidades
export const listarMedidas = async () => {
  try {
    // Asumimos que este endpoint ahora devuelve las categorías con sus unidades anidadas
    const response = await API.get('getMedidas'); 
    return response.data;
  } catch (error) {
    console.error('Error al obtener las categorías de medida:', error);
    throw error;
  }
};

export const listarCategoriaMedidas = async () => {
  try {
    // Asumimos que este endpoint ahora devuelve las categorías con sus unidades anidadas
    const response = await API.get('getCategoriaMedidas'); 
    return response.data;
  } catch (error) {
    console.error('Error al obtener las categorías de medida:', error);
    throw error;
  }
};
// Registrar una nueva categoría de medida y sus unidades
export const RegistrarCategoriaMedida = async (categoriaMedida) => {
  try {
    const response = await API.post('createCategoriaMedida', {
      Registro: categoriaMedida
    });
    return response.data;
  } catch (error) {
    console.error('Error al registrar la categoría de medida:', error.response);
    throw error;
  }
};

// Actualizar una categoría de medida y sus unidades
export const UpdateCategoriaMedida = async (categoriaMedida) => {
  try {
    const response = await API.put(`updateCateriaMedida/${categoriaMedida.IdCategoriaMedida}`, {
      Registro: categoriaMedida
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la categoría de medida:', error.response);
    throw error;
  }
};

// Desactivar/Activar una categoría de medida
export const DeleteCategoriaMedida = async (id) => {
  try {
    const response = await API.delete(`deleteCategoriaMedida/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar el estado de la categoría de medida:', error);
    throw error;
  }
};

export const ObtenrCategoriaMedida = async (id) => {
  try {
    const response = await API.get(`ObtenrCategoriaMedida/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar el estado de la categoría de medida:', error);
    throw error;
  }
};

export const ObtenerMedidas = async (id) => {
  try {
    const response = await API.get(`ObtenerMedidas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar el estado de la categoría de medida:', error);
    throw error;
  }
};