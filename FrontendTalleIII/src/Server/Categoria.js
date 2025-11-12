import API from './api';


export const listarCategorias = async () => {
  try {
    const response = await API.get('Categorias');
    return response.data;
  } catch (error) {
    console.error('Error al obtener medidas:', error);
    throw error;
  }
};

export const ObtenerCategoria = async (id) => {
  try {
    const response = await API.get(`ObtenerCategoria/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener medidas:', error);
    throw error;
  }
};

export const ObtenerSubCategorias = async (id) => {
  try {
   const response = await API.get(`ObtenerSubCategorias/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener medidas:', error);
    throw error;
  }
};

export const RegistrarCategoria = async (Categoria) => {
  try {
    const response = await API.post('Categoria', { 
      RegistroCategoria: Categoria

    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const UpdateCategoria = async (Categoria) => {
  try {
    const response = await API.put(`Categoria/${Categoria.IdCategoria}`, { 
      RegistroCategoria: Categoria

    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const DeleteCategoria = async (id) => {
  try {
    const response = await API.delete(`Categorias/${id}`);
    return response.data;
   
  } catch (error) {
     console.error('Error al eliminar la Categoria:',error);
    throw error;
  }
};

export const listarSubCategorias = async () => {
  try {
    const response = await API.get('SubCategorias');
    return response.data;
  } catch (error) {
    console.error('Error al obtener medidas:', error);
    throw error;
  }
};

export const RegistrarSubCategoria = async (Categoria) => {
  try {
    const response = await API.post('SubCategoria', { 
      RegistroSubCategoria: Categoria

    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const UpdateSubCategoria = async (Categoria) => {
  try {
    const response = await API.put(`SubCategoria/${Categoria.IdSubCategoria}`, { 
      RegistroSubCategoria: Categoria

    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const DeleteSubCategoria = async (id) => {
  try {
    const response = await API.delete(`SubCategorias/${id}`);
    return response.data;
   
  } catch (error) {
     console.error('Error al eliminar la Categoria:',error);
    throw error;
  }
};
