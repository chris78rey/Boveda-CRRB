<%*
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const ambiente = await tp.system.suggester(["Producción", "Pruebas", "Desarrollo", "Laboratorio"], ["produccion", "pruebas", "desarrollo", "laboratorio"]);
%>---
tipo: infraestructura
subtipo: servicio
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
estado: activo
ambiente: <% ambiente %>
url: ""
puerto: ""
equipo: ""
responsable: ""
criticidad: media
dependencias: []
tags:<% tagsYaml %>
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
