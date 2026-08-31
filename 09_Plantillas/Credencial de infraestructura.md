<%*
const servicio = await tp.system.prompt("Servicio o consola", "SSH");
const equipo = await tp.system.prompt("Equipo relacionado (nombre exacto de la nota)", "");
const referencia = await tp.system.prompt("Referencia en KeePassXC/Bitwarden", "");
%>---
tipo: credencial
estado: activa
equipo: "[[<% equipo %>]]"
servicio: "<% servicio %>"
usuario: ""
referencia_segura: "<% referencia %>"
rotacion_dias: 90
ultima_rotacion: ""
proxima_rotacion: ""
responsable: ""
tags:
  - infraestructura
  - credencial
---

# <% tp.file.title %>

> [!warning]
> Esta nota no contiene la contraseña. La clave está en la referencia segura indicada arriba.

## Datos operativos

- Servicio: <% servicio %>
- Usuario:
- Equipo: [[<% equipo %>]]
- Referencia segura: `<% referencia %>`
- Próxima rotación:

## Historial

| Fecha | Acción | Responsable |
|---|---|---|
|  |  |  |
