---
tipo: indice
ambito: oficina
tags:
  - proyecto
  - oficina
---

# Proyectos de oficina

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", estado AS "Estado", fecha_limite AS "Límite", progreso + "%" AS "Avance"
FROM "02_Proyectos/01_Oficina"
WHERE tipo = "proyecto"
SORT estado ASC, fecha_limite ASC
```

