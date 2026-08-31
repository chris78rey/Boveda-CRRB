---
tipo: area
estado: activo
ambito: personal
tags:
  - area
  - personal
---

# Área personal

## Proyectos

```dataview
LIST
FROM "02_Proyectos/04_Personales"
WHERE tipo = "proyecto" AND estado != "cerrado"
SORT fecha_limite ASC
```

## Tareas

```tasks
not done
description includes [ambito:: personal]
sort by priority reverse
sort by due
hide backlink
```

