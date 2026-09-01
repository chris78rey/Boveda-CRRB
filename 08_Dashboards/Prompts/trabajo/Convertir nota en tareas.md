---
tipo: prompt
estado: probado
categoria: trabajo
favorito: true
tags:
  - prompt
  - trabajo
---

# Convertir nota en tareas

## Prompt

Actúa como un asistente de gestión de proyectos.

Convierte el siguiente contenido en tareas accionables.

Objetivo: {{objetivo}}

Contexto: {{contexto}}

Contenido de la nota:
{{nota}}

Para cada tarea devuelve:
- [ ] descripción concreta
  - prioridad: alta, media o baja
  - siguiente paso: una acción que pueda empezar hoy
  - fecha límite: {{fecha_limite}}

No inventes información. Si falta un dato, escribe "por definir".

## Variables

- `{{objetivo}}`: qué quiero conseguir.
- `{{contexto}}`: información adicional.
- `{{nota}}`: texto de la nota que se analizará.
- `{{fecha_limite}}`: fecha límite opcional.

## Ejemplo rápido

Objetivo: preparar el informe mensual.
Contexto: debe estar listo para la reunión del viernes.
Fecha límite: 2026-09-04.

Luego reemplaza cada valor entre `{{doble_llave}}` antes de pegar el prompt.

