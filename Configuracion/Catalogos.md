---
tipo: configuracion
tags:
  - sistema/obsidian
  - catalogo
---

# Catálogos de la bóveda

Usar estos valores exactamente en las propiedades YAML y en los dashboards.

## Estados

`pendiente` · `analisis` · `en_progreso` · `bloqueado` · `validacion` · `terminado` · `retirado`

## Prioridades

`critica` · `alta` · `media` · `baja`

## Ambientes

`produccion` · `pruebas` · `desarrollo` · `laboratorio`

## Criticidad

`critica` · `alta` · `media` · `baja`

## Niveles de requisito

`epica` · `requisito` · `subrequisito` · `criterio`

## Regla

No crear variantes como `En progreso`, `Alta prioridad` o `Producción`; usar los
valores en minúsculas definidos arriba para que Dataview agrupe correctamente.
