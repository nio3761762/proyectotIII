
# Plan de Pruebas de Caja Blanca para el Componente Producto

## 1. Introducción

Este documento detalla el plan de pruebas de caja blanca para el componente `Producto.vue` del proyecto. El objetivo de estas pruebas es verificar la correcta implementación de la lógica de negocio, las validaciones de entrada, el manejo de errores y la gestión de estado del componente de productos.

## 2. Alcance

Las pruebas se centrarán en los siguientes aspectos del componente `Producto.vue`:

*   **Vista Principal (Lista de Productos):**
    *   Filtro de productos por categoría, subcategoría y tienda.
    *   Búsqueda de productos.
    *   Paginación de productos y paquetes.
    *   Visualización y expansión de los detalles de un producto.
*   **Vista de Registro/Edición:**
    *   Creación y actualización de la información básica de un producto.
    *   Gestión de imágenes de productos.
    *   Gestión de presentaciones (paquetes) de productos.
    *   Gestión de ingredientes de productos.
    *   Validación de campos del formulario.
*   **Modales:**
    *   Gestión de paquetes de productos.
    *   Gestión de ingredientes de productos.
    *   Confirmación de activación/desactivación de productos.
    *   Gestión de fotos de productos.
*   **Gestión de Stock:**
    *   Actualización del stock de productos en diferentes tiendas.

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
| **PROD-001** | **Filtrar productos por categoría** | 1. Seleccionar una categoría en el filtro. | La lista de productos se actualiza para mostrar solo los productos de la categoría seleccionada. |
| **PROD-002** | **Búsqueda de productos** | 1. Ingresar el nombre de un producto en el campo de búsqueda. | La lista de productos se filtra para mostrar solo los productos que coinciden con la búsqueda. |
| **PROD-003** | **Paginación de productos** | 1. Navegar a la página siguiente de productos. | Se muestra la siguiente página de productos. |
| **PROD-004** | **Expandir detalles de un producto** | 1. Hacer clic en el botón para expandir los detalles de un producto. | Se muestran los detalles del producto, incluyendo sus paquetes y promociones. |
| **PROD-005** | **Crear un nuevo producto** | 1. Abrir el modal de registro de producto.<br>2. Completar todos los campos requeridos.<br>3. Guardar el producto. | El producto se crea y aparece en la lista de productos. |
| **PROD-006** | **Validación de campos vacíos en el formulario de producto** | 1. Intentar guardar un producto sin completar todos los campos requeridos. | Se muestran mensajes de error para los campos vacíos. |
| **PROD-007** | **Editar un producto existente** | 1. Abrir el modal de edición de un producto.<br>2. Modificar algunos datos del producto.<br>3. Guardar los cambios. | Los cambios se guardan y se reflejan en la lista de productos. |
| **PROD-008** | **Gestionar paquetes de un producto** | 1. Abrir el modal de gestión de paquetes de un producto.<br>2. Agregar, editar o eliminar un paquete.<br>3. Guardar los cambios. | Los cambios en los paquetes se guardan correctamente. |
| **PROD-009** | **Gestionar ingredientes de un producto** | 1. Abrir el modal de gestión de ingredientes de un producto.<br>2. Agregar, editar o eliminar un ingrediente.<br>3. Guardar los cambios. | Los cambios en los ingredientes se guardan correctamente. |
| **PROD-010** | **Activar/desactivar un producto** | 1. Hacer clic en el botón de activar/desactivar de un producto.<br>2. Confirmar la acción en el modal. | El estado del producto cambia y se refleja en la lista. |
| **PROD-011** | **Actualizar el stock de un producto** | 1. Modificar la cantidad de stock de un producto en una tienda. | El stock se actualiza correctamente. |
| **PROD-012** | **Subir una imagen para un producto** | 1. En el formulario de producto, seleccionar una imagen para subir. | La imagen se sube y se muestra una vista previa. |
