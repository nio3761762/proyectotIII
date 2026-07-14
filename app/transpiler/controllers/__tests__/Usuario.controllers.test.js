"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Usuario_1 = require("../../entities/Usuario");
const Usuario_controllers_1 = require("../Usuario.controllers");
// Mock de la entidad Usuario y su método find
jest.mock('../../entities/Usuario', () => {
    const originalModule = jest.requireActual('../../entities/Usuario');
    return {
        ...originalModule,
        Usuario: {
            ...originalModule.Usuario,
            find: jest.fn(),
        },
    };
});
// Casteamos el mock para tener tipado
const mockedUsuarioFind = Usuario_1.Usuario.find;
describe('Controlador: Usuario', () => {
    let mockRequest;
    let mockResponse;
    let responseJson;
    let responseStatus;
    beforeEach(() => {
        // Limpiamos los mocks antes de cada prueba
        jest.clearAllMocks();
        // Creamos mocks para los objetos de request y response
        mockRequest = {};
        responseJson = jest.fn();
        responseStatus = jest.fn().mockImplementation(() => ({
            json: responseJson,
        }));
        mockResponse = {
            json: responseJson,
            status: responseStatus,
        };
    });
    describe('getUsuarios', () => {
        it('debería devolver una lista de usuarios y un estado 200', async () => {
            const mockUsuarios = [
                { IdUsuario: 'U001', Contrasena: 'pass1', Persona: { Nombre: 'Juan' } },
                { IdUsuario: 'U002', Contrasena: 'pass2', Persona: { Nombre: 'Ana' } },
            ];
            // Configuramos el mock para que devuelva los usuarios falsos
            mockedUsuarioFind.mockResolvedValue(mockUsuarios);
            // Ejecutamos la función del controlador
            await (0, Usuario_controllers_1.getUsuarios)(mockRequest, mockResponse);
            // Verificamos que el método find fue llamado
            expect(Usuario_1.Usuario.find).toHaveBeenCalledTimes(1);
            // Verificamos que la respuesta JSON contiene los usuarios
            expect(responseJson).toHaveBeenCalledWith(mockUsuarios);
            // Verificamos que no se llamó a status, lo que implica un 200 OK por defecto en Express
            expect(responseStatus).not.toHaveBeenCalled();
        });
        it('debería devolver un error 500 si la consulta a la base de datos falla', async () => {
            const errorMessage = 'Error de base de datos';
            // Configuramos el mock para que rechace la promesa con un error
            mockedUsuarioFind.mockRejectedValue(new Error(errorMessage));
            // Ejecutamos la función del controlador
            await (0, Usuario_controllers_1.getUsuarios)(mockRequest, mockResponse);
            // Verificamos que el método find fue llamado
            expect(Usuario_1.Usuario.find).toHaveBeenCalledTimes(1);
            // Verificamos que se estableció el estado 500
            expect(responseStatus).toHaveBeenCalledWith(500);
            // Verificamos que la respuesta JSON contiene el mensaje de error
            expect(responseJson).toHaveBeenCalledWith({ message: errorMessage });
        });
    });
});
