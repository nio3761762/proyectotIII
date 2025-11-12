
# Plan de Pruebas de Caja Blanca para el Componente Login

## 1. Introducción

Este documento detalla el plan de pruebas de caja blanca para el componente `Login.vue` del proyecto. El objetivo de estas pruebas es verificar la correcta implementación de la lógica de negocio, las validaciones de entrada y el manejo de errores del componente.

## 2. Alcance

Las pruebas se centrarán en los siguientes aspectos del componente `Login.vue`:

*   **Validación de campos de entrada:**
    *   Correo electrónico
    *   Contraseña
    *   PIN de seguridad
*   **Lógica de autenticación:**
    *   Llamada a la API de login
    *   Manejo de respuestas exitosas y erróneas
    *   Almacenamiento de tokens y datos de usuario
*   **Manejo de errores:**
    *   Mensajes de error para campos inválidos
    *   Mensajes de error para credenciales incorrectas
    *   Bloqueo de usuario por intentos fallidos
*   **Funcionalidades adicionales:**
    *   Mostrar/ocultar contraseña
    *   Redireccionamiento después de un inicio de sesión exitoso

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
| **LOGIN-001** | **Validación de correo electrónico vacío** | 1. Dejar el campo de correo electrónico vacío.<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra el mensaje de error "El correo electrónico es requerido". |
| **LOGIN-002** | **Validación de correo electrónico sin @** | 1. Ingresar un correo electrónico sin el símbolo "@".<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra el mensaje de error "El correo debe contener exactamente un símbolo @". |
| **LOGIN-003** | **Validación de correo electrónico con dominio incorrecto** | 1. Ingresar un correo electrónico que no termine en "@gmail.com".<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra el mensaje de error "El correo debe terminar en @gmail.com". |
| **LOGIN-004** | **Validación de contraseña vacía** | 1. Dejar el campo de contraseña vacío.<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra el mensaje de error "La contraseña es requerida". |
| **LOGIN-005** | **Validación de contraseña con menos de 6 caracteres** | 1. Ingresar una contraseña con menos de 6 caracteres.<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra el mensaje de error "La contraseña debe tener al menos 6 caracteres.". |
| **LOGIN-006** | **Validación de PIN vacío** | 1. Dejar el campo de PIN vacío.<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra el mensaje de error "El PIN es requerido". |
| **LOGIN-007** | **Validación de PIN con menos de 4 dígitos** | 1. Ingresar un PIN con menos de 4 dígitos.<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra el mensaje de error "El PIN debe tener exactamente 4 dígitos". |
| **LOGIN-008** | **Inicio de sesión exitoso** | 1. Ingresar un correo electrónico, contraseña y PIN válidos.<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra un mensaje de éxito y se redirige al dashboard. |
| **LOGIN-009** | **Inicio de sesión con credenciales incorrectas** | 1. Ingresar un correo electrónico, contraseña o PIN incorrectos.<br>2. Hacer clic en el botón "Iniciar Sesión". | Se muestra un mensaje de error de credenciales inválidas. |
| **LOGIN-010** | **Bloqueo de usuario por 3 intentos fallidos** | 1. Intentar iniciar sesión con credenciales incorrectas 3 veces.<br>2. Intentar iniciar sesión por cuarta vez. | Se muestra un mensaje de usuario bloqueado y el botón de inicio de sesión se deshabilita. |
| **LOGIN-011** | **Mostrar/ocultar contraseña** | 1. Hacer clic en el icono del ojo en el campo de contraseña. | La contraseña se muestra y se oculta alternativamente. |
| **LOGIN-012** | **Redireccionamiento a la página de recuperación de contraseña** | 1. Hacer clic en el enlace "¿Olvidaste tu contraseña?". | Se redirige a la página de recuperación de contraseña. |
