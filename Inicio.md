---
tipo: inicio
cssclasses:
  - crrb-dashboard
tags:
  - dashboard
---

# Centro de operaciones

> [!tip] Navegación
> [[08_Dashboards/Dashboard|Dashboard general]] · [[08_Dashboards/Tareas|Tareas]] · [[08_Dashboards/Proyectos|Proyectos]] · [[08_Dashboards/Oficina|Oficina]] · [[08_Dashboards/Estudio|Estudio]]

## Acceso rápido

| Captura | Trabajo | Conocimiento |
|---|---|---|
| [[00_Inbox/Capturas|Ideas y notas rápidas]] | [[02_Proyectos/Proyectos - Índice|Proyectos]] | [[04_Conocimiento/Conocimiento - Índice|Biblioteca]] |
| [[00_Inbox/Tareas|Tareas centrales]] | [[05_Reuniones/Reuniones - Índice|Reuniones]] | [[04_Conocimiento/00_Mapas/MOC - Tecnología|Mapa tecnológico]] |
| [[00_Inbox/Acuerdos|Acuerdos rápidos]] | [[03_Areas/Oficina/Oficina - Área|Área de oficina]] | [[04_Conocimiento/00_Mapas/MOC - Docencia|Mapa de docencia]] |

## Vencidas

```tasks
not done
due before today
path does not include 09_Plantillas
path does not include 99_Archivo
sort by due
limit 12
hide backlink
```

## Para hoy

```tasks
not done
due today
path does not include 09_Plantillas
path does not include 99_Archivo
sort by priority reverse
limit 15
hide backlink
```

## Proyectos activos

```dataview
TABLE WITHOUT ID
  file.link AS "Proyecto",
  ambito AS "Ámbito",
  fecha_limite AS "Límite",
  progreso + "%" AS "Avance"
FROM "02_Proyectos"
WHERE tipo = "proyecto" AND estado = "activo"
SORT fecha_limite ASC
LIMIT 10
```

## Notas modificadas recientemente

```dataview
LIST
FROM ""
WHERE file.name != this.file.name
  AND !contains(file.path, "09_Plantillas")
  AND !contains(file.path, "99_Archivo")
SORT file.mtime DESC
LIMIT 8
```

