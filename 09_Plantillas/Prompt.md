<%*
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const categoria = await tp.system.prompt("Categoría del prompt", "Generales");
const proposito = await tp.system.prompt("Propósito", "");
%>---
tipo: prompt
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
categoria: "<% categoria %>"
proposito: "<% proposito %>"
favorito: false
modelo: cualquiera
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Propósito

<% proposito %>

## Prompt

Escribe aquí el prompt. Usa placeholders como `{{servidor}}`, `{{error}}` o
`{{ambiente|produccion}}`. Al copiarlo, QuickAdd solicitará sus valores.
