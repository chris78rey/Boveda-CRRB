<%*
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const id = await tp.system.prompt("ID del requisito", "RF-001");
const nivel = await tp.system.suggester(["Épica", "Requisito", "Subrequisito", "Criterio de aceptación"], ["epica", "requisito", "subrequisito", "criterio"]);
const tema = await tp.system.prompt("Tema", "");
const parent = await tp.system.prompt("Requisito padre (dejar vacío si es raíz)", "");
const orden = await tp.system.prompt("Orden dentro del padre o tema", "1");
const proyecto = await tp.system.prompt("Proyecto (nombre exacto de la carpeta)", "");
%>---
tipo: requisito
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
id: "<% id %>"
nivel: <% nivel %>
tema: "<% tema %>"
parent: "<% parent %>"
orden: <% orden %>
estado: pendiente
prioridad: media
proyecto: "[[<% proyecto %>]]"
responsable: ""
fecha_objetivo: ""
tags:<% tagsYaml %>
---

# <% id %> — <% tp.file.title %>

## Descripción

Describe aquí el comportamiento o necesidad que debe cubrir el sistema.

## Criterios de aceptación

- [ ] El resultado esperado está definido.
- [ ] Los casos límite están documentados.
- [ ] El requisito fue validado por el responsable.

## Requisitos hijos

```dataview
TABLE id, nivel, tema, estado, prioridad, orden
FROM "02_Proyectos"
WHERE tipo = "requisito" AND parent = this.file.link
SORT orden ASC
```

## Tareas relacionadas

```tasks
not done
path includes 00_Inbox
description includes <% id %>
```

## Pruebas

- Caso de prueba:
- Resultado:
- Evidencia:
- Estado: pendiente

## Despliegue

- Versión:
- Ambiente:
- Fecha:
- Responsable:
- Evidencia:

## Notas y decisiones

- 
