import API from './api';

// Lista todas las categorías de medida con sus unidades
export const listarMedidas = async (search, estado, page , limit ) => {
  try {
      const params = {
      limit,
      page
    };

    if(search) params.search=search
    if(estado)params.estado=estado

    const response = await API.get('getMedidas', { params }); 
    //devuelve esto 
//     {
//     "total": "4",
//     "page": 1,
//     "limit": 8,
//     "data": [
//         {
//             "idcategoriamedida": "09252025CTM-4",
//             "nombre": "Longitud",
//             "fecharegistro": "2025-09-25T04:00:00.000Z",
//             "fechaactualizacion": "2025-09-25T04:00:00.000Z",
//             "estado": 1,
//             "total": "4",
//             "Unidadmedida": [
//                 {
//                     "IdUnidadMedida": 8,
//                     "Nombre": "Metro",
//                     "Abreviatura": "M",
//                     "Cantidad": 1,
//                     "FechaRegistro": "2025-09-25",
//                     "Estado": 1
//                 },
//                 {
//                     "IdUnidadMedida": 9,
//                     "Nombre": "Centimetro",
//                     "Abreviatura": "cm",
//                     "Cantidad": 0.01,
//                     "FechaRegistro": "2025-09-25",
//                     "Estado": 1
//                 },
//                 {
//                     "IdUnidadMedida": 10,
//                     "Nombre": "Kilometro",
//                     "Abreviatura": "Km",
//                     "Cantidad": 1000,
//                     "FechaRegistro": "2025-09-25",
//                     "Estado": 1
//                 },
//                 {
//                     "IdUnidadMedida": 11,
//                     "Nombre": "MIlimetro",
//                     "Abreviatura": "mm",
//                     "Cantidad": 0.001,
//                     "FechaRegistro": "2025-09-25",
//                     "Estado": 1
//                 }
//             ]
//         },
//         {
//             "idcategoriamedida": "CTM-1",
//             "nombre": "Cantidad",
//             "fecharegistro": "2025-08-29T04:00:00.000Z",
//             "fechaactualizacion": "2025-10-22T04:00:00.000Z",
//             "estado": 1,
//             "total": "4",
//             "Unidadmedida": [
//                 {
//                     "IdUnidadMedida": 3,
//                     "Nombre": "Docena",
//                     "Abreviatura": "dz",
//                     "Cantidad": 12,
//                     "FechaRegistro": "2025-07-13",
//                     "Estado": 1
//                 },
//                 {
//                     "IdUnidadMedida": 6,
//                     "Nombre": "Unidades",
//                     "Abreviatura": "ud",
//                     "Cantidad": 1,
//                     "FechaRegistro": "2025-07-13",
//                     "Estado": 1
//                 },
//                 {
//                     "IdUnidadMedida": 12,
//                     "Nombre": "Maple",
//                     "Abreviatura": "mp",
//                     "Cantidad": 30,
//                     "FechaRegistro": "2025-10-22",
//                     "Estado": 1
//                 }
//             ]
//         },
//         {
//             "idcategoriamedida": "CTM-2",
//             "nombre": "Peso",
//             "fecharegistro": "2025-08-29T04:00:00.000Z",
//             "fechaactualizacion": "2025-11-26T04:00:00.000Z",
//             "estado": 1,
//             "total": "4",
//             "Unidadmedida": [
//                 {
//                     "IdUnidadMedida": 2,
//                     "Nombre": "Gramos",
//                     "Abreviatura": "g",
//                     "Cantidad": 1,
//                     "FechaRegistro": "2025-07-13",
//                     "Estado": 1
//                 },
//                 {
//                     "IdUnidadMedida": 1,
//                     "Nombre": "Kilogramo",
//                     "Abreviatura": "Kg",
//                     "Cantidad": 1000,
//                     "FechaRegistro": "2025-07-13",
//                     "Estado": 1
//                 },
//                 {
//                     "IdUnidadMedida": 13,
//                     "Nombre": "Quintal",
//                     "Abreviatura": "qq",
//                     "Cantidad": 46000,
//                     "FechaRegistro": "2025-10-28",
//                     "Estado": 1
//                 }
//             ]
//         },
//         {
//             "idcategoriamedida": "CTM-3",
//             "nombre": "Volumen",
//             "fecharegistro": "2025-08-29T04:00:00.000Z",
//             "fechaactualizacion": "2025-10-28T04:00:00.000Z",
//             "estado": 1,
//             "total": "4",
//             "Unidadmedida": [
//                 {
//                     "IdUnidadMedida": 5,
//                     "Nombre": "Mililitro",
//                     "Abreviatura": "ml",
//                     "Cantidad": 1,
//                     "FechaRegistro": "2025-07-13",
//                     "Estado": 1
//                 },
//                 {
//                     "IdUnidadMedida": 4,
//                     "Nombre": "Litro",
//                     "Abreviatura": "Lt",
//                     "Cantidad": 1000,
//                     "FechaRegistro": "2025-07-13",
//                     "Estado": 1
//                 }
//             ]
//         }
//     ]
// }
    return response.data;
  } catch (error) {
    console.error('Error al obtener las categorías de medida:', error);
    throw error;
  }
};

export const listarCategoriaMedidas = async () => {
  try {
    // Asumimos que este endpoint ahora devuelve las categorías con sus unidades anidadas
    const response = await API.get('getCategoriaMedidas'); 
    return response.data;
  } catch (error) {
    console.error('Error al obtener las categorías de medida:', error);
    throw error;
  }
};
// Registrar una nueva categoría de medida y sus unidades
export const RegistrarCategoriaMedida = async (categoriaMedida) => {
  try {
    const response = await API.post('createCategoriaMedida', {
      Registro: categoriaMedida
    });
    return response.data;
  } catch (error) {
    console.error('Error al registrar la categoría de medida:', error.response);
    throw error;
  }
};

// Actualizar una categoría de medida y sus unidades
export const UpdateCategoriaMedida = async (categoriaMedida) => {
  try {
    const response = await API.put(`updateCateriaMedida/${categoriaMedida.IdCategoriaMedida}`, {
      Registro: categoriaMedida
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la categoría de medida:', error.response);
    throw error;
  }
};

// Desactivar/Activar una categoría de medida
export const DeleteCategoriaMedida = async (id) => {
  try {
    const response = await API.delete(`deleteCategoriaMedida/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar el estado de la categoría de medida:', error);
    throw error;
  }
};

export const ObtenrCategoriaMedida = async (id) => {
  try {
    const response = await API.get(`ObtenrCategoriaMedida/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar el estado de la categoría de medida:', error);
    throw error;
  }
};

export const ObtenerMedidas = async (id) => {
  try {
    const response = await API.get(`ObtenerMedidas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar el estado de la categoría de medida:', error);
    throw error;
  }
};