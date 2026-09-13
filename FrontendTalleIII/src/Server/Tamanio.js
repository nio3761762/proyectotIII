import api from './api';

export const listarTamanios = async (search, estado, page, limit) => {
    try {
        const params = { page, limit };
        if (search) params.search = search;
        if (estado !== undefined && estado !== null) params.estado = estado;
        const response = await api.get('/tamanios', { params });
        return response.data;
    } catch (error) {
        console.error('Error al listar tamaños:', error);
        throw error;
    }
};

export const listarTamaniosActivos = async () => {
    try {
        const response = await api.get('/gettamanios');
        return response.data;
    } catch (error) {
        console.error('Error al listar tamaños activos:', error);
        throw error;
    }
};

export const registrarTamanio = async (nombre) => {
    try {
        const response = await api.post('/addtamanio', { nombre });
        return response.data;
    } catch (error) {
        console.error('Error al registrar tamaño:', error);
        throw error;
    }
};

export const updateTamanio = async (id, nombre) => {
    try {
        const response = await api.put(`/updatetamanio/${id}`, { nombre });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar tamaño:', error);
        throw error;
    }
};

export const toggleTamanio = async (id) => {
    try {
        const response = await api.delete(`/deltamanio/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al cambiar el estado del tamaño:', error);
        throw error;
    }
};