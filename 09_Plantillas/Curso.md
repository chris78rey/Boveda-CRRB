<%*
const tema = await tp.system.prompt("Tema principal", "");
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
%>---
tipo: curso
estado: activo
tema: "<% tema %>"
fecha_inicio: <% tp.date.now("YYYY-MM-DD") %>
fecha_fin: ""
progreso: 0
siguiente_sesion: ""
fuente: ""
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Objetivo de aprendizaje


## Programa

| Módulo | Estado | Nota principal |
|---|---|---|
| 1 | Pendiente |  |

## Sesiones

```dataview
LIST
FROM "04_Conocimiento"
WHERE curso = this.file.link
SORT fecha ASC
```

## Próxima acción

- [ ] Continuar el curso 🔼 [ambito:: personal] [proyecto:: [[<% tp.file.title %>]]] ➕ <% tp.date.now("YYYY-MM-DD") %>

## Evidencia de dominio

- [ ] Explicar el tema sin consultar apuntes
- [ ] Resolver un ejercicio práctico
- [ ] Aplicarlo en un proyecto real
