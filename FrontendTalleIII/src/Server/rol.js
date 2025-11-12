import API from './api';




//listar rol
export const listarRoles = async () => {
  try {
    const response = await API.get('role');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

//Eliminar Rol
export const DeleteROl = async (id) => {
  try {
    const response = await API.delete(`role/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};

export const listarMenus = async () => {
  try {
    const response = await API.get('Menu');
    return response.data;
  } catch (error) {
    console.error('Error al obtener menus:', error);
    throw error;
  }
};

export const listarRolMenus = async (id) => {
  try {
    const response = await API.get(`RolMenu/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener menus:', error);
    throw error;
  }
};

export const addRol = async (Nombre, Seleccionado) => {
  try {
    const response = await API.post('RolMenu',{
       Nombre: Nombre,
       Permiso: Seleccionado
    }
       );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const updateRol = async (id,Nombre, Seleccionado) => {
  try {
    const response = await API.put(`RolMenu/${id}`, {
      Nombre: Nombre,
      Permiso: Seleccionado
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const listarRolMenu = async (id) => {
  try {
    const response = await API.get(`RolMenus/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener menus:', error);
    throw error;
  }
};

export const AsignarRolUsuario = async (usuario) => {
  try {
    const response = await API.post('Rolusuario',{
       UsuarioId: usuario.IdUsuario,
       RolId: usuario.IdROl
    }
       );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const updateRolUsuario = async (usuario) => {
  try {
    const response = await API.put(`Rolusuario/${usuario.IdUsuario}`, {
        RolId: usuario.IdRol
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const listarpermiso = async () => {
  try {
    const response = await API.get('permiso');
    return response.data;
  } catch (error) {
    console.error('Error al obtener menus:', error);
    throw error;
  }
};

export const listarpermisoMenu = async (id) => {
  try {
    const response = await API.get(`permisos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener menus:', error);
    throw error;
  }
};
