// src/services/api.js
import axios from 'axios';


const API = axios.create({
  baseURL: 'http://localhost:3000/', // Ajusta la URL según tu backend Express
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

//login
export const login = async ( Login ) => {
  try {
   
    const response = await API.post('login', { 
      login: Login.email, 
      Password: Login.password, 
      Pin: Login.pin });
    console.log(response.data)
     return response.data;
  } catch (error) {
    console.error('Error al hacer login:', error.response);
    throw error;
  }
};


export const RecuperarPassword = async ({ email, password,repetirContrasena}) => {
  try {
   
    const response = await API.post('Recuperar', { login: email, Password: password });
    console.log(response.data)
     return response.data;
  } catch (error) {
    console.error('Error al recuperar el password:', error.response);
    throw error;
  }
};

export const mensaje = async (Login) => {
  try {
   
    const response = await API.post('mensaje', { 
      email: Login.email });
    console.log(response.data)
     return response.data;
  } catch (error) {
    console.error('Error al buscar al usuario', error.response);
    throw error;
  }
};

//Obtener datos 
export const AdmDatos = async () => {
  try {
    const response = await API.get('Datos');
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error al obtener los datos de la panaderia:', error);
    throw error;
  }
};

export const UpdateAdmDatos = async (datos) => {
  try {
    const response = await API.put(`AdmDatos/${datos.id}`, {
   updateDatos:datos
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar los datos de la panadería:', error);
    throw error;
  }
};


export const AddPhoto = async (dato) => {
  try {
    const response = await API.put(`AdmDatosPhoto/${dato.id}`, {
      Foto:dato.foto
    });
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar los datos de la panadería:', error);
    throw error;
  }
};


export const SubirFoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append("imagen", file);
    console.log('SubirFoto: Enviando FormData con archivo:', file);

    const response = await API.post("upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log('SubirFoto: Respuesta del servidor:', response.data);

    if (!response.data?.url) {
      throw new Error("La respuesta no contiene la URL de la imagen");
    }

    return response.data.url;
  } catch (error) {
    console.error("SubirFoto: Error al subir la imagen:", error);

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
//listar barrios
export const listarBarrios = async () => {
  try {
    const response = await API.get('Barrio');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const ObtenerDIreccion = async (id) => {
  try {
    const response = await API.get(`obtenerDIreccion/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

//eliminar estado
export const DelSucursal = async (id) => {
  try {
    const response = await API.delete(`DelSucursal/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

//Listar Sucursales
export const listarSucursales = async () => {
  try {
    const response = await API.get('Sucursales');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

//agregar sucursal
export const addSucursal = async (sucursal) => {
  try {
    const response = await API.post('Sucursal', { 
      RegistrarSucurcal:sucursal
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};



// export const addSucursal = async ({ iddato, nombre, nrosucursal, horaentrada,
//       horasalida, direccion,calles  }) => {
//   try {
   
//     const response = await API.post('Sucursal', { IdDato:iddato, Nombre:nombre, NroSucursal:nrosucursal, HoraEntrada:horaentrada,
//       HoraSalida:horasalida, IdBarrio:direccion,Calles:calles });
//     console.log(response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error al intentaar ingresar datos:', error.response);
//     throw error;
//   }
// };
//modificar datos
export const UpdateSucursal = async (sucursal) => {
  try {
   
    const response = await API.put(`UpdSucursal/${sucursal.id}`, { 
  RegistrarSucurcal:sucursal
       });
    return response.data;
  } catch (error) {
    console.error('Error al intentar actualizar datos:', error.response);
    throw error;
  }
};

// export const getProfile = () => API.get('/profile');
export default API;