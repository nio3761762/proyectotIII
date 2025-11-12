import API from './api';

export const getMarcas = async () => {
  try {
    const response = await API.get(`marcas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pagos de la venta:', error);
    throw error;
  }
};
