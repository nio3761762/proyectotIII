
import API from './api';


export const listarComisiones = async (idproducto, estado, search, page, limit) => {

  try {
  const params = {
      page,
      limit
    };

    if(search) params.search=search
    if(idproducto)params.idproducto=idproducto
    if(estado != -1) params.estado=estado

    const response = await API.get('Comisiones',{ params }); 

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
