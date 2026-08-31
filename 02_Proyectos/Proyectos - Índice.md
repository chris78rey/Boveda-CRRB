---
tipo: indice
tags:
  - proyecto
---

# Proyectos

| Ámbito | Carpeta |
|---|---|
| Oficina | [[02_Proyectos/01_Oficina/Oficina - Proyectos|Proyectos de oficina]] |
| Externo | [[02_Proyectos/02_Externos/Externos - Proyectos|Proyectos externos]] |
| Docencia | [[02_Proyectos/03_Docencia/Docencia - Proyectos|Proyectos de docencia]] |
| Personal | [[02_Proyectos/04_Personales/Personales - Proyectos|Proyectos personales]] |

## Todos los proyectos abiertos

```dataview
TABLE WITHOUT ID file.link AS "Proyecto", ambito AS "Ámbito", estado AS "Estado", fecha_limite AS "Límite", progreso + "%" AS "Avance"
FROM "02_Proyectos"
WHERE tipo = "proyecto" AND estado != "cerrado" AND estado != "archivado"
SORT ambito ASC, fecha_limite ASC
```

## Flujo visual

[[02_Proyectos/Tablero de proyectos|Abrir tablero Kanban]]

