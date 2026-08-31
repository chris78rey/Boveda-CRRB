<%*
const tema = await tp.system.prompt("Tema", "");
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const fuente = await tp.system.prompt("Fuente", "");
%>---
tipo: estudio
estado: procesado
tema: "<% tema %>"
fuente: "<% fuente %>"
fecha: <% tp.date.now("YYYY-MM-DD") %>
ambito: personal
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Pregunta que responde


## Explicación con palabras propias


## Ideas principales

1. 
2. 
3. 

## Ejemplo práctico


## Aplicación

- Proyecto donde puede utilizarse:
- Problema que podría resolver:

## Dudas abiertas

- [ ] Investigar 

## Enlaces relacionados

- [[04_Conocimiento/00_Mapas/MOC - Tecnología]]
