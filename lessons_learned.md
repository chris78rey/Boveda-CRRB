# Lecciones y crítica de uso diario

## Crítica de un usuario diario — 2026-08-31

### Evaluación general

La bóveda tiene una base potente: captura de tareas, notas, proyectos y prompts desde QuickAdd, herencia de tags, enlaces a páginas base y un Prompt Hub. El riesgo principal no es la falta de funciones, sino que el usuario tenga que recordar demasiados nombres, rutas y reglas para que el sistema funcione.

### Lo que un crítico señalaría

1. **Descubribilidad:** las macros existen, pero no necesariamente están visibles donde el usuario trabaja. Un sistema diario debe ofrecer un punto de entrada claro, con nombres consistentes y pocas decisiones.
2. **Confiabilidad silenciosa:** si una ruta cambia, falta una carpeta o el contexto no es una nota Markdown válida, el flujo puede fallar o crear contenido incompleto. Cada macro debería validar precondiciones y mostrar un resultado verificable.
3. **Herencia ambigua:** “página base” puede significar nota activa, enlace `based_on`, carpeta padre o proyecto. La regla debe estar documentada y el resultado debe mostrar qué tags heredó y de dónde.
4. **Demasiada fricción al capturar:** pedir varios datos antes de guardar una tarea o nota puede hacer que el usuario abandone el flujo. Conviene capturar primero y enriquecer después.
5. **Mantenimiento frágil:** las rutas están escritas dentro de scripts y configuración de QuickAdd. Si se reorganizan carpetas, varios flujos pueden romperse a la vez.
6. **Falta de ciclo de revisión:** crear elementos es fácil, pero revisar pendientes, prompts sin uso, proyectos estancados y notas huérfanas debería ser igual de sencillo.

### Prioridad de mejoras futuras

1. Crear un panel o comando “CRRB — Inicio” con las acciones principales y enlaces de retorno.
2. Añadir validación, mensajes de éxito/error y registro mínimo de cada macro.
3. Centralizar rutas y reglas de herencia en una configuración única.
4. Añadir dashboards de revisión: tareas vencidas, notas sin tags, proyectos sin próxima acción y prompts más usados.
5. Probar los flujos con casos reales: nota sin tags, varios tags, padre enlazado, carpeta inexistente y nombre duplicado.

### Regla de prevención

Toda automatización nueva debe responder tres preguntas: ¿cómo la descubre el usuario?, ¿cómo sabe que terminó bien? y ¿qué ocurre si falta contexto o cambia una ruta? Si no puede responderlas, todavía no está lista para uso diario.

### Naturaleza del registro

Las observaciones sobre la experiencia de uso son una evaluación crítica **INFERRED**, no relaciones extraídas por AST. Las rutas y nombres de funcionalidades deben verificarse contra el código antes de convertirlos en requisitos.
# Mejora de automatizaciones 2026-08-31

- Problema: los creadores de tareas, proyectos y prompts podían usar rutas distintas y solo heredaban tags del frontmatter.
- Causa: cada script tenía su propia lógica y no consideraba tags inline de Obsidian.
- Regla: centralizar rutas y extraer tags desde `frontmatter` y `metadataCache.tags`; toda nota creada debe guardar `base` y un enlace de retorno.
