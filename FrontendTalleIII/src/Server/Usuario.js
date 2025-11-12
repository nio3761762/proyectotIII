import API from './api';
import { Password } from 'primevue';

//listar usuarios
export const listarUsuarios = async () => {
  try {
    const response = await API.get('Usuarios');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const DeleteUsuario = async (id) => {
  try {
    const response = await API.delete(`Usuarios/${id}`);
     console.log(response.data)
    return response.data;
   
  } catch (error) {
     console.error('Error al eliminar el Usuario:',error);
    throw error;
  }
};

export const RecuperarPassword = async (usuario) => {
  try {
    const response = await API.post("Recuperar",{
        login: usuario.email,
        Password: usuario.password     });
     console.log(response.data)
    return response.data;
   
  } catch (error) {
     console.error('Error al recuperar la contrasena',error);
    throw error;
  }
};

export const AgregarPhoto = async (id, foto ) => {
  try {
    const response = await API.put(`Usuariofoto/${id}`, {
      Foto:foto
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la imagen del usuario:', error);
    throw error;
  }
};


export const SubirFoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append("imagen", file);

    const response = await API.post("upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data?.url) {
      throw new Error("La respuesta no contiene la URL de la imagen");
    }

    return response.data.url;
  } catch (error) {
    console.error("Error al subir la imagen:", error);

    // Manejo seguro del error
    let mensaje = "No se pudo subir la imagen";
    if (error.response?.data?.error) {
      mensaje = error.response.data.error;
    } else if (error.message) {
      mensaje = error.message;
    }

    throw new Error(mensaje); // ahora `error.message` siempre estará definido
  }
};



export const RegistrarUsuario = async (Dato) => {
  try {
    const response = await API.post('Usuarios', { 
     Persona:Dato
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const SacarPersona = async (id) => {
  try {
    const response = await API.get(`Persona/${id}`)
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const usuariosSinSucursal = async () => {
  try {
    const response = await API.get(`getNoAdmin`)
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};


export const updateUsuario = async (dato) => {
  try {
    const response = await API.put(`Usuarios/${dato.IdUsuario}`, { 
    Persona:dato

    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const RolUsuario = async (id) => {
  try {
    const response = await API.get(`UsuarioRol/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const SucursalUsuario = async (id) => {
  try {
    const response = await API.get(`UsuarioSucursal/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
export const UpdatePersona = async (dato) => {
  try {
    const response = await API.put(`putPersona/${dato.IdPersona}`, {Personas:dato});
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

// New functions for user-sucursal assignment
export const asignarUsuarioASucursal = async (idSucursal, idUsuario) => {
  try {
    const response = await API.post(`usuario-sucursal`,{
      IdUsuarios:idUsuario, IdSucursal:idSucursal
    });
    return response.data;
  } catch (error) {
    console.error('Error al asignar usuario a sucursal:', error);
    throw error;
  }
};

export const desasignarUsuarioDeSucursal = async (idSucursal, idUsuario) => {
  try {
    const response = await API.delete(`Sucursales/${idSucursal}/DesasignarUsuario/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error('Error al desasignar usuario de sucursal:', error);
    throw error;
  }
};

export const listarUsuariosAsignadosASucursal = async (idSucursal) => {
  try {
    const response = await API.get(`Sucursales/${idSucursal}/Usuarios`);
    return response.data;
  } catch (error) {
    console.error('Error al listar usuarios asignados a sucursal:', error);
    throw error;
  }
};

export const listarUsuarioAsignado = async (id) => {
  try {
    const response = await API.get(`BuscarSucursal/${id}`);
     console.log(response.data)
    return response.data;
   
  } catch (error) {
     console.error('Error al eliminar el Usuario:',error);
    throw error;
  }
};
