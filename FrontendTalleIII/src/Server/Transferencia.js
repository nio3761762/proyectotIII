import API from './api';

export const getTransferencias = async (idsucursalorigen, idsucursaldestino, idempleadodestino,limit, page, fecha) =>{
  try {
    const params = {
      page,
      limit,
      fecha
    }
    if(idsucursalorigen) params.idsucursalorigen = idsucursalorigen
    if(idsucursaldestino) params.idsucursaldestino = idsucursaldestino
    if(idempleadodestino) params.idempleadodestino = idempleadodestino
    const response = await API.get('gettransferencia', { params });
    return response.data;
  } catch (error) {
    console.error('Error al listar transferencias:', error);
    throw error;
  }
}



export const registrarTransferencia = async (transferencias,detalles) => {
  try {
    console.log('Datos a enviar:', { transferencias, detalles });
    const response = await API.post('transferencia', { 
     transferencias,detalles
    });
 
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const anularTransferencia = async (id) => {
  try {
    const response = await API.put(`anulartransferencia/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const actualizarTransferencia = async (id, transferencias, detalles) => {
  try {
    const response = await API.put(`actualizartransferencia/${id}`, {
      transferencias, detalles
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar transferencia:', error.response);
    throw error;
  }
};

export const actualizarHoraTransferencia = async (id, hora) => {
  try {
    const response = await API.put(`actualizarhoratransferencia/${id}`, {
      hora
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar hora de transferencia:', error.response);
    throw error;
  }
};
