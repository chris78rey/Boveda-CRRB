---
tipo: dashboard
cssclasses:
  - crrb-dashboard
tags:
  - dashboard
---

# Dashboard general

> [!tip] Menú
> [[Inicio]] · [[08_Dashboards/Tareas|Tareas]] · [[08_Dashboards/Proyectos|Proyectos]] · [[08_Dashboards/Oficina|Oficina]] · [[08_Dashboards/Estudio|Estudio]]

## En foco

```tasks
not done
description does not include #archivada
priority is highest
path does not include 09_Plantillas
path does not include 99_Archivo
sort by due
limit 15
hide backlink
```

## Compromisos de los próximos siete días

```tasks
not done
description does not include #archivada
due after yesterday
due before in 8 days
path does not include 09_Plantillas
path does not include 99_Archivo
sort by due
limit 20
hide backlink
```

## Mantenimientos pendientes

```dataview
TASK
FROM ""
WHERE orden = 100 AND !completed AND !contains(text, "#archivada")
SORT file.name ASC
```

## Reuniones recientes

```dataview
TABLE WITHOUT ID file.link AS "Reunión", fecha AS "Fecha", proyecto AS "Proyecto"
FROM "05_Reuniones"
WHERE tipo = "reunion"
SORT fecha DESC
LIMIT 8
```

## Decisiones abiertas

```dataview
TABLE WITHOUT ID file.link AS "Decisión", proyecto AS "Proyecto", estado AS "Estado"
FROM ""
WHERE tipo = "decision" AND estado != "cerrada"
SORT file.mtime DESC
LIMIT 8
```
