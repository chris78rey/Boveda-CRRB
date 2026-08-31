<%*
const tema = await tp.system.prompt("Tema o área", "");
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
%>---
tipo: concepto
estado: vigente
tema: "<% tema %>"
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
fuentes: []
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Definición sencilla


## Cómo funciona


## Ejemplo


## Cuándo utilizarlo


## Relación con otros conceptos

- 

## Fuente

- 
