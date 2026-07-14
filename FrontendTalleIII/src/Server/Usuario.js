import API from './api';


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
    const response = await API.post('RegUsuarios', { 
     Personas:Dato
    });
  ;
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const SacarPersona = async (id) => {
  try {
    const response = await API.get(`Persona/${id}`)
  
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const usuariosSinSucursal = async () => {
  try {
    const response = await API.get(`getNoAdmin`)
  
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const listarUsuarioVendedor = async () => {
  try {
    const response = await API.get(`getUsuariosVentas`)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const listarUsuarioSucursal = async (idsucursal) => {
  try {
    const response = await API.get(`EmpleadosBySucursal/${idsucursal}`)
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
  ;
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const RolUsuario = async (id) => {
  try {
    const response = await API.get(`UsuarioRol/${id}`);
  ;
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const SucursalUsuario = async (id) => {
  try {
    const response = await API.get(`UsuarioSucursal/${id}`);
  ;
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
export const UpdatePersona = async (dato) => {
  try { 
   const id = dato.IdPersona ?? dato.idpersona;
    const response = await API.put(`putPersona/${id}`, {Personas:dato});
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

