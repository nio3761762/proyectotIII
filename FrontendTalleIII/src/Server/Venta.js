
import API from './api';
import { Password } from 'primevue';

//listar usuarios

export const listarVentaSucursal = async (id,fecha, pago) => {
  try {
    const response = await API.get(`ventasSucursal/${id}/${fecha}/${pago}`)
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const getVentasReportes = async ( IdSucursal , fechadesde, fechahasta, Metodopago , IdVendedor) => {
  try {
    console.log(IdSucursal , fechadesde, fechahasta, Metodopago , IdVendedor)
    const response = await API.get(`getVentasReportes/${IdSucursal}/${fechadesde}/${fechahasta}/${Metodopago}/${IdVendedor}`)
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};


export const listarVentaUsuario = async (id) => {
  try {
    const response = await API.get(`ventasUsuario/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};
export const anularVenta = async (id,IdSucursal) => {
  try {
    const response = await API.put(`Anularventas/${id}`,{
        IdSucursal:IdSucursal
    });
     console.log(response.data)
    return response.data;
   
  } catch (error) {
     console.error('Error al anular la venta:',error);
    throw error;
  }
};

export const RegistrarVenta = async (Dato) => {
  try {
    const response = await API.post('ventas', { 
      ventas:Dato, 
      detalles:Dato.detalles
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const updateVenta = async (Dato) => {
  try {
    const response = await API.put(`updVenta/${Dato.id}`, { 
      ventas:Dato, 
      detalles:Dato.detalles
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
export const agregarClienteVenta = async (Dato) => {
  try {
    const response = await API.put(`agregarClienteVenta/${Dato.IdVenta}`, { 
      ventas:Dato, 
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};


