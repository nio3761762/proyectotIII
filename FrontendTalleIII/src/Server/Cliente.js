import API from './api';


export const listarPersona = async () => {
  try {
    const response = await API.get('getPersonas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};


export const DeleteCliente = async (id) => {
  try {
    const response = await API.delete(`deletePersona/${id}`);

    return response.data;
   
  } catch (error) {
     console.error('Error al eliminar el Usuario:',error);
    throw error;
  }
};


export const RegistrarPersona = async (Dato) => {
  try {
    const response = await API.post('Personas', { 
     Personas:Dato
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const UpdatePersona = async (dato) => {
  try {
    const response = await API.put(`putPersona/${dato.IdPersona}`, { 
    Personas:dato

    });
    
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};