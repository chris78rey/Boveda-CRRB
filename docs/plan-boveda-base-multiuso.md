# Plan: bóveda base reutilizable

## Idea

Convertir esta bóveda en una plantilla base para usarla en varias bóvedas de Obsidian. La funcionalidad común se mantiene centralizada y cada bóveda conserva sus propios prompts, tareas, notas y personalizaciones.

## Objetivo

Permitir crear una nueva bóveda configurando solamente un perfil: carpetas, categorías, colores, dashboards y preferencias. Los scripts de QuickAdd deben funcionar sin rutas rígidas ni cambios manuales.

## Separación propuesta

- **Núcleo común:** biblioteca visual, importación Harpa/OpenRouter, placeholders, edición, eliminación segura, tareas y scripts.
- **Perfil de bóveda:** nombre, rutas, categorías, tema visual, dashboards y opciones activadas.
- **Datos propios:** prompts, tareas y notas de cada bóveda.
- **Secretos externos:** API keys fuera de la bóveda, en la configuración local del usuario.

## Fases de trabajo

1. Inventariar scripts, plantillas, comandos QuickAdd y rutas fijas actuales.
2. Definir el formato del perfil de cada bóveda.
3. Reemplazar rutas rígidas por configuración centralizada.
4. Separar núcleo, plantillas y datos personales.
5. Crear un instalador o copiador para nuevas bóvedas.
6. Probar la instalación en una bóveda limpia.
7. Documentar el uso y publicar la plantilla base.

## Regla de seguridad

Nunca mezclar prompts, notas, tareas ni respaldos personales de una bóveda con otra. Las personalizaciones deben vivir en el perfil y los datos deben permanecer locales a cada bóveda.

## Estado

Planificado. Todavía no iniciar la separación del código.

## Siguiente paso

Inventariar las rutas y configuraciones actuales de `scripts/`, `.obsidian/plugins/quickadd/`, `09_Plantillas/` y `Configuracion/`.
