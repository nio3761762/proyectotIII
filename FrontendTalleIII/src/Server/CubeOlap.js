import API from './api';

export const listarCubo = async (cubeName, startDate, endDate, sucursalId) => {
  try {
    const response = await API.get(`/Olap/${cubeName}`, {
      params: {
        startDate,
        endDate,
        sucursalId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el cubo:', error);
    throw error;
  }
};

export const listarParaHoy = async (cubeName,date,sucursalId) => {
  try {
    let response;
    if(sucursalId){
     response = await API.get(`/Olap/summary/${cubeName}`,{
        params: {
        date, 
        sucursalId
      }
    });}
    else{
        response = await API.get(`/Olap/summary/${cubeName}`,{
        params: {
        date
        }
    });
    }
    return response.data;
  } catch (error) {
    console.error('Error al obtener el cubo:', error);
    throw error;
  }
};


export const OlapCube = async (idSucursal, anio, mes, semana, fechaInicio, fechaFin,idSubcategoria ) => {
  try {

    // parámetros obligatorios siempre
    const params = {
      anio,
      fechaInicio,
      fechaFin
    };

    // parámetros opcionales
    if (mes) params.mes = mes;
    if (semana) params.semana = semana;
    if (idSucursal) params.idSucursal = idSucursal;
    if (idSubcategoria) params.idSubcategoria = idSubcategoria;

   
     const response = await API.get(`/Olap/Cubes`, { params });
   

    return response.data;
  } catch (error) {
    console.error("Error al obtener el cubo:", error);
    throw error;
  }
};

export const movimientos = async (limit,sucursalId) => {
  try {
    // --- Placeholder for 'trackenlinck' integration ---
    // To integrate with 'trackenlinck', you would typically:
    // 1. Obtain an API key or authentication token from 'trackenlinck'.
    // 2. Identify the 'trackenlinck' API endpoint for fetching real-time GPS data.
    // 3. Make an HTTP request to the 'trackenlinck' API using the API key/token.
    // 4. Parse the response from 'trackenlinck' and transform it into a format
    //    compatible with the frontend's 'actividadReciente' display.
    //
    // Example (conceptual, replace with actual 'trackenlinck' API calls):
    /*
    const trackenlinckApiKey = 'YOUR_TRACKENLINCK_API_KEY'; // Replace with actual key
    const trackenlinckEndpoint = 'https://api.trackenlinck.com/v1/movements'; // Replace with actual endpoint

    const trackenlinckResponse = await axios.get(trackenlinckEndpoint, {
      headers: {
        'Authorization': `Bearer ${trackenlinckApiKey}`
      },
      params: {
        limit: limit,
        // Add other parameters as required by 'trackenlinck' API, e.g., deviceId, timeRange
      }
    });

    // Process trackenlinckResponse.data to match your frontend's expected format
    // For now, we'll continue to use the existing backend endpoint as a fallback/example.
    */
    // --- End of 'trackenlinck' placeholder ---

    // parámetros obligatorios siempre
    const params = {
      limit
    };

    // parámetros opcionales
    if (sucursalId) params.sucursalId = sucursalId;
   
    const response = await API.get(`/Olap/latest_movements`, { params });
   
    return response.data;
  } catch (error) {
    console.error("Error al obtener el cubo:", error);
    throw error;
  }
};

export const Alertas = async (sucursalId) => {
  try {

    // parámetros obligatorios siempre
    const params = {};

    // parámetros opcionales
    if (sucursalId) params.sucursalId = sucursalId;
   

   
     const response = await API.get(`/Olap/recent-alerts`, { params });
   

    return response.data;
  } catch (error) {
    console.error("Error al obtener el cubo:", error);
    throw error;
  }
};