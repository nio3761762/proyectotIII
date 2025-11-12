import API from './api';

export const listarTipoPromocion = async () => {
  try {
    const response = await API.get('tipopromocion');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los tipos de promoción:', error);
    throw error;
  }
};
