---
tipo: indice
tags:
  - reunion
---

# Reuniones

```dataview
TABLE WITHOUT ID file.link AS "Reunión", fecha AS "Fecha", ambito AS "Ámbito", proyecto AS "Proyecto", estado AS "Estado"
FROM "05_Reuniones"
WHERE tipo = "reunion"
SORT fecha DESC
```

## Compromisos abiertos nacidos en reuniones

```tasks
not done
path includes 05_Reuniones
sort by due
group by filename
hide backlink
```

