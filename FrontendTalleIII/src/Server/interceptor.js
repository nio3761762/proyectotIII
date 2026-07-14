import API from './api';
import { getAccessToken, refreshToken } from './Autapi';

let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  pendingRequests = [];
};

// REQUEST
API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response?.status;

    // Si es 401 y no es un reintento
    if (status === 401 && !originalRequest._retry) {
      const publicEndpoints = ['login', 'mensaje', 'Recuperar', 'Cambiar', 'promociones-vista', 'productos-vista'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

      if (isPublicEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: (token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              resolve(API(originalRequest));
            },
            reject
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return API(originalRequest);
      } catch (err) {
        processQueue(err, null);
        console.warn("No se pudo refrescar el token → cerrando sesión");
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('usuario'); 
        window.location.href = '/login';
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Si es 403 o el 401 persistió después del refresh
    if (status === 401 || status === 403) {
      const publicEndpoints = ['login', 'mensaje', 'Cambiar', 'promociones-vista', 'productos-vista'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

      if (!isPublicEndpoint) {
        console.warn("Token inválido o expirado → cerrando sesión");
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
