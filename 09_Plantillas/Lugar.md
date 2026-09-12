<%*
const lat = await tp.system.prompt("Latitud", "");
const lon = await tp.system.prompt("Longitud", "");
const origen = await tp.user.origen_nota(tp);
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
%>---
tipo: lugar
estado: vigente
location:
  - <% lat %>
  - <% lon %>
direccion: ""
categoria: ""
tags:<% tagsYaml %>
base: "<% origen %>"
---

# <% tp.file.title %>

## Descripción


## Información útil

- Dirección:
- Contacto:
- Horario:
- Enlace:

## Visitas o eventos relacionados
