---
tipo: indice
tags:
  - conocimiento
---

# Biblioteca de conocimiento

## Mapas principales

- [[04_Conocimiento/00_Mapas/MOC - Tecnología|Tecnología]]
- [[04_Conocimiento/00_Mapas/MOC - Docencia|Docencia]]

## Contenido por tipo

```dataview
TABLE WITHOUT ID file.link AS "Nota", tipo AS "Tipo", tema AS "Tema", estado AS "Estado"
FROM "04_Conocimiento"
WHERE tipo != "indice" AND tipo != "moc"
SORT file.mtime DESC
LIMIT 30
```

