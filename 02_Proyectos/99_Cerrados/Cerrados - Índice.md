---
tipo: indice
estado: archivado
tags:
  - archivo
  - proyecto
---

# Proyectos cerrados

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", ambito AS "Ámbito", fecha_cierre AS "Cierre", resultado AS "Resultado"
FROM "02_Proyectos/99_Cerrados"
WHERE tipo = "proyecto"
SORT fecha_cierre DESC
```

