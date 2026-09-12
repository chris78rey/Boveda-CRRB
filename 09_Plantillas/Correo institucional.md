<%*
const destinatario = await tp.system.prompt("Destinatario", "");
const origen = await tp.user.origen_nota(tp);
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const asunto = await tp.system.prompt("Asunto", "");
%>---
tipo: borrador-correo
estado: borrador
ambito: oficina
fecha: <% tp.date.now("YYYY-MM-DD") %>
destinatario: "<% destinatario %>"
asunto: "<% asunto %>"
tags:<% tagsYaml %>
base: "<% origen %>"
---

# <% asunto %>

**Para:** <% destinatario %>  
**Asunto:** <% asunto %>

Buen día:



Atentamente,


## Seguimiento interno

- [ ] Verificar respuesta [ambito:: oficina] ➕ <% tp.date.now("YYYY-MM-DD") %>
