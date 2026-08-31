<%*
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
%>---
tipo: sistema
estado: activo
ambito: oficina
version: ""
ambiente: produccion
criticidad: alta
responsable: ""
servidor: ""
dependencias: []
ultima_revision: <% tp.date.now("YYYY-MM-DD") %>
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Propósito


## Arquitectura

![[07_Recursos/Excalidraw/<% tp.file.title %> - Arquitectura.excalidraw]]

## Componentes

| Componente | Host | Versión | Función |
|---|---|---|---|
|  |  |  |  |

## Dependencias

- 

## Respaldo y recuperación

- Frecuencia:
- Ubicación:
- Última prueba de restauración:
- RTO/RPO:

## Monitoreo

- 

## Procedimientos relacionados

```dataview
LIST
FROM "03_Areas"
WHERE tipo = "procedimiento" AND sistema = this.file.name
SORT file.name ASC
```

## Seguridad

> [!warning]
> No almacenar contraseñas, tokens, claves privadas ni cadenas de conexión con credenciales.
