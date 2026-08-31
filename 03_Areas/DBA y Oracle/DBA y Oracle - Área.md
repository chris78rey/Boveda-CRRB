---
tipo: area
estado: activo
ambito: oficina
area: dba-oracle
tags:
  - area
  - oracle
  - dba
---

# DBA y Oracle

## Sistemas y bases

```dataview
TABLE WITHOUT ID file.link AS "Sistema", version AS "Versión", ambiente AS "Ambiente", criticidad AS "Criticidad"
FROM "03_Areas/DBA y Oracle"
WHERE tipo = "sistema"
SORT criticidad DESC
```

## Incidentes

```dataview
TABLE WITHOUT ID file.link AS "Incidente", fecha AS "Fecha", severidad AS "Severidad", estado AS "Estado"
FROM "03_Areas/DBA y Oracle"
WHERE tipo = "incidente"
SORT fecha DESC
LIMIT 20
```

## Procedimientos y runbooks

```dataview
LIST
FROM "03_Areas/DBA y Oracle"
WHERE contains(list("procedimiento", "runbook"), tipo)
SORT file.name ASC
```

