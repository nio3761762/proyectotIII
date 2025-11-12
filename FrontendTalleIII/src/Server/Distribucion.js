import { listarProductos } from './Producto';
import { listarSucursales } from './api';
import API from './api';

const distribucionesSimuladas = [
  {
    IdDistribucion: 'DIST-001',
    Fecha: '2023-10-25T10:00:00Z',
    IdSucursalDestino: 1,
    NombreSucursalDestino: 'Sucursal Centro',
    Estado: 'Entregado',
    Items: [
      { IdProducto: 'PROD-001', Nombre: 'Torta de Chocolate', Cantidad: 5 },
      { IdProducto: 'PROD-002', Nombre: 'Galletas de Avena', Cantidad: 50 },
    ],
    Resumen: '2 items, 55 unidades en total'
  },
  {
    IdDistribucion: 'DIST-002',
    Fecha: '2023-10-26T11:30:00Z',
    IdSucursalDestino: 2,
    NombreSucursalDestino: 'Sucursal Norte',
    Estado: 'En Camino',
    Items: [
      { IdProducto: 'PROD-003', Nombre: 'Pan Integral', Cantidad: 20 },
      { IdProducto: 'PROD-004', Nombre: 'Cheesecake de Fresa', Cantidad: 10 },
    ],
    Resumen: '2 items, 30 unidades en total'
  },
  {
    IdDistribucion: 'DIST-003',
    Fecha: '2023-10-27T09:00:00Z',
    IdSucursalDestino: 1,
    NombreSucursalDestino: 'Sucursal Centro',
    Estado: 'Pendiente',
    Items: [
      { IdProducto: 'PROD-005', Nombre: 'Muffins de Arándano', Cantidad: 24 },
    ],
    Resumen: '1 item, 24 unidades en total'
  },
];


export const listarDistribuciones = async () => {
 try {
    const response = await API.get('distribuciones');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const listarDistribucionesSucursal = async (fecha,idsucursal) => {
 try {
      const params = {
      fecha
    };
   if (idsucursal) params.idsucursal = idsucursal;
    const response = await API.get('getDistribucionesSucursal', { params });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const ObtenerCLienteDestino = async (id) => {
 try {
    const response = await API.get(`ObtenerCLienteDestino/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const crearDistribucion = async (Dato) => {
  try {
    const response = await API.post('distribucion', {
      reservas:Dato,
      detalles:Dato.detalles
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


export const  actualizarDistribucion= async (Dato) => {
   try {
       const response = await API.put(`distribucion/${Dato.IdDistribucion}`, {
           reservas:Dato,
      detalles:Dato.detalles
       });
       console.log(response.data);
       return response.data;
     } catch (error) {
       console.error('Error al intentar ingresar datos:', error.response);
       throw error;
     }
};

export const anularDistribucion = async (id) =>{
  try {
       const response = await API.put(`distribucionanular/${id}`);
       console.log(response.data);
       return response.data;
     } catch (error) {
       console.error('Error al intentar ingresar datos:', error.response);
       throw error;
     }
}