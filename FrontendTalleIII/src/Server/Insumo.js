import API from './api';

export const listarInsumos = async (search, estado, categoria, subcategoria, page , limit, signal ) => {
  try {
     const params = {
      page,
      limit
    };
    if(estado!=-1) params.estado = estado
    if(search) params.search=search
    if(categoria)params.categoria=categoria
    if(subcategoria) params.subcategoria=subcategoria

    const response = await API.get('getInsumo', { params, signal });
    return response.data;
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return null;
    }
    console.error('Error al obtener los insumos:', error);
    throw error;
  }
};

export const crearInsumo = async (Producto) => {
  try {
 

    const response = await API.post('postInsumo',{
       RegistroProducto: Producto
    }
       );
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const AgregarPhotoInsumo = async (id, foto ) => {
  try {
    const response = await API.put(`Photoinsumo/${id}`, {
      Foto:foto
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la imagen del usuario:', error);
    throw error;
  }
};
export const actualizarInsumo = async (Producto) => {
  try {
    const response = await API.put(`putInsumo/${Producto.id}`, {
    RegistroProducto : Producto
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const eliminarInsumo = async (id) => {
  try {
    const response = await API.delete(`delInsumo/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};

export const ListInsumo = async () => {
  try {
    const response = await API.get('listInumo');
  
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const listarInsumoConMedidas = async (id) => {
  try {
    const response = await API.get(`getInsumoInMedida/${id}`);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener insumos en medida:', error);
    throw error;
  }
};
