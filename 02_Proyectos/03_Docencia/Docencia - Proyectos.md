---
tipo: indice
ambito: docencia
tags:
  - proyecto
  - docencia
---

# Proyectos de docencia

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", asignatura AS "Asignatura", estado AS "Estado", fecha_limite AS "Límite"
FROM "02_Proyectos/03_Docencia"
WHERE tipo = "proyecto"
SORT fecha_limite ASC
```

