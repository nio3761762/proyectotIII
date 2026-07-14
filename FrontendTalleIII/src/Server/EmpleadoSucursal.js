import API from './api';

export const asignarEmpleadosSucursal = async (idSucursal, empleados) => {
  try {
    const response = await API.post('empleado-sucursal/assign', {
      IdEmpleados: empleados,
      IdSucursal: idSucursal,
    });
    return response.data;
  } catch (error) {
    console.error('Error al asignar empleados a sucursal:', error);
    throw error;
  }
};

export const getEmpleadosSinSucursal = async () => {
  try {
    const response = await API.get('empleados-sin-sucursal');
    return response.data;
  } catch (error) {
    console.error('Error al obtener empleados sin sucursal:', error);
    throw error;
  }
};

export const listarEmpleadosAsignadosSucursal = async (idSucursal) => {
  try {
    const response = await API.get(`BuscarSucursal/${idSucursal}`);
    return response.data;
  } catch (error) {
    console.error('Error al listar empleados asignados:', error);
    throw error;
  }
};
