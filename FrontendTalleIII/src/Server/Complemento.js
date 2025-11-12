import API from './api';


export const listarComplemento = async () => {
  try {
    const response = await API.get('Complemento');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los complementos:', error);
    throw error;
  }
};

export const listarDocumento = async () => {
  try {
    const response = await API.get('getDocumento');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los complementos:', error);
    throw error;
  }
};
export const listarEmail = async () => {
  try {
    const response = await API.get('getEmail');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los complementos:', error);
    throw error;
  }
};

export const listarNumero = async () => {
  try {
    const response = await API.get('getCelular');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los complementos:', error);
    throw error;
  }
};
