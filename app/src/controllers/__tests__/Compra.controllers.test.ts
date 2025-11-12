
import { Request, Response } from 'express';
import { Compra } from '../../entities/Compra';
import { getCompra, registrarCompra } from '../Compra.controllers';
import { generarIdSecuencial } from '../../utils/idGenerator';
import { verifyProveedor } from '../Proveedor.controllers';
import { verifyComprobante } from '../Comprobante.controllers';
import { verifyEstado } from '../Estado.controllers';
import { createDetalleCompra } from '../Detallecompra.controllers';

// --- Mocks ---
const mockSave = jest.fn().mockResolvedValue(true);
jest.mock('../../entities/Compra', () => {
    const mockCompra = jest.fn().mockImplementation(() => ({
        save: mockSave,
    }));
    (mockCompra as any).findOne = jest.fn();
    return {
        Compra: mockCompra,
    };
});

jest.mock('../../utils/idGenerator');
jest.mock('../Proveedor.controllers');
jest.mock('../Comprobante.controllers');
jest.mock('../Estado.controllers');
jest.mock('../Detallecompra.controllers');


// --- Typed Mocks ---
const mockedCompraFindOne = (Compra as any).findOne as jest.Mock;
const mockedGenerarIdSecuencial = generarIdSecuencial as jest.Mock;
const mockedVerifyProveedor = verifyProveedor as jest.Mock;
const mockedVerifyComprobante = verifyComprobante as jest.Mock;
const mockedVerifyEstado = verifyEstado as jest.Mock;
const mockedCreateDetalleCompra = createDetalleCompra as jest.Mock;


describe('Controlador: Compra', () => {
  
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { params: {}, body: {} };
    responseJson = jest.fn();
    responseStatus = jest.fn().mockImplementation(() => ({ json: responseJson }));
    mockResponse = { json: responseJson, status: responseStatus };
  });

  describe('getCompra', () => {
    
    it('debería devolver una compra y un estado 200 si se encuentra', async () => {
      const mockCompra = { IdCompra: 'COM-1', NroComprobante: '001-001-12345' };
      mockRequest.params = { id: 'COM-1' };
      mockedCompraFindOne.mockResolvedValue(mockCompra);

      await getCompra(mockRequest as Request, mockResponse as Response);

      expect(mockedCompraFindOne).toHaveBeenCalledWith({
        where: { IdCompra: 'COM-1' },
        relations: [
          "Proveedor", "Proveedor.Persona", "Comprobante",
          "Detallecompra", "Detallecompra.Productomedida"
        ]
      });
      expect(responseJson).toHaveBeenCalledWith(mockCompra);
    });

    it('debería devolver un error 500 si la consulta a la base de datos falla', async () => {
      const errorMessage = 'Error de base de datos';
      mockRequest.params = { id: 'COM-1' };
      mockedCompraFindOne.mockRejectedValue(new Error(errorMessage));

      await getCompra(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('debería devolver null si la compra no se encuentra', async () => {
      mockRequest.params = { id: 'COM-NON-EXISTENT' };
      mockedCompraFindOne.mockResolvedValue(null);

      await getCompra(mockRequest as Request, mockResponse as Response);

      expect(responseJson).toHaveBeenCalledWith(null);
    });
  });

  describe('registrarCompra', () => {
    it('debería registrar una nueva compra y devolver un estado 201', async () => {
        mockRequest.body = {
            Compras: {
                IdProveedor: 'PROV-1',
                Numero: 'N-123',
                Comprobante: 'COMP-1'
            },
            detalles: [
                { Cantidad: 10, IdMedida: 'MED-1', Precio: 100, Fecha: '2025-01-01' }
            ]
        };

        mockedGenerarIdSecuencial.mockResolvedValue('COM-NEW');
        mockedVerifyProveedor.mockResolvedValue({});
        mockedVerifyComprobante.mockResolvedValue({});
        mockedVerifyEstado.mockResolvedValue({});
        mockedCreateDetalleCompra.mockResolvedValue({});

        await registrarCompra(mockRequest as Request, mockResponse as Response);

        expect(mockedGenerarIdSecuencial).toHaveBeenCalledWith('COM');
        expect(mockSave).toHaveBeenCalled();
        expect(mockedCreateDetalleCompra).toHaveBeenCalledTimes(1);
        expect(mockedCreateDetalleCompra).toHaveBeenCalledWith({
            IdCompra: 'COM-NEW',
            Cantidad: 10,
            IdMedida: 'MED-1',
            Descripcion: 'MED-1',
            Precio: 100,
            Fecha: '2025-01-01'
        });
        expect(responseStatus).toHaveBeenCalledWith(201);
        expect(responseJson).toHaveBeenCalledWith({ message: "La Compra se registro correctamente" });
    });
  });
});
