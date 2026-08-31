---
tipo: area
estado: activo
ambito: docencia
tags:
  - area
  - docencia
---

# Docencia

## Asignaturas y proyectos

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", asignatura AS "Asignatura", estado AS "Estado", fecha_limite AS "Límite"
FROM "02_Proyectos/03_Docencia"
WHERE tipo = "proyecto"
SORT fecha_limite ASC
```

## Material de estudio y clase

```dataview
LIST
FROM "04_Conocimiento"
WHERE ambito = "docencia"
SORT file.mtime DESC
LIMIT 20
```

