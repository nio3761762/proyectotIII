import API from './api';


export const listarTodasPersonas = async () => {
  try {
    const response = await API.get('getAllPersonas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener todas las personas:', error);
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

export const listarPersonas = async (search,estado,page,limit,usuario, rol, proveedor, tipoproveedor, empleado, idcargo ) => {
  try {

     const params = {
      estado,
      page,
      limit
    };

    if(search) params.search=search
    if(usuario)params.usuario=usuario
    if(rol) params.rol=rol
    if(proveedor) params.proveedor=proveedor
    if(tipoproveedor) params.tipoproveedor=tipoproveedor
    if(empleado) params.empleado=empleado
    if(idcargo)  params.idcargo = idcargo

    const response = await API.get('getPersonas',  { params });
  
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const deletePersona = async (id ) => {
  try {

     const response = await API.delete(`deletePersona/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
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