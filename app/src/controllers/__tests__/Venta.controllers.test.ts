
import { Request, Response } from 'express';
import { Venta } from '../../entities/Venta'; // Only import Venta
import { getVentas, registrarVenta } from '../Venta.controllers';
import { generarIdSecuencial } from '../../utils/idGenerator';
import { verifyPersona, AnanirPersona } from '../Persona.controllers'; // DataPersona is AnanirPersona
import { verifyUsuario } from '../Usuario.controllers';
import { verifySucursal } from '../Sucursal.controllers';
import { verifyEstado } from '../Estado.controllers';
import { createPago } from '../Pago.controllers';
import { createDetalleventa } from '../DetalleVenta.controllers';

// --- Mocks ---
let mockSave: jest.Mock;
let mockFind: jest.Mock;
let mockFindOne: jest.Mock;
jest.mock('../../entities/Venta', () => {
  const originalModule = jest.requireActual('../../entities/Venta');

  const _mockSave = jest.fn().mockResolvedValue(true);
  const _mockFind = jest.fn();
  const _mockFindOne = jest.fn();

  // Mock sin heredar de BaseEntity
  const MockVenta = jest.fn().mockImplementation(() => ({
    save: _mockSave,
  }));

  Object.assign(MockVenta, {
    find: _mockFind,
    findOne: _mockFindOne
  });

  return {
    ...originalModule,
    Venta: MockVenta,
    mockSave: _mockSave,
    mockFind: _mockFind,
    mockFindOne: _mockFindOne,
  };
});


jest.mock('../../entities/Usuario', () => ({
  Usuario: { findOne: jest.fn(), find: jest.fn(), save: jest.fn() }
}));

jest.mock('../Usuario.controllers', () => ({
  verifyUsuario: jest.fn(),
}));

jest.mock('../../entities/Persona', () => ({
  Persona: { findOne: jest.fn(), find: jest.fn(), save: jest.fn() }
}));

jest.mock('../Persona.controllers', () => ({
  verifyPersona: jest.fn(),
  AnanirPersona: jest.fn(),
}));


jest.mock('../../entities/Sucursal', () => ({
  Sucursal: { findOne: jest.fn(), find: jest.fn() }
}));

jest.mock('../Sucursal.controllers', () => ({
  verifySucursal: jest.fn(),
}));

jest.mock('../../entities/Estado', () => ({
  Estado: { findOne: jest.fn(), find: jest.fn() }
}));

jest.mock('../Estado.controllers', () => ({
  verifyEstado: jest.fn(),
}));

jest.mock('../../entities/Pago', () => ({
  Pago: { save: jest.fn() }
}));

jest.mock('../Pago.controllers', () => ({
  createPago: jest.fn(),
}));

jest.mock('../../entities/DetalleVenta', () => ({
  Detalleventa: { save: jest.fn() }
}));
jest.mock('../DetalleVenta.controllers', () => ({
  createDetalleventa: jest.fn(),
}));
jest.mock('../../utils/idGenerator', () => ({
  generarIdSecuencial: jest.fn()
}));

// --- Typed Mocks ---
const mockedGenerarIdSecuencial = generarIdSecuencial as jest.Mock;
const mockedVerifyPersona = verifyPersona as jest.Mock;
const mockedAnanirPersona = AnanirPersona as jest.Mock; // Mock DataPersona
const mockedVerifyUsuario = verifyUsuario as jest.Mock;
const mockedVerifySucursal = verifySucursal as jest.Mock;
const mockedVerifyEstado = verifyEstado as jest.Mock;
const mockedCreatePago = createPago as jest.Mock;
const mockedCreateDetalleventa = createDetalleventa as jest.Mock;


describe('Controlador: Venta', () => {
  
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

    // Dynamically require the mocked module and assign the exported mocks
    const mockedVentaModule = require('../../entities/Venta');
    mockSave = mockedVentaModule.mockSave;
    mockFind = mockedVentaModule.mockFind;
    mockFindOne = mockedVentaModule.mockFindOne;
  });

  describe('getVentas', () => {
    
    it('debería devolver una lista de ventas y un estado 200', async () => {
      const mockVentas = [{ IdVenta: 'V-1', FechaVenta: new Date() }];
      mockFind.mockResolvedValue(mockVentas); // Use mockFind directly

      await getVentas(mockRequest as Request, mockResponse as Response);

      expect(mockFind).toHaveBeenCalledWith({ // Use mockFind directly
        relations: [
          "Estado", "Usuario", "Usuario.Usuariosucursal", "Usuario.Usuariosucursal.Sucursal"
        ]
      });
      expect(responseJson).toHaveBeenCalledWith(mockVentas);
    });

    it('debería devolver un error 500 si la consulta a la base de datos falla', async () => {
      const errorMessage = 'Error de base de datos';
      mockFind.mockRejectedValue(new Error(errorMessage)); // Use mockFind directly

      await getVentas(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('registrarVenta', () => {
    it('debería registrar una nueva venta y devolver un estado 201', async () => {
        mockRequest.body = {
            ventas: {
                IdCliente: 'CLI-1',
                IdUsuario: 'USER-1',
                IdSucursal: 'SUC-1',
                Monto: 100,
                Cambio: 0,
                IdMetodoPago: 1,
                Nombre: 'Cliente Test' // For DataPersona
            },
            detalles: {
                Producto: [{ id: 'PROD-1', Cantidad: 1, precioUnitario: 100, Modo: 'Venta' }],
                Paquete: [],
                Promocion: []
            }
        };

        mockedGenerarIdSecuencial.mockResolvedValue('VENTA-NEW');
        mockedVerifyPersona.mockResolvedValue({});
        mockedAnanirPersona.mockResolvedValue({ IdPersona: 'CLI-1' }); // DataPersona returns IdPersona
        mockedVerifyUsuario.mockResolvedValue({});
        mockedVerifySucursal.mockResolvedValue({});
        mockedVerifyEstado.mockResolvedValue({});
        mockedCreatePago.mockResolvedValue({});
        mockedCreateDetalleventa.mockResolvedValue({});

        await registrarVenta(mockRequest as Request, mockResponse as Response);

        expect(mockedGenerarIdSecuencial).toHaveBeenCalledWith('V');
        expect(mockedAnanirPersona).toHaveBeenCalledWith(expect.objectContaining({ Nombre: 'Cliente Test' }));
        expect(mockedVerifyPersona).toHaveBeenCalledWith({ PersonaId: 'CLI-1' });
        expect(mockedVerifyUsuario).toHaveBeenCalledWith({ UsuarioId: 'USER-1' });
        expect(mockedVerifySucursal).toHaveBeenCalledWith({ SucursalId: 'SUC-1' });
        expect(mockedVerifyEstado).toHaveBeenCalledWith({ EstadoId: 3 });
        expect(mockSave).toHaveBeenCalled();
        expect(mockedCreatePago).toHaveBeenCalledWith({
            IdVenta: 'VENTA-NEW',
            Monto: 100,
            Cambio: 0,
            IdMetodoPago: 1
        });
        expect(mockedCreateDetalleventa).toHaveBeenCalledTimes(1);
        expect(mockedCreateDetalleventa).toHaveBeenCalledWith(expect.objectContaining({
            IdProducto: 'PROD-1',
            Cantidad: 1,
            IdVenta: 'VENTA-NEW',
            Precio: '100.00',
            IdSucursal: 'SUC-1',
            Modo: 'Venta'
        }));
        expect(responseStatus).toHaveBeenCalledWith(201);
        expect(responseJson).toHaveBeenCalledWith({ message: "La venta se registro correctamente" });
    });
  });
});
