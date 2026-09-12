<%*
const origen = await tp.user.origen_nota(tp);
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
%>---
tipo: persona
estado: activo
organizacion: ""
cargo: ""
relacion: ""
correo: ""
telefono: ""
ultimo_contacto: <% tp.date.now("YYYY-MM-DD") %>
tags:<% tagsYaml %>
base: "<% origen %>"
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
