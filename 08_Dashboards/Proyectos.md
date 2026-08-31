---
tipo: dashboard
cssclasses:
  - crrb-dashboard
tags:
  - dashboard
  - proyecto
---

# Portafolio de proyectos

## Activos

```dataview
TABLE WITHOUT ID
  file.link AS "Proyecto",
  ambito AS "Ámbito",
  area AS "Área",
  fecha_limite AS "Límite",
  progreso + "%" AS "Avance"
FROM "02_Proyectos"
WHERE tipo = "proyecto" AND estado = "activo"
SORT fecha_limite ASC
```

## En espera o pausados

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", estado AS "Estado", siguiente_accion AS "Siguiente acción"
FROM "02_Proyectos"
WHERE tipo = "proyecto" AND contains(["espera", "pausado"], estado)
SORT file.mtime DESC
```

## Tareas agrupadas por proyecto

```tasks
not done
path includes 02_Proyectos
path does not include 09_Plantillas
group by filename
sort by priority reverse
sort by due
hide backlink
```

## Sin actualización durante treinta días

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", file.mtime AS "Última modificación", estado AS "Estado"
FROM "02_Proyectos"
WHERE tipo = "proyecto" AND estado = "activo" AND file.mtime <= date(today) - dur(30 days)
SORT file.mtime ASC
```
