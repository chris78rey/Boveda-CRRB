---
tipo: dashboard
tags:
  - dashboard
  - prompt
---

# Biblioteca de prompts

Abrir `QuickAdd: Run` → `Biblioteca interactiva de prompts` o
`CRRB - Prompts` → `Abrir biblioteca visual`. Desde esa ventana se crean
categorías, prompts individuales y grupos, y se ejecutan con vista previa.

```dataview
TABLE categoria, proposito, favorito, modelo
FROM "07_Recursos/Prompts"
WHERE tipo = "prompt"
SORT favorito DESC, categoria ASC, file.name ASC
```

La creación recomendada es desde la biblioteca visual; el comando anterior
`CRRB - Prompts` → `Nuevo prompt` se conserva para compatibilidad con el flujo
QuickAdd tradicional.

## Grupos

```dataview
TABLE categoria, file.link AS Grupo
FROM "07_Recursos/Prompts"
WHERE tipo = "grupo"
SORT categoria ASC, file.name ASC
```

## Categorías

```dataview
TABLE rows.file.link AS Prompts
FROM "07_Recursos/Prompts"
WHERE tipo = "prompt"
GROUP BY categoria
SORT categoria ASC
```
