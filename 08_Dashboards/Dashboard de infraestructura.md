---
tipo: dashboard
area: infraestructura
tags:
  - dashboard
  - infraestructura
---

# Dashboard de infraestructura

## Activos

```dataview
TABLE subtipo, ambiente, estado, ip, responsable, criticidad
FROM "03_Areas/Infraestructura"
WHERE tipo = "infraestructura" AND subtipo != "servicio"
SORT criticidad DESC, file.name ASC
```

## Máquinas virtuales

```dataview
TABLE host_fisico, ambiente, estado, ip, sistema_operativo
FROM "03_Areas/Infraestructura/Maquinas virtuales"
WHERE subtipo = "maquina_virtual"
SORT file.name ASC
```

## Credenciales registradas

```dataview
TABLE equipo, servicio, usuario, referencia_segura, proxima_rotacion
FROM "03_Areas/Infraestructura/Credenciales"
WHERE tipo = "credencial"
SORT proxima_rotacion ASC
```

## Credenciales por rotar

```dataview
TABLE equipo, servicio, responsable, proxima_rotacion
FROM "03_Areas/Infraestructura/Credenciales"
WHERE tipo = "credencial" AND proxima_rotacion != ""
  AND date(proxima_rotacion) <= date(today) + dur(30 days)
SORT proxima_rotacion ASC
```

## Servicios

```dataview
TABLE ambiente, estado, url, equipo, criticidad
FROM "03_Areas/Infraestructura/Servicios"
WHERE subtipo = "servicio"
SORT criticidad DESC, file.name ASC
```
