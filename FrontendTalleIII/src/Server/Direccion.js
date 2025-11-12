import API from './api';

export const getDepartamento = async () => {
  try {
    const response = await API.get(`getDepartamento`);
    return response.data;
  } catch (error) {
     console.error('Error al obtener los departamentos:',error);
    throw error;
  }
};

export const getCiudad = async (id) => {
  try {
    const response = await API.get(`getCiudad/${id}`);
    return response.data;
  } catch (error) {
     console.error('Error al obtener las ciudades:',error);
    throw error;
  }
};

export const getDistrito = async (id) => {
  try {
    const response = await API.get(`getDistrito/${id}`);
    return response.data;
  } catch (error) {
     console.error('Error al obtener los distritos:',error);
    throw error;
  }
};

export const getBarrio = async (id) => {
  try {
    const response = await API.get(`getBarrio/${id}`);
    return response.data;
  } catch (error) {
     console.error('Error al obtener los barrios:',error);
    throw error;
  }
};

export const getDireccionCompletaPorBarrio = async (id) => {
  try {
    const response = await API.get(`getDireccionCompleta/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener la dirección completa:', error);
    throw error;
  }
};