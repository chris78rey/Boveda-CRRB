<%*
const estudiante = await tp.system.prompt("Estudiante", "");
const actividad = await tp.system.prompt("Actividad", "");
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
%>---
tipo: evaluacion
estado: revisada
ambito: docencia
estudiante: "<% estudiante %>"
actividad: "<% actividad %>"
fecha: <% tp.date.now("YYYY-MM-DD") %>
calificacion: 0
tags:<% tagsYaml %>
---

# Evaluación — <% estudiante %>

## Verificación de entregables

| Criterio | Puntaje máximo | Puntaje obtenido | Evidencia |
|---|---:|---:|---|
|  |  |  |  |

## Fortalezas

- 

## Aspectos por mejorar

- 

## Retroalimentación para el estudiante


## Calificación final

**0/10**
