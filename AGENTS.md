# Instrucciones permanentes del repositorio

Estas reglas aplican en cada sesión, aunque hayan pasado meses desde el último cambio.

## Antes de modificar

Ejecutar siempre, en este orden:

```bash
git status
git diff
git log -n 5 --oneline
```

Revisar cambios locales, conflictos, rama y archivos sensibles. No descartar ni incluir cambios ajenos.

## Graphify

- Para preguntas amplias sobre el vault, consultar primero `graphify query "..."`.
- Para dependencias, usar `graphify path "Origen" "Destino"`.
- Para componentes concretos, usar `graphify explain "Concepto"`.
- Después de cambios de código, ejecutar `graphify update .` y verificar `graphify-out/graph.json` y `graphify-out/GRAPH_REPORT.md`.
- Distinguir siempre relaciones `EXTRACTED`, `INFERRED` y `AMBIGUOUS`; no inventar conexiones.

## Cambios y verificación

- Usar `apply_patch` para editar archivos.
- Validar sintaxis de JavaScript y JSON afectados.
- Revisar el diff antes de hacer commit.
- Confirmar el resultado real, no solo que un comando haya iniciado.
- Mantener un checkpoint temporal `.task_scratch` solo durante tareas complejas o interrumpibles, y eliminarlo al cerrar la tarea.

## QuickAdd y Obsidian

- Preservar la separación entre índices y notas individuales.
- Verificar rutas reales antes de modificar automatizaciones.
- Las tareas se ordenan por `[orden :: N]` descendente.
- Las notas nuevas deben conservar etiquetas heredadas y `base` cuando exista contexto.
- Mostrar mensajes de éxito o error claros para el usuario.

## Memoria y lecciones

- Consultar `lessons_learned.md` antes de cambios no triviales.
- Registrar allí errores repetibles, causa raíz y regla de prevención.
- No afirmar éxito si falta una verificación funcional o visual.

## Git

- Publicar solo archivos relacionados con la tarea.
- Nunca usar `git reset --hard`, `git checkout --` ni force push sin autorización explícita.
- Antes de publicar, revisar `git diff --staged`.
- Tras publicar, ejecutar `git status --short --branch` y reportar cualquier residuo local.
