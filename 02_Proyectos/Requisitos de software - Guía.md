---
tipo: guia
tags:
  - requisitos
  - software
---

# Requisitos de software

Los requisitos se crean desde QuickAdd → `CRRB - Requisitos` → `Nuevo requisito`.

## Jerarquía

- `epica`: objetivo grande o módulo completo.
- `requisito`: necesidad funcional o no funcional.
- `subrequisito`: detalle de un requisito.
- `criterio`: condición verificable de aceptación.

Para anidar un requisito, escribe en `parent` el enlace al requisito superior.
El campo `orden` controla la posición dentro del mismo padre o tema.

## Temas sugeridos

`Autenticación`, `Usuarios`, `Reportes`, `Integraciones`, `Rendimiento`,
`Seguridad`, `Auditoría`, `Infraestructura`.

## Estados sugeridos

`pendiente`, `analisis`, `en_progreso`, `bloqueado`, `validacion`, `terminado`.

## Relación con tareas

Incluye el ID del requisito en la descripción de una tarea, por ejemplo:

```markdown
- [ ] RF-001 Implementar validación de usuarios
```

El dashboard del requisito mostrará sus tareas relacionadas.
