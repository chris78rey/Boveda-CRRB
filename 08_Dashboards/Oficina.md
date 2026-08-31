---
tipo: dashboard
cssclasses:
  - crrb-dashboard
ambito: oficina
tags:
  - dashboard
  - oficina
---

# Oficina

## Tareas pendientes

```tasks
not done
description includes [ambito:: oficina]
path does not include 09_Plantillas
sort by priority reverse
sort by due
hide backlink
```

## Proyectos de oficina

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", estado AS "Estado", fecha_limite AS "Límite", progreso + "%" AS "Avance"
FROM "02_Proyectos"
WHERE tipo = "proyecto" AND ambito = "oficina" AND estado != "cerrado"
SORT fecha_limite ASC
```

## Incidentes abiertos

```dataview
TABLE WITHOUT ID file.link AS "Incidente", severidad AS "Severidad", sistema AS "Sistema", fecha AS "Fecha"
FROM ""
WHERE tipo = "incidente" AND estado != "cerrado"
SORT fecha DESC
```

## Procedimientos actualizados recientemente

```dataview
LIST
FROM "03_Areas"
WHERE tipo = "procedimiento"
SORT file.mtime DESC
LIMIT 10
```

