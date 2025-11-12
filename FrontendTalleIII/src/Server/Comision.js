
import API from './api';


export const listarComisiones = async () => {
  try {
    const response = await API.get('Comisiones');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las comisiones:', error);
    throw error;
  }
};


export const AddComisiones = async (Comision) => {
  try {
    const response = await API.post('AddComision', { 
      Registrar:Comision
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const UpdateComision = async (Comision) => {
  try {
    const response = await API.put(`uptComision/${Comision.IdComision}`, { 
       Registrar: Comision
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const DeleteComision = async (id) => {
  try {
    const response = await API.delete(`DelComision/${id}`);
    return response.data;
   
  } catch (error) {
     console.error('Error al eliminar la Comision:',error);
    throw error;
  }
};
