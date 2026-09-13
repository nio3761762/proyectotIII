import api from './api';

export const listarSabores = async (search, estado, page, limit) => {
    try {
        const params = { page, limit };
        if (search) params.search = search;
        if (estado !== undefined && estado !== null) params.estado = estado;
        const response = await api.get('/sabores', { params });
        return response.data;
    } catch (error) {
        console.error('Error al listar sabores:', error);
        throw error;
    }
};

export const listarSaboresActivos = async () => {
    try {
        const response = await api.get('/getsabores');
        return response.data;
    } catch (error) {
        console.error('Error al listar sabores activos:', error);
        throw error;
    }
};

export const registrarSabor = async (nombre) => {
    try {
        const response = await api.post('/addsabor', { nombre });
        return response.data;
    } catch (error) {
        console.error('Error al registrar sabor:', error);
        throw error;
    }
};

export const updateSabor = async (id, nombre) => {
    try {
        const response = await api.put(`/updatesabor/${id}`, { nombre });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar sabor:', error);
        throw error;
    }
};

export const toggleSabor = async (id) => {
    try {
        const response = await api.delete(`/delsabor/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al cambiar el estado del sabor:', error);
        throw error;
    }
};