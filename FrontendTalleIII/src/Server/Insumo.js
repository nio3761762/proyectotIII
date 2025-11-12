import API from './api';

export const listarInsumos = async () => {
  try {
    const response = await API.get('getInsumo');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const crearInsumo = async (Producto) => {
  try {
    const response = await API.post('producto',{
       RegistroProducto: Producto
    }
       );
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const actualizarInsumo = async (Producto) => {
  try {
    const response = await API.put(`producto/${Producto.id}`, {
    RegistroProducto : Producto
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const eliminarInsumo = async (id) => {
  try {
    const response = await API.delete(`productos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};