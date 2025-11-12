
# Plan de Pruebas de Caja Blanca para el Componente Recuperar

## 1. Introducción

Este documento detalla el plan de pruebas de caja blanca para el componente `Recuperar.vue` del proyecto. El objetivo de estas pruebas es verificar la correcta implementación de la lógica de negocio, las validaciones de entrada y el manejo de errores del componente de recuperación de contraseña.

## 2. Alcance

Las pruebas se centrarán en los siguientes aspectos del componente `Recuperar.vue`:

*   **Paso 1: Búsqueda de Email**
    *   Validación del campo de correo electrónico.
    *   Llamada a la API para buscar el usuario y enviar el PIN.
    *   Manejo de respuestas exitosas y erróneas.
*   **Paso 2: Verificación de PIN**
    *   Validación del campo de PIN.
    *   Llamada a la API para verificar el PIN.
    *   Manejo de respuestas exitosas y erróneas.
    *   Funcionalidad de reenvío de código.
*   **Paso 3: Cambio de Contraseña**
    *   Validación de los campos de nueva contraseña y confirmación de contraseña.
    *   Llamada a la API para cambiar la contraseña.
    *   Manejo de respuestas exitosas y erróneas.
*   **Funcionalidades Adicionales**
    *   Navegación entre los diferentes pasos del proceso.
    *   Mensajes de retroalimentación para el usuario (toasts).
    *   Indicador de progreso.

## 3. Estrategia de Pruebas

Se utilizará un enfoque de pruebas de caja blanca para examinar el código fuente del componente y diseñar casos de prueba que cubran las diferentes rutas de ejecución y condiciones lógicas.

### 3.1. Técnicas de Prueba

*   **Cobertura de sentencias:** Asegurar que cada línea de código sea ejecutada al menos una vez.
*   **Cobertura de decisiones:** Asegurar que cada posible resultado de una decisión (if, switch, etc.) sea probado.
*   **Cobertura de condiciones:** Asegurar que cada condición booleana en una decisión sea probada como verdadera y falsa.
*   **Pruebas de valores límite:** Probar los valores en los límites de los rangos de entrada válidos.
*   **Pruebas de rutas de ejecución:** Probar las diferentes rutas que un usuario puede tomar a través del componente.

## 4. Casos de Prueba

| ID | Descripción | Pasos a seguir | Resultado esperado |
| :-- | :--- | :--- | :--- |
| **REC-001** | **Validación de correo electrónico vacío** | 1. Dejar el campo de correo electrónico vacío.<br>2. Hacer clic en el botón "Buscar". | Se muestra el mensaje de error "El correo electrónico es requerido". |
| **REC-002** | **Validación de correo electrónico con formato incorrecto** | 1. Ingresar un correo electrónico con un formato inválido.<br>2. Hacer clic en el botón "Buscar". | Se muestra un mensaje de error de formato de correo inválido. |
| **REC-003** | **Búsqueda de usuario exitosa** | 1. Ingresar un correo electrónico válido y registrado.<br>2. Hacer clic en el botón "Buscar". | Se pasa al paso de verificación de PIN y se muestra un toast de éxito. |
| **REC-004** | **Búsqueda de usuario no encontrado** | 1. Ingresar un correo electrónico válido pero no registrado.<br>2. Hacer clic en el botón "Buscar". | Se muestra un toast de error indicando que el usuario no fue encontrado. |
| **REC-005** | **Verificación de PIN vacío** | 1. Dejar el campo de PIN vacío.<br>2. Hacer clic en el botón "Verificar". | Se muestra un toast de error indicando que se debe completar el código. |
| **REC-006** | **Verificación de PIN incorrecto** | 1. Ingresar un PIN incorrecto.<br>2. Hacer clic en el botón "Verificar". | Se muestra un toast de error de PIN incorrecto y se limpian los campos del PIN. |
| **REC-007** | **Verificación de PIN exitosa** | 1. Ingresar el PIN correcto.<br>2. Hacer clic en el botón "Verificar". | Se pasa al paso de cambio de contraseña y se muestra un toast de éxito. |
| **REC-008** | **Reenvío de código de verificación** | 1. Hacer clic en el enlace "Reenviar código". | Se muestra un toast de éxito y se inicia el temporizador de reenvío. |
| **REC-009** | **Validación de contraseña vacía** | 1. Dejar el campo de nueva contraseña vacío.<br>2. Hacer clic en el botón "Cambiar Contraseña". | Se muestra un mensaje de error de contraseña requerida. |
| **REC-010** | **Validación de contraseñas que no coinciden** | 1. Ingresar una nueva contraseña y una confirmación diferente.<br>2. Hacer clic en el botón "Cambiar Contraseña". | Se muestra un mensaje de error indicando que las contraseñas no coinciden. |
| **REC-011** | **Cambio de contraseña exitoso** | 1. Ingresar una nueva contraseña válida y confirmarla.<br>2. Hacer clic en el botón "Cambiar Contraseña". | Se muestra un mensaje de éxito y se ofrece un botón para ir al login. |
| **REC-012** | **Navegación hacia atrás desde verificación de PIN** | 1. En el paso de verificación de PIN, hacer clic en el botón "Atrás". | Se regresa al paso de búsqueda de email. |
| **REC-013** | **Cancelar recuperación de contraseña** | 1. En cualquier paso, hacer clic en el botón "Cancelar" o "Atrás" para volver al login. | Se redirige a la página de login. |
