
import API from './api';

export const listarCompras = async (fecha) => {
  try {
    // This is a placeholder. Replace with the actual endpoint.
    const response = await API.get(`getCompras/${fecha}`);
    return response.data;
    
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    throw error;
  }
};

export const registrarCompra = async (compraData) => {
  try {
    // This is a placeholder. Replace with the actual endpoint.
    const response = await API.post('registrarCompra',   {Compras:compraData, detalles:compraData.detalles});
    return response.data; 
  } catch (error) {
    console.error('Error al registrar la compra:', error);
    throw error;
  }
};

export const anularCompra = async (idCompra) => {
  try {
    // This is a placeholder. Replace with the actual endpoint.
    const response = await API.put(`anularCompra/${idCompra}`);
    return response.data;

    } catch (error) {
    console.error('Error al anular la compra:', error);
    throw error;
  }
};

export const updateCompra = async (compraData) => {
  try {
    // This is a placeholder. Replace with the actual endpoint.
    const response = await API.put(`updateCompra/${compraData.IdCompra}`, 
      {Compras:compraData, detalles:compraData.detalles});
    return response.data;

     } catch (error) {
    console.error('Error al actualizar la compra:', error);
    throw error;
  }
};
