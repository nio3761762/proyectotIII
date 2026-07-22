import API from './api';

export const listProductoVista = async (search,page,limit) => {

  try {
    const params = {
      search,
      page,
      limit
    }
    const response = await API.get('productos-vista',{ params });
    return response.data;
  } catch (error) {
    console.error('Error al listar productos vista:', error);
    throw error;
  }
};




export const ListarProductosOnSucursal = async (idsucursal,search,limit, page,categoria,subcategoria) =>{
  try {
    const params = {
      id:idsucursal,
      page,
      limit
    }
    if(search) params.search = search
    if(categoria) params.categoria = categoria
    if(subcategoria) params.subcategoria = subcategoria
    const response = await API.get('getInventario', { params });
    return response.data;
  } catch (error) {
    console.error('Error al listar productos por sucursal:', error);
    throw error;
  }
}

export const listProduct = async () => {

  try {
    const response = await API.get('getproducto');
    return response.data;
  } catch (error) {
    console.error('Error al listar productos:', error);
    throw error;
  }
};

export const listMedidasdeProducto = async (id) => {
  try {
    const response = await API.get(`getmedidasdelProducto/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al listar medidas de producto:', error);
    throw error;
  }
};

export const listProductMedida = async () => {

  try {
    const response = await API.get('getProductomedidas');
    return response.data;
  } catch (error) {
    console.error('Error al listar productos medida:', error);
    throw error;
  }
};

export const listarProductos = async (search, estado, categoria, subcategoria, page , limit, signal  ) => {
  try {
    const params = {
      page,
      limit
    };
    if(estado!=-1) params.estado = estado
    if(search) params.search=search
    if(categoria)params.categoria=categoria
    if(subcategoria) params.subcategoria=subcategoria 
    
    const response = await API.get('productos' , { params, signal  });
    return response.data;

  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return null;
    }
    console.error('Error al obtener los productos:', error);
    throw error;
  }
};


export const DeleteProducto = async (id) => {
  try {
    const response = await API.delete(`productos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};

export const addProducto = async (Producto) => {
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

export const updateCreatePrecioProducto = async (Precio) => {
  try {
    const response = await API.post('updateCreatePrecioProducto',{
       Precio: Precio
    }
       );
    return response.data;
   
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const updateProducto = async (Producto) => {
  try {
    const response = await API.put(`producto/${Producto.id}`, {
    RegistroProducto : Producto
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const getProductoIngrediente = async (id) => {
  try {
    const response = await API.get(`getProductoIngrediente/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const getPrecioProducto = async (id) => {
  try {
    const response = await API.get(`getmedidasdelProductoPrecio/${id}`);
    return response.data;

  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


