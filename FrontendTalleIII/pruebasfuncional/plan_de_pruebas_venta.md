
# Plan de Pruebas de Caja Blanca para el Componente Venta

## 1. Introducción

Este documento detalla el plan de pruebas de caja blanca para el componente `Venta.vue` del proyecto. El objetivo de estas pruebas es verificar la correcta implementación de la lógica de negocio, las validaciones de entrada, el manejo de errores y la gestión de estado del componente de ventas.

## 2. Alcance

Las pruebas se centrarán en los siguientes aspectos del componente `Venta.vue`:

*   **Vista Principal (Historial de Ventas):**
    *   Filtro de ventas por fecha, sucursal y producto.
    *   Paginación de ventas.
    *   Búsqueda global de productos.
    *   Visualización y expansión de los detalles de una venta.
*   **Vista de Registro/Edición:**
    *   Búsqueda y selección de clientes.
    *   Búsqueda y adición de productos, promociones y paquetes al carrito.
    *   Cálculo de subtotales y total de la venta.
    *   Manejo de diferentes métodos de pago.
    *   Validación de campos y manejo de stock.
    *   Creación y actualización de ventas.
*   **Modales:**
    *   Registro de nuevos clientes.
    *   Generación de comprobantes.
    *   Confirmación de anulación de ventas.
*   **Gestión de Stock:**
    *   Actualización del stock al agregar, eliminar o cancelar ítems.

## 3. Estrategia de Pruebas

Se utilizará un enfoque de pruebas de caja blanca para examinar el código fuente del componente y diseñar casos de prueba que cubran las diferentes rutas de ejecución y condiciones lógicas.

### 3.1. Técnicas de Prueba

*   **Cobertura de sentencias y decisiones:** Asegurar que cada línea de código y cada rama de una decisión sean ejecutadas.
*   **Pruebas de valores límite:** Probar los valores en los límites de los rangos de entrada válidos (ej. cantidad de productos, montos de pago).
*   **Pruebas de rutas de ejecución:** Probar las diferentes secuencias de acciones que un usuario puede realizar.
*   **Pruebas de estado:** Verificar que el estado del componente se actualice correctamente después de cada acción.

## 4. Casos de Prueba

| ID | Descripción | Pasos a seguir | Resultado esperado |
| :-- | :--- | :--- | :--- |
| **VENTA-001** | **Filtrar ventas por fecha** | 1. Seleccionar una fecha en el filtro de fecha. | La lista de ventas se actualiza para mostrar solo las ventas de la fecha seleccionada. |
| **VENTA-002** | **Paginación de ventas** | 1. Navegar a la página siguiente de ventas. | Se muestra la siguiente página de ventas. |
| **VENTA-003** | **Búsqueda global de productos** | 1. Ingresar el nombre de un producto en el buscador global.<br>2. Hacer clic en "Buscar". | Se abre un modal con los resultados de la búsqueda. |
| **VENTA-004** | **Expandir detalles de una venta** | 1. Hacer clic en el botón "Ver más" de una venta. | Se muestran los detalles de la venta, incluyendo los ítems y la información de pago. |
| **VENTA-005** | **Agregar un producto a la venta** | 1. En la vista de registro, seleccionar un producto y una cantidad.<br>2. Hacer clic en "Agregar". | El producto se agrega al resumen de la venta y el subtotal se actualiza. |
| **VENTA-006** | **Validación de stock al agregar producto** | 1. Intentar agregar una cantidad de producto mayor al stock disponible. | Se muestra un mensaje de error de stock insuficiente. |
| **VENTA-007** | **Eliminar un ítem de la venta** | 1. En el resumen de la venta, hacer clic en el botón de eliminar de un ítem. | El ítem se elimina del resumen y el subtotal se actualiza. |
| **VENTA-008** | **Cálculo del cambio** | 1. Seleccionar el método de pago "Efectivo".<br>2. Ingresar un monto recibido mayor al total de la venta. | Se calcula y muestra el cambio correcto. |
| **VENTA-009** | **Registrar una nueva venta** | 1. Completar todos los campos requeridos para una nueva venta.<br>2. Hacer clic en "Registrar Venta". | Se guarda la venta, se muestra un mensaje de éxito y se regresa a la vista de historial. |
| **VENTA-010** | **Editar una venta existente** | 1. Hacer clic en el botón "Editar" de una venta.<br>2. Modificar algunos datos de la venta.<br>3. Hacer clic en "Actualizar Venta". | Se guardan los cambios, se muestra un mensaje de éxito y se regresa a la vista de historial. |
| **VENTA-011** | **Registrar un nuevo cliente desde el modal** | 1. En la vista de registro, hacer clic en "Nuevo Cliente".<br>2. Completar el formulario de nuevo cliente y guardar. | El nuevo cliente se crea y se selecciona automáticamente para la venta. |
| **VENTA-012** | **Generar un comprobante** | 1. Hacer clic en el botón de comprobante de una venta. | Se abre el modal para ingresar los datos del cliente y generar el comprobante. |
| **VENTA-013** | **Anular una venta** | 1. Hacer clic en el botón de anular de una venta.<br>2. Confirmar la anulación en el modal. | La venta se marca como anulada y el stock de los productos se revierte. |
| **VENTA-014** | **Actualización de stock al agregar ítem** | 1. Agregar un ítem a la venta. | El stock del ítem se reduce en la cantidad agregada. |
| **VENTA-015** | **Actualización de stock al eliminar ítem** | 1. Eliminar un ítem de la venta. | El stock del ítem se incrementa en la cantidad eliminada. |
