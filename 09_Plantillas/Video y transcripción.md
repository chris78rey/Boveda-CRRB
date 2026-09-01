<%*
const url = await tp.system.prompt("URL del video", "");
const tema = await tp.system.prompt("Tema", "");
%>---
tipo: video
estado: pendiente
tema: "<% tema %>"
fuente: "<% url %>"
fecha_captura: <% tp.date.now("YYYY-MM-DD") %>
autor: ""
tags:
  - video
  - estudio
<% tp.user.inheritTags(tp, ["video", "estudio"]) %>
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

