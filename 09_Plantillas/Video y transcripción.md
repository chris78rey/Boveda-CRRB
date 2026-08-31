<%*
const url = await tp.system.prompt("URL del video", "");
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const tema = await tp.system.prompt("Tema", "");
%>---
tipo: video
estado: pendiente
tema: "<% tema %>"
fuente: "<% url %>"
fecha_captura: <% tp.date.now("YYYY-MM-DD") %>
autor: ""
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Video

<% url %>

## Transcripción

> [!tip] YTranscript
> Ejecutar el comando de YTranscript sobre esta nota y guardar aquí la transcripción obtenida.


## Síntesis


## Ideas aplicables

- 

## Marcas de tiempo

| Tiempo | Tema | Nota |
|---|---|---|
| 00:00 |  |  |
