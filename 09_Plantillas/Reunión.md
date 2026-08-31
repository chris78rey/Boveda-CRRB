<%*
const ambito = await tp.system.suggester(["Oficina", "Externo", "Docencia", "Personal"], ["oficina", "externo", "docencia", "personal"]);
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const proyecto = await tp.system.prompt("Proyecto relacionado (sin corchetes)", "");
%>---
tipo: reunion
estado: abierta
ambito: <% ambito %>
fecha: <% tp.date.now("YYYY-MM-DD") %>
hora: <% tp.date.now("HH:mm") %>
proyecto: "[[<% proyecto %>]]"
participantes: []
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Objetivo


## Participantes

- 

## Agenda

1. 

## Notas


## Decisiones

| Decisión | Motivo | Responsable |
|---|---|---|
|  |  |  |

## Compromisos

- [ ] Registrar compromiso ⏫ [ambito:: <% ambito %>] [proyecto:: [[<% proyecto %>]]] ➕ <% tp.date.now("YYYY-MM-DD") %>

## Próxima reunión

- Fecha:
- Objetivo:
