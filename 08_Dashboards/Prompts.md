---
tipo: dashboard
tags:
  - dashboard
  - prompt
---

# Biblioteca de prompts

Ejecutar `QuickAdd: Run` → `CRRB - Prompts` → `Copiar prompt`.

```dataview
TABLE categoria, proposito, favorito, modelo
FROM "07_Recursos/Prompts"
WHERE tipo = "prompt"
SORT favorito DESC, categoria ASC, file.name ASC
```

## Categorías

```dataview
TABLE rows.file.link AS Prompts
FROM "07_Recursos/Prompts"
WHERE tipo = "prompt"
GROUP BY categoria
SORT categoria ASC
```
