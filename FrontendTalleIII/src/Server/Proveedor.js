import API from './api';

//listar proveedores

export const listarProveedores = async () => {
  try {
    const response = await API.get('getProveedor');
    return response.data;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

export const listarTipoProveedores = async () => {
  try {
    const response = await API.get('gettipoProveedor');
    return response.data;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

export const DeleteProveedor = async (id) => {
  try {
    const response = await API.delete(`deleteProveedor/${id}`);
     console.log(response.data)
    return response.data;
   
  } catch (error) {
     console.error('Error al eliminar el Proveedor:',error);
    throw error;
  }
};


export const RegistrarProveedor = async (Dato) => {
  try {
    const response = await API.post('Proveedor', { 
     Persona:Dato
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};




export const updateProveedor = async (dato) => {
  try {
    const response = await API.put(`putProveedor/${dato.IdProveedor}`, { 
    Persona:dato

    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};