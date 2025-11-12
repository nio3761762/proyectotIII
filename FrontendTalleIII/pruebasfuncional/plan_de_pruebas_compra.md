
# Plan de Pruebas de Caja Blanca para el Componente Compra

## 1. Introducción

Este documento detalla el plan de pruebas de caja blanca para el componente `Compra.vue` del proyecto. El objetivo de estas pruebas es verificar la correcta implementación de la lógica de negocio, las validaciones de entrada, el manejo de errores y la gestión de estado del componente de compras.

## 2. Alcance

Las pruebas se centrarán en los siguientes aspectos del componente `Compra.vue`:

*   **Vista Principal (Historial de Compras):**
    *   Filtro de compras por fecha.
    *   Búsqueda de compras por proveedor o producto.
    *   Paginación de compras.
    *   Visualización y expansión de los detalles de una compra.
*   **Vista de Registro/Edición:**
    *   Selección de proveedor y tipo de comprobante.
    *   Adición y eliminación de insumos a la compra.
    *   Cálculo del total de la compra.
    *   Validación de campos del formulario.
    *   Creación y actualización de compras.
*   **Modales:**
    *   Registro de nuevos insumos.
    *   Confirmación de anulación de compras.

## 3. Estrategia de Pruebas

Se utilizará un enfoque de pruebas de caja blanca para examinar el código fuente del componente y diseñar casos de prueba que cubran las diferentes rutas de ejecución y condiciones lógicas.

### 3.1. Técnicas de Prueba

*   **Cobertura de sentencias y decisiones:** Asegurar que cada línea de código y cada rama de una decisión sean ejecutadas.
*   **Pruebas de valores límite:** Probar los valores en los límites de los rangos de entrada válidos.
*   **Pruebas de rutas de ejecución:** Probar las diferentes secuencias de acciones que un usuario puede realizar.
*   **Pruebas de estado:** Verificar que el estado del componente se actualice correctamente después de cada acción.

## 4. Casos de Prueba

| ID | Descripción | Pasos a seguir | Resultado esperado |
| :-- | :--- | :--- | :--- |
| **COMPRA-001** | **Filtrar compras por fecha** | 1. Seleccionar una fecha en el filtro de fecha. | La lista de compras se actualiza para mostrar solo las compras de la fecha seleccionada. |
| **COMPRA-002** | **Búsqueda de compras por proveedor** | 1. Ingresar el nombre de un proveedor en el campo de búsqueda. | La lista de compras se filtra para mostrar solo las compras del proveedor buscado. |
| **COMPRA-003** | **Paginación de compras** | 1. Navegar a la página siguiente de compras. | Se muestra la siguiente página de compras. |
| **COMPRA-004** | **Expandir detalles de una compra** | 1. Hacer clic en el botón "Ver Detalles" de una compra. | Se muestran los detalles de la compra, incluyendo los insumos y sus precios. |
| **COMPRA-005** | **Agregar un insumo a la compra** | 1. En la vista de registro, seleccionar un insumo, medida, cantidad y fecha de vencimiento.<br>2. Hacer clic en "Agregar Producto a la Compra". | El insumo se agrega a la lista de ítems de la compra. |
| **COMPRA-006** | **Validación de campos vacíos en el formulario de compra** | 1. Intentar guardar una compra sin completar todos los campos requeridos. | Se muestran mensajes de error para los campos vacíos. |
| **COMPRA-007** | **Eliminar un insumo de la compra** | 1. En la lista de ítems de la compra, hacer clic en el botón de eliminar de un insumo. | El insumo se elimina de la lista. |
| **COMPRA-008** | **Registrar una nueva compra** | 1. Completar todos los campos requeridos para una nueva compra.<br>2. Hacer clic en "Registrar". | Se guarda la compra, se muestra un mensaje de éxito y se regresa a la vista de historial. |
| **COMPRA-009** | **Editar una compra existente** | 1. Hacer clic en el botón "Editar" de una compra.<br>2. Modificar algunos datos de la compra.<br>3. Hacer clic en "Actualizar". | Se guardan los cambios, se muestra un mensaje de éxito y se regresa a la vista de historial. |
| **COMPRA-010** | **Anular una compra** | 1. Hacer clic en el botón de anular de una compra.<br>2. Confirmar la anulación en el modal. | La compra se marca como anulada. |
| **COMPRA-011** | **Abrir modal para agregar nuevo insumo** | 1. En la vista de registro, hacer clic en "Nuevo Producto". | Se abre el modal para agregar un nuevo insumo. |
