import API from './api';


let refreshIntervalId = null;

export const getAccessToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refreshToken');


export const setAccessToken = (token) => {
  localStorage.setItem('token', token);
};

export const setRefreshToken = (refreshToken) => {
  localStorage.setItem('refreshToken', refreshToken);
};

export const refreshToken = async () => {
    const refreshToken = getRefreshToken();
    console.log("Refresh token being used:", refreshToken); // Added console log

    if (!refreshToken) {
        console.log("No hay refresh token.");
        return;
    }

    try {
        const response = await API.post('/refresh-token', { refreshToken: refreshToken });
        console.log("Refresh token response:", response.data); // Added console log
        const newAccessToken = response.data.RelatioUsuario.token;

      console.log("Token actualizado correctamente.");
        setAccessToken(newAccessToken);
        localStorage.setItem('token', newAccessToken);
        return newAccessToken;

        // localStorage.setItem('token', newAccessToken);
     
         
    } catch (error) {
        console.error("Error al refrescar el token:", error);

    }
};

//logout
export const logout = async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  console.log(usuario);
  try {
    const response = await API.post('logout', { login: usuario.IdUsuario });
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    console.log(response+" respuesta")
    return response.data; // Mensaje de logout exitoso
  } catch (error) {
    console.error("Error al hacer logout:", error.response || error);
    throw error;
  }
};

export const startTokenRefreshTimer = () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }
  // Refresh token every 30 seconds
  refreshIntervalId = setInterval(async () => {
    console.log("Attempting to refresh token proactively...");
    await refreshToken();
  }, 30 * 1000); // 30 seconds
};

export const stopTokenRefreshTimer = () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
    console.log("Token refresh timer stopped.");
  }
};


