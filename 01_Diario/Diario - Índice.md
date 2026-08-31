---
tipo: indice
tags:
  - diario
---

# Diario

```dataview
CALENDAR file.day
FROM "01_Diario"
WHERE tipo = "diario"
```

## Entradas recientes

```dataview
LIST
FROM "01_Diario"
WHERE tipo = "diario"
SORT file.day DESC
LIMIT 14
```

