import API from './api';
import API_AUTH from './apiAuth';
import { jwtDecode } from 'jwt-decode';


let refreshIntervalId = null;

export const getAccessToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setAccessToken = (token) => {
  localStorage.setItem('token', token);
  // Aseguramos que el temporizador esté corriendo si no lo está
  startTokenRefreshTimer();
};

export const setRefreshToken = (refreshToken) => {
  localStorage.setItem('refreshToken', refreshToken);
};

export const refreshToken = async () => {
    const rfToken = getRefreshToken();
    const currentToken = getAccessToken();

    if (!rfToken) {
        throw new Error("No refresh token available");
    }

    try {
     
        const response = await API_AUTH.post('refresh-token', 
          { refreshToken: rfToken },
          { 
            headers: { 
              'Authorization': `Bearer ${currentToken}` 
            } 
          }
        );

        const newAccessToken = response.data.token;

        localStorage.setItem('token', newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error("Error al refrescar el token:", error.response || error);
        // Si falla el refresco, es mejor detener el intervalo
        stopTokenRefreshTimer();
        throw error;
    }
};

//logout
export const logout = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  stopTokenRefreshTimer();
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('usuario');
  localStorage.removeItem('userMenus');
  API.post('logout', { login: usuario?.IdUsuario }).catch(() => {});
};

export const startTokenRefreshTimer = () => {
  if (refreshIntervalId) return; // Ya está corriendo


 if(getAccessToken)
  refreshIntervalId = setInterval(async () => {
    const token = getAccessToken();
     if (token) {
    
      try {
        await refreshToken();
      } catch (err) {
        console.warn("Fallo en el refresco programado:", err);
      }
    }
  }, 3600000); // 1 hora
};

export const stopTokenRefreshTimer = () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
   
  }
};


