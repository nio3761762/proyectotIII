
import API from './api';
export const listarPromocionesVista = async (search,page,limit ) => {
  try {

     const params = {
      limit,
      page,
      search
    };


    const response = await API.get('promociones-vista',{ params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener las promociones:', error);
    throw error;
  }
};


export const listarPromociones = async (search,idproducto,estado,tipopromocion,page,limit ) => {
  try {

     const params = {
      limit,
      page
    };

    if(search) params.search=search
    if(estado != -1)params.estado=estado
    if(tipopromocion != -1) params.tipopromocion=tipopromocion
    if(idproducto) params.idproducto=idproducto


    const response = await API.get('promociones',{ params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener las promociones:', error);
    throw error;
  }
};

export const registrarPromocion = async (promocion) => {
  try {
    const response = await API.post('promocion', {
      RegistrarPromocion:promocion
    });
    return response.data;
  } catch (error) {
    console.error('Error al registrar la promoción:', error.response);
    throw error;
  }
};

export const updatePromocion = async (promocion) => {
  try {
    const response = await API.put(`promocion/${promocion.id}`, {
     RegistrarPromocion:promocion
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const actualizarPromocion = async (promocion) => {
  try { 
  
    const response = await API.put(`promocion/${promocion.IdPromocion}`, {
      RegistrarPromocion:promocion
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la promoción:', error.response);
    throw error;
  }
};

export const eliminarPromocion = async (id) => {
  try {
    const response = await API.delete(`promociones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};
