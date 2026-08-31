<%*
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const servicio = await tp.system.prompt("Servicio o consola", "SSH");
const equipo = await tp.system.prompt("Equipo relacionado (nombre exacto de la nota)", "");
const referencia = await tp.system.prompt("Referencia en KeePassXC/Bitwarden", "");
%>---
tipo: credencial
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
estado: activa
equipo: "[[<% equipo %>]]"
servicio: "<% servicio %>"
usuario: ""
referencia_segura: "<% referencia %>"
rotacion_dias: 90
ultima_rotacion: ""
proxima_rotacion: ""
responsable: ""
tags:<% tagsYaml %>
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
