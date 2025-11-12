import API from './api';

//listar usuarios

export const listarPersona = async () => {
  try {
    const response = await API.get('getPersonas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const listarCliente = async () => {
  try {
    const response = await API.get('Clientes');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};


export const DeleteCliente = async (id) => {
  try {
    const response = await API.delete(`deletePersona/${id}`);
     console.log(response.data)
    return response.data;
   
  } catch (error) {
     console.error('Error al eliminar el Usuario:',error);
    throw error;
  }
};


export const RegistrarCliente = async (Dato) => {
  try {
    const response = await API.post('Personas', { 
     Persona:Dato
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};




export const updateCliente = async (dato) => {
  try {
    const response = await API.put(`putPersona/${dato.IdPersona}`, { 
    Personas:dato

    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};