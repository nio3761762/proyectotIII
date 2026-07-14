import API from './api';

export const Listsucursal = async () => {
  try {
    const response = await API.get(`Listsucursal`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};

export const ListHornos = async (id) => {
  try {
    const response = await API.get(`getHornos/${id}`);
    return response.data;
   
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};

export const updateHorno = async (compraData) => {
  try {
    const response = await API.put(`UpdateORPostHorno`, 
      {Personas:compraData});

    return response.data;
     } catch (error) {
    console.error('Error al actualizar la compra:', error);
    throw error;
  }
};


export const ListGasto = async (idsucursal,periodo) => {
  try {
    const params = {
      id:idsucursal,
      periodo:periodo
    }

    const response = await API.get(`ListGasto`, { params });
    return response.data;

  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};

export const createGasto = async (gastos) => {
  try {
    const response = await API.post(`CreateGastos`, 
      { gastos });

    return response.data;
     } catch (error) {
    console.error('Error al actualizar la compra:', error);
    throw error;
  }
};

export const getSucursalDireccion = async (id) => {
  try {
    const response = await API.get(`getSucursalDireccion/${id}`);
    return response.data;
   // estos son los datos que se devuelve de la sucursal segun su direccion 
    // export const getSucursalDireccion = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const result = await AppDataSource.query(`
//   SELECT
//     s.idsucursal,
//     s.nombre,
//     ad.nombre AS nombreempresa,
//     ad.celular,
//     ad.email,
//     ad.foto,
//     d.direccion,
//     d.referencia,
//     d.ubicacion,
//     b.nombre AS nombrebarrio,
//     c.nombre AS nombreciudad,
//     dp.nombre AS nombredepartamento
//   FROM sucursal s 
//   JOIN administrardatos ad ON ad.iddatos = s.iddatos
//   JOIN direccion d ON d.iddireccion = s.iddireccion
//   JOIN barrio b ON b.idbarrio = d.idbarrio
//   JOIN distritos ds ON ds.iddistrito = b.iddistrito
//   JOIN ciudad c ON c.idciudad = ds.idciudad
//   JOIN departamento dp ON dp.iddepto = c.iddepto
//   WHERE s.idsucursal = $1
// `, [id]);


//     // 🔥 Si no existe la sucursal → []
//     if (result.length === 0) {
//       return res.json([]);
//     }

//     return res.json(result[0]);

//   } catch (error) {
//     console.error("Error real:", error);
//     return res.status(500).json({ message: "Error interno del servidor" });
//   }
// };
  } catch (error) {
    console.error('Error al eliminar la promoción:', error);
    throw error;
  }
};
