---
tipo: area
estado: activo
ambito: oficina
tags:
  - area
  - oficina
---

# Área de oficina

## Responsabilidades continuas

- Operación tecnológica.
- Seguimiento de proyectos institucionales.
- Gestión documental, reuniones y compromisos.

## Proyectos relacionados

```dataview
LIST
FROM "02_Proyectos"
WHERE tipo = "proyecto" AND ambito = "oficina" AND estado != "cerrado"
SORT fecha_limite ASC
```

## Próximas tareas

```tasks
not done
description includes [ambito:: oficina]
sort by priority reverse
sort by due
hide backlink
```

