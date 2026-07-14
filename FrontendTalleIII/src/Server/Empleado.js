import API from './api';
 
export const ListEmpleado= async (id) => {
  try {
    const response = await API.get(`getEmpleados/${id}`);
    return response.data;
// los datos que mandan son  los siguientes de los empleados que estan relacinado a una sucursal
// [
// {
//   "idempleado",
//   "nombre",
//   "apellidopaterno",
//   "apellidomaterno",
//   "imagen",
//   "cargo"
// }
// ]
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};
export const getEmpleadosVendedores= async () => {
  try {
    const response = await API.get(`getEmpleadosVendedores`);
    return response.data;
// los datos que mandan son  los siguientes de los empleados que estan relacinado a una sucursal
// [
// {
//   "idempleado",
//   "nombre",
//   "apellidopaterno",
//   "apellidomaterno",
//   "imagen",
//   "cargo"
// }
// ]
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};



export const listarCargo= async () => {
  try {
    const response = await API.get('getCargo');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las promociones:', error);
    throw error;
  }
};

export const registrarEmpleado = async (Personas) => {
  try {
  
    const response = await API.post('AddEmpleado', {
      Personas:Personas
    });
    return response.data;
  } catch (error) {
    console.error('Error al registrar la promoción:', error.response);
    throw error;
  }
};

export const updateEmpleado = async (Personas) => {
  try {
  
    const response = await API.put(`UpdateEmpleado/${Personas.id}`, {
     Personas:Personas
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const deleteEmpleado = async (id) => {
  try {
    const response = await API.delete(`deleteEmpleado/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};

