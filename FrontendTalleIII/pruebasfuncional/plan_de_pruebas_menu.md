
# Plan de Pruebas de Caja Blanca para el Componente Menu

## 1. Introducción

Este documento detalla el plan de pruebas de caja blanca para el componente `MenuComponent.vue` del proyecto. El objetivo de estas pruebas es verificar la correcta implementación de la lógica de navegación, la visualización de elementos del menú según los roles de usuario y el comportamiento responsivo de la barra lateral.

## 2. Alcance

Las pruebas se centrarán en los siguientes aspectos del componente `MenuComponent.vue`:

*   **Navegación:**
    *   Redireccionamiento a las rutas correctas al hacer clic en los elementos del menú.
    *   Resaltado del elemento de menú activo.
    *   Expansión y contracción de los submenús.
*   **Visualización basada en roles:**
    *   Mostrar y ocultar elementos del menú según los permisos del rol del usuario.
*   **Comportamiento responsivo:**
    *   Apertura y cierre de la barra lateral en diferentes tamaños de pantalla.
    *   Comportamiento de la barra lateral al pasar el mouse sobre ella.
*   **Funcionalidades adicionales:**
    *   Cierre de sesión.
    *   Visualización de la información del usuario.

## 3. Estrategia de Pruebas

Se utilizará un enfoque de pruebas de caja blanca para examinar el código fuente del componente y diseñar casos de prueba que cubran las diferentes rutas de ejecución y condiciones lógicas.

### 3.1. Técnicas de Prueba

*   **Cobertura de sentencias:** Asegurar que cada línea de código sea ejecutada al menos una vez.
*   **Cobertura de decisiones:** Asegurar que cada posible resultado de una decisión (if, switch, etc.) sea probado.
*   **Pruebas de rutas de ejecución:** Probar las diferentes rutas que un usuario puede tomar a través del componente.
*   **Pruebas con diferentes roles de usuario:** Simular el inicio de sesión con diferentes roles para verificar la correcta visualización del menú.

## 4. Casos de Prueba

| ID | Descripción | Pasos a seguir | Resultado esperado |
| :-- | :--- | :--- | :--- |
| **MENU-001** | **Navegación a una ruta principal** | 1. Hacer clic en un elemento del menú principal sin submenú (ej. "Dashboard"). | Se redirige a la ruta correspondiente y el elemento del menú se resalta como activo. |
| **MENU-002** | **Expansión y contracción de un submenú** | 1. Hacer clic en un elemento del menú principal con submenú (ej. "Usuario").<br>2. Volver a hacer clic en el mismo elemento. | El submenú se muestra y se oculta alternativamente. |
| **MENU-003** | **Navegación a una ruta de submenú** | 1. Expandir un submenú.<br>2. Hacer clic en un elemento del submenú (ej. "Gestión Perfil"). | Se redirige a la ruta correspondiente y el elemento del submenú se resalta como activo. |
| **MENU-004** | **Visualización del menú para un rol de administrador** | 1. Iniciar sesión como administrador. | Se muestran todos los elementos del menú. |
| **MENU-005** | **Visualización del menú para un rol limitado** | 1. Iniciar sesión con un rol que tenga permisos limitados. | Solo se muestran los elementos del menú a los que el rol tiene acceso. |
| **MENU-006** | **Apertura y cierre de la barra lateral en escritorio** | 1. En una pantalla de escritorio, mover el mouse sobre la barra lateral.<br>2. Mover el mouse fuera de la barra lateral. | La barra lateral se expande y se contrae. |
| **MENU-007** | **Apertura y cierre de la barra lateral en móvil** | 1. En una pantalla de móvil, hacer clic en el botón de menú.<br>2. Hacer clic fuera de la barra lateral. | La barra lateral se abre y se cierra. |
| **MENU-008** | **Cierre de sesión** | 1. Hacer clic en el botón de cerrar sesión. | Se cierra la sesión del usuario y se redirige a la página de login. |
| **MENU-009** | **Visualización de la información del usuario** | 1. Expandir la barra lateral. | Se muestra el nombre del rol y el correo electrónico del usuario. |
