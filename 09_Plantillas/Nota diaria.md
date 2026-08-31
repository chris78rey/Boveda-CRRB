<%*
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
%>---
tipo: diario
fecha: <% tp.date.now("YYYY-MM-DD") %>
semana: <% tp.date.now("YYYY-[W]WW") %>
tags:<% tagsYaml %>
---

# <% tp.date.now("dddd, D [de] MMMM [de] YYYY") %>

## Tres prioridades

1. 
2. 
3. 

## Agenda y compromisos

- [ ] 

## Registro

- <% tp.date.now("HH:mm") %> — 

## Notas e ideas


## Cierre del día

- Avance más importante:
- Pendiente que debe continuar:
- Aprendizaje:

## Tareas completadas hoy

```tasks
done today
sort by done reverse
hide backlink
```
