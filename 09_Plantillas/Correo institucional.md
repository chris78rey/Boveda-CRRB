<%*
const destinatario = await tp.system.prompt("Destinatario", "");
const asunto = await tp.system.prompt("Asunto", "");
%>---
tipo: borrador-correo
estado: borrador
ambito: oficina
fecha: <% tp.date.now("YYYY-MM-DD") %>
destinatario: "<% destinatario %>"
asunto: "<% asunto %>"
tags:
  - correo
  - oficina
---

# <% asunto %>

**Para:** <% destinatario %>  
**Asunto:** <% asunto %>

Buen día:



Atentamente,


## Seguimiento interno

- [ ] Verificar respuesta [ambito:: oficina] ➕ <% tp.date.now("YYYY-MM-DD") %>

