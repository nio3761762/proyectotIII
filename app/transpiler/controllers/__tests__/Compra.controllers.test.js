"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Compra_1 = require("../../entities/Compra");
const Compra_controllers_1 = require("../Compra.controllers");
const idGenerator_1 = require("../../utils/idGenerator");
const Proveedor_controllers_1 = require("../Proveedor.controllers");
const Comprobante_controllers_1 = require("../Comprobante.controllers");
const Estado_controllers_1 = require("../Estado.controllers");
const Detallecompra_controllers_1 = require("../Detallecompra.controllers");
// --- Mocks ---
const mockSave = jest.fn().mockResolvedValue(true);
jest.mock('../../entities/Compra', () => {
    const mockCompra = jest.fn().mockImplementation(() => ({
        save: mockSave,
    }));
    mockCompra.findOne = jest.fn();
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
const mockedCompraFindOne = Compra_1.Compra.findOne;
const mockedGenerarIdSecuencial = idGenerator_1.generarIdSecuencial;
const mockedVerifyProveedor = Proveedor_controllers_1.verifyProveedor;
const mockedVerifyComprobante = Comprobante_controllers_1.verifyComprobante;
const mockedVerifyEstado = Estado_controllers_1.verifyEstado;
const mockedCreateDetalleCompra = Detallecompra_controllers_1.createDetalleCompra;
describe('Controlador: Compra', () => {
    let mockRequest;
    let mockResponse;
    let responseJson;
    let responseStatus;
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
            await (0, Compra_controllers_1.getCompra)(mockRequest, mockResponse);
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
            await (0, Compra_controllers_1.getCompra)(mockRequest, mockResponse);
            expect(responseStatus).toHaveBeenCalledWith(500);
            expect(responseJson).toHaveBeenCalledWith({ message: errorMessage });
        });
        it('debería devolver null si la compra no se encuentra', async () => {
            mockRequest.params = { id: 'COM-NON-EXISTENT' };
            mockedCompraFindOne.mockResolvedValue(null);
            await (0, Compra_controllers_1.getCompra)(mockRequest, mockResponse);
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
            await (0, Compra_controllers_1.registrarCompra)(mockRequest, mockResponse);
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
