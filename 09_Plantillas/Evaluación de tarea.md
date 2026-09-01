<%*
const estudiante = await tp.system.prompt("Estudiante", "");
const actividad = await tp.system.prompt("Actividad", "");
%>---
tipo: evaluacion
estado: revisada
ambito: docencia
estudiante: "<% estudiante %>"
actividad: "<% actividad %>"
fecha: <% tp.date.now("YYYY-MM-DD") %>
calificacion: 0
tags:
  - docencia
  - evaluacion
<% tp.user.inheritTags(tp, ["docencia", "evaluacion"]) %>
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

