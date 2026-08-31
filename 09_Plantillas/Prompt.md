<%*
const categoria = await tp.system.prompt("Categoría del prompt", "Generales");
const proposito = await tp.system.prompt("Propósito", "");
%>---
tipo: prompt
categoria: "<% categoria %>"
proposito: "<% proposito %>"
favorito: false
modelo: cualquiera
tags:
  - prompt
---

# <% tp.file.title %>

## Propósito

<% proposito %>

## Prompt

Escribe aquí el prompt. Usa placeholders como `{{servidor}}`, `{{error}}` o
`{{ambiente|produccion}}`. Al copiarlo, QuickAdd solicitará sus valores.
