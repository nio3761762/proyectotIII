import API from './api';




//listar rol
export const listarRoles = async (search,estado,page,limit) => {
  try {
     const params = {
      page,
      limit
    };
    if(estado != -1) params.estado = estado
    if(search) params.search = search
    
    const response = await API.get('role', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

export const filtRol = async () => {
  try {
    const response = await API.get('filroles');
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

export const Listarmenusrol = async (id) => {
  try {
    const response = await API.get(`rolemenus/${id}`);
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
//para descartar 
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
  ;
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
  ;
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
    const response = await API.post('AsignarRolUsuario',{
       UsuarioId: usuario.IdUsuario,
       RolId: usuario.IdROl
    }
       );
  ;
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
  ;
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const DeleteRolUsuario = async (usuario) => {
  try {
    const response = await API.delete(`DeleteRolUsuario/${usuario.IdUsuario}/${usuario.IdRol}`);
    return response.data;
  } catch (error) {
    console.error('Error al intentar desasignar el rol del usuario:', error.response);
    throw error;
  }
};

export const GuardarRolesUsuario = async (usuario) => {
  try {
    const response = await API.post('AsignarRolUsuario', {
      UsuarioId: usuario.IdUsuario,
      RolesAsignar: usuario.RolesAsignar ?? [],
      RolesQuitar: usuario.RolesQuitar ?? []
    });
    return response.data;
  } catch (error) {
    console.error('Error al guardar los roles del usuario:', error.response);
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
