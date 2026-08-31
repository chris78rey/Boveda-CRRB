<%*
const ambito = await tp.system.suggester(["Oficina", "Externo", "Docencia", "Personal"], ["oficina", "externo", "docencia", "personal"]);
const area = await tp.system.prompt("Área relacionada", "");
const limite = await tp.system.prompt("Fecha límite (AAAA-MM-DD)", "");
%>---
tipo: proyecto
estado: activo
ambito: <% ambito %>
area: "<% area %>"
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
fecha_inicio: <% tp.date.now("YYYY-MM-DD") %>
fecha_limite: <% limite %>
progreso: 0
siguiente_accion: ""
responsable: ""
cliente: ""
tags:
  - proyecto
  - <% ambito %>
---

# <% tp.file.title %>

> [!abstract] Resultado esperado
> Describir cómo se reconocerá que el proyecto quedó terminado.

## Objetivo


## Alcance

### Incluye

- 

### No incluye

- 

## Entregables

| Entregable | Responsable | Fecha | Estado |
|---|---|---|---|
|  |  |  | Pendiente |

## Próximas acciones

- [ ] Definir la siguiente acción ⏫ 📅 <% limite %> [ambito:: <% ambito %>] [proyecto:: [[<% tp.file.title %>]]] ➕ <% tp.date.now("YYYY-MM-DD") %>

## Reuniones

```dataview
LIST
FROM "05_Reuniones"
WHERE proyecto = this.file.link
SORT fecha DESC
```

## Decisiones

```dataview
LIST
FROM ""
WHERE tipo = "decision" AND proyecto = this.file.link
SORT fecha DESC
```

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|---|---|---|---|---|
|  |  |  |  |  |

## Bitácora

- <% tp.date.now("YYYY-MM-DD HH:mm") %> — Proyecto creado.

## Cierre

- Resultado:
- Lecciones aprendidas:
- Fecha de cierre:

