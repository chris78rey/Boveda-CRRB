---
tipo: indice
ambito: externo
tags:
  - proyecto
  - externo
---

# Proyectos externos

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", cliente AS "Cliente", estado AS "Estado", fecha_limite AS "Límite", progreso + "%" AS "Avance"
FROM "02_Proyectos/02_Externos"
WHERE tipo = "proyecto"
SORT estado ASC, fecha_limite ASC
```

