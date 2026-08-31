<%*
const ambito = await tp.system.suggester(["Oficina", "Externo", "Docencia", "Personal"], ["oficina", "externo", "docencia", "personal"]);
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const proyecto = await tp.system.prompt("Proyecto relacionado (sin corchetes)", "");
%>---
tipo: decision
estado: abierta
ambito: <% ambito %>
fecha: <% tp.date.now("YYYY-MM-DD") %>
proyecto: "[[<% proyecto %>]]"
responsable: ""
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Contexto


## Alternativas

| Alternativa | Ventajas | Desventajas | Costo o esfuerzo |
|---|---|---|---|
|  |  |  |  |

## Decisión adoptada


## Motivo


## Consecuencias

- Positivas:
- Riesgos:
- Acciones posteriores:

- [ ] Verificar el resultado de la decisión [ambito:: <% ambito %>] [proyecto:: [[<% proyecto %>]]] ➕ <% tp.date.now("YYYY-MM-DD") %>
