<%*
const lat = await tp.system.prompt("Latitud", "");
const lon = await tp.system.prompt("Longitud", "");
%>---
tipo: lugar
estado: vigente
location:
  - <% lat %>
  - <% lon %>
direccion: ""
categoria: ""
tags:
  - lugar
<% tp.user.inheritTags(tp, ["lugar"]) %>
---

# <% tp.file.title %>

## Descripción


## Información útil

- Dirección:
- Contacto:
- Horario:
- Enlace:

## Visitas o eventos relacionados


