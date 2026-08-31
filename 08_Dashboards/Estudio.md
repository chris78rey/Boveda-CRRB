---
tipo: dashboard
cssclasses:
  - crrb-dashboard
tags:
  - dashboard
  - estudio
---

# Estudio y conocimiento

## Cursos activos

```dataview
TABLE WITHOUT ID file.link AS "Curso", tema AS "Tema", progreso + "%" AS "Avance", siguiente_sesion AS "Siguiente sesión"
FROM "04_Conocimiento/02_Cursos"
WHERE tipo = "curso" AND estado = "activo"
SORT siguiente_sesion ASC
```

## Material pendiente de procesar

```dataview
TABLE WITHOUT ID file.link AS "Material", tipo AS "Tipo", tema AS "Tema", estado AS "Estado"
FROM "04_Conocimiento"
WHERE contains(list("lectura", "video", "curso"), tipo) AND estado = "pendiente"
SORT file.ctime ASC
```

## Conceptos recientes

```dataview
LIST
FROM "04_Conocimiento/01_Conceptos"
WHERE tipo = "concepto"
SORT file.ctime DESC
LIMIT 12
```

## Videos con transcripción

```dataview
TABLE WITHOUT ID file.link AS "Video", tema AS "Tema", fuente AS "Fuente", estado AS "Estado"
FROM "04_Conocimiento/04_Videos"
WHERE tipo = "video"
SORT file.mtime DESC
LIMIT 12
```

