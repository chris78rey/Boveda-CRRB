---
tipo: persona
estado: activo
organizacion: ""
cargo: ""
relacion: ""
correo: ""
telefono: ""
ultimo_contacto: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - persona
<% tp.user.inheritTags(tp, ["persona"]) %>
---

# <% tp.file.title %>

## Contexto


## Temas relacionados

- 

## Reuniones

```dataview
LIST
FROM "05_Reuniones"
WHERE contains(participantes, this.file.link)
SORT fecha DESC
```

## Compromisos

- [ ] 

