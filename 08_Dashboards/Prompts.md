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

Crear un prompt desde cualquier pagina con `CRRB - Prompts` -> `Nuevo prompt`. Se guarda en `07_Recursos/Prompts` y hereda sus tags.

## Categorías

```dataview
TABLE rows.file.link AS Prompts
FROM "07_Recursos/Prompts"
WHERE tipo = "prompt"
GROUP BY categoria
SORT categoria ASC
```
