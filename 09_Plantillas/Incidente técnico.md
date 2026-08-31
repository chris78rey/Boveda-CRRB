<%*
const severidad = await tp.system.suggester(["Crítica", "Alta", "Media", "Baja"], ["critica", "alta", "media", "baja"]);
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const sistema = await tp.system.prompt("Sistema afectado", "");
%>---
tipo: incidente
estado: abierto
ambito: oficina
fecha: <% tp.date.now("YYYY-MM-DD") %>
hora_inicio: <% tp.date.now("HH:mm") %>
hora_fin: ""
severidad: <% severidad %>
sistema: "<% sistema %>"
causa: ""
tags:<% tagsYaml %>
---

# <% tp.file.title %>

> [!danger] Síntoma
> Describir qué dejó de funcionar y cómo se detectó.

## Impacto

- Servicios afectados:
- Usuarios afectados:
- Tiempo de indisponibilidad:

## Línea de tiempo

| Hora | Acción | Resultado | Responsable |
|---|---|---|---|
| <% tp.date.now("HH:mm") %> | Incidente detectado |  |  |

## Evidencias

```text
Pegar mensajes de error sin incluir contraseñas ni secretos.
```

## Diagnóstico


## Solución aplicada


## Validación

- [ ] Servicio operativo
- [ ] Usuarios confirman funcionamiento
- [ ] Monitoreo estable

## Prevención

- [ ] Crear o actualizar procedimiento [ambito:: oficina] ➕ <% tp.date.now("YYYY-MM-DD") %>
