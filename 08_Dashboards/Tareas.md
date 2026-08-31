---
tipo: dashboard
cssclasses:
  - crrb-dashboard
tags:
  - dashboard
  - tareas
---

# Gestión de tareas

> [!danger] Vencidas
> ```tasks
> not done
> description does not include #archivada
> due before today
> path does not include 09_Plantillas
> path does not include 99_Archivo
> sort by due
> hide backlink
> ```

> [!warning] Prioridad máxima
> ```tasks
> not done
> description does not include #archivada
> priority is highest
> path does not include 09_Plantillas
> path does not include 99_Archivo
> sort by due
> limit 20
> hide backlink
> ```

> [!info] Prioridad alta
> ```tasks
> not done
> description does not include #archivada
> priority is high
> path does not include 09_Plantillas
> path does not include 99_Archivo
> sort by due
> limit 25
> hide backlink
> ```

## Sin fecha límite

```tasks
not done
description does not include #archivada
has no due date
path does not include 09_Plantillas
path does not include 99_Archivo
sort by priority reverse
limit 30
hide backlink
```

## Backlog según orden personal

```dataview
TASK
FROM "00_Inbox/Tareas.md"
WHERE !completed AND !contains(text, "#archivada")
SORT orden ASC
```

## Completadas recientemente

```tasks
done
description does not include #archivada
path does not include 09_Plantillas
path does not include 99_Archivo
sort by done reverse
limit 30
hide backlink
```
