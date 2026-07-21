import API from './Api';

export const getInventario = async (IdSucursal, search = '', page = 1, limit = 10, categoria = '', subcategoria = '') => {
  try {
    const response = await API.get('getInventario', {
      params: { id: IdSucursal, search, page, limit, categoria, subcategoria }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener inventario:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const listarBajas = async (IdSucursal, Fecha, page = 1, limit = 20) => {
  try {
    const params = { page, limit };
    if (IdSucursal && IdSucursal !== 'TODOS') params.IdSucursal = IdSucursal;
    if (Fecha) params.Fecha = Fecha;
    const response = await API.get('inventario/baja', { params });
    return response.data;
  } catch (error) {
    console.error('Error al listar bajas:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const registrarBajaInventario = async (IdSucursal, items, Fecha) => {
  try {
    const response = await API.post('inventario/baja', { IdSucursal, items, Fecha });
    return response.data;
  } catch (error) {
    console.error('Error al dar de baja inventario:', error.response?.data?.message || error.message);
    throw error;
  }
};