import API from './api';


export const listarPaquetesEnProductos = async (id) => {
  try {
   const params = {
      id
    };
    const response = await API.get('unique-packages-summed', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarEnProductos = async (id, subcategoriaId) => {

  try {
   const params = {
      id,
      subcategoriaId
    };
    const response = await API.get('unique-products-summed', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};


export const listarProductos = async () => {
  try {
    const response = await API.get('productos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarProductoConMedidas = async (id) => {
  try {
    const response = await API.get(`getProductoInMedida/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarBuscarProductos = async () => {
  try {
    const response = await API.get('Buscarproducto');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarPaquete = async (id) => {
  try {
    const response = await API.get(`getpaquete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarPaqueteSin = async () => {
  try {
    const response = await API.get(`getPaquetesinSucursal`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarProductosSucursal = async (id,categoriaId,subcategoriaId) => {
  try {
    const response = await API.get(`productoSucursal/${id}/${categoriaId}/${subcategoriaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarProductosS = async (categoriaId,subcategoriaId) => {
  try {
    const response = await API.get(`getProductod/${categoriaId}/${subcategoriaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const ObtenerSucursalproducto = async (id) => {
  try {
    const response = await API.get(`ObtenerSucursalproducto/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarProductosConpromociones = async () => {
  try {
    const response = await API.get('productopromocions');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarSucursalProductos = async (categoriaId,subcategoriaId) => {
  try {
    const response = await API.get(`sucursal-productos-summed/${categoriaId}/${subcategoriaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const listarSucursalPaquetes = async (id) => {
  try {
    const response = await API.get(`getAllPaquetsWithSummedQuantities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
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

export const updateProducto = async (Producto) => {
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

export const ObtenerPaquetes = async (id) => {
  try {
    const response = await API.get(`productopaquete/${id}`);
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
export const PrecioProducto = async (id) => {
  try {
    const response = await API.get(`PrecioProducto/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
//usar este 
export const ObtenerPaqueteProducto = async (id) => {
  try {
    const response = await API.get(`productospaquete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
export const ObtenerPaqueteSucursal = async (ids,id) => {
  try {
    const response = await API.get(`getPaqueteSucursal/${ids}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
export const ObtenerPresentacion = async (id) => {
  try {
    const response = await API.get(`ObtenerPresentacion/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const IncrementProducto = async (Producto) => {
  try {
    console.log(Producto)
    const response = await API.put(`IncrementProducto/${Producto.id}`, {
    RegistroProducto : Producto
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const IncrementProductoCantidad = async (Producto) => {
  try {
    const response = await API.put(`IncrementProductoCantidad/${Producto.id}`, {
    RegistroProducto : Producto
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

