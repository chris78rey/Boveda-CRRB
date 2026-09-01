<%*
const asignatura = await tp.system.prompt("Asignatura", "");
const tema = await tp.system.prompt("Tema de la clase", "");
%>---
tipo: clase
estado: planificada
ambito: docencia
asignatura: "<% asignatura %>"
tema: "<% tema %>"
fecha: <% tp.date.now("YYYY-MM-DD") %>
duracion_minutos: 120
tags:
  - docencia
  - clase
<% tp.user.inheritTags(tp, ["docencia", "clase"]) %>
---

# <% tp.file.title %>

## Resultado de aprendizaje


## Conocimientos previos


## Secuencia

| Minutos | Actividad | Recurso | Evidencia |
|---:|---|---|---|
| 10 | Activación |  | Participación |
| 35 | Explicación |  | Preguntas |
| 55 | Práctica |  | Ejercicio |
| 20 | Cierre |  | Reflexión |

## Ejemplo o demostración


## Actividad práctica


## Evaluación rápida

1. 
2. 
3. 

## Materiales

- 

