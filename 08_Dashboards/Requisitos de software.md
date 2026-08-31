---
tipo: dashboard
tags:
  - dashboard
  - requisitos
---

# Requisitos de software

## Todos los requisitos

```dataview
TABLE id, nivel, tema, proyecto, estado, prioridad, orden
FROM "02_Proyectos"
WHERE tipo = "requisito"
SORT proyecto ASC, tema ASC, orden ASC
```

## Agrupados por tema

```dataview
TABLE rows.id AS IDs, rows.file.link AS Requisitos
FROM "02_Proyectos"
WHERE tipo = "requisito"
GROUP BY tema
SORT tema ASC
```

## Pendientes prioritarios

```dataview
TABLE id, tema, proyecto, responsable, fecha_objetivo
FROM "02_Proyectos"
WHERE tipo = "requisito" AND estado != "terminado"
SORT prioridad DESC, fecha_objetivo ASC, orden ASC
```

## Requisitos raíz

```dataview
TABLE id, tema, estado, prioridad, orden
FROM "02_Proyectos"
WHERE tipo = "requisito" AND (parent = "" OR !parent)
SORT proyecto ASC, tema ASC, orden ASC
```

## Estados

```dataview
TABLE rows.file.link AS Requisitos
FROM "02_Proyectos"
WHERE tipo = "requisito"
GROUP BY estado
SORT estado ASC
```
