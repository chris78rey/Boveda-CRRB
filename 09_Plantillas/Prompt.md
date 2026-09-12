<%*
const origen = await tp.user.origen_nota(tp);
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? inheritedTags.map((tag) => `  - ${tag}`).join("\n") : "  - prompt";
const folderParts = tp.file.folder(true).split("/");
const categoria = folderParts[folderParts.length - 1] || "general";
%>---
tipo: prompt
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
categoria: "<% categoria %>"
favorito: false
modelo: cualquiera
tags:
<% tagsYaml %>
base: "<% origen %>"
---

# <% tp.file.title %>

## Prompt

Escribe aquí las instrucciones desde el editor visual de QuickAdd. Usa
placeholders como `{{TEMA}}`, `{{CONTEXTO}}` o `{{OBJETIVO}}`; la biblioteca los
detectará automáticamente al ejecutar el prompt.
