import API from './api';


export const registrarProduccionDeProducto = async (Producto) => {
  try {
  
    const response = await API.post('registrarProduccionDeProducto',{
      ingredientes:Producto.Ingredientes,
      Recetas:Producto.Receta
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
 
    const response = await API.put(`actualizarIngredienteReceta/${id}`, {
   ingredientes:Producto.ingredientes,
   Recetas:Producto.Receta
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
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};

export const eliminarIngredienteReceta = async (id) => {
  try {
    const response = await API.delete(`eliminarIngredienteReceta/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};