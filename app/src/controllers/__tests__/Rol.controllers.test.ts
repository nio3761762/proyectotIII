
import { Request, Response } from 'express';
import { Rol } from '../../entities/Rol';
import { getRoles, createRole } from '../Rol.controllers';
import { verifyEstado } from '../Estado.controllers';

// Mockear dependencias externas
jest.mock('../Estado.controllers');

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
  select: jest.fn().mockReturnThis(),
  getRawOne: jest.fn(),
};

const mockSave = jest.fn().mockResolvedValue(true);

jest.mock('../../entities/Rol', () => {
    const originalModule = jest.requireActual('../../entities/Rol');
    // Crear un mock constructor
    const mockRol = jest.fn().mockImplementation(() => ({
        save: mockSave,
    }));

    // Adjuntar métodos estáticos al mock constructor
    (mockRol as any).createQueryBuilder = jest.fn(() => mockQueryBuilder);
    (mockRol as any).findOne = jest.fn();

    return {
        ...originalModule,
        Rol: mockRol, // Reemplazar Rol con nuestro mock mejorado
    };
});

// Castear mocks para tener tipado
const mockedCreateQueryBuilder = (Rol as any).createQueryBuilder as jest.Mock;
const mockedRolFindOne = (Rol as any).findOne as jest.Mock;
const mockedVerifyEstado = verifyEstado as jest.Mock;

describe('Controlador: Rol', () => {
  
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
    };
    
    responseJson = jest.fn();
    responseStatus = jest.fn().mockImplementation(() => ({
      json: responseJson,
    }));

    mockResponse = {
      json: responseJson,
      status: responseStatus,
    };
  });

  describe('getRoles', () => {
    
    it('debería devolver una lista de roles y un estado 200', async () => {
      const mockRoles = [
        { IdRol: 'ROL-1', Nombre: 'Administrador' },
        { IdRol: 'ROL-2', Nombre: 'Vendedor' },
      ];
      mockQueryBuilder.getMany.mockResolvedValue(mockRoles);

      await getRoles(mockRequest as Request, mockResponse as Response);

      expect(mockedCreateQueryBuilder).toHaveBeenCalledWith('rol');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(5);
      expect(responseJson).toHaveBeenCalledWith(mockRoles);
      expect(responseStatus).not.toHaveBeenCalled();
    });

    it('debería devolver un error 500 si la consulta a la base de datos falla', async () => {
      const errorMessage = 'Error de base de datos';
      mockQueryBuilder.getMany.mockRejectedValue(new Error(errorMessage));

      await getRoles(mockRequest as Request, mockResponse as Response);

      expect(mockedCreateQueryBuilder).toHaveBeenCalledWith('rol');
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('createRole', () => {

    it('debería crear un nuevo rol y devolverlo con un estado 201', async () => {
      const newRoleName = 'Nuevo Rol';
      mockRequest.body = { Nombre: newRoleName };

      // El rol no existe
      mockedRolFindOne.mockResolvedValue(null);
      // El estado es válido
      mockedVerifyEstado.mockResolvedValue({ IdEstado: 1, Nombre: 'Activo' });
      // Mock para la generación de ID
      mockQueryBuilder.getRawOne.mockResolvedValue({ ultimoId: 'Rol-2' });
      // Mock para el findOne después de crear
      const createdRole = { IdRol: 'Rol-3', Nombre: newRoleName };
      mockedRolFindOne.mockResolvedValueOnce(null).mockResolvedValueOnce(createdRole);


      await createRole(mockRequest as Request, mockResponse as Response);

      expect(mockedRolFindOne).toHaveBeenCalledWith({ where: { Nombre: newRoleName } });
      expect(mockedVerifyEstado).toHaveBeenCalledWith({ EstadoId: 1 });
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdRole);
    });

    it('debería devolver un error 400 si el rol ya existe', async () => {
      const existingRoleName = 'Rol Existente';
      mockRequest.body = { Nombre: existingRoleName };

      // Simulamos que el rol ya existe
      mockedRolFindOne.mockResolvedValue({ IdRol: 'ROL-1', Nombre: existingRoleName });

      await createRole(mockRequest as Request, mockResponse as Response);

      expect(mockedRolFindOne).toHaveBeenCalledWith({ where: { Nombre: existingRoleName } });
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ message: "El rol ya existe" });
    });
  });
});
