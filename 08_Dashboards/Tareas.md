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
> due before today
> path does not include 09_Plantillas
> path does not include 99_Archivo
> sort by due
> hide backlink
> ```

> [!warning] Prioridad máxima
> ```tasks
> not done
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
WHERE !completed
SORT orden ASC
```

## Completadas recientemente

```tasks
done
path does not include 09_Plantillas
path does not include 99_Archivo
sort by done reverse
limit 30
hide backlink
```

