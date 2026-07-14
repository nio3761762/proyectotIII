import API from './api';

export const listarGastosGenerales = async (search, fechadesde, fechahasta, page, limit) => {
  try {
    const params = { limit, page };
    if (search) params.search = search;
    if (fechadesde) params.fechadesde = fechadesde;
    if (fechahasta) params.fechahasta = fechahasta;

    const response = await API.get(`getGastosGenerales`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener gastos generales:', error);
    throw error;
  }
};

export const registrarGastoGeneral = async (nombre, fecha, costo) => {
  try {
    const response = await API.post('registrarGastoGeneral', { nombre, fecha, costo });
    return response.data;
  } catch (error) {
    console.error('Error al registrar gasto general:', error);
    throw error;
  }
};

export const anularGastoGeneral = async (id) => {
  try {
    const response = await API.delete(`anularGastoGeneral/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al anular gasto general:', error);
    throw error;
  }
};

export const updateGastoGeneral = async (id, nombre, fecha, costo) => {
  try {
    const response = await API.put(`actualizarGastoGeneral/${id}`, { nombre, fecha, costo });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar gasto general:', error);
    throw error;
  }
};
