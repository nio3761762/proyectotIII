
import API from './api';

export const listarCompras = async ( search, fecha, estado, page , limit) => {
  try {
      const params = {
      limit,
      page,
      fecha
    };

    if(search) params.search=search
    if(estado != -1)params.estado=estado
   

    const response = await API.get(`getCompras`, { params });
   
    return response.data;
   
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    throw error;
  }
};

export const registrarCompra = async (compraData) => {
  try {
    const response = await API.post('registrarCompra',  
       {
        Compras: {
          IdProveedor: compraData.IdProveedor,
          Numero: compraData.Numero,
          Descripcion: compraData.Descripcion,
          Comprobante: compraData.Comprobante,
          Fecha: compraData.Fecha,
          PrecioTotal: compraData.PrecioTotal,
          LugarCompra: compraData.LugarCompra
        }, 
        detalles: compraData.detalles,
        Destinos: compraData.destinos
      });
   
    return response.data; 
  } catch (error) {
    console.error('Error al registrar la compra:', error);
    throw error;
  }
};

export const anularCompra = async (id) => {
  try {
    const response = await API.delete(`anularCompra/${id}`);
    return response.data;
    } catch (error) {
    console.error('Error al anular la compra:', error);
    throw error;
  }
};

export const updateCompra = async (id,Compras, detalles, Destinos) => {
  try {
    const response = await API.put(`actualizarCompra/${id}`, 
      {Compras, detalles, Destinos});
    return response.data;
   
     } catch (error) {
    console.error('Error al actualizar la compra:', error);
    throw error;
  }
};
