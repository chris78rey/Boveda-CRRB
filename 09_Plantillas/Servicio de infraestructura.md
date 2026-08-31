<%*
const ambiente = await tp.system.suggester(["Producción", "Pruebas", "Desarrollo", "Laboratorio"], ["produccion", "pruebas", "desarrollo", "laboratorio"]);
%>---
tipo: infraestructura
subtipo: servicio
estado: activo
ambiente: <% ambiente %>
url: ""
puerto: ""
equipo: ""
responsable: ""
criticidad: media
dependencias: []
tags:
  - infraestructura
  - servicio
---

# <% tp.file.title %>

## Propósito


## Acceso y operación

- URL:
- Puerto:
- Monitoreo:
- Procedimiento de arranque/parada:

## Dependencias

- Equipo o VM:
- Base de datos:
- Red:
- Certificado:

## Credenciales

```dataview
TABLE equipo, usuario, referencia_segura, estado
FROM "03_Areas/Infraestructura/Credenciales"
WHERE servicio = this.file.name
```
