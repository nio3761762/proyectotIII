
import API from './api';
import { Password } from 'primevue';

//listar usuarios

export const listarVentaSucursal = async (producto, promocion,id,fecha, pago,page, limit, tienefactura) => {
  try {
    const params ={
      id,
      page, 
      limit,
      fecha
    }
    if(producto) params.producto = producto
    if(promocion) params.promocion = promocion
    if(pago) params.pago = pago
    if( tienefactura) params.factura = tienefactura
    const response = await API.get(`ventasSucursal`, { params})
  
    return response.data;
 } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};





export const anularVenta = async (id) => {
  try {
    const response = await API.put(`Anularventas/${id}`);
   
    return response.data;
  } catch (error) {
     console.error('Error al anular la venta:',error);
    throw error;
  }
};


export const actualizarventa = async (id, Dato) => {
  try {
    const response = await API.put(`ventas/${id}`, { 
      ventas: Dato, 
      detalles: Dato.detalles
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la venta:', error);
    throw error;
  }
};

export const RegistrarVenta = async (Dato) => {
  try {
    const response = await API.post('ventas', { 
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


