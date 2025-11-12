// src/services/interceptor.js
// src/Server/interceptor.js
import API from './api';
import { getAccessToken, refreshToken, setAccessToken, logout } from './Autapi';

let isRefreshing = false;
let subscribers = [];

function onRefreshed(token) {
  subscribers.forEach((callback) => callback(token));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

// Interceptor para solicitudes: añade el accessToken
API.interceptors.request.use((config) => {
  const token = getAccessToken();
  console.log("Token being sent with request:", token); // Added console log
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para respuestas: detecta 401 y trata de refrescar el token
API.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    console.error("API Response Error:", error.response); // Added console log

    if ((error.response?.status === 401 || (error.response?.status === 400 && error.response?.data?.message === 'Invalid token.')) && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(API(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        setAccessToken(newToken);
        onRefreshed(newToken);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
