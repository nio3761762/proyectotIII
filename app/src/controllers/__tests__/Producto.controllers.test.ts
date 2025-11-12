
import { Request, Response } from 'express';
import { Producto } from '../../entities/Producto';
import { Sucursal } from '../../entities/Sucursal';
import { getProductos, createProducto } from '../Producto.controllers';
import { generarIdSecuencial } from '../../utils/idGenerator';
import { verifyEstado } from '../Estado.controllers';
import { createSucursalProducto } from '../SucursalProducto.controllers';

// --- Mocks ---
const mockSave = jest.fn().mockResolvedValue(true);
jest.mock('../../entities/Producto', () => {
    const mockProducto = jest.fn().mockImplementation(() => ({
        save: mockSave,
    }));
    (mockProducto as any).find = jest.fn();
    return {
        Producto: mockProducto,
    };
});

jest.mock('../../entities/Sucursal');
jest.mock('../../utils/idGenerator');
jest.mock('../Estado.controllers');
jest.mock('../SucursalProducto.controllers');

// --- Typed Mocks ---
const mockedProductoFind = (Producto as any).find as jest.Mock;
const mockedSucursalFind = Sucursal.find as jest.Mock;
const mockedGenerarIdSecuencial = generarIdSecuencial as jest.Mock;
const mockedVerifyEstado = verifyEstado as jest.Mock;
const mockedCreateSucursalProducto = createSucursalProducto as jest.Mock;


describe('Controlador: Producto', () => {
  
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { body: {} };
    responseJson = jest.fn();
    responseStatus = jest.fn().mockImplementation(() => ({ json: responseJson }));
    mockResponse = { json: responseJson, status: responseStatus };
  });

  describe('getProductos', () => {
    
    it('debería devolver una lista de productos y un estado 200', async () => {
      const mockProductos = [{ IdProducto: 'PROD-1', Nombre: 'Coca-Cola' }];
      mockedProductoFind.mockResolvedValue(mockProductos);

      await getProductos(mockRequest as Request, mockResponse as Response);

      expect(mockedProductoFind).toHaveBeenCalledWith({
        where: { Tipoproducto: { IdTipoProducto: 'ITP-2' } },
        relations: [
          'Estado', 'Marca', 'Tipoproducto', 'Subcategoria', 'Subcategoria.Categoria',
          'Imagen', 'Productomedida', 'Paquete', 'Paquete.Estado', 'Paquete.Unidadmedida',
          'Productosucursal', 'Productosucursal.Sucursal'
        ]
      });
      expect(responseJson).toHaveBeenCalledWith(mockProductos);
    });

    it('debería devolver un error 500 si la consulta a la base de datos falla', async () => {
      const errorMessage = 'Error de base de datos';
      mockedProductoFind.mockRejectedValue(new Error(errorMessage));

      await getProductos(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('createProducto', () => {
    it('debería crear un producto simple y devolver un mensaje de éxito', async () => {
      mockRequest.body = {
        RegistroProducto: {
          Nombre: 'Producto Test',
          IdMarca: null, // Para forzar la creación en sucursales
          StockMinimo: 10,
        },
      };

      mockedGenerarIdSecuencial.mockResolvedValue('PROD-NEW');
      mockedVerifyEstado.mockResolvedValue({ IdEstado: 1, Nombre: 'Activo' });
      mockedSucursalFind.mockResolvedValue([
        { IdSucursal: 'SUC-1' },
        { IdSucursal: 'SUC-2' },
      ]);

      await createProducto(mockRequest as Request, mockResponse as Response);

      expect(mockedGenerarIdSecuencial).toHaveBeenCalledWith('PROD');
      expect(Producto).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(mockedSucursalFind).toHaveBeenCalled();
      expect(mockedCreateSucursalProducto).toHaveBeenCalledTimes(2);
      expect(mockedCreateSucursalProducto).toHaveBeenCalledWith({ SucursalId: 'SUC-1', ProductoId: 'PROD-NEW', stockminimo: 10 });
      expect(mockedCreateSucursalProducto).toHaveBeenCalledWith({ SucursalId: 'SUC-2', ProductoId: 'PROD-NEW', stockminimo: 10 });
      expect(responseJson).toHaveBeenCalledWith({ message: "El Producto se registró correctamente" });
    });
  });
});
