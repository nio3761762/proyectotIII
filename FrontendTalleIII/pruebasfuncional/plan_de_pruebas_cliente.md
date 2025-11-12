
# Plan de Pruebas de Caja Blanca para el Componente Cliente

## 1. Introducción

Este documento detalla el plan de pruebas de caja blanca para el componente `Cliente.vue` del proyecto. El objetivo de estas pruebas es verificar la correcta implementación de la lógica de negocio, las validaciones de entrada, el manejo de errores y la gestión de estado del componente de clientes.

## 2. Alcance

Las pruebas se centrarán en los siguientes aspectos del componente `Cliente.vue`:

*   **Vista Principal (Lista de Clientes):**
    *   Filtro de clientes por nombre y estado.
    *   Paginación de clientes.
    *   Visualización y expansión de los detalles de un cliente.
*   **Vista de Registro/Edición:**
    *   Creación y actualización de la información de un cliente.
    *   Validación de campos del formulario.
*   **Modales:**
    *   Confirmación de activación/desactivación de clientes.

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
| **CLIENTE-001** | **Filtrar clientes por nombre** | 1. Ingresar un nombre en el filtro de nombre. | La lista de clientes se actualiza para mostrar solo los clientes que coinciden con el nombre. |
| **CLIENTE-002** | **Filtrar clientes por estado** | 1. Seleccionar un estado en el filtro de estado. | La lista de clientes se actualiza para mostrar solo los clientes con el estado seleccionado. |
| **CLIENTE-003** | **Paginación de clientes** | 1. Navegar a la página siguiente de clientes. | Se muestra la siguiente página de clientes. |
| **CLIENTE-004** | **Expandir detalles de un cliente** | 1. Hacer clic en el botón para expandir los detalles de un cliente. | Se muestran los detalles del cliente. |
| **CLIENTE-005** | **Crear un nuevo cliente** | 1. Abrir el formulario de registro de cliente.<br>2. Completar todos los campos requeridos.<br>3. Guardar el cliente. | El cliente se crea y aparece en la lista de clientes. |
| **CLIENTE-006** | **Validación de campos vacíos en el formulario de cliente** | 1. Intentar guardar un cliente sin completar todos los campos requeridos. | Se muestran mensajes de error para los campos vacíos. |
| **CLIENTE-007** | **Editar un cliente existente** | 1. Abrir el formulario de edición de un cliente.<br>2. Modificar algunos datos del cliente.<br>3. Guardar los cambios. | Los cambios se guardan y se reflejan en la lista de clientes. |
| **CLIENTE-008** | **Activar/desactivar un cliente** | 1. Hacer clic en el botón de activar/desactivar de un cliente.<br>2. Confirmar la acción en el modal. | El estado del cliente cambia y se refleja en la lista. |
| **CLIENTE-009** | **Cancelar la edición de un cliente** | 1. Abrir el formulario de edición de un cliente.<br>2. Hacer clic en el botón "Cancelar". | Se cierra el formulario y no se guardan los cambios. |
