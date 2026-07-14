"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Producto_1 = require("../../entities/Producto");
const Sucursal_1 = require("../../entities/Sucursal");
const Producto_controllers_1 = require("../Producto.controllers");
const idGenerator_1 = require("../../utils/idGenerator");
const Estado_controllers_1 = require("../Estado.controllers");
const SucursalProducto_controllers_1 = require("../SucursalProducto.controllers");
// --- Mocks ---
const mockSave = jest.fn().mockResolvedValue(true);
jest.mock('../../entities/Producto', () => {
    const mockProducto = jest.fn().mockImplementation(() => ({
        save: mockSave,
    }));
    mockProducto.find = jest.fn();
    return {
        Producto: mockProducto,
    };
});
jest.mock('../../entities/Sucursal');
jest.mock('../../utils/idGenerator');
jest.mock('../Estado.controllers');
jest.mock('../SucursalProducto.controllers');
// --- Typed Mocks ---
const mockedProductoFind = Producto_1.Producto.find;
const mockedSucursalFind = Sucursal_1.Sucursal.find;
const mockedGenerarIdSecuencial = idGenerator_1.generarIdSecuencial;
const mockedVerifyEstado = Estado_controllers_1.verifyEstado;
const mockedCreateSucursalProducto = SucursalProducto_controllers_1.createSucursalProducto;
describe('Controlador: Producto', () => {
    let mockRequest;
    let mockResponse;
    let responseJson;
    let responseStatus;
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
            await (0, Producto_controllers_1.getProductos)(mockRequest, mockResponse);
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
            await (0, Producto_controllers_1.getProductos)(mockRequest, mockResponse);
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
            await (0, Producto_controllers_1.createProducto)(mockRequest, mockResponse);
            expect(mockedGenerarIdSecuencial).toHaveBeenCalledWith('PROD');
            expect(Producto_1.Producto).toHaveBeenCalled();
            expect(mockSave).toHaveBeenCalled();
            expect(mockedSucursalFind).toHaveBeenCalled();
            expect(mockedCreateSucursalProducto).toHaveBeenCalledTimes(2);
            expect(mockedCreateSucursalProducto).toHaveBeenCalledWith({ SucursalId: 'SUC-1', ProductoId: 'PROD-NEW', stockminimo: 10 });
            expect(mockedCreateSucursalProducto).toHaveBeenCalledWith({ SucursalId: 'SUC-2', ProductoId: 'PROD-NEW', stockminimo: 10 });
            expect(responseJson).toHaveBeenCalledWith({ message: "El Producto se registró correctamente" });
        });
    });
});
