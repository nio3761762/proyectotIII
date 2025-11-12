import API from './api';


export const registrarProduccionDeProducto = async (Producto) => {
  try {
    const response = await API.post('registrarProduccionDeProducto',{
      productId:Producto.id, 
      cantidadProducida:Producto.Cantidad, 
      ingredientes:Producto.Ingredientes
    }
       );
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const actualizarIngredienteReceta = async (id,Producto) => {
  try {
    console.log(id,Producto)
    const response = await API.put(`actualizarIngredienteReceta/${id}`, {
   cantidadProducida:Producto.cantidadProducida, 
   ingredientes:Producto.ingredientes
    });
    console.log(response.data);
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
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};