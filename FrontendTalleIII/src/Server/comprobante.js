
import API from './api';

export const Comprobante = async () => {
  try {
    // This is a placeholder. Replace with the actual endpoint.
    const response = await API.get('Comprobante');
    return response.data;
    
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    throw error;
  }
};