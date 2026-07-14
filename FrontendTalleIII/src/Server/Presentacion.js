import api from './api';

export const listarPresentaciones = async (search,estado,page,limit) => {
    try {

    const params = {
      estado,
      page
    };

    if(search) params.search=search
    params.limit=limit
        const response = await api.get('/presentaciones', { params });
        return response.data;
    } catch (error) {
        console.error('Error al listar presentaciones:', error);
        throw error;
    }
};

export const listarPresentacionesestado = async () => {
    try {
        const response = await api.get('/getpresentaciones');
        return response.data;
    } catch (error) {
        console.error('Error al listar presentaciones:', error);
        throw error;
    }
};
export const obtenerPresentacion = async (id) => {
    try {
        const response = await api.get(`/presntacion/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener la presentacion:', error);
        throw error;
    }
};


export const registrarPresentacion = async (data) => {
    try {
        const response = await api.post('/addpresentacion', {
            Nombre:data.Nombre,
            Abreviatura: data.Abreviatura
        });
        return response.data;
    } catch (error) {
        console.error('Error al registrar presentacion:', error);
        throw error;
    }
};

export const updatePresentacion = async (data) => {
    try {
        const response = await api.put(`/updatePresntacion/${data.IdPresentacion}`, {
            Nombre:data.Nombre,
            Abreviatura:data.Abreviatura
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar presentacion:', error);
        throw error;
    }
};

export const deletePresentacion = async (id) => {
    try {
      const response = await api.delete(`/delPresentacion/${id}`); 
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el estado de la presentación:', error);
        throw error;
    }
};
