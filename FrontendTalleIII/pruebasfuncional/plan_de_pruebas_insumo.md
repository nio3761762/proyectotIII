
# Plan de Pruebas de Caja Blanca para el Componente Insumo

## 1. Introducción

Este documento detalla el plan de pruebas de caja blanca para el componente `Insumo.vue` del proyecto. El objetivo de estas pruebas es verificar la correcta implementación de la lógica de negocio, las validaciones de entrada, el manejo de errores y la gestión de estado del componente de insumos.

## 2. Alcance

Las pruebas se centrarán en los siguientes aspectos del componente `Insumo.vue`:

*   **Vista Principal (Lista de Insumos):**
    *   Búsqueda de insumos.
    *   Paginación de insumos.
    *   Visualización y expansión de los detalles de un insumo.
*   **Vista de Registro/Edición:**
    *   Creación y actualización de la información básica de un insumo.
    *   Gestión de imágenes de insumos.
    *   Gestión de medidas de insumos.
    *   Validación de campos del formulario.
*   **Modales:**
    *   Confirmación de activación/desactivación de insumos.

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
| **INSUMO-001** | **Búsqueda de insumos** | 1. Ingresar el nombre de un insumo en el campo de búsqueda. | La lista de insumos se filtra para mostrar solo los insumos que coinciden con la búsqueda. |
| **INSUMO-002** | **Paginación de insumos** | 1. Navegar a la página siguiente de insumos. | Se muestra la siguiente página de insumos. |
| **INSUMO-003** | **Expandir detalles de un insumo** | 1. Hacer clic en el botón para expandir los detalles de un insumo. | Se muestran los detalles del insumo, incluyendo sus medidas. |
| **INSUMO-004** | **Crear un nuevo insumo** | 1. Abrir el formulario de registro de insumo.<br>2. Completar todos los campos requeridos.<br>3. Guardar el insumo. | El insumo se crea y aparece en la lista de insumos. |
| **INSUMO-005** | **Validación de campos vacíos en el formulario de insumo** | 1. Intentar guardar un insumo sin completar todos los campos requeridos. | Se muestran mensajes de error para los campos vacíos. |
| **INSUMO-006** | **Editar un insumo existente** | 1. Abrir el formulario de edición de un insumo.<br>2. Modificar algunos datos del insumo.<br>3. Guardar los cambios. | Los cambios se guardan y se reflejan en la lista de insumos. |
| **INSUMO-007** | **Agregar una medida a un insumo** | 1. En el formulario de insumo, agregar una nueva medida con precio y cantidad.<br>2. Hacer clic en "Agregar Medida". | La medida se agrega a la lista de medidas del insumo. |
| **INSUMO-008** | **Eliminar una medida de un insumo** | 1. En el formulario de insumo, hacer clic en el botón de eliminar de una medida. | La medida se elimina de la lista de medidas del insumo. |
| **INSUMO-009** | **Activar/desactivar un insumo** | 1. Hacer clic en el botón de activar/desactivar de un insumo.<br>2. Confirmar la acción en el modal. | El estado del insumo cambia y se refleja en la lista. |
| **INSUMO-010** | **Subir una imagen para un insumo** | 1. En el formulario de insumo, seleccionar una imagen para subir. | La imagen se sube y se muestra una vista previa. |
