---
tipo: indice
ambito: personal
tags:
  - proyecto
  - personal
---

# Proyectos personales

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", area AS "Área", estado AS "Estado", fecha_limite AS "Límite", progreso + "%" AS "Avance"
FROM "02_Proyectos/04_Personales"
WHERE tipo = "proyecto"
SORT fecha_limite ASC
```

